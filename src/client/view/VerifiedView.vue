<script setup lang="ts">
import { type Core3StandardBallot } from '../classes/ballot'
import { type ImageRef, type Language, type I18n } from '../classes/basics'
import { extractGeneric, extractTextFromJson } from './basic'
import BallotView from './BallotView.vue'

import text from './elements/text.json'
import ContentView from './ContentView.vue'
import { type SecondDeviceLoginResponse } from '../classes/communication'
import { onMounted, ref } from 'vue'
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
    if (start + bytesOfBallotSheet > props.result.length) {
      throw new Error('Result format does not match ')
    }
    ballotResult.value.set(ballotSheet.id, props.result.subarray(start, start + bytesOfBallotSheet))
    start = start + bytesOfBallotSheet
  }
  rendered.value = true
})

function getImgUrl (img: I18n<ImageRef>): string {
  return EnvironmentVariables.instance.electionUrl + '/' + extractGeneric<ImageRef>(img, props.language).url
}

async function downloadPDF (): Promise<void> {
  const doc = generateReceipt(props.receiptText)
  doc.save(`vote-receipt-${props.receiptText[2]}.pdf`)
  await EnvironmentVariables.instance.comm.logReceipt(props.receiptText)
}
</script>

<template>
  <div class="verifiedView">
    <div class="logo" v-if="props.loginResponse.logo">
        <img class="content" :src="getImgUrl(props.loginResponse.logo!)" ref="test"/>
    </div>
    <div class="id">
        <text class="titleKey">{{ extractTextFromJson(text.verified.electionId, props.language) }}</text>
        <text class="data">{{ props.loginResponse.electionId }}</text>
        <br>
        <text class="titleKey">{{ extractTextFromJson(text.verified.voterId, props.language) }}</text>
        <text class="data">{{ props.loginResponse.ballotVoterId }}</text>

        <!-- text class="data">{{ props.loginResponse.publicLabel }}</text -->
        <!-- br> - The total number of ballots per voter was deemed more confusing than helpful, hence we rather omit it. -
        <text class="titleKey">{{ extractTextFromJson(text.verified.label, props.language) }}</text -->
    </div>
    <div class="above">
        <div class="contentAbove" v-if="props.loginResponse.contentAbove">
            <ContentView :content="props.loginResponse.contentAbove" :language="props.language"/>
        </div>
    </div>
    <br>
    <div class="verifiedText">
        <div class="explanation">
            <text>{{ extractTextFromJson(text.verified.explanation, props.language) }}</text>
            <br><br>
            <div class="remark">
              <div class="inner"><text>{{ extractTextFromJson(text.verified.remark, props.language) }}</text></div>
            </div>
        </div>
    </div>
    <div class="allBallots"
    v-if="rendered">
      <div class="ballot"
      v-for="ballot in ballotSheets"
      v-bind:key="ballot.id">
        <BallotView
        :ballot="ballot"
        :result="ballotResult.get(ballot.id)!"
        :language="props.language"/>
      </div>
    </div>
    <div class="download">
        <text class="text">{{ extractTextFromJson(text.verified.downloadText, props.language) }}</text>
        <br>
        <div class="buttonOuter"><button class="buttonInner" v-on:click="downloadPDF">{{ extractTextFromJson(text.verified.download, props.language) }}</button></div>
        <div class="buttonOuter"><button id="completeButton" v-on:click="$emit('confirm')" class="buttonInner">{{ extractTextFromJson(text.verified.completeButton, props.language) }}</button></div>
    </div>
  </div>
</template>

<style scoped>
.verifiedView {
  max-width: 600pt;
  margin: auto;
  font-size: 12pt;
}

.verifiedText {
  text-align: center;
}

.verified {
  color: #0a0;
}

.check {
  font-size: 48px;
}

.id {
  display: inline-block;
}

.titleKey {
  font-weight: bold;
}

.data {
  margin-top: -4%;
  margin-bottom: -2%;
}

.above {
  text-align: center;
}

.explanation {
  text-align: justify;
}

.row:after {
  content: "";
  display: table;
  clear: both;
}

.ballot {
  margin: 36pt 0;
  box-shadow: 0 2px 4px 0 rgba(0,0,0,.1);
  border: solid 1px;
  border-radius: 0pt 8pt 0pt 8pt;
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
  margin-top: 0.5rem !important;
  margin-right: 1.5rem !important;
  align-items: right;
  right: 0;
  .content{
    width: 20%;
  }
}

.remark {
  background-color: #ebecf0;
  border-left: 15px solid gray;
  box-shadow: 0 0 1px #aaa;
  .inner {
    padding: 10px;
  }
}

.download {
  text-align: justify;
  max-width: 600pt;
  padding: 0 12pt;
  margin: auto auto 8rem auto;
  line-height: 1.5;
}

.buttonOuter {
  text-align: center;
}

.buttonInner {
  width: 100%;
  padding-top: 5pt;
  padding-bottom: 5pt;
  font-weight: 700;
  margin-top: 4%;
  font-size: 14pt;
  background-color: #43b494;
  color: white;
  border-radius: 4pt;
  border: 1px solid #43b494;
  cursor: pointer;
}

#completeButton {
  background-color: #4664aa;
  color: white;
}
</style>
../client/main/constants
