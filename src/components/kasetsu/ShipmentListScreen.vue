<template>
  <div class="shipment-list-screen">
    <div class="screen-card">
      <div class="card-header">
        <h3><i class="fas fa-list-alt mr-2"></i>出荷一覧</h3>
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
            <label>出荷日(From)</label>
            <input type="date" v-model="filters.dateFrom" class="form-input">
          </div>
          <div class="search-field">
            <label>出荷日(To)</label>
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
            <button class="btn-search" @click="searchShipments">
              <i class="fas fa-search mr-2"></i>検索
            </button>
          </div>
        </div>
      </div>

      <!-- 出荷一覧テーブル -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>出荷No.</th>
              <th>出荷日</th>
              <th>得意先</th>
              <th>現場</th>
              <th>運送会社(運転手)</th>
              <th>受付</th>
              <th>入場時間</th>
              <th>退場時間</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="shipment in filteredShipments" 
              :key="shipment.no"
              class="hover-row"
              @click="openDetailModal(shipment)"
            >
              <td class="font-mono text-blue-600 underline">{{ shipment.no }}</td>
              <td>{{ shipment.date }}</td>
              <td class="whitespace-pre-line">{{ shipment.customer }}</td>
              <td>{{ shipment.site }}</td>
              <td>{{ shipment.carrier }}</td>
              <td>{{ shipment.reception }}</td>
              <td>{{ shipment.entryTime }}</td>
              <td>{{ shipment.exitTime }}</td>
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

    <!-- 出荷明細モーダル -->
    <div v-if="showDetailModal" class="modal-overlay active" @click.self="closeDetailModal">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h3><i class="fas fa-file-alt mr-2"></i>出荷明細</h3>
          <button class="modal-close" @click="closeDetailModal">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-header">
            <div class="detail-no">
              出荷No: <span class="font-mono font-bold">{{ currentShipment?.no }}</span>
            </div>
            <button class="btn-packing" @click="openPackingCheckModal">
              <i class="fas fa-box mr-2"></i>荷姿確認
            </button>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">作業開始日時:</span>
              <span class="info-value">{{ currentShipment?.workStartTime || '99/99/99 99:99:99' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">作業終了日時:</span>
              <span class="info-value">{{ currentShipment?.workEndTime || '99/99/99 99:99:99' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">運転手:</span>
              <span class="info-value">{{ currentShipment?.driver || 'アルインコ' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">現場:</span>
              <span class="info-value">{{ currentShipment?.site }}</span>
            </div>
          </div>

          <div class="detail-table-container">
            <table class="detail-table">
              <thead>
                <tr>
                  <th>行</th>
                  <th>SEQ</th>
                  <th>品番</th>
                  <th>品名</th>
                  <th>借入先</th>
                  <th>借入先名</th>
                  <th class="text-right">指示数</th>
                  <th class="text-right">出荷数</th>
                  <th>積込ユーザー/チェックユーザー</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in currentShipment?.items || []" :key="idx">
                  <td>{{ String(idx + 1).padStart(3, '0') }}</td>
                  <td>{{ item.seq || '000' }}</td>
                  <td class="font-mono">{{ item.code }}</td>
                  <td>{{ item.name }}</td>
                  <td>{{ item.borrower || '-' }}</td>
                  <td>{{ item.borrowerName || '-' }}</td>
                  <td class="text-right">{{ item.orderQty }}</td>
                  <td class="text-right">
                    <input 
                      type="number" 
                      v-model="item.shipmentQty" 
                      class="qty-input" 
                      min="0"
                      :max="item.orderQty"
                    >
                  </td>
                  <td>
                    <input 
                      type="text" 
                      v-model="item.user" 
                      class="user-input" 
                      placeholder="ユーザー名"
                    >
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="remarks-section">
            <div class="remark-item">
              <div class="remark-label">小出し備考</div>
              <div class="remark-content">{{ currentShipment?.pickingRemarks || '' }}</div>
            </div>
            <div class="remark-item">
              <div class="remark-label">運送備考</div>
              <div class="remark-content">{{ currentShipment?.carrierRemarks || '地図有り' }}</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-close" @click="closeDetailModal">閉じる</button>
          <button class="btn-save" @click="saveShipmentDetail">保存</button>
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
            <div>伝票No: <span class="font-mono font-bold">{{ currentShipment?.no }}</span></div>
            <div>確認日時: <span>{{ packingDateTime }}</span></div>
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
              <input type="checkbox" v-model="packingChecks.item1">
              <span>梱包状態に問題なし</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="packingChecks.item2">
              <span>品番・数量に相違なし</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="packingChecks.item3">
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
  dateFrom: '2024-08-19',
  dateTo: '2024-09-20',
  customer: '',
  carrier: ''
})

const shipments = ref([
  {
    no: 'A1S124429',
    date: '2024/08/19',
    customer: 'アルインコ\n123456-7890',
    site: 'テスト現場',
    carrier: 'Aカイシャ',
    reception: '',
    entryTime: '',
    exitTime: '',
    driver: 'アルインコ',
    workStartTime: '24/08/19 09:30:00',
    workEndTime: '24/08/19 10:45:30',
    pickingRemarks: '',
    carrierRemarks: '地図有り',
    items: [
      { 
        code: 'CSGB16', 
        name: 'マキシムベース感知装置', 
        borrower: '', 
        borrowerName: '', 
        orderQty: 10, 
        shipmentQty: 0, 
        user: '',
        seq: '001'
      },
      { 
        code: 'HK6N', 
        name: '鋼製布板 幅木用500X1829 橙', 
        borrower: '', 
        borrowerName: '', 
        orderQty: 5, 
        shipmentQty: 0, 
        user: '',
        seq: '002'
      }
    ]
  },
  {
    no: 'A1S124430',
    date: '2024/08/19',
    customer: 'アルインコ\n123456-7890',
    site: 'テスト現場',
    carrier: 'Aカイシャ',
    reception: '',
    entryTime: '',
    exitTime: '',
    driver: '鈴木一郎',
    workStartTime: '24/08/19 13:20:00',
    workEndTime: '24/08/19 14:15:00',
    pickingRemarks: '急ぎ対応',
    carrierRemarks: '要連絡',
    items: []
  },
  {
    no: 'A1S124431',
    date: '2024/08/19',
    customer: 'アルインコ\n123456-7890',
    site: 'テスト現場',
    carrier: 'Aカイシャ',
    reception: '',
    entryTime: '',
    exitTime: '',
    driver: '佐藤二郎',
    workStartTime: '',
    workEndTime: '',
    pickingRemarks: '',
    carrierRemarks: '地図有り',
    items: []
  }
])

const totalItems = computed(() => filteredShipments.value.length)
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

const filteredShipments = computed(() => {
  let result = shipments.value
  if (filters.value.customer) {
    result = result.filter(s => s.customer.includes(filters.value.customer))
  }
  if (filters.value.carrier) {
    result = result.filter(s => s.carrier.includes(filters.value.carrier))
  }
  const start = (pagination.value.current - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return result.slice(start, end)
})

const showDetailModal = ref(false)
const showPackingModal = ref(false)
const currentShipment = ref(null)

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

const searchShipments = () => {
  pagination.value.current = 1
  showToast('出荷伝票を検索しました')
}

const openDetailModal = (shipment) => {
  currentShipment.value = shipment
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  currentShipment.value = null
}

const saveShipmentDetail = () => {
  // 出荷数量のバリデーション
  if (currentShipment.value?.items) {
    for (const item of currentShipment.value.items) {
      if (item.shipmentQty > item.orderQty) {
        showToast(`品番 ${item.code} の出荷数が指示数を超えています`)
        return
      }
    }
  }
  showToast('出荷明細を保存しました')
  closeDetailModal()
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
.shipment-list-screen {
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
  max-width: 1000px;
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
  font-size: 0.75rem;
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

.qty-input, .user-input {
  width: 100px;
  padding: 4px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 0.7rem;
}

.qty-input:focus, .user-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.remarks-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 16px;
}

.remark-item {
  background: #f8fafc;
  padding: 12px;
  border-radius: 8px;
}

.remark-label {
  font-size: 0.7rem;
  font-weight: 500;
  color: #475569;
  margin-bottom: 4px;
}

.remark-content {
  font-size: 0.75rem;
  color: #1e293b;
  min-height: 40px;
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