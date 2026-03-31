<template>
  <div class="stock-slip-list">
    <div class="screen-card">
      <div class="card-header">
        <h3><i class="fas fa-list mr-2"></i>在庫伝票一覧</h3>
      </div>

      <!-- 検索条件 -->
      <div class="search-section">
        <div class="search-grid">
          <div class="search-field">
            <label>工事日</label>
            <input type="date" v-model="searchForm.date" class="form-input">
          </div>
          <div class="search-field">
            <label>車番</label>
            <select v-model="searchForm.carNo" class="form-select">
              <option value="">すべて</option>
              <option value="0136">0136</option>
              <option value="0137">0137</option>
              <option value="0138">0138</option>
            </select>
          </div>
          <div class="search-field checkbox-field">
            <label>
              <input type="checkbox" v-model="searchForm.incompleteOnly" class="mr-2">
              <span>未完了一覧</span>
            </label>
          </div>
          <div class="search-field">
            <button class="btn-search" @click="searchSlips">
              <i class="fas fa-search mr-2"></i>検索
            </button>
          </div>
        </div>
      </div>

      <!-- 検索結果 -->
      <div class="result-section">
        <div class="result-header">
          <span class="result-count">検索結果: {{ filteredSlips.length }}件</span>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>工事日</th>
                <th>枝</th>
                <th>車番</th>
                <th>現場</th>
                <th>貸出確認</th>
                <th>返却確認</th>
                <th>完了報告</th>
                <th>No.</th>
                <th>操作</th>
				</tr>
               </thead>
            <tbody>
              <tr v-for="slip in filteredSlips" :key="slip.no" class="hover-row">
                <td class="font-semibold">{{ slip.date }} </td>
                <td class="text-center">{{ slip.branch }} </td>
                <td class="font-mono">{{ slip.carNo }} </td>
                <td>{{ slip.site }} </td>
                <td class="text-center">
                  <span :class="['status-badge', slip.loanStatus === 'confirmed' ? 'status-complete' : 'status-pending']">
                    {{ slip.loanStatus === 'confirmed' ? '確認済' : '未確認' }}
                  </span>
                </td>
                <td class="text-center">
                  <span :class="['status-badge', slip.returnStatus === 'confirmed' ? 'status-complete' : 'status-pending']">
                    {{ slip.returnStatus === 'confirmed' ? '確認済' : '未確認' }}
                  </span>
                </td>
                <td class="text-center">
                  <span :class="['status-badge', slip.reportStatus === 'reported' ? 'status-complete' : 'status-pending']">
                    {{ slip.reportStatus === 'reported' ? '報告済' : '未報告' }}
                  </span>
                </td>
                <td class="font-mono">{{ slip.no }} </td>
                <td class="text-center">
                  <button class="btn-input" @click="goToInput(slip)">
                    <i class="fas fa-edit mr-1"></i>入力
                  </button>
                </td>
              </tr>
            </tbody>
           </table>
        </div>
      </div>

      <!-- アクションボタン -->
      <div class="action-buttons">
        <button class="btn-back" @click="$emit('back')">
          <i class="fas fa-arrow-left mr-2"></i>工事指示一覧へ戻る
        </button>
        <div class="right-buttons">
          <button class="btn-new" @click="createNewSlip('none')">
            <i class="fas fa-plus mr-2"></i>新規伝票入力（貸出なし）
          </button>
          <button class="btn-new-primary" @click="createNewSlip('with')">
            <i class="fas fa-plus mr-2"></i>新規伝票入力
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'

const showToast = inject('showToast')
const emit = defineEmits(['back', 'navigate'])

const searchForm = ref({
  date: '2024-06-12',
  carNo: '0136',
  incompleteOnly: true
})

const slips = ref([
  {
    no: '00015A',
    date: '2024/06/12',
    branch: 0,
    carNo: '0136',
    site: '××現場',
    loanStatus: 'confirmed',
    returnStatus: 'pending',
    reportStatus: 'pending'
  }
])

const filteredSlips = computed(() => {
  let result = slips.value
  if (searchForm.value.carNo) {
    result = result.filter(s => s.carNo === searchForm.value.carNo)
  }
  if (searchForm.value.incompleteOnly) {
    result = result.filter(s => s.returnStatus !== 'confirmed' || s.reportStatus !== 'reported')
  }
  return result
})

const searchSlips = () => {
  showToast('在庫伝票を検索しました')
}

const goToInput = (slip) => {
  emit('navigate', 'stockSlip')
  showToast(`伝票 ${slip.no} の入力を開始します`)
}

const createNewSlip = (type) => {
  emit('navigate', 'stockSlip')
  showToast(type === 'with' ? '新規伝票入力画面を開きました' : '貸出なし伝票入力画面を開きました')
}
</script>

<style scoped>
.stock-slip-list {
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
  grid-template-columns: repeat(4, 1fr);
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

.checkbox-field {
  display: flex;
  align-items: center;
  padding-bottom: 8px;
}

.checkbox-field label {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-bottom: 0;
}

.checkbox-field input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.btn-search {
  width: 100%;
  padding: 8px 12px;
  background: #475569;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.result-section {
  padding: 20px 24px;
}

.result-header {
  margin-bottom: 16px;
}

.result-count {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
}

.table-container {
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
}

.hover-row:hover {
  background: #eff6ff;
  cursor: pointer;
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

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 500;
}

.status-complete {
  background: #d1fae5;
  color: #065f46;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.btn-input {
  background: none;
  border: 1px solid #3b82f6;
  color: #3b82f6;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-input:hover {
  background: #3b82f6;
  color: white;
}

.action-buttons {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.btn-back {
  padding: 8px 16px;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
}

.right-buttons {
  display: flex;
  gap: 12px;
}

.btn-new, .btn-new-primary {
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
}

.btn-new {
  background: #e2e8f0;
  border: none;
  color: #1e293b;
}

.btn-new-primary {
  background: #3b82f6;
  border: none;
  color: white;
}
</style>