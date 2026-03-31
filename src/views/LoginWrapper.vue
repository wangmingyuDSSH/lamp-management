<template>
  <div class="login-wrapper">
    <LoginOverlay @login="handleLogin" />
  </div>
</template>

<script setup>
import LoginOverlay from '../components/LoginOverlay.vue'
import { inject } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showToast = inject('showToast')

const handleLogin = () => {
  // 保存登录状态
  localStorage.setItem('isLoggedIn', 'true')
  showToast('ログインしました')
  // 跳转到默认模块
  router.replace('/kasetsu')
}
</script>

<style scoped>
.login-wrapper {
  width: 100%;
  min-height: 100vh;
}
</style>
