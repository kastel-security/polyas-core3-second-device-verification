<script setup lang="ts">
import { Ballot, Core3StandardBallot } from '../classes/ballot';
import { Content, ImageRef, Language, I18n} from '../classes/basics';
import { extractGeneric, extractText, extractTextFromJson } from './basic';
import BallotView from './BallotView.vue';

import text from "./text.json"
import ContentView from './ContentView.vue';
import { SecondDeviceLoginResponse } from '../classes/communication';
import { onMounted, ref } from 'vue';
import {jsPDF } from "jspdf"
import { LanguageServiceMode, PropertySignature } from 'typescript';

const props = defineProps<{
    loginResponse: SecondDeviceLoginResponse
    result: Uint8Array,
    language: Language|undefined,
    receiptText: Array<string>
}>()
const ballotResult = ref(new Map<string, Uint8Array>())
const ballotSheets = ref<Array<Core3StandardBallot>>()
const rendered = ref(false)
onMounted(() => {
    ballotSheets.value = new Array()
    const ballotSheetLabels = props.loginResponse.publicLabel.split(":")
    for (let ballotSheet of props.loginResponse.initialMessageDecoded.secondDeviceParameterDecoded.ballots) {
        const ballotSheetStandard = ballotSheet as Core3StandardBallot
        if (ballotSheetLabels.includes(ballotSheetStandard.id)) {
            ballotSheets.value.push(ballotSheetStandard)
        }
    }
    let start = 0
    for (let ballotSheet of ballotSheets.value) {
        let bytesOfBallotSheet = 1
        for (let list of ballotSheet.lists) {
            bytesOfBallotSheet += list.candidates.length + 1
        }
        if (start + bytesOfBallotSheet < props.result.length) {
            throw new Error("Result format does not match ")
        }
        ballotResult.value.set(ballotSheet.id, props.result.subarray(start, start + bytesOfBallotSheet))
        start = start + bytesOfBallotSheet
    }
    rendered.value = true
})

function getImgUrl(img: I18n<ImageRef>): string {
    return extractGeneric<ImageRef>(img, props.language).url as string
  }

function downloadPDF() {
    console.log("clicked")
    const doc = new jsPDF('p', 'px', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const left = 60;
    doc.setFontSize(16)
    doc.text(props.receiptText, 60, 120, {maxWidth:pageWidth - 2*left})

    doc.save(`vote-receipt-${doc.text[2]}.pdf`)

}
</script>

<template>
    <div class="logo" v-if="loginResponse.logo">
        <img :src="getImgUrl(loginResponse.logo!)" ref="test"/>
    </div>
    <div class="verifiedText">
        <h1 class="verified">{{ extractTextFromJson(text.verified.verified, props.language) }}</h1>
        <text>{{ extractTextFromJson(text.verified.explanation, props.language) }}</text>
    </div>
    <br>
    <div class="id">
        <text>{{ extractTextFromJson(text.verified.electionId, language) + props.loginResponse.electionId }}</text>
        <br>
        <text>{{ extractTextFromJson(text.verified.voterId, language) + props.loginResponse.ballotVoterId }}</text>
        <br>
        <text>{{ extractTextFromJson(text.verified.label, language) + props.loginResponse.publicLabel }}</text>
    </div>
    <div class="above">
        <div class="messages">
            <text v-for="key in loginResponse.messages.keys()">key: {{ extractText(loginResponse.messages.get(key), language) }}</text>
        </div>
        <br>
        <div class="contentAbove" v-if="loginResponse.contentAbove">
            <ContentView :content="loginResponse.contentAbove" :language="language"/>
        </div>
    </div>
    <div class="ballot" v-if="rendered">
        <BallotView
        v-for="ballot in ballotSheets"
        :ballot="ballot"
        :result="ballotResult.get(ballot.id)!"
        :language="language"/>
    </div>
    <div class="download">
        <text class="text">{{ extractTextFromJson(text.verified.downloadText, language) }}</text>
        <br>
        <button v-on:click="downloadPDF">{{ extractTextFromJson(text.verified.download, language) }}</button>
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