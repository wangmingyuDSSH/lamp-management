<template>
  <div class="inventory-list">
    <div class="screen-card">
      <div class="card-header">
        <div>
          <h3><i class="fas fa-list mr-2"></i>付箋一覧・検索</h3>
          <p class="header-subtitle">登録した棚卸内容の検索・照会・編集・削除が可能です</p>
        </div>
        <div class="header-actions">
          <button class="btn-export" @click="exportCSV">
            <i class="fas fa-download mr-2"></i>CSV出力
          </button>
          <button class="btn-export" @click="exportPDF">
            <i class="fas fa-file-pdf mr-2 text-red-500"></i>PDF出力
          </button>
        </div>
      </div>

      <!-- 検索フィルター -->
      <div class="filter-section">
        <div class="filter-grid">
          <div class="filter-field">
            <label>エリア</label>
            <select v-model="filters.area" class="form-select">
              <option value="">すべて</option>
              <option value="A">エリアA</option>
              <option value="B">エリアB</option>
              <option value="C">エリアC</option>
              <option value="D">エリアD</option>
            </select>
          </div>
          <div class="filter-field">
            <label>品番</label>
            <input type="text" v-model="filters.itemCode" class="form-input" placeholder="品番を入力">
          </div>
          <div class="filter-field">
            <label>登録日</label>
            <input type="date" v-model="filters.date" class="form-input">
          </div>
          <div class="filter-field">
            <label>登録者</label>
            <select v-model="filters.user" class="form-select">
              <option value="">すべて</option>
              <option>山田</option>
              <option>田中</option>
              <option>鈴木</option>
            </select>
          </div>
          <div class="filter-field">
            <label>ステータス</label>
            <select v-model="filters.status" class="form-select">
              <option value="">すべて</option>
              <option value="normal">一致</option>
              <option value="diff">差異あり</option>
              <option value="pending">未確認</option>
            </select>
          </div>
          <div class="filter-field">
            <button class="btn-search" @click="searchItems">
              <i class="fas fa-search mr-2"></i>検索
            </button>
          </div>
        </div>
      </div>

      <!-- データテーブル -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>No</th>
              <th>エリア</th>
              <th>品番</th>
              <th>品名</th>
              <th class="text-right">システム在庫</th>
              <th class="text-right">実地数量</th>
              <th class="text-center">差異</th>
              <th>登録者</th>
              <th>日時</th>
              <th class="text-center">操作</th>
			  </tr>
             </thead>
          <tbody>
            <tr v-for="item in paginatedItems" :key="item.id" :class="{ 'diff-row': item.diff !== 0 }">
              <td class="font-medium">{{ item.id }}  </td>
              <td>
                <span :class="['area-badge', `area-${item.area}`]">{{ item.area }}</span>
              </td>
              <td class="font-mono">{{ item.itemCode }}  </td>
              <td>{{ item.itemName }}  </td>
              <td class="text-right">{{ item.systemQty }}  </td>
              <td class="text-right font-bold">{{ item.actualQty }}  </td>
              <td class="text-center">
                <span v-if="item.diff === 0" class="status-badge status-match">一致</span>
                <span v-else-if="item.diff > 0" class="status-badge status-plus">+{{ item.diff }}</span>
                <span v-else class="status-badge status-minus">{{ item.diff }}</span>
               </td>
              <td>{{ item.user }}  </td>
              <td class="text-slate-500 text-xs">{{ item.datetime }}  </td>
              <td class="text-center">
                <button class="btn-icon btn-print" @click="openLabelModal(item)" title="付箋印刷">
                  <i class="fas fa-print"></i>
                </button>
                <button class="btn-icon btn-edit" @click="openEditModal(item)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" @click="deleteItem(item.id)">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
             </tr>
          </tbody>
        </table>
      </div>

      <!-- ページネーション -->
      <div class="pagination">
        <p class="pagination-info">
          全 {{ filteredItems.length }} 件中 {{ pagination.start }}-{{ pagination.end }} 件表示
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
    </div>

    <!-- 付箋ラベル印刷モーダル -->
    <div v-if="showLabelModal" class="modal-overlay active" @click.self="closeLabelModal">
      <div class="modal-content">
        <div class="modal-header">
          <div>
            <h3><i class="fas fa-print mr-2"></i>付箋ラベル印刷</h3>
            <p class="modal-subtitle">No. {{ labelForm.id }} - {{ labelForm.itemCode }}</p>
          </div>
          <button class="modal-close" @click="closeLabelModal">×</button>
        </div>
        <div class="modal-body">
          <div class="label-settings">
            <div class="edit-row">
              <div class="edit-field">
                <label>ラベルサイズ</label>
                <select v-model="labelSize" class="form-select">
                  <option value="small">40mm × 60mm（コンパクト）</option>
                  <option value="standard">50mm × 80mm（標準）</option>
                  <option value="large">60mm × 100mm（大型）</option>
                </select>
              </div>
              <div class="edit-field">
                <label>印刷機</label>
                <select v-model="labelPrinter" class="form-select">
                  <option>ラベルプリンタ LP-5230</option>
                  <option>レーザープリンタ</option>
                  <option>インクジェット</option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="label-preview-section">
            <h4>プレビュー</h4>
            <div :class="['label-preview-card', `label-${labelSize}`]">
              <div class="label-content">
                <div class="label-header">
                  <span class="area-tag" :class="`area-${labelForm.area}`">エリア{{ labelForm.area }}</span>
                  <span class="label-date">{{ formatDateShort(labelForm.datetime) }}</span>
                </div>
                <div class="label-qr">
                  <i class="fas fa-qrcode fa-3x"></i>
                </div>
                <div class="label-info">
                  <div class="label-code">{{ labelForm.itemCode }}</div>
                  <div class="label-name">{{ labelForm.itemName }}</div>
                  <div class="label-location" v-if="labelForm.location">場所: {{ labelForm.location }}</div>
                  <div class="label-qty">
                    <span class="qty-number">{{ labelForm.actualQty }}</span>
                    <span class="qty-unit">個</span>
                  </div>
                  <div class="label-user">担当: {{ labelForm.user }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <div class="footer-left"></div>
          <div class="footer-right">
            <button class="btn-cancel" @click="closeLabelModal">キャンセル</button>
            <button class="btn-save" @click="printLabel">
              <i class="fas fa-print mr-2"></i>印刷実行
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 編集モーダル -->
    <div v-if="showEditModal" class="modal-overlay active" @click.self="closeEditModal">
      <div class="modal-content">
        <div class="modal-header">
          <div>
            <h3><i class="fas fa-edit mr-2"></i>付箋編集</h3>
            <p class="modal-subtitle">棚卸データの修正・更新</p>
          </div>
          <button class="modal-close" @click="closeEditModal">×</button>
        </div>
        <div class="modal-body">
          <div class="edit-badge">
            <span class="badge-edit">変更モード</span>
            <span>No. <span class="font-mono font-bold">{{ editForm.id }}</span></span>
          </div>

          <div class="edit-row">
            <div class="edit-field">
              <label>品番</label>
              <input type="text" v-model="editForm.itemCode" class="form-input bg-slate-100" readonly>
            </div>
            <div class="edit-field">
              <label>品名</label>
              <input type="text" v-model="editForm.itemName" class="form-input bg-slate-100" readonly>
            </div>
          </div>

          <div class="edit-row">
            <div class="edit-field">
              <label>エリア <span class="required">*</span></label>
              <select v-model="editForm.area" class="form-select">
                <option value="A">エリアA</option>
                <option value="B">エリアB</option>
                <option value="C">エリアC</option>
                <option value="D">エリアD</option>
              </select>
            </div>
            <div class="edit-field">
              <label>保管場所</label>
              <input type="text" v-model="editForm.location" class="form-input" placeholder="例: A-12-3">
            </div>
          </div>

          <div class="edit-row">
            <div class="edit-field">
              <label>システム在庫</label>
              <input type="number" v-model="editForm.systemQty" class="form-input bg-slate-100 text-right" readonly>
            </div>
            <div class="edit-field">
              <label>実地数量 <span class="required">*</span></label>
              <input 
                type="number" 
                v-model="editForm.actualQty" 
                class="form-input text-right" 
                @input="calculateDiff"
                min="0"
              >
            </div>
            <div class="edit-field">
              <label>差異</label>
              <input 
                type="text" 
                :value="editForm.diff" 
                class="form-input bg-slate-100 text-center" 
                :class="{ 'diff-positive': editForm.diff > 0, 'diff-negative': editForm.diff < 0 }" 
                readonly
              >
            </div>
          </div>

          <div class="edit-row">
            <div class="edit-field">
              <label>登録者</label>
              <select v-model="editForm.user" class="form-select">
                <option>山田</option>
                <option>田中</option>
                <option>鈴木</option>
                <option>佐藤</option>
              </select>
            </div>
            <div class="edit-field">
              <label>登録日時</label>
              <input type="text" v-model="editForm.datetime" class="form-input bg-slate-100" readonly>
            </div>
          </div>

          <div class="edit-field full-width">
            <label>備考</label>
            <textarea 
              v-model="editForm.remarks" 
              rows="3" 
              class="form-textarea" 
              placeholder="損傷、汚染、その他特記事項"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <div class="footer-left">
            <button class="btn-reset" @click="resetToSystemQty">
              <i class="fas fa-undo-alt mr-1"></i>システム在庫にリセット
            </button>
          </div>
          <div class="footer-right">
            <button class="btn-cancel" @click="closeEditModal">キャンセル</button>
            <button class="btn-save" @click="saveEdit">更新</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'

const showToast = inject('showToast')

// 検索フィルター
const filters = ref({
  area: '',
  itemCode: '',
  date: '2026-03-23',
  user: '',
  status: ''
})

// 在庫データ
const inventoryItems = ref([
  { id: 1, area: 'A', itemCode: 'ABC-001', itemName: '鋼製足場板 300×1800', systemQty: 150, actualQty: 150, diff: 0, user: '山田', datetime: '2026/03/23 10:23', location: 'エリアA-12', remarks: '' },
  { id: 2, area: 'A', itemCode: 'ABC-015', itemName: '鋼製足場板 400×1800', systemQty: 12, actualQty: 8, diff: -4, user: '田中', datetime: '2026/03/23 10:15', location: 'エリアA-15', remarks: '欠品の可能性' },
  { id: 3, area: 'B', itemCode: 'XYZ-888', itemName: '単管パイプ 48.6×3.5', systemQty: 200, actualQty: 200, diff: 0, user: '鈴木', datetime: '2026/03/23 09:45', location: 'エリアB-08', remarks: '' },
  { id: 4, area: 'C', itemCode: 'DEF-222', itemName: 'ジャッキ 油圧式 5t', systemQty: 10, actualQty: 7, diff: -3, user: '山田', datetime: '2026/03/23 09:30', location: 'エリアC-03', remarks: '破損品あり' },
  { id: 5, area: 'A', itemCode: 'ABC-032', itemName: '鋼製足場板 250×1500', systemQty: 85, actualQty: 85, diff: 0, user: '田中', datetime: '2026/03/23 09:15', location: 'エリアA-22', remarks: '' }
])

// フィルタリング
const filteredItems = computed(() => {
  return inventoryItems.value.filter(item => {
    if (filters.value.area && item.area !== filters.value.area) return false
    if (filters.value.itemCode && !item.itemCode.includes(filters.value.itemCode)) return false
    if (filters.value.user && item.user !== filters.value.user) return false
    if (filters.value.status === 'normal' && item.diff !== 0) return false
    if (filters.value.status === 'diff' && item.diff === 0) return false
    return true
  })
})

// ページネーション設定
const itemsPerPage = ref(10)
const currentPage = ref(1)

const totalPages = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage.value))

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredItems.value.slice(start, end)
})

const pagination = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value + 1
  const end = Math.min(currentPage.value * itemsPerPage.value, filteredItems.value.length)
  const total = totalPages.value
  const current = currentPage.value
  const delta = 2
  const range = []
  
  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i)
  }
  if (current - delta > 2) range.unshift('...')
  if (current + delta < total - 1) range.push('...')
  range.unshift(1)
  if (total > 1) range.push(total)
  
  return {
    current: current,
    totalPages: total,
    start: start,
    end: end,
    pages: range
  }
})

// 付箋ラベル印刷関連
const showLabelModal = ref(false)
const labelForm = ref({
  id: null,
  itemCode: '',
  itemName: '',
  area: '',
  actualQty: 0,
  user: '',
  datetime: '',
  location: ''
})
const labelSize = ref('standard')
const labelPrinter = ref('ラベルプリンタ LP-5230')

// 日付フォーマット（短い形式）
const formatDateShort = (datetime) => {
  if (!datetime) return ''
  const date = new Date(datetime.replace(/\//g, '-'))
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}/${day}`
}

// ラベル印刷モーダルを開く
const openLabelModal = (item) => {
  labelForm.value = { ...item }
  showLabelModal.value = true
}

// ラベル印刷モーダルを閉じる
const closeLabelModal = () => {
  showLabelModal.value = false
}

// ラベル印刷
const printLabel = () => {
  showToast(`付箋ラベルを印刷しました (No.${labelForm.value.id})`)
  closeLabelModal()
}

// 編集モーダル関連
const showEditModal = ref(false)
const editForm = ref({
  id: null,
  itemCode: '',
  itemName: '',
  area: '',
  systemQty: 0,
  actualQty: 0,
  diff: 0,
  user: '',
  datetime: '',
  location: '',
  remarks: ''
})

// 現在日時を取得
const getCurrentDateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${year}/${month}/${day} ${hours}:${minutes}`
}

// 検索
const searchItems = () => {
  currentPage.value = 1
  showToast('検索しました')
}

// CSV出力
const exportCSV = () => {
  showToast('CSVダウンロードを開始しました')
}

// PDF出力
const exportPDF = () => {
  showToast('PDF出力を開始しました')
}

// 編集モーダルを開く
const openEditModal = (item) => {
  editForm.value = {
    ...item,
    diff: item.actualQty - item.systemQty
  }
  showEditModal.value = true
}

// 編集モーダルを閉じる
const closeEditModal = () => {
  showEditModal.value = false
}

// 差異を計算
const calculateDiff = () => {
  const diff = (editForm.value.actualQty || 0) - (editForm.value.systemQty || 0)
  editForm.value.diff = diff
}

// システム在庫にリセット
const resetToSystemQty = () => {
  if (confirm('システム在庫の数量にリセットしますか？')) {
    editForm.value.actualQty = editForm.value.systemQty
    calculateDiff()
    showToast('システム在庫の数量にリセットしました')
  }
}

// 保存
const saveEdit = () => {
  // バリデーション
  if (!editForm.value.area) {
    showToast('エリアを選択してください')
    return
  }
  
  if (editForm.value.actualQty === undefined || editForm.value.actualQty === null) {
    showToast('実地数量を入力してください')
    return
  }
  
  if (editForm.value.actualQty < 0) {
    showToast('実地数量は0以上の値を入力してください')
    return
  }
  
  const index = inventoryItems.value.findIndex(i => i.id === editForm.value.id)
  if (index !== -1) {
    // 更新日時を設定
    editForm.value.datetime = getCurrentDateTime()
    // 更新
    inventoryItems.value[index] = { ...editForm.value }
    showToast('棚卸データを更新しました')
  }
  closeEditModal()
}

// 削除
const deleteItem = (id) => {
  if (confirm('このデータを削除しますか？')) {
    const index = inventoryItems.value.findIndex(i => i.id === id)
    if (index !== -1) {
      inventoryItems.value.splice(index, 1)
      // ページネーション調整
      if (paginatedItems.value.length === 0 && currentPage.value > 1) {
        currentPage.value--
      }
      showToast('削除しました')
    }
  }
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
.inventory-list {
  animation: fadeIn 0.3s ease;
}

.screen-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-header {
  padding: 20px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-header h3 {
  font-weight: bold;
  color: #1e293b;
  font-size: 1.125rem;
}

.header-subtitle {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 4px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-export {
  padding: 6px 12px;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
}

.btn-export:hover {
  background: #f1f5f9;
}

.filter-section {
  padding: 20px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  align-items: end;
}

.filter-field label {
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

.form-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  resize: vertical;
  font-size: 0.875rem;
}

.form-textarea:focus {
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
  font-weight: 600;
  color: #475569;
  border-bottom: 2px solid #e2e8f0;
}

.data-table td {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.diff-row {
  background: #fef3c7;
}

.font-medium {
  font-weight: 500;
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

.text-xs {
  font-size: 0.7rem;
}

.text-slate-500 {
  color: #64748b;
}

.font-bold {
  font-weight: bold;
}

.area-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
}

.area-A { background: #dbeafe; color: #1e40af; }
.area-B { background: #e0e7ff; color: #3730a3; }
.area-C { background: #ede9fe; color: #5b21b6; }
.area-D { background: #fce7f3; color: #9d174d; }

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
}

.status-match {
  background: #d1fae5;
  color: #065f46;
}

.status-plus {
  background: #dbeafe;
  color: #1e40af;
}

.status-minus {
  background: #fee2e2;
  color: #991b1b;
}

.btn-icon {
  background: none;
  border: none;
  padding: 4px 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-print { color: #10b981; }
.btn-print:hover { color: #059669; }
.btn-edit { color: #3b82f6; }
.btn-edit:hover { color: #2563eb; }
.btn-delete { color: #ef4444; }
.btn-delete:hover { color: #dc2626; }

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
  max-width: 700px;
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

.modal-subtitle {
  color: #bfdbfe;
  font-size: 0.7rem;
  margin-top: 2px;
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

.edit-badge {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.badge-edit {
  padding: 4px 12px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.edit-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.edit-field {
  margin-bottom: 0;
}

.edit-field.full-width {
  grid-column: span 2;
  margin-bottom: 0;
}

.edit-field label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: #475569;
  margin-bottom: 4px;
}

.required {
  color: #ef4444;
}

.diff-positive {
  color: #10b981;
}

.diff-negative {
  color: #ef4444;
}

.bg-slate-100 {
  background: #f1f5f9;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-left {
  display: flex;
  gap: 12px;
}

.footer-right {
  display: flex;
  gap: 12px;
}

.btn-reset {
  padding: 8px 16px;
  background: #e2e8f0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
}

.btn-reset:hover {
  background: #cbd5e1;
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

.btn-save {
  padding: 8px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover {
  background: #2563eb;
}

/* 付箋ラベル印刷スタイル */
.label-settings {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.label-preview-section {
  margin-bottom: 20px;
}

.label-preview-section h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
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