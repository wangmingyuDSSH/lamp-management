<template>
  <div class="kasetsu-module">
    <div class="module-sidebar">
      <div class="sidebar-header">
        <div class="logo-icon">
          <i class="fas fa-truck-loading"></i>
        </div>
        <div>
          <h2 class="sidebar-title">Web入出庫</h2>
          <p class="sidebar-subtitle">{{ currentCenter }}</p>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section">受付メニュー</div>
        <div 
          v-for="item in receptionMenu" 
          :key="item.id"
          :class="['sidebar-item', { active: currentScreen === item.id }]"
          @click="switchScreen(item.id)"
        >
          <i :class="item.icon"></i>
          <span>{{ item.name }}</span>
        </div>

        <div class="nav-section mt-6">場内作業メニュー</div>
        <div 
          v-for="item in workMenu" 
          :key="item.id"
          :class="['sidebar-item', { active: currentScreen === item.id }]"
          @click="switchScreen(item.id)"
        >
          <i :class="item.icon"></i>
          <span>{{ item.name }}</span>
        </div>

        <div class="nav-section mt-6">照会メニュー</div>
        <div 
          v-for="item in inquiryMenu" 
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
            <p class="user-role">作業者</p>
          </div>
          <button class="logout-btn-sm" @click="handleLogout">
            <i class="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </div>

    <main class="module-main">
      <header class="main-header">
        <div>
          <h1 class="page-title">{{ currentTitle }}</h1>
          <p class="page-subtitle">{{ currentSubtitle }}</p>
        </div>
        <div class="header-right">
          <button class="notification-btn" @click="showNotification">
            <i class="fas fa-bell"></i>
            <span class="notification-dot"></span>
          </button>
        </div>
      </header>

      <div class="content-area">
        <ReceptionScreen v-if="currentScreen === 'reception'" />
        <ReceptionCorrectScreen v-if="currentScreen === 'receptionCorrect'" />
        <TruckMasterScreen v-if="currentScreen === 'truckMaster'" />
        <CarrierMasterScreen v-if="currentScreen === 'carrierMaster'" />
        <PickingScreen v-if="currentScreen === 'picking'" />
        <ShipmentScreen v-if="currentScreen === 'shipment'" />
        <ReceiptScreen v-if="currentScreen === 'receipt'" />
        <MaintenanceScreen v-if="currentScreen === 'maintenance'" />
        <UninspectedScreen v-if="currentScreen === 'uninspected'" />
        <ShipmentListScreen v-if="currentScreen === 'shipmentList'" />
        <ReceiptListScreen v-if="currentScreen === 'receiptList'" />
        <ExitRegistrationScreen v-if="currentScreen === 'exitRegistration'" />
        <EntryExitRecordScreen v-if="currentScreen === 'entryExitRecord'" />
        <ReceiptTransferScreen v-if="currentScreen === 'receiptTransfer'" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue'
import ReceptionScreen from '../components/kasetsu/ReceptionScreen.vue'
import ReceptionCorrectScreen from '../components/kasetsu/ReceptionCorrectScreen.vue'
import TruckMasterScreen from '../components/kasetsu/TruckMasterScreen.vue'
import CarrierMasterScreen from '../components/kasetsu/CarrierMasterScreen.vue'
import PickingScreen from '../components/kasetsu/PickingScreen.vue'
import ShipmentScreen from '../components/kasetsu/ShipmentScreen.vue'
import ReceiptScreen from '../components/kasetsu/ReceiptScreen.vue'
import MaintenanceScreen from '../components/kasetsu/MaintenanceScreen.vue'
import UninspectedScreen from '../components/kasetsu/UninspectedScreen.vue'
import ShipmentListScreen from '../components/kasetsu/ShipmentListScreen.vue'
import ReceiptListScreen from '../components/kasetsu/ReceiptListScreen.vue'
import ExitRegistrationScreen from '../components/kasetsu/ExitRegistrationScreen.vue'
import EntryExitRecordScreen from '../components/kasetsu/EntryExitRecordScreen.vue'
import ReceiptTransferScreen from '../components/kasetsu/ReceiptTransferScreen.vue'

const showToast = inject('showToast')
const emit = defineEmits(['logout'])

const currentCenter = ref('仮設川越')
const currentScreen = ref('reception')

const receptionMenu = [
  { id: 'reception', name: 'センター入場受付', icon: 'fas fa-clipboard-check' },
  { id: 'receptionCorrect', name: '受付情報訂正', icon: 'fas fa-edit' },
  { id: 'truckMaster', name: 'トラックIDメンテ', icon: 'fas fa-truck' },
  { id: 'carrierMaster', name: '運送会社メンテ', icon: 'fas fa-building' },
  { id: 'exitRegistration', name: 'センター退場登録', icon: 'fas fa-sign-out-alt' }
]

const workMenu = [
  { id: 'picking', name: '小出し処理', icon: 'fas fa-dolly' },
  { id: 'shipment', name: '出荷処理', icon: 'fas fa-shipping-fast' },
  { id: 'receipt', name: '入荷/検収処理', icon: 'fas fa-clipboard-list' },
  { id: 'receiptTransfer', name: '入荷振替登録', icon: 'fas fa-exchange-alt' },
  { id: 'maintenance', name: '整備振替処理', icon: 'fas fa-tools' },
  { id: 'uninspected', name: '未検収一覧', icon: 'fas fa-exclamation-circle' }
]

const inquiryMenu = [
  { id: 'shipmentList', name: '出荷伝票照会', icon: 'fas fa-list-alt' },
  { id: 'receiptList', name: '入荷伝票照会', icon: 'fas fa-list' },
  { id: 'entryExitRecord', name: '入退場記録照会', icon: 'fas fa-history' }
]

const screens = {
  reception: { title: 'センター入場受付', subtitle: '運送業者の入場受付を行います', id: 'DISP800' },
  receptionCorrect: { title: '受付情報訂正', subtitle: '受付情報の訂正を行います', id: 'DISP810' },
  truckMaster: { title: 'トラックIDメンテナンス', subtitle: 'トラック情報の管理', id: 'DISP820' },
  carrierMaster: { title: '運送会社メンテナンス', subtitle: '運送会社の表示設定', id: 'DISP830' },
  exitRegistration: { title: 'センター退場登録', subtitle: '運送業者の退場登録を行います', id: 'DISP850' },
  picking: { title: '小出し処理', subtitle: 'ピッキング作業を行います', id: 'DISP100' },
  shipment: { title: '出荷処理', subtitle: '出荷実績の登録', id: 'DISP200/701' },
  receipt: { title: '入荷/検収処理', subtitle: '入荷検収作業を行います', id: 'DISP200' },
  receiptTransfer: { title: '入荷振替登録', subtitle: '入荷データの振替処理', id: 'DISP870' },
  maintenance: { title: '整備振替処理', subtitle: '整備振替の入力・照会', id: 'DISP840' },
  uninspected: { title: '未検収一覧', subtitle: '未検収伝票の一覧表示', id: 'DISP920' },
  shipmentList: { title: '出荷伝票照会', subtitle: '出荷実績の検索・照会', id: 'DISP900' },
  receiptList: { title: '入荷伝票照会', subtitle: '入荷実績の検索・照会', id: 'DISP910' },
  entryExitRecord: { title: '入退場記録照会', subtitle: '入退場記録の検索・照会・CSV出力', id: 'DISP860' }
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

const handleLogout = () => {
  emit('logout')
}
</script>

<style scoped>
.kasetsu-module {
  display: flex;
  height: calc(100vh - 80px);
  background: #f1f5f9;
}

.module-sidebar {
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

.user-details {
  flex: 1;
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

.logout-btn-sm {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
}

.logout-btn-sm:hover {
  color: #ef4444;
}

.module-main {
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