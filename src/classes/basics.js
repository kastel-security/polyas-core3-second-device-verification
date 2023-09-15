import { GenericNode } from './nodes';
function createGenericClassFromJson(json, ttype) {
    switch (ttype) {
        case 'string':
            return json;
        case 'document':
            return CustomDocument.fromJson(json);
        case 'image':
            return ImageRef.fromJson(json);
        default:
            throw new Error('Type is not recognized' + ttype);
    }
}
function throwIfNotPresent(...args) {
    for (const arg of args) {
        if (arg instanceof Map || arg instanceof Set || arg instanceof Array) {
            for (const entry of arg) {
                throwIfNotPresent(entry);
            }
        }
        else {
            if (arg === undefined) {
                throw new Error('Argument must not be undefined');
            }
        }
    }
}
class CustomDocument {
    data;
    nodes;
    object;
    constructor(data, nodes, object) {
        this.data = data;
        this.nodes = nodes;
        this.object = object;
        throwIfNotPresent(data, nodes, object);
    }
    static fromJson(documentJson) {
        const data = new Map(Object.entries(documentJson.data).map(([key, val]) => [key, val]));
        const nodes = new Array(...Object.entries(documentJson.nodes).map(([key, val]) => GenericNode.generateNodeFromJson(val)));
        const object = documentJson.object;
        if (object !== 'document') {
            throw new Error('Invalid object type');
        }
        return new CustomDocument(data, nodes, object);
    }
}
class ImageRef {
    alt;
    hash;
    url;
    constructor(alt, hash, url) {
        this.alt = alt;
        this.hash = hash;
        this.url = url;
        throwIfNotPresent(alt, hash, url);
    }
    static fromJson(refJson) {
        return new ImageRef(refJson.alt, refJson.hash, refJson.url);
    }
}
class Content {
    value;
    contentType;
    constructor(value, contentType) {
        this.value = value;
        this.contentType = contentType;
        throwIfNotPresent(value, contentType);
    }
    static generateContentFromJson(contentJson) {
        switch (contentJson.contentType) {
            case 'TEXT': return ContentText.fromJson(contentJson);
            case 'RICH_TEXT': return ContentRichText.fromJson(contentJson);
        }
        throw new Error('Unknown type of content');
    }
}
class ContentText extends Content {
    constructor(value) {
        super(value, 'TEXT');
    }
    static fromJson(contentJson) {
        return new ContentText(I18n.fromJson(contentJson.value, 'string'));
    }
}
class ContentRichText extends Content {
    constructor(value) {
        super(value, 'RICH_TEXT');
    }
    static fromJson(contentJson) {
        return new ContentRichText(I18n.fromJson(contentJson.value, 'document'));
    }
}
class I18n {
    defaultInt;
    value;
    static validTypes = ['document', 'image', 'string']; // Have to be in an order such that for type i, all types j<i fail
    constructor(defaultInt, value) {
        this.defaultInt = defaultInt;
        this.value = value;
        throwIfNotPresent(defaultInt, value);
    }
    static fromJson(i18nJson, ttype) {
        const defaultIn = createGenericClassFromJson(i18nJson.default, ttype);
        const value = new Map(Object.entries(i18nJson.value).map(([key, val]) => [key, createGenericClassFromJson(val, ttype)]));
        return new I18n(defaultIn, value);
    }
    static fromJsonGeneric(i18nJson) {
        for (const type of I18n.validTypes) {
            try {
                return I18n.fromJson(i18nJson, type);
            }
            catch (e) {
                // try next type
            }
        }
        throw new Error('Could not be parsed to I18n');
    }
    get default() {
        return this.defaultInt;
    }
}
export { ImageRef, Content, ContentText, ContentRichText, I18n, CustomDocument, throwIfNotPresent };
