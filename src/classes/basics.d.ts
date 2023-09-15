import { GenericNode } from './nodes';
declare function throwIfNotPresent(...args: any): void;
type Language = 'DE' | 'EN' | 'FR' | 'FI' | 'IT' | 'PL' | 'NL' | 'CZ' | 'ES' | 'NO' | 'DK' | 'ROU' | 'SVK' | 'SE' | 'RU' | 'HU' | 'AR';
type ObjectType = 'document' | 'block' | 'inline' | 'text';
declare class CustomDocument {
    readonly data: Map<string, string>;
    readonly nodes: GenericNode[];
    readonly object: ObjectType;
    constructor(data: Map<string, string>, nodes: GenericNode[], object: ObjectType);
    static fromJson(documentJson: any): CustomDocument;
}
declare class ImageRef {
    readonly alt: string;
    readonly hash: string;
    readonly url: string;
    constructor(alt: string, hash: string, url: string);
    static fromJson(refJson: any): ImageRef;
}
declare abstract class Content {
    readonly value: I18n<any>;
    readonly contentType: string;
    constructor(value: I18n<any>, contentType: string);
    static generateContentFromJson(contentJson: any): Content;
}
declare class ContentText extends Content {
    constructor(value: I18n<string>);
    static fromJson(contentJson: any): ContentText;
}
declare class ContentRichText extends Content {
    constructor(value: I18n<CustomDocument>);
    static fromJson(contentJson: any): ContentRichText;
}
declare class I18n<T> {
    private readonly defaultInt;
    readonly value: Map<Language, T>;
    private static readonly validTypes;
    constructor(defaultInt: T, value: Map<Language, T>);
    static fromJson<T>(i18nJson: any, ttype: string): I18n<T>;
    static fromJsonGeneric(i18nJson: any): I18n<any>;
    get default(): T;
}
export { ImageRef, Content, ContentText, ContentRichText, I18n, type Language, CustomDocument, throwIfNotPresent };
