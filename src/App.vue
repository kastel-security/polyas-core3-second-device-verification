<script setup lang="ts">
import StartPage from "./view/StartPage.vue"
import { onMounted, ref } from 'vue';
import { ElectionData, SecondDeviceLoginResponse } from './classes/communication';
import text from "./view/elements/text.json"
import { I18n, Language } from './classes/basics';
import { extractText, extractTextFromJson, State } from "./view/basic";
import Verified from "./view/Verified.vue";
import { ErrorType } from "./main/error";
import { ResponseBean, ResponseBeanError, ResponseBeanOk, Verificationtool, VerificationtoolImplementation, VerificationtoolMock } from "./main/verifictiontool";
import ErrorView from "./view/ErrorView.vue";
import { EnvironmentVariables } from "./main/constants";
const env = EnvironmentVariables.init()
const language = ref<Language|undefined>()
let languages: Array<Language|undefined>
const state = ref(State.LOADING)
const error = ref(new ResponseBeanError(ErrorType.OTHER))
const voterId = ref<string>()
const nonce = ref<string>()
const c = ref<string>()
const verificationtool = ref<Verificationtool>()
const title = ref<I18n<string>>()
const loginResponse = ref<SecondDeviceLoginResponse>()
const result = ref<Uint8Array>()
const receiptText = ref<Array<string>>()
onMounted(async () => {
  console.log(env)
  env.backendUrl = import.meta.env.VITE_BACKEND
  env.mockMode = import.meta.env.VITE_MOCK == "true"
  env.fingerprint = import.meta.env.VITE_FINGERPRINT
  console.log(env.fingerprint)
  let urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.has("c") || !urlParams.has("vid") || !urlParams.has("nonce")) {
    error.value = new ResponseBeanError(ErrorType.PARAMS)
    state.value = State.ERROR
    language.value = undefined
    languages = ["DE", "EN", undefined]
    return
  }
  voterId.value = urlParams.get("vid")!
  nonce.value = urlParams.get("nonce")!
  c.value = urlParams.get("c")!
  loadData()
})

async function loadData() {
  verificationtool.value = env.mockMode ? new VerificationtoolMock() : new VerificationtoolImplementation()
  const electionData = await verificationtool.value.loadElectionData()
  if (electionData.status == ResponseBean.okStatus) {
    language.value = undefined
    languages = new Array(...(electionData as ResponseBeanOk<ElectionData>).value.languages, undefined)
    title.value = (electionData as ResponseBeanOk<ElectionData>).value.title
    state.value = State.LOGIN
  } else {
    error.value = electionData as ResponseBeanError
    state.value = State.ERROR
  }
}

async function login(password: string) {
  console.log(password)
  state.value = State.LOADING
  const login = await verificationtool.value!.login(voterId.value!, nonce.value!, password, c.value!)
  if(login.status == ResponseBean.errorStatus) {
    state.value = State.ERROR
    error.value = login as ResponseBeanError
    return;
  }
  loginResponse.value = (login as ResponseBeanOk<SecondDeviceLoginResponse>).value
  const finalMessage = await verificationtool.value!.finalMessage()
  if(finalMessage.status == ResponseBean.errorStatus) {
    state.value = State.ERROR
    error.value = finalMessage as ResponseBeanError
    return;
  }
  const res = await verificationtool.value!.decodeBallot()
  if(res.status == ResponseBean.errorStatus) {
    state.value = State.ERROR
    error.value = res as ResponseBeanError
    return;
  }
  result.value = (res as ResponseBeanOk<Uint8Array>).value
  const receipt = await verificationtool.value!.getReceiptText()
  if(receipt.status == ResponseBean.errorStatus) {
    state.value = State.ERROR
    error.value = receipt as ResponseBeanError
    return;
  }
  receiptText.value = (receipt as ResponseBeanOk<string[]>).value
  state.value = State.VERIFIED
}

function reset() {
  error.value = new ResponseBeanError(ErrorType.OTHER)
  state.value = State.LOADING
  loadData()
}
</script>

<template>
  <div id="all">
  <div id="header">
    <div id="left">
      <img class="kitlogo" src="./view/elements/kit_de.png"/>
    </div>
    <div id="center">
      <h1>{{ extractTextFromJson(text.header.title, language) }}</h1>
      <div class="select">
      <label class="selectLabel">{{ extractTextFromJson(text.header.language, language) }}</label>
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
      <h2>{{ extractTextFromJson(text.header.election, language) + extractText(title, language)}}</h2>
    </div>
    <div id="right">
      <img class="kastellogo" src="./view/elements/kastel.png"/>
    </div>
  </div>
  <div class="main">
    <StartPage 
    v-if="state == State.LOGIN"
    :language="language" :voterId="voterId!" @login="(password) => login(password)"/>
    <Verified
    v-else-if="state==State.VERIFIED"
    :loginResponse="loginResponse!"
    :result="result!"
    :language="language"
    :receipt-text="receiptText!"/>
    <ErrorView
    v-else-if="state==State.ERROR"
    :errorType="error.error"
    :message="error.message"
    :language="language"
    @reset="reset"/>
    <div v-else class="loading">
      <img src="./view/elements/Spinner-1s-200px.svg"/>
    </div>
  </div>
  </div>
</template>

<style scoped>

#header {
  height: 100%;
  width: 100%;
  display: flex;
}
#left {
  width: 20%;
}
#center {
  width: 60%;
  text-align: center;
}
#right {
  width: 20%;
  text-align: right;
}

.title {
  font-size: 20px;
  font-weight: 600;
  margin:6pt;
  padding: 0 12pt;
}
.kitlogo{
  margin-left: 2rem;
  margin-top: 1rem;
  width: 10rem;
  min-width: 3.3cm;
}
.kastellogo{
  margin-right: 2rem;
  margin-top: 1rem;
  width: 10rem;
}

.select{
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
  .selectButton{
    margin-right: 1.5rem;
  }
  .selectLabel{
    margin-right: 1.5rem;
  }
}

.selectbck {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
  margin-top: 1.5em !important;
  margin-right: 18rem !important;
  position: absolute;
  right: 0;

}

.main  {
  max-width: 800pt;
  padding: 0 12pt;
  margin: auto auto 8rem auto;
  line-height: 1.5;
}

.loading {
  text-align: center;
}

</style>