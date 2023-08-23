<script setup lang="ts">
import { onMounted } from 'vue';
import { GenericNode, NodeBlock, NodeInline, NodeText } from '../classes/nodes';
import { Language } from '../classes/basics';

const props = defineProps<{
    node: GenericNode,
    language: Language|undefined
}>()

function getUrl(node: GenericNode) {
    return (node as NodeInline).data.get("url")
}
</script>

<template>
    <div v-if="node.object=='block'">
        <div v-if="(node as NodeBlock).type=='paragraph'">
            <div v-for="subnode in (node as NodeBlock).nodes">
                <NodeView
                :node="subnode"
                :language="language"/>
                <br>
            </div>
        </div>
        <h1 v-if="(node as NodeBlock).type=='heading-one'">
            <NodeView
            v-for="subnode in (node as NodeBlock).nodes"
            :node="subnode"
            :language="language"/>
        </h1>
        <h2 v-else-if="(node as NodeBlock).type=='heading-two'">
            <NodeView
            v-for="subnode in (node as NodeBlock).nodes"
            :node="subnode"
            :language="language"/>
        </h2>
        <h3 v-else-if="(node as NodeBlock).type=='heading-three'">
            <NodeView
            v-for="subnode in (node as NodeBlock).nodes"
            :node="subnode"
            :language="language"/>
        </h3>
        <div v-else-if="(node as NodeBlock).type=='block-quote'">
            <NodeView
            v-for="subnode in (node as NodeBlock).nodes"
            :node="subnode"
            :language="language"/>
        </div>
        <div v-else-if="(node as NodeBlock).type=='code'">
            <NodeView
            v-for="subnode in (node as NodeBlock).nodes"
            :node="subnode"
            :language="language"/>
        </div>
        <div v-else-if="(node as NodeBlock).type=='ordered-list'">
            <ol>
                <NodeView
                v-for="subnode in (node as NodeBlock).nodes"
                :node="subnode"
                :language="language"/>
            </ol>
        </div>
        <div v-else-if="(node as NodeBlock).type=='unordered-list'">
            <ul>
                <NodeView
                v-for="subnode in (node as NodeBlock).nodes"
                :node="subnode"
                :language="language"/>
            </ul>
        </div>
        <div v-else-if="(node as NodeBlock).type=='list-item'">
            <li>
                <NodeView
                v-for="subnode in (node as NodeBlock).nodes"
                :node="subnode"
                :language="language"/>
            </li>
        </div>
        <div v-else>
            <NodeView
            v-for="subnode in (node as NodeBlock).nodes"
            :node="subnode"
            :language="language"/>
        </div>
    </div>
    <div v-else-if="node.object=='inline'">
        <div v-if="(node as NodeInline).type=='link'">
            <a href="getUrl(node)">
                <NodeView
                v-for="subnode in (node as NodeInline).nodes"
                :node="subnode"
                :language="language"/>
            </a>
        </div>
        <div v-else>
            <NodeView
            v-for="subnode in (node as NodeInline).nodes"
            :node="subnode"
            :language="language"/>
        </div>
    </div>
    <div v-else-if="node.object=='text'">
        <text>
            {{ (node as NodeText).text }}
        </text>
    </div>
</template>