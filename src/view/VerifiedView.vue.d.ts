import { type Language } from '../classes/basics';
import { type SecondDeviceLoginResponse } from '../classes/communication';
declare const _default: import("vue").DefineComponent<{
    loginResponse: {
        type: import("vue").PropType<SecondDeviceLoginResponse>;
        required: true;
    };
    result: {
        type: import("vue").PropType<Uint8Array>;
        required: true;
    };
    language: {
        type: import("vue").PropType<Language | undefined>;
        required: true;
    };
    receiptText: {
        type: import("vue").PropType<string[]>;
        required: true;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    loginResponse: {
        type: import("vue").PropType<SecondDeviceLoginResponse>;
        required: true;
    };
    result: {
        type: import("vue").PropType<Uint8Array>;
        required: true;
    };
    language: {
        type: import("vue").PropType<Language | undefined>;
        required: true;
    };
    receiptText: {
        type: import("vue").PropType<string[]>;
        required: true;
    };
}>>, {}, {}>;
export default _default;
