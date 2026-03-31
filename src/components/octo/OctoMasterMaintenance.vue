<template>
  <div class="octo-master">
    <div class="screen-card">
      <div class="card-header">
        <h3><i class="fas fa-database mr-2"></i>マスタ管理</h3>
      </div>

      <!-- タブ -->
      <div class="master-tabs">
        <div 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-btn', { active: currentTab === tab.id }]"
          @click="currentTab = tab.id"
        >
          <i :class="tab.icon"></i> {{ tab.name }}
        </div>
      </div>

      <!-- 品番マスタ -->
      <div v-if="currentTab === 'item'" class="tab-content">
        <div class="tab-header">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input type="text" v-model="itemSearch" class="search-input" placeholder="品番・品名で検索">
          </div>
          <button class="btn-add" @click="addItem">
            <i class="fas fa-plus mr-2"></i>新規登録
          </button>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>品番</th>
                <th>品名</th>
                <th>単位</th>
                <th>分類1</th>
                <th>分類2</th>
                <th>操作</th>
				</tr>
               </thead>
            <tbody>
              <tr v-for="item in filteredItems" :key="item.code">
                <td class="font-mono">{{ item.code }} </td>
                <td>{{ item.name }} </td>
                <td>{{ item.unit }} </td>
                <td>{{ item.category1 }} </td>
                <td>{{ item.category2 }} </td>
                <td>
                  <button class="btn-icon btn-edit" @click="editItem(item)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn-icon btn-delete" @click="deleteItem(item)">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
               </tr>
            </tbody>
           </table>
        </div>
      </div>

      <!-- 工事種別マスタ -->
      <div v-if="currentTab === 'workType'" class="tab-content">
        <div class="tab-header">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input type="text" v-model="workSearch" class="search-input" placeholder="工事種別で検索">
          </div>
          <button class="btn-add" @click="addWorkType">
            <i class="fas fa-plus mr-2"></i>新規登録
          </button>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>コード</th>
                <th>工事種別名</th>
                <th>単位</th>
                <th>操作</th>
				</tr>
               </thead>
            <tbody>
              <tr v-for="work in filteredWorks" :key="work.code">
                <td class="font-mono">{{ work.code }} </td>
                <td>{{ work.name }} </td>
                <td>{{ work.unit }} </td>
                <td>
                  <button class="btn-icon btn-edit" @click="editWorkType(work)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn-icon btn-delete" @click="deleteWorkType(work)">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
               </tr>
            </tbody>
           </table>
        </div>
      </div>

      <!-- 施工業者マスタ -->
      <div v-if="currentTab === 'contractor'" class="tab-content">
        <div class="tab-header">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input type="text" v-model="contractorSearch" class="search-input" placeholder="業者名で検索">
          </div>
          <button class="btn-add" @click="addContractor">
            <i class="fas fa-plus mr-2"></i>新規登録
          </button>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>業者コード</th>
                <th>業者名</th>
                <th>担当者</th>
                <th>電話番号</th>
                <th>操作</th>
				</tr>
               </thead>
            <tbody>
              <tr v-for="contractor in filteredContractors" :key="contractor.code">
                <td class="font-mono">{{ contractor.code }} </td>
                <td>{{ contractor.name }} </td>
                <td>{{ contractor.contact }} </td>
                <td>{{ contractor.phone }} </td>
                <td>
                  <button class="btn-icon btn-edit" @click="editContractor(contractor)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn-icon btn-delete" @click="deleteContractor(contractor)">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
               </tr>
            </tbody>
           </table>
        </div>
      </div>

      <!-- ユーザー管理 -->
      <div v-if="currentTab === 'user'" class="tab-content">
        <div class="tab-header">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input type="text" v-model="userSearch" class="search-input" placeholder="ユーザー名で検索">
          </div>
          <button class="btn-add" @click="addUser">
            <i class="fas fa-plus mr-2"></i>新規登録
          </button>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>ユーザーID</th>
                <th>氏名</th>
                <th>ロール</th>
                <th>権限</th>
                <th>操作</th>
				</tr>
               </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td class="font-mono">{{ user.id }} </td>
                <td>{{ user.name }} </td>
                <td>
                  <span :class="['role-badge', getRoleClass(user.role)]">{{ user.roleText }}</span>
                </td>
                <td>{{ user.permission }} </td>
                <td>
                  <button class="btn-icon btn-edit" @click="editUser(user)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn-icon btn-delete" @click="deleteUser(user)">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
               </tr>
            </tbody>
           </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'

const showToast = inject('showToast')
const emit = defineEmits(['back'])

const currentTab = ref('item')

const tabs = [
  { id: 'item', name: '品番マスタ', icon: 'fas fa-box' },
  { id: 'workType', name: '工事種別マスタ', icon: 'fas fa-tools' },
  { id: 'contractor', name: '施工業者マスタ', icon: 'fas fa-building' },
  { id: 'user', name: 'ユーザー管理', icon: 'fas fa-users' }
]

// 品番マスタデータ
const items = ref([
  { code: 'XP3800', name: '支柱3800', unit: '本', category1: '支柱', category2: '3.8m' },
  { code: 'XP1900', name: '支柱1900', unit: '本', category1: '支柱', category2: '1.9m' }
])
const itemSearch = ref('')
const filteredItems = computed(() => {
  if (!itemSearch.value) return items.value
  const keyword = itemSearch.value.toLowerCase()
  return items.value.filter(i => 
    i.code.toLowerCase().includes(keyword) || 
    i.name.toLowerCase().includes(keyword)
  )
})

// 工事種別マスタデータ
const workTypes = ref([
  { code: '01', name: '外部足場工事', unit: '延床' },
  { code: '05', name: 'メッシュシート工事', unit: '掲面積' }
])
const workSearch = ref('')
const filteredWorks = computed(() => {
  if (!workSearch.value) return workTypes.value
  const keyword = workSearch.value.toLowerCase()
  return workTypes.value.filter(w => 
    w.code.includes(keyword) || 
    w.name.toLowerCase().includes(keyword)
  )
})

// 施工業者マスタデータ
const contractors = ref([
  { code: 'C001', name: '○○工務店', contact: '山田太郎', phone: '03-1234-5678' }
])
const contractorSearch = ref('')
const filteredContractors = computed(() => {
  if (!contractorSearch.value) return contractors.value
  const keyword = contractorSearch.value.toLowerCase()
  return contractors.value.filter(c => 
    c.code.toLowerCase().includes(keyword) || 
    c.name.toLowerCase().includes(keyword)
  )
})

// ユーザー管理データ
const users = ref([
  { id: 'admin001', name: '管理者 太郎', role: 'admin', roleText: '当社社員', permission: '全機能' },
  { id: 'cont001', name: '親方 次郎', role: 'contractor', roleText: '施工業者親方', permission: '照会・登録' }
])
const userSearch = ref('')
const filteredUsers = computed(() => {
  if (!userSearch.value) return users.value
  const keyword = userSearch.value.toLowerCase()
  return users.value.filter(u => 
    u.id.toLowerCase().includes(keyword) || 
    u.name.toLowerCase().includes(keyword)
  )
})

const getRoleClass = (role) => {
  const classes = {
    admin: 'role-admin',
    contractor: 'role-contractor',
    worker: 'role-worker'
  }
  return classes[role] || ''
}

const addItem = () => showToast('品番マスタ登録画面を開きました')
const editItem = (item) => showToast(`${item.code}を編集します`)
const deleteItem = (item) => {
  if (confirm(`品番 ${item.code} を削除しますか？`)) {
    items.value = items.value.filter(i => i.code !== item.code)
    showToast('削除しました')
  }
}

const addWorkType = () => showToast('工事種別マスタ登録画面を開きました')
const editWorkType = (work) => showToast(`${work.name}を編集します`)
const deleteWorkType = (work) => {
  if (confirm(`工事種別 ${work.name} を削除しますか？`)) {
    workTypes.value = workTypes.value.filter(w => w.code !== work.code)
    showToast('削除しました')
  }
}

const addContractor = () => showToast('施工業者マスタ登録画面を開きました')
const editContractor = (contractor) => showToast(`${contractor.name}を編集します`)
const deleteContractor = (contractor) => {
  if (confirm(`業者 ${contractor.name} を削除しますか？`)) {
    contractors.value = contractors.value.filter(c => c.code !== contractor.code)
    showToast('削除しました')
  }
}

const addUser = () => showToast('ユーザー登録画面を開きました')
const editUser = (user) => showToast(`${user.name}を編集します`)
const deleteUser = (user) => {
  if (confirm(`ユーザー ${user.name} を削除しますか？`)) {
    users.value = users.value.filter(u => u.id !== user.id)
    showToast('削除しました')
  }
}
</script>

<style scoped>
.octo-master {
  animation: fadeIn 0.3s ease;
}

.screen-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-header {
  padding: 16px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.master-tabs {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 24px;
}

.tab-btn {
  padding: 12px 20px;
  cursor: pointer;
  color: #64748b;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #3b82f6;
}

.tab-btn.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.tab-content {
  padding: 20px 24px;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  position: relative;
  width: 300px;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.875rem;
}

.btn-add {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table th {
  background: #f8fafc;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
}

.data-table td {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.font-mono {
  font-family: monospace;
}

.btn-icon {
  background: none;
  border: none;
  padding: 4px 8px;
  cursor: pointer;
}

.btn-edit {
  color: #3b82f6;
}

.btn-delete {
  color: #ef4444;
}

.role-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
}

.role-admin {
  background: #fef3c7;
  color: #92400e;
}

.role-contractor {
  background: #dbeafe;
  color: #1e40af;
}

.role-worker {
  background: #fce7f3;
  color: #be185d;
}
</style>