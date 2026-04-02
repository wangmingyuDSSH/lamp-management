<!-- src/components/octo/InstructionListScreen.vue -->
<template>
  <div class="instruction-list">
    <div class="screen-card">
      <div class="card-header">
        <h3><i class="fas fa-search mr-2"></i>検索条件</h3>
      </div>

      <!-- 検索条件フォーム -->
      <div class="search-form">
        <div class="form-grid">
          <div class="form-field">
            <label>工事日(From)</label>
            <input type="date" v-model="searchForm.dateFrom" class="form-input">
          </div>
          <div class="form-field">
            <label>工事日(To)</label>
            <input type="date" v-model="searchForm.dateTo" class="form-input">
          </div>
          <div class="form-field">
            <label>得意先</label>
            <input type="text" v-model="searchForm.customer" class="form-input" placeholder="得意先名・コード">
          </div>
          <div class="form-field">
            <label>現場</label>
            <input type="text" v-model="searchForm.site" class="form-input" placeholder="現場名・コード">
          </div>
          <div class="form-field">
            <label>当社担当者</label>
            <select v-model="searchForm.staff" class="form-select">
              <option value="">すべて</option>
              <option value="yamada">山田太郎</option>
              <option value="suzuki">鈴木花子</option>
              <option value="sato">佐藤次郎</option>
            </select>
          </div>
          <div class="form-field">
            <label>施工業者</label>
            <select v-model="searchForm.contractor" class="form-select">
              <option value="">すべて</option>
              <option value="kensetsu">○○工務店</option>
              <option value="kenchiku">△△建設</option>
              <option value="sekkei">□□設計</option>
            </select>
          </div>
          <div class="form-field">
            <label>現場状況</label>
            <select v-model="searchForm.siteStatus" class="form-select">
              <option value="">すべて</option>
              <option value="new">新設</option>
              <option value="add">増設</option>
              <option value="dismantle">解体</option>
            </select>
          </div>
          <div class="form-field">
            <button class="btn-search" @click="searchInstructions">
              <i class="fas fa-search mr-2"></i>検索
            </button>
          </div>
        </div>
      </div>

      <!-- 検索結果ヘッダー -->
      <div class="result-header">
        <span class="result-count">検索結果: {{ filteredInstructions.length }}件</span>
        <button class="btn-export" @click="exportCSV">
          <i class="fas fa-file-export mr-1"></i>CSV出力
        </button>
      </div>

      <!-- 工事指示一覧テーブル -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th class="w-12">詳細</th>
              <th>工事日</th>
              <th>車番</th>
              <th>工事/得意先/現場/住所</th>
              <th>現場状況</th>
              <th>工事内容</th>
              <th>KY活動</th>
              <th>在庫伝票</th>
              <th>完了報告</th>
			  </tr>
             </thead>
          <tbody>
            <tr 
              v-for="item in paginatedInstructions" 
              :key="item.no"
              class="hover-row"
            >
              <td class="text-center">
                <button class="btn-detail" @click="openInstructionDetail(item)">
                  <i class="fas fa-external-link-alt"></i>
                </button>
                </td>
              <td class="font-semibold">{{ item.date }} </td>
              <td class="font-mono">{{ item.carNo }}<br>({{ item.carType }})</td>
              <td>
                <div class="customer-info">
                  <div class="customer-name">{{ item.customer }}</div>
                  <div class="site-address">{{ item.site }} / {{ item.address }}</div>
                </div>
              </td>
              <td>
                <span :class="['status-badge', getSiteStatusClass(item.siteStatus)]">
                  {{ item.siteStatus }}
                </span>
              </td>
              <td class="work-list">
                <div v-for="work in item.works" :key="work.code" class="work-item">
                  {{ work.name }}
                </div>
              </td>
              <td class="text-center">
                <button 
                  v-if="item.kyStatus === 'available'" 
                  class="btn-ky" 
                  @click="openKYActivity(item)"
                >
                  指示書へ
                </button>
                <span v-else class="text-slate-400">-</span>
              </td>
              <td class="text-center">
                <span v-if="item.stockStatus === 'confirmed'" class="text-green-600 font-semibold">
                  確認済
                </span>
                <span v-else-if="item.stockStatus === 'processing'" class="text-amber-600">
                  処理中
                </span>
                <span v-else class="text-slate-500">{{ item.stockStatus || '未' }}</span>
              </td>
              <td class="text-center">
                <button 
                  v-if="item.completionStatus === 'available'" 
                  class="btn-completion" 
                  @click="goToCompletionReport(item)"
                >
                  <i class="fas fa-clipboard-check mr-1"></i>完了報告へ
                </button>
                <span v-else-if="item.completionStatus === 'completed'" class="status-badge status-complete">
                  <i class="fas fa-check mr-1"></i>報告済
                </span>
                <span v-else class="status-badge status-pending">不可</span>
              </td>
            </tr>
            <tr v-if="paginatedInstructions.length === 0" class="no-data">
              <td colspan="9" class="text-center">該当するデータはありません</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ページネーション -->
      <div class="pagination">
        <p class="pagination-info">
          全 {{ filteredInstructions.length }} 件中 {{ pagination.start }}-{{ pagination.end }} 件表示
        </p>
        <div class="pagination-buttons">
          <button class="page-btn" :disabled="pagination.current === 1" @click="prevPage">
            <i class="fas fa-chevron-left"></i> 前へ
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
          <button class="page-btn" :disabled="pagination.current === pagination.totalPages" @click="nextPage">
            次へ <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <!-- フッター -->
      <div class="card-footer">
        <button class="btn-stock-list" @click="goToStockSlipList">
          <i class="fas fa-list mr-2"></i>在庫伝票一覧（入力）へ
        </button>
      </div>
    </div>

    <!-- 工事指示書モーダル - v-modelでデータバインディング -->
    <Teleport to="body">
      <div v-if="showInstructionModal" class="modal-overlay" @click="closeInstructionModal">
        <div class="modal-content modal-large" @click.stop>
          <div class="modal-header">
            <h3><i class="fas fa-clipboard-list mr-2"></i>工事指示書</h3>
            <div class="modal-header-right">
              <button class="modal-close" @click="closeInstructionModal">×</button>
            </div>
          </div>
          <div class="modal-body">
            <!-- ヘッダー情報 -->
            <div class="instruction-header">
              <div class="header-grid">
                <div class="header-item">
                  <span class="header-label">工事日</span>
                  <span class="header-value text-lg">{{ selectedInstruction?.date || '--/--' }}</span>
                </div>
                <div class="header-item">
                  <span class="header-label">工事No.</span>
                  <span class="header-value text-lg font-mono">{{ selectedInstruction?.no || '--' }}</span>
                </div>
                <div class="header-item">
                  <span class="header-label">車番</span>
                  <span class="header-value text-lg font-mono">{{ selectedInstruction?.carNo || '--' }}</span>
                </div>
                <div class="header-item">
                  <span class="header-label">工事区分</span>
                  <span class="status-badge status-processing">組立</span>
                </div>
              </div>
            </div>

            <!-- 得意先情報 / 担当者情報 -->
            <div class="info-section">
              <div class="info-card">
                <h4>得意先情報</h4>
                <div class="info-card-content">
                  <p><span class="info-label">取引先名</span><span class="info-text">{{ selectedInstruction?.customer || '--' }}</span></p>
                  <p><span class="info-label">現場住所</span><span class="info-text">{{ selectedInstruction?.address || '--' }}</span></p>
                  <p><span class="info-label">現場名</span><span class="info-text">{{ selectedInstruction?.site || '--' }}</span></p>
                </div>
              </div>
              <div class="info-card">
                <h4>担当者情報</h4>
                <div class="staff-grid">
                  <div class="staff-item">
                    <span class="staff-label">担当1</span>
                    <span class="staff-value">山田太郎</span>
                  </div>
                  <div class="staff-item">
                    <span class="staff-label">トラック</span>
                    <span class="staff-value">4T</span>
                  </div>
                  <div class="staff-item">
                    <span class="staff-label">担当2</span>
                    <span class="staff-value">鈴木花子</span>
                  </div>
                  <div class="staff-item">
                    <span class="staff-label">距離</span>
                    <span class="staff-value">2 km</span>
                  </div>
                  <div class="staff-item">
                    <span class="staff-label">AI担当者</span>
                    <span class="staff-value">佐藤次郎</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 工事内容明細 - v-modelでチェックボックスをバインド -->
            <div class="work-detail-section">
              <h4>工事内容明細</h4>
              <div class="work-table-container">
                <table class="work-table">
                  <thead>
                    <tr>
                      <th>工程</th>
                      <th>工法名称</th>
                      <th>単位</th>
                      <th class="text-right">数量</th>
                      <th>内容</th>
                      <th class="text-center">確認</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(work, idx) in selectedInstruction?.works" :key="work.code">
                      <td class="font-mono">{{ work.code }}</td>
                      <td>{{ work.name }}</td>
                      <td>{{ work.unit }}</td>
                      <td class="text-right font-semibold">{{ work.qty }}</td>
                      <td>{{ work.description || '-' }}</td>
                      <td class="text-center">
                        <input 
                          type="checkbox" 
                          v-model="work.confirmed" 
                          class="confirm-checkbox"
                        >
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 注意事項 - v-modelでテキストエリアをバインド -->
            <div class="note-section">
              <h4>注意事項</h4>
              <textarea 
                v-model="instructionNote" 
                rows="3" 
                class="note-input" 
                placeholder="注意事項を入力してください"
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-map" @click="showMap">
              <i class="fas fa-map-marked-alt mr-2"></i>マップ
            </button>
            <div class="footer-buttons">
              <button class="btn-site-usage" @click="openSiteUsageDetail">
                <i class="fas fa-clipboard-list mr-2"></i>現場使用明細
              </button>
              <button class="btn-site-comment" @click="openSiteComment">
                <i class="fas fa-comment mr-2"></i>現場コメント
              </button>
            </div>
            <button class="btn-ky-activity" @click="openKYActivityModal">
              <i class="fas fa-clipboard-check mr-2"></i>KY活動
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'

const showToast = inject('showToast')
const emit = defineEmits(['navigate'])

// 検索フォーム
const searchForm = ref({
  dateFrom: '2024-06-12',
  dateTo: '2024-06-19',
  customer: '',
  site: '',
  staff: '',
  contractor: '',
  siteStatus: ''
})

// 工事指示データ
const instructions = ref([
  {
    no: 'NT0011',
    date: '06/12',
    carNo: '0136',
    carType: '3T',
    customer: '○○株式会社',
    site: '××現場',
    address: '埼玉県川越市',
    siteStatus: '新設 2 4T',
    kyStatus: 'available',
    stockStatus: '',
    completionStatus: 'pending',
    works: [
      { code: '01', name: '外部足場工事', unit: '延床', qty: 100, description: '現場内設置(車内のみ可)-下屋/パル羽切り立上-基本オールW施工', confirmed: false },
      { code: '05', name: 'メッシュシート工事', unit: '掲面積', qty: 300, description: '', confirmed: false },
      { code: '09', name: 'イメージシート工事', unit: '個・枚', qty: 1, description: '', confirmed: false },
      { code: '15', name: 'ステップ階段工事', unit: '個・枚', qty: 3, description: '', confirmed: false }
    ]
  },
  {
    no: 'NT0012',
    date: '06/12',
    carNo: '0137',
    carType: '2T',
    customer: '△△建設',
    site: '△△現場',
    address: '東京都新宿区',
    siteStatus: '新設 3 4T',
    kyStatus: 'available',
    stockStatus: 'confirmed',
    completionStatus: 'available',
    works: [
      { code: '01', name: '外部足場工事', unit: '延床', qty: 80, description: '', confirmed: false },
      { code: '15', name: 'ステップ階段工事', unit: '個・枚', qty: 2, description: '', confirmed: false }
    ]
  },
  {
    no: 'NT0013',
    date: '06/13',
    carNo: '0138',
    carType: '4T',
    customer: '◇◇工務店',
    site: '☆☆現場',
    address: '神奈川県横浜市',
    siteStatus: '新設 2 4T',
    kyStatus: '',
    stockStatus: 'confirmed',
    completionStatus: 'completed',
    works: [
      { code: '01', name: '下屋上足場工事', unit: '延床', qty: 120, description: '', confirmed: true },
      { code: '02', name: '残り一面工事', unit: '面', qty: 1, description: '', confirmed: true }
    ]
  },
  {
    no: 'NT0014',
    date: '06/19',
    carNo: '0139',
    carType: '2T',
    customer: '□□開発',
    site: '○○現場',
    address: '千葉県船橋市',
    siteStatus: '新設 3 4T',
    kyStatus: 'available',
    stockStatus: '',
    completionStatus: 'pending',
    works: [
      { code: '05', name: 'メッシュシート工事', unit: '掲面積', qty: 200, description: '', confirmed: false },
      { code: '09', name: 'イメージシート工事', unit: '個・枚', qty: 2, description: '', confirmed: false },
      { code: '02', name: '残り一面工事', unit: '面', qty: 1, description: '', confirmed: false }
    ]
  }
])

// モーダル関連
const showInstructionModal = ref(false)
const selectedInstruction = ref(null)
const instructionNote = ref('')

// フィルタリング
const filteredInstructions = computed(() => {
  let result = instructions.value
  
  if (searchForm.value.customer) {
    result = result.filter(item => item.customer.includes(searchForm.value.customer))
  }
  if (searchForm.value.site) {
    result = result.filter(item => item.site.includes(searchForm.value.site))
  }
  if (searchForm.value.siteStatus) {
    const statusMap = { new: '新設', add: '増設', dismantle: '解体' }
    result = result.filter(item => item.siteStatus.includes(statusMap[searchForm.value.siteStatus]))
  }
  
  return result
})

// ページネーション
const itemsPerPage = ref(10)
const currentPage = ref(1)

const totalPages = computed(() => Math.ceil(filteredInstructions.value.length / itemsPerPage.value))
const paginatedInstructions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredInstructions.value.slice(start, end)
})

const pagination = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value + 1
  const end = Math.min(currentPage.value * itemsPerPage.value, filteredInstructions.value.length)
  const delta = 2
  const range = []
  for (let i = Math.max(2, currentPage.value - delta); i <= Math.min(totalPages.value - 1, currentPage.value + delta); i++) {
    range.push(i)
  }
  if (currentPage.value - delta > 2) range.unshift('...')
  if (currentPage.value + delta < totalPages.value - 1) range.push('...')
  range.unshift(1)
  if (totalPages.value > 1) range.push(totalPages.value)
  return {
    current: currentPage.value,
    totalPages: totalPages.value,
    start: start,
    end: end,
    pages: range
  }
})

const getSiteStatusClass = (status) => {
  if (status.includes('新設')) return 'status-new'
  if (status.includes('増設')) return 'status-add'
  if (status.includes('解体')) return 'status-dismantle'
  return ''
}

// 検索
const searchInstructions = () => {
  currentPage.value = 1
  showToast('検索しました')
}

// CSV出力
const exportCSV = () => {
  showToast('CSV出力を開始しました')
}

// 工事指示書を開く（ディープコピーしてデータを保持）
const openInstructionDetail = (item) => {
  // ディープコピーして元データに影響を与えないようにする
  selectedInstruction.value = JSON.parse(JSON.stringify(item))
  instructionNote.value = ''
  showInstructionModal.value = true
  showToast(`工事指示書を表示: ${item.no}`)
}

const closeInstructionModal = () => {
  showInstructionModal.value = false
  selectedInstruction.value = null
  instructionNote.value = ''
}

// KY活動 - 指示書へボタンで工事指示書モーダルを開く
const openKYActivity = (item) => {
  openInstructionDetail(item)
}

// 完了報告へ
const goToCompletionReport = (item) => {
  emit('navigate', 'completionReport')
  showToast(`工事完了報告画面を開きました：${item.no}`)
}

// 在庫伝票一覧へ
const goToStockSlipList = () => {
  emit('navigate', 'stockSlipList')
}

// マップ表示
const showMap = () => {
  showToast('マップを表示しました')
}

// 現場使用明細
const openSiteUsageDetail = () => {
  showToast('現場使用明細を表示しました')
}

// 現場コメント
const openSiteComment = () => {
  showToast('現場コメントを表示しました')
}

// KYチェックリスト
const openKYChecklist = () => {
  showToast('KY活動チェックリストを表示しました')
}

// KY活動（工事指示書画面右下）
const openKYActivityModal = () => {
  showToast('KY活動画面を表示しました')
}

// ページネーション操作
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const goToPage = (page) => {
  if (page !== '...') currentPage.value = page
}
</script>

<style scoped>
.instruction-list {
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
}

.card-header h3 {
  font-weight: bold;
  color: #1e293b;
  font-size: 1rem;
}

.search-form {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.form-field label {
  display: block;
  font-size: 0.75rem;
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
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-search:hover {
  background: #2563eb;
}

.result-header {
  padding: 12px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-count {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
}

.btn-export {
  padding: 4px 12px;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-export:hover {
  background: #f1f5f9;
}

.table-container {
  padding: 0 24px;
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
  border-bottom: 2px solid #e2e8f0;
}

.data-table td {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: top;
}

.hover-row:hover {
  background: #eff6ff;
  cursor: pointer;
}

.no-data {
  background: #f8fafc;
}

.w-12 {
  width: 48px;
}

.font-semibold {
  font-weight: 600;
}

.font-mono {
  font-family: monospace;
}

.text-center {
  text-align: center;
}

.customer-info {
  font-size: 0.875rem;
}

.customer-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.site-address {
  color: #64748b;
  font-size: 0.75rem;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 600;
}

.status-new {
  background: #dbeafe;
  color: #1e40af;
}

.status-add {
  background: #fef3c7;
  color: #92400e;
}

.status-dismantle {
  background: #fee2e2;
  color: #991b1b;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-complete {
  background: #d1fae5;
  color: #065f46;
}

.status-processing {
  background: #dbeafe;
  color: #1e40af;
}

.work-list {
  font-size: 0.75rem;
}

.work-item {
  margin-bottom: 2px;
}

.btn-detail, .btn-ky, .btn-completion {
  background: none;
  border: 1px solid;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-detail {
  border-color: #3b82f6;
  color: #3b82f6;
}

.btn-detail:hover {
  background: #3b82f6;
  color: white;
}

.btn-ky {
  border-color: #3b82f6;
  color: #3b82f6;
}

.btn-ky:hover {
  background: #3b82f6;
  color: white;
}

.btn-completion {
  border-color: #10b981;
  color: #10b981;
}

.btn-completion:hover {
  background: #10b981;
  color: white;
}

.text-green-600 {
  color: #10b981;
}

.text-amber-600 {
  color: #d97706;
}

.text-slate-500 {
  color: #64748b;
}

.text-slate-400 {
  color: #94a3b8;
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
  align-items: center;
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

.card-footer {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
}

.btn-stock-list {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-stock-list:hover {
  background: #2563eb;
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

.modal-large {
  max-width: 1000px;
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

.modal-body {
  padding: 24px;
  max-height: calc(90vh - 140px);
  overflow-y: auto;
}

.instruction-header {
  background: #eff6ff;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.header-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.header-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header-label {
  font-size: 0.7rem;
  color: #64748b;
}

.header-value {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.text-lg {
  font-size: 1rem;
}

.info-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.info-card {
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.info-card h4 {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.875rem;
}

.info-card-content p {
  font-size: 0.875rem;
  margin-bottom: 8px;
}

.info-label {
  display: inline-block;
  width: 80px;
  color: #64748b;
  font-size: 0.75rem;
}

.info-text {
  color: #1e293b;
  font-size: 0.875rem;
}

.staff-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.staff-item {
  display: flex;
  gap: 8px;
  font-size: 0.875rem;
}

.staff-label {
  color: #64748b;
  width: 60px;
}

.staff-value {
  color: #1e293b;
}

.work-detail-section {
  margin-bottom: 24px;
}

.work-detail-section h4 {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
  font-size: 0.875rem;
}

.work-table-container {
  overflow-x: auto;
}

.work-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  border: 1px solid #e2e8f0;
}

.work-table th {
  background: #f8fafc;
  padding: 10px;
  text-align: left;
  border: 1px solid #e2e8f0;
}

.work-table td {
  padding: 10px;
  border: 1px solid #e2e8f0;
}

.confirm-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.note-section {
  margin-bottom: 24px;
}

.note-section h4 {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
  font-size: 0.875rem;
}

.note-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  resize: vertical;
  font-size: 0.875rem;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-radius: 0 0 16px 16px;
}

.btn-map {
  padding: 8px 16px;
  background: #e2e8f0;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.footer-buttons {
  display: flex;
  gap: 12px;
}

.btn-site-usage, .btn-site-comment, .btn-ky-check {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-site-usage {
  background: #eff6ff;
  border: 1px solid #3b82f6;
  color: #3b82f6;
}

.btn-site-comment {
  background: #e2e8f0;
  border: none;
  color: #475569;
}

.btn-ky-check {
  background: #10b981;
  border: none;
  color: white;
}

.btn-site-usage:hover, .btn-site-comment:hover {
  transform: translateY(-1px);
}

.btn-ky-check:hover {
  background: #059669;
}

/* KY活動ボタン - 右下配置 */
.btn-ky-activity {
  padding: 10px 20px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 100px;
}

.btn-ky-activity:hover {
  background: #e2e8f0;
  transform: translateY(-1px);
}

.text-right {
  text-align: right;
}
</style>