import { Content, I18n, throwIfNotPresent } from './basics'
class Ciphertext {
  public constructor (
    public readonly x: bigint,
    public readonly y: bigint) {
    throwIfNotPresent(x, y)
  }

  public static fromJson (cipherJson: any): Ciphertext {
    return new Ciphertext(BigInt('0x' + cipherJson.x), BigInt('0x' + cipherJson.y))
  }
}

class MultiCiphertext {
  public constructor (
    public readonly ciphertexts: Ciphertext[],
    public readonly auxData?: Map<string, string>) {
    throwIfNotPresent(ciphertexts)
  }

  public static fromJson (cipherJson: any): MultiCiphertext {
    const ciphertexts = new Array<Ciphertext>(
      ...Object.entries(cipherJson.ciphertexts).map(([key, val]) => Ciphertext.fromJson(val))
    )
    const auxData: Map<string, string> | undefined = cipherJson.auxData !== undefined
      ? new Map(
        Object.entries(cipherJson.auxData).map(([key, val]) => [key, val as string]))
      : undefined
    return new MultiCiphertext(ciphertexts, auxData)
  }
}

class Proof {
  public constructor (
    public readonly c: bigint,
    public readonly f: bigint) {
    throwIfNotPresent(c, f)
  }

  public static fromJson (cipherJson: any): Proof {
    return new Proof(BigInt(cipherJson.c), BigInt(cipherJson.f))
  }
}

class SecretProof {
  public constructor (
    public readonly e: bigint, // random number
    public readonly r: bigint, // random number
    public readonly c: bigint
  ) {}
}

class Ballot {
  public constructor (
    public readonly encryptedChoice: MultiCiphertext,
    public readonly proofOfKnowledgeOfEncryptionCoins: Proof[],
    public readonly proofOfKnowledgeOfPrivateCredential: Proof) {
    throwIfNotPresent(encryptedChoice, proofOfKnowledgeOfEncryptionCoins, proofOfKnowledgeOfPrivateCredential)
  }

  public static fromJson (ballotJson: any): Ballot {
    const choice = MultiCiphertext.fromJson(ballotJson.encryptedChoice)
    const coinProofs = new Array<Proof>()
    const credProof = Proof.fromJson(ballotJson.proofOfKnowledgeOfPrivateCredential)
    for (const proof of ballotJson.proofOfKnowledgeOfEncryptionCoins) {
      coinProofs.push(Proof.fromJson(proof))
    }
    return new Ballot(choice, coinProofs, credProof)
  }
}

abstract class Core3Ballot {
  public readonly type
  public constructor (type: string) {
    this.type = type
  }

  public static fromJson (ballotJson: any): Core3Ballot {
    return Core3StandardBallot.fromJson(ballotJson)
  }
}

class Core3StandardBallot extends Core3Ballot {
  private static readonly typeStandard = 'STANDARD_BALLOT'
  public constructor (
    public readonly id: string,
    public readonly lists: CandidateList[],
    public readonly showAbstainOption: boolean,
    public readonly showInvalidOption: boolean,
    public readonly title: I18n<string>,
    public readonly colorSchema?: string,
    public readonly contentAbove?: Content,
    public readonly contentBelow?: Content,
    public readonly externalIdentification?: string) {
    super(Core3StandardBallot.typeStandard)
    throwIfNotPresent(id, lists, showAbstainOption, showInvalidOption, title)
  }

  public static fromJson (ballotJson: any): Core3StandardBallot {
    const lists = new Array<CandidateList>()
    const title = I18n.fromJson<string>(ballotJson.title, 'string')
    const contentAbove = ballotJson.contentAbove !== undefined ? Content.generateContentFromJson(ballotJson.contentAbove) : undefined
    const contentBelow = ballotJson.contentBelow !== undefined ? Content.generateContentFromJson(ballotJson.contentBelow) : undefined
    for (const list of ballotJson.lists) {
      lists.push(CandidateList.fromJson(list))
    }
    return new Core3StandardBallot(ballotJson.id as string, lists, ballotJson.showAbstainOption as boolean,
      ballotJson.showInvalidOption as boolean, title, ballotJson.colorSchema as string, contentAbove, contentBelow,
      ballotJson.externalIdentification as string)
  }
}

class CandidateList {
  public constructor (
    public readonly candidates: CandidateSpec[],
    public readonly columnHeaders: Array<I18n<any>>,
    public readonly id: string,
    public readonly maxVotesForList: number,
    public readonly columnProperties?: ColumnProperties[],
    public readonly contentAbove?: Content,
    public readonly derivedListVotes?: DerivedListVotesSpecVariant, // DO we need this here?
    public readonly externalIdentification?: string,
    public readonly title?: I18n<string>) {
    throwIfNotPresent(candidates, columnHeaders, id)
  }

  public static fromJson (listJson: any): CandidateList {
    const candidates = new Array<CandidateSpec>()
    const columnHeaders = new Array<I18n<any>>()
    let columnProperties: ColumnProperties[] | undefined
    let contentAbove: Content | undefined
    let derivedListVotes: DerivedListVotesSpecVariant | undefined
    for (const cand of listJson.candidates) {
      candidates.push(CandidateSpec.fromJson(cand))
    }
    for (const header of listJson.columnHeaders) {
      columnHeaders.push(I18n.fromJsonGeneric(header))
    }

    if (listJson.columnProperties !== undefined) {
      columnProperties = new Array<ColumnProperties>()
      for (const prop of listJson.columnProperties) {
        columnProperties.push(ColumnProperties.fromJson(prop))
      }
    }
    if (listJson.contentAbove !== undefined) {
      contentAbove = Content.generateContentFromJson(listJson.contentAbove)
    }
    if (listJson.derivedListVotes !== undefined) {
      derivedListVotes = listJson.derivedListVotes
    }
    const title = listJson.title !== undefined ? I18n.fromJson<string>(listJson.title, 'string') : undefined
    return new CandidateList(candidates, columnHeaders, listJson.id as string, listJson.maxVotesForList as number,
      columnProperties, contentAbove, derivedListVotes, listJson.externalIdentification as string, title)
  }
}

class CandidateSpec {
  public constructor (
    public readonly columns: Content[],
    public readonly id: string,
    public readonly maxVotes,
    public readonly externalIdentification?: string,
    public readonly writeInSize?: number) {
    throwIfNotPresent(columns, id)
  }

  public static fromJson (candJson: any): CandidateSpec {
    const columns = new Array<Content>()
    for (const columnJson of candJson.columns) {
      columns.push(Content.generateContentFromJson(columnJson))
    }
    return new CandidateSpec(columns, candJson.id as string, candJson.maxVotes as number,
      candJson.externalIdentification as string, candJson.writeInSize as number)
  }
}

class ColumnProperties {
  public constructor (public readonly hide: boolean) {
    throwIfNotPresent(hide)
  }

  public static fromJson (propertyJson: any): ColumnProperties {
    return new ColumnProperties(propertyJson.hide as boolean)
  }
}

type DerivedListVotesSpecVariant = 'EACH_VOTE_COUNTS' | 'AT_MOST_ONE'

export { Ciphertext, MultiCiphertext, Proof, Ballot, Core3Ballot, CandidateList, CandidateSpec, ColumnProperties, type DerivedListVotesSpecVariant, SecretProof, Core3StandardBallot }
