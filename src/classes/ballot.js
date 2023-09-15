import { Content, I18n, throwIfNotPresent } from './basics';
class Ciphertext {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
        throwIfNotPresent(x, y);
    }
    static fromJson(cipherJson) {
        return new Ciphertext(BigInt('0x' + cipherJson.x), BigInt('0x' + cipherJson.y));
    }
}
class MultiCiphertext {
    ciphertexts;
    auxData;
    constructor(ciphertexts, auxData) {
        this.ciphertexts = ciphertexts;
        this.auxData = auxData;
        throwIfNotPresent(ciphertexts);
    }
    static fromJson(cipherJson) {
        const ciphertexts = new Array(...Object.entries(cipherJson.ciphertexts).map(([key, val]) => Ciphertext.fromJson(val)));
        const auxData = cipherJson.auxData !== undefined
            ? new Map(Object.entries(cipherJson.auxData).map(([key, val]) => [key, val]))
            : undefined;
        return new MultiCiphertext(ciphertexts, auxData);
    }
}
class Proof {
    c;
    f;
    constructor(c, f) {
        this.c = c;
        this.f = f;
        throwIfNotPresent(c, f);
    }
    static fromJson(cipherJson) {
        return new Proof(BigInt(cipherJson.c), BigInt(cipherJson.f));
    }
}
class SecretProof {
    e;
    r;
    c;
    constructor(e, // random number
    r, // random number
    c) {
        this.e = e;
        this.r = r;
        this.c = c;
    }
}
class Ballot {
    encryptedChoice;
    proofOfKnowledgeOfEncryptionCoins;
    proofOfKnowledgeOfPrivateCredential;
    constructor(encryptedChoice, proofOfKnowledgeOfEncryptionCoins, proofOfKnowledgeOfPrivateCredential) {
        this.encryptedChoice = encryptedChoice;
        this.proofOfKnowledgeOfEncryptionCoins = proofOfKnowledgeOfEncryptionCoins;
        this.proofOfKnowledgeOfPrivateCredential = proofOfKnowledgeOfPrivateCredential;
        throwIfNotPresent(encryptedChoice, proofOfKnowledgeOfEncryptionCoins, proofOfKnowledgeOfPrivateCredential);
    }
    static fromJson(ballotJson) {
        const choice = MultiCiphertext.fromJson(ballotJson.encryptedChoice);
        const coinProofs = new Array();
        const credProof = Proof.fromJson(ballotJson.proofOfKnowledgeOfPrivateCredential);
        for (const proof of ballotJson.proofOfKnowledgeOfEncryptionCoins) {
            coinProofs.push(Proof.fromJson(proof));
        }
        return new Ballot(choice, coinProofs, credProof);
    }
}
class Core3Ballot {
    type;
    constructor(type) {
        this.type = type;
    }
    static fromJson(ballotJson) {
        return Core3StandardBallot.fromJson(ballotJson);
    }
}
class Core3StandardBallot extends Core3Ballot {
    id;
    lists;
    showAbstainOption;
    showInvalidOption;
    title;
    colorSchema;
    contentAbove;
    contentBelow;
    externalIdentification;
    static typeStandard = 'STANDARD_BALLOT';
    constructor(id, lists, showAbstainOption, showInvalidOption, title, colorSchema, contentAbove, contentBelow, externalIdentification) {
        super(Core3StandardBallot.typeStandard);
        this.id = id;
        this.lists = lists;
        this.showAbstainOption = showAbstainOption;
        this.showInvalidOption = showInvalidOption;
        this.title = title;
        this.colorSchema = colorSchema;
        this.contentAbove = contentAbove;
        this.contentBelow = contentBelow;
        this.externalIdentification = externalIdentification;
        throwIfNotPresent(id, lists, showAbstainOption, showInvalidOption, title);
    }
    static fromJson(ballotJson) {
        const lists = new Array();
        const title = I18n.fromJson(ballotJson.title, 'string');
        const contentAbove = ballotJson.contentAbove !== undefined ? Content.generateContentFromJson(ballotJson.contentAbove) : undefined;
        const contentBelow = ballotJson.contentBelow !== undefined ? Content.generateContentFromJson(ballotJson.contentBelow) : undefined;
        for (const list of ballotJson.lists) {
            lists.push(CandidateList.fromJson(list));
        }
        return new Core3StandardBallot(ballotJson.id, lists, ballotJson.showAbstainOption, ballotJson.showInvalidOption, title, ballotJson.colorSchema, contentAbove, contentBelow, ballotJson.externalIdentification);
    }
}
class CandidateList {
    candidates;
    columnHeaders;
    id;
    maxVotesForList;
    columnProperties;
    contentAbove;
    derivedListVotes;
    externalIdentification;
    title;
    constructor(candidates, columnHeaders, id, maxVotesForList, columnProperties, contentAbove, derivedListVotes, // DO we need this here?
    externalIdentification, title) {
        this.candidates = candidates;
        this.columnHeaders = columnHeaders;
        this.id = id;
        this.maxVotesForList = maxVotesForList;
        this.columnProperties = columnProperties;
        this.contentAbove = contentAbove;
        this.derivedListVotes = derivedListVotes;
        this.externalIdentification = externalIdentification;
        this.title = title;
        throwIfNotPresent(candidates, columnHeaders, id);
    }
    static fromJson(listJson) {
        const candidates = new Array();
        const columnHeaders = new Array();
        let columnProperties;
        let contentAbove;
        let derivedListVotes;
        for (const cand of listJson.candidates) {
            candidates.push(CandidateSpec.fromJson(cand));
        }
        for (const header of listJson.columnHeaders) {
            columnHeaders.push(I18n.fromJsonGeneric(header));
        }
        if (listJson.columnProperties !== undefined) {
            columnProperties = new Array();
            for (const prop of listJson.columnProperties) {
                columnProperties.push(ColumnProperties.fromJson(prop));
            }
        }
        if (listJson.contentAbove !== undefined) {
            contentAbove = Content.generateContentFromJson(listJson.contentAbove);
        }
        if (listJson.derivedListVotes !== undefined) {
            derivedListVotes = listJson.derivedListVotes;
        }
        const title = listJson.title !== undefined ? I18n.fromJson(listJson.title, 'string') : undefined;
        return new CandidateList(candidates, columnHeaders, listJson.id, listJson.maxVotesForList, columnProperties, contentAbove, derivedListVotes, listJson.externalIdentification, title);
    }
}
class CandidateSpec {
    columns;
    id;
    maxVotes;
    externalIdentification;
    writeInSize;
    constructor(columns, id, maxVotes, externalIdentification, writeInSize) {
        this.columns = columns;
        this.id = id;
        this.maxVotes = maxVotes;
        this.externalIdentification = externalIdentification;
        this.writeInSize = writeInSize;
        throwIfNotPresent(columns, id);
    }
    static fromJson(candJson) {
        const columns = new Array();
        for (const columnJson of candJson.columns) {
            columns.push(Content.generateContentFromJson(columnJson));
        }
        return new CandidateSpec(columns, candJson.id, candJson.maxVotes, candJson.externalIdentification, candJson.writeInSize);
    }
}
class ColumnProperties {
    hide;
    constructor(hide) {
        this.hide = hide;
        throwIfNotPresent(hide);
    }
    static fromJson(propertyJson) {
        return new ColumnProperties(propertyJson.hide);
    }
}
export { Ciphertext, MultiCiphertext, Proof, Ballot, Core3Ballot, CandidateList, CandidateSpec, ColumnProperties, SecretProof, Core3StandardBallot };
