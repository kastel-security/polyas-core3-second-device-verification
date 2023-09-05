<script setup lang="ts">
import { Content, ContentRichText, ContentText, CustomDocument, Language } from '../classes/basics';
import NodeView from './NodeView.vue';
import { extractText, extractGeneric } from './basic';
import text from "./elements/text.json"

const props = defineProps<{
    content: Content
    language: Language|undefined
}>()
</script>

<template>
    <div class="basic"
    v-if="content.contentType=='TEXT'">
        <text>{{ extractText(content.value, language) }}</text>
    </div>
    <div class="rich"
    v-if="content.contentType=='RICH_TEXT'">
        <NodeView v-for="node in extractGeneric<CustomDocument>(content.value, language).nodes"
        :node="node"
        :language="language"/>
    </div>
</template>