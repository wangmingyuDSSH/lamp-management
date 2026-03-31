<template>
  <MainLayout @logout="handleLogout" />
</template>

<script setup>
import MainLayout from '../components/MainLayout.vue'
import { inject } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showToast = inject('showToast')

const handleLogout = () => {
  // 清除登录状态
  localStorage.removeItem('isLoggedIn')
  showToast('ログアウトしました')
  // 跳转到登录页
  router.replace('/Lamp')
}
</script>
