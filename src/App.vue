<template>
  <div id="app">
    <router-view />
    <Toast ref="toast" />
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import Toast from './components/Toast.vue'

const toastRef = ref(null)

const showToast = (message, type = 'success') => {
  if (toastRef.value) {
    toastRef.value.show(message, type)
  }
}

provide('showToast', showToast)
</script>

<style>
#app {
  width: 100%;
  min-height: 100vh;
}
</style>
