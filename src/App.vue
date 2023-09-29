<script setup lang="ts">
import StartPage from './view/StartPage.vue'
import { onMounted, ref } from 'vue'
import { type ElectionData, type SecondDeviceLoginResponse } from './classes/communication'
import text from './view/elements/text.json'
import { type I18n, type Language } from './classes/basics'
import { extractText, extractTextFromJson, State } from './view/basic'
import VerifiedView from './view/VerifiedView.vue'
import { ErrorType } from './main/error'
import { ResponseBean, ResponseBeanError, type ResponseBeanOk } from './main/communication'
import ErrorView from './view/ErrorView.vue'
import { EnvironmentVariables } from './main/constants'
import { Verificationtool } from './main/verificationtool'
let env: EnvironmentVariables = new EnvironmentVariables()
const language = ref<Language | undefined>()
let languages: Array<Language | undefined>
const state = ref(State.LOADING)
const error = ref(new ResponseBeanError(ErrorType.OTHER))
const voterId = ref<string>()
const nonce = ref<string>()
const c = ref<string>()
const verificationtool = ref<Verificationtool>()
const title = ref<I18n<string>>()
const loginResponse = ref<SecondDeviceLoginResponse>()
const result = ref<Uint8Array>()
const receiptText = ref<string[]>()
onMounted(async () => {
  env = EnvironmentVariables.init((import.meta as any).env.VITE_MODE)
  env.electionUrl = (import.meta as any).env.VITE_ELECTION_URL + '/' + (import.meta as any).env.VITE_ELECTION_HASH
  env.backendUrl = (import.meta as any).env.VITE_ELECTION_BACKEND
  env.fingerprint = (import.meta as any).env.VITE_ELECTION_FINGERPRINT
  env.electionURL = (import.meta as any).env.VITE_ELECTION_URL + '/' + (import.meta as any).env.VITE_ELECTION_HASH
  console.log('Fingerprint: ', env.fingerprint)
  const urlParams = new URLSearchParams(window.location.search)
  languages = ['DE', 'EN', undefined]
  language.value = 'DE'
  if (!urlParams.has('c') || !urlParams.has('vid') || !urlParams.has('nonce')) {
    error.value = new ResponseBeanError(ErrorType.PARAMS)
    state.value = State.ERROR
    return
  }
  voterId.value = urlParams.get('vid') as string
  nonce.value = urlParams.get('nonce') as string
  c.value = urlParams.get('c') as string
  await loadData()
})

async function loadData (): Promise<void> {
  verificationtool.value = new Verificationtool()
  const electionData = await verificationtool.value.loadElectionData()
  if (electionData.status === ResponseBean.okStatus) {
    language.value = undefined
    languages = [...(electionData as ResponseBeanOk<ElectionData>).value.languages, undefined]
    title.value = (electionData as ResponseBeanOk<ElectionData>).value.title
    state.value = State.LOGIN
  } else {
    error.value = electionData as ResponseBeanError
    state.value = State.ERROR
  }
}

async function login (password: string): Promise<void> {
  if (verificationtool.value === undefined || voterId.value === undefined || nonce.value === undefined || c.value === undefined) {
    error.value = new ResponseBeanError(ErrorType.OTHER)
    state.value = State.ERROR
  } else {
    state.value = State.LOADING
    const login = await verificationtool.value.login(voterId.value, nonce.value, password, c.value)
    if (login.status === ResponseBean.errorStatus) {
      state.value = State.ERROR
      error.value = login as ResponseBeanError
      return
    }
    loginResponse.value = (login as ResponseBeanOk<SecondDeviceLoginResponse>).value
    const finalMessage = await verificationtool.value.finalMessage()
    if (finalMessage.status === ResponseBean.errorStatus) {
      state.value = State.ERROR
      error.value = finalMessage as ResponseBeanError
      return
    }
    const res = await verificationtool.value.decodeBallot()
    if (res.status === ResponseBean.errorStatus) {
      state.value = State.ERROR
      error.value = res as ResponseBeanError
      return
    }
    result.value = (res as ResponseBeanOk<Uint8Array>).value
    const receipt = await verificationtool.value.getReceiptText()
    if (receipt.status === ResponseBean.errorStatus) {
      state.value = State.ERROR
      error.value = receipt as ResponseBeanError
      return
    }
    receiptText.value = (receipt as ResponseBeanOk<string[]>).value
    state.value = State.VERIFIED
  }
}

async function reset (): Promise<void> {
  error.value = new ResponseBeanError(ErrorType.OTHER)
  state.value = State.LOADING
  await loadData()
}
</script>

<template>
  <div id="all">
    <div id="header">
      <div id="left">
        <img class="kitlogo" src="./view/elements/kit.svg"/>
      </div>
      <div id="center">
        <h1>{{ extractTextFromJson(text.header.title, language) }}</h1>
        <div class="select">
          <div id="symbol">&#x1F310;</div><select class="selectButton"
            v-model="language">
            {{ language ? language : "default" }}
            <option v-for="lang in languages"
              :value="lang"
              :key="lang"
              :id="lang">{{ lang ? lang : "Default" }}</option>
          </select>
        </div>
        <h2 v-if="title!=undefined">{{ extractTextFromJson(text.header.election, language) }}<em>{{ extractText(title, language)}}</em></h2>
      </div>
      <div id="right">
        <img class="kastellogo" src="./view/elements/kastel.png"/>
      </div>
    </div>
    <div class="main">
      <StartPage
      v-if="state == State.LOGIN"
      :language="language" :voterId="voterId!" @login="(password) => login(password)"/>
      <VerifiedView
      v-else-if="state==State.VERIFIED"
      :loginResponse="loginResponse!"
      :result="result!"
      :language="language"
      :receipt-text="receiptText!"/>
      <ErrorView
      v-else-if="state==State.ERROR"
      :errorType="error.errorType"
      :message="error.message"
      :language="language"
      @reset="reset"/>
      <div v-else class="loading">
        <img src="./view/elements/spinner-1s-200px.svg"/>
      </div>
    </div>
    <div id="footer">
      <a href="https://github.com/kastel-security/polyas-core3-second-device-verification" id="toollink">Polyas-Verifier</a> {{ extractTextFromJson(text.footer.acknowledgement, language) }}
      &copy; 2023&puncsp;<a href="mailto:udqps@student.kit.edu">Christoph Niederbudde</a>, <a href="https://formal.kastel.kit.edu/~kirsten/">Michael Kirsten</a>.
    </div>
  </div>
</template>

<style scoped>
#header {
  height: 100%;
  width: 100%;
  display: flex;
  font-family: "Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
}

#footer {
  width: 92%;
  text-align: justify;
  padding-top: 15px;
  padding-bottom: 15px;
  padding-inline-start: 7%;
  background-color: #F2F2F2;
  bottom: 0;
  font-family: "Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  font-weight: 100;
}

#toollink {
  font-family: "Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  font-size: 18px;
  font-weight: 600;
  font-variant: small-caps;
}

#left {
  width: 20%;
}

#center {
  width: 60%;
  text-align: center;
  font-family: "Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
}

#right {
  width: 20%;
  text-align: right;
  font-family: "Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
}

#symbol {
  margin: 0.1em;
}

.kitlogo {
  margin-left: 32.98%;
  margin-top: 1.22rem;
  width: 35.85%;
  min-height: 25%;
  min-width: 35%;
}

.kastellogo {
  margin-right: 30%;
  margin-top: .5rem;
  width: 45%;
  min-height: 25%;
  min-width: 45%;
}

.select {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  .selectButton {
    margin-left: .5em;
    margin-right: 7%;
    background-color: inherit;
  }
  margin-left: auto;
  margin-right: -15%;
  margin-top: -4.45%;
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

.main {
  max-width: 800pt;
  padding: 0 12pt;
  margin: auto auto 8rem auto;
  line-height: 1.5;
  font-family: "Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
}

.loading {
  text-align: center;
}
</style>
