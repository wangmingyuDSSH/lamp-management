<template>
  <div class="stock-slip-input">
    <div class="screen-card">
      <div class="card-header">
        <h3><i class="fas fa-file-invoice mr-2"></i>在庫伝票入力</h3>
      </div>

      <!-- 伝票ヘッダー -->
      <div class="slip-header">
        <div class="header-grid">
          <div class="header-field">
            <label>伝票No.</label>
            <input type="text" v-model="slip.no" class="form-input bg-slate-100 font-mono" readonly>
          </div>
          <div class="header-field">
            <label>工事日</label>
            <input type="date" v-model="slip.date" class="form-input">
          </div>
          <div class="header-field">
            <label>枝番</label>
            <input type="text" v-model="slip.branch" class="form-input">
          </div>
          <div class="header-field">
            <label>車番</label>
            <input type="text" v-model="slip.carNo" class="form-input font-mono">
          </div>
        </div>
      </div>

      <!-- 出返情報 -->
      <div class="loan-return-section">
        <div class="loan-card">
          <h4><i class="fas fa-arrow-up mr-2 text-blue-600"></i>貸出情報</h4>
          <div class="card-content">
            <div class="field">
              <label>貸出相模原C</label>
              <select class="form-select">
                <option>相模原C</option>
              </select>
            </div>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="loanType" value="assembly">
                <span>組立</span>
              </label>
              <label class="radio-label">
                <input type="radio" v-model="loanType" value="dismantle">
                <span>解体</span>
              </label>
            </div>
          </div>
        </div>
        <div class="return-card">
          <h4><i class="fas fa-arrow-down mr-2 text-green-600"></i>返却情報</h4>
          <div class="card-content">
            <div class="field">
              <label>返却相模原C</label>
              <select class="form-select">
                <option>相模原C</option>
              </select>
            </div>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="returnType" value="assembly">
                <span>組立</span>
              </label>
              <label class="radio-label">
                <input type="radio" v-model="returnType" value="dismantle">
                <span>解体</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- 現場選択 -->
      <div class="site-section">
        <h4><i class="fas fa-map-marker-alt mr-2"></i>現場選択</h4>
        <div class="site-grid">
          <div v-for="(site, index) in sites" :key="index" class="site-card">
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" :name="`site${index}_type`" v-model="site.type" value="assembly">
                <span>組立</span>
              </label>
              <label class="radio-label">
                <input type="radio" :name="`site${index}_type`" v-model="site.type" value="dismantle">
                <span>解体</span>
              </label>
            </div>
            <input type="text" v-model="site.name" class="form-input" :placeholder="`現場${index + 1}`">
          </div>
        </div>
      </div>

      <!-- 分類 -->
      <div class="category-section">
        <div class="category-grid">
          <div class="category-field">
            <label>分類1</label>
            <select class="form-select">
              <option>選択してください</option>
            </select>
          </div>
          <div class="category-field">
            <label>分類2</label>
            <select class="form-select">
              <option>選択してください</option>
            </select>
          </div>
          <div class="category-field">
            <label>分類3</label>
            <select class="form-select">
              <option>選択してください</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 表示切替 -->
      <div class="display-toggle">
        <span class="toggle-label">【一覧表示】</span>
        <label class="radio-label">
          <input type="radio" v-model="displayMode" value="all">
          <span>全て</span>
        </label>
        <label class="radio-label">
          <input type="radio" v-model="displayMode" value="hasQty">
          <span>数量有のみ</span>
        </label>
      </div>

      <!-- 明細一覧 -->
      <div class="items-section">
        <div class="table-container">
          <table class="items-table">
            <thead>
              <tr>
                <th>品番</th>
                <th>品名</th>
                <th class="text-right">貸出</th>
                <th class="text-center">チェック</th>
                <th class="text-center">現場1</th>
                <th class="text-center">現場2</th>
                <th class="text-center">現場3</th>
                <th class="text-right">返却</th>
                <th class="text-center">チェック</th>
				</tr>
               </thead>
            <tbody>
              <tr 
                v-for="item in filteredItems" 
                :key="item.code"
                :class="{ 'bg-blue-50': item.loanQty > 0, 'bg-green-50': item.returnQty > 0 }"
              >
                <td class="font-mono">{{ item.code }} </td>
                <td>{{ item.name }} </td>
                <td class="text-right">{{ item.loanQty || '-' }} </td>
                <td class="text-center">
                  <input type="checkbox" v-model="item.loanChecked" class="item-checkbox">
                </td>
                <td class="text-center">
                  <input type="number" v-model="item.site1Qty" class="qty-input" min="0">
                </td>
                <td class="text-center">
                  <input type="number" v-model="item.site2Qty" class="qty-input" min="0">
                </td>
                <td class="text-center">
                  <input type="number" v-model="item.site3Qty" class="qty-input" min="0">
                </td>
                <td class="text-right">{{ item.returnQty || '-' }} </td>
                <td class="text-center">
                  <input type="checkbox" v-model="item.returnChecked" class="item-checkbox">
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 重量表示 -->
      <div class="weight-summary">
        <div class="weight-item">
          <span>積載重量:</span>
          <span class="weight-value">{{ totalWeight.toLocaleString() }} Kg</span>
        </div>
        <div class="weight-item">
          <span>貸出総重量:</span>
          <span class="weight-value text-blue-600">{{ loanWeight.toLocaleString() }} Kg</span>
        </div>
      </div>

      <!-- アクション -->
      <div class="action-buttons">
        <button class="btn-back" @click="$emit('back')">
          <i class="fas fa-arrow-left mr-2"></i>戻る
        </button>
        <button class="btn-confirm" @click="confirmSlip">
          <i class="fas fa-check mr-2"></i>確認
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'

const showToast = inject('showToast')
const emit = defineEmits(['back'])

const slip = ref({
  no: '00015A',
  date: '2024-06-12',
  branch: '1',
  carNo: '0136'
})

const loanType = ref('assembly')
const returnType = ref('dismantle')

const sites = ref([
  { name: '××現場', type: 'assembly' },
  { name: '', type: 'assembly' },
  { name: '', type: 'assembly' }
])

const displayMode = ref('all')

const items = ref([
  { code: 'N4070GR', name: 'ネット4M×7Mグレー', loanQty: 0, loanChecked: false, site1Qty: 0, site2Qty: 0, site3Qty: 0, returnQty: 0, returnChecked: false, weight: 2.5 },
  { code: 'ALBD1', name: 'アルボード', loanQty: 0, loanChecked: false, site1Qty: 0, site2Qty: 0, site3Qty: 0, returnQty: 0, returnChecked: false, weight: 1.8 },
  { code: 'XP3800', name: '支柱3800', loanQty: 36, loanChecked: true, site1Qty: 20, site2Qty: 10, site3Qty: 6, returnQty: 0, returnChecked: false, weight: 12.5 },
  { code: 'XP1900', name: '支柱1900', loanQty: 40, loanChecked: true, site1Qty: 25, site2Qty: 15, site3Qty: 0, returnQty: 0, returnChecked: false, weight: 8.2 },
  { code: 'XP950', name: '支柱950', loanQty: 30, loanChecked: true, site1Qty: 15, site2Qty: 10, site3Qty: 5, returnQty: 0, returnChecked: false, weight: 5.6 },
  { code: 'XR1829', name: '手摺1829', loanQty: 0, loanChecked: false, site1Qty: 0, site2Qty: 0, site3Qty: 0, returnQty: 120, returnChecked: true, weight: 3.2 },
  { code: 'XR610', name: '手摺610', loanQty: 0, loanChecked: false, site1Qty: 0, site2Qty: 0, site3Qty: 0, returnQty: 30, returnChecked: true, weight: 1.5 }
])

const filteredItems = computed(() => {
  if (displayMode.value === 'hasQty') {
    return items.value.filter(item => item.loanQty > 0 || item.returnQty > 0)
  }
  return items.value
})

const totalWeight = computed(() => 3000)

const loanWeight = computed(() => {
  return items.value.reduce((sum, item) => {
    if (item.loanChecked) {
      return sum + (item.loanQty * item.weight)
    }
    return sum
  }, 0)
})

const confirmSlip = () => {
  showToast('在庫伝票を保存しました')
}
</script>

<style scoped>
.stock-slip-input {
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

.slip-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.header-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.header-field label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: #475569;
  margin-bottom: 4px;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.875rem;
}

.bg-slate-100 {
  background: #f1f5f9;
}

.font-mono {
  font-family: monospace;
}

.loan-return-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.loan-card, .return-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
}

.loan-card h4, .return-card h4 {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
  font-size: 0.875rem;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field label {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 4px;
  display: block;
}

.form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
}

.radio-group {
  display: flex;
  gap: 16px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 0.875rem;
}

.radio-label input {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.site-section {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.site-section h4 {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
  font-size: 0.875rem;
}

.site-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.site-card {
  background: #f8fafc;
  padding: 12px;
  border-radius: 8px;
}

.category-section {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.category-field label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: #475569;
  margin-bottom: 4px;
}

.display-toggle {
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.toggle-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
}

.items-section {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.table-container {
  overflow-x: auto;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.items-table th {
  background: #f8fafc;
  padding: 10px;
  text-align: left;
  font-weight: 600;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
}

.items-table td {
  padding: 10px;
  border-bottom: 1px solid #e2e8f0;
}

.bg-blue-50 {
  background: #eff6ff;
}

.bg-green-50 {
  background: #f0fdf4;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.item-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.qty-input {
  width: 70px;
  padding: 4px 6px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  text-align: center;
  font-size: 0.75rem;
}

.weight-summary {
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 32px;
}

.weight-item {
  font-size: 0.875rem;
}

.weight-value {
  font-weight: bold;
  font-size: 1rem;
  margin-left: 8px;
}

.text-blue-600 {
  color: #3b82f6;
}

.action-buttons {
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
}

.btn-back {
  padding: 10px 20px;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
}

.btn-confirm {
  padding: 10px 24px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
</style>