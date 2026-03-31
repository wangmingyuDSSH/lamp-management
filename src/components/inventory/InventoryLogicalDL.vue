<template>
  <div class="logical-dl-screen">
    <div class="screen-card">
      <div class="card-header">
        <div>
          <h3><i class="fas fa-database mr-2"></i>論理DL</h3>
          <p class="header-subtitle">論理在庫データのダウンロードを行います</p>
        </div>
      </div>

      <div class="dl-container">
        <div class="search-section">
          <h4 class="section-title"><i class="fas fa-filter mr-2"></i>抽出条件</h4>
          
          <div class="form-row">
            <div class="form-field">
              <label>システム <span class="required">*</span></label>
              <select v-model="searchForm.system" class="form-select">
                <option value="">選択してください</option>
                <option value="octo">オクト</option>
                <option value="rental">レンタル</option>
              </select>
            </div>
            <div class="form-field">
              <label>倉庫 <span class="required">*</span></label>
              <select v-model="searchForm.warehouse" class="form-select">
                <option value="">選択してください</option>
                <option value="東京倉庫">東京倉庫</option>
                <option value="大阪倉庫">大阪倉庫</option>
                <option value="名古屋倉庫">名古屋倉庫</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>在庫日 <span class="required">*</span></label>
              <input type="date" v-model="searchForm.stockDate" class="form-input">
            </div>
            <div class="form-field">
              <label>在庫区分</label>
              <select v-model="searchForm.stockType" class="form-select">
                <option value="">全て</option>
                <option value="在庫">在庫</option>
                <option value="貸出中">貸出中</option>
                <option value="整備中">整備中</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>品番</label>
              <input type="text" v-model="searchForm.itemCode" class="form-input" placeholder="品番を入力">
            </div>
            <div class="form-field">
              <label>品名</label>
              <input type="text" v-model="searchForm.itemName" class="form-input" placeholder="品名を入力">
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>保管場所</label>
              <input type="text" v-model="searchForm.location" class="form-input" placeholder="保管場所を入力">
            </div>
            <div class="form-field">
              <label>データ形式</label>
              <select v-model="searchForm.format" class="form-select">
                <option value="detail">明細</option>
                <option value="summary">集計</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn-search" @click="searchData">
              <i class="fas fa-search mr-2"></i>データ抽出
            </button>
            <button class="btn-clear" @click="clearForm">
              <i class="fas fa-undo mr-2"></i>クリア
            </button>
          </div>
        </div>

        <div class="result-section" v-if="searchResults.length > 0">
          <div class="result-header">
            <h4 class="section-title"><i class="fas fa-list mr-2"></i>抽出結果</h4>
            <div class="result-info">
              <span class="result-count">{{ searchResults.length.toLocaleString() }} 件</span>
              <span class="result-stock">総数量: {{ totalQty.toLocaleString() }}</span>
            </div>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>品番</th>
                  <th>品名</th>
                  <th>規格</th>
                  <th>保管場所</th>
                  <th>在庫数</th>
                  <th>単位</th>
                  <th>在庫区分</th>
                  <th>最終更新日</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in searchResults" :key="item.id">
                  <td>{{ item.itemCode }}</td>
                  <td>{{ item.itemName }}</td>
                  <td>{{ item.spec }}</td>
                  <td>{{ item.location }}</td>
                  <td class="text-right">{{ item.qty.toLocaleString() }}</td>
                  <td>{{ item.unit }}</td>
                  <td>
                    <span :class="['stock-badge', item.stockType]">{{ item.stockType }}</span>
                  </td>
                  <td>{{ item.lastUpdate }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="dl-actions">
            <button class="btn-dl-csv" @click="downloadCSV">
              <i class="fas fa-file-csv mr-2"></i>CSVダウンロード
            </button>
            <button class="btn-dl-excel" @click="downloadExcel">
              <i class="fas fa-file-excel mr-2"></i>Excelダウンロード
            </button>
          </div>
        </div>

        <div class="empty-state" v-else-if="hasSearched">
          <i class="fas fa-inbox fa-3x text-gray-300"></i>
          <p>該当するデータがありません</p>
        </div>

        <div class="info-section">
          <div class="info-card">
            <h5><i class="fas fa-info-circle mr-2"></i>論理DLについて</h5>
            <ul>
              <li>システムに登録されている論理在庫データをダウンロードできます</li>
              <li>在庫日を指定して、過去の在庫状況を確認できます</li>
              <li>データ形式は「明細」（品番単位）または「集計」（品目別合計）を選択できます</li>
              <li>大容量データの場合、ダウンロードに時間がかかる場合があります</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'

const showToast = inject('showToast')

const searchForm = ref({
  system: '',
  warehouse: '',
  stockDate: new Date().toISOString().slice(0, 10),
  stockType: '',
  itemCode: '',
  itemName: '',
  location: '',
  format: 'detail'
})

const searchResults = ref([])
const hasSearched = ref(false)

const totalQty = computed(() => {
  return searchResults.value.reduce((sum, item) => sum + item.qty, 0)
})

const searchData = () => {
  if (!searchForm.value.system) {
    showToast('システムを選択してください')
    return
  }
  if (!searchForm.value.warehouse) {
    showToast('倉庫を選択してください')
    return
  }

  // 模拟搜索数据
  searchResults.value = [
    { id: 1, itemCode: 'ABC-001', itemName: '鋼製足場板', spec: '300×1800', location: 'A-12-1', qty: 150, unit: '枚', stockType: '在庫', lastUpdate: '2024-01-15' },
    { id: 2, itemCode: 'ABC-002', itemName: '鋼製足場板', spec: '400×1800', location: 'A-15-2', qty: 120, unit: '枚', stockType: '在庫', lastUpdate: '2024-01-15' },
    { id: 3, itemCode: 'XYZ-888', itemName: '単管パイプ', spec: '48.6×3.5', location: 'B-08-1', qty: 200, unit: '本', stockType: '在庫', lastUpdate: '2024-01-14' },
    { id: 4, itemCode: 'DEF-001', itemName: 'ジャッキ', spec: '20t', location: 'C-03-1', qty: 50, unit: '台', stockType: '貸出中', lastUpdate: '2024-01-13' },
    { id: 5, itemCode: 'DEF-002', itemName: 'ジャッキ', spec: '30t', location: 'C-03-2', qty: 30, unit: '台', stockType: '整備中', lastUpdate: '2024-01-12' },
    { id: 6, itemCode: 'GHI-001', itemName: 'アジャスター', spec: '500mm', location: 'A-20-1', qty: 300, unit: '個', stockType: '在庫', lastUpdate: '2024-01-15' },
    { id: 7, itemCode: 'GHI-002', itemName: 'アジャスター', spec: '800mm', location: 'A-20-2', qty: 250, unit: '個', stockType: '在庫', lastUpdate: '2024-01-15' },
    { id: 8, itemCode: 'JKL-001', itemName: 'ホイールキャスター', spec: '150mm', location: 'D-05-1', qty: 80, unit: '個', stockType: '在庫', lastUpdate: '2024-01-14' }
  ]
  hasSearched.value = true
  showToast('データを抽出しました')
}

const clearForm = () => {
  searchForm.value = {
    system: '',
    warehouse: '',
    stockDate: new Date().toISOString().slice(0, 10),
    stockType: '',
    itemCode: '',
    itemName: '',
    location: '',
    format: 'detail'
  }
  searchResults.value = []
  hasSearched.value = false
}

const downloadCSV = () => {
  showToast(`${searchResults.value.length} 件のデータをCSVでダウンロードします`)
}

const downloadExcel = () => {
  showToast(`${searchResults.value.length} 件のデータをExcelでダウンロードします`)
}
</script>

<style scoped>
.logical-dl-screen {
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
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  border: none;
}

.btn-search:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
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
  margin-bottom: 24px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.result-info {
  display: flex;
  gap: 16px;
  align-items: center;
}

.result-count {
  font-size: 0.875rem;
  color: #64748b;
}

.result-stock {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  background: #e0e7ff;
  padding: 4px 12px;
  border-radius: 20px;
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

.stock-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.stock-badge.在庫 {
  background: #d1fae5;
  color: #065f46;
}

.stock-badge.貸出中 {
  background: #dbeafe;
  color: #1e40af;
}

.stock-badge.整備中 {
  background: #fef3c7;
  color: #92400e;
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

.btn-dl-csv:hover {
  background: #ea580c;
}

.btn-dl-excel {
  background: #10b981;
  color: white;
  border: none;
}

.btn-dl-excel:hover {
  background: #059669;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #94a3b8;
  border-top: 1px solid #e2e8f0;
}

.empty-state p {
  margin-top: 16px;
}

.info-section {
  border-top: 1px solid #e2e8f0;
  padding-top: 24px;
}

.info-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
}

.info-card h5 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
}

.info-card ul {
  list-style: disc;
  padding-left: 20px;
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.8;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
