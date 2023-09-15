import { ErrorType } from '../main/error';
import { type Language } from '../classes/basics';
declare const _default: import("vue").DefineComponent<{
    errorType: {
        type: import("vue").PropType<ErrorType>;
        required: true;
    };
    language: {
        type: import("vue").PropType<Language | undefined>;
        required: true;
    };
    message: {
        type: import("vue").PropType<string>;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "reset"[], "reset", import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    errorType: {
        type: import("vue").PropType<ErrorType>;
        required: true;
    };
    language: {
        type: import("vue").PropType<Language | undefined>;
        required: true;
    };
    message: {
        type: import("vue").PropType<string>;
    };
}>> & {
    onReset?: ((...args: any[]) => any) | undefined;
}, {}, {}>;
export default _default;
