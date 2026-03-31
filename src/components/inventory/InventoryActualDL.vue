<template>
  <div class="actual-dl-screen">
    <div class="screen-card">
      <div class="card-header">
        <div>
          <h3><i class="fas fa-download mr-2"></i>実地DL</h3>
          <p class="header-subtitle">実地棚卸データのダウンロードを行います</p>
        </div>
      </div>

      <div class="dl-container">
        <div class="search-section">
          <h4 class="section-title"><i class="fas fa-search mr-2"></i>検索条件</h4>
          
          <div class="form-row">
            <div class="form-field">
              <label>倉庫 <span class="required">*</span></label>
              <select v-model="searchForm.warehouse" class="form-select">
                <option value="">選択してください</option>
                <option value="東京倉庫">東京倉庫</option>
                <option value="大阪倉庫">大阪倉庫</option>
                <option value="名古屋倉庫">名古屋倉庫</option>
              </select>
            </div>
            <div class="form-field">
              <label>エリア</label>
              <select v-model="searchForm.area" class="form-select">
                <option value="">全て</option>
                <option value="A">エリアA</option>
                <option value="B">エリアB</option>
                <option value="C">エリアC</option>
                <option value="D">エリアD</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>棚卸日 <span class="required">*</span></label>
              <input type="date" v-model="searchForm.dateFrom" class="form-input">
            </div>
            <div class="form-field">
              <label>～</label>
              <input type="date" v-model="searchForm.dateTo" class="form-input">
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>品番</label>
              <input type="text" v-model="searchForm.itemCode" class="form-input" placeholder="品番を入力">
            </div>
            <div class="form-field">
              <label>登録者</label>
              <input type="text" v-model="searchForm.user" class="form-input" placeholder="登録者名を入力">
            </div>
          </div>

          <div class="form-actions">
            <button class="btn-search" @click="searchData">
              <i class="fas fa-search mr-2"></i>検索
            </button>
            <button class="btn-clear" @click="clearForm">
              <i class="fas fa-undo mr-2"></i>クリア
            </button>
          </div>
        </div>

        <div class="result-section" v-if="searchResults.length > 0">
          <div class="result-header">
            <h4 class="section-title"><i class="fas fa-list mr-2"></i>検索結果</h4>
            <span class="result-count">{{ searchResults.length }} 件</span>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th><input type="checkbox" v-model="selectAll" @change="toggleSelectAll"></th>
                  <th>棚卸日</th>
                  <th>倉庫</th>
                  <th>エリア</th>
                  <th>品番</th>
                  <th>品名</th>
                  <th>実地数量</th>
                  <th>登録者</th>
                  <th>登録日時</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in searchResults" :key="item.id">
                  <td><input type="checkbox" v-model="selectedItems" :value="item.id"></td>
                  <td>{{ item.date }}</td>
                  <td>{{ item.warehouse }}</td>
                  <td>{{ item.area }}</td>
                  <td>{{ item.itemCode }}</td>
                  <td>{{ item.itemName }}</td>
                  <td class="text-right">{{ item.actualQty }}</td>
                  <td>{{ item.user }}</td>
                  <td>{{ item.createdAt }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="dl-actions">
            <button class="btn-dl-csv" @click="downloadCSV" :disabled="selectedItems.length === 0">
              <i class="fas fa-file-csv mr-2"></i>CSVダウンロード
            </button>
            <button class="btn-dl-excel" @click="downloadExcel" :disabled="selectedItems.length === 0">
              <i class="fas fa-file-excel mr-2"></i>Excelダウンロード
            </button>
          </div>
        </div>

        <div class="empty-state" v-else-if="hasSearched">
          <i class="fas fa-inbox fa-3x text-gray-300"></i>
          <p>該当するデータがありません</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'

const showToast = inject('showToast')

const searchForm = ref({
  warehouse: '',
  area: '',
  dateFrom: '',
  dateTo: '',
  itemCode: '',
  user: ''
})

const searchResults = ref([])
const selectedItems = ref([])
const hasSearched = ref(false)

const selectAll = computed({
  get: () => searchResults.value.length > 0 && selectedItems.value.length === searchResults.value.length,
  set: (value) => {
    if (value) {
      selectedItems.value = searchResults.value.map(item => item.id)
    } else {
      selectedItems.value = []
    }
  }
})

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = searchResults.value.map(item => item.id)
  } else {
    selectedItems.value = []
  }
}

const searchData = () => {
  if (!searchForm.value.warehouse) {
    showToast('倉庫を選択してください')
    return
  }

  // 模拟搜索数据
  searchResults.value = [
    { id: 1, date: '2024-01-15', warehouse: '東京倉庫', area: 'A', itemCode: 'ABC-001', itemName: '鋼製足場板 300×1800', actualQty: 150, user: '山田', createdAt: '2024-01-15 10:30' },
    { id: 2, date: '2024-01-15', warehouse: '東京倉庫', area: 'A', itemCode: 'ABC-002', itemName: '鋼製足場板 400×1800', actualQty: 120, user: '田中', createdAt: '2024-01-15 11:15' },
    { id: 3, date: '2024-01-15', warehouse: '東京倉庫', area: 'B', itemCode: 'XYZ-888', itemName: '単管パイプ 48.6×3.5', actualQty: 200, user: '鈴木', createdAt: '2024-01-15 09:45' },
    { id: 4, date: '2024-01-14', warehouse: '東京倉庫', area: 'C', itemCode: 'DEF-001', itemName: 'ジャッキ 20t', actualQty: 50, user: '山田', createdAt: '2024-01-14 14:20' },
    { id: 5, date: '2024-01-14', warehouse: '東京倉庫', area: 'C', itemCode: 'DEF-002', itemName: 'ジャッキ 30t', actualQty: 30, user: '田中', createdAt: '2024-01-14 15:10' }
  ]
  hasSearched.value = true
  selectedItems.value = []
  showToast('検索が完了しました')
}

const clearForm = () => {
  searchForm.value = {
    warehouse: '',
    area: '',
    dateFrom: '',
    dateTo: '',
    itemCode: '',
    user: ''
  }
  searchResults.value = []
  selectedItems.value = []
  hasSearched.value = false
}

const downloadCSV = () => {
  showToast(`選択した ${selectedItems.value.length} 件をCSVでダウンロードします`)
}

const downloadExcel = () => {
  showToast(`選択した ${selectedItems.value.length} 件をExcelでダウンロードします`)
}
</script>

<style scoped>
.actual-dl-screen {
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
}

.header-subtitle {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 4px;
}

.dl-container {
  padding: 24px;
}

.search-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
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

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-search, .btn-clear {
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.btn-search {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
}

.btn-search:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-clear {
  background: white;
  border: 1px solid #cbd5e1;
  color: #475569;
}

.btn-clear:hover {
  background: #f8fafc;
}

.result-section {
  border-top: 1px solid #e2e8f0;
  padding-top: 24px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.result-count {
  font-size: 0.875rem;
  color: #64748b;
}

.table-container {
  overflow-x: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.data-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #475569;
}

.data-table tbody tr:hover {
  background: #f8fafc;
}

.data-table .text-right {
  text-align: right;
}

.dl-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-dl-csv, .btn-dl-excel {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.btn-dl-csv {
  background: #f97316;
  color: white;
  border: none;
}

.btn-dl-csv:hover:not(:disabled) {
  background: #ea580c;
}

.btn-dl-excel {
  background: #10b981;
  color: white;
  border: none;
}

.btn-dl-excel:hover:not(:disabled) {
  background: #059669;
}

.btn-dl-csv:disabled, .btn-dl-excel:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #94a3b8;
}

.empty-state p {
  margin-top: 16px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
