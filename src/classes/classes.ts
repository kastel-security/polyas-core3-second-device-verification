function sanitize(untrusted: any) {
    //TODO sinitize string/ map of strings
    var trusted = untrusted
    return trusted
}

function createGenericClassFromJson<T>(json: any, ttype: string) {
    switch(ttype) {
        case "string":
            return sanitize(json)
        case "document":
            return CustomDocument.fromJson(json)
    }
}

enum Language {
    DE = "DE",
    EN = "EN",
    FR = "FR",
    FI = "FI",
    IT = "IT",
    PL = "PL",
    NL = "NL",
    CZ = "CZ",
    ES = "ES",
    NO = "NO",
    DK = "DK",
    ROU = "ROU",
    SVK = "SVK",
    SE = "SE",
    RU = "RU",
    HU = "HU",
    AR = "AR"
}

enum ObjectType {
    DOCUMENT = "document",
    BLOCK = "block",
    INLINE = "inline",
    TEXT = "text"
}

class CustomDocument {
    public readonly data: Map<String, String>
    public readonly nodes: Array<String>
    public readonly object: ObjectType
    public constructor(data: Map<String, String>, nodes: Array<String>, object: ObjectType) {
        this.data = sanitize(data)
        this.nodes = sanitize(nodes)
        this.object = object
    }
    public static fromJson(documentJson: any) {
        let data = documentJson.data as Map<String, String>
        let nodes = documentJson.nodes as Array<String>
        let object = ObjectType[documentJson.object]
        if (object != ObjectType.DOCUMENT) {
            throw new Error("Invalid object type")
        }
    }
}

class ImageRef {
    public readonly alt: String
    public readonly hash: String
    public readonly url: String
    public constructor(alt: String, hash: String, url: String) {
        this.alt = alt
        this.hash = hash
        this.url = url
    }
    public static fromJson(refJson: any): ImageRef {
        return new ImageRef(refJson.alt, refJson.hash, refJson.url)
    }
}

abstract class Content<T> {
    value: I18n<T>
    contentType: string
}

class ContentText extends Content<String> {
    public constructor(value: I18n<String>) {
        super()
        this.value = value
        this.contentType = "TEXT"
    }
    public static fromJson(contentJson: any) {
        return new ContentText(I18n.fromJson<String>(contentJson.value, "string"))
    }
}

class ContentRichText extends Content<Document> {
    public constructor(value: I18n<Document>) {
        super()
        this.value = value
        this.contentType = "RICH_TEXT"
    }
    public static fromJson(contentJson: any) {
        return new ContentRichText(I18n.fromJson<Document>(contentJson.value, "document"))
    }
}

class I18n<T> {
    public readonly default: T
    public readonly value: Map<Language, T>
    public constructor(defaultIn: T, valueIn: Map<Language, T>) {
        this.default = defaultIn
        this.value = valueIn
    }
    public static fromJson<T>(i18nJson: any, ttype: string): I18n<T> {
        let defaultIn = createGenericClassFromJson<T>(i18nJson.default, ttype)
        let value = new Map<Language, T>
        const valueMap: Map<string, string> = i18nJson.value as Map<string, string>
        for (var language in valueMap.keys()) {
            var lang = Language[language]
            value.set(lang, createGenericClassFromJson<T>(valueMap.get(language), ttype))
        }
        return new I18n<T>(defaultIn, value)
    } 
}

class electionData {
    public readonly title: I18n<String>
    public readonly languages: Array<Language>
    public constructor(electionJson: any) {
        this.title = I18n.fromJson<String>(electionJson.title, "string")
        this.languages = new Array<Language>
        for (let lang in electionJson.languages) {
            this.languages.push(Language[lang])
        }
    }
}

class loginRequest {
    public constructor(public readonly voterId: string,
        public readonly password: string,
        public readonly nonce: string,
        public readonly challengeCommitment: string) {}
}

class loginResponse {
    public readonly allowInvalid: boolean
    public readonly ballotVoterId: string

}

export {sanitize}