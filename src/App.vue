<script setup lang="ts">
import StartPage from "./view/StartPage.vue"
import { onMounted, ref } from 'vue';
import { ElectionData, SecondDeviceLoginResponse } from './classes/communication';
import data from "./view/data.json"
import text from "./view/text.json"
import { I18n, Language } from './classes/basics';
import { extractText, extractTextFromJson, State } from "./view/basic";
import Verified from "./view/Verified.vue";
import { Core3StandardBallot } from "./classes/ballot";
    let electionData = ref<ElectionData>()
    let loginResponse = ref<SecondDeviceLoginResponse>()
    let result = ref<Uint8Array>()
    let language = ref<Language|undefined>()
    let languages: Array<Language|undefined>
    let state = ref(State.LOGIN)
    onMounted(() => {
        electionData.value = ElectionData.fromJson(data.electionData)
        loginResponse.value = SecondDeviceLoginResponse.fromJson(data.loginResponse)
        result.value = new Uint8Array([0,0,0,1])
        language.value = undefined
        languages = new Array(...electionData.value.languages, undefined)
        state.value = State.VERIFIED
    })
    function login(password: string) {
      console.log(password)
      //state.value = State.VERIFIED
    }
</script>

<template>
  <div class="Header">
    <h1>{{ extractTextFromJson(text.header.title, language) }}</h1>
    <h2>{{ extractTextFromJson(text.header.election, language) + extractText(electionData?.title, language)}}</h2>
  </div> 
  <div class="select">
    <label>{{ extractTextFromJson(text.header.language, language) }}</label>
    <select 
    class="select"
    v-model="language">
      {{ language ? language : "default" }}
      <option
      v-for="lang in languages"
      :value="lang"
      :key="lang"
      :id="lang">{{ lang ? lang : "default" }}</option>
    </select>
  </div>
  <main>
    <StartPage 
    v-if="state == State.LOGIN"
    :language="language" @login="(password) => login(password)"/>
    <Verified
    v-if="state==State.VERIFIED"
    :loginResponse="loginResponse!"
    :result="result!"
    :language="language"/>
  </main>
</template>

<style scoped>

</style>
./view/basic