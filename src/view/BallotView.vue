<script setup lang="ts">
import { onMounted, ref, vModelCheckbox } from 'vue';
import { CandidateList, Core3StandardBallot } from '../classes/ballot';
import { Language } from '../classes/basics';
import { extractText, extractTextFromJson } from './basic';
import CandidateListView from './CandidateListView.vue'
import ContentView from './ContentView.vue';
import text from "./elements/text.json"

const listResults = ref(new Map<String, Uint8Array>())
const rendered = ref(false)

const props = defineProps<{
    ballot: Core3StandardBallot,
    result: Uint8Array,
    language: Language|undefined
}>()

onMounted(() => {
    let start = 1
    for (let list of props.ballot.lists) {
        const listBytes = 1 + list.candidates.length
        console.log(list.id, listBytes)
        if (start + listBytes > props.result.length) {
            throw new Error("result format does not match ballot formats")
        }
        listResults.value.set(list.id, props.result.subarray(start, start + listBytes))
        start = start + listBytes
    }
    rendered.value = true
})
</script>

<template>
    <div class="title">
        <h2>{{ extractText(props.ballot.title, props.language) }}</h2>
    </div>
    <div class="ext" v-if="ballot.externalIdentification">
        <h3>{{ props.ballot.externalIdentification}}</h3>
    </div>
    <div class="contentAbove" v-if="ballot.contentAbove">
        <ContentView :content="ballot.contentAbove" :language="language"/>
    </div>
    <div class="questions" v-if="rendered">
        <CandidateListView
        v-for="candidateList in ballot.lists"
        :candidateList="candidateList"
        :result="listResults.get(candidateList.id)!"
        :language="language"/>
    </div>
    <div class="invalid" v-if="ballot.showInvalidOption">
        <label for="check">{{ extractTextFromJson(text.ballot.invalidOption, language) }}</label>
        <input type="checkbox" name="check" :checked="result[0]==1"/>
    </div>
    <div class="abstain" v-if="ballot.showAbstainOption">
        <label for="check">{{ extractTextFromJson(text.ballot.abstainOption, language) }}</label>
        <input type="checkbox" name="check" :checked="false"/>
    </div>
    <div class="contentBelow" v-if="ballot.contentBelow">
        <ContentView :content="ballot.contentBelow" :language="language"/>
    </div>
</template>

<style scoped>
.title {
    text-align: center;
    margin:0;
    background: #ddd;
    padding: 2pt 6pt;
    border-bottom: 1px solid #ddd;
}
.ext {
    margin-left: 10pt;
}
.contentAbove {
    margin-left:10pt
}
.questions {
    margin-left:10pt;
    margin-top: 20pt;
    margin-bottom: 10pt;
    box-shadow: 0 2px 4px 0 rgba(0,0,0,.1);
    border: solid 1px;
    border-radius: 3pt;
}
.invalid {
    margin-left: 10pt;
}
.abstain {
    margin-left: 10pt;
}
.contentBelow {
    margin-left: 10pt;
}

</style>
