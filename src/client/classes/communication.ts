import { Content, I18n, type ImageRef, type Language, throwIfNotPresent } from './basics'
import { Ballot, Core3Ballot } from './ballot'

class ElectionData {
  public constructor (
    public readonly title: I18n<string>,
    public readonly languages: Language[]
  ) {
    throwIfNotPresent(title, languages)
  }

  public static fromJson (electionJson: any): ElectionData {
    const title = I18n.fromJson<string>(electionJson.title, 'string')
    const languages = new Array<Language>()
    for (const lang of electionJson.languages) {
      languages.push(lang as Language)
    }
    return new ElectionData(title, languages)
  }
}

class SecondDeviceFinalMessage {
  public constructor (
    public readonly z: bigint[]
  ) {
    throwIfNotPresent(z)
  }

  public static fromJson (messageString: any): SecondDeviceFinalMessage {
    const messageJson = JSON.parse(messageString)
    const z = new Array<bigint>(
      ...Object.entries(messageJson.z).map(([key, val]) => BigInt(val as string))
    )
    return new SecondDeviceFinalMessage(z)
  }
}

class SecondDeviceInitialMsg {
  public readonly secondDeviceParameterDecoded
  public constructor (
    public readonly ballot: Ballot,
    public readonly comSeed: string,
    public readonly factorA: bigint[],
    public readonly factorB: bigint[],
    public readonly factorX: bigint[],
    public readonly factorY: bigint[],
    public readonly publicCredential: bigint,
    public readonly secondDeviceParameter: string,
    public readonly signatureHex: string
  ) {
    throwIfNotPresent(ballot, comSeed, factorA, factorB, factorX, factorY, publicCredential, secondDeviceParameter, signatureHex)
    this.secondDeviceParameterDecoded = VerifiableSecondDeviceParameters.fromJson(JSON.parse(this.secondDeviceParameter))
  }

  public static fromJson (msgJson: any): SecondDeviceInitialMsg {
    const ballot = Ballot.fromJson(msgJson.ballot)
    const comSeed = msgJson.comSeed as string
    const factorA = new Array<bigint>()
    const factorB = new Array<bigint>()
    const factorX = new Array<bigint>()
    const factorY = new Array<bigint>()
    const publicCredential = BigInt('0x' + msgJson.publicCredential)
    const secondDeviceParameterJson = msgJson.secondDeviceParametersJson as string
    const signatureHex = msgJson.signatureHex as string
    msgJson.factorA.forEach((factor: any) => { factorA.push(BigInt('0x' + factor)) })
    msgJson.factorB.forEach((factor: any) => { factorB.push(BigInt('0x' + factor)) })
    msgJson.factorX.forEach((factor: any) => { factorX.push(BigInt('0x' + factor)) })
    msgJson.factorY.forEach((factor: any) => { factorY.push(BigInt('0x' + factor)) })
    return new SecondDeviceInitialMsg(ballot, comSeed, factorA, factorB, factorX, factorY, publicCredential,
      secondDeviceParameterJson, signatureHex)
  }
}

class SecondDeviceLogin {
  public constructor (
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
  public constructor (
    public readonly allowInvalid: boolean,
    public readonly ballotVoterId: string,
    public readonly electionId: string,
    public readonly initialMessage: string,
    public readonly languages: Language[],
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

  public static fromJson (respJson: any): SecondDeviceLoginResponse {
    const languages = new Array<Language>()
    const title = I18n.fromJson<string>(respJson.title, 'string')
    const contentAbove = respJson.contentAbove !== undefined ? Content.generateContentFromJson(respJson.contentAbove) : undefined
    const logo = respJson.logo !== undefined ? I18n.fromJson<ImageRef>(respJson.logo, 'image') : undefined
    respJson.languages.forEach((element: any) => { languages.push(element as Language) })
    const messages = new Map<string, I18n<any>>(
      Object.entries(respJson.messages).map(([key, val]) => [key, I18n.fromJsonGeneric(val)])
    )
    return new SecondDeviceLoginResponse(respJson.allowInvalid as boolean, respJson.ballotVoterId as string,
      respJson.electionId as string, respJson.initialMessage as string, languages, messages,
      respJson.publicLabel as string, title, respJson.token as string, contentAbove, logo)
  }
}

class VerifiableSecondDeviceParameters {
  public constructor (
    public readonly ballots: Core3Ballot[],
    public readonly publicKey: string,
    public readonly verificationKey: string
  ) {
    throwIfNotPresent(ballots, publicKey, verificationKey)
  }

  public static fromJson (paramJson: any): VerifiableSecondDeviceParameters {
    const ballots = new Array<Core3Ballot>()
    paramJson.ballots.forEach((element: any) => { ballots.push(Core3Ballot.fromJson(element)) })
    return new VerifiableSecondDeviceParameters(ballots, paramJson.publicKey as string, paramJson.verificationKey as string)
  }
}

export { ElectionData, SecondDeviceLogin, SecondDeviceLoginResponse, SecondDeviceInitialMsg, SecondDeviceFinalMessage }
