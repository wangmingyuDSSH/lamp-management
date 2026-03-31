<template>
  <div class="receipt-list-screen">
    <div class="screen-card">
      <div class="card-header">
        <h3><i class="fas fa-list mr-2"></i>入荷一覧</h3>
        <button class="btn-csv" @click="exportCSV">
          <i class="fas fa-file-csv mr-2 text-green-600"></i>CSVダウンロード
        </button>
      </div>

      <!-- ステータスバッジ -->
      <div class="status-badge-container">
        <span class="status-badge status-info">受付済＆作業未済</span>
      </div>

      <!-- 検索条件 -->
      <div class="search-section">
        <div class="search-grid">
          <div class="search-field">
            <label>倉庫</label>
            <select v-model="filters.warehouse" class="form-select">
              <option>センターA</option>
              <option>センターB</option>
              <option>大阪センター</option>
            </select>
          </div>
          <div class="search-field">
            <label>入荷日(From)</label>
            <input type="date" v-model="filters.dateFrom" class="form-input">
          </div>
          <div class="search-field">
            <label>入荷日(To)</label>
            <input type="date" v-model="filters.dateTo" class="form-input">
          </div>
          <div class="search-field">
            <label>得意先</label>
            <input type="text" v-model="filters.customer" class="form-input" placeholder="名称/コード">
          </div>
          <div class="search-field">
            <label>運送会社</label>
            <input type="text" v-model="filters.carrier" class="form-input" placeholder="カナ">
          </div>
          <div class="search-field">
            <button class="btn-search" @click="searchReceipts">
              <i class="fas fa-search mr-2"></i>検索
            </button>
          </div>
        </div>
      </div>

      <!-- 入荷一覧テーブル -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>入荷No.</th>
              <th>入荷日</th>
              <th>得意先</th>
              <th>現場</th>
              <th>運送会社(運転手)</th>
              <th>受付</th>
              <th>入場時間</th>
              <th>退場時間</th>
              <th>未検収</th>
              <th>修/能</th>
             </tr>
          </thead>
          <tbody>
            <tr 
              v-for="receipt in filteredReceipts" 
              :key="receipt.no"
              class="hover-row"
              @click="openDetailModal(receipt)"
            >
              <td class="font-mono text-blue-600 underline">{{ receipt.no }}</td>
              <td class="font-mono">{{ receipt.date }}</td>
              <td class="whitespace-pre-line">{{ receipt.customer }}</td>
              <td class="whitespace-pre-line">{{ receipt.site }}</td>
              <td>{{ receipt.carrier }}</td>
              <td>{{ receipt.reception }}</td>
              <td>{{ receipt.entryTime }}</td>
              <td>{{ receipt.exitTime }}</td>
              <td class="text-red-600">{{ receipt.uninspected }}</td>
              <td>{{ receipt.repair }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ページネーション -->
      <div class="pagination">
        <p class="pagination-info">全 {{ totalItems }} 件中 {{ pagination.start }}-{{ pagination.end }} 件表示</p>
        <div class="pagination-buttons">
          <button class="page-btn" :disabled="pagination.current === 1" @click="prevPage">前へ</button>
          <button 
            v-for="page in pagination.pages" 
            :key="page"
            :class="['page-btn', { active: page === pagination.current }]"
            @click="goToPage(page)"
            :disabled="page === '...'"
          >
            {{ page }}
          </button>
          <button class="page-btn" :disabled="pagination.current === pagination.totalPages" @click="nextPage">次へ</button>
        </div>
      </div>
    </div>

    <!-- 入荷明細モーダル -->
    <div v-if="showDetailModal" class="modal-overlay active" @click.self="closeDetailModal">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h3><i class="fas fa-file-alt mr-2"></i>入荷明細</h3>
          <button class="modal-close" @click="closeDetailModal">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-header">
            <div class="detail-no">
              入荷No: <span class="font-mono font-bold">{{ currentReceipt?.no }}</span>
            </div>
            <button class="btn-packing" @click="openPackingCheckModal">
              <i class="fas fa-box mr-2"></i>荷姿確認
            </button>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">作業開始日時:</span>
              <span class="info-value" id="workStartTime">{{ currentReceipt?.workStartTime || '24/09/06 10:30:44' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">作業終了日時:</span>
              <span class="info-value" id="workEndTime">{{ currentReceipt?.workEndTime || '24/09/06 10:30:55' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">得意先:</span>
              <span class="info-value" id="customerName">{{ currentReceipt?.customer?.split('\n')[0] || '' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">現場:</span>
              <span class="info-value" id="siteName">{{ currentReceipt?.site }}</span>
            </div>
          </div>

          <div class="detail-table-container">
            <table class="detail-table">
              <thead>
                <tr>
                  <th>行</th>
                  <th>品番</th>
                  <th>品名</th>
                  <th>借入先</th>
                  <th>借入先名</th>
                  <th class="text-right">返却数</th>
                  <th class="text-right">不能数</th>
                  <th>修/能</th>
                  <th>荷下しユーザー/検収ユーザー</th>
                  <th>入荷No(分割後)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in currentReceipt?.items || []" :key="idx">
                  <td>{{ String(idx + 1).padStart(3, '0') }}</td>
                  <td class="font-mono">{{ item.code }}</td>
                  <td>{{ item.name }}</td>
                  <td>{{ item.borrower || '-' }}</td>
                  <td>{{ item.borrowerName || '-' }}</td>
                  <td class="text-right">{{ item.returnQty || 0 }}</td>
                  <td class="text-right">{{ item.damageQty || 0 }}</td>
                  <td>{{ item.repair || '-' }}</td>
                  <td>{{ item.user || '仮設川越 /' }}</td>
                  <td>{{ item.splitNo || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-close" @click="closeDetailModal">閉じる</button>
        </div>
      </div>
    </div>

    <!-- 荷姿確認モーダル -->
    <div v-if="showPackingModal" class="modal-overlay active" @click.self="closePackingModal">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h3><i class="fas fa-box-open mr-2"></i>荷姿確認</h3>
          <button class="modal-close" @click="closePackingModal">×</button>
        </div>
        <div class="modal-body">
          <div class="packing-info">
            <div>伝票No: <span class="font-mono font-bold" id="packingReceiptNo">{{ currentReceipt?.no }}</span></div>
            <div>確認日時: <span id="packingDateTime">{{ packingDateTime }}</span></div>
          </div>

          <div class="photo-grid">
            <div 
              v-for="i in 3" 
              :key="i" 
              class="photo-item" 
              @click="takePackingPhoto(i)"
            >
              <div v-if="packingPhotos[i-1]" class="photo-preview">
                <img :src="packingPhotos[i-1]" class="preview-image" alt="荷姿写真">
                <button class="btn-photo-retake" @click.stop="retakePhoto(i)">再撮影</button>
              </div>
              <div v-else class="photo-placeholder">
                <i class="fas fa-camera text-2xl text-slate-400 mb-2"></i>
                <p class="text-sm text-slate-600">荷姿写真 {{ i }}</p>
                <button class="btn-photo-take">撮影</button>
              </div>
            </div>
          </div>

          <div class="checklist-section">
            <h4>荷姿確認項目</h4>
            <label class="checkbox-label">
              <input type="checkbox" v-model="packingChecks.item1" id="checkItem1">
              <span>梱包状態に問題なし</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="packingChecks.item2" id="checkItem2">
              <span>品番・数量に相違なし</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="packingChecks.item3" id="checkItem3">
              <span>損傷・汚染なし</span>
            </label>
          </div>

          <div class="remarks-field">
            <label>備考</label>
            <textarea 
              v-model="packingRemarks" 
              rows="2" 
              class="form-textarea" 
              placeholder="特記事項があれば入力"
              id="packingRemarks"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closePackingModal">閉じる</button>
          <button class="btn-save" @click="savePackingCheck">確認完了</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'

const showToast = inject('showToast')

const filters = ref({
  warehouse: 'センターA',
  dateFrom: '2024-09-06',
  dateTo: '2024-09-06',
  customer: '',
  carrier: ''
})

const receipts = ref([
  {
    no: 'A1N163493',
    date: '20240906',
    customer: '(123456)ア\nル',
    site: '(7890)テス\nト',
    carrier: 'Aカイシャ(ナマエ)',
    reception: '2',
    entryTime: '10:29:01',
    exitTime: '',
    uninspected: '未検\n残有',
    repair: '',
    workStartTime: '24/09/06 10:30:44',
    workEndTime: '24/09/06 10:30:55',
    items: [
      { code: 'ALASLE', name: 'アルミサガオ 主材 左', borrower: '', borrowerName: '', returnQty: 0, damageQty: 0, repair: '', user: '仮設川越 /', splitNo: '' },
      { code: 'ALASRE', name: 'アルミサガオ 主材 右', borrower: '', borrowerName: '', returnQty: 0, damageQty: 0, repair: '', user: '', splitNo: '' },
      { code: 'ALAK', name: 'アルミサガオ 取付金具', borrower: '', borrowerName: '', returnQty: 0, damageQty: 0, repair: '', user: '', splitNo: '' },
      { code: 'ALA6A', name: 'アルミサガオ 万能継受け上', borrower: '', borrowerName: '', returnQty: 0, damageQty: 0, repair: '', user: '', splitNo: '' },
      { code: 'ALA6B', name: 'アルミサガオ 万能継押え', borrower: '', borrowerName: '', returnQty: 0, damageQty: 0, repair: '', user: '', splitNo: '' }
    ]
  },
  {
    no: 'A1N163494',
    date: '20240906',
    customer: '(123456)ア\nル',
    site: '(7890)テス\nト',
    carrier: 'Aカイシャ(ナマエ)',
    reception: '2',
    entryTime: '10:29:01',
    exitTime: '',
    uninspected: '',
    repair: '',
    workStartTime: '24/09/06 11:30:44',
    workEndTime: '24/09/06 11:45:55',
    items: []
  }
])

const totalItems = computed(() => filteredReceipts.value.length)
const pagination = ref({
  current: 1,
  pageSize: 10,
  totalPages: computed(() => Math.ceil(totalItems.value / pagination.value.pageSize)),
  start: computed(() => (pagination.value.current - 1) * pagination.value.pageSize + 1),
  end: computed(() => Math.min(pagination.value.current * pagination.value.pageSize, totalItems.value)),
  pages: computed(() => {
    const total = pagination.value.totalPages
    const current = pagination.value.current
    const delta = 2
    const range = []
    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i)
    }
    if (current - delta > 2) range.unshift('...')
    if (current + delta < total - 1) range.push('...')
    range.unshift(1)
    if (total > 1) range.push(total)
    return range
  })
})

const filteredReceipts = computed(() => {
  let result = receipts.value
  if (filters.value.customer) {
    result = result.filter(r => r.customer.includes(filters.value.customer))
  }
  if (filters.value.carrier) {
    result = result.filter(r => r.carrier.includes(filters.value.carrier))
  }
  const start = (pagination.value.current - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return result.slice(start, end)
})

const showDetailModal = ref(false)
const showPackingModal = ref(false)
const currentReceipt = ref(null)

// 荷姿確認用データ
const packingChecks = ref({
  item1: false,
  item2: false,
  item3: false
})
const packingRemarks = ref('')
const packingPhotos = ref(['', '', ''])
const packingDateTime = ref('')

// 現在日時をフォーマット
const getCurrentDateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
}

const searchReceipts = () => {
  pagination.value.current = 1
  showToast('入荷伝票を検索しました')
}

const openDetailModal = (receipt) => {
  currentReceipt.value = receipt
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  currentReceipt.value = null
}

const openPackingCheckModal = () => {
  // フォームを初期化
  packingChecks.value = { item1: false, item2: false, item3: false }
  packingRemarks.value = ''
  packingPhotos.value = ['', '', '']
  packingDateTime.value = getCurrentDateTime()
  showPackingModal.value = true
}

const closePackingModal = () => {
  showPackingModal.value = false
}

const takePackingPhoto = (index) => {
  // 実際のアプリケーションではカメラ機能やファイル選択ダイアログを表示
  // ここではシミュレーションとしてダミーデータを設定
  const dummyPhotoUrl = `https://via.placeholder.com/200x150?text=Photo+${index}`
  packingPhotos.value[index - 1] = dummyPhotoUrl
  showToast(`荷姿写真 ${index} を撮影しました`)
}

const retakePhoto = (index) => {
  packingPhotos.value[index - 1] = ''
  takePackingPhoto(index)
}

const savePackingCheck = () => {
  // バリデーション
  if (!packingChecks.value.item1 || !packingChecks.value.item2 || !packingChecks.value.item3) {
    showToast('全ての確認項目をチェックしてください')
    return
  }
  
  // 写真が少なくとも1枚は撮影されているか確認（任意）
  const hasPhoto = packingPhotos.value.some(photo => photo !== '')
  if (!hasPhoto) {
    if (!confirm('写真が未撮影です。このまま確認を完了しますか？')) {
      return
    }
  }
  
  showToast('荷姿確認を保存しました')
  closePackingModal()
}

const exportCSV = () => {
  showToast('CSVダウンロードを開始しました')
}

const prevPage = () => {
  if (pagination.value.current > 1) pagination.value.current--
}

const nextPage = () => {
  if (pagination.value.current < pagination.value.totalPages) pagination.value.current++
}

const goToPage = (page) => {
  if (page !== '...') pagination.value.current = page
}
</script>

<style scoped>
.receipt-list-screen {
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

.btn-csv {
  padding: 6px 12px;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s;
}

.btn-csv:hover {
  background: #f1f5f9;
}

.status-badge-container {
  padding: 12px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.7rem;
}

.status-info {
  background: #d1fae5;
  color: #065f46;
}

.search-section {
  padding: 20px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.search-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  align-items: end;
}

.search-field label {
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
  border-radius: 8px;
  font-size: 0.875rem;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.btn-search {
  width: 100%;
  padding: 8px 12px;
  background: #475569;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-search:hover {
  background: #334155;
}

.table-container {
  padding: 20px 24px;
  overflow-x: auto;
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

.hover-row:hover {
  background: #eff6ff;
  cursor: pointer;
}

.font-mono {
  font-family: monospace;
}

.text-blue-600 {
  color: #3b82f6;
}

.text-red-600 {
  color: #ef4444;
}

.underline {
  text-decoration: underline;
}

.whitespace-pre-line {
  white-space: pre-line;
}

.pagination {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-info {
  font-size: 0.75rem;
  color: #64748b;
}

.pagination-buttons {
  display: flex;
  gap: 4px;
}

.page-btn {
  padding: 4px 10px;
  border: 1px solid #cbd5e1;
  background: white;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #f1f5f9;
}

.page-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  max-height: 85vh;
  overflow-y: auto;
}

.modal-large {
  max-width: 1100px;
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

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.detail-no {
  font-size: 0.875rem;
}

.font-bold {
  font-weight: bold;
}

.btn-packing {
  padding: 6px 12px;
  background: #e2e8f0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s;
}

.btn-packing:hover {
  background: #cbd5e1;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.info-item {
  display: flex;
  gap: 8px;
}

.info-label {
  font-size: 0.7rem;
  color: #64748b;
}

.info-value {
  font-size: 0.75rem;
  font-weight: 500;
  color: #1e293b;
}

.detail-table-container {
  overflow-x: auto;
  margin-bottom: 20px;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.7rem;
}

.detail-table th, .detail-table td {
  padding: 8px;
  border: 1px solid #e2e8f0;
  text-align: left;
}

.detail-table th {
  background: #f8fafc;
  font-weight: 600;
}

.text-right {
  text-align: right;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-close, .btn-cancel, .btn-save {
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close, .btn-cancel {
  background: white;
  border: 1px solid #cbd5e1;
}

.btn-close:hover, .btn-cancel:hover {
  background: #f1f5f9;
}

.btn-save {
  background: #3b82f6;
  color: white;
  border: none;
}

.btn-save:hover {
  background: #2563eb;
}

/* 荷姿確認モーダル固有のスタイル */
.packing-info {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  padding: 12px;
  background: #ecfdf5;
  border-radius: 8px;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.photo-item {
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-item:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.photo-placeholder {
  text-align: center;
}

.photo-preview {
  position: relative;
  width: 100%;
}

.preview-image {
  max-width: 100%;
  max-height: 120px;
  border-radius: 8px;
  margin-bottom: 8px;
}

.btn-photo-take, .btn-photo-retake {
  margin-top: 8px;
  padding: 4px 12px;
  background: #475569;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-photo-take:hover, .btn-photo-retake:hover {
  background: #334155;
}

.checklist-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.checklist-section h4 {
  font-weight: 600;
  margin-bottom: 12px;
  font-size: 0.875rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  font-size: 0.75rem;
}

.checkbox-label input {
  cursor: pointer;
}

.remarks-field {
  margin-bottom: 20px;
}

.remarks-field label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: #475569;
  margin-bottom: 4px;
}

.form-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  resize: vertical;
  font-size: 0.75rem;
}

.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
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