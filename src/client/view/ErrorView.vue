<script setup lang="ts">
import { onMounted } from 'vue'
import { ErrorType } from '../main/error'
import { extractTextFromJson } from './basic'
import text from './elements/text.json'
import { type Language } from '../classes/basics'
defineEmits(['reset'])
const props = defineProps<{
  errorType: ErrorType
  language: Language | undefined
  message?: string
}>()

onMounted(() => {
  console.log(props.errorType)
  if (props.message !== undefined) {
    console.log(props.message)
  }
})
</script>

<template>
    <div class="error" v-if="props.errorType!=ErrorType.CONNECTION&&props.errorType!=ErrorType.PARAMS">
        <h2 class="fail">{{ extractTextFromJson(text.error.rejected, props.language) }}</h2>
    </div>
    <div class="cause">
        <h3 v-if="props.errorType==ErrorType.PARAMS">{{ extractTextFromJson(text.error.params, props.language) }}</h3>
        <h3 v-else-if="props.errorType==ErrorType.CONNECTION">{{ extractTextFromJson(text.error.connection, props.language) }}</h3>
        <h3 v-else-if="props.errorType==ErrorType.EXTERN">{{ extractTextFromJson(text.error.extern, props.language) }}</h3>
        <h3 v-else-if="props.errorType==ErrorType.BALLOT_ACK||props.errorType==ErrorType.BALLOT_ACK_FAIL">{{ extractTextFromJson(text.error.ack, props.language) }}</h3>
        <h3 v-else-if="props.errorType==ErrorType.DECRYPT">{{ extractTextFromJson(text.error.decrypt, props.language) }}</h3>
        <h3 v-else-if="props.errorType==ErrorType.FORMAT">{{ extractTextFromJson(text.error.format, props.language) }}</h3>
        <h3 v-else-if="props.errorType==ErrorType.SDPP">{{ extractTextFromJson(text.error.sdpp, props.language) }}</h3>
        <h3 v-else-if="props.errorType==ErrorType.ZKP_INV">{{ extractTextFromJson(text.error.zkp_inv, props.language) }}</h3>
        <h3 v-else>{{ extractTextFromJson(text.error.other, props.language) }}</h3>
    </div>
    <div class = "action">
        <button
        v-if="props.errorType==ErrorType.EXTERN||props.errorType==ErrorType.FORMAT||props.errorType==ErrorType.CONNECTION||props.errorType==ErrorType.OTHER"
        @click="$emit('reset')">
            {{ extractTextFromJson(text.error.reset, props.language) }}
        </button>
    </div>
</template>

<style scoped>
.error{
    max-width: 500pt;
    min-height: 80pt;
    padding: 0 12pt;
    margin: auto auto 8rem auto;
    line-height: 1.5;
    text-align: center;
    background-color: #ff6666;
    .fail{
        padding-top: 5%;
    }
}
.cause{
    text-align: center;
}
.action {
    text-align: center;
}
</style>
../client/main/error
