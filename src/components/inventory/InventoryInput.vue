<template>
  <div class="inventory-input">
    <div class="screen-card">
      <div class="card-header">
        <div>
          <h3><i class="fas fa-edit mr-2"></i>付箋入力（棚卸登録）</h3>
          <p class="header-subtitle">エリア別に複数名で同時登録が可能です</p>
        </div>
        <div class="sync-status">
          <span class="sync-dot"></span>
          <span>リアルタイム同期中</span>
        </div>
      </div>

      <div class="input-container">
        <div class="input-form">
          <div class="form-row">
            <div class="form-field">
              <label>エリア <span class="required">*</span></label>
              <select v-model="form.area" class="form-select">
                <option value="">選択</option>
                <option value="A">エリアA</option>
                <option value="B">エリアB</option>
                <option value="C">エリアC</option>
                <option value="D">エリアD</option>
              </select>
            </div>
            <div class="form-field">
              <label>棚卸日 <span class="required">*</span></label>
              <input type="date" v-model="form.date" class="form-input">
            </div>
          </div>

          <div class="search-field">
            <label>品番検索 <span class="required">*</span></label>
            <div class="search-wrapper">
              <div class="search-input-wrapper">
                <i class="fas fa-search search-icon"></i>
                <input 
                  type="text" 
                  v-model="searchKeyword" 
                  class="form-input search-input" 
                  placeholder="品番または品名を入力"
                  @input="handleSearch"
                >
              </div>
              <button class="btn-qr" @click="openQRScanner">
                <i class="fas fa-qrcode"></i>
              </button>
            </div>
            <div v-if="showSearchResults" class="search-results">
              <div 
                v-for="item in searchResults" 
                :key="item.code"
                class="result-item"
                @click="selectItem(item)"
              >
                <div class="result-code">{{ item.code }}</div>
                <div class="result-name">{{ item.name }}</div>
                <div class="result-location">{{ item.location }}</div>
              </div>
            </div>
          </div>

          <div v-if="selectedItem" class="selected-item">
            <div class="item-info">
              <div class="item-code">{{ selectedItem.code }}</div>
              <div class="item-name">{{ selectedItem.name }}</div>
              <div class="item-stock">システム在庫: <span class="font-bold">{{ selectedItem.systemStock }}</span> 個</div>
            </div>
            <span class="item-badge">{{ selectedItem.category }}</span>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>実地数量 <span class="required">*</span></label>
              <input type="number" v-model="form.actualQty" class="form-input text-center text-lg font-bold" placeholder="0">
            </div>
            <div class="form-field">
              <label>保管場所</label>
              <input type="text" v-model="form.location" class="form-input" placeholder="例: A-12-3">
            </div>
          </div>

          <div class="form-field">
            <label>備考</label>
            <textarea v-model="form.remarks" rows="2" class="form-textarea" placeholder="損傷あり、汚染ありなど"></textarea>
          </div>

          <div class="form-actions">
            <button class="btn-submit" @click="saveInventory">
              <i class="fas fa-save mr-2"></i>登録
            </button>
            <button class="btn-print-label" @click="openLabelPrintModal" :disabled="!canPrintLabel">
              <i class="fas fa-print mr-2"></i>付箋印刷
            </button>
            <button class="btn-clear" @click="clearForm">
              <i class="fas fa-undo mr-2"></i>クリア
            </button>
          </div>
        </div>

        <div class="history-panel">
          <h4><i class="fas fa-history text-blue-500 mr-2"></i>本日の登録履歴</h4>
          <div class="history-list">
            <div v-for="item in todayHistory" :key="item.id" class="history-item" :class="item.diffClass">
              <div class="history-info">
                <div class="history-code">{{ item.code }}</div>
                <div class="history-detail">エリア{{ item.area }} | {{ item.qty }}個</div>
              </div>
              <div class="history-actions">
                <button class="btn-history-print" @click="printHistoryLabel(item)" title="付箋印刷">
                  <i class="fas fa-print"></i>
                </button>
                <div class="history-time">{{ item.time }}</div>
              </div>
            </div>
            <div v-if="todayHistory.length === 0" class="history-empty">
              登録履歴はありません
            </div>
          </div>
        </div>
      </div>

    </div>

  </div>

  <!-- QRスキャナーモーダル -->
  <Teleport to="body">
    <div v-if="showQRModal" class="modal-overlay" @click="closeQRScanner">
      <div class="modal-content qr-modal" @click.stop>
        <div class="modal-header">
          <h3><i class="fas fa-qrcode mr-2"></i>QRコードスキャン</h3>
          <div class="modal-header-right">
            <button class="modal-close" @click="closeQRScanner">×</button>
          </div>
        </div>
        <div class="qr-scanner">
          <div class="scanner-frame">
            <div class="scan-line"></div>
            <div class="scanner-placeholder">
              <i class="fas fa-qrcode fa-4x text-white opacity-50"></i>
            </div>
          </div>
          <p class="scanner-text">QRコードを枠内に合わせてください</p>
          <button class="btn-simulate" @click="simulateQRScan">スキャンシミュレーション</button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- 付箋ラベル印刷モーダル -->
  <Teleport to="body">
    <div v-if="showLabelModal" class="modal-overlay" @click="closeLabelModal">
      <div class="modal-content label-modal" @click.stop>
        <div class="modal-header">
          <h3><i class="fas fa-print mr-2"></i>付箋ラベル印刷</h3>
          <div class="modal-header-right">
            <button class="modal-close" @click="closeLabelModal">×</button>
          </div>
        </div>
        <div class="label-print-body">
          <div class="label-settings">
            <div class="setting-row">
              <label>ラベルサイズ</label>
              <select v-model="labelSize" class="form-select">
                <option value="small">40mm × 60mm（コンパクト）</option>
                <option value="standard">50mm × 80mm（標準）</option>
                <option value="large">60mm × 100mm（大型）</option>
              </select>
            </div>
            <div class="setting-row">
              <label>印刷機</label>
              <select v-model="labelPrinter" class="form-select">
                <option>ラベルプリンタ LP-5230</option>
                <option>レーザープリンタ</option>
                <option>インクジェット</option>
              </select>
            </div>
          </div>
          
          <div class="label-preview-section">
            <h4>プレビュー</h4>
            <div v-if="currentLabelData" :class="['label-preview-card', `label-${labelSize}`]">
              <div class="label-content">
                <div class="label-header">
                  <span class="area-tag" :class="`area-${currentLabelData.area}`">エリア{{ currentLabelData.area }}</span>
                  <span class="label-date">{{ currentLabelData.date }}</span>
                </div>
                <div class="label-qr">
                  <i class="fas fa-qrcode fa-3x"></i>
                </div>
                <div class="label-info">
                  <div class="label-code">{{ currentLabelData.code }}</div>
                  <div class="label-name">{{ currentLabelData.name }}</div>
                  <div class="label-spec" v-if="currentLabelData.spec">{{ currentLabelData.spec }}</div>
                  <div class="label-location" v-if="currentLabelData.location">場所: {{ currentLabelData.location }}</div>
                  <div class="label-qty">
                    <span class="qty-number">{{ currentLabelData.qty }}</span>
                    <span class="qty-unit">{{ currentLabelData.unit }}</span>
                  </div>
                  <div class="label-user">担当: {{ currentLabelData.user }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="label-actions">
            <button class="btn-modal-cancel" @click="closeLabelModal">
              <i class="fas fa-times mr-2"></i>キャンセル
            </button>
            <button class="btn-modal-print" @click="printLabel">
              <i class="fas fa-print mr-2"></i>印刷実行
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, inject } from 'vue'

const showToast = inject('showToast')

const form = ref({
  area: '',
  date: new Date().toISOString().slice(0, 10),
  actualQty: '',
  location: '',
  remarks: ''
})

const searchKeyword = ref('')
const showSearchResults = ref(false)
const selectedItem = ref(null)

const itemsList = ref([
  { code: 'ABC-001', name: '鋼製足場板 300×1800', location: 'エリアA-12', systemStock: 150, category: '仮設リース' },
  { code: 'ABC-002', name: '鋼製足場板 400×1800', location: 'エリアA-15', systemStock: 12, category: '仮設リース' },
  { code: 'XYZ-888', name: '単管パイプ 48.6×3.5', location: 'エリアB-08', systemStock: 200, category: '建設機材' }
])

const searchResults = computed(() => {
  if (!searchKeyword.value) return []
  const keyword = searchKeyword.value.toLowerCase()
  return itemsList.value.filter(item => 
    item.code.toLowerCase().includes(keyword) || 
    item.name.toLowerCase().includes(keyword)
  )
})

const todayHistory = ref([
  { id: 1, code: 'ABC-001', name: '鋼製足場板 300×1800', area: 'A', qty: 15, location: 'A-12-1', time: '10:23', diffClass: '' },
  { id: 2, code: 'ABC-015', name: '鋼製足場板 400×1800', area: 'A', qty: 8, location: 'A-15-2', time: '10:15', diffClass: 'diff' },
  { id: 3, code: 'XYZ-888', name: '単管パイプ 48.6×3.5', area: 'B', qty: 5, location: 'B-08-1', time: '09:58', diffClass: 'diff' }
])

const showQRModal = ref(false)

const handleSearch = () => {
  showSearchResults.value = searchKeyword.value.length > 0
}

const selectItem = (item) => {
  selectedItem.value = item
  searchKeyword.value = item.code
  showSearchResults.value = false
}

const openQRScanner = () => {
  showQRModal.value = true
}

const closeQRScanner = () => {
  showQRModal.value = false
}

const simulateQRScan = () => {
  closeQRScanner()
  const sampleItem = itemsList.value[0]
  selectItem(sampleItem)
  showToast(`QRコードを読み取りました: ${sampleItem.code}`)
}

const saveInventory = () => {
  if (!form.value.area) {
    showToast('エリアを選択してください')
    return
  }
  if (!selectedItem.value) {
    showToast('品番を選択してください')
    return
  }
  if (!form.value.actualQty) {
    showToast('実地数量を入力してください')
    return
  }

  const newHistory = {
    id: Date.now(),
    code: selectedItem.value.code,
    name: selectedItem.value.name,
    area: form.value.area,
    qty: form.value.actualQty,
    location: form.value.location || '',
    time: new Date().toLocaleTimeString().slice(0, 5),
    diffClass: form.value.actualQty !== selectedItem.value.systemStock ? 'diff' : ''
  }
  todayHistory.value.unshift(newHistory)
  
  showToast('棚卸データを登録しました')
  clearForm()
}

const clearForm = () => {
  form.value = {
    area: '',
    date: new Date().toISOString().slice(0, 10),
    actualQty: '',
    location: '',
    remarks: ''
  }
  selectedItem.value = null
  searchKeyword.value = ''
  lastSavedRecord.value = null
}

// 付箋印刷関連
const showLabelModal = ref(false)
const lastSavedRecord = ref(null)
const labelSize = ref('standard')
const labelPrinter = ref('ラベルプリンタ LP-5230')

// 入力中のデータを印刷（登録前でも印刷可能）
const canPrintLabel = computed(() => {
  return selectedItem.value && form.value.actualQty
})

const currentLabelData = computed(() => {
  if (lastSavedRecord.value) {
    return {
      area: lastSavedRecord.value.area,
      code: lastSavedRecord.value.code,
      name: lastSavedRecord.value.name,
      spec: lastSavedRecord.value.spec || '',
      qty: lastSavedRecord.value.qty,
      unit: '個',
      user: '山田',
      date: new Date().toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' }),
      location: lastSavedRecord.value.location || ''
    }
  }
  if (selectedItem.value && form.value.actualQty) {
    return {
      area: form.value.area,
      code: selectedItem.value.code,
      name: selectedItem.value.name,
      spec: selectedItem.value.spec || '',
      qty: form.value.actualQty,
      unit: '個',
      user: '山田',
      date: new Date().toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' }),
      location: form.value.location || ''
    }
  }
  return null
})

const openLabelPrintModal = () => {
  if (!currentLabelData.value) {
    showToast('印刷するデータがありません')
    return
  }
  showLabelModal.value = true
}

const closeLabelModal = () => {
  showLabelModal.value = false
}

const printLabel = () => {
  showToast('付箋ラベルを印刷しました')
  closeLabelModal()
}

const printHistoryLabel = (item) => {
  // 履歴からレコードを復元（nameが保存されている前提）
  lastSavedRecord.value = {
    code: item.code,
    name: item.name || item.code,
    area: item.area,
    qty: item.qty,
    location: item.location || '',
    spec: item.spec || ''
  }
  openLabelPrintModal()
}

const saveAndPrint = () => {
  if (!form.value.area) {
    showToast('エリアを選択してください')
    return
  }
  if (!selectedItem.value) {
    showToast('品番を選択してください')
    return
  }
  if (!form.value.actualQty) {
    showToast('実地数量を入力してください')
    return
  }

  // 保存レコードを作成
  lastSavedRecord.value = {
    id: Date.now(),
    code: selectedItem.value.code,
    name: selectedItem.value.name,
    spec: selectedItem.value.spec || '',
    area: form.value.area,
    qty: form.value.actualQty,
    location: form.value.location,
    time: new Date().toLocaleTimeString().slice(0, 5)
  }

  // 履歴に追加
  todayHistory.value.unshift({
    id: lastSavedRecord.value.id,
    code: selectedItem.value.code,
    area: form.value.area,
    qty: form.value.actualQty,
    time: lastSavedRecord.value.time,
    diffClass: form.value.actualQty !== selectedItem.value.systemStock ? 'diff' : ''
  })
  
  showToast('棚卸データを登録しました')
  
  // 自動的に印刷モーダルを開く
  setTimeout(() => {
    openLabelPrintModal()
  }, 300)
}
</script>

<style scoped>
.inventory-input {
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
  align-items: flex-start;
}

.card-header h3 {
  font-weight: bold;
  color: #1e293b;
}

.header-subtitle {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 4px;
}

.sync-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background: #ecfdf5;
  border-radius: 20px;
  font-size: 0.7rem;
  color: #065f46;
}

.sync-dot {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.input-container {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 24px;
  padding: 24px;
}

.input-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #475569;
}

.required {
  color: #ef4444;
}

.form-input, .form-select {
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.875rem;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.search-field {
  position: relative;
}

.search-field label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #475569;
}

.search-wrapper {
  display: flex;
  gap: 10px;
}

.search-input-wrapper {
  flex: 1;
  position: relative;
  min-width: 480px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-input {
  padding-left: 36px;
  width: 100%;
  box-sizing: border-box;
}

.btn-qr {
  width: 42px;
  flex-shrink: 0;
  background: #1e293b;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  margin-top: 4px;
}

.result-item {
  padding: 10px 12px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background 0.2s;
}

.result-item:hover {
  background: #eff6ff;
}

.result-code {
  font-weight: 600;
  font-family: monospace;
  font-size: 0.75rem;
}

.result-name {
  font-size: 0.7rem;
  color: #64748b;
}

.result-location {
  font-size: 0.65rem;
  color: #94a3b8;
}

.selected-item {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-code {
  font-weight: bold;
  font-family: monospace;
  font-size: 0.875rem;
}

.item-name {
  font-size: 0.75rem;
  color: #2563eb;
}

.item-stock {
  font-size: 0.7rem;
  color: #475569;
}

.font-bold {
  font-weight: bold;
}

.item-badge {
  padding: 4px 8px;
  background: #dbeafe;
  border-radius: 20px;
  font-size: 0.7rem;
  color: #1e40af;
}

.text-center {
  text-align: center;
}

.text-lg {
  font-size: 1rem;
}

.form-textarea {
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  resize: vertical;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn-submit, .btn-clear, .btn-print-label {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-print-label {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
}

.btn-print-label:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.btn-print-label:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.btn-clear {
  background: white;
  border: 1px solid #cbd5e1;
  color: #475569;
}

.btn-clear:hover {
  background: #f8fafc;
}

.history-panel {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
}

.history-panel h4 {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
  font-size: 0.875rem;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  padding: 10px 12px;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-item.diff {
  border-left-color: #f59e0b;
}

.history-code {
  font-weight: 600;
  font-size: 0.75rem;
}

.history-detail {
  font-size: 0.7rem;
  color: #64748b;
  margin-top: 2px;
}

.history-time {
  font-size: 0.65rem;
  color: #94a3b8;
}

.history-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.btn-history-print {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: #dbeafe;
  color: #3b82f6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  transition: all 0.2s;
}

.btn-history-print:hover {
  background: #3b82f6;
  color: white;
}

.history-empty {
  text-align: center;
  padding: 20px;
  color: #94a3b8;
  font-size: 0.75rem;
}

/* モーダルスタイル */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.qr-modal {
  max-width: 400px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 16px 16px 0 0;
}

.modal-header h3 {
  color: white;
  font-weight: bold;
}

.modal-header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.modal-screen-id {
  color: #bfdbfe;
  font-size: 0.75rem;
}

.modal-close {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
}

.qr-scanner {
  padding: 24px;
  text-align: center;
}

.scanner-frame {
  width: 200px;
  height: 200px;
  margin: 0 auto;
  position: relative;
  border: 2px solid white;
  border-radius: 12px;
  overflow: hidden;
  background: #1e293b;
}

.scan-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #10b981, transparent);
  animation: scan 2s linear infinite;
  top: 50%;
}

.scanner-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scanner-text {
  font-size: 0.75rem;
  color: #64748b;
  margin: 16px 0;
}

.btn-simulate {
  padding: 8px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes scan {
  0% { transform: translateY(-100px); }
  50% { transform: translateY(0); }
  100% { transform: translateY(100px); }
}

/* 付箋ラベル印刷モーダル */
.label-modal {
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.label-print-body {
  padding: 24px;
}

.label-settings {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.setting-row {
  margin-bottom: 12px;
}

.setting-row:last-child {
  margin-bottom: 0;
}

.setting-row label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: #475569;
  margin-bottom: 6px;
}

.label-preview-section {
  margin-bottom: 20px;
}

.label-preview-section h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
}

.label-preview-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
}

.label-preview-card .label-content {
  padding: 12px;
  border: 2px solid #1e293b;
  border-radius: 8px;
}

.label-preview-card.label-standard {
  max-width: 200px;
}

.label-preview-card.label-small {
  max-width: 160px;
}

.label-preview-card.label-large {
  max-width: 240px;
}

.label-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.area-tag {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.6rem;
  font-weight: bold;
  color: white;
}

.area-A { background: #3b82f6; }
.area-B { background: #8b5cf6; }
.area-C { background: #ec489a; }
.area-D { background: #f59e0b; }

.label-date {
  font-size: 0.6rem;
  color: #94a3b8;
}

.label-qr {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
  padding: 8px;
  background: #f1f5f9;
  border-radius: 6px;
}

.label-info {
  text-align: center;
}

.label-code {
  font-family: monospace;
  font-weight: bold;
  font-size: 0.8rem;
  margin-bottom: 2px;
}

.label-name {
  font-size: 0.7rem;
  color: #475569;
  margin-bottom: 2px;
}

.label-spec {
  font-size: 0.6rem;
  color: #64748b;
  margin-bottom: 2px;
}

.label-location {
  font-size: 0.6rem;
  color: #64748b;
  margin-bottom: 4px;
}

.label-qty {
  margin: 4px 0;
}

.qty-number {
  font-size: 1.1rem;
  font-weight: bold;
  color: #1e293b;
}

.qty-unit {
  font-size: 0.6rem;
  color: #64748b;
  margin-left: 2px;
}

.label-user {
  font-size: 0.6rem;
  color: #94a3b8;
}

.label-actions {
  display: flex;
  gap: 12px;
}

.btn-modal-cancel, .btn-modal-print {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-modal-cancel {
  background: white;
  border: 1px solid #cbd5e1;
  color: #475569;
}

.btn-modal-cancel:hover {
  background: #f8fafc;
}

.btn-modal-print {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
}

.btn-modal-print:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}
</style>