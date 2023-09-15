import { type ElectionData, type SecondDeviceFinalMessage, type SecondDeviceLoginResponse } from '../classes/communication';
import { ResponseBean } from './communication';
declare class Verificationtool {
    private readonly comm;
    private readonly _electionData?;
    private _zkProof?;
    private _secondDeviceLoginResponse?;
    private _secondDeviceFinalMessage?;
    private _randomCoinSeed?;
    private _decodedBallot?;
    constructor();
    private resolveFail;
    /**
       * Loads the general election data from the polyas server
       * @returns A ResponseBean containing an object of type ElectionData or information about an error
       */
    loadElectionData(): Promise<ResponseBean<ElectionData>>;
    /**
       * Completes the actual login process including the verification of the LoginResponse and decryption of the QRCode
       * @param voterId voterId from the QRCode
       * @param nonce nonce from the QR Code
       * @param password password entered by the voter
       * @param c param c from the QR Code
       * @returns A ResponseBean, either containing the LoginResponse or information about an error if one of the steps failed
       */
    login(voterId: string, nonce: string, password: string, c: string): Promise<ResponseBean<SecondDeviceLoginResponse>>;
    /**
       * The exchange of the second device challenge request and final message
       * Should only be called after login was successfully executed
       * @returns ResponseBean with the SecondDeviceFinalMessage or an error message if the verification fails
       */
    finalMessage(): Promise<ResponseBean<SecondDeviceFinalMessage>>;
    /**
       * Decodes the ballot
       * Should only be called after finalMessage was successfully executed
       * @returns Ballot choices as Uint8Array
       */
    decodeBallot(): Promise<ResponseBean<Uint8Array>>;
    /**
       * Completes the steps login, finalMessage and getDecodedBallot as these steps are transparent to the user
       * @param voterId voterId from the QRCode
       * @param nonce nonce from the QR Code
       * @param password password entered by the voter
       * @param c param c from the QR Code
       * @returns A ResponseBean, either containing the decoded Ballot or information about an error if one of the steps failed
       */
    fullLogin(voterId: string, nonce: string, password: string, c: string): Promise<ResponseBean<Uint8Array>>;
    /**
       * Should only be called after login or fullLogin is successfully executed
       * @returns Text of the ballot cast confirmation
       */
    getReceiptText(): Promise<ResponseBean<string[]>>;
    get electionData(): ElectionData | undefined;
    get decodedBallot(): Uint8Array | undefined;
}
export { Verificationtool };
