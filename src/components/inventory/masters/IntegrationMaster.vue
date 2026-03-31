<template>
  <div class="master-detail">
    <div class="detail-header">
      <button class="btn-back" @click="$emit('back')">
        <i class="fas fa-arrow-left mr-2"></i>戻る
      </button>
      <h3>データ連携設定</h3>
      <div class="header-actions">
        <button class="btn-test" @click="testConnection">
          <i class="fas fa-sync mr-2"></i>接続テスト
        </button>
      </div>
    </div>

    <!-- 連携先一覧 -->
    <div class="integration-list">
      <div v-for="system in systems" :key="system.name" class="integration-card" :class="system.status">
        <div class="card-header">
          <div class="system-icon" :class="system.status === 'online' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'">
            <i :class="system.icon"></i>
          </div>
          <div class="system-info">
            <h4>{{ system.name }}</h4>
            <span class="status-badge" :class="system.status">{{ system.statusText }}</span>
          </div>
          <div class="system-actions">
            <span class="sync-badge" :class="system.syncType">{{ system.syncType === 'auto' ? '自動同期' : '手動同期' }}</span>
            <button class="btn-config" @click="openConfig(system)">
              <i class="fas fa-cog"></i>
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="config-row">
            <div class="config-field">
              <label>APIエンドポイント</label>
              <input type="text" v-model="system.apiEndpoint" class="form-input text-xs" :readonly="!editingSystem || editingSystem.name !== system.name">
            </div>
            <div class="config-field">
              <label>認証方式</label>
              <select v-model="system.authType" class="form-select text-xs" :disabled="!editingSystem || editingSystem.name !== system.name">
                <option>OAuth 2.0</option>
                <option>API Key</option>
                <option>Basic Auth</option>
              </select>
            </div>
            <div class="config-field">
              <label>同期間隔</label>
              <select v-model="system.syncInterval" class="form-select text-xs" :disabled="!editingSystem || editingSystem.name !== system.name">
                <option>5分</option>
                <option>15分</option>
                <option>30分</option>
                <option>1時間</option>
                <option>手動</option>
              </select>
            </div>
            <div class="config-field">
              <label>最終同期</label>
              <p class="last-sync">{{ system.lastSync }}</p>
            </div>
          </div>
          <div v-if="editingSystem?.name === system.name" class="edit-actions">
            <button class="btn-save-config" @click="saveConfig(system)">保存</button>
            <button class="btn-cancel-config" @click="cancelEdit">キャンセル</button>
          </div>
          <div v-else class="edit-trigger">
            <button class="btn-edit-config" @click="startEdit(system)">
              <i class="fas fa-edit mr-1"></i>編集
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 同期データ設定 -->
    <div class="sync-data-section">
      <h4><i class="fas fa-database mr-2"></i>同期データ設定</h4>
      <div class="sync-data-grid">
        <div class="sync-data-panel">
          <h5>受信データ（他システム→Web棚卸）</h5>
          <div class="checkbox-list">
            <label v-for="item in receiveData" :key="item.key" class="checkbox-label">
              <input type="checkbox" v-model="item.enabled">
              <span>{{ item.name }}</span>
            </label>
          </div>
        </div>
        <div class="sync-data-panel">
          <h5>送信データ（Web棚卸→他システム）</h5>
          <div class="checkbox-list">
            <label v-for="item in sendData" :key="item.key" class="checkbox-label">
              <input type="checkbox" v-model="item.enabled">
              <span>{{ item.name }}</span>
            </label>
          </div>
        </div>
      </div>
      <div class="form-actions">
        <button class="btn-save" @click="saveSettings">
          <i class="fas fa-save mr-2"></i>設定保存
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'

const showToast = inject('showToast')
const emit = defineEmits(['back'])

const editingSystem = ref(null)

const systems = ref([
  {
    name: '仮設リースレンタルシステム',
    icon: 'fas fa-check',
    status: 'online',
    statusText: '接続正常',
    syncType: 'auto',
    syncInterval: '15分',
    apiEndpoint: 'https://api.kasetsu.example.com/v1',
    authType: 'OAuth 2.0',
    lastSync: '2026/03/23 18:01:23'
  },
  {
    name: '建設機材レンタルシステム',
    icon: 'fas fa-check',
    status: 'online',
    statusText: '接続正常',
    syncType: 'auto',
    syncInterval: '15分',
    apiEndpoint: 'https://api.kensetsu.example.com/v2',
    authType: 'OAuth 2.0',
    lastSync: '2026/03/23 18:03:45'
  },
  {
    name: 'オクトレンタルシステム',
    icon: 'fas fa-check',
    status: 'online',
    statusText: '接続正常',
    syncType: 'manual',
    syncInterval: '手動',
    apiEndpoint: 'https://api.octo.example.com/v1',
    authType: 'API Key',
    lastSync: '2026/03/23 17:55:12'
  }
])

const receiveData = ref([
  { key: 'stock', name: '在庫データ', enabled: true },
  { key: 'item', name: '品目マスタ', enabled: true },
  { key: 'warehouse', name: '倉庫マスタ', enabled: true },
  { key: 'customer', name: '取引先マスタ', enabled: false }
])

const sendData = ref([
  { key: 'result', name: '棚卸結果', enabled: true },
  { key: 'adjust', name: '差異調整データ', enabled: true },
  { key: 'approval', name: '承認履歴', enabled: false }
])

const testConnection = () => {
  showToast('全システムの接続テストを実行しました')
}

const openConfig = (system) => {
  showToast(`${system.name}の設定画面を開きました`)
}

const startEdit = (system) => {
  editingSystem.value = { ...system }
}

const saveConfig = (system) => {
  const index = systems.value.findIndex(s => s.name === system.name)
  if (index !== -1) {
    systems.value[index] = { ...editingSystem.value }
    showToast(`${system.name}の設定を保存しました`)
  }
  editingSystem.value = null
}

const cancelEdit = () => {
  editingSystem.value = null
}

const saveSettings = () => {
  showToast('連携設定を保存しました')
}
</script>

<style scoped>
.master-detail {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.btn-back {
  padding: 6px 12px;
  background: #f1f5f9;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.detail-header h3 {
  flex: 1;
  font-weight: bold;
  color: #1e293b;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.btn-test {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  background: #10b981;
  color: white;
  border: none;
}

.integration-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.integration-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
}

.integration-card.online {
  border-left: 4px solid #10b981;
}

.card-header {
  padding: 16px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.system-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.bg-green-100 {
  background: #d1fae5;
}

.text-green-600 {
  color: #10b981;
}

.system-info {
  flex: 1;
}

.system-info h4 {
  font-weight: 600;
  font-size: 0.875rem;
  color: #1e293b;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.65rem;
}

.status-badge.online {
  background: #d1fae5;
  color: #065f46;
}

.system-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sync-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.65rem;
}

.sync-badge.auto {
  background: #dbeafe;
  color: #1e40af;
}

.sync-badge.manual {
  background: #fef3c7;
  color: #92400e;
}

.btn-config {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  font-size: 1rem;
}

.btn-config:hover {
  color: #3b82f6;
}

.card-body {
  padding: 16px;
}

.config-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 12px;
}

.config-field label {
  display: block;
  font-size: 0.65rem;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 4px;
}

.form-input, .form-select {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 0.7rem;
}

.text-xs {
  font-size: 0.7rem;
}

.last-sync {
  font-size: 0.7rem;
  color: #475569;
  margin: 0;
  padding: 6px 8px;
  background: #f1f5f9;
  border-radius: 4px;
}

.edit-trigger {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.btn-edit-config {
  padding: 4px 12px;
  background: #f1f5f9;
  border: none;
  border-radius: 4px;
  font-size: 0.7rem;
  cursor: pointer;
}

.btn-edit-config:hover {
  background: #e2e8f0;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

.btn-save-config {
  padding: 4px 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.7rem;
  cursor: pointer;
}

.btn-cancel-config {
  padding: 4px 12px;
  background: #e2e8f0;
  border: none;
  border-radius: 4px;
  font-size: 0.7rem;
  cursor: pointer;
}

.sync-data-section {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.sync-data-section h4 {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
  font-size: 0.875rem;
}

.sync-data-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 20px;
}

.sync-data-panel h5 {
  font-weight: 500;
  color: #475569;
  margin-bottom: 12px;
  font-size: 0.75rem;
}

.checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
}

.checkbox-label:hover {
  background: #f1f5f9;
}

.checkbox-label input {
  width: 14px;
  height: 14px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-save {
  padding: 8px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>