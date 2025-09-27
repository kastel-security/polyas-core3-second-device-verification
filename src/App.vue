<script setup lang="ts">
import StartPage from './view/StartPage.vue'
import { onMounted, ref } from 'vue'
import { type ElectionData, type SecondDeviceLoginResponse } from './classes/communication'
import text from './view/elements/text.json'
import { I18n, type Language } from './classes/basics'
import { extractText, extractTextFromJson, State } from './view/basic'
import VerifiedView from './view/VerifiedView.vue'
import SuccessPage from './view/SuccessPage.vue'
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
  console.log((import.meta as any).env.VITE_MODE)
  env.electionUrl = (import.meta as any).env.VITE_ELECTION_URL + '/' + (import.meta as any).env.VITE_ELECTION_HASH
  env.backendUrl = (import.meta as any).env.VITE_ELECTION_BACKEND
  env.fingerprint = (import.meta as any).env.VITE_ELECTION_FINGERPRINT
  console.log('Fingerprint: ', env.fingerprint)
  const urlParams = new URLSearchParams(window.location.search)
  languages = ['DE', undefined]
  language.value = 'DE'
  await loadData()
  if (!urlParams.has('c') || !urlParams.has('vid') || !urlParams.has('nonce')) {
    error.value = new ResponseBeanError(ErrorType.PARAMS)
    state.value = State.ERROR
    return
  }
  voterId.value = urlParams.get('vid') as string
  nonce.value = urlParams.get('nonce') as string
  c.value = urlParams.get('c') as string
})

async function loadData (): Promise<void> {
  verificationtool.value = new Verificationtool()
  const electionData = await verificationtool.value.loadElectionData()
  if (electionData.status === ResponseBean.okStatus) {
    languages = [...(electionData as ResponseBeanOk<ElectionData>).value.languages, undefined]
    title.value = (electionData as ResponseBeanOk<ElectionData>).value.title
    state.value = State.LOGIN
  } else {
    title.value = I18n.fromJson(text.error.title_default, 'string')
    error.value = electionData as ResponseBeanError
    state.value = State.ERROR
  }
}

async function confirm (): Promise<void> {
  state.value = State.SUCCESS
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
    <div id="header-top">
      <div class="logos">
        <!-- a href="https://www.kit.edu/english/"><img class="kitlogo" src="./view/elements/kit_en.svg"/></a -->
        <a href="https://www.lmu.de/en/"><img class="lmulogo" src="./view/elements/lmu.svg"/></a>
        <a href="https://kastel-labs.de/"><img class="kastellogo" src="./view/elements/kastel.svg"/></a>
      </div>
      <div class="select">
        <div id="symbol"><i class="fa fa-globe"></i></div>
        <select class="selectButton"
          v-model="language">
          {{ language ? language : "default" }}
          <option v-for="lang in languages"
            :value="lang"
            :key="lang"
            :id="lang">{{ lang ? lang : "EN" }}</option>
        </select>
      </div>
    </div>
    <div id="header">
      <div id="title">
        <h1>{{ extractTextFromJson(text.header.title, language) }}</h1>
      </div>
      <div class="election-title">
        <h2 v-if="title!=undefined"><em>{{ extractText(title, language)}}</em></h2>
      </div>
    </div>
    <div class="main">
      <StartPage
      v-if="state == State.LOGIN"
      :language="language" :voterId="voterId!" @login="(password) => login(password)"
      />
      <VerifiedView
      v-else-if="state==State.VERIFIED"
      :loginResponse="loginResponse!"
      :result="result!"
      :language="language"
      :receipt-text="receiptText!"
        @confirm="()=> confirm()"
      />
      <ErrorView
      v-else-if="state==State.ERROR"
      :errorType="error.errorType"
      :message="error.message"
      :title="(title as I18n<string>)"
      :language="language"
        @reset="reset"
      />
      <SuccessPage
      v-else-if="state==State.SUCCESS"
      :language="language"
      />
      <div v-else class="loading">
        <img src="./view/elements/spinner-1s-200px.svg"/>
      </div>
    </div>
    <div id="footer">
      <span>
        <a href="https://github.com/kastel-security/polyas-core3-second-device-verification" id="toollink">Polyas-Verifier</a>
        {{ extractTextFromJson(text.footer.acknowledgement, language) }} &copy; 2025&puncsp;<a href="mailto:udqps@student.kit.edu">Christoph Niederbudde</a>, <a href="https://www.tcs.ifi.lmu.de/mitarbeiter/michael-kirsten_de.html">Michael Kirsten</a>.
      </span>
    </div>
  </div>
</template>

<style>
body {
  margin: 0;
}
</style>

<style scoped>

#header {
  max-width: 835pt;
  padding: 0 12pt;
  margin: auto auto 4rem auto;
  font-family: "Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
}

#header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid #4664aa;
}

#title {
  text-align: center;
}

.election-title {
  text-align: center;
}

#footer {
  bottom: 0;
  font-family: "Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  font-weight: 100;
  text-align: center;
  padding: 15px 5%;
  background-color: #404040;
  color: white;
  font-size: 12pt;
  flex-direction: column;
  align-items: center;
  margin-top: auto;
  position: relative;
}

#toollink {
  font-family: "Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  font-size: 18px;
  font-weight: 600;
  font-variant: small-caps;
  font-size: 14pt;
  color: white;
  text-decoration: none;
}

#footer span {
  display: block;
  text-align: center;
}

#footer a {
  color: white;
}

#symbol {
  margin: 0.1em;
  color: #404040;
}

#center {
  width: 60%;
  text-align: center;
  font-family: "Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
}

#symbol {
  margin: 0.1em;
  color: #404040;
}

.logos {
  display: flex;
  align-items: center;
  gap: 5pt;
  padding-left: 1%;
}

.kitlogo {
  height: 30pt;
}

.lmulogo {
  height: 30pt;
}

.kastellogo {
  height: 50pt;
}

.select {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  .selectButton {
    margin-left: .5em;
    margin-right: 7%;
    margin-bottom: 4.45%;
    background-color: inherit;
  }
  padding-right: 1%;
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
./main/error./main/communication./main/constants./main/verifictiontool
