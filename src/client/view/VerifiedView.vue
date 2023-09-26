<script setup lang="ts">
import { type Core3StandardBallot } from '../classes/ballot'
import { type ImageRef, type Language, type I18n } from '../classes/basics'
import { extractGeneric, extractText, extractTextFromJson } from './basic'
import BallotView from './BallotView.vue'

import text from './elements/text.json'
import ContentView from './ContentView.vue'
import { type SecondDeviceLoginResponse } from '../classes/communication'
import { onMounted, ref } from 'vue'
import { jsPDF } from 'jspdf'
import { EnvironmentVariables } from '../main/constants'
import { generateReceipt } from '../../public/receipt'

const props = defineProps<{
  loginResponse: SecondDeviceLoginResponse
  result: Uint8Array
  language: Language | undefined
  receiptText: string[]
}>()
const ballotResult = ref(new Map<string, Uint8Array>())
const ballotSheets = ref<Core3StandardBallot[]>()
const rendered = ref(false)
onMounted(() => {
  ballotSheets.value = []
  const ballotSheetLabels = props.loginResponse.publicLabel.split(':')
  for (const ballotSheet of props.loginResponse.initialMessageDecoded.secondDeviceParameterDecoded.ballots) {
    const ballotSheetStandard = ballotSheet as Core3StandardBallot
    if (ballotSheetLabels.includes(ballotSheetStandard.id)) {
      ballotSheets.value.push(ballotSheetStandard)
    }
  }
  let start = 0
  for (const ballotSheet of ballotSheets.value) {
    let bytesOfBallotSheet = 1
    for (const list of ballotSheet.lists) {
      bytesOfBallotSheet += list.candidates.length + 1
    }
    if (start + bytesOfBallotSheet < props.result.length) {
      throw new Error('Result format does not match ')
    }
    ballotResult.value.set(ballotSheet.id, props.result.subarray(start, start + bytesOfBallotSheet))
    start = start + bytesOfBallotSheet
  }
  rendered.value = true
})

function getImgUrl (img: I18n<ImageRef>): string {
  return extractGeneric<ImageRef>(img, props.language).url
}

function downloadPDF (): void {
  const doc = generateReceipt(props.receiptText)
  doc.save(`vote-receipt-${props.receiptText[2]}.pdf`)
  EnvironmentVariables.instance.comm.logReceipt(props.receiptText)
}
</script>

<template>
    <div class="logo" v-if="props.loginResponse.logo">
        <img :src="getImgUrl(props.loginResponse.logo!)" ref="test"/>
    </div>
    <div class="verifiedText">
        <h1 class="verified">{{ extractTextFromJson(text.verified.verified, props.language) }}</h1>
        <text>{{ extractTextFromJson(text.verified.explanation, props.language) }}</text>
    </div>
    <br>
    <div class="id">
        <text>{{ extractTextFromJson(text.verified.electionId, props.language) + props.loginResponse.electionId }}</text>
        <br>
        <text>{{ extractTextFromJson(text.verified.voterId, props.language) + props.loginResponse.ballotVoterId }}</text>
        <br>
        <text>{{ extractTextFromJson(text.verified.label, props.language) + props.loginResponse.publicLabel }}</text>
    </div>
    <div class="above">
        <div class="messages">
            <text v-for="key in props.loginResponse.messages.keys()"
            v-bind:key="key">key: {{ extractText(props.loginResponse.messages.get(key), props.language) }}</text>
        </div>
        <br>
        <div class="contentAbove" v-if="props.loginResponse.contentAbove">
            <ContentView :content="props.loginResponse.contentAbove" :language="props.language"/>
        </div>
    </div>
    <div class="ballot" v-if="rendered">
        <BallotView
        v-for="ballot in ballotSheets"
        v-bind:key="ballot.id"
        :ballot="ballot"
        :result="ballotResult.get(ballot.id)!"
        :language="props.language"/>
    </div>
    <div class="download">
        <text class="text">{{ extractTextFromJson(text.verified.downloadText, props.language) }}</text>
        <br>
        <button v-on:click="downloadPDF">{{ extractTextFromJson(text.verified.download, props.language) }}</button>
    </div>
</template>

<style scoped>

.verifiedText {
    text-align: center;
}
.verified {
    color: #0a0;
}
.id {
    text-align:center
}
.above {
    text-align:center
}
.ballot {
  margin: 36pt 0;
  box-shadow: 0 2px 4px 0 rgba(0,0,0,.1);
  border: solid 1px;
  border-radius: 3pt;
}
.logo {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
  margin-top: 0.5rem !important;
  margin-right: 1.5rem !important;
  position: absolute;
  right: 0;
}
.download {
    text-align: center;
    max-width: 600pt;
    padding: 0 12pt;
    margin: auto auto 8rem auto;
    line-height: 1.5;
}
</style>
../client/main/constants