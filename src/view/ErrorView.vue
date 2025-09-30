<script setup lang="ts">
import { onMounted } from 'vue'
import { ErrorType } from '../main/error'
import { EnvironmentVariables } from '../main/constants'
import { extractTextFromJson } from './basic'
import text from './elements/text.json'
import type { I18n, Language } from '../classes/basics'
defineEmits(['reset'])
const props = defineProps<{
  errorType: ErrorType
  language: Language | undefined
  title: I18n<string>
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
  <div class="error-box">
    <div class="error" v-if="props.errorType!=ErrorType.CONNECTION&&props.errorType!=ErrorType.PARAMS">
      <h3 class="fail">{{ extractTextFromJson(text.error.rejected, props.language) }}</h3>
    </div>
    <div class="cause">
      <div v-if="props.errorType==ErrorType.PARAMS">
        {{ extractTextFromJson(text.error.params, props.language) }}<br>
        <p>
          {{ extractTextFromJson(text.header.electionReference, props.language) }}<br>
            <em><a :href="EnvironmentVariables.instance.electionUrl">{{ EnvironmentVariables.instance.electionUrl }}</a></em>
        </p>
      </div>
      <div v-else-if="props.errorType==ErrorType.CONNECTION">{{ extractTextFromJson(text.error.connection, props.language) }}</div>
      <div v-else-if="props.errorType==ErrorType.LOGIN">{{ extractTextFromJson(text.error.login, props.language) }}</div>
      <div v-else-if="props.errorType==ErrorType.EXTERN">{{ extractTextFromJson(text.error.extern, props.language) }}</div>
      <div v-else-if="props.errorType==ErrorType.BALLOT_ACK||props.errorType==ErrorType.BALLOT_ACK_FAIL">{{ extractTextFromJson(text.error.ack, props.language) }}</div>
      <div v-else-if="props.errorType==ErrorType.DECRYPT">{{ extractTextFromJson(text.error.decrypt, props.language) }}</div>
      <div v-else-if="props.errorType==ErrorType.FORMAT">{{ extractTextFromJson(text.error.format, props.language) }}</div>
      <div v-else-if="props.errorType==ErrorType.SDPP">{{ extractTextFromJson(text.error.sdpp, props.language) }}</div>
      <div v-else-if="props.errorType==ErrorType.ZKP_INV">{{ extractTextFromJson(text.error.zkp_inv, props.language) }}</div>
      <div v-else-if="props.errorType==ErrorType.VID">{{ extractTextFromJson(text.error.vid, props.language) }}</div>
      <div v-else>{{ extractTextFromJson(text.error.other, props.language) }}</div>
    </div>
  </div>
  <div class="action">
    <button class="reset"
      v-if="props.errorType==ErrorType.LOGIN||props.errorType==ErrorType.EXTERN||props.errorType==ErrorType.FORMAT||props.errorType==ErrorType.CONNECTION||props.errorType==ErrorType.OTHER"
      @click="$emit('reset')">
        {{ extractTextFromJson(text.error.reset, props.language) }}
    </button>
  </div>
</template>

<style scoped>
.error {
  color: #622532;
}

.error-box {
  max-width: 500pt;
  padding: 0 2pt;
  margin: auto auto 4rem auto;
  line-height: 1.5;
  text-align: center;
  background-color: #f8d7da;
  border-radius: 5pt;
  border: 1px solid #966a6d;
  color: #622532;
}

.cause {
  text-align: center;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.action {
  max-width: 400pt;
  padding: 0 2pt;
  margin: auto auto 4rem auto;
  text-align: center;
}

.reset {
  width: 80%;
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
</style>
../main/error
