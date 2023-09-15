import { I18n } from '../classes/basics';
export function extractTextFromJson(text, language) {
    return extractText(I18n.fromJson(text, 'string'), language);
}
export function extractText(text, language) {
    console.log(language, text?.value.keys());
    if (text !== undefined && language !== undefined && text.value.has(language)) {
        return text.value.get(language);
    }
    else if (text !== undefined) {
        return text.default;
    }
    else {
        return '';
    }
}
export function extractGeneric(data, language) {
    if (language !== undefined && data.value.has(language)) {
        return data.value.get(language);
    }
    else {
        return data.default;
    }
}
export var State;
(function (State) {
    State[State["LOADING"] = 0] = "LOADING";
    State[State["LOGIN"] = 1] = "LOGIN";
    State[State["ERROR"] = 2] = "ERROR";
    State[State["VERIFIED"] = 3] = "VERIFIED";
})(State || (State = {}));
