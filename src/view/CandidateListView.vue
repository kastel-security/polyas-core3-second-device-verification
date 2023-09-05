<script setup lang="ts">
import { onMounted, ref, vModelCheckbox } from 'vue';
import { CandidateList } from '../classes/ballot';
import { Content, I18n, Language } from '../classes/basics';
import ContentView from './ContentView.vue';
import { extractText, extractTextFromJson } from './basic';
import text from "./elements/text.json"
import CandidateView from './CandidateView.vue';

const props = defineProps<{
    candidateList: CandidateList,
    result: Uint8Array
    language: Language|undefined
}>()

const columnHeaders = ref<Array<I18n<string>>>()
const columnProperties = ref(props.candidateList.columnProperties)
const candidateResult = ref(new Map<string, Uint8Array>())
const rendered = ref(false)
onMounted(() => {
    const len = props.candidateList.columnHeaders.length
    columnHeaders.value = new Array()
    for (let i = 0; i < len; i++) {
        if (props.candidateList.columnProperties && !props.candidateList.columnProperties[i].hide)
        columnHeaders.value.push(props.candidateList.columnHeaders[i])
    }
    let start = 1
    for (let candidate of props.candidateList.candidates) {
        if (start + 1 > props.result.length) {
            throw new Error("Result format does not match ballot format")
        }
        candidateResult.value.set(candidate.id, props.result.subarray(start, start + 1))
        start++
    }
    rendered.value = true
})
</script>

<template>
    <div class="title" v-if="candidateList.title">
        <h3>{{ extractText(candidateList.title, language) }}</h3>
    </div>
    <div class="id" v-else>
        <h3>{{ candidateList.id }}</h3>
    </div>
    <div class="ext" v-if="candidateList.externalIdentification">
        <h4>{{ props.candidateList.externalIdentification }}</h4>
    </div>
    <div class="above" v-if="candidateList.contentAbove">
        <ContentView :content="candidateList.contentAbove!" :language="language"/>
    </div> 
    <div class="list">
        <div class="binaryListVote" v-if="candidateList.maxVotesForList == 1">
            <label for="listVote">{{ extractTextFromJson(text.ballot.listVote, props.language) }}</label>
            <input type="checkbox" name="listVote" :checked="result[0]==1"/>
        </div>
        <div class="listVote" v-if="candidateList.maxVotesForList > 1">
            <label for="listVote">{{ extractTextFromJson(text.ballot.listVote, props.language) }}</label>
            <input type="checkbox" name="listVote" value="result[0]"/>
        </div>
    </div>
    <div class="candidates" v-if="rendered">
        <table>
            <tr>
                <th></th>
                <th v-for="columnHeader in columnHeaders">{{ extractTextFromJson(columnHeader, language) }}</th>
            </tr>
            <CandidateView v-for="candidate in candidateList.candidates" 
            :candidate="candidate" 
            :properties="columnProperties"
            :language="language" 
            :headerLength="candidateList.columnHeaders.length"
            :result="candidateResult.get(candidate.id)!"/>
        </table>
    </div>
</template>

<style scoped>
.title {
    text-align: left;
    margin:0;
    background: #444;
    padding: 2pt 6pt;
    border-bottom: 1px solid #444;
    height: fit-content;
    color: #fff;
}
</style>