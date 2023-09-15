declare abstract class GenericNode {
    readonly object: any;
    constructor(object: any);
    static generateNodeFromJson(nodeJson: any): GenericNode;
}
declare class NodeBlock extends GenericNode {
    readonly data: Map<string, string>;
    readonly nodes: GenericNode[];
    readonly type: string;
    static readonly object = "block";
    constructor(data: Map<string, string>, nodes: GenericNode[], type: string);
    static fromJson(nodeJson: any): GenericNode;
}
declare class NodeInline extends GenericNode {
    readonly data: Map<string, string>;
    readonly nodes: GenericNode[];
    readonly type: string;
    static readonly object = "inline";
    constructor(data: Map<string, string>, nodes: GenericNode[], type: string);
    static fromJson(nodeJson: any): GenericNode;
}
declare class NodeMark {
    readonly data: Map<string, string>;
    readonly object: string;
    readonly type: string;
    constructor(data: Map<string, string>, object: string, type: string);
    static fromJson(nodeJson: any): NodeMark;
}
declare class NodeText extends GenericNode {
    readonly marks: Set<NodeMark>;
    readonly text: string;
    static readonly object: string;
    constructor(marks: Set<NodeMark>, text: string);
    static fromJson(nodeJson: any): NodeText;
}
export { GenericNode, NodeBlock, NodeInline, NodeText, NodeMark };
