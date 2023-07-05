
function createGenericClassFromJson<T>(json: any, ttype: string) {
    switch(ttype) {
        case "string":
            json as string
        case "document":
            return CustomDocument.fromJson(json)
        case "image":
            return ImageRef.fromJson(json)
    }
}

function throwIfNotPresent(...args: any) {
    for (let arg of args) {
        if (typeof arg[Symbol.iterator] === 'function') {
            for (let entry of arg) {
                throwIfNotPresent(entry)
            }
        } else {
            if (!arg) {
                throw new Error("Argument must not be undefined")
            }
        }
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
    public constructor(
        public readonly data: Map<String, String>,
        public readonly nodes: Array<String>,
        public readonly object: ObjectType
    ) {
        throwIfNotPresent(data, nodes, object)
    }
    public static fromJson(documentJson: any) {
        let data = documentJson.data as Map<String, String>
        let nodes = documentJson.nodes as Array<String>
        let object = ObjectType[documentJson.object]
        if (object != ObjectType.DOCUMENT) {
            throw new Error("Invalid object type")
        }
        return new CustomDocument(data, nodes, object)
    }
}

class ImageRef {
    public constructor(    
        public readonly alt: String,
        public readonly hash: String,
        public readonly url: String) {
            throwIfNotPresent(alt, hash, url)
        }
    public static fromJson(refJson: any): ImageRef {
        return new ImageRef(refJson.alt as String, refJson.hash as String, refJson.url as String)
    }
}

abstract class Content {
    public constructor(
        public readonly value: I18n<any>,
        public readonly contentType: String
    ) {
        throwIfNotPresent(value, contentType)
    }
    public static generateContentFromJson(contentJson: any): Content {
        switch(contentJson.value) {
            case "TEXT": return ContentText.fromJson(contentJson)
            case "RICH_TEXT": return ContentRichText.fromJson(contentJson)
        }
        throw new Error("Unknown type of content")
    }
}

class ContentText extends Content {
    public constructor(value: I18n<String>) {
        super(value, "TEXT")
    }
    public static fromJson(contentJson: any) {
        return new ContentText(I18n.fromJson<String>(contentJson.value, "string"))
    }
}

class ContentRichText extends Content {
    public constructor(value: I18n<CustomDocument>) {
        super(value, "RICH_TEXT")
    }
    public static fromJson(contentJson: any) {
        return new ContentRichText(I18n.fromJson<CustomDocument>(contentJson.value, "document"))
    }
}

class I18n<T> {
    private static readonly validTypes = ["document", "image", "text"] // Have to be in an order such that for type i, all types j<i fail
    public constructor(
        private readonly defaultInt: T,
        public readonly value: Map<Language, T>
    ) {
        throwIfNotPresent(defaultInt, value)
    }
    public static fromJson<T>(i18nJson: any, ttype: string): I18n<T> {
        let defaultIn = createGenericClassFromJson<T>(i18nJson.default, ttype)
        let value = new Map<Language, T>()
        const valueMap: Map<string, string> = i18nJson.value as Map<string, string>
        for (var language in valueMap.keys()) {
            var lang = Language[language]
            value.set(lang, createGenericClassFromJson<T>(valueMap.get(language), ttype) as T)
        }
        return new I18n<T>(defaultIn as T, value)
    } 
    public static fromJsonGeneric(i18nJson: any): I18n<any> {
        for (let type in I18n.validTypes) {
            try {
                return I18n.fromJson(i18nJson, type)
            } catch {
                //try next type
            }
        }
        throw new Error("Could not be parsed to I18n")
    }
    public get default() {
        return this.defaultInt
    }
}


export {ImageRef, Content, I18n, Language, CustomDocument, throwIfNotPresent}