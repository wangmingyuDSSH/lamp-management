<template>
  <div class="uninspected-screen">
    <div class="screen-card">
      <div class="card-header">
        <h3><i class="fas fa-exclamation-circle mr-2"></i>未検収一覧</h3>
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
            <label>現場</label>
            <input type="text" v-model="filters.site" class="form-input" placeholder="名称/コード">
          </div>
          <div class="search-field">
            <button class="btn-search" @click="searchUninspected">
              <i class="fas fa-search mr-2"></i>検索
            </button>
          </div>
        </div>

        <div class="filter-options">
          <label class="checkbox-label">
            <input type="checkbox" v-model="filters.onlyUninspected">
            <span>未検収あり伝票のみ</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="filters.onlyRereturn">
            <span>再リースのみ</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="filters.bySlip">
            <span>伝票単位</span>
          </label>
          <div class="area-select">
            <span>小出しエリア:</span>
            <select v-model="filters.area" class="form-select-sm">
              <option>全てのエリア</option>
              <option>エリアA</option>
              <option>エリアB</option>
              <option>エリアC</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 未検収一覧 -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>入荷日</th>
              <th>入荷No.</th>
              <th>得意先名</th>
              <th>現場</th>
              <th>品番</th>
              <th>品名or未検内容</th>
              <th class="text-right">数量</th>
              <th class="text-right">完了数量</th>
              <th>単位</th>
              <th>入力中</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="item in uninspectedList" 
              :key="item.id"
              class="hover-row"
              @click="openDetail(item)"
            >
              <td class="font-mono">{{ item.date }} </td>
              <td class="font-mono text-blue-600 underline">{{ item.no }} </td>
              <td>{{ item.customer }} </td>
              <td>{{ item.site }} </td>
              <td class="font-mono">{{ item.itemCode }} </td>
              <td>{{ item.itemName }} </td>
              <td class="text-right">{{ item.qty }} </td>
              <td class="text-right">{{ item.completedQty }} </td>
              <td>{{ item.unit }} </td>
              <td>{{ item.inputting }} </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 未検収詳細モーダル -->
    <div v-if="showDetailModal" class="modal-overlay active" @click.self="closeDetailModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3><i class="fas fa-edit mr-2"></i>未検収情報入力</h3>
          <button class="modal-close" @click="closeDetailModal">×</button>
        </div>
        <div class="modal-body">
          <div class="info-header">
            <div>入荷No: <span class="font-mono font-bold">{{ currentItem?.no }}</span></div>
            <div>倉庫: <span>{{ currentItem?.warehouse || '312' }}</span></div>
            <div>
              <select v-model="labelOption" class="form-select-sm">
                <option value="print">未検ラベル発行</option>
                <option value="reprint">再発行</option>
                <option value="batch">一括発行</option>
              </select>
            </div>
          </div>

          <div class="item-summary">
            <table class="summary-table">
              <thead>
                <tr><th>品番</th><th>品名</th><th>数量</th><th>単位</th><th>ラベル枚数</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td class="font-mono">{{ currentItem?.itemCode }}</td>
                  <td>{{ currentItem?.itemName }}</td>
                  <td class="text-right">{{ currentItem?.qty }}</td>
                  <td>{{ currentItem?.unit }}</td>
                  <td class="text-right">{{ totalLabelCount }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="uninspected-input">
            <h4>未検収内容</h4>
            <div 
              v-for="(item, index) in uninspectedItems" 
              :key="index" 
              class="uninspected-row"
            >
              <select v-model="item.type" class="form-select-sm">
                <option value="">-</option>
                <option value="damage">破損</option>
                <option value="loss">紛失</option>
                <option value="other">その他</option>
              </select>
              <input 
                type="text" 
                v-model="item.description" 
                class="form-input-sm" 
                placeholder="内容を入力"
              >
              <input 
                type="number" 
                v-model="item.qty" 
                class="qty-input-sm" 
                min="0"
                @input="updateLabelCount"
              >
              <select v-model="item.unit" class="form-select-sm">
                <option value="">-</option>
                <option value="個">個</option>
                <option value="本">本</option>
                <option value="枚">枚</option>
                <option value="セット">セット</option>
              </select>
              <input 
                type="number" 
                v-model="item.labelCount" 
                class="qty-input-sm bg-slate-100" 
                readonly
              >
              <span class="label-count">{{ item.labelCount }}</span>
            </div>
            <button class="btn-add-row" @click="addUninspectedItem">
              <i class="fas fa-plus mr-1"></i>行追加
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <div class="total-labels">発行枚数: <span class="font-bold">{{ totalLabelCount }}</span></div>
          <div class="footer-buttons">
            <button class="btn-cancel" @click="closeDetailModal">閉じる</button>
            <button class="btn-save" @click="saveUninspectedDetail">更新</button>
          </div>
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
  dateFrom: '2024-08-07',
  dateTo: '2024-09-06',
  customer: '',
  site: '',
  onlyUninspected: true,
  onlyRereturn: false,
  bySlip: false,
  area: '全てのエリア'
})

const uninspectedList = ref([
  {
    id: 1,
    date: '20240906',
    no: 'A1N163493',
    customer: 'アルインコ',
    site: 'テスト現場',
    itemCode: 'ALASLE',
    itemName: 'アルミサガオ 主材 左',
    qty: 10,
    completedQty: 3,
    unit: '個',
    inputting: '',
    warehouse: '312'
  },
  {
    id: 2,
    date: '20240906',
    no: 'A1N163494',
    customer: 'アルインコ',
    site: 'テスト現場',
    itemCode: 'HK6N',
    itemName: '鋼製布板 幅木用500X1829 橙',
    qty: 5,
    completedQty: 0,
    unit: '枚',
    inputting: '',
    warehouse: '312'
  }
])

const showDetailModal = ref(false)
const currentItem = ref(null)
const labelOption = ref('print')

// 未検収項目の型定義
const createEmptyUninspectedItem = () => ({
  type: '',
  description: '',
  qty: 0,
  unit: '',
  labelCount: 0
})

const uninspectedItems = ref([createEmptyUninspectedItem()])

// ラベル枚数の計算（単純に数量と同じとする。実際のロジックに応じて変更可能）
const totalLabelCount = computed(() => {
  return uninspectedItems.value.reduce((sum, item) => sum + (Number(item.qty) || 0), 0)
})

const updateLabelCount = () => {
  // 各項目のラベル枚数を数量と同じに設定
  uninspectedItems.value.forEach(item => {
    item.labelCount = Number(item.qty) || 0
  })
}

const addUninspectedItem = () => {
  uninspectedItems.value.push(createEmptyUninspectedItem())
  showToast('行を追加しました')
}

const searchUninspected = () => {
  showToast('未検収一覧を検索しました')
}

const openDetail = (item) => {
  currentItem.value = item
  // フォームを初期化
  uninspectedItems.value = [createEmptyUninspectedItem()]
  labelOption.value = 'print'
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  currentItem.value = null
}

const saveUninspectedDetail = () => {
  // バリデーション
  const validItems = uninspectedItems.value.filter(item => {
    if (item.type && !item.description) {
      showToast('内容を入力してください')
      return false
    }
    if (item.type && !item.qty) {
      showToast('数量を入力してください')
      return false
    }
    if (item.type && !item.unit) {
      showToast('単位を選択してください')
      return false
    }
    return true
  })
  
  if (validItems.length === 0 && uninspectedItems.value.length > 0) {
    // 全て空の場合は何も入力されていない
    if (uninspectedItems.value.every(item => !item.type && !item.description && !item.qty)) {
      showToast('未検収内容を入力してください')
      return
    }
  }
  
  // 数量が元の数量を超えていないか確認
  const totalUninspectedQty = totalLabelCount.value
  const remainingQty = (currentItem.value.qty || 0) - (currentItem.value.completedQty || 0)
  
  if (totalUninspectedQty > remainingQty) {
    showToast(`未検収数量が残数量(${remainingQty})を超えています`)
    return
  }
  
  // 保存処理（実際のAPIコールはここに実装）
  showToast('未検収情報を保存しました')
  closeDetailModal()
}
</script>

<style scoped>
.uninspected-screen {
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

.search-section {
  padding: 20px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.search-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 16px;
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

.form-select-sm {
  padding: 4px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 0.75rem;
}

.form-select-sm:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-input-sm {
  padding: 4px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 0.75rem;
  width: 150px;
}

.form-input-sm:focus {
  outline: none;
  border-color: #3b82f6;
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

.filter-options {
  display: flex;
  gap: 24px;
  align-items: center;
  flex-wrap: wrap;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 0.75rem;
}

.checkbox-label input {
  width: 14px;
  height: 14px;
  cursor: pointer;
}

.area-select {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.area-select span {
  font-size: 0.75rem;
  color: #475569;
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

.text-right {
  text-align: right;
}

.underline {
  text-decoration: underline;
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
  max-width: 800px;
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

.info-header {
  display: flex;
  gap: 24px;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px;
  background: #eff6ff;
  border-radius: 8px;
  flex-wrap: wrap;
}

.font-bold {
  font-weight: bold;
}

.item-summary {
  margin-bottom: 24px;
}

.summary-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
}

.summary-table th, .summary-table td {
  border: 1px solid #e2e8f0;
  padding: 8px;
  text-align: left;
}

.summary-table th {
  background: #f8fafc;
  font-weight: 600;
}

.uninspected-input h4 {
  font-weight: 600;
  margin-bottom: 12px;
  font-size: 0.875rem;
}

.uninspected-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.uninspected-row select:first-child {
  width: 90px;
}

.uninspected-row input[type="text"] {
  width: 180px;
}

.qty-input-sm {
  width: 70px;
  padding: 4px 6px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  text-align: right;
  font-size: 0.75rem;
}

.qty-input-sm:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.label-count {
  width: 30px;
  text-align: center;
  font-size: 0.75rem;
  color: #475569;
}

.bg-slate-100 {
  background: #f1f5f9;
}

.btn-add-row {
  margin-top: 12px;
  padding: 6px 12px;
  background: #e2e8f0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.btn-add-row:hover {
  background: #cbd5e1;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-labels {
  font-size: 0.75rem;
  color: #475569;
}

.total-labels .font-bold {
  font-size: 1rem;
  color: #3b82f6;
}

.footer-buttons {
  display: flex;
  gap: 12px;
}

.btn-cancel {
  padding: 6px 16px;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f1f5f9;
}

.btn-save {
  padding: 6px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover {
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