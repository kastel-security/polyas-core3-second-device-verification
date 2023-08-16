import { I18n, ImageRef, Language } from "../classes/basics"
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

export function extractImage(image: I18n<ImageRef>, language: Language|undefined): ImageRef {
    if (image && language && image.value.has(language)) {
        return image.value.get(language)!
    } else {
        return image.default
    }
}

export enum State {
    LOGIN,
    ERROR,
    VERIFIED
}