import { Content, I18n, throwIfNotPresent } from './basics';
import { Ballot, Core3Ballot } from './ballot';
class ElectionData {
    title;
    languages;
    constructor(title, languages) {
        this.title = title;
        this.languages = languages;
        throwIfNotPresent(title, languages);
    }
    static fromJson(electionJson) {
        const title = I18n.fromJson(electionJson.title, 'string');
        const languages = new Array();
        for (const lang of electionJson.languages) {
            languages.push(lang);
        }
        return new ElectionData(title, languages);
    }
}
class SecondDeviceFinalMessage {
    z;
    constructor(z) {
        this.z = z;
        throwIfNotPresent(z);
    }
    static fromJson(messageString) {
        const messageJson = JSON.parse(messageString);
        const z = new Array(...Object.entries(messageJson.z).map(([key, val]) => BigInt(val)));
        return new SecondDeviceFinalMessage(z);
    }
}
class SecondDeviceInitialMsg {
    ballot;
    comSeed;
    factorA;
    factorB;
    factorX;
    factorY;
    publicCredential;
    secondDeviceParameter;
    signatureHex;
    secondDeviceParameterDecoded;
    constructor(ballot, comSeed, factorA, factorB, factorX, factorY, publicCredential, secondDeviceParameter, signatureHex) {
        this.ballot = ballot;
        this.comSeed = comSeed;
        this.factorA = factorA;
        this.factorB = factorB;
        this.factorX = factorX;
        this.factorY = factorY;
        this.publicCredential = publicCredential;
        this.secondDeviceParameter = secondDeviceParameter;
        this.signatureHex = signatureHex;
        throwIfNotPresent(ballot, comSeed, factorA, factorB, factorX, factorY, publicCredential, secondDeviceParameter, signatureHex);
        this.secondDeviceParameterDecoded = VerifiableSecondDeviceParameters.fromJson(JSON.parse(this.secondDeviceParameter));
    }
    static fromJson(msgJson) {
        const ballot = Ballot.fromJson(msgJson.ballot);
        const comSeed = msgJson.comSeed;
        const factorA = new Array();
        const factorB = new Array();
        const factorX = new Array();
        const factorY = new Array();
        const publicCredential = BigInt('0x' + msgJson.publicCredential);
        const secondDeviceParameterJson = msgJson.secondDeviceParametersJson;
        const signatureHex = msgJson.signatureHex;
        msgJson.factorA.forEach((factor) => { factorA.push(BigInt('0x' + factor)); });
        msgJson.factorB.forEach((factor) => { factorB.push(BigInt('0x' + factor)); });
        msgJson.factorX.forEach((factor) => { factorX.push(BigInt('0x' + factor)); });
        msgJson.factorY.forEach((factor) => { factorY.push(BigInt('0x' + factor)); });
        return new SecondDeviceInitialMsg(ballot, comSeed, factorA, factorB, factorX, factorY, publicCredential, secondDeviceParameterJson, signatureHex);
    }
}
class SecondDeviceLogin {
    challengeCommitment;
    nonce;
    password;
    voterId;
    constructor(challengeCommitment, nonce, password, voterId) {
        this.challengeCommitment = challengeCommitment;
        this.nonce = nonce;
        this.password = password;
        this.voterId = voterId;
        throwIfNotPresent(challengeCommitment, nonce, password, voterId);
    }
}
class SecondDeviceLoginResponse {
    allowInvalid;
    ballotVoterId;
    electionId;
    initialMessage;
    languages;
    messages;
    publicLabel;
    title;
    token;
    contentAbove;
    logo;
    initialMessageDecoded;
    constructor(allowInvalid, ballotVoterId, electionId, initialMessage, languages, messages, publicLabel, title, token, contentAbove, logo) {
        this.allowInvalid = allowInvalid;
        this.ballotVoterId = ballotVoterId;
        this.electionId = electionId;
        this.initialMessage = initialMessage;
        this.languages = languages;
        this.messages = messages;
        this.publicLabel = publicLabel;
        this.title = title;
        this.token = token;
        this.contentAbove = contentAbove;
        this.logo = logo;
        throwIfNotPresent(allowInvalid, ballotVoterId, electionId, initialMessage, languages, messages, publicLabel, title, token);
        this.initialMessageDecoded = SecondDeviceInitialMsg.fromJson(JSON.parse(initialMessage));
    }
    static fromJson(respJson) {
        const languages = new Array();
        const title = I18n.fromJson(respJson.title, 'string');
        const contentAbove = respJson.contentAbove !== undefined ? Content.generateContentFromJson(respJson.contentAbove) : undefined;
        const logo = respJson.logo !== undefined ? I18n.fromJson(respJson.logo, 'image') : undefined;
        respJson.languages.forEach((element) => { languages.push(element); });
        const messages = new Map(Object.entries(respJson.messages).map(([key, val]) => [key, I18n.fromJsonGeneric(val)]));
        return new SecondDeviceLoginResponse(respJson.allowInvalid, respJson.ballotVoterId, respJson.electionId, respJson.initialMessage, languages, messages, respJson.publicLabel, title, respJson.token, contentAbove, logo);
    }
}
class VerifiableSecondDeviceParameters {
    ballots;
    publicKey;
    verificationKey;
    constructor(ballots, publicKey, verificationKey) {
        this.ballots = ballots;
        this.publicKey = publicKey;
        this.verificationKey = verificationKey;
        throwIfNotPresent(ballots, publicKey, verificationKey);
    }
    static fromJson(paramJson) {
        const ballots = new Array();
        paramJson.ballots.forEach((element) => { ballots.push(Core3Ballot.fromJson(element)); });
        return new VerifiableSecondDeviceParameters(ballots, paramJson.publicKey, paramJson.verificationKey);
    }
}
export { ElectionData, SecondDeviceLogin, SecondDeviceLoginResponse, SecondDeviceInitialMsg, SecondDeviceFinalMessage };
