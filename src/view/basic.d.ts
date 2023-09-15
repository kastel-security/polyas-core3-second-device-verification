import { I18n, type Language } from '../classes/basics';
export declare function extractTextFromJson(text: any, language: Language | undefined): string;
export declare function extractText(text: I18n<string> | undefined, language: Language | undefined): string;
export declare function extractGeneric<T>(data: I18n<T>, language: Language | undefined): T;
export declare enum State {
    LOADING = 0,
    LOGIN = 1,
    ERROR = 2,
    VERIFIED = 3
}
