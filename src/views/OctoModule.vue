<template>
  <div class="octo-container">
    <!-- サイドバー -->
    <aside class="octo-sidebar">
      <div class="sidebar-header">
        <div class="logo-icon">
          <i class="fas fa-hard-hat"></i>
        </div>
        <div>
          <h2 class="sidebar-title">Web入出庫</h2>
          <p class="sidebar-subtitle">{{ currentCenter }}</p>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section">工事管理メニュー</div>
        <div 
          v-for="item in menuItems" 
          :key="item.id"
          :class="['sidebar-item', { active: currentScreen === item.id }]"
          @click="switchScreen(item.id)"
        >
          <i :class="item.icon"></i>
          <span>{{ item.name }}</span>
        </div>

        <div class="nav-section mt-6">入出庫管理メニュー</div>
        <div 
          v-for="item in stockMenuItems" 
          :key="item.id"
          :class="['sidebar-item', { active: currentScreen === item.id }]"
          @click="switchScreen(item.id)"
        >
          <i :class="item.icon"></i>
          <span>{{ item.name }}</span>
        </div>

        <div class="nav-section mt-6">照会・管理メニュー</div>
        <div 
          v-for="item in adminMenuItems" 
          :key="item.id"
          :class="['sidebar-item', { active: currentScreen === item.id }]"
          @click="switchScreen(item.id)"
        >
          <i :class="item.icon"></i>
          <span>{{ item.name }}</span>
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar-sm">DU</div>
          <div class="user-details">
            <p class="user-name">Demo User</p>
            <p class="user-role">当社社員</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- メインコンテンツ -->
    <main class="octo-main">
      <header class="main-header">
        <div>
          <h1 class="page-title">{{ currentTitle }}</h1>
          <p class="page-subtitle">{{ currentSubtitle }}</p>
        </div>
        <div class="header-right">
          <div class="sync-status">
            <span class="sync-dot"></span>
            <span>オクト・レンタルシステム連携中</span>
          </div>
          <button class="notification-btn" @click="showNotification">
            <i class="fas fa-bell"></i>
            <span class="notification-dot"></span>
          </button>
        </div>
      </header>

      <div class="content-area">
        <!-- 工事指示一覧 -->
        <InstructionListScreen v-if="currentScreen === 'instructionList'" @navigate="switchScreen" />
        
        <!-- 在庫伝票一覧 -->
        <StockSlipListScreen v-if="currentScreen === 'stockSlipList'" @navigate="switchScreen" @back="switchScreen('instructionList')" />
        
        <!-- 在庫伝票入力 -->
        <StockSlipInputScreen v-if="currentScreen === 'stockSlip'" />
        
        <!-- 工事完了報告 -->
        <CompletionReportScreen v-if="currentScreen === 'completionReport'" />
        
        <!-- 出庫実績登録 -->
        <ShipmentResultScreen v-if="currentScreen === 'shipmentResult'" />
        
        <!-- 入庫実績登録 -->
        <ReceiptResultScreen v-if="currentScreen === 'receiptResult'" />
        
        <!-- マスタ管理 -->
        <OctoMasterMaintenance v-if="currentScreen === 'masterMaintenance'" />
        
        <!-- データ連携状況 -->
        <DataSyncScreen v-if="currentScreen === 'dataSync'" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import InstructionListScreen from '../components/octo/InstructionListScreen.vue'
import StockSlipListScreen from '../components/octo/StockSlipListScreen.vue'
import StockSlipInputScreen from '../components/octo/StockSlipInputScreen.vue'
import CompletionReportScreen from '../components/octo/CompletionReportScreen.vue'
import ShipmentResultScreen from '../components/octo/ShipmentResultScreen.vue'
import ReceiptResultScreen from '../components/octo/ReceiptResultScreen.vue'
import OctoMasterMaintenance from '../components/octo/OctoMasterMaintenance.vue'
import DataSyncScreen from '../components/octo/DataSyncScreen.vue'

const showToast = inject('showToast')
const currentCenter = ref('相模原営業所')
const currentScreen = ref('instructionList')

const menuItems = [
  { id: 'instructionList', name: '工事指示一覧', icon: 'fas fa-clipboard-list' },
  { id: 'stockSlipList', name: '在庫伝票一覧', icon: 'fas fa-list' },
  { id: 'stockSlip', name: '在庫伝票入力', icon: 'fas fa-file-invoice' },
  { id: 'completionReport', name: '工事完了報告', icon: 'fas fa-check-circle' }
]

const stockMenuItems = [
  { id: 'shipmentResult', name: '出庫実績登録', icon: 'fas fa-dolly' },
  { id: 'receiptResult', name: '入庫実績登録', icon: 'fas fa-warehouse' }
]

const adminMenuItems = [
  { id: 'masterMaintenance', name: 'マスタ管理', icon: 'fas fa-database' },
  { id: 'dataSync', name: 'データ連携状況', icon: 'fas fa-sync' }
]

const screens = {
  instructionList: { title: '工事指示一覧', subtitle: '工事指示の検索・照会を行います', id: 'DISP200' },
  stockSlipList: { title: '在庫伝票一覧', subtitle: '在庫伝票の検索・照会を行います', id: 'DISP300' },
  stockSlip: { title: '在庫伝票入力', subtitle: '在庫伝票の入力を行います', id: 'DISP310' },
  completionReport: { title: '工事完了報告', subtitle: '工事完了報告の登録を行います', id: 'DISP240' },
  shipmentResult: { title: '出庫実績登録', subtitle: '出庫実績の登録を行います', id: 'DISP700' },
  receiptResult: { title: '入庫実績登録', subtitle: '入庫実績の登録を行います', id: 'DISP710' },
  masterMaintenance: { title: 'マスタ管理', subtitle: '各種マスタの管理を行います', id: 'DISP800' },
  dataSync: { title: 'データ連携状況', subtitle: 'システム連携状況の確認', id: 'DISP900' }
}

const currentTitle = computed(() => screens[currentScreen.value]?.title || '')
const currentSubtitle = computed(() => screens[currentScreen.value]?.subtitle || '')

const switchScreen = (screenId) => {
  currentScreen.value = screenId
  showToast(`${screens[screenId]?.title} を表示`)
}

const showNotification = () => {
  showToast('新着通知：工事指示が3件更新されました')
}
</script>

<style scoped>
.octo-container {
  display: flex;
  min-height: calc(100vh - 80px);
  background: #f1f5f9;
}

.octo-sidebar {
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

.octo-main {
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

.sync-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #ecfdf5;
  border-radius: 8px;
  font-size: 0.75rem;
  color: #065f46;
}

.sync-dot {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 2s infinite;
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