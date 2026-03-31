<template>
  <div class="inventory-container">
    <!-- サイドバー -->
    <aside class="inventory-sidebar">
      <div class="sidebar-header">
        <div class="logo-icon">
          <i class="fas fa-warehouse"></i>
        </div>
        <div>
          <h2 class="sidebar-title">Web棚卸</h2>
          <p class="sidebar-subtitle">{{ currentWarehouse }}</p>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section">棚卸業務</div>
        <div 
          v-for="item in menuItems" 
          :key="item.id"
          :class="['sidebar-item', { active: currentScreen === item.id }]"
          @click="switchScreen(item.id)"
        >
          <i :class="item.icon"></i>
          <span>{{ item.name }}</span>
        </div>

        <div class="nav-section mt-6">データ連携</div>
        <div 
          v-for="item in dataMenuItems" 
          :key="item.id"
          :class="['sidebar-item', { active: currentScreen === item.id }]"
          @click="switchScreen(item.id)"
        >
          <i :class="item.icon"></i>
          <span>{{ item.name }}</span>
        </div>

        <div class="nav-section mt-6">マスタ管理</div>
        <div 
          class="sidebar-item" 
          :class="{ active: currentScreen === 'master' }"
          @click="switchScreen('master')"
        >
          <i class="fas fa-cog"></i>
          <span>マスタメンテ</span>
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar-sm">YS</div>
          <div class="user-details">
            <p class="user-name">山田 太郎</p>
            <p class="user-role">管理者</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- メインコンテンツ -->
    <main class="inventory-main">
      <header class="main-header">
        <div>
          <h1 class="page-title">{{ currentTitle }}</h1>
          <p class="page-subtitle">{{ currentSubtitle }}</p>
        </div>
        <div class="header-right">
          <div class="date-display">
            <i class="fas fa-calendar-alt mr-2"></i>{{ currentDate }}
          </div>
          <button class="notification-btn" @click="showNotification">
            <i class="fas fa-bell"></i>
            <span class="notification-dot"></span>
          </button>
        </div>
      </header>

      <div class="content-area">
        <!-- ダッシュボード -->
        <InventoryDashboard v-if="currentScreen === 'dashboard'" @navigate="switchScreen" />
        
        <!-- 付箋入力 -->
        <InventoryInput v-if="currentScreen === 'inventoryInput'" />
        
        <!-- 付箋一覧・検索 -->
        <InventoryList v-if="currentScreen === 'inventoryList'" />
        
        <!-- 付箋ラベル出力 -->
        <InventoryLabelPrint v-if="currentScreen === 'labelPrint'" />
        
        <!-- 棚卸結果取込・調整 -->
        <InventoryImport v-if="currentScreen === 'import'" />
        
        <!-- 集計・差異表 -->
        <InventoryReports v-if="currentScreen === 'reports'" />
        
        <!-- 残高確認書 -->
        <InventoryBalanceConfirm v-if="currentScreen === 'balanceConfirm'" />
        
        <!-- 実地DL -->
        <InventoryActualDL v-if="currentScreen === 'actualDL'" />
        
        <!-- 論理DL -->
        <InventoryLogicalDL v-if="currentScreen === 'logicalDL'" />
        
        <!-- マスタメンテナンス -->
        <InventoryMaster v-if="currentScreen === 'master'" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue'
import InventoryDashboard from '../components/inventory/InventoryDashboard.vue'
import InventoryInput from '../components/inventory/InventoryInput.vue'
import InventoryList from '../components/inventory/InventoryList.vue'
import InventoryLabelPrint from '../components/inventory/InventoryLabelPrint.vue'
import InventoryImport from '../components/inventory/InventoryImport.vue'
import InventoryReports from '../components/inventory/InventoryReports.vue'
import InventoryBalanceConfirm from '../components/inventory/InventoryBalanceConfirm.vue'
import InventoryMaster from '../components/inventory/InventoryMaster.vue'
import InventoryActualDL from '../components/inventory/InventoryActualDL.vue'
import InventoryLogicalDL from '../components/inventory/InventoryLogicalDL.vue'

const showToast = inject('showToast')
const currentWarehouse = ref('東京倉庫')
const currentScreen = ref('dashboard')

const currentDate = computed(() => {
  const today = new Date()
  return today.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
})

const menuItems = [
  { id: 'dashboard', name: 'ダッシュボード', icon: 'fas fa-home' },
  { id: 'inventoryInput', name: '付箋入力', icon: 'fas fa-edit' },
  { id: 'inventoryList', name: '付箋一覧・検索', icon: 'fas fa-list' },
  { id: 'labelPrint', name: '付箋ラベル出力', icon: 'fas fa-print' }
]

const dataMenuItems = [
  { id: 'reports', name: '集計・差異表', icon: 'fas fa-chart-bar' },
  { id: 'balanceConfirm', name: '残高確認書', icon: 'fas fa-file-contract' },
  { id: 'import', name: '棚卸結果取込', icon: 'fas fa-file-import' },
  { id: 'actualDL', name: '実地DL', icon: 'fas fa-download' },
  { id: 'logicalDL', name: '論理DL', icon: 'fas fa-database' }
]

const screens = {
  dashboard: { title: 'ダッシュボード', subtitle: '在庫状況の概要' },
  inventoryInput: { title: '付箋入力', subtitle: '棚卸データの新規登録' },
  inventoryList: { title: '付箋一覧・検索', subtitle: '登録データの照会・編集・削除' },
  labelPrint: { title: '付箋ラベル出力', subtitle: '棚卸済付箋の印刷' },
  import: { title: '棚卸結果取込・調整', subtitle: 'データ取込と在庫調整' },
  reports: { title: '棚卸集計表・差異表', subtitle: '各種帳票の出力' },
  balanceConfirm: { title: '残高確認書・結果登録', subtitle: '他社在庫の確認と結果登録' },
  actualDL: { title: '実地DL', subtitle: '実地棚卸データのダウンロード' },
  logicalDL: { title: '論理DL', subtitle: '論理在庫データのダウンロード' },
  master: { title: 'マスタメンテナンス', subtitle: '基本データの管理' }
}

const currentTitle = computed(() => screens[currentScreen.value]?.title || '')
const currentSubtitle = computed(() => screens[currentScreen.value]?.subtitle || '')

const switchScreen = (screenId) => {
  currentScreen.value = screenId
  showToast(`${screens[screenId]?.title} を表示`)
}

const showNotification = () => {
  showToast('新着通知があります')
}
</script>

<style scoped>
.inventory-container {
  display: flex;
  min-height: calc(100vh - 80px);
  background: #f1f5f9;
}

.inventory-sidebar {
  width: 280px;
  background: white;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  position: sticky;
  top: 80px;
  overflow-y: auto;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
}

.sidebar-title {
  font-size: 0.875rem;
  font-weight: bold;
  color: #1e293b;
}

.sidebar-subtitle {
  font-size: 0.75rem;
  color: #64748b;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 0;
}

.nav-section {
  padding: 8px 20px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.5px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  font-size: 0.875rem;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.sidebar-item:hover {
  background: #f8fafc;
  border-left-color: #3b82f6;
  color: #3b82f6;
}

.sidebar-item.active {
  background: #eff6ff;
  border-left-color: #3b82f6;
  color: #3b82f6;
  font-weight: 500;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #e2e8f0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 12px;
}

.user-avatar-sm {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
}

.user-role {
  font-size: 0.7rem;
  color: #64748b;
}

.inventory-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-header {
  background: white;
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
}

.page-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #1e293b;
}

.page-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 4px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.date-display {
  font-size: 0.875rem;
  color: #475569;
  background: #f1f5f9;
  padding: 6px 12px;
  border-radius: 8px;
}

.notification-btn {
  position: relative;
  padding: 8px;
  background: none;
  border: none;
  color: #475569;
  cursor: pointer;
  transition: color 0.2s;
}

.notification-btn:hover {
  color: #3b82f6;
}

.notification-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.mt-6 {
  margin-top: 24px;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
vue