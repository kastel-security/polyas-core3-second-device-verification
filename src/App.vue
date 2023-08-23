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
import { ErrorType } from "./main/error";
import { ResponseBean, ResponseBeanError, ResponseBeanOk, Verificatiotool } from "./main/verifictiontool";
import ErrorView from "./view/ErrorView.vue";
    const language = ref<Language|undefined>()
    let languages: Array<Language|undefined>
    const state = ref(State.LOADING)
    const error = ref(new ResponseBeanError(ErrorType.OTHER))
    const voterId = ref<string>()
    const nonce = ref<string>()
    const c = ref<string>()
    const verificationtool = ref(new Verificatiotool())
    const title = ref<I18n<string>>()
    const loginResponse = ref<SecondDeviceLoginResponse>()
    const result = ref<Uint8Array>()
    onMounted(async () => {
      let urlParams = new URLSearchParams(window.location.search);
      if (!urlParams.has("c") || !urlParams.has("vid") || !urlParams.has("nonce")) {
        error.value = new ResponseBeanError(ErrorType.PARAMS)
        state.value = State.ERROR
        language.value = undefined
        languages = ["DE", "EN", undefined]
      } else {
        voterId.value = urlParams.get("vid")!
        nonce.value = urlParams.get("nonce")!
        c.value = urlParams.get("c")!
        const electionData = await verificationtool.value.loadElectionData()
        if (electionData.status == ResponseBean.okStatus) {
          language.value = undefined
          languages = new Array(...(electionData as ResponseBeanOk<ElectionData>).value.languages, undefined)
          title.value = (electionData as ResponseBeanOk<ElectionData>).value.title
        } else {
          error.value = electionData as ResponseBeanError
          state.value = State.ERROR
        }
      }
    })
    async function login(password: string) {
      state.value = State.LOADING
      const login = await verificationtool.value.login(voterId.value!, nonce.value!, c.value!, password)
      if(login.status == ResponseBean.errorStatus) {
        state.value = State.ERROR
        error.value = login as ResponseBeanError
        return;
      }
      loginResponse.value = (login as ResponseBeanOk<SecondDeviceLoginResponse>).value
      const finalMessage = await verificationtool.value.finalMessage()
      if(finalMessage.status == ResponseBean.errorStatus) {
        state.value = State.ERROR
        error.value = finalMessage as ResponseBeanError
        return;
      }
      const res = await verificationtool.value.decodeBallot()
      if(res.status == ResponseBean.errorStatus) {
        state.value = State.ERROR
        error.value = res as ResponseBeanError
        return;
      }
      result.value = (res as ResponseBeanOk<Uint8Array>).value
      state.value = State.VERIFIED
    }

    function reset() {
      error.value = new ResponseBeanError(ErrorType.OTHER)
      state.value = State.LOGIN
    }
</script>

<template>
  <div id="all">
  <div class="header">
    <div class="select">
      <label>{{ extractTextFromJson(text.header.language, language) }}</label>
      <select 
      class="selectButton"
      v-model="language">
        {{ language ? language : "default" }}
        <option
        v-for="lang in languages"
        :value="lang"
        :key="lang"
        :id="lang">{{ lang ? lang : "default" }}</option>
      </select>
    </div>
    <div class="title">
      <h1>{{ extractTextFromJson(text.header.title, language) }}</h1>
      <h2>{{ extractTextFromJson(text.header.election, language) + extractText(title, language)}}</h2>
    </div>
  </div>
  <div class="main">
    <StartPage 
    v-if="state == State.LOGIN"
    :language="language" :voterId="voterId!" @login="(password) => login(password)"/>
    <Verified
    v-if="state==State.VERIFIED"
    :loginResponse="loginResponse!"
    :result="result!"
    :language="language"/>
    <ErrorView
    v-if="state==State.ERROR"
    :errorType="error.error"
    :message="error.message"
    :language="language"
    @reset="reset"/>
  </div>
  </div>
</template>

<style scoped>

.header {
  margin-top: 22pt;
  margin-bottom: 20pt;
  padding-bottom: 20pt;
  color: #000000;
  text-align: center;

  .title {
  font-size: 20px;
  font-weight: 600;
  margin:6pt;
  padding: 0 12pt;
}
}

.select {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
  margin-top: 0.5rem !important;
  margin-right: 1.5rem !important;
  position: absolute;
  right: 0;

}

.main  {
  max-width: 800pt;
  padding: 0 12pt;
  margin: auto auto 8rem auto;
  line-height: 1.5;
}

</style>