<template>
  <div class="master-detail">
    <div class="detail-header">
      <button class="btn-back" @click="$emit('back')">
        <i class="fas fa-arrow-left mr-2"></i>戻る
      </button>
      <h3>論理在庫マスタメンテナンス</h3>
      <div class="header-actions">
        <button class="btn-mode" @click="toggleMode">
          <i :class="isNewMode ? 'fas fa-edit' : 'fas fa-plus'" class="mr-2"></i>
          {{ isNewMode ? '変更モードへ' : '新規モードへ' }}
        </button>
        <button class="btn-replace" @click="openReplaceModal">
          <i class="fas fa-exchange-alt mr-2"></i>選択S入替
        </button>
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
            <th>倉庫部門</th>
            <th>倉庫</th>
            <th>品番</th>
            <th>A</th>
            <th>B</th>
            <th class="text-right">理論数量</th>
            <th>理論日</th>
            <th>削除</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="item in logicalItems" 
            :key="`${item.department}-${item.warehouse}-${item.itemCode}`"
            :class="{ selected: selectedItem?.itemCode === item.itemCode }"
            @click="selectItem(item)"
          >
            <td>{{ item.department }}</td>
            <td class="font-mono">{{ item.warehouse }}</td>
            <td class="font-mono">{{ item.itemCode }}</td>
            <td>{{ item.a }}</td>
            <td>{{ item.b }}</td>
            <td class="text-right font-mono">{{ item.theoryQty.toLocaleString() }}</td>
            <td class="font-mono">{{ item.theoryDate }}</td>
            <td class="text-center">
              <button class="btn-delete" @click.stop="deleteItem(item)">
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
          <label>倉庫部門</label>
          <select v-model="form.department" class="form-select">
            <option>EA1</option>
            <option>EB0</option>
            <option>E01</option>
          </select>
        </div>
        <div class="input-field">
          <label>倉庫</label>
          <input type="text" v-model="form.warehouse" class="form-input" placeholder="312">
        </div>
        <div class="input-field">
          <label>品番</label>
          <input type="text" v-model="form.itemCode" class="form-input" placeholder="ABC1">
        </div>
        <div class="input-field">
          <label>A</label>
          <input type="text" v-model="form.a" class="form-input" placeholder="4">
        </div>
        <div class="input-field">
          <label>B</label>
          <input type="text" v-model="form.b" class="form-input" placeholder="1">
        </div>
        <div class="input-field">
          <label>理論数量</label>
          <input type="number" v-model="form.theoryQty" class="form-input text-right font-mono" placeholder="1234567">
        </div>
      </div>
      <div class="form-actions">
        <button class="btn-save" @click="saveItem">
          <i class="fas fa-save mr-2"></i>変更
        </button>
      </div>
    </div>

    <!-- 選択S入替モーダル -->
    <div v-if="showReplaceModal" class="modal-overlay active" @click="closeReplaceModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>選択S入替</h3>
          <button class="modal-close" @click="closeReplaceModal">×</button>
        </div>
        <div class="modal-body">
          <div class="replace-form">
            <div class="form-field">
              <label>入替元システム</label>
              <select v-model="replaceFrom" class="form-select">
                <option>仮設</option>
                <option>建設</option>
                <option>オクト</option>
              </select>
            </div>
            <div class="form-field">
              <label>入替先システム</label>
              <select v-model="replaceTo" class="form-select">
                <option>仮設</option>
                <option>建設</option>
                <option>オクト</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeReplaceModal">キャンセル</button>
          <button class="btn-confirm" @click="executeReplace">実行</button>
        </div>
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
const selectedItem = ref(null)
const showReplaceModal = ref(false)
const replaceFrom = ref('仮設')
const replaceTo = ref('建設')

const logicalItems = ref([
  { department: 'EA1', warehouse: '312', itemCode: 'ABC1', a: '4', b: '1', theoryQty: 1234567, theoryDate: '000000' },
  { department: 'EA1', warehouse: '312', itemCode: 'ABC1', a: '4', b: '3', theoryQty: 1234567, theoryDate: '000000' },
  { department: 'EA1', warehouse: '312', itemCode: 'ADFRACK', a: '4', b: '1', theoryQty: 1234567, theoryDate: '000000' },
  { department: 'EA1', warehouse: '312', itemCode: 'ADF520CL', a: '4', b: '1', theoryQty: 1234567, theoryDate: '000000' },
  { department: 'EA1', warehouse: '312', itemCode: 'AF0617', a: '4', b: '1', theoryQty: 1234567, theoryDate: '000000' },
  { department: 'EA1', warehouse: '312', itemCode: 'AF0617', a: '4', b: '3', theoryQty: 1234567, theoryDate: '000000' }
])

const form = ref({
  department: 'EA1',
  warehouse: '',
  itemCode: '',
  a: '',
  b: '',
  theoryQty: 0
})

const selectItem = (item) => {
  selectedItem.value = item
  form.value = { ...item }
}

const toggleMode = () => {
  isNewMode.value = !isNewMode.value
  if (isNewMode.value) {
    form.value = { department: 'EA1', warehouse: '', itemCode: '', a: '', b: '', theoryQty: 0 }
    selectedItem.value = null
  }
  showToast(isNewMode.value ? '新規モードに切り替えました' : '変更モードに切り替えました')
}

const saveItem = () => {
  if (!form.value.warehouse || !form.value.itemCode) {
    showToast('倉庫と品番は必須です')
    return
  }
  
  if (isNewMode.value) {
    logicalItems.value.push({ ...form.value, theoryDate: '000000' })
    showToast('論理在庫情報を追加しました')
  } else if (selectedItem.value) {
    const index = logicalItems.value.findIndex(i => 
      i.department === selectedItem.value.department && 
      i.warehouse === selectedItem.value.warehouse && 
      i.itemCode === selectedItem.value.itemCode &&
      i.a === selectedItem.value.a &&
      i.b === selectedItem.value.b
    )
    if (index !== -1) {
      logicalItems.value[index] = { ...form.value, theoryDate: selectedItem.value.theoryDate }
      showToast('論理在庫情報を更新しました')
    }
  }
  form.value = { department: 'EA1', warehouse: '', itemCode: '', a: '', b: '', theoryQty: 0 }
  selectedItem.value = null
}

const deleteItem = (item) => {
  if (confirm('この論理在庫情報を削除しますか？')) {
    const index = logicalItems.value.findIndex(i => 
      i.department === item.department && 
      i.warehouse === item.warehouse && 
      i.itemCode === item.itemCode &&
      i.a === item.a &&
      i.b === item.b
    )
    if (index !== -1) {
      logicalItems.value.splice(index, 1)
      showToast('削除しました')
    }
  }
}

const openReplaceModal = () => {
  replaceFrom.value = '仮設'
  replaceTo.value = '建設'
  showReplaceModal.value = true
}

const closeReplaceModal = () => {
  showReplaceModal.value = false
}

const executeReplace = () => {
  showToast(`${replaceFrom.value}から${replaceTo.value}へ論理在庫情報を入替しました`)
  closeReplaceModal()
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

.btn-mode, .btn-replace {
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

.btn-replace {
  background: #f59e0b;
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
  max-height: 400px;
  overflow-y: auto;
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
  position: sticky;
  top: 0;
  background: #f8fafc;
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

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
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

.btn-save {
  padding: 8px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.modal-header {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  color: white;
  font-weight: bold;
}

.modal-close {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
}

.modal-body {
  padding: 24px;
}

.replace-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel {
  padding: 8px 20px;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  cursor: pointer;
}

.btn-confirm {
  padding: 8px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>