<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { I18n, Language } from '../classes/basics';
import * as text from "./text.json"
import { extractTextFromJson } from './basic';
    let passwordValue: string = ""

    const props = defineProps<{
        language: Language|undefined
    }>()
</script>

<template>
    <div id="start">
        <p>{{ extractTextFromJson(text.login.loginReq, props.language) }}</p>
        <input 
        type="password"
        v-model="passwordValue"/> 
        <button v-on:click="$emit('login', passwordValue)">{{ extractTextFromJson(text.login.loginButton, language)}}</button>
    </div>
</template>