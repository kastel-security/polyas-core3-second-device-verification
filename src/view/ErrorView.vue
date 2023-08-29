<script setup lang="ts">
import { onMounted } from 'vue';
import { ErrorType } from '../main/error';
import { extractTextFromJson } from './basic';
import text from "./text.json"
import { Language } from '../classes/basics';
defineEmits(['reset'])
const props = defineProps<{
    errorType: ErrorType,
    language: Language|undefined
    message?: string
}>()

onMounted(() => {
    console.log(props.errorType)
    if (props.message) {
        console.log(props.message)
    }
})
</script>

<template>
    <div class="error">
        <h2>{{ extractTextFromJson(text.error.rejected, language) }}</h2>
    </div>
    <div class="cause">
        <h3 v-if="errorType==ErrorType.PARAMS">{{ extractTextFromJson(text.error.params, language) }}</h3>
        <h3 v-else-if="errorType==ErrorType.CONNECTION">{{ extractTextFromJson(text.error.connection, language) }}</h3>
        <h3 v-else-if="errorType==ErrorType.EXTERN">{{ extractTextFromJson(text.error.extern, language) }}</h3>
        <h3 v-else-if="errorType==ErrorType.BALLOT_ACK||errorType==ErrorType.BALLOT_ACK_FAIL">{{ extractTextFromJson(text.error.ack, language) }}</h3>
        <h3 v-else-if="errorType==ErrorType.DECRYPT">{{ extractTextFromJson(text.error.decrypt, language) }}</h3>
        <h3 v-else-if="errorType==ErrorType.FORMAT">{{ extractTextFromJson(text.error.format, language) }}</h3>
        <h3 v-else-if="errorType==ErrorType.SDPP">{{ extractTextFromJson(text.error.sdpp, language) }}</h3>
        <h3 v-else-if="errorType==ErrorType.ZKP_INV">{{ extractTextFromJson(text.error.zkp_inv, language) }}</h3>
        <h3 v-else>{{ extractTextFromJson(text.error.other, language) }}</h3>
    </div>
    <div class = "action">
        <button 
        v-if="errorType==ErrorType.EXTERN||errorType==ErrorType.FORMAT||errorType==ErrorType.CONNECTION||errorType==ErrorType.OTHER"
        @click="$emit('reset')">
            {{ extractTextFromJson(text.error.reset, language) }}
        </button>
    </div>
</template>

<style scoped>
.error{
    text-align: center;
}
.cause{
    text-align: center;
}
.action {
    text-align: center;
}
</style>