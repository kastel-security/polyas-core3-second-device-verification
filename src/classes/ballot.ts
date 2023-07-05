import {Content, I18n, throwIfNotPresent} from "./basics"
class Ciphertext {
    public constructor(    
        public readonly x: bigint,
        public readonly y: bigint) {
            throwIfNotPresent(x, y)
        }
    public static fromJson(cipherJson: any) {
        return new Ciphertext(BigInt("0x" + cipherJson.x), BigInt("0x" + cipherJson.y))
    }
}

class MultiCiphertext {
    public constructor(
        public readonly ciphertexts: Array<Ciphertext>,
        public readonly auxData?: Map<String, String>) {
            throwIfNotPresent(ciphertexts)
        }
    public static fromJson(cipherJson: any) {
        let ciphertexts = new Array<Ciphertext>()
        let auxData = new Map<String, String>()
        for (let ciphertext in cipherJson) {
            ciphertexts.push(Ciphertext.fromJson(cipherJson))
        }
        for (let aux in cipherJson.auxData.keys) {
            auxData.set(aux as String, cipherJson.auxData.get(aux))
        }
        return new MultiCiphertext(ciphertexts, auxData)
    }
}

class Proof {
    public constructor(    
        public readonly c: bigint,
        public readonly f: bigint) {
            throwIfNotPresent(c, f)
        }
    public static fromJson(cipherJson: any) {
        return new Proof(BigInt("0x" + cipherJson.c), BigInt("0x" + cipherJson.f))
    }
}

class Ballot {
    public constructor(    
        public readonly encryptedChoice: MultiCiphertext,
        public readonly proofOfKnowledgeOfEncryptionCoins: Array<Proof>,
        public readonly proofOfKnowledgeOfPrivateCredential: Proof) {
            throwIfNotPresent(encryptedChoice, proofOfKnowledgeOfEncryptionCoins, proofOfKnowledgeOfPrivateCredential)
        }
        public static fromJson(ballotJson) {
            let choice = MultiCiphertext.fromJson(ballotJson.encryptedChoice)
            let coinProofs = new Array<Proof>()
            let credProof = Proof.fromJson(ballotJson.proofOfKnowledgeOfPrivateCredential)
            for (let proof in ballotJson.proofOfKnowledgeOfEncryptionCoins) {
                coinProofs.push(Proof.fromJson(proof))
            }
            return new Ballot(choice, coinProofs, credProof)
        }
}

abstract class Core3Ballot {
    public static fromJson(ballotJson): Core3Ballot {
        return Core3StandardBallot.fromJson(ballotJson)
    }
}

class Core3StandardBallot extends Core3Ballot{
    public readonly type = "STANDARD_BALLOT"
    public constructor(
    public readonly id: String,
    public readonly lists: Array<CandidateList>,
    public readonly showAbstainOption: boolean,
    public readonly showInvalidOption: boolean,
    public readonly title: I18n<String>,
    public readonly colorSchema?: String,
    public readonly contentAbove?: Content,
    public readonly contentBelow?: Content,
    public readonly externalIdentification?: String) {
        super()
        throwIfNotPresent(id, lists, showAbstainOption, showInvalidOption, title)
    }

    public static fromJson(ballotJson: any) {
        let lists = new Array<CandidateList>()
        let title = I18n.fromJson<String>(ballotJson.title, "string")
        let contentAbove = ballotJson.contentAbove != undefined ? Content.generateContentFromJson(ballotJson.contentAbove) : undefined
        let contentBelow = ballotJson.contentBelow != undefined ? Content.generateContentFromJson(ballotJson.contentBelow) : undefined
        for (let list in ballotJson.lists) {
            lists.push(CandidateList.fromJson(list))
        }
        return new Core3StandardBallot(ballotJson.id as String, lists, ballotJson.showAbstainOption as boolean,
            ballotJson.showInvalidOption as boolean, title, ballotJson.colorSchema as String, contentAbove, contentBelow,
             ballotJson.externalIdentification as String)
    }


}

class CandidateList {
    public constructor(
        public readonly candidates: Array<CandidateSpec>,
        public readonly columnHeaders: Array<I18n<any>>,
        public readonly id: String,
        public readonly columnProperties?: Array<ColumnProperties>,
        public readonly contentAbove?: Content,
        public readonly derivedListVotes?: DerivedListVotesSpecVariant, //DO we need this here?
        public readonly externalIdentification?: String,
        public readonly title?: String) {
            throwIfNotPresent(candidates, columnHeaders, id)
        }

    public static fromJson(listJson) {
        let candidates = new Array<CandidateSpec>
        let columnHeaders = new Array<I18n<any>>()
        let columnProperties: Array<ColumnProperties>|undefined = undefined
        let contentAbove: Content|undefined = undefined
        let derivedListVotes: DerivedListVotesSpecVariant|undefined = undefined
        for (let cand in listJson.candidates) {
            candidates.push(CandidateSpec.fromJson(cand))
        }
        for (let header in listJson.columnHeaders) {
            columnHeaders.push(I18n.fromJsonGeneric(listJson.columnHeaders))
        }

        if (listJson.columnProperties != undefined) {
            columnProperties = new Array<ColumnProperties>()
            for (let prop in listJson.coulmProperties) {
                columnProperties.push(ColumnProperties.fromJson(prop))
            }
        }
        if (listJson.contentAbove != undefined) {
            contentAbove = Content.generateContentFromJson(listJson.contentAbove)
        }
        if (listJson.derivedListVotes != undefined) {
            derivedListVotes = DerivedListVotesSpecVariant[listJson.derivedListVotes]
        }
        return new CandidateList(candidates, columnHeaders, listJson.id as String, columnProperties, 
            contentAbove, derivedListVotes, listJson.externalIdentification as String, listJson.title as String)
    }

}

class CandidateSpec {

    public constructor(    
        public readonly columns: Array<Content>,
        public readonly id: String,
        public readonly externalIdentification?: String,
        //TODO include validation rules?,
        public readonly writeInSize?: number) {
            throwIfNotPresent(columns, id)
        }
    public static fromJson(candJson: any): CandidateSpec {
        let columns = new Array<Content>()
        for (let columnJson in candJson.columns) {
            columns.push(Content.generateContentFromJson(columnJson))
        }
        return new CandidateSpec(columns, candJson.id as String, candJson.externalIdentification as String, candJson.writeInSize as number)
    }
}

class ColumnProperties {
    public constructor(public readonly hide: boolean) {
        throwIfNotPresent(hide)
    }
    public static fromJson(propertyJson: any) {
        return new ColumnProperties(propertyJson.hide as boolean)
    }
}

enum DerivedListVotesSpecVariant {
    EACH_VOTE_COUNTS = "EACH_VOTE_COUNTS",
    AT_MOST_ONE = "AT_MOST_ONE"
}


export{Ciphertext, MultiCiphertext, Proof, Ballot, Core3Ballot, CandidateList, CandidateSpec, ColumnProperties, DerivedListVotesSpecVariant}