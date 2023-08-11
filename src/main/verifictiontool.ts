import axios, { AxiosInstance } from "axios"
import { baseURL } from "../constants"
import { ElectionData, SecondDeviceFinalMessage, SecondDeviceLoginResponse } from "../classes/communication"
import { Proof, SecretProof } from "../classes/ballot"
import { generateRandomProof, generateSecretProof } from "../algorithms/proof"
import { ErrorType } from "./error"
import { checkSecondDeviceParameters, checkZKP, decryptBallot, decrytQRCode, generateReceiptText } from "../algorithms/decryption"
import { checkSignature } from "../algorithms/signature"

type ResponseStatus = "OK"|"ERROR" 
class ResponseBean<T> {
    public static readonly errorStatus = "ERROR"
    public static readonly okStatus = "OK"
    public readonly status
    public constructor(status: ResponseStatus) {
        this.status = status
    }
}

class ResponseBeanError extends ResponseBean<any> {
    public constructor(public readonly error: ErrorType, public readonly message?: string) {
        super(ResponseBean.errorStatus)
    }
}

class ResponseBeanOk<T> extends ResponseBean<T> {
    public constructor(public readonly value: T) {
        super(ResponseBean.okStatus)
    }
}

class Verificatiotool {
    private static readonly responseOk: ResponseStatus = "OK"
    private static readonly responseError : ResponseStatus = "ERROR" 
    private _electionData?: ElectionData
    private _zkProof?: SecretProof
    private _secondDeviceLoginResponse?: SecondDeviceLoginResponse
    private _secondDeviceFinalMessage?: SecondDeviceFinalMessage
    private _randomCoinSeed?: Uint8Array
    private _decodedBallot?: Uint8Array
    
    public constructor() {
    }

    private async resolveFail(errorType: ErrorType, msg?: string): Promise<ResponseBean<any>> {
        return Promise.resolve(new ResponseBeanError(errorType, msg))
    } 

    /**
     * Loads the general election data from the polyas server
     * @returns A ResponseBean containing an object of type ElectionData or information about an error
     */
    public async loadElectionData(): Promise<ResponseBean<ElectionData>> {
        return axios.request({
            baseURL: baseURL,
            url: "/electionData",
            method: "get"
        })
        .then((response) => {
            try {
                this._electionData = ElectionData.fromJson(response.data)
                return Promise.resolve(new ResponseBeanOk<ElectionData>(this._electionData))
            } catch(error: any) {
                return this.resolveFail(ErrorType.FORMAT, error.message)
            }
        }).catch((error: any) => {
            console.log(error)
            return Promise.reject()
        })
    }

    /**
     * Completes the actual login process including the verification of the LoginResponse and decryption of the QRCode
     * @param voterId voterId from the QRCode
     * @param nonce nonce from the QR Code
     * @param password password entered by the voter
     * @param c param c from the QR Code
     * @returns A ResponseBean, either containing the LoginResponse or information about an error if one of the steps failed
     */
    public async login(voterId: string, nonce: string, password: string, c: string): Promise<ResponseBean<SecondDeviceLoginResponse>> {
        this._zkProof = generateRandomProof()
        return axios.request({
            baseURL: baseURL,
            url: "/login",
            method: "post",
            data: {
                voterId: voterId,
                nonce: nonce,
                password: password,
                challengeCommitment: this._zkProof.c.toString(16)
            }
        })
        .then(async (response) => {
            if (response.data.status != Verificatiotool.responseOk) {
                return this.resolveFail(ErrorType.EXTERN, response.data.error)
            }
            try {
                this._secondDeviceLoginResponse = SecondDeviceLoginResponse.fromJson(response.data.value)
            } catch(error: any) {
                return this.resolveFail(ErrorType.FORMAT, error.message)
            }
            if (!checkSecondDeviceParameters(this._secondDeviceLoginResponse.initialMessageDecoded.secondDeviceParameter)) {
                return this.resolveFail(ErrorType.SDPP)
            }
            let validAck = false
            try {
                validAck = await checkSignature(this._secondDeviceLoginResponse)
            } catch(error: any) {
                return this.resolveFail(ErrorType.BALLOT_ACK_FAIL, error.message)
            }
            if (!validAck) {
                return this.resolveFail(ErrorType.BALLOT_ACK)
            }
            try {
                this._randomCoinSeed = await decrytQRCode(c, this._secondDeviceLoginResponse.initialMessageDecoded)
            } catch(error: any) {
                return this.resolveFail(ErrorType.DECRYPT, error.message)
            }
            return Promise.resolve(new ResponseBeanOk(this._secondDeviceLoginResponse))
        })
        .catch((error: any) => {
            return Promise.reject()
        })
    }

    /**
     * The exchange of the second device challenge request and final message
     * Should only be called after login was successfully executed
     * @returns ResponseBean with the SecondDeviceFinalMessage or an error message if the verification fails 
     */
    public async finalMessage(): Promise<ResponseBean<SecondDeviceFinalMessage>> {
        if (!this._secondDeviceLoginResponse || !this._zkProof || !this._randomCoinSeed) {
            return this.resolveFail(ErrorType.INVALID_OPERATION)
        }
        return axios.request({
            baseURL: baseURL,
            url: "/challenge",
            method: "post",
            headers: {"AuthToken": this._secondDeviceLoginResponse.token},
            data: {
                challenge: this._zkProof.e.toString(10),
                challengeRandomCoin: this._zkProof.r.toString(10)
            }
        })
        .then(async (response) => {
            if (response.data.status != Verificatiotool.responseOk) {
                return this.resolveFail(ErrorType.EXTERN, response.data.error)
            }
            try {
                this._secondDeviceFinalMessage = SecondDeviceFinalMessage.fromJson(response.data.value)
            } catch(error: any) {
                return this.resolveFail(ErrorType.FORMAT, error.message)
            }
            if (!checkZKP(this._secondDeviceLoginResponse!.initialMessageDecoded, this._secondDeviceFinalMessage, this._zkProof!, this._randomCoinSeed!)) {
                return this.resolveFail(ErrorType.ZKP_INV)
            }
            return Promise.resolve(new ResponseBeanOk(this._secondDeviceFinalMessage))
        })
        .catch((error: any) => {
            return Promise.reject()
        })
    }

    /**
     * Decodes the ballot
     * Should only be called after finalMessage was successfully executed
     * @returns Ballot choices as Uint8Array
     */
    public decodeBallot(): ResponseBean<Uint8Array> {
        if (!this._secondDeviceLoginResponse || !this._randomCoinSeed) {
            console.log(this._secondDeviceLoginResponse, this._randomCoinSeed)
            return new ResponseBeanError(ErrorType.INVALID_OPERATION)
        }
        this._decodedBallot = decryptBallot(this._secondDeviceLoginResponse.initialMessageDecoded, this._randomCoinSeed)
        return new ResponseBeanOk(this._decodedBallot)
    }

    /**
     * Completes the steps login, finalMessage and getDecodedBallot as these steps are transparent to the user
     * @param voterId voterId from the QRCode
     * @param nonce nonce from the QR Code
     * @param password password entered by the voter
     * @param c param c from the QR Code
     * @returns A ResponseBean, either containing the decoded Ballot or information about an error if one of the steps failed
     */
    public async fullLogin(voterId: string, nonce: string, password: string, c: string): Promise<ResponseBean<Uint8Array>> {
        await this.login(voterId, nonce, password, c)
        .then((loginResult) => {
            if (loginResult.status == ResponseBean.errorStatus) {
                return Promise.resolve(loginResult as ResponseBeanError)
            }
        })
        .catch((error: any) => {return Promise.reject()})
        await this.finalMessage().then((zkpResult) => {
            if (zkpResult.status == ResponseBean.errorStatus) {
                return Promise.resolve(zkpResult as ResponseBeanError)
            }
        })
        .catch((error: any) => {return Promise.reject()})

        return Promise.resolve(this.decodeBallot())
    }

    /**
     * Should only be called after login or fullLogin is successfully executed
     * @returns Text of the ballot cast confirmation
     */
    public getReceiptText(): ResponseBean<string> {
        if (!this._secondDeviceLoginResponse) {
            return new ResponseBeanError(ErrorType.INVALID_OPERATION)
        }
        return new ResponseBeanOk(generateReceiptText(this._secondDeviceLoginResponse))
    }

    public get electionData(): ElectionData|undefined {
        return this._electionData
    }

    public get decodedBallot(): Uint8Array|undefined {
        return this._decodedBallot
    }
}

export {ResponseBean, ResponseBeanOk, ResponseBeanError, Verificatiotool}