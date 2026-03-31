<template>
  <div id="app">
    <LoginOverlay v-if="showLogin" @login="handleLogin" />
    <MainLayout v-else @logout="handleLogout" />
    <Toast ref="toast" />
  </div>
</template>

<script setup>
import { ref, provide, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LoginOverlay from './components/LoginOverlay.vue'
import MainLayout from './components/MainLayout.vue'
import Toast from './components/Toast.vue'

const route = useRoute()
const router = useRouter()
const isLoggedIn = ref(false)
const toastRef = ref(null)

// 显示登录页的条件：未登录 或 当前路径是 /Lamp
const showLogin = computed(() => {
  return !isLoggedIn.value || route.path === '/Lamp'
})

const handleLogin = () => {
  isLoggedIn.value = true
  // 如果从 /Lamp 登录，跳转到 /kasetsu
  if (route.path === '/Lamp') {
    router.push('/kasetsu')
  }
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
