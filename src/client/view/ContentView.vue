<script setup lang="ts">
import { type Content, type CustomDocument, type Language } from '../classes/basics'
import NodeView from './NodeView.vue'
import { extractText, extractGeneric } from './basic'

const props = defineProps<{
  content: Content
  language: Language | undefined
}>()
</script>

<template>
    <div class="basic"
    v-if="props.content.contentType=='TEXT'">
        <text>{{ extractText(props.content.value, props.language) }}</text>
    </div>
    <div class="rich"
    v-if="props.content.contentType=='RICH_TEXT'">
        <NodeView v-for="node in extractGeneric<CustomDocument>(props.content.value, props.language).nodes"
        v-bind:key="extractGeneric<CustomDocument>(props.content.value, props.language).nodes.indexOf(node)"
        :node="node"
        :language="props.language"/>
    </div>
</template>
