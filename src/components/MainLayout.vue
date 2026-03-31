<template>
  <div class="main-system visible">
    <div class="top-nav">
      <div class="logo-area">
        <div class="logo-icon-wrapper">
          <img 
            class="main-logo-img" 
            src="/logo.png" 
            alt="Lamp"
            @error="handleLogoError"
          />
          <div v-if="mainLogoError" class="logo-icon-fallback">
            <i class="fas fa-lightbulb"></i>
          </div>
        </div>
      </div>
      <div class="module-tabs">
        <div 
          v-for="module in modules" 
          :key="module.id"
          :class="['module-tab', { active: currentModule === module.id }]"
          @click="switchModule(module.id)"
        >
          <i :class="module.icon"></i> {{ module.name }}
        </div>
      </div>
      <div class="user-area">
        <span class="user-name-text">デモユーザー</span>
        <div class="user-avatar"><i class="fas fa-user"></i></div>
        <div class="logout-btn" @click="handleLogout">
          <i class="fas fa-sign-out-alt mr-1"></i> ログアウト
        </div>
      </div>
    </div>
    
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" @logout="handleLogout" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script setup>
import { ref, watch, inject, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const emit = defineEmits(['logout'])
const router = useRouter()
const route = useRoute()
const showToast = inject('showToast')

const modules = [
  { id: 'kasetsu', name: '仮設リースWeb入出庫', icon: 'fas fa-truck-loading', path: '/kasetsu' },
  { id: 'octo', name: 'オクトWeb入出庫&工事指示', icon: 'fas fa-hard-hat', path: '/octo' },
  { id: 'inventory', name: 'Web棚卸システム', icon: 'fas fa-warehouse', path: '/inventory' }
]

const currentModule = ref('kasetsu')
const mainLogoError = ref(false)

const switchModule = (moduleId) => {
  const module = modules.find(m => m.id === moduleId)
  if (module) {
    currentModule.value = moduleId
    router.push(module.path)
    showToast(`${module.name} を表示`)
  }
}

const handleLogout = () => {
  emit('logout')
}

const handleLogoError = () => {
  mainLogoError.value = true
}

watch(() => route.path, (newPath) => {
  const module = modules.find(m => m.path === newPath)
  if (module) {
    currentModule.value = module.id
  }
}, { immediate: true })


</script>

<style scoped>
.main-system {
  min-height: 100vh;
  background: #f1f5f9;
}

.top-nav {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: white;
  padding: 0 32px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 0;
}

.logo-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  overflow: visible;
  border: none;
  box-shadow: none;
}

.main-logo-img {
  max-width: 110px;
  max-height: 110px;
  width: auto;
  height: auto;
  object-fit: contain;
  transition: all 0.2s ease;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.logo-icon-fallback {
  width: 96px;
  height: 96px;
  background: transparent;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
}

.logo-icon-fallback i {
  color: #fbbf24;
  font-size: 4.5rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.module-tabs {
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.08);
  padding: 4px;
  border-radius: 48px;
}

.module-tab {
  padding: 8px 28px;
  border-radius: 40px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
}

.module-tab:hover {
  background: rgba(255, 255, 255, 0.15);
}

.module-tab.active {
  background: #fbbf24;
  color: #1e293b;
  font-weight: 600;
}

.user-area {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-name-text {
  font-size: 0.875rem;
}

.user-avatar {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1e293b;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
  border-radius: 40px;
  cursor: pointer;
  font-size: 14px;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>