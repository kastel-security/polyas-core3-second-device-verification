import { throwIfNotPresent } from './basics';
class GenericNode {
    object;
    constructor(object) {
        this.object = object;
    }
    static generateNodeFromJson(nodeJson) {
        switch (nodeJson.object) {
            case 'block': return NodeBlock.fromJson(nodeJson);
            case 'inline': return NodeInline.fromJson(nodeJson);
            case 'text': return NodeText.fromJson(nodeJson);
        }
        throw new Error('Unknown type');
    }
}
class NodeBlock extends GenericNode {
    data;
    nodes;
    type;
    static object = 'block';
    constructor(data, nodes, type) {
        super(NodeBlock.object);
        this.data = data;
        this.nodes = nodes;
        this.type = type;
        throwIfNotPresent(data, nodes, type);
    }
    static fromJson(nodeJson) {
        const data = new Map();
        const nodes = new Array();
        for (const key of nodeJson.keys) {
            data.set(key, nodeJson.data.get(key));
        }
        for (const node of nodeJson.nodes) {
            nodes.push(GenericNode.generateNodeFromJson(node));
        }
        const type = nodeJson.type;
        return new NodeBlock(data, nodes, type);
    }
}
class NodeInline extends GenericNode {
    data;
    nodes;
    type;
    static object = 'inline';
    constructor(data, nodes, type) {
        super(NodeInline.object);
        this.data = data;
        this.nodes = nodes;
        this.type = type;
        throwIfNotPresent(data, nodes, type);
    }
    static fromJson(nodeJson) {
        const data = new Map();
        const nodes = new Array();
        for (const key of nodeJson.keys) {
            data.set(key, nodeJson.data.get(key));
        }
        for (const node of nodeJson.nodes) {
            nodes.push(GenericNode.generateNodeFromJson(node));
        }
        const type = nodeJson.type;
        return new NodeBlock(data, nodes, type);
    }
}
class NodeMark {
    data;
    object;
    type;
    constructor(data = new Map(), object, type) {
        this.data = data;
        this.object = object;
        this.type = type;
        throwIfNotPresent(data, object, type);
    }
    static fromJson(nodeJson) {
        const data = new Map();
        for (const key of nodeJson.keys) {
            data.set(key, nodeJson.data.get(key));
        }
        const object = nodeJson.object;
        const type = nodeJson.type;
        return new NodeMark(data, object, type);
    }
}
class NodeText extends GenericNode {
    marks;
    text;
    static object = 'text';
    constructor(marks, text) {
        super(NodeText.object);
        this.marks = marks;
        this.text = text;
        throwIfNotPresent(marks, text);
    }
    static fromJson(nodeJson) {
        const text = nodeJson.text;
        const marks = new Set();
        for (const node of nodeJson.marks.keys) {
            marks.add(NodeMark.fromJson(node));
        }
        return new NodeText(marks, text);
    }
}
export { GenericNode, NodeBlock, NodeInline, NodeText, NodeMark };
