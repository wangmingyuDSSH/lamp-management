<template>
  <div id="app">
    <LoginOverlay v-if="!isLoggedIn" @login="handleLogin" />
    <MainLayout v-else @logout="handleLogout" />
    <Toast ref="toast" />
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import LoginOverlay from './components/LoginOverlay.vue'
import MainLayout from './components/MainLayout.vue'
import Toast from './components/Toast.vue'

const isLoggedIn = ref(false)
const toastRef = ref(null)

const handleLogin = () => {
  isLoggedIn.value = true
  showToast('ログインしました')
}

const handleLogout = () => {
  isLoggedIn.value = false
  showToast('ログアウトしました')
}

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
