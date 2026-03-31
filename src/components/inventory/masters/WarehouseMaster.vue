<template>
  <div class="master-detail">
    <div class="detail-header">
      <button class="btn-back" @click="$emit('back')">
        <i class="fas fa-arrow-left mr-2"></i>戻る
      </button>
      <h3>棚卸倉庫マスタメンテナンス</h3>
      <div class="header-actions">
        <button class="btn-mode" @click="toggleMode">
          <i :class="isNewMode ? 'fas fa-edit' : 'fas fa-plus'" class="mr-2"></i>
          {{ isNewMode ? '変更モードへ' : '新規モードへ' }}
        </button>
        <button class="btn-allow-all" @click="allowAll">全許可</button>
        <button class="btn-deny-all" @click="denyAll">全不可</button>
      </div>
    </div>

    <!-- システム区分 -->
    <div class="system-selector">
      <label>システム区分:</label>
      <select v-model="systemType" class="form-select w-40">
        <option>仮設</option>
        <option>建設</option>
        <option>オクト</option>
      </select>
    </div>

    <!-- データテーブル -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>部門</th>
            <th>倉庫</th>
            <th>名称</th>
            <th>レ:不可</th>
            <th>削除</th>
           </tr>
        </thead>
        <tbody>
          <tr v-for="warehouse in warehouses" :key="warehouse.code" :class="{ selected: selectedWarehouse?.code === warehouse.code }" @click="selectWarehouse(warehouse)">
            <td>{{ warehouse.department }}</td>
            <td class="font-mono">{{ warehouse.code }}</td>
            <td>{{ warehouse.name }}</td>
            <td class="text-center">
              <input type="checkbox" v-model="warehouse.rentalNg" class="warehouse-checkbox" @click.stop>
            </td>
            <td class="text-center">
              <button class="btn-delete" @click.stop="deleteWarehouse(warehouse.code)">
                <i class="fas fa-trash-alt"></i> 削除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 入力エリア -->
    <div class="input-area">
      <div class="input-grid">
        <div class="input-field">
          <label>部門</label>
          <select v-model="form.department" class="form-select">
            <option>東京1課</option>
            <option>EA1</option>
            <option>EB0</option>
            <option>E01</option>
          </select>
        </div>
        <div class="input-field">
          <label>倉庫</label>
          <input type="text" v-model="form.code" class="form-input" placeholder="312">
        </div>
        <div class="input-field">
          <label>名称</label>
          <input type="text" v-model="form.name" class="form-input" placeholder="テストセンター">
        </div>
        <div class="input-field checkbox-field">
          <label>
            <input type="checkbox" v-model="form.rentalNg" class="mr-2"> レ:不可
          </label>
        </div>
      </div>
      <div class="form-actions">
        <button class="btn-add" @click="addWarehouse">
          <i class="fas fa-plus mr-2"></i>追加
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'

const showToast = inject('showToast')
const emit = defineEmits(['back'])

const isNewMode = ref(true)
const systemType = ref('仮設')
const selectedWarehouse = ref(null)

const warehouses = ref([
  { department: 'EA1', code: '312', name: 'テストセンター', rentalNg: true },
  { department: 'EA1', code: '316', name: 'テストセンター', rentalNg: true },
  { department: 'EA1', code: '317', name: 'テストセンター', rentalNg: true },
  { department: 'EB0', code: '303', name: 'テストセンター', rentalNg: true },
  { department: 'EB0', code: '307', name: 'テストセンター', rentalNg: true },
  { department: 'EB2', code: '306', name: 'テストセンター', rentalNg: true },
  { department: 'E01', code: '99001', name: 'テストセンター', rentalNg: true },
  { department: 'E01', code: '99002', name: 'テストセンター', rentalNg: true }
])

const form = ref({
  department: '東京1課',
  code: '',
  name: '',
  rentalNg: false
})

const selectWarehouse = (warehouse) => {
  selectedWarehouse.value = warehouse
  form.value = { ...warehouse }
}

const toggleMode = () => {
  isNewMode.value = !isNewMode.value
  if (isNewMode.value) {
    form.value = { department: '東京1課', code: '', name: '', rentalNg: false }
    selectedWarehouse.value = null
  }
  showToast(isNewMode.value ? '新規モードに切り替えました' : '変更モードに切り替えました')
}

const allowAll = () => {
  warehouses.value.forEach(w => w.rentalNg = true)
  showToast('すべての倉庫を許可に設定しました')
}

const denyAll = () => {
  warehouses.value.forEach(w => w.rentalNg = false)
  showToast('すべての倉庫を不可に設定しました')
}

const deleteWarehouse = (code) => {
  if (confirm('この倉庫情報を削除しますか？')) {
    warehouses.value = warehouses.value.filter(w => w.code !== code)
    showToast('削除しました')
  }
}

const addWarehouse = () => {
  if (!form.value.code || !form.value.name) {
    showToast('倉庫コードと名称は必須です')
    return
  }
  warehouses.value.push({ ...form.value })
  showToast('倉庫情報を追加しました')
  form.value = { department: '東京1課', code: '', name: '', rentalNg: false }
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

.btn-mode, .btn-allow-all, .btn-deny-all {
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

.btn-allow-all {
  background: #10b981;
  color: white;
  border: none;
}

.btn-deny-all {
  background: #ef4444;
  color: white;
  border: none;
}

.system-selector {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.system-selector label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #475569;
}

.w-40 {
  width: 160px;
}

.table-container {
  overflow-x: auto;
  margin-bottom: 24px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
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

.text-center {
  text-align: center;
}

.warehouse-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.btn-delete {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 0.7rem;
  cursor: pointer;
}

.input-area {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.input-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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

.checkbox-field {
  display: flex;
  align-items: flex-end;
}

.checkbox-field label {
  display: flex;
  align-items: center;
  margin-bottom: 0;
  cursor: pointer;
}

.form-input, .form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.75rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-add {
  padding: 8px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>