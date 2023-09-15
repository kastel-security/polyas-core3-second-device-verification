import { Content, I18n, type ImageRef, type Language } from './basics';
import { Ballot } from './ballot';
declare class ElectionData {
    readonly title: I18n<string>;
    readonly languages: Language[];
    constructor(title: I18n<string>, languages: Language[]);
    static fromJson(electionJson: any): ElectionData;
}
declare class SecondDeviceFinalMessage {
    readonly z: bigint[];
    constructor(z: bigint[]);
    static fromJson(messageString: any): SecondDeviceFinalMessage;
}
declare class SecondDeviceInitialMsg {
    readonly ballot: Ballot;
    readonly comSeed: string;
    readonly factorA: bigint[];
    readonly factorB: bigint[];
    readonly factorX: bigint[];
    readonly factorY: bigint[];
    readonly publicCredential: bigint;
    readonly secondDeviceParameter: string;
    readonly signatureHex: string;
    readonly secondDeviceParameterDecoded: any;
    constructor(ballot: Ballot, comSeed: string, factorA: bigint[], factorB: bigint[], factorX: bigint[], factorY: bigint[], publicCredential: bigint, secondDeviceParameter: string, signatureHex: string);
    static fromJson(msgJson: any): SecondDeviceInitialMsg;
}
declare class SecondDeviceLogin {
    readonly challengeCommitment: string;
    readonly nonce: string;
    readonly password: string;
    readonly voterId: string;
    constructor(challengeCommitment: string, nonce: string, password: string, voterId: string);
}
declare class SecondDeviceLoginResponse {
    readonly allowInvalid: boolean;
    readonly ballotVoterId: string;
    readonly electionId: string;
    readonly initialMessage: string;
    readonly languages: Language[];
    readonly messages: Map<string, I18n<any>>;
    readonly publicLabel: string;
    readonly title: I18n<string>;
    readonly token: string;
    readonly contentAbove?: Content | undefined;
    readonly logo?: I18n<ImageRef> | undefined;
    readonly initialMessageDecoded: SecondDeviceInitialMsg;
    constructor(allowInvalid: boolean, ballotVoterId: string, electionId: string, initialMessage: string, languages: Language[], messages: Map<string, I18n<any>>, publicLabel: string, title: I18n<string>, token: string, contentAbove?: Content | undefined, logo?: I18n<ImageRef> | undefined);
    static fromJson(respJson: any): SecondDeviceLoginResponse;
}
export { ElectionData, SecondDeviceLogin, SecondDeviceLoginResponse, SecondDeviceInitialMsg, SecondDeviceFinalMessage };
