import { throwIfNotPresent } from './basics'
abstract class GenericNode {
  public constructor (
    public readonly object
  ) {}

  public static generateNodeFromJson (nodeJson: any): GenericNode {
    switch (nodeJson.object) {
      case 'block': return NodeBlock.fromJson(nodeJson)
      case 'inline': return NodeInline.fromJson(nodeJson)
      case 'text': return NodeText.fromJson(nodeJson)
    }
    throw new Error('Unknown type')
  }
}

class NodeBlock extends GenericNode {
  public static readonly object = 'block'
  public constructor (
    public readonly data: Map<string, string>,
    public readonly nodes: GenericNode[],
    public readonly type: string) {
    super(NodeBlock.object)
    throwIfNotPresent(data, nodes, type)
  }

  public static fromJson (nodeJson: any): GenericNode {
    const data: Map<string, string> = new Map<string, string>()
    const nodes: GenericNode[] = new Array<GenericNode>()
    console.log(3, nodeJson)
    for (const key of Object.keys(nodeJson.data)) {
      data.set(key, nodeJson.data[key])
    }
    for (const node of nodeJson.nodes) {
      nodes.push(GenericNode.generateNodeFromJson(node))
    }
    const type = nodeJson.type as string
    return new NodeBlock(data, nodes, type)
  }
}

class NodeInline extends GenericNode {
  public static readonly object = 'inline'
  public constructor (
    public readonly data: Map<string, string>,
    public readonly nodes: GenericNode[],
    public readonly type: string) {
    super(NodeInline.object)
    throwIfNotPresent(data, nodes, type)
  }

  public static fromJson (nodeJson: any): GenericNode {
    const data: Map<string, string> = new Map<string, string>()
    const nodes: GenericNode[] = new Array<GenericNode>()
    for (const key of Object.keys(nodeJson.data)) {
      data.set(key, nodeJson.data[key])
    }
    for (const node of nodeJson.nodes) {
      nodes.push(GenericNode.generateNodeFromJson(node))
    }
    const type = nodeJson.type as string
    return new NodeBlock(data, nodes, type)
  }
}

class NodeMark {
  public constructor (
    public readonly data: Map<string, string> = new Map<string, string>(),
    public readonly object: string,
    public readonly type: string) {
    throwIfNotPresent(data, object, type)
  }

  public static fromJson (nodeJson: any): NodeMark {
    const data: Map<string, string> = new Map<string, string>()
    for (const key of Object.keys(nodeJson.data)) {
      data.set(key, nodeJson.data[key])
    }
    const object = nodeJson.object as string
    const type = nodeJson.type as string
    return new NodeMark(data, object, type)
  }
}

class NodeText extends GenericNode {
  public static readonly object: string = 'text'

  public constructor (
    public readonly marks: Set<NodeMark>,
    public readonly text: string) {
    super(NodeText.object)
    throwIfNotPresent(marks, text)
  }

  public static fromJson (nodeJson: any): NodeText {
    const text = nodeJson.text as string
    const marks = new Set<NodeMark>()
    // TODO check if this actually works
    for (const node of Object.keys(nodeJson.marks)) {
      marks.add(NodeMark.fromJson(node))
    }
    return new NodeText(marks, text)
  }
}

export {
  GenericNode, NodeBlock, NodeInline, NodeText, NodeMark
}
