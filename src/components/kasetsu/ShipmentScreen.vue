<template>
  <div class="shipment-screen">
    <div class="screen-card">
      <div class="card-header">
        <h3><i class="fas fa-shipping-fast mr-2"></i>出荷/入荷処理</h3>
      </div>

      <!-- 伝票選択 -->
      <div class="slip-selection">
        <div class="slip-type">
          <label class="radio-label">
            <input type="radio" v-model="slipType" value="shipment" class="radio-input">
            <span>出荷伝票</span>
          </label>
          <label class="radio-label">
            <input type="radio" v-model="slipType" value="receipt" class="radio-input">
            <span>入荷伝票</span>
          </label>
        </div>

        <div class="slip-table">
          <table class="data-table">
            <thead>
              <tr>
                <th>伝票No.</th>
                <th>小出し</th>
                <th>車種</th>
                <th>車番</th>
                <th>運送会社(カナ)</th>
                <th>運転手(カナ)</th>
                <th>止め日</th>
				</tr>
               </thead>
            <tbody>
              <tr 
                v-for="slip in slipList" 
                :key="slip.no"
                :class="{ selected: selectedSlip?.no === slip.no }"
                @click="selectSlip(slip)"
                class="cursor-pointer"
              >
                <td class="font-mono">{{ slip.no }} </td>
                <td class="text-center">
                  <i v-if="slip.picking" class="fas fa-check-circle text-green-500"></i>
                  <i v-else class="far fa-circle text-slate-400"></i>
                </td>
                <td>{{ slip.vehicleType }}</td>
                <td class="font-mono">{{ slip.plateNumber }}</td>
                <td>{{ slip.carrier }}</td>
                <td>{{ slip.driver }}</td>
                <td>{{ slip.stopDate }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 出荷作業画面 -->
      <div v-if="selectedSlip" class="work-section">
        <div class="work-header">
          <h4><i class="fas fa-clipboard-list mr-2"></i>出荷作業</h4>
        </div>

        <div class="work-info">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">出荷No:</span>
              <span class="info-value font-mono">{{ selectedSlip.no }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">運送会社:</span>
              <span class="info-value">{{ selectedSlip.carrier }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">運転手:</span>
              <span class="info-value">{{ selectedSlip.driver }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">積載重量:</span>
              <span class="info-value">{{ totalWeight.toLocaleString() }} Kg</span>
            </div>
          </div>
          <div class="info-grid mt-3">
            <div class="info-item">
              <span class="info-label">得意先名:</span>
              <span class="info-value">{{ selectedSlip.customer }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">現場名:</span>
              <span class="info-value">{{ selectedSlip.site }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">合計重量:</span>
              <span class="info-value text-blue-600 font-bold">{{ totalWeight.toLocaleString() }} Kg</span>
            </div>
          </div>
        </div>

        <div class="items-table">
          <table class="data-table">
            <thead>
              <tr>
                <th>品名+色</th>
                <th>品番</th>
                <th>借入先</th>
                <th>指示数</th>
                <th>数量変更</th>
                <th>積込完了</th>
                <th>チェック</th>
				</tr>
               </thead>
            <tbody>
              <tr v-for="item in selectedSlip.items" :key="item.code">
                <td>{{ item.name }}</td>
                <td class="font-mono">{{ item.code }}</td>
                <td>{{ item.borrower }}</td>
                <td class="text-right">{{ item.orderQty }}</td>
                <td class="text-right text-red-600 font-bold">{{ item.changeQty }}</td>
                <td class="text-center">
                  <input type="checkbox" v-model="item.loaded" class="complete-checkbox">
                </td>
                <td class="text-center">
                  <button class="btn-check" @click="checkItem(item)">
                    <i class="fas fa-check"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="work-actions">
          <div class="form-field">
            <label>備考</label>
            <textarea v-model="remarks" rows="2" class="textarea-input" placeholder="備考を入力"></textarea>
          </div>
          <div class="action-buttons">
            <button class="btn-add-item" @click="openAddItemModal">
              <i class="fas fa-plus mr-2"></i>品番追加
            </button>
            <button class="btn-camera" @click="openCamera">
              <i class="fas fa-camera mr-2"></i>カメラ
            </button>
            <button class="btn-load" @click="completeLoading">
              <i class="fas fa-check mr-2"></i>積込完了
            </button>
            <button class="btn-complete" @click="completeAllWork">
              <i class="fas fa-check-double mr-2"></i>全ての作業が完了
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 品番追加モーダル -->
    <div v-if="showAddItemModal" class="modal-overlay active" @click.self="closeAddItemModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3><i class="fas fa-plus mr-2"></i>品番追加</h3>
          <button class="modal-close" @click="closeAddItemModal">×</button>
        </div>
        <div class="modal-body">
          <div class="search-area">
            <div class="search-box">
              <i class="fas fa-search search-icon"></i>
              <input 
                type="text" 
                v-model="itemSearch" 
                class="search-input" 
                placeholder="品番または品名を入力"
                @input="searchItems"
              >
            </div>
            <button class="btn-search-sm" @click="searchItems">検索</button>
          </div>
          
          <div class="item-list">
            <div 
              v-for="item in filteredItems" 
              :key="item.code"
              :class="['item-row', { selected: selectedItem?.code === item.code }]"
              @click="selectItem(item)"
            >
              <span class="item-code">{{ item.code }}</span>
              <span class="item-name">{{ item.name }}</span>
              <span class="item-unit">{{ item.unit }}</span>
            </div>
            <div v-if="filteredItems.length === 0 && itemSearch" class="no-result">
              <i class="fas fa-search mr-2"></i>該当する品番が見つかりません
            </div>
          </div>
          
          <div class="selected-info">
            <div class="info-row">
              <label>品番</label>
              <input 
                type="text" 
                v-model="selectedItemCode" 
                readonly 
                class="info-input"
                placeholder="品番を選択してください"
              >
            </div>
            <div class="info-row">
              <label>品名</label>
              <input 
                type="text" 
                v-model="selectedItemName" 
                readonly 
                class="info-input"
                placeholder="品名を選択してください"
              >
            </div>
            <div class="info-row">
              <label>数量</label>
              <input 
                type="number" 
                v-model="addQty" 
                class="info-input" 
                min="1"
                id="addQtyInput"
              >
            </div>
            <div class="info-row">
              <label>単位</label>
              <input 
                type="text" 
                v-model="selectedItemUnit" 
                readonly 
                class="info-input bg-slate-100"
              >
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeAddItemModal">閉じる</button>
          <button class="btn-confirm" @click="addItem">追加</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'

const showToast = inject('showToast')

const slipType = ref('shipment')
const selectedSlip = ref(null)
const remarks = ref('')
const showAddItemModal = ref(false)
const itemSearch = ref('')
const addQty = ref(1)
const selectedItem = ref(null)

// 計算プロパティで選択された品番の情報を表示
const selectedItemCode = computed(() => selectedItem.value?.code || '')
const selectedItemName = computed(() => selectedItem.value?.name || '')
const selectedItemUnit = computed(() => selectedItem.value?.unit || '')

const slipList = ref([
  {
    no: 'A1S124339',
    picking: true,
    vehicleType: '6U',
    plateNumber: '1234',
    carrier: 'A会社',
    driver: 'アルインコ',
    stopDate: '',
    customer: 'アルインコ',
    site: 'テスト現場',
    items: [
      { code: 'HK6N', name: '鋼製布板 幅木用500X1829 橙', borrower: '', orderQty: 10, changeQty: 10, loaded: false }
    ]
  },
  {
    no: 'A1N163386',
    picking: false,
    vehicleType: '8U',
    plateNumber: '1234',
    carrier: 'A会社',
    driver: 'アルインコ',
    stopDate: '',
    customer: 'アルインコ',
    site: 'テスト現場',
    items: []
  }
])

const totalWeight = computed(() => {
  if (!selectedSlip.value) return 0
  return selectedSlip.value.items.reduce((sum, item) => sum + (item.orderQty || 0) * 13.5, 0)
})

const itemsList = ref([
  { code: 'CSGB16', name: 'マキシムベース感知装置', unit: '個' },
  { code: 'HK6N', name: '鋼製布板 幅木用500X1829 橙', unit: '枚' },
  { code: 'ALASLE', name: 'アルミサガオ 主材 左', unit: '本' },
  { code: 'ALASRE', name: 'アルミサガオ 主材 右', unit: '本' },
  { code: 'ALAK', name: 'アルミサガオ 取付金具', unit: '個' },
  { code: 'ALA6A', name: 'アルミサガオ 万能継受け上', unit: '個' }
])

const filteredItems = computed(() => {
  if (!itemSearch.value) return itemsList.value
  const searchTerm = itemSearch.value.toLowerCase()
  return itemsList.value.filter(item => 
    item.code.toLowerCase().includes(searchTerm) || 
    item.name.toLowerCase().includes(searchTerm)
  )
})

const selectSlip = (slip) => {
  selectedSlip.value = slip
  showToast(`伝票 ${slip.no} を選択しました`)
}

const checkItem = (item) => {
  showToast(`${item.name} をチェックしました`)
}

const completeLoading = () => {
  // バリデーション：積込完了していない品目がないか確認
  const notLoadedItems = selectedSlip.value?.items.filter(item => !item.loaded) || []
  if (notLoadedItems.length > 0) {
    if (!confirm(`${notLoadedItems.length}件の品目が未完了です。このまま完了しますか？`)) {
      return
    }
  }
  showToast('積込完了しました')
}

const completeAllWork = () => {
  if (confirm('全ての作業を完了しますか？')) {
    // バリデーション
    const notLoadedItems = selectedSlip.value?.items.filter(item => !item.loaded) || []
    if (notLoadedItems.length > 0) {
      showToast(`${notLoadedItems.length}件の品目が未完了です`)
      return
    }
    showToast('全ての作業が完了しました')
  }
}

// 品番追加モーダル関連
const openAddItemModal = () => {
  // フォームを初期化
  itemSearch.value = ''
  selectedItem.value = null
  addQty.value = 1
  showAddItemModal.value = true
}

const closeAddItemModal = () => {
  showAddItemModal.value = false
}

const searchItems = () => {
  if (itemSearch.value) {
    const resultCount = filteredItems.value.length
    if (resultCount === 0) {
      showToast('該当する品番が見つかりません')
    } else {
      showToast(`${resultCount}件の品番が見つかりました`)
    }
  }
}

const selectItem = (item) => {
  selectedItem.value = item
  showToast(`品番 ${item.code} を選択しました`)
}

const addItem = () => {
  // バリデーション
  if (!selectedItem.value) {
    showToast('品番を選択してください')
    return
  }
  
  if (!addQty.value || addQty.value <= 0) {
    showToast('数量を正しく入力してください')
    return
  }
  
  if (!selectedSlip.value) {
    showToast('伝票を選択してください')
    return
  }
  
  // 重複チェック
  const exists = selectedSlip.value.items.some(item => item.code === selectedItem.value.code)
  if (exists) {
    if (confirm(`品番 ${selectedItem.value.code} は既に存在します。追加しますか？`)) {
      const existingItem = selectedSlip.value.items.find(item => item.code === selectedItem.value.code)
      existingItem.orderQty += addQty.value
      existingItem.changeQty += addQty.value
      showToast(`品番 ${selectedItem.value.code} の数量を ${addQty.value} 追加しました`)
    } else {
      return
    }
  } else {
    // 新規追加
    selectedSlip.value.items.push({
      code: selectedItem.value.code,
      name: selectedItem.value.name,
      borrower: '',
      orderQty: addQty.value,
      changeQty: addQty.value,
      loaded: false
    })
    showToast(`品番 ${selectedItem.value.code} を ${addQty.value} 個追加しました`)
  }
  
  closeAddItemModal()
}

const openCamera = () => {
  showToast('カメラを起動しました')
}
</script>

<style scoped>
.shipment-screen {
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

.card-header h3 {
  font-weight: bold;
  color: #1e293b;
}

.screen-badge {
  font-size: 0.75rem;
  color: #64748b;
}

.slip-selection {
  padding: 24px;
}

.slip-type {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.radio-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.slip-table {
  overflow-x: auto;
  margin-bottom: 24px;
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
  border-bottom: 2px solid #e2e8f0;
}

.data-table td {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  background: #eff6ff;
}

.selected {
  background: #dbeafe;
}

.work-section {
  border-top: 1px solid #e2e8f0;
  padding: 24px;
}

.work-header {
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.work-header h4 {
  font-weight: bold;
  color: #1e293b;
}

.work-info {
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  gap: 8px;
}

.info-label {
  font-size: 0.75rem;
  color: #64748b;
}

.info-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
}

.mt-3 {
  margin-top: 12px;
}

.items-table {
  overflow-x: auto;
  margin-bottom: 20px;
}

.complete-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.btn-check {
  background: #475569;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-check:hover {
  background: #334155;
}

.work-actions {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.form-field label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: #475569;
  margin-bottom: 4px;
}

.textarea-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  resize: vertical;
  font-size: 0.875rem;
}

.textarea-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.btn-add-item,
.btn-camera,
.btn-load,
.btn-complete {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.btn-add-item {
  background: #e2e8f0;
  border: none;
  color: #1e293b;
}

.btn-add-item:hover {
  background: #cbd5e1;
}

.btn-camera {
  background: linear-gradient(135deg, #64748b, #475569);
  color: white;
  border: none;
}

.btn-camera:hover {
  transform: scale(1.02);
}

.btn-load {
  background: #f59e0b;
  color: white;
  border: none;
  margin-left: auto;
}

.btn-load:hover {
  background: #d97706;
}

.btn-complete {
  background: #10b981;
  color: white;
  border: none;
}

.btn-complete:hover {
  background: #059669;
}

.font-mono {
  font-family: monospace;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.text-blue-600 {
  color: #3b82f6;
}

.text-red-600 {
  color: #ef4444;
}

.text-green-500 {
  color: #10b981;
}

.text-slate-400 {
  color: #94a3b8;
}

.font-bold {
  font-weight: bold;
}

/* モーダルスタイル */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 550px;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-header {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
}

.modal-header h3 {
  color: white;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
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
  max-height: calc(85vh - 70px);
  overflow-y: auto;
}

.search-area {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-box {
  flex: 1;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.875rem;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.875rem;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.btn-search-sm {
  padding: 8px 16px;
  background: #475569;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-search-sm:hover {
  background: #334155;
}

.item-list {
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 20px;
}

.item-row {
  display: flex;
  gap: 16px;
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background 0.2s;
}

.item-row:hover {
  background: #f8fafc;
}

.item-row.selected {
  background: #eff6ff;
}

.item-code {
  font-family: monospace;
  font-weight: 600;
  width: 100px;
  font-size: 0.875rem;
}

.item-name {
  flex: 1;
  font-size: 0.875rem;
}

.item-unit {
  width: 50px;
  color: #64748b;
  font-size: 0.75rem;
}

.no-result {
  padding: 24px;
  text-align: center;
  color: #64748b;
  font-size: 0.875rem;
}

.selected-info {
  background: #eff6ff;
  padding: 16px;
  border-radius: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row label {
  width: 50px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #475569;
}

.info-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: white;
  font-size: 0.875rem;
}

.info-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.info-input[readonly] {
  background: #f1f5f9;
  cursor: default;
}

.bg-slate-100 {
  background: #f1f5f9;
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
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f1f5f9;
}

.btn-confirm {
  padding: 8px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-confirm:hover {
  background: #2563eb;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>