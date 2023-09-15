import { ErrorType } from './error';
import { checkSecondDeviceParameters, checkZKP, decryptBallot, decrytQRCode, generateReceiptText } from '../algorithms/decryption';
import { checkSignature } from '../algorithms/signature';
import { EnvironmentVariables } from './constants';
import { ResponseBean, ResponseBeanError, ResponseBeanOk } from './communication';
class Verificationtool {
    comm;
    _electionData;
    _zkProof;
    _secondDeviceLoginResponse;
    _secondDeviceFinalMessage;
    _randomCoinSeed;
    _decodedBallot;
    constructor() {
        this.comm = EnvironmentVariables.instance.comm;
    }
    async resolveFail(errorType, msg) {
        return await Promise.resolve(new ResponseBeanError(errorType, msg));
    }
    /**
       * Loads the general election data from the polyas server
       * @returns A ResponseBean containing an object of type ElectionData or information about an error
       */
    async loadElectionData() {
        return await this.comm.electionData();
    }
    /**
       * Completes the actual login process including the verification of the LoginResponse and decryption of the QRCode
       * @param voterId voterId from the QRCode
       * @param nonce nonce from the QR Code
       * @param password password entered by the voter
       * @param c param c from the QR Code
       * @returns A ResponseBean, either containing the LoginResponse or information about an error if one of the steps failed
       */
    async login(voterId, nonce, password, c) {
        this._zkProof = EnvironmentVariables.instance.proofGen.generateProof();
        const challenge = this._zkProof.c.toString(16);
        const loginResponse = await this.comm.login(voterId, nonce, password, challenge);
        if (loginResponse.status === ResponseBean.errorStatus) {
            return loginResponse;
        }
        this._secondDeviceLoginResponse = loginResponse.value;
        if (!await checkSecondDeviceParameters(this._secondDeviceLoginResponse.initialMessageDecoded.secondDeviceParameter)) {
            return await this.resolveFail(ErrorType.SDPP);
        }
        let validAck = false;
        try {
            validAck = await checkSignature(this._secondDeviceLoginResponse);
        }
        catch (error) {
            return await this.resolveFail(ErrorType.BALLOT_ACK_FAIL, error.message);
        }
        if (!validAck) {
            return await this.resolveFail(ErrorType.BALLOT_ACK);
        }
        try {
            this._randomCoinSeed = await decrytQRCode(c, this._secondDeviceLoginResponse.initialMessageDecoded);
        }
        catch (error) {
            return await this.resolveFail(ErrorType.DECRYPT, error.message);
        }
        return await Promise.resolve(new ResponseBeanOk(this._secondDeviceLoginResponse));
    }
    /**
       * The exchange of the second device challenge request and final message
       * Should only be called after login was successfully executed
       * @returns ResponseBean with the SecondDeviceFinalMessage or an error message if the verification fails
       */
    async finalMessage() {
        if (this._secondDeviceLoginResponse === undefined || this._zkProof === undefined || this._randomCoinSeed === undefined) {
            return await this.resolveFail(ErrorType.INVALID_OPERATION);
        }
        const finalResponse = await this.comm.challenge(this._secondDeviceLoginResponse.token, this._zkProof);
        if (finalResponse.status === ResponseBean.errorStatus) {
            return finalResponse;
        }
        this._secondDeviceFinalMessage = finalResponse.value;
        if (!await checkZKP(this._secondDeviceLoginResponse.initialMessageDecoded, this._secondDeviceFinalMessage, this._zkProof, this._randomCoinSeed)) {
            return await this.resolveFail(ErrorType.ZKP_INV);
        }
        return await Promise.resolve(new ResponseBeanOk(this._secondDeviceFinalMessage));
    }
    /**
       * Decodes the ballot
       * Should only be called after finalMessage was successfully executed
       * @returns Ballot choices as Uint8Array
       */
    async decodeBallot() {
        if (this._secondDeviceLoginResponse === undefined || this._randomCoinSeed === undefined) {
            return await Promise.resolve(new ResponseBeanError(ErrorType.INVALID_OPERATION));
        }
        this._decodedBallot = await decryptBallot(this._secondDeviceLoginResponse.initialMessageDecoded, this._randomCoinSeed);
        let expectedLength = 0;
        for (const ballotSheet of this._secondDeviceLoginResponse.initialMessageDecoded.secondDeviceParameterDecoded.ballots) {
            const sheet = ballotSheet;
            if (this._secondDeviceLoginResponse.publicLabel.split(':').includes(sheet.id)) {
                expectedLength += 1;
                for (const list of sheet.lists) {
                    expectedLength += 1 + list.candidates.length;
                }
            }
        }
        if (this._decodedBallot.length !== expectedLength) {
            return await Promise.resolve(new ResponseBeanError(ErrorType.DECODE));
        }
        return await Promise.resolve(new ResponseBeanOk(this._decodedBallot));
    }
    /**
       * Completes the steps login, finalMessage and getDecodedBallot as these steps are transparent to the user
       * @param voterId voterId from the QRCode
       * @param nonce nonce from the QR Code
       * @param password password entered by the voter
       * @param c param c from the QR Code
       * @returns A ResponseBean, either containing the decoded Ballot or information about an error if one of the steps failed
       */
    async fullLogin(voterId, nonce, password, c) {
        const loginResponse = await this.login(voterId, nonce, password, c);
        if (loginResponse.status === ResponseBean.errorStatus) {
            return await Promise.resolve(loginResponse);
        }
        const finalMessage = await this.finalMessage();
        if (finalMessage.status === ResponseBean.errorStatus) {
            return await Promise.resolve(finalMessage);
        }
        return await Promise.resolve(this.decodeBallot());
    }
    /**
       * Should only be called after login or fullLogin is successfully executed
       * @returns Text of the ballot cast confirmation
       */
    async getReceiptText() {
        if (this._secondDeviceLoginResponse === undefined) {
            return new ResponseBeanError(ErrorType.INVALID_OPERATION);
        }
        return new ResponseBeanOk(await generateReceiptText(this._secondDeviceLoginResponse));
    }
    get electionData() {
        return this._electionData;
    }
    get decodedBallot() {
        return this._decodedBallot;
    }
}
export { Verificationtool };
