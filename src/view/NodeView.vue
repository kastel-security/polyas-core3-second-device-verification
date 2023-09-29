<script setup lang="ts">
import { type GenericNode, type NodeBlock, type NodeInline, type NodeText } from '../classes/nodes'
import { type Language } from '../classes/basics'

const props = defineProps<{
  node: GenericNode
  language: Language | undefined
}>()
</script>

<template>
    <div v-if="props.node.object=='block'">
        <div v-if="( props.node as NodeBlock).type=='paragraph'">
            <div v-for="subnode in (props.node as NodeBlock).nodes"
            v-bind:key="(props.node as NodeBlock).nodes.indexOf(subnode)">
                <NodeView
                :node="subnode"
                :language="language"/>
                <br>
            </div>
        </div>
        <h1 v-else-if="(props.node as NodeBlock).type=='heading-one'">
            <NodeView
            v-for="subnode in (props.node as NodeBlock).nodes"
            v-bind:key="(props.node as NodeBlock).nodes.indexOf(subnode)"
            :node="subnode"
            :language="language"/>
        </h1>
        <h2 v-else-if="(props.node as NodeBlock).type=='heading-two'">
            <NodeView
            v-for="subnode in (props.node as NodeBlock).nodes"
            v-bind:key="(props.node as NodeBlock).nodes.indexOf(subnode)"
            :node="subnode"
            :language="language"/>
        </h2>
        <h3 v-else-if="(props.node as NodeBlock).type=='heading-three'">
            <NodeView
            v-for="subnode in (props.node as NodeBlock).nodes"
            v-bind:key="(props.node as NodeBlock).nodes.indexOf(subnode)"
            :node="subnode"
            :language="language"/>
        </h3>
        <div v-else-if="(props.node as NodeBlock).type=='block-quote'">
            <NodeView
            v-for="subnode in (props.node as NodeBlock).nodes"
            v-bind:key="(props.node as NodeBlock).nodes.indexOf(subnode)"
            :node="subnode"
            :language="language"/>
        </div>
        <div v-else-if="(props.node as NodeBlock).type=='code'">
            <NodeView
            v-for="subnode in (props.node as NodeBlock).nodes"
            v-bind:key="(props.node as NodeBlock).nodes.indexOf(subnode)"
            :node="subnode"
            :language="language"/>
        </div>
        <div v-else-if="(props.node as NodeBlock).type=='ordered-list'">
            <ol>
                <NodeView
                v-for="subnode in (props.node as NodeBlock).nodes"
                v-bind:key="(props.node as NodeBlock).nodes.indexOf(subnode)"
                :node="subnode"
                :language="language"/>
            </ol>
        </div>
        <div v-else-if="(props.node as NodeBlock).type=='unordered-list'">
            <ul>
                <NodeView
                v-for="subnode in (props.node as NodeBlock).nodes"
                v-bind:key="(props.node as NodeBlock).nodes.indexOf(subnode)"
                :node="subnode"
                :language="language"/>
            </ul>
        </div>
        <div v-else-if="(props.node as NodeBlock).type=='list-item'">
            <li>
                <NodeView
                v-for="subnode in (props.node as NodeBlock).nodes"
                v-bind:key="(props.node as NodeBlock).nodes.indexOf(subnode)"
                :node="subnode"
                :language="language"/>
            </li>
        </div>
        <div v-else>
            <NodeView
            v-for="subnode in (props.node as NodeBlock).nodes"
            v-bind:key="(props.node as NodeBlock).nodes.indexOf(subnode)"
            :node="subnode"
            :language="language"/>
        </div>
    </div>
    <div v-else-if="props.node.object=='inline'">
        <div v-if="(props.node as NodeInline).type=='link'">
            <a href="(props.node as NodeInline).data.get('url')">
                <NodeView
                v-for="subnode in (props.node as NodeInline).nodes"
                v-bind:key="(props.node as NodeBlock).nodes.indexOf(subnode)"
                :node="subnode"
                :language="language"/>
            </a>
        </div>
        <div v-else>
            <NodeView
            v-for="subnode in (props.node as NodeInline).nodes"
            v-bind:key="(props.node as NodeBlock).nodes.indexOf(subnode)"
            :node="subnode"
            :language="language"/>
        </div>
    </div>
    <div v-else-if="props.node.object=='text'">
        <text>
            {{ (props.node as NodeText).text }}
        </text>
    </div>
</template>
