import { I18n, type Language } from '../classes/basics'

export function extractTextFromJson (text: any, language: Language | undefined): string {
  return extractText(I18n.fromJson<string>(text, 'string'), language)
}

export function extractText (text: I18n<string> | undefined, language: Language | undefined): string {
  if (text !== undefined && language !== undefined && text.value.has(language)) {
    return text.value.get(language) as string
  } else if (text !== undefined) {
    return text.default
  } else {
    return ''
  }
}

export function extractGeneric<T> (data: I18n<T>, language: Language | undefined): T {
  if (language !== undefined && data.value.has(language)) {
    return data.value.get(language) as T
  } else {
    return data.default
  }
}

export enum State {
  LOADING,
  LOGIN,
  ERROR,
  VERIFIED,
  SUCCESS
}
