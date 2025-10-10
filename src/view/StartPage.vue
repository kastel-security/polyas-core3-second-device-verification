<script setup lang="ts">
import { type Language } from '../classes/basics'
import * as text from './elements/text.json'
import { extractTextFromJson } from './basic'
let passwordValue: string = '' // eslint-disable-line

const props = defineProps<{
  language: Language | undefined
  voterId: string
}>()
</script>

<template>
  <div class="start">
    <div class="explanation">
      <text>{{ extractTextFromJson(text.login.textId, props.language) }}</text>
    </div>
    <h4>{{ extractTextFromJson(text.login.voterId, props.language) }}</h4>
    <div class="voterid">{{ props.voterId }}</div>
    <div class="explanation">
      <div class="remark">
        <div class="inner"><text>{{ extractTextFromJson(text.login.remark, props.language) }}</text></div>
      </div>
      <br><br>
    </div>
    <div class="explanation">{{ extractTextFromJson(text.login.text, props.language) }}</div>
    <h4>{{ extractTextFromJson(text.login.loginReq, props.language) }}</h4>
    <form @submit.prevent="$emit('login', passwordValue)">
      <div class="password">
        <input class="input" maxlength="6" autocomplete="new-password one-time-code" :type="passwordFieldType" v-model="passwordValue" />
        <i :class="togglerIcon" id="eye" @click="switchVisibility"></i>
      </div>
      <div class="explanation">{{ extractTextFromJson(text.login.explanation, props.language) }}</div>
      <button class="login" v-on:click="$emit('login', passwordValue)">
        {{ extractTextFromJson(text.login.loginButton, props.language) }}
      </button>
    </form>
  </div>
</template>

<script lang="ts">
export default {
  data () {
    return {
      password: '',
      passwordFieldType: 'password',
      togglerIcon: 'fa fa-eye'
    }
  },
  methods: {
    switchVisibility () {
      this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password'
      this.togglerIcon = this.togglerIcon === 'fa fa-eye' ? 'fa fa-eye-slash' : 'fa fa-eye'
    }
  }
}
</script>

<style scoped>
.start {
  max-width: 400pt;
  margin: auto;
  text-align: center;
  font-size: 12pt;
}

.explanation {
  text-align: justify;
}

h4 {
  text-align: left;
  color: #4a4a4a;
}

.remark {
  background-color: #ebecf0;
  border-left: 15px solid gray;
  box-shadow: 0 0 1px #aaa;
  .inner {
    padding: 10px;
  }
}

.voterid {
  width: 100%;
  margin-top: -4%;
  margin-bottom: 4%;
  font-size: 14pt;
  font-weight: bold;
  border-radius: 5pt;
  border-width: 1px;
  padding: 5pt;
  box-sizing: border-box;
  border: 0.1px solid #bbb;
  background-color: #f8f8f8;
  text-align: left;
  overflow-wrap: break-word;
}

.password {
  margin-top: -4%;
  margin-bottom: 4%;
}

.input {
  width: 100%;
  font-size: 14pt;
  border-radius: 5pt;
  border-width: 1px;
  padding: 5pt;
  box-sizing: border-box;
}

#eye {
  position: absolute;
  margin-top: 7.5pt;
  margin-left: -20pt;
  cursor: pointer;
  color: #404040;
  size: 12pt;
}

.login {
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
</style>
