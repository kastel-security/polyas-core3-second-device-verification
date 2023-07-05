import {Content, I18n, ImageRef, Language, throwIfNotPresent} from "./basics"
import {Ballot, Core3Ballot} from "./ballot"

class ElectionData {
    public constructor(
        public readonly title: I18n<String>,
        public readonly languages: Array<Language>
    ) {
        throwIfNotPresent(title, languages)
    }
    public static fromJson(electionJson : any) {
        let title = I18n.fromJson<String>(electionJson.title, "string")
        let languages = new Array<Language>()
        for (let lang in electionJson.languages) {
            languages.push(Language[lang])
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
    public static fromJson(messageJson: any): SecondDeviceFinalMessage {
        let z = new Array<bigint>()
        for (let num in messageJson.z) {
            z.push(BigInt("0x" + num))
        }
        return new SecondDeviceFinalMessage(z)
    }
}

class SecondDeviceInitialMsg {
    public constructor(
        public readonly ballot: Ballot,
        public readonly comSeed: Uint8Array,
        public readonly factorA: Array<bigint>,
        public readonly factorB: Array<bigint>,
        public readonly factorX: Array<bigint>,
        public readonly factorY: Array<bigint>,
        public readonly publicCredential: bigint,
        public readonly secondDeviceParameterJson: String,
        public readonly signatureHex: String
    ) {
        throwIfNotPresent(ballot, comSeed, factorA, factorB, factorX, factorY, publicCredential, secondDeviceParameterJson, signatureHex)
    }
    public static fromJson(msgJson): SecondDeviceInitialMsg {
        let ballot = Ballot.fromJson(msgJson.ballot)
        let comSeedString = msgJson.comSeed as String
        let comSeed = new Uint8Array(comSeedString.length / 2)
        for (let i = 1; i < comSeed.length; i++) {
            comSeed[i] = parseInt(comSeedString[2*i] + comSeed[2*i + 1], 16)
        }
        let factorA = new Array<bigint>()
        let factorB = new Array<bigint>()
        let factorX = new Array<bigint>()
        let factorY = new Array<bigint>()
        let publicCredential = BigInt(msgJson.publicCredential)
        let secondDeviceParameterJson = msgJson.secondDeviceParameterJson as String
        let signatureHex = msgJson.signatureHex as String
        msgJson.factorA.forEach(factor => {factorA.push(BigInt(factor))});
        msgJson.factorB.forEach(factor => {factorB.push(BigInt(factor))});
        msgJson.factorX.forEach(factor => {factorX.push(BigInt(factor))});
        msgJson.factorY.forEach(factor => {factorY.push(BigInt(factor))});
        return new SecondDeviceInitialMsg(ballot, comSeed, factorA, factorB, factorX, factorY, publicCredential, 
            secondDeviceParameterJson, signatureHex)
    }
}

class SecondDeviceLogin {
    public constructor(
        public readonly challengeCommitment: String,
        public readonly nonce: String,
        public readonly password: String,
        public readonly voterId: String
    ) {
        throwIfNotPresent(challengeCommitment, nonce, password, voterId)
    }
}

class SecondDeviceLoginResponse {
    public readonly initialMessageDecoded: SecondDeviceInitialMsg
    public constructor(
        public readonly allowInvalid: boolean,
        public readonly ballotVoterId: String,
        public readonly electionId: String,
        public readonly initialMessage: String,
        public readonly languages: Array<Language>,
        public readonly messages: Map<String, I18n<any>>,
        public readonly publicLabel: String,
        public readonly title: I18n<String>,
        public readonly token: String,
        public readonly contentAbove?: Content,
        public readonly logo?: I18n<ImageRef>
    ) {
        throwIfNotPresent(allowInvalid, ballotVoterId, electionId, initialMessage, languages, messages,
            publicLabel, title, token)
        this.initialMessageDecoded = SecondDeviceInitialMsg.fromJson(initialMessage)
    }
    public static fromJson(respJson): SecondDeviceLoginResponse {
        let languages = new Array<Language>
        let messages = new Map<String, I18n<any>>
        let title = I18n.fromJson<String>(respJson.title, "string")
        let contentAbove = respJson.contentAbove ? Content.generateContentFromJson(respJson.contentAbove) : undefined
        let logo = respJson.logo ? I18n.fromJson<ImageRef>(respJson.logo, "image"): undefined
        respJson.languages.forEach(element => {languages.push(Language[element])});   
        for (let key of respJson.messages.keys) {
            messages.set(key as String, I18n.fromJsonGeneric(respJson.messages.get(key)))
        } 
        return new SecondDeviceLoginResponse(respJson.allowInvalid as boolean, respJson.ballotVoterId as String,
            respJson.electionId as String, respJson.initialMessage as String, languages, messages,
            respJson.publicLabel as String, title, respJson.token as String, contentAbove, logo)
    }
}

class VerifiableSecondDeviceParameters {
    public constructor(
        public readonly ballots: Array<Core3Ballot>,
        public readonly publicKey: String,
        public readonly verificationKey: String
    ) {
        throwIfNotPresent(ballots, publicKey, verificationKey)
    }
    public static fromJson(paramJson) {
        let ballots = new Array<Core3Ballot>()
        paramJson.ballots.forEach(element => {ballots.push(Core3Ballot.fromJson(element))});
        return new VerifiableSecondDeviceParameters(ballots, paramJson.publicKey as String, paramJson.verificationKey as String)
    }
}