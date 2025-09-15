<script setup lang="ts">
import { type Language } from '../classes/basics'
import * as text from './elements/text.json'
import { extractTextFromJson } from './basic'
let passwordValue: string = ''

const props = defineProps<{
  language: Language | undefined
  voterId: string
}>()
</script>

<template>
    <div class="start">
        <div class="explanation">{{ extractTextFromJson(text.login.text, props.language) }}</div>
        <h4>{{ extractTextFromJson(text.login.voterId, props.language) }}</h4>
        <div class="voterid">{{ props.voterId }}</div>
        <h4>{{ extractTextFromJson(text.login.loginReq, props.language) }}</h4>
        <form @submit.prevent="$emit('login', passwordValue)">
            <div class="password">
                <input id="enter" class="input" maxlength="6" autocomplete="new-password one-time-code" :type="passwordFieldType" v-model="passwordValue" />
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

.voterid {
  margin-top: -4%;
  margin-bottom: -2%;
  margin-left: 24.5%;
  padding-left: 0.75%;
  border: 0.1px solid #bbb;
  width: 50%;
  background-color: #f8f8f8;
}

.password {
  margin-top: -4%;
  margin-bottom: 4%;
}

#enter {
  width: 50%;
  text-align: center;
}

#eye {
  position: absolute;
  margin-top: .25%;
  margin-left: 0.3em;
  cursor: pointer;
  color: gray;
}

.login {
  width: 51.5%;
  font-weight: bold;
  padding-top: 1%;
  padding-bottom: 1%;
  margin-top: 4%;
}
</style>
