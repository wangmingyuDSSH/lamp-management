<template>
  <div class="master-detail">
    <div class="detail-header">
      <button class="btn-back" @click="$emit('back')">
        <i class="fas fa-arrow-left mr-2"></i>戻る
      </button>
      <h3>アカウント管理（棚卸権限）</h3>
      <div class="header-actions">
        <button class="btn-mode" @click="toggleMode">
          <i :class="isNewMode ? 'fas fa-edit' : 'fas fa-plus'" class="mr-2"></i>
          {{ isNewMode ? '変更モードへ' : '新規モードへ' }}
        </button>
        <button class="btn-import">
          <i class="fas fa-file-import mr-2"></i>取込
        </button>
      </div>
    </div>

    <!-- フィルター -->
    <div class="filter-bar">
      <div class="filter-field">
        <label>システム</label>
        <select v-model="filters.system" class="form-select">
          <option>すべて</option>
          <option>仮設</option>
          <option>建設</option>
          <option>オクト</option>
        </select>
      </div>
      <div class="filter-field">
        <label>アカウント</label>
        <input type="text" v-model="filters.account" class="form-input" placeholder="アカウントID">
      </div>
      <div class="filter-field">
        <label>アカウント名</label>
        <input type="text" v-model="filters.name" class="form-input" placeholder="ユーザー名">
      </div>
      <button class="btn-search" @click="searchAccounts">
        <i class="fas fa-search mr-2"></i>検索
      </button>
    </div>

    <!-- データテーブル -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>アカウント</th>
            <th>アカウント名</th>
            <th>管理F</th>
            <th>PW</th>
            <th>削除</th>
            <th>IN中</th>
            <th>IN日</th>
            <th>IN時間</th>
            <th>OUT日</th>
            <th>OUT時間</th>
            <th>システム</th>
            <th>倉庫部門</th>
            <th>部門名</th>
           </tr>
        </thead>
        <tbody>
          <tr v-for="account in filteredAccounts" :key="account.id" :class="{ selected: selectedAccount?.id === account.id }" @click="selectAccount(account)">
            <td class="font-mono">{{ account.id }}</td>
            <td>{{ account.name }}</td>
            <td>{{ account.adminF }}</td>
            <td>PW</td>
            <td>{{ account.deleted }}</td>
            <td>{{ account.inDate }}</td>
            <td>{{ account.inTime }}</td>
            <td>{{ account.outDate }}</td>
            <td>{{ account.outTime }}</td>
            <td>{{ account.system }}</td>
            <td>{{ account.department }}</td>
            <td>{{ account.deptName }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 入力エリア -->
    <div class="input-area">
      <div class="input-grid">
        <div class="input-field">
          <label>アカウント</label>
          <input type="text" v-model="form.account" class="form-input" placeholder="12345">
        </div>
        <div class="input-field">
          <label>アカウント名</label>
          <input type="text" v-model="form.name" class="form-input" placeholder="テストユーザー">
        </div>
        <div class="input-field">
          <label>管理F</label>
          <select v-model="form.adminF" class="form-select">
            <option value=""></option>
            <option value="5">5</option>
            <option value="9">9</option>
          </select>
        </div>
        <div class="input-field">
          <label>PW</label>
          <input type="password" v-model="form.password" class="form-input" value="PW">
        </div>
        <div class="input-field">
          <label>システム</label>
          <select v-model="form.system" class="form-select">
            <option>仮設</option>
            <option>建設</option>
            <option>オクト</option>
          </select>
        </div>
        <div class="input-field">
          <label>倉庫部門</label>
          <select v-model="form.department" class="form-select">
            <option>東京1課</option>
            <option>大阪支店</option>
            <option>名古屋支店</option>
          </select>
        </div>
      </div>
      <div class="form-actions">
        <button class="btn-save" @click="saveAccount">
          <i class="fas fa-save mr-2"></i>登録
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'

const showToast = inject('showToast')
const emit = defineEmits(['back'])

const isNewMode = ref(true)
const selectedAccount = ref(null)

const filters = ref({
  system: 'すべて',
  account: '',
  name: ''
})

const accounts = ref([
  { id: '9001', name: '入力者テストユーザー', adminF: '', deleted: '0', inDate: '221028', inTime: '171442', outDate: '221028', outTime: '180206', system: '', department: '', deptName: '' },
  { id: '12345', name: 'テストユーザー', adminF: '', deleted: '0', inDate: '999999', inTime: '999999', outDate: '000000', outTime: '000000', system: '', department: '', deptName: '' },
  { id: '12345', name: 'テストユーザー', adminF: '5', deleted: '0', inDate: '220830', inTime: '175720', outDate: '220830', outTime: '175829', system: '仮設', department: '東京1課', deptName: '東京支店' }
])

const filteredAccounts = computed(() => {
  return accounts.value.filter(acc => {
    if (filters.value.system !== 'すべて' && acc.system !== filters.value.system) return false
    if (filters.value.account && !acc.id.includes(filters.value.account)) return false
    if (filters.value.name && !acc.name.includes(filters.value.name)) return false
    return true
  })
})

const form = ref({
  account: '',
  name: '',
  adminF: '',
  password: 'PW',
  system: '仮設',
  department: '東京1課'
})

const selectAccount = (account) => {
  selectedAccount.value = account
  form.value = {
    account: account.id,
    name: account.name,
    adminF: account.adminF,
    password: 'PW',
    system: account.system || '仮設',
    department: account.department || '東京1課'
  }
}

const toggleMode = () => {
  isNewMode.value = !isNewMode.value
  if (isNewMode.value) {
    form.value = { account: '', name: '', adminF: '', password: 'PW', system: '仮設', department: '東京1課' }
    selectedAccount.value = null
  }
  showToast(isNewMode.value ? '新規モードに切り替えました' : '変更モードに切り替えました')
}

const searchAccounts = () => {
  showToast('検索しました')
}

const saveAccount = () => {
  if (!form.value.account || !form.value.name) {
    showToast('アカウントとアカウント名は必須です')
    return
  }
  showToast('アカウント情報を保存しました')
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
  margin-bottom: 24px;
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
  gap: 12px;
}

.btn-mode, .btn-import {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
}

.btn-mode {
  background: #3b82f6;
  color: white;
  border: none;
}

.btn-import {
  background: #f59e0b;
  color: white;
  border: none;
}

.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  align-items: flex-end;
}

.filter-field {
  flex: 1;
}

.filter-field label {
  display: block;
  font-size: 0.7rem;
  font-weight: 500;
  color: #475569;
  margin-bottom: 4px;
}

.form-input, .form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.75rem;
}

.btn-search {
  padding: 8px 20px;
  background: #475569;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.table-container {
  overflow-x: auto;
  margin-bottom: 24px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.7rem;
}

.data-table th {
  background: #f8fafc;
  padding: 10px;
  text-align: left;
  font-weight: 600;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
}

.data-table td {
  padding: 10px;
  border-bottom: 1px solid #e2e8f0;
}

.data-table tr:hover {
  background: #eff6ff;
  cursor: pointer;
}

.data-table tr.selected {
  background: #dbeafe;
}

.font-mono {
  font-family: monospace;
}

.input-area {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.input-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.input-field label {
  display: block;
  font-size: 0.7rem;
  font-weight: 500;
  color: #475569;
  margin-bottom: 4px;
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