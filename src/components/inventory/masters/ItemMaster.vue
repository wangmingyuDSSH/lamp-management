<template>
  <div class="master-detail">
    <div class="detail-header">
      <button class="btn-back" @click="$emit('back')">
        <i class="fas fa-arrow-left mr-2"></i>戻る
      </button>
      <h3>棚卸品番マスタメンテナンス</h3>
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
      <select v-model="systemType" class="form-select w-24">
        <option>仮設</option>
        <option>建設</option>
        <option>オクト</option>
      </select>
    </div>

    <!-- 検索バー -->
    <div class="search-bar">
      <div class="search-wrapper">
        <i class="fas fa-search search-icon"></i>
        <input type="text" v-model="searchKeyword" class="search-input" placeholder="品番・品名で検索">
      </div>
      <button class="btn-search" @click="searchItems">検索</button>
    </div>

    <!-- データテーブル -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>品番</th>
            <th>略名</th>
            <th>分類1</th>
            <th>分類2</th>
            <th>分類3</th>
            <th class="text-right">単価1</th>
            <th class="text-right">KG</th>
            <th>予備コード1</th>
            <th>予備コード2</th>
            <th>予備コード3</th>
			</tr>
           </thead>
        <tbody>
          <tr 
            v-for="item in filteredItems" 
            :key="item.code"
            :class="{ selected: selectedItem?.code === item.code }"
            @click="selectItem(item)"
          >
            <td class="font-mono">{{ item.code }}</td>
            <td>{{ item.shortName }}</td>
            <td>{{ item.category1 }}</td>
            <td>{{ item.category2 }}</td>
            <td>{{ item.category3 }}</td>
            <td class="text-right">{{ item.price.toLocaleString() }}</td>
            <td class="text-right">{{ item.weight.toFixed(3) }}</td>
            <td>{{ item.reserve1 }}</td>
            <td>{{ item.reserve2 }}</td>
            <td>{{ item.reserve3 }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 入力エリア -->
    <div class="input-area">
      <div class="input-grid">
        <div class="input-field">
          <label>品番</label>
          <input type="text" v-model="form.code" class="form-input" placeholder="AB10">
        </div>
        <div class="input-field">
          <label>略名</label>
          <input type="text" v-model="form.shortName" class="form-input" placeholder="安全ブロック">
        </div>
        <div class="input-field">
          <label>分類1</label>
          <select v-model="form.category1" class="form-select">
            <option>FRZ安全器具類</option>
            <option>ASA仮囲い鋼板</option>
            <option>ASIアルフェンス</option>
          </select>
        </div>
        <div class="input-field">
          <label>単価1</label>
          <input type="number" v-model="form.price" class="form-input text-right" placeholder="1234567">
        </div>
        <div class="input-field">
          <label>KG</label>
          <input type="number" step="0.001" v-model="form.weight" class="form-input text-right" placeholder="4.900">
        </div>
        <div class="input-field">
          <label>予備コード1</label>
          <input type="text" v-model="form.reserve1" class="form-input">
        </div>
        <div class="input-field">
          <label>予備コード2</label>
          <input type="text" v-model="form.reserve2" class="form-input">
        </div>
        <div class="input-field">
          <label>予備コード3</label>
          <input type="text" v-model="form.reserve3" class="form-input">
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
            <div class="form-field checkbox-field">
              <label>
                <input type="checkbox" v-model="replaceAll" class="mr-2"> 全品番対象
              </label>
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
import { ref, computed, inject } from 'vue'

const showToast = inject('showToast')
const emit = defineEmits(['back'])

const isNewMode = ref(true)
const systemType = ref('仮設')
const searchKeyword = ref('')
const selectedItem = ref(null)
const showReplaceModal = ref(false)
const replaceFrom = ref('仮設')
const replaceTo = ref('建設')
const replaceAll = ref(false)

const items = ref([
  { code: 'AB10', shortName: '安全ブロック', category1: 'FRZ安全器具類', category2: '', category3: '', price: 1234567, weight: 4.900, reserve1: '', reserve2: '', reserve3: '' },
  { code: 'AB20', shortName: '安全ブロック', category1: 'FRZ安全器具類', category2: '', category3: '', price: 1234567, weight: 6.700, reserve1: '', reserve2: '', reserve3: '' },
  { code: 'ADFHP', shortName: 'アドフラット用巾木', category1: 'ASA仮囲い鋼板', category2: '', category3: '', price: 1234567, weight: 4.800, reserve1: '', reserve2: '', reserve3: '' },
  { code: 'ADF5248E', shortName: 'アドフラットエルス48', category1: 'ASA仮囲い鋼板', category2: '', category3: '', price: 1234567, weight: 12.000, reserve1: '', reserve2: '', reserve3: '' },
  { code: 'ADF530CW', shortName: 'アドフラットコーナー', category1: 'ASA仮囲い鋼板', category2: '', category3: '', price: 1234567, weight: 16.800, reserve1: '', reserve2: '', reserve3: '' },
  { code: 'AF0617', shortName: 'アルフェンス061', category1: 'ASIアルフェンス', category2: '', category3: '', price: 1234567, weight: 11.400, reserve1: '', reserve2: '', reserve3: '' }
])

const filteredItems = computed(() => {
  if (!searchKeyword.value) return items.value
  const keyword = searchKeyword.value.toLowerCase()
  return items.value.filter(item => 
    item.code.toLowerCase().includes(keyword) || 
    item.shortName.toLowerCase().includes(keyword)
  )
})

const form = ref({
  code: '',
  shortName: '',
  category1: 'FRZ安全器具類',
  category2: '',
  category3: '',
  price: 0,
  weight: 0,
  reserve1: '',
  reserve2: '',
  reserve3: ''
})

const selectItem = (item) => {
  selectedItem.value = item
  form.value = { ...item }
}

const toggleMode = () => {
  isNewMode.value = !isNewMode.value
  if (isNewMode.value) {
    form.value = { code: '', shortName: '', category1: 'FRZ安全器具類', category2: '', category3: '', price: 0, weight: 0, reserve1: '', reserve2: '', reserve3: '' }
    selectedItem.value = null
  }
  showToast(isNewMode.value ? '新規モードに切り替えました' : '変更モードに切り替えました')
}

const searchItems = () => {
  showToast('検索しました')
}

const saveItem = () => {
  if (!form.value.code || !form.value.shortName) {
    showToast('品番と略名は必須です')
    return
  }
  
  if (isNewMode.value) {
    items.value.push({ ...form.value })
    showToast('品番情報を追加しました')
  } else if (selectedItem.value) {
    const index = items.value.findIndex(i => i.code === selectedItem.value.code)
    if (index !== -1) {
      items.value[index] = { ...form.value }
      showToast('品番情報を更新しました')
    }
  }
  form.value = { code: '', shortName: '', category1: 'FRZ安全器具類', category2: '', category3: '', price: 0, weight: 0, reserve1: '', reserve2: '', reserve3: '' }
  selectedItem.value = null
}

const openReplaceModal = () => {
  replaceFrom.value = '仮設'
  replaceTo.value = '建設'
  replaceAll.value = false
  showReplaceModal.value = true
}

const closeReplaceModal = () => {
  showReplaceModal.value = false
}

const executeReplace = () => {
  showToast(`${replaceFrom.value}から${replaceTo.value}へ${replaceAll.value ? '全品番' : '選択品番'}を入替しました`)
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
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.system-selector label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #475569;
  white-space: nowrap;
}

.w-24 {
  width: 140px;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-wrapper {
  flex: 1;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.75rem;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
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

.checkbox-field label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.75rem;
  color: #475569;
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