import {throwIfNotPresent} from "./basics"
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
    public readonly object = "block"
    public constructor(    
        public readonly data: Map<String, String>,
        public readonly nodes: Array<GenericNode>,
        public readonly type: String) {
        super()
        throwIfNotPresent(data, nodes, type)
    }
    public static fromJson(nodeJson: any): GenericNode {
        let data: Map<String, String> = new Map<String, String>()
        let nodes: Array<GenericNode> = new Array<GenericNode>
        for (let key of nodeJson.keys) {
            data.set(key, nodeJson.data.get(key))
        }
        for (let node of nodeJson.nodes) {
            nodes.push(GenericNode.generateNodeFromJson(node))
        }
        let type = nodeJson.type as String
        return new NodeBlock(data, nodes, type)
    }
}

class NodeInline extends GenericNode {
    public readonly object = "inline"
    public constructor(    
        public readonly data: Map<String, String>,
        public readonly nodes: Array<GenericNode>,
        public readonly type: String) {
        super()
        throwIfNotPresent(data, nodes, type)
    }
    public static fromJson(nodeJson: any): GenericNode {
        let data: Map<String, String> = new Map<String, String>()
        let nodes: Array<GenericNode> = new Array<GenericNode>
        for (let key of nodeJson.keys) {
            data.set(key, nodeJson.data.get(key))
        }
        for (let node of nodeJson.nodes) {
            nodes.push(GenericNode.generateNodeFromJson(node))
        }
        let type = nodeJson.type as String
        return new NodeBlock(data, nodes, type)
    }
}

class NodeMark {
    public constructor(    
        public readonly data: Map<String, String> = new Map<String, String>,
        public readonly object: String,
        public readonly type: String) {
            throwIfNotPresent(data, object, type)
        }
    public static fromJson(nodeJson: any): NodeMark {
        let data: Map<String, String> = new Map<String, String>()
        for (let key of nodeJson.keys) {
            data.set(key, nodeJson.data.get(key))
        }
        let object = nodeJson.object as String
        let type = nodeJson.type as String
        return new NodeMark(data, object, type)
    }
}

class NodeText extends GenericNode {
    public readonly object: String = "text" 

    public constructor(    
        public readonly marks: Set<NodeMark>,
        public readonly text: String) {
        super()
        throwIfNotPresent(marks, text)
    }

    public static fromJson(nodeJson: any) {
        let text = nodeJson.text as String
        let marks = new Set<NodeMark>()
        for (let node of nodeJson.marks.keys) {
            marks.add(NodeMark.fromJson(node))
        }
        return new NodeText(marks, text)
    }
}

export {
    GenericNode, NodeBlock, NodeInline, NodeText, NodeMark
}