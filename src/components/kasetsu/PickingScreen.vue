<template>
  <div class="picking-screen">
    <div class="picking-card">
      <div class="card-header">
        <h3><i class="fas fa-dolly mr-2"></i>小出し処理</h3>
      </div>

      <!-- ステップインジケーター -->
      <div class="step-indicator">
        <div :class="['step', { active: currentStep === 1, completed: currentStep > 1 }]">
          <i class="fas fa-cog"></i>
          <span>エリア・出荷日選択</span>
        </div>
        <div :class="['step', { active: currentStep === 2, completed: currentStep > 2 }]">
          <i class="fas fa-list"></i>
          <span>伝票一覧</span>
        </div>
        <div :class="['step', { active: currentStep === 3 }]">
          <i class="fas fa-file-alt"></i>
          <span>明細一覧</span>
        </div>
      </div>

      <!-- 第1層：エリア・出荷日選択 -->
      <div v-show="currentStep === 1" class="step-content">
        <div class="form-group">
          <label>小出しエリア選択 <span class="required">*</span></label>
          <select v-model="pickingForm.area" class="form-select">
            <option value="">選択してください</option>
            <option value="guard-a">ガード枠 - A</option>
            <option value="guard-b">ガード枠 - B</option>
            <option value="pipe-a">単管 - A</option>
            <option value="pipe-b">単管 - B</option>
          </select>
        </div>
        <div class="form-group">
          <label>出荷日 <span class="required">*</span></label>
          <input type="date" v-model="pickingForm.date" class="form-input">
        </div>
        <div class="form-actions">
          <button class="btn-primary" @click="goToStep2" :disabled="!pickingForm.area">
            <i class="fas fa-list mr-2"></i>伝票一覧へ
          </button>
        </div>
      </div>

      <!-- 第2層：伝票一覧 -->
      <div v-show="currentStep === 2" class="step-content">
        <div class="step-header">
          <div>
            <i class="fas fa-list mr-2"></i>小出し伝票一覧
            <span class="info-text ml-3">
              出荷日: {{ pickingForm.date }} | エリア: {{ selectedAreaText }}
            </span>
          </div>
          <button class="btn-link" @click="goToStep1">
            <i class="fas fa-arrow-left mr-1"></i>戻る
          </button>
        </div>
        <div class="slip-table">
          <table class="data-table">
            <thead>
              <tr>
                <th>出荷No.</th>
                <th>得意先名</th>
                <th>現場名</th>
                <th>車種</th>
                <th>運送会社</th>
                <th>状況</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="slip in slipList" :key="slip.id" :class="{ selected: selectedSlip?.id === slip.id }">
                <td class="font-mono font-semibold">{{ slip.no }}</td>
                <td>{{ slip.customer }}</td>
                <td>{{ slip.site }}</td>
                <td>{{ slip.vehicleType }}</td>
                <td>{{ slip.carrier }}</td>
                <td>
                  <span :class="['status-badge', getStatusClass(slip.status)]">
                    {{ slip.statusText }}
                  </span>
                </td>
                <td>
                  <button class="btn-select" @click="selectSlip(slip)">
                    <i class="fas fa-eye mr-1"></i>選択
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 第3層：明細一覧 -->
      <div v-show="currentStep === 3" class="step-content">
        <div class="step-header">
          <div>
            <i class="fas fa-file-alt mr-2"></i>小出し伝票明細一覧
            <span class="info-text ml-3">
              出荷No: {{ selectedSlip?.no }} | 得意先: {{ selectedSlip?.customer }} | 現場: {{ selectedSlip?.site }}
            </span>
          </div>
          <button class="btn-link" @click="goToStep2">
            <i class="fas fa-arrow-left mr-1"></i>戻る
          </button>
        </div>
        <div class="detail-table">
          <table class="data-table">
            <thead>
              <tr>
                <th>品名+色</th>
                <th>品番</th>
                <th>借入先</th>
                <th>指示数</th>
                <th>小出し数</th>
                <th>小出し完了</th>
                <th>ラベル枚数</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in detailItems" :key="item.code">
                <td>{{ item.name }}</td>
                <td class="font-mono">{{ item.code }}</td>
                <td>{{ item.borrower }}</td>
                <td class="text-right font-semibold">{{ item.orderQty }}</td>
                <td class="text-right">
                  <input type="number" v-model="item.pickingQty" class="qty-input" min="0">
                </td>
                <td class="text-center">
                  <input type="checkbox" v-model="item.completed" class="complete-checkbox">
                </td>
                <td class="text-right">{{ item.labelCount }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="detail-actions">
          <button class="btn-add" @click="openHinbanModal">
            <i class="fas fa-plus mr-2"></i>品番追加
          </button>
          <button class="btn-label">
            <i class="fas fa-tag mr-2"></i>小出しラベル発行
          </button>
          <button class="btn-complete-work">
            <i class="fas fa-check mr-2"></i>作業完了
          </button>
        </div>
      </div>
    </div>

    <!-- 品番追加モーダル -->
    <div v-if="showHinbanModal" class="modal-overlay active" @click.self="closeHinbanModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3><i class="fas fa-plus mr-2"></i>品番追加</h3>
          <button class="modal-close" @click="closeHinbanModal">×</button>
        </div>
        <div class="modal-body">
          <div class="search-area">
            <div class="search-box">
              <i class="fas fa-search"></i>
              <input 
                type="text" 
                v-model="hinbanSearch" 
                class="search-input" 
                placeholder="品番または品名を入力"
                @input="searchHinban"
                id="hinbanSearchInput"
              >
            </div>
            <button class="btn-search-sm" @click="searchHinban">検索</button>
          </div>
          <div class="hinban-list">
            <div 
              v-for="item in filteredHinbanList" 
              :key="item.code"
              :class="['hinban-item', { selected: selectedHinban?.code === item.code }]"
              @click="selectHinban(item)"
            >
              <div class="hinban-code">{{ item.code }}</div>
              <div class="hinban-name">{{ item.name }}</div>
              <div class="hinban-unit">{{ item.unit }}</div>
            </div>
          </div>
          <div class="selected-info">
            <div class="info-row">
              <label>品番</label>
              <input 
                type="text" 
                v-model="selectedHinbanCode" 
                readonly 
                class="info-input"
                id="selectedHinbanCode"
              >
            </div>
            <div class="info-row">
              <label>品名</label>
              <input 
                type="text" 
                v-model="selectedHinbanName" 
                readonly 
                class="info-input"
                id="selectedHinbanName"
              >
            </div>
            <div class="info-row">
              <label>数量</label>
              <input 
                type="number" 
                v-model="hinbanQty" 
                class="info-input qty-input" 
                min="1"
                id="hinbanQty"
              >
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeHinbanModal">閉じる</button>
          <button class="btn-confirm" @click="addHinban">追加明細へ</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'

const showToast = inject('showToast')
const currentStep = ref(1)

const pickingForm = ref({
  area: '',
  date: new Date().toISOString().slice(0, 10)
})

const selectedAreaText = computed(() => {
  const areas = {
    'guard-a': 'ガード枠 - A',
    'guard-b': 'ガード枠 - B',
    'pipe-a': '単管 - A',
    'pipe-b': '単管 - B'
  }
  return areas[pickingForm.value.area] || ''
})

const slipList = ref([
  { id: 1, no: 'A1S124047', customer: 'アルインコ', site: 'テスト現場', vehicleType: '2U', carrier: 'A会社', status: 'pending', statusText: '未処理' },
  { id: 2, no: 'A1S124048', customer: '△△建設', site: '△△現場', vehicleType: '4U', carrier: 'B会社', status: 'processing', statusText: '処理中' },
  { id: 3, no: 'A1S124049', customer: '○○株式会社', site: '××現場', vehicleType: '3U', carrier: 'C会社', status: 'complete', statusText: '完了' }
])

const selectedSlip = ref(null)

const detailItems = ref([
  { code: 'CSGB16', name: 'マキシムベース感知装置', borrower: '', orderQty: 1, pickingQty: 0, completed: false, labelCount: 0 },
  { code: 'HK6N', name: '鋼製布板 幅木用500X1829 橙', borrower: '', orderQty: 10, pickingQty: 0, completed: false, labelCount: 0 },
  { code: 'ALASLE', name: 'アルミサガオ 主材 左', borrower: '', orderQty: 5, pickingQty: 0, completed: false, labelCount: 0 }
])

const showHinbanModal = ref(false)
const hinbanSearch = ref('')
const hinbanQty = ref(1)
const selectedHinban = ref(null)

const hinbanList = ref([
  { code: 'CSGB16', name: 'マキシムベース感知装置', unit: '個' },
  { code: 'HK6N', name: '鋼製布板 幅木用500X1829 橙', unit: '枚' },
  { code: 'ALASLE', name: 'アルミサガオ 主材 左', unit: '本' },
  { code: 'ALASRE', name: 'アルミサガオ 主材 右', unit: '本' },
  { code: 'ALAM4A', name: 'アルミサガオ万能継受け上メータ', unit: '個' }
])

const filteredHinbanList = computed(() => {
  if (!hinbanSearch.value) return hinbanList.value
  const searchTerm = hinbanSearch.value.toLowerCase()
  return hinbanList.value.filter(item => 
    item.code.toLowerCase().includes(searchTerm) ||
    item.name.toLowerCase().includes(searchTerm)
  )
})

const selectedHinbanCode = computed(() => selectedHinban.value?.code || '')
const selectedHinbanName = computed(() => selectedHinban.value?.name || '')

const getStatusClass = (status) => {
  const classes = {
    pending: 'status-pending',
    processing: 'status-processing',
    complete: 'status-complete'
  }
  return classes[status] || ''
}

const goToStep1 = () => {
  currentStep.value = 1
}

const goToStep2 = () => {
  if (!pickingForm.value.area) {
    showToast('小出しエリアを選択してください')
    return
  }
  currentStep.value = 2
  showToast('伝票一覧を表示しました')
}

const goToStep3 = () => {
  currentStep.value = 3
}

const selectSlip = (slip) => {
  selectedSlip.value = slip
  goToStep3()
  showToast(`伝票 ${slip.no} を選択しました`)
}

// 品番追加モーダルを開く
const openHinbanModal = () => {
  // フォームを初期化
  hinbanSearch.value = ''
  selectedHinban.value = null
  hinbanQty.value = 1
  showHinbanModal.value = true
}

const closeHinbanModal = () => {
  showHinbanModal.value = false
}

const searchHinban = () => {
  // 検索ロジックは computed で処理されるため、明示的な処理は不要
  // 必要に応じて検索結果の件数を表示するなどの処理を追加可能
  if (hinbanSearch.value) {
    const resultCount = filteredHinbanList.value.length
    if (resultCount === 0) {
      showToast('該当する品番が見つかりません')
    } else {
      showToast(`${resultCount}件の品番が見つかりました`)
    }
  }
}

const selectHinban = (item) => {
  selectedHinban.value = item
  showToast(`品番 ${item.code} を選択しました`)
}

const addHinban = () => {
  // バリデーション
  if (!selectedHinban.value) {
    showToast('品番を選択してください')
    return
  }
  
  if (!hinbanQty.value || hinbanQty.value <= 0) {
    showToast('数量を正しく入力してください')
    return
  }
  
  // 重複チェック（任意）
  const exists = detailItems.value.some(item => item.code === selectedHinban.value.code)
  if (exists) {
    if (confirm('この品番は既に明細に存在します。追加しますか？')) {
      // 既存の場合は数量を加算するなどの処理も可能
      const existingItem = detailItems.value.find(item => item.code === selectedHinban.value.code)
      existingItem.pickingQty += hinbanQty.value
      showToast(`品番 ${selectedHinban.value.code} の数量を ${hinbanQty.value} 追加しました`)
    } else {
      return
    }
  } else {
    // 新規追加
    detailItems.value.push({
      code: selectedHinban.value.code,
      name: selectedHinban.value.name,
      borrower: '',
      orderQty: 0,
      pickingQty: hinbanQty.value,
      completed: false,
      labelCount: 0
    })
    showToast(`品番 ${selectedHinban.value.code} を ${hinbanQty.value} 個追加しました`)
  }
  
  closeHinbanModal()
}
</script>

<style scoped>
.picking-screen {
  animation: fadeIn 0.3s ease;
}

.picking-card {
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
  font-size: 1.125rem;
}

.screen-badge {
  font-size: 0.75rem;
  color: #64748b;
}

.step-indicator {
  display: flex;
  gap: 8px;
  padding: 20px 24px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.step {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f1f5f9;
  border-radius: 24px;
  color: #64748b;
  font-size: 0.875rem;
}

.step.active {
  background: #3b82f6;
  color: white;
}

.step.completed {
  background: #10b981;
  color: white;
}

.step-content {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #1e293b;
}

.required {
  color: #ef4444;
}

.form-input,
.form-select {
  width: 100%;
  max-width: 400px;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.875rem;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.info-text {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: normal;
}

.btn-link {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-link:hover {
  text-decoration: underline;
}

.slip-table,
.detail-table {
  overflow-x: auto;
  margin-bottom: 20px;
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

.data-table tr:hover {
  background: #f8fafc;
}

.data-table tr.selected {
  background: #eff6ff;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 600;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-processing {
  background: #dbeafe;
  color: #1e40af;
}

.status-complete {
  background: #d1fae5;
  color: #065f46;
}

.btn-select {
  background: none;
  border: 1px solid #3b82f6;
  color: #3b82f6;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-select:hover {
  background: #3b82f6;
  color: white;
}

.qty-input {
  width: 80px;
  padding: 6px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  text-align: right;
}

.complete-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.detail-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.btn-add,
.btn-label,
.btn-complete-work {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add {
  background: #e2e8f0;
  border: none;
  color: #1e293b;
}

.btn-add:hover {
  background: #cbd5e1;
}

.btn-label {
  background: #8b5cf6;
  border: none;
  color: white;
}

.btn-label:hover {
  background: #7c3aed;
}

.btn-complete-work {
  background: #10b981;
  border: none;
  color: white;
  margin-left: auto;
}

.btn-complete-work:hover {
  background: #059669;
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

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
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

.hinban-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 20px;
}

.hinban-item {
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  gap: 16px;
}

.hinban-item:hover {
  background: #f8fafc;
}

.hinban-item.selected {
  background: #eff6ff;
}

.hinban-code {
  font-family: monospace;
  font-weight: 600;
  width: 100px;
  font-size: 0.875rem;
}

.hinban-name {
  flex: 1;
  font-size: 0.875rem;
}

.hinban-unit {
  width: 50px;
  color: #64748b;
  font-size: 0.75rem;
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

.font-mono {
  font-family: monospace;
}

.font-semibold {
  font-weight: 600;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
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