import {sanitize} from "./classes"

abstract class GenericNode {
    public static generateNodeFromJson(nodeJson: any): GenericNode {
        switch(nodeJson.object) {
            case "block": return NodeBlock.fromJson(nodeJson)
            case "inline": return NodeInline.fromJson(nodeJson)
            case "text": return NodeText.fromJson(nodeJson)
        }
        throw new Error("Unknown type")
    }
}

class NodeBlock extends GenericNode {
    public readonly data: Map<String, String>
    public readonly nodes: Array<GenericNode>
    public readonly type: String
    public readonly object = "block"
    public constructor(dataIn: Map<String, String>, nodesIn: Array<GenericNode>,
        typeIn: String) {
        super()
        this.data = dataIn
        this.nodes = nodesIn
        this.type = typeIn
    }
    public static fromJson(nodeJson: any): GenericNode {
        let data: Map<String, String> = new Map<String, String>()
        let nodes: Array<GenericNode> = new Array<GenericNode>
        for (let key in nodeJson.keys()) {
            data.set(sanitize(key), sanitize(nodeJson.data.get(key)))
        }
        for (let node in nodeJson.nodes) {
            nodes.push(GenericNode.generateNodeFromJson(node))
        }
        let type = sanitize(nodeJson.type)
        return new NodeBlock(data, nodes, type)
    }
}

class NodeInline extends GenericNode {
    public readonly data: Map<String, String>
    public readonly nodes: Array<GenericNode>
    public readonly type: String
    public readonly object = "inline"
    public constructor(dataIn: Map<String, String>, nodesIn: Array<GenericNode>,
        typeIn: String) {
        super()
        this.data = dataIn
        this.nodes = nodesIn
        this.type = typeIn
    }
    public static fromJson(nodeJson: any): GenericNode {
        let data: Map<String, String> = new Map<String, String>()
        let nodes: Array<GenericNode> = new Array<GenericNode>
        for (let key in nodeJson.keys()) {
            data.set(sanitize(key), sanitize(nodeJson.data.get(key)))
        }
        for (let node in nodeJson.nodes) {
            nodes.push(GenericNode.generateNodeFromJson(node))
        }
        let type = sanitize(nodeJson.type)
        return new NodeBlock(data, nodes, type)
    }
}

class NodeMark {
    public readonly data: Map<String, String> = new Map<String, String>
    public readonly object: String
    public readonly type: String
    public constructor(data: Map<String, String>, object: String, type: String) {
        this.data = sanitize(data)
        this.object = sanitize(object)
        this.type = sanitize(type)
    }
    public static fromJson(nodeJson: any): NodeMark {
        let data: Map<String, String> = new Map<String, String>()
        for (let key in nodeJson.keys()) {
            data.set(key, nodeJson.data.get(key))
        }
        let object = nodeJson.object
        let type = nodeJson.type
        return new NodeMark(data, object, type)
    }
}

class NodeText extends GenericNode {
    public readonly marks: Set<NodeMark>
    public readonly text: String
    public readonly object: String = "text" 

    public constructor(text: String, marks: Set<NodeMark>) {
        super()
        this.text = sanitize(text)
        this.marks = marks
    }

    public static fromJson(nodeJson: any) {
        let text = nodeJson.text
        let marks = new Set<NodeMark>()
        for (let node in nodeJson.marks.keys()) {
            marks.add(NodeMark.fromJson(node))
        }
        return new NodeText(text, marks)
    }
}

export {
    GenericNode, NodeBlock, NodeInline, NodeText, NodeMark
}