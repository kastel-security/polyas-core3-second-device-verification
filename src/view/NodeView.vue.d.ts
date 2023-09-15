import { type GenericNode } from '../classes/nodes';
import { type Language } from '../classes/basics';
declare const _default: import("vue").DefineComponent<{
    node: {
        type: import("vue").PropType<GenericNode>;
        required: true;
    };
    language: {
        type: import("vue").PropType<Language | undefined>;
        required: true;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    node: {
        type: import("vue").PropType<GenericNode>;
        required: true;
    };
    language: {
        type: import("vue").PropType<Language | undefined>;
        required: true;
    };
}>>, {}, {}>;
export default _default;
