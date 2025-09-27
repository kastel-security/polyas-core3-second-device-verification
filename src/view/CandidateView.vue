<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Content, type Language } from '../classes/basics'
import ContentView from './ContentView.vue'
import { type CandidateSpec, type ColumnProperties } from '../classes/ballot'
import text from './elements/text.json'

const props = defineProps<{
  candidate: CandidateSpec
  language: Language | undefined
  result: Uint8Array
  headerLength: number
  properties?: ColumnProperties[]
}>()

const columns = ref(new Array<Content>())
onMounted(() => {
  if (props.candidate.columns.length < props.headerLength) {
    throw new Error('Invalid format')
  }
  for (let i = 0; i < props.candidate.columns.length; i++) {
    if (props.properties === undefined || !props.properties[i].hide) {
      columns.value.push(props.candidate.columns[i])
    }
  }
  for (let i = props.candidate.columns.length; i < props.headerLength; i++) {
    if (props.properties === undefined || !props.properties[i].hide) {
      columns.value.push(Content.generateContentFromJson(text.ballot.defaultColumn))
    }
  }
})
</script>

<template>
    <tr v-if="props.result">
        <td>
            <input v-if="props.candidate.maxVotes==1" type="checkbox" :checked="props.result[0]==1"/>
            <input v-else type="text" value="props.result[0]"/>
        </td>
        <td v-for="entry in columns"
        v-bind:key="columns.indexOf(entry)">
          <ContentView :content="(entry as Content)"
          :language="props.language"/>
        </td>
    </tr>
</template>

<style scoped>
[type=checkbox] {
  accent-color: #404040;
}
</style>
