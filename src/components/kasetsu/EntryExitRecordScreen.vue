<template>
  <div class="entry-exit-record-screen">
    <div class="screen-card">
      <div class="card-header">
        <h3><i class="fas fa-history mr-2"></i>入退場記録照会</h3>
        <button class="btn-csv" @click="exportCSV">
          <i class="fas fa-file-csv mr-2 text-green-600"></i>CSVダウンロード
        </button>
      </div>

      <!-- 検索条件 -->
      <div class="search-section">
        <div class="search-grid">
          <div class="search-field">
            <label>入場日(From)</label>
            <input type="date" v-model="filters.dateFrom" class="form-input">
          </div>
          <div class="search-field">
            <label>入場日(To)</label>
            <input type="date" v-model="filters.dateTo" class="form-input">
          </div>
          <div class="search-field">
            <label>車番</label>
            <input type="text" v-model="filters.plateNumber" class="form-input" placeholder="車番">
          </div>
          <div class="search-field">
            <label>運送会社</label>
            <input type="text" v-model="filters.carrier" class="form-input" placeholder="カナ">
          </div>
          <div class="search-field">
            <label>運転手</label>
            <input type="text" v-model="filters.driver" class="form-input" placeholder="カナ">
          </div>
          <div class="search-field">
            <label>状態</label>
            <select v-model="filters.status" class="form-select">
              <option value="">全て</option>
              <option value="entry">入場中</option>
              <option value="exited">退場済</option>
            </select>
          </div>
          <div class="search-field search-buttons">
            <label class="search-label-placeholder">&nbsp;</label>
            <div class="search-buttons-wrapper">
              <button class="btn-search" @click="searchRecords">
                <i class="fas fa-search mr-2"></i>検索
              </button>
              <button class="btn-clear" @click="clearFilters">
                <i class="fas fa-eraser mr-2"></i>クリア
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- サマリー -->
      <div class="summary-section">
        <div class="summary-item">
          <span class="summary-label">総件数</span>
          <span class="summary-value">{{ totalCount }}件</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">入場中</span>
          <span class="summary-value text-green-600">{{ entryCount }}件</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">退場済</span>
          <span class="summary-value text-blue-600">{{ exitedCount }}件</span>
        </div>
      </div>

      <!-- 一覧テーブル -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>入場No.</th>
              <th>状態</th>
              <th>入場日時</th>
              <th>退場日時</th>
              <th>車番</th>
              <th>車種</th>
              <th>運送会社</th>
              <th>運転手</th>
              <th>目的</th>
              <th>駐車時間</th>
              <th>詳細</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="record in paginatedRecords" 
              :key="record.entryNo"
              :class="{ 'exited-row': record.status === 'exited' }"
            >
              <td class="font-mono">{{ record.entryNo }}</td>
              <td>
                <span :class="['status-badge', `status-${record.status}`]">
                  {{ statusLabel(record.status) }}
                </span>
              </td>
              <td>{{ record.entryDate }} {{ record.entryTime }}</td>
              <td>
                <span v-if="record.exitDate">{{ record.exitDate }} {{ record.exitTime }}</span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="font-mono">{{ record.plateNumber }}</td>
              <td>{{ record.vehicleType }}</td>
              <td>{{ record.carrier }}</td>
              <td>{{ record.driver }}</td>
              <td>
                <span :class="['purpose-badge', `purpose-${record.purpose}`]">
                  {{ purposeLabel(record.purpose) }}
                </span>
              </td>
              <td>
                <span v-if="record.parkingTime" class="font-mono">{{ record.parkingTime }}</span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td>
                <button class="btn-detail" @click="showDetail(record)">
                  <i class="fas fa-eye"></i>
                </button>
              </td>
            </tr>
            <tr v-if="paginatedRecords.length === 0">
              <td colspan="11" class="text-center text-gray-500 py-8">
                該当する記録がありません
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ページネーション -->
      <div class="pagination">
        <p class="pagination-info">全 {{ filteredRecords.length }} 件中 {{ pagination.start }}-{{ pagination.end }} 件表示</p>
        <div class="pagination-buttons">
          <button class="page-btn" :disabled="pagination.current === 1" @click="goToPage(1)">
            <i class="fas fa-angle-double-left"></i>
          </button>
          <button class="page-btn" :disabled="pagination.current === 1" @click="goToPage(pagination.current - 1)">
            <i class="fas fa-angle-left"></i>
          </button>
          <button 
            v-for="page in pagination.pages" 
            :key="page"
            :class="['page-btn', { active: page === pagination.current }]"
            @click="goToPage(page)"
            :disabled="page === '...'"
          >
            {{ page }}
          </button>
          <button class="page-btn" :disabled="pagination.current === pagination.totalPages" @click="goToPage(pagination.current + 1)">
            <i class="fas fa-angle-right"></i>
          </button>
          <button class="page-btn" :disabled="pagination.current === pagination.totalPages" @click="goToPage(pagination.totalPages)">
            <i class="fas fa-angle-double-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- 詳細モーダル -->
    <div v-if="selectedRecord" class="modal-overlay" @click.self="closeDetail">
      <div class="modal-content">
        <div class="modal-header">
          <h3><i class="fas fa-info-circle mr-2"></i>入退場詳細</h3>
          <button class="modal-close" @click="closeDetail">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-section">
            <h4>基本情報</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">入場No.</span>
                <span class="detail-value font-mono">{{ selectedRecord.entryNo }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">状態</span>
                <span :class="['detail-value', 'status-badge', `status-${selectedRecord.status}`]">
                  {{ statusLabel(selectedRecord.status) }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">車番</span>
                <span class="detail-value font-mono">{{ selectedRecord.plateNumber }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">車種</span>
                <span class="detail-value">{{ selectedRecord.vehicleType }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">運送会社</span>
                <span class="detail-value">{{ selectedRecord.carrier }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">運転手</span>
                <span class="detail-value">{{ selectedRecord.driver }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>入退場情報</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">入場日時</span>
                <span class="detail-value">{{ selectedRecord.entryDate }} {{ selectedRecord.entryTime }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">退場日時</span>
                <span class="detail-value">{{ selectedRecord.exitDate || '-' }} {{ selectedRecord.exitTime || '' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">駐車時間</span>
                <span class="detail-value font-mono">{{ selectedRecord.parkingTime || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">目的</span>
                <span class="detail-value">{{ purposeLabel(selectedRecord.purpose) }}</span>
              </div>
            </div>
          </div>

          <div v-if="selectedRecord.workDetails" class="detail-section">
            <h4>作業情報</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">出荷作業</span>
                <span class="detail-value">{{ selectedRecord.workDetails.shipment ? '完了' : '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">入荷作業</span>
                <span class="detail-value">{{ selectedRecord.workDetails.receipt ? '完了' : '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">積込み</span>
                <span class="detail-value">{{ selectedRecord.workDetails.loading ? '完了' : '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">荷卸し</span>
                <span class="detail-value">{{ selectedRecord.workDetails.unloading ? '完了' : '-' }}</span>
              </div>
            </div>
          </div>

          <div v-if="selectedRecord.remarks" class="detail-section">
            <h4>備考</h4>
            <p class="remarks-text">{{ selectedRecord.remarks }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-close" @click="closeDetail">閉じる</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'

const showToast = inject('showToast')

// 検索条件
const filters = ref({
  dateFrom: '',
  dateTo: '',
  plateNumber: '',
  carrier: '',
  driver: '',
  status: ''
})

// ページネーション
const pagination = ref({
  current: 1,
  perPage: 10
})

// 選択中のレコード
const selectedRecord = ref(null)

// デモ用データ
const records = ref([
  {
    entryNo: 'E250301001',
    status: 'entry',
    entryDate: '2025/03/01',
    entryTime: '08:30',
    plateNumber: '1234',
    vehicleType: '4t',
    carrier: 'A運送株式会社',
    driver: '山田太郎',
    purpose: 'shipment',
    workDetails: { shipment: true, receipt: false, loading: true, unloading: false }
  },
  {
    entryNo: 'E250301002',
    status: 'exited',
    entryDate: '2025/03/01',
    entryTime: '09:15',
    exitDate: '2025/03/01',
    exitTime: '11:30',
    parkingTime: '2時間15分',
    plateNumber: '5678',
    vehicleType: '2t',
    carrier: 'B運送株式会社',
    driver: '佐藤花子',
    purpose: 'receipt',
    workDetails: { shipment: false, receipt: true, loading: false, unloading: true },
    remarks: '通常出荷'
  },
  {
    entryNo: 'E250301003',
    status: 'exited',
    entryDate: '2025/03/01',
    entryTime: '10:00',
    exitDate: '2025/03/01',
    exitTime: '14:20',
    parkingTime: '4時間20分',
    plateNumber: '9012',
    vehicleType: '8t',
    carrier: 'C運送株式会社',
    driver: '鈴木一郎',
    purpose: 'both',
    workDetails: { shipment: true, receipt: true, loading: true, unloading: true }
  },
  {
    entryNo: 'E250301004',
    status: 'entry',
    entryDate: '2025/03/01',
    entryTime: '11:30',
    plateNumber: '3456',
    vehicleType: '4t',
    carrier: 'D運送株式会社',
    driver: '田中次郎',
    purpose: 'shipment',
    workDetails: { shipment: false, receipt: false, loading: false, unloading: false }
  },
  {
    entryNo: 'E250228001',
    status: 'exited',
    entryDate: '2025/02/28',
    entryTime: '08:00',
    exitDate: '2025/02/28',
    exitTime: '10:45',
    parkingTime: '2時間45分',
    plateNumber: '7890',
    vehicleType: '4t',
    carrier: 'E運送株式会社',
    driver: '高橋三郎',
    purpose: 'shipment',
    workDetails: { shipment: true, receipt: false, loading: true, unloading: false }
  },
  {
    entryNo: 'E250228002',
    status: 'exited',
    entryDate: '2025/02/28',
    entryTime: '09:30',
    exitDate: '2025/02/28',
    exitTime: '13:00',
    parkingTime: '3時間30分',
    plateNumber: '2468',
    vehicleType: '10t',
    carrier: 'F運送株式会社',
    driver: '伊藤四郎',
    purpose: 'receipt',
    workDetails: { shipment: false, receipt: true, loading: false, unloading: true },
    remarks: '大型品の入荷'
  },
  {
    entryNo: 'E250228003',
    status: 'exited',
    entryDate: '2025/02/28',
    entryTime: '13:00',
    exitDate: '2025/02/28',
    exitTime: '15:30',
    parkingTime: '2時間30分',
    plateNumber: '1357',
    vehicleType: '2t',
    carrier: 'G運送株式会社',
    driver: '渡辺五郎',
    purpose: 'shipment',
    workDetails: { shipment: true, receipt: false, loading: true, unloading: false }
  },
  {
    entryNo: 'E250227001',
    status: 'exited',
    entryDate: '2025/02/27',
    entryTime: '08:15',
    exitDate: '2025/02/27',
    exitTime: '12:00',
    parkingTime: '3時間45分',
    plateNumber: '9753',
    vehicleType: '4t',
    carrier: 'H運送株式会社',
    driver: '山本六郎',
    purpose: 'both',
    workDetails: { shipment: true, receipt: true, loading: true, unloading: true }
  }
])

// フィルタリングされたレコード
const filteredRecords = computed(() => {
  return records.value.filter(r => {
    const matchPlate = !filters.value.plateNumber || r.plateNumber.includes(filters.value.plateNumber)
    const matchCarrier = !filters.value.carrier || r.carrier.includes(filters.value.carrier)
    const matchDriver = !filters.value.driver || r.driver.includes(filters.value.driver)
    const matchStatus = !filters.value.status || r.status === filters.value.status
    
    // 日付範囲のフィルタリング
    let matchDate = true
    if (filters.value.dateFrom) {
      matchDate = matchDate && r.entryDate >= filters.value.dateFrom.replace(/-/g, '/')
    }
    if (filters.value.dateTo) {
      matchDate = matchDate && r.entryDate <= filters.value.dateTo.replace(/-/g, '/')
    }
    
    return matchPlate && matchCarrier && matchDriver && matchStatus && matchDate
  })
})

// ページネーションされたレコード
const paginatedRecords = computed(() => {
  const start = (pagination.value.current - 1) * pagination.value.perPage
  const end = start + pagination.value.perPage
  return filteredRecords.value.slice(start, end)
})

// サマリー
const totalCount = computed(() => filteredRecords.value.length)
const entryCount = computed(() => filteredRecords.value.filter(r => r.status === 'entry').length)
const exitedCount = computed(() => filteredRecords.value.filter(r => r.status === 'exited').length)

// ページネーション情報
const paginationInfo = computed(() => {
  const total = filteredRecords.value.length
  const totalPages = Math.ceil(total / pagination.value.perPage)
  const current = pagination.value.current
  const start = (current - 1) * pagination.value.perPage + 1
  const end = Math.min(current * pagination.value.perPage, total)
  
  // ページ番号の生成
  const pages = []
  const maxVisible = 5
  
  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    if (current <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i)
      pages.push('...')
      pages.push(totalPages)
    } else if (current >= totalPages - 2) {
      pages.push(1)
      pages.push('...')
      for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(totalPages)
    }
  }
  
  return { current, totalPages, start, end, pages }
})

// ラベル変換
const statusLabel = (status) => {
  const labels = { entry: '入場中', exited: '退場済' }
  return labels[status] || status
}

const purposeLabel = (purpose) => {
  const labels = { shipment: '出荷', receipt: '入荷', both: '出荷/入荷', other: 'その他' }
  return labels[purpose] || purpose
}

// メソッド
const searchRecords = () => {
  pagination.value.current = 1
  showToast(`${filteredRecords.value.length}件の記録が見つかりました`)
}

const clearFilters = () => {
  filters.value = {
    dateFrom: '',
    dateTo: '',
    plateNumber: '',
    carrier: '',
    driver: '',
    status: ''
  }
  pagination.value.current = 1
  showToast('検索条件をクリアしました')
}

const goToPage = (page) => {
  if (page === '...') return
  pagination.value.current = page
}

const showDetail = (record) => {
  selectedRecord.value = record
}

const closeDetail = () => {
  selectedRecord.value = null
}

const exportCSV = () => {
  // CSVヘッダー
  const headers = ['入場No.', '状態', '入場日', '入場時刻', '退場日', '退場時刻', '駐車時間', '車番', '車種', '運送会社', '運転手', '目的', '備考']
  
  // CSVデータ
  const rows = filteredRecords.value.map(r => [
    r.entryNo,
    statusLabel(r.status),
    r.entryDate,
    r.entryTime,
    r.exitDate || '',
    r.exitTime || '',
    r.parkingTime || '',
    r.plateNumber,
    r.vehicleType,
    r.carrier,
    r.driver,
    purposeLabel(r.purpose),
    r.remarks || ''
  ])
  
  // CSV生成
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  
  // ダウンロード
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `入退場記録_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  
  showToast('CSVファイルをダウンロードしました')
}
</script>

<style scoped>
.entry-exit-record-screen {
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
  padding: 8px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-csv:hover {
  background: #f8fafc;
  border-color: #3b82f6;
}

.search-section {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: #fafbfc;
}

.search-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
  align-items: end;
}

.search-field label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 6px;
}

.form-input, .form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #3b82f6;
}

.search-label-placeholder {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: transparent;
  margin-bottom: 6px;
  user-select: none;
}

.search-buttons-wrapper {
  display: flex;
  gap: 8px;
}

.btn-search {
  flex: 1;
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-search:hover {
  background: #2563eb;
}

.btn-clear {
  flex: 1;
  padding: 8px 16px;
  background: #f1f5f9;
  color: #64748b;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-clear:hover {
  background: #e2e8f0;
}

.summary-section {
  display: flex;
  gap: 24px;
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: white;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-label {
  font-size: 0.875rem;
  color: #64748b;
}

.summary-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: #1e293b;
}

.table-container {
  overflow-x: auto;
  padding: 0 24px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table th {
  background: #f1f5f9;
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

.data-table tr:hover {
  background: #f8fafc;
}

.data-table tr.exited-row {
  background: #f8fafc;
}

.data-table tr.exited-row:hover {
  background: #f1f5f9;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-entry {
  background: #dcfce7;
  color: #166534;
}

.status-exited {
  background: #dbeafe;
  color: #1e40af;
}

.purpose-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.purpose-shipment {
  background: #dbeafe;
  color: #1e40af;
}

.purpose-receipt {
  background: #dcfce7;
  color: #166534;
}

.purpose-both {
  background: #fef3c7;
  color: #92400e;
}

.btn-detail {
  padding: 6px 10px;
  background: #f1f5f9;
  border: none;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-detail:hover {
  background: #e2e8f0;
  color: #3b82f6;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
}

.pagination-info {
  font-size: 0.875rem;
  color: #64748b;
}

.pagination-buttons {
  display: flex;
  gap: 4px;
}

.page-btn {
  padding: 6px 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 32px;
}

.page-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #3b82f6;
  color: #3b82f6;
}

.page-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* モーダル */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

.modal-header {
  padding: 16px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-weight: bold;
  color: #1e293b;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.modal-close:hover {
  background: #f1f5f9;
  color: #64748b;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  max-height: 60vh;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.detail-label {
  font-size: 0.875rem;
  color: #64748b;
}

.detail-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
}

.remarks-text {
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.5;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
}

.btn-close {
  padding: 10px 24px;
  background: #f1f5f9;
  color: #64748b;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #e2e8f0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1200px) {
  .search-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .search-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .summary-section {
    flex-wrap: wrap;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .search-grid {
    grid-template-columns: 1fr;
  }
  
  .pagination {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
