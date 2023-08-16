<script setup lang="ts">
import { Content, ContentText, Language } from '../classes/basics';
import { extractText, extractTextFromJson } from './basic';
import text from "./text.json"

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
        <label>Not supported</label>
    </div>
</template>