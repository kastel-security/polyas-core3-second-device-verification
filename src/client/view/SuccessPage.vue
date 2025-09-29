<script setup lang="ts">
import { extractTextFromJson } from './basic'
import { type Language } from '../classes/basics'
import * as text from './elements/text.json'
const props = defineProps<{
  language: Language | undefined
}>()
</script>

<template>
    <div class="success-box">
        <h2>{{ extractTextFromJson(text.success.header, props.language) }}</h2>
        <p>{{ extractTextFromJson(text.success.text, props.language) }}</p>
    </div>
</template>

<style scoped>
.success-box {
  max-width: 500pt;
  padding: 0 2pt;
  margin: auto auto 4rem auto;
  line-height: 1.5;
  text-align: center;
  background-color: #dff8d7;
  border-radius: 5pt;
  border: 1px solid #966a6d;
  color: #0E9700;
}
</style>
