<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElectionData } from '../classes/communication';
import data from "./data.json"
import { I18n, Language } from '../classes/basics';
    let passwordValue: string = ""
    let electionData = ref<ElectionData>()
    let language = ref<Language|undefined>()
    onMounted(() => {
        electionData.value = ElectionData.fromJson(data.electionData)
        language.value = undefined
    })
    function login() {
        console.log("!")
        console.log(passwordValue)
    }
    function extractText(text: I18n<string> | undefined) {
        if (text && language.value && language.value in text.value.keys) {
            return text.value.get(language.value)
        } else if(text) {
            return text.default
        } else {
            return ""
        }
    }
</script>

<template>
    <div id="start">
        <h1>Polyas second device verification tool</h1>
        <h2>Election: {{extractText(electionData?.title)}}</h2>
        <br>
        <p>Enter one time code</p>
        <input 
        type="password"
        v-model="passwordValue"/> 
        <button v-on:click="login">Login</button>
    </div>
</template>

