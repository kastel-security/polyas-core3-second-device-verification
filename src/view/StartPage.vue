<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { I18n, Language } from '../classes/basics';
import * as text from "./text.json"
import { extractText, extractTextFromJson } from './basic';
    let passwordValue: string = ""

    const props = defineProps<{
        language: Language|undefined,
        voterId: string
    }>()
</script>

<template>
    <div class="start">
        <h3>{{ extractTextFromJson(text.login.voterId, props.language) + voterId}}</h3>
        <p>{{ extractTextFromJson(text.login.loginReq, props.language) }}</p>
        <input 
        class="input"
        type="password"
        v-model="passwordValue"/> 
        <button v-on:click="$emit('login', passwordValue)">{{ extractTextFromJson(text.login.loginButton, language)}}</button>
    </div>
</template>

<style scoped>
.start{
    max-width: 400pt;
    margin: auto;
    text-align: center;
    font-size: 12pt;
}
</style>