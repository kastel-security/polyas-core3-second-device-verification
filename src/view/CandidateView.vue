<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Content, Language } from '../classes/basics';
import ContentView from './ContentView.vue';
import { CandidateSpec, ColumnProperties } from '../classes/ballot';
import text from "./elements/text.json"

const props = defineProps<{
    candidate: CandidateSpec,
    language: Language|undefined,
    result: Uint8Array,
    headerLength: number,
    properties?: Array<ColumnProperties>,
}>()

const columns = ref(new Array<Content>())
onMounted(() => {
    if (props.candidate.columns.length > props.headerLength) {
        throw new Error("Invalid format")
    }
    for (let i = 0; i < props.candidate.columns.length; i++) {
        if (!props.properties || !props.properties[i].hide) {
            columns.value.push(props.candidate.columns[i])
        }
    }
    for (let i = props.candidate.columns.length; i < props.headerLength; i++) {
        if (!props.properties || !props.properties[i].hide) {
            columns.value.push(Content.generateContentFromJson(text.ballot.defaultColumn))
        }
    }
})
</script>

<template>
    <tr v-if="result">
        <td>
            <input v-if="candidate.maxVotes==1" type="checkbox" :checked="result[0]==1"/>
            <input v-else type="text" value="result[0]"/>
        </td>
        <td v-for="entry in columns">
            <ContentView :content="(entry as Content)" :language="language"/>
        </td>
    </tr>
</template>