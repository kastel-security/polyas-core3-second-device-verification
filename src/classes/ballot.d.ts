import { Content, I18n } from './basics';
declare class Ciphertext {
    readonly x: bigint;
    readonly y: bigint;
    constructor(x: bigint, y: bigint);
    static fromJson(cipherJson: any): Ciphertext;
}
declare class MultiCiphertext {
    readonly ciphertexts: Ciphertext[];
    readonly auxData?: Map<string, string> | undefined;
    constructor(ciphertexts: Ciphertext[], auxData?: Map<string, string> | undefined);
    static fromJson(cipherJson: any): MultiCiphertext;
}
declare class Proof {
    readonly c: bigint;
    readonly f: bigint;
    constructor(c: bigint, f: bigint);
    static fromJson(cipherJson: any): Proof;
}
declare class SecretProof {
    readonly e: bigint;
    readonly r: bigint;
    readonly c: bigint;
    constructor(e: bigint, // random number
    r: bigint, // random number
    c: bigint);
}
declare class Ballot {
    readonly encryptedChoice: MultiCiphertext;
    readonly proofOfKnowledgeOfEncryptionCoins: Proof[];
    readonly proofOfKnowledgeOfPrivateCredential: Proof;
    constructor(encryptedChoice: MultiCiphertext, proofOfKnowledgeOfEncryptionCoins: Proof[], proofOfKnowledgeOfPrivateCredential: Proof);
    static fromJson(ballotJson: any): Ballot;
}
declare abstract class Core3Ballot {
    readonly type: any;
    constructor(type: string);
    static fromJson(ballotJson: any): Core3Ballot;
}
declare class Core3StandardBallot extends Core3Ballot {
    readonly id: string;
    readonly lists: CandidateList[];
    readonly showAbstainOption: boolean;
    readonly showInvalidOption: boolean;
    readonly title: I18n<string>;
    readonly colorSchema?: string | undefined;
    readonly contentAbove?: Content | undefined;
    readonly contentBelow?: Content | undefined;
    readonly externalIdentification?: string | undefined;
    private static readonly typeStandard;
    constructor(id: string, lists: CandidateList[], showAbstainOption: boolean, showInvalidOption: boolean, title: I18n<string>, colorSchema?: string | undefined, contentAbove?: Content | undefined, contentBelow?: Content | undefined, externalIdentification?: string | undefined);
    static fromJson(ballotJson: any): Core3StandardBallot;
}
declare class CandidateList {
    readonly candidates: CandidateSpec[];
    readonly columnHeaders: Array<I18n<any>>;
    readonly id: string;
    readonly maxVotesForList: number;
    readonly columnProperties?: ColumnProperties[] | undefined;
    readonly contentAbove?: Content | undefined;
    readonly derivedListVotes?: DerivedListVotesSpecVariant | undefined;
    readonly externalIdentification?: string | undefined;
    readonly title?: I18n<string> | undefined;
    constructor(candidates: CandidateSpec[], columnHeaders: Array<I18n<any>>, id: string, maxVotesForList: number, columnProperties?: ColumnProperties[] | undefined, contentAbove?: Content | undefined, derivedListVotes?: DerivedListVotesSpecVariant | undefined, // DO we need this here?
    externalIdentification?: string | undefined, title?: I18n<string> | undefined);
    static fromJson(listJson: any): CandidateList;
}
declare class CandidateSpec {
    readonly columns: Content[];
    readonly id: string;
    readonly maxVotes: any;
    readonly externalIdentification?: string | undefined;
    readonly writeInSize?: number | undefined;
    constructor(columns: Content[], id: string, maxVotes: any, externalIdentification?: string | undefined, writeInSize?: number | undefined);
    static fromJson(candJson: any): CandidateSpec;
}
declare class ColumnProperties {
    readonly hide: boolean;
    constructor(hide: boolean);
    static fromJson(propertyJson: any): ColumnProperties;
}
type DerivedListVotesSpecVariant = 'EACH_VOTE_COUNTS' | 'AT_MOST_ONE';
export { Ciphertext, MultiCiphertext, Proof, Ballot, Core3Ballot, CandidateList, CandidateSpec, ColumnProperties, type DerivedListVotesSpecVariant, SecretProof, Core3StandardBallot };
