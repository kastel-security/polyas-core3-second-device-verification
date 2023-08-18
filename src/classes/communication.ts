import {Content, I18n, ImageRef, type Language, throwIfNotPresent} from "./basics"
import {Ballot, Core3Ballot} from "./ballot"

class ElectionData {
    public constructor(
        public readonly title: I18n<string>,
        public readonly languages: Array<Language>
    ) {
        throwIfNotPresent(title, languages)
    }
    public static fromJson(electionJson : any) {
        let title = I18n.fromJson<string>(electionJson.title, "string")
        let languages = new Array<Language>()
        for (let lang of electionJson.languages) {
            languages.push(lang as Language)
        }
        return new ElectionData(title, languages)
    }
}

class LoginRequest {
    public constructor(public readonly voterId: string,
        public readonly password: string,
        public readonly nonce: string,
        public readonly challengeCommitment: string) {
            throwIfNotPresent(password, nonce, challengeCommitment)
        }
}

class ChallengeRequest {
    public constructor(
        public readonly challenge: bigint,
        public readonly challengeRandomCoin: bigint
    ) {
        throwIfNotPresent(challenge, challengeRandomCoin)
    }
}

class SecondDeviceFinalMessage {
    public constructor(
        public readonly z: Array<bigint>
    ) {
        throwIfNotPresent(z)
    }
    public static fromJson(messageString: any): SecondDeviceFinalMessage {
        const messageJson = JSON.parse(messageString)
        let z = new Array<bigint>(
            ...Object.entries(messageJson.z).map(([key, val]) => BigInt(val as string))
        )
        return new SecondDeviceFinalMessage(z)
    }
}

class SecondDeviceInitialMsg {
    public constructor(
        public readonly ballot: Ballot,
        public readonly comSeed: string,
        public readonly factorA: Array<bigint>,
        public readonly factorB: Array<bigint>,
        public readonly factorX: Array<bigint>,
        public readonly factorY: Array<bigint>,
        public readonly publicCredential: bigint,
        public readonly secondDeviceParameter: string,
        public readonly signatureHex: string
    ) {
        throwIfNotPresent(ballot, comSeed, factorA, factorB, factorX, factorY, publicCredential, secondDeviceParameter, signatureHex)
    }
    public static fromJson(msgJson: any): SecondDeviceInitialMsg {
        let ballot = Ballot.fromJson(msgJson.ballot)
        let comSeed = msgJson.comSeed as string
        let factorA = new Array<bigint>()
        let factorB = new Array<bigint>()
        let factorX = new Array<bigint>()
        let factorY = new Array<bigint>()
        let publicCredential = BigInt("0x" + msgJson.publicCredential)
        let secondDeviceParameterJson = msgJson.secondDeviceParametersJson as string
        let signatureHex = msgJson.signatureHex as string
        msgJson.factorA.forEach((factor: any) => {factorA.push(BigInt("0x" + factor))});
        msgJson.factorB.forEach((factor: any) => {factorB.push(BigInt("0x" + factor))});
        msgJson.factorX.forEach((factor: any) => {factorX.push(BigInt("0x" + factor))});
        msgJson.factorY.forEach((factor: any) => {factorY.push(BigInt("0x" + factor))});
        return new SecondDeviceInitialMsg(ballot, comSeed, factorA, factorB, factorX, factorY, publicCredential, 
            secondDeviceParameterJson, signatureHex)
    }
    public get secondDeviceParameterDecoded(): VerifiableSecondDeviceParameters {
        return VerifiableSecondDeviceParameters.fromJson(JSON.parse(this.secondDeviceParameter))
    }
}

class SecondDeviceLogin {
    public constructor(
        public readonly challengeCommitment: string,
        public readonly nonce: string,
        public readonly password: string,
        public readonly voterId: string
    ) {
        throwIfNotPresent(challengeCommitment, nonce, password, voterId)
    }
}

class SecondDeviceLoginResponse {
    public readonly initialMessageDecoded: SecondDeviceInitialMsg
    public constructor(
        public readonly allowInvalid: boolean,
        public readonly ballotVoterId: string,
        public readonly electionId: string,
        public readonly initialMessage: string,
        public readonly languages: Array<Language>,
        public readonly messages: Map<string, I18n<any>>,
        public readonly publicLabel: string,
        public readonly title: I18n<string>,
        public readonly token: string,
        public readonly contentAbove?: Content,
        public readonly logo?: I18n<ImageRef>
    ) {
        throwIfNotPresent(allowInvalid, ballotVoterId, electionId, initialMessage, languages, messages,
            publicLabel, title, token)
        this.initialMessageDecoded = SecondDeviceInitialMsg.fromJson(JSON.parse(initialMessage))
    }
    public static fromJson(respJson: any): SecondDeviceLoginResponse {
        let languages = new Array<Language>
        let title = I18n.fromJson<string>(respJson.title, "string")
        let contentAbove = respJson.contentAbove ? Content.generateContentFromJson(respJson.contentAbove) : undefined
        let logo = respJson.logo ? I18n.fromJson<ImageRef>(respJson.logo, "image"): undefined
        respJson.languages.forEach((element: any) => {languages.push(element as Language)}); 
        let messages: Map<string, I18n<any>> = new Map(
            Object.entries(respJson.messages).map(([key, val]) => [key as string, I18n.fromJsonGeneric(val)])
          )
        return new SecondDeviceLoginResponse(respJson.allowInvalid as boolean, respJson.ballotVoterId as string,
            respJson.electionId as string, respJson.initialMessage as string, languages, messages,
            respJson.publicLabel as string, title, respJson.token as string, contentAbove, logo)
    }
}

class VerifiableSecondDeviceParameters {
    public constructor(
        public readonly ballots: Array<Core3Ballot>,
        public readonly publicKey: string,
        public readonly verificationKey: string
    ) {
        throwIfNotPresent(ballots, publicKey, verificationKey)
    }
    public static fromJson(paramJson: any) {
        let ballots = new Array<Core3Ballot>()
        paramJson.ballots.forEach((element: any) => {ballots.push(Core3Ballot.fromJson(element))});
        return new VerifiableSecondDeviceParameters(ballots, paramJson.publicKey as string, paramJson.verificationKey as string)
    }
}

export{ElectionData, LoginRequest, SecondDeviceLogin, SecondDeviceLoginResponse, SecondDeviceInitialMsg, SecondDeviceFinalMessage}