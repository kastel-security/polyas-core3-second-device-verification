import { GenericNode } from './nodes'

function createGenericClassFromJson<T> (json: any, ttype: string): T {
  switch (ttype) {
    case 'string':
      return json as string as any as T
    case 'document':
      return CustomDocument.fromJson(json) as any as T
    case 'image':
      return ImageRef.fromJson(json) as any as T
    default:
      throw new Error('Type is not recognized' + ttype)
  }
}

function throwIfNotPresent (...args: any): void {
  for (const arg of args) {
    if (arg instanceof Map || arg instanceof Set || arg instanceof Array) {
      for (const entry of arg) {
        throwIfNotPresent(entry)
      }
    } else {
      if (arg === undefined) {
        throw new Error('Argument must not be undefined')
      }
    }
  }
}

type Language = 'DE' | 'EN' | 'FR' | 'FI' | 'IT' | 'PL' | 'NL' | 'CZ' | 'ES' | 'NO' | 'DK' | 'ROU' | 'SVK' | 'SE' | 'RU' | 'HU' | 'AR'

type ObjectType = 'document' | 'block' | 'inline' | 'text'

class CustomDocument {
  public constructor (
    public readonly data: Map<string, string>,
    public readonly nodes: GenericNode[],
    public readonly object: ObjectType
  ) {
    throwIfNotPresent(data, nodes, object)
  }

  public static fromJson (documentJson: any): CustomDocument {
    const data = new Map(Object.entries(documentJson.data).map(([key, val]) => [key, val as string]))
    const nodes = new Array<GenericNode>(
      ...Object.entries(documentJson.nodes).map(([key, val]) => GenericNode.generateNodeFromJson(val))
    )
    const object: ObjectType = documentJson.object as ObjectType
    if (object !== 'document') {
      throw new Error('Invalid object type')
    }
    return new CustomDocument(data, nodes, object)
  }
}

class ImageRef {
  public constructor (
    public readonly alt: string,
    public readonly hash: string,
    public readonly url: string) {
    throwIfNotPresent(alt, hash, url)
  }

  public static fromJson (refJson: any): ImageRef {
    return new ImageRef(refJson.alt as string, refJson.hash as string, refJson.url as string)
  }
}

abstract class Content {
  public constructor (
    public readonly value: I18n<any>,
    public readonly contentType: string
  ) {
    throwIfNotPresent(value, contentType)
  }

  public static generateContentFromJson (contentJson: any): Content {
    switch (contentJson.contentType) {
      case 'TEXT': return ContentText.fromJson(contentJson)
      case 'RICH_TEXT': return ContentRichText.fromJson(contentJson)
    }
    throw new Error('Unknown type of content')
  }
}

class ContentText extends Content {
  public constructor (value: I18n<string>) {
    super(value, 'TEXT')
  }

  public static fromJson (contentJson: any): ContentText {
    return new ContentText(I18n.fromJson<string>(contentJson.value, 'string'))
  }
}

class ContentRichText extends Content {
  public constructor (value: I18n<CustomDocument>) {
    super(value, 'RICH_TEXT')
  }

  public static fromJson (contentJson: any): ContentRichText {
    return new ContentRichText(I18n.fromJson<CustomDocument>(contentJson.value, 'document'))
  }
}

class I18n<T> {
  private static readonly validTypes = ['document', 'image', 'string'] // Have to be in an order such that for type i, all types j<i fail
  public constructor (
    private readonly defaultInt: T,
    public readonly value: Map<Language, T>
  ) {
    throwIfNotPresent(defaultInt, value)
  }

  public static fromJson<T>(i18nJson: any, ttype: string): I18n<T> {
    const defaultIn = createGenericClassFromJson<T>(i18nJson.default, ttype)
    const value = new Map<Language, T>(
      Object.entries(i18nJson.value).map(([key, val]) => [key as Language, createGenericClassFromJson<T>(val, ttype)]))
    return new I18n<T>(defaultIn, value)
  }

  public static fromJsonGeneric (i18nJson: any): I18n<any> {
    for (const type of I18n.validTypes) {
      try {
        return I18n.fromJson(i18nJson, type)
      } catch (e) {
        // try next type
      }
    }
    throw new Error('Could not be parsed to I18n')
  }

  public get default (): T {
    return this.defaultInt
  }
}

export { ImageRef, Content, ContentText, ContentRichText, I18n, type Language, CustomDocument, throwIfNotPresent }
