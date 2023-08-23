import { ContentRichText, I18n, ImageRef, Language } from "../classes/basics"
import * as text from "./text.json"

export function extractTextFromJson(text: any, language: Language|undefined): string {
    return extractText(I18n.fromJson<string>(text, "string"), language)
  }

export function extractText(text: I18n<string> | undefined, language: Language|undefined): string {
    console.log(language, text?.value.keys())
    if (text && language && text.value.has(language)) {
        return text.value.get(language)!
    } else if(text) {
        return text.default
    } else {
        return ""
    }
}

export function extractGeneric<T>(data: I18n<T>, language: Language|undefined): T {
    if (language && data.value.has(language)) {
        return data.value.get(language)!
    } else {
        return data.default
    }
}


export enum State {
    LOADING,
    LOGIN,
    ERROR,
    VERIFIED
}