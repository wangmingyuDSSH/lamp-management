<template>
  <div :class="['toast', { show: visible }]">
    <i :class="iconClass"></i>
    <span>{{ message }}</span>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const visible = ref(false)
const message = ref('')
const iconClass = ref('fas fa-check-circle text-green-400')
let timeout = null

const show = (msg, type = 'success') => {
  if (timeout) clearTimeout(timeout)
  
  message.value = msg
  iconClass.value = type === 'success' 
    ? 'fas fa-check-circle text-green-400' 
    : 'fas fa-exclamation-circle text-red-400'
  visible.value = true
  
  timeout = setTimeout(() => {
    visible.value = false
  }, 2500)
}

defineExpose({ show })
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: #1e293b;
  color: white;
  padding: 12px 24px;
  border-radius: 40px;
  display: flex;
  align-items: center;
  gap: 12px;
  transform: translateY(100px);
  opacity: 0;
  transition: all 0.3s;
  z-index: 1000;
}

.toast.show {
  transform: translateY(0);
  opacity: 1;
}
</style>