import { SecondDeviceLoginResponse, type ElectionData, type SecondDeviceFinalMessage } from '../classes/communication'
import { type Core3StandardBallot, type SecretProof } from '../classes/ballot'
import { ErrorType } from './error'
import { checkSecondDeviceParameters, checkZKP, decryptBallot, decrytQRCode, generateReceiptText } from '../algorithms/decryption'
import { checkSignature } from '../algorithms/signature'
import { EnvironmentVariables } from './constants'
import { type Communication, ResponseBean, ResponseBeanError, ResponseBeanOk } from './communication'

class Verificationtool {
  private readonly comm: Communication
  private readonly _electionData?: ElectionData
  private _zkProof?: SecretProof
  private _secondDeviceLoginResponse?: SecondDeviceLoginResponse
  private _secondDeviceFinalMessage?: SecondDeviceFinalMessage
  private _randomCoinSeed?: Uint8Array
  private _decodedBallot?: Uint8Array

  public constructor () {
    this.comm = EnvironmentVariables.instance.comm
  }

  private async resolveFail (errorType: ErrorType, msg?: string): Promise<ResponseBean<any>> {
    return await Promise.resolve(new ResponseBeanError(errorType, msg))
  }

  /**
     * Loads the general election data from the election server
     * @returns A ResponseBean containing an object of type ElectionData or information about an error
     */
  public async loadElectionData (): Promise<ResponseBean<ElectionData>> {
    return await this.comm.electionData()
  }

  /**
     * Completes the actual login process including the verification of the LoginResponse and decryption of the QRCode
     * @param voterId voterId from the QRCode
     * @param nonce nonce from the QR Code
     * @param password password entered by the voter
     * @param c param c from the QR Code
     * @returns A ResponseBean, either containing the LoginResponse or information about an error if one of the steps failed
     */
  public async login (voterId: string, nonce: string, password: string, c: string): Promise<ResponseBean<SecondDeviceLoginResponse>> {
    this._zkProof = EnvironmentVariables.instance.proofGen.generateProof()
    const challenge = this._zkProof.c.toString(16)
    const loginResponse: ResponseBean<SecondDeviceLoginResponse> = await this.comm.login(voterId, nonce, password, challenge)
    if (loginResponse.status === ResponseBean.errorStatus) {
      return loginResponse
    }
    this._secondDeviceLoginResponse = (loginResponse as ResponseBeanOk<SecondDeviceLoginResponse>).value
    if (!await checkSecondDeviceParameters(this._secondDeviceLoginResponse.initialMessageDecoded.secondDeviceParameter)) {
      return await this.resolveFail(ErrorType.SDPP)
    }
    // if (this._secondDeviceLoginResponse.ballotVoterId !== voterId) {
    //  return await this.resolveFail(ErrorType.VID)
    // }
    let validAck = false
    try {
      validAck = await checkSignature(this._secondDeviceLoginResponse)
    } catch (error: any) {
      return await this.resolveFail(ErrorType.BALLOT_ACK_FAIL, error.message)
    }
    if (!validAck) {
      return await this.resolveFail(ErrorType.BALLOT_ACK)
    }
    try {
      this._randomCoinSeed = await decrytQRCode(c, this._secondDeviceLoginResponse.initialMessageDecoded)
    } catch (error: any) {
      return await this.resolveFail(ErrorType.DECRYPT, error.message)
    }
    return await Promise.resolve(new ResponseBeanOk(this._secondDeviceLoginResponse))
  }

  /**
     * The exchange of the second device challenge request and final message
     * Should only be called after login was successfully executed
     * @returns ResponseBean with the SecondDeviceFinalMessage or an error message if the verification fails
     */
  public async finalMessage (): Promise<ResponseBean<SecondDeviceFinalMessage>> {
    if (this._secondDeviceLoginResponse === undefined || this._zkProof === undefined || this._randomCoinSeed === undefined) {
      return await this.resolveFail(ErrorType.INVALID_OPERATION)
    }
    const finalResponse = await this.comm.challenge(this._secondDeviceLoginResponse.token, this._zkProof)
    if (finalResponse.status === ResponseBean.errorStatus) {
      return finalResponse
    }
    this._secondDeviceFinalMessage = (finalResponse as ResponseBeanOk<SecondDeviceFinalMessage>).value
    if (!await checkZKP(this._secondDeviceLoginResponse.initialMessageDecoded, this._secondDeviceFinalMessage, this._zkProof, this._randomCoinSeed)) {
      return await this.resolveFail(ErrorType.ZKP_INV)
    }
    return await Promise.resolve(new ResponseBeanOk(this._secondDeviceFinalMessage))
  }

  /**
     * Decodes the ballot
     * Should only be called after finalMessage was successfully executed
     * @returns Ballot choices as Uint8Array
     */
  public async decodeBallot (): Promise<ResponseBean<Uint8Array>> {
    if (this._secondDeviceLoginResponse === undefined || this._randomCoinSeed === undefined) {
      return await Promise.resolve(new ResponseBeanError(ErrorType.INVALID_OPERATION))
    }
    this._decodedBallot = await decryptBallot(this._secondDeviceLoginResponse.initialMessageDecoded, this._randomCoinSeed)
    let expectedLength = 0
    for (const ballotSheet of this._secondDeviceLoginResponse.initialMessageDecoded.secondDeviceParameterDecoded.ballots) {
      const sheet = ballotSheet as Core3StandardBallot
      if (this._secondDeviceLoginResponse.publicLabel.split(':').includes(sheet.id)) {
        expectedLength += 1
        for (const list of sheet.lists) {
          expectedLength += 1 + list.candidates.length
        }
      }
    }
    if (this._decodedBallot.length !== expectedLength) {
      return await Promise.resolve(new ResponseBeanError(ErrorType.DECODE))
    }
    return await Promise.resolve(new ResponseBeanOk(this._decodedBallot))
  }

  /**
     * Completes the steps login, finalMessage and getDecodedBallot as these steps are transparent to the user
     * @param voterId voterId from the QRCode
     * @param nonce nonce from the QR Code
     * @param password password entered by the voter
     * @param c param c from the QR Code
     * @returns A ResponseBean, either containing the decoded Ballot or information about an error if one of the steps failed
     */
  public async fullLogin (voterId: string, nonce: string, password: string, c: string): Promise<ResponseBean<Uint8Array>> {
    const loginResponse = await this.login(voterId, nonce, password, c)
    if (loginResponse.status === ResponseBean.errorStatus) {
      return await Promise.resolve(loginResponse as ResponseBeanError)
    }
    const finalMessage = await this.finalMessage()
    if (finalMessage.status === ResponseBean.errorStatus) {
      return await Promise.resolve(finalMessage as ResponseBeanError)
    }

    return await Promise.resolve(this.decodeBallot())
  }

  /**
     * Should only be called after login or fullLogin is successfully executed
     * @returns Text of the ballot cast confirmation
     */
  public async getReceiptText (): Promise<ResponseBean<string[]>> {
    if (this._secondDeviceLoginResponse === undefined) {
      return new ResponseBeanError(ErrorType.INVALID_OPERATION)
    }
    return new ResponseBeanOk(await generateReceiptText(this._secondDeviceLoginResponse))
  }

  public get electionData (): ElectionData | undefined {
    return this._electionData
  }

  public get decodedBallot (): Uint8Array | undefined {
    return this._decodedBallot
  }
}

export { Verificationtool }
