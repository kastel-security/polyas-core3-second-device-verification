<script setup lang="ts">
import { onMounted, ref } from 'vue';
    let passwordValue: string = ""
    let electionTitle: string|undefined
    onMounted(() => {
        electionTitle = "1234"
    })
    function login() {
        console.log("!")
        console.log(passwordValue)
    }
</script>

<template>
    <div id="start">
        <h1>Polyas second device verification tool</h1>
        <h2>Election: {{electionTitle}}</h2>
        <br>
        <p>Enter one time code</p>
        <input 
        type="password"
        v-model="passwordValue"/> 
        <button v-on:click="login">Login</button>
    </div>
</template>

