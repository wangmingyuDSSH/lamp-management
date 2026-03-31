<template>
  <div class="login-overlay">
    <div class="login-card">
      <img 
        id="loginLogo" 
        class="login-logo-img" 
        src="/logo-login.png" 
        alt="Lamp Logo"
        @error="handleLogoError"
      />
      <div v-if="logoError" class="login-fallback-icon">
        <i class="fas fa-lightbulb"></i>
      </div>
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <input 
            type="text" 
            v-model="userId" 
            class="login-input" 
            placeholder="ユーザーID"
          />
        </div>
        <div class="mb-6">
          <input 
            type="password" 
            v-model="password" 
            class="login-input" 
            placeholder="パスワード"
          />
        </div>
        <button type="submit" class="login-btn">
          <i class="fas fa-sign-in-alt mr-2"></i>ログイン
        </button>
      </form>
      <p class="login-note">※ 任意のID/パスワードでログイン可能</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['login'])
const userId = ref('demo_user')
const password = ref('demo123')
const logoError = ref(false)

const handleLogin = () => {
  emit('login')
}

const handleLogoError = () => {
  logoError.value = true
}
</script>

<style scoped>
.login-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 32px;
  padding: 40px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.login-logo-img {
  width: 260px;
  height: auto;
  max-height: 160px;
  object-fit: contain;
  margin: 0 auto 30px;
  display: block;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2));
  background: transparent;
  border: none;
}

.login-fallback-icon {
  width: 120px;
  height: 120px;
  background: transparent;
  margin: 0 auto 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-fallback-icon i {
  font-size: 5rem;
  color: #fbbf24;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.login-input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  font-size: 15px;
}

.login-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.login-btn {
  width: 100%;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #1e293b;
  padding: 14px;
  border-radius: 16px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(251, 191, 36, 0.4);
}

.login-note {
  text-align: center;
  color: #94a3b8;
  font-size: 0.75rem;
  margin-top: 24px;
}
</style>