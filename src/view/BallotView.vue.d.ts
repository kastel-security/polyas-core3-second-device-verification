import { type Core3StandardBallot } from '../classes/ballot';
import { type Language } from '../classes/basics';
declare const _default: import("vue").DefineComponent<{
    ballot: {
        type: import("vue").PropType<Core3StandardBallot>;
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
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    ballot: {
        type: import("vue").PropType<Core3StandardBallot>;
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
}>>, {}, {}>;
export default _default;
