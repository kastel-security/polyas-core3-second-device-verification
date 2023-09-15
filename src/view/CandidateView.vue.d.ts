import { type Language } from '../classes/basics';
import { type CandidateSpec, type ColumnProperties } from '../classes/ballot';
declare const _default: import("vue").DefineComponent<{
    candidate: {
        type: import("vue").PropType<CandidateSpec>;
        required: true;
    };
    language: {
        type: import("vue").PropType<Language | undefined>;
        required: true;
    };
    result: {
        type: import("vue").PropType<Uint8Array>;
        required: true;
    };
    headerLength: {
        type: import("vue").PropType<number>;
        required: true;
    };
    properties: {
        type: import("vue").PropType<ColumnProperties[]>;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    candidate: {
        type: import("vue").PropType<CandidateSpec>;
        required: true;
    };
    language: {
        type: import("vue").PropType<Language | undefined>;
        required: true;
    };
    result: {
        type: import("vue").PropType<Uint8Array>;
        required: true;
    };
    headerLength: {
        type: import("vue").PropType<number>;
        required: true;
    };
    properties: {
        type: import("vue").PropType<ColumnProperties[]>;
    };
}>>, {}, {}>;
export default _default;
