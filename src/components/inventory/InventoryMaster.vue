<template>
  <div class="inventory-master">
    <!-- マスタ選択画面 -->
    <div v-if="!selectedMaster" class="master-selector">
      <div class="master-grid">
        <div 
          v-for="master in masters" 
          :key="master.id"
          class="master-card"
          @click="selectMaster(master.id)"
        >
          <div :class="['master-icon', master.iconBg]">
            <i :class="master.icon"></i>
          </div>
          <div class="master-info">
            <h3>{{ master.name }}</h3>
            <p>{{ master.description }}</p>
            <span class="master-count">{{ master.count }}</span>
          </div>
        </div>
      </div>

      <!-- システム連携状況 -->
      <div class="system-status">
        <h4><i class="fas fa-server mr-2"></i>システム連携状況</h4>
        <div class="status-grid">
          <div v-for="system in systems" :key="system.name" class="status-item" :class="system.status">
            <div class="status-icon">
              <i :class="system.icon"></i>
            </div>
            <div class="status-info">
              <div class="status-name">{{ system.name }}</div>
              <div class="status-badge">{{ system.statusText }}</div>
              <div class="status-time">最終同期: {{ system.lastSync }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- アカウント管理 -->
    <AccountMaster v-if="selectedMaster === 'account'" @back="backToSelector" />

    <!-- 倉庫マスタ -->
    <WarehouseMaster v-if="selectedMaster === 'warehouse'" @back="backToSelector" />

    <!-- 品番マスタ -->
    <ItemMaster v-if="selectedMaster === 'item'" @back="backToSelector" />

    <!-- 論理在庫マスタ -->
    <LogicalMaster v-if="selectedMaster === 'logical'" @back="backToSelector" />

    <!-- 汎用マスタ -->
    <GenericMaster v-if="selectedMaster === 'generic'" @back="backToSelector" />

    <!-- データ連携設定 -->
    <IntegrationMaster v-if="selectedMaster === 'integration'" @back="backToSelector" />
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import AccountMaster from './masters/AccountMaster.vue'
import WarehouseMaster from './masters/WarehouseMaster.vue'
import ItemMaster from './masters/ItemMaster.vue'
import LogicalMaster from './masters/LogicalMaster.vue'
import GenericMaster from './masters/GenericMaster.vue'
import IntegrationMaster from './masters/IntegrationMaster.vue'

const selectedMaster = ref(null)

const masters = [
  { id: 'account', name: 'アカウント管理', description: '棚卸権限の設定・ユーザー管理', icon: 'fas fa-users-cog', iconBg: 'bg-blue-100 text-blue-600', count: '8件' },
  { id: 'warehouse', name: '棚卸倉庫マスタ', description: '倉庫・エリア設定', icon: 'fas fa-warehouse', iconBg: 'bg-indigo-100 text-indigo-600', count: '6件' },
  { id: 'item', name: '棚卸品番マスタ', description: '品番情報の管理・登録', icon: 'fas fa-boxes', iconBg: 'bg-purple-100 text-purple-600', count: '1,245件' },
  { id: 'logical', name: '論理在庫マスタ', description: 'システム在庫データの管理', icon: 'fas fa-database', iconBg: 'bg-green-100 text-green-600', count: '連携中' },
  { id: 'generic', name: '汎用マスタ', description: 'コード管理・区分設定', icon: 'fas fa-cogs', iconBg: 'bg-amber-100 text-amber-600', count: '12件' },
  { id: 'integration', name: 'データ連携設定', description: '他システム連携・API設定', icon: 'fas fa-exchange-alt', iconBg: 'bg-red-100 text-red-600', count: '正常' }
]

const systems = [
  { name: '仮設リースレンタル', icon: 'fas fa-check', status: 'online', statusText: '接続正常', lastSync: '5分前' },
  { name: '建設機材レンタル', icon: 'fas fa-check', status: 'online', statusText: '接続正常', lastSync: '3分前' },
  { name: 'オクトレンタル', icon: 'fas fa-check', status: 'online', statusText: '接続正常', lastSync: '1分前' }
]

const selectMaster = (id) => {
  selectedMaster.value = id
}

const backToSelector = () => {
  selectedMaster.value = null
}
</script>

<style scoped>
.inventory-master {
  animation: fadeIn 0.3s ease;
}

.master-selector {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.master-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.master-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  gap: 16px;
}

.master-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.master-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.master-info {
  flex: 1;
}

.master-info h3 {
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 4px;
  font-size: 1rem;
}

.master-info p {
  font-size: 0.7rem;
  color: #64748b;
  margin-bottom: 8px;
}

.master-count {
  display: inline-block;
  padding: 2px 8px;
  background: #f1f5f9;
  border-radius: 12px;
  font-size: 0.65rem;
  color: #475569;
}

.system-status {
  background: #f8fafc;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.system-status h4 {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
  font-size: 0.875rem;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.status-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.status-item.online {
  border-left: 4px solid #10b981;
}

.status-icon {
  width: 40px;
  height: 40px;
  background: #d1fae5;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #10b981;
}

.status-info {
  flex: 1;
}

.status-name {
  font-weight: 600;
  font-size: 0.75rem;
  color: #1e293b;
}

.status-badge {
  font-size: 0.65rem;
  color: #10b981;
  margin: 2px 0;
}

.status-time {
  font-size: 0.6rem;
  color: #94a3b8;
}
</style>