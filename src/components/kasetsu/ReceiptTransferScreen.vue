<template>
  <div class="receipt-transfer-screen">
    <div class="screen-card">
      <div class="card-header">
        <h3><i class="fas fa-exchange-alt mr-2"></i>入荷振替登録</h3>
      </div>

      <!-- 検索条件 -->
      <div class="search-section">
        <div class="search-grid">
          <div class="search-field">
            <label>入荷No.</label>
            <input type="text" v-model="searchReceiptNo" class="form-input" placeholder="入荷No.">
          </div>
          <div class="search-field">
            <label>入荷日(From)</label>
            <input type="date" v-model="searchDateFrom" class="form-input">
          </div>
          <div class="search-field">
            <label>入荷日(To)</label>
            <input type="date" v-model="searchDateTo" class="form-input">
          </div>
          <div class="search-field">
            <label>得意先</label>
            <input type="text" v-model="searchCustomerQuery" class="form-input" placeholder="得意先名">
          </div>
          <div class="search-field">
            <label>現場</label>
            <input type="text" v-model="searchSiteQuery" class="form-input" placeholder="現場名">
          </div>
          <div class="search-field search-buttons">
            <label class="search-label-placeholder">&nbsp;</label>
            <div class="search-buttons-wrapper">
              <button class="btn-search" @click="searchReceipts">
                <i class="fas fa-search mr-2"></i>検索
              </button>
              <button class="btn-clear" @click="clearSearch">
                <i class="fas fa-eraser mr-2"></i>クリア
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 振替対象一覧 -->
      <div class="transfer-list-section">
        <div class="section-title">
          <i class="fas fa-list mr-2"></i>振替対象入荷伝票
          <span class="badge">{{ filteredReceipts.length }}件</span>
        </div>
        
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>入荷No.</th>
                <th>入荷日</th>
                <th>得意先</th>
                <th>現場</th>
                <th>運送会社</th>
                <th>検収状況</th>
                <th>振替状況</th>
                <th>振替登録</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="receipt in filteredReceipts" 
                :key="receipt.no"
              >
                <td class="font-mono">{{ receipt.no }}</td>
                <td>{{ receipt.date }}</td>
                <td>{{ receipt.customer }}</td>
                <td>{{ receipt.site }}</td>
                <td>{{ receipt.carrier }}</td>
                <td>
                  <span :class="['status-badge', receipt.inspectionStatus === 'completed' ? 'status-completed' : 'status-pending']">
                    {{ receipt.inspectionStatus === 'completed' ? '検収済' : '検収中' }}
                  </span>
                </td>
                <td>
                  <span :class="['status-badge', receipt.transferStatus === 'transferred' ? 'status-transferred' : 'status-not-transferred']">
                    {{ receipt.transferStatus === 'transferred' ? '振替済' : '未振替' }}
                  </span>
                </td>
                <td class="text-center">
                  <button 
                    class="btn-transfer-register" 
                    @click="showTransferRegister(receipt)"
                    :disabled="receipt.transferStatus === 'transferred'"
                  >
                    <i class="fas fa-exchange-alt mr-1"></i>振替登録
                  </button>
                </td>
              </tr>
              <tr v-if="filteredReceipts.length === 0">
                <td colspan="8" class="text-center text-gray-500 py-8">
                  該当する入荷伝票がありません
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 振替履歴 -->
      <div class="transfer-history-section">
        <div class="section-title">
          <i class="fas fa-history mr-2"></i>振替履歴
        </div>
        <div class="history-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>振替No.</th>
                <th>振替日</th>
                <th>元入荷No.</th>
                <th>元得意先</th>
                <th>振替先得意先</th>
                <th>振替理由</th>
                <th>状態</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="history in transferHistory" :key="history.no">
                <td class="font-mono">{{ history.no }}</td>
                <td>{{ history.date }}</td>
                <td class="font-mono">{{ history.originalReceiptNo }}</td>
                <td>{{ history.originalCustomer }}</td>
                <td>{{ history.newCustomer }}</td>
                <td>{{ reasonLabel(history.reason) }}</td>
                <td>
                  <span :class="['status-badge', history.status === 'confirmed' ? 'status-confirmed' : 'status-pending']">
                    {{ history.status === 'confirmed' ? '確定' : '仮登録' }}
                  </span>
                </td>
              </tr>
              <tr v-if="transferHistory.length === 0">
                <td colspan="7" class="text-center text-gray-500 py-4">
                  振替履歴がありません
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'

const showToast = inject('showToast')

// 検索条件
const searchReceiptNo = ref('')
const searchDateFrom = ref('')
const searchDateTo = ref('')
const searchCustomerQuery = ref('')
const searchSiteQuery = ref('')

// （将来の振替登録機能で使用予定）

// デモ用入荷伝票データ
const receipts = ref([
  {
    no: 'A1N163385',
    date: '2024/09/06',
    customer: 'アルインコ株式会社',
    site: 'テスト現場A',
    carrier: 'A運送株式会社',
    inspectionStatus: 'completed',
    transferStatus: 'not_transferred',
    items: [
      { code: 'ALASLE', name: 'アルミサガオ 主材 左', loanQty: 10, returnQty: 8, transferQty: 0 },
      { code: 'ALASRE', name: 'アルミサガオ 主材 右', loanQty: 10, returnQty: 8, transferQty: 0 }
    ]
  },
  {
    no: 'A1N163386',
    date: '2024/09/06',
    customer: '△△建設株式会社',
    site: '△△現場',
    carrier: 'B運送株式会社',
    inspectionStatus: 'completed',
    transferStatus: 'not_transferred',
    items: [
      { code: 'HK6N', name: '鋼製布板 幅木用500X1829 橙', loanQty: 20, returnQty: 18, transferQty: 0 }
    ]
  },
  {
    no: 'A1N163387',
    date: '2024/09/07',
    customer: '□□産業株式会社',
    site: '□□現場',
    carrier: 'C運送株式会社',
    inspectionStatus: 'pending',
    transferStatus: 'not_transferred',
    items: []
  }
])

// 振替履歴
const transferHistory = ref([
  {
    no: 'T240901001',
    date: '2024/09/01',
    originalReceiptNo: 'A1N163380',
    originalCustomer: 'XX株式会社',
    newCustomer: 'YY株式会社',
    reason: 'site_transfer',
    status: 'confirmed'
  }
])

// フィルタリングされた伝票
const filteredReceipts = computed(() => {
  return receipts.value.filter(r => {
    const matchNo = !searchReceiptNo.value || r.no.includes(searchReceiptNo.value)
    const matchCustomer = !searchCustomerQuery.value || r.customer.includes(searchCustomerQuery.value)
    const matchSite = !searchSiteQuery.value || r.site.includes(searchSiteQuery.value)
    
    let matchDate = true
    if (searchDateFrom.value) {
      matchDate = matchDate && r.date >= searchDateFrom.value.replace(/-/g, '/')
    }
    if (searchDateTo.value) {
      matchDate = matchDate && r.date <= searchDateTo.value.replace(/-/g, '/')
    }
    
    return matchNo && matchCustomer && matchSite && matchDate
  })
})

// ラベル変換
const reasonLabel = (reason) => {
  const labels = {
    wrong_site: '現場誤り',
    customer_change: '得意先変更',
    site_transfer: '現場振替',
    other: 'その他'
  }
  return labels[reason] || reason
}

// メソッド
const searchReceipts = () => {
  showToast(`${filteredReceipts.value.length}件の入荷伝票が見つかりました`)
}

const clearSearch = () => {
  searchReceiptNo.value = ''
  searchDateFrom.value = ''
  searchDateTo.value = ''
  searchCustomerQuery.value = ''
  searchSiteQuery.value = ''
  showToast('検索条件をクリアしました')
}

// 振替登録ボタン（一覧用）- 現在は示意のみ
const showTransferRegister = (receipt) => {
  showToast(`入荷No ${receipt.no} の振替登録機能は現在開発中です`)
  // ここに将来の振替登録機能を実装
}
</script>

<style scoped>
.receipt-transfer-screen {
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

.search-section {
  padding: 20px 24px;
  background: #fafbfc;
  border-bottom: 1px solid #e2e8f0;
}

.search-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  align-items: start;
}

.search-field label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 6px;
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
  min-width: 80px;
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
  min-width: 80px;
}

.btn-clear:hover {
  background: #e2e8f0;
}

.btn-transfer-register {
  padding: 4px 10px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-transfer-register:hover:not(:disabled) {
  background: #059669;
}

.btn-transfer-register:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.transfer-list-section, .transfer-history-section {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.section-title .badge {
  margin-left: 8px;
  padding: 2px 8px;
  background: #e0e7ff;
  color: #4338ca;
  font-size: 0.75rem;
  border-radius: 12px;
}

.table-container, .history-table-container {
  overflow-x: auto;
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

.data-table tr.selected {
  background: #eff6ff;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-completed {
  background: #dcfce7;
  color: #166534;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-transferred {
  background: #dbeafe;
  color: #1e40af;
}

.status-not-transferred {
  background: #f1f5f9;
  color: #64748b;
}

.status-confirmed {
  background: #dcfce7;
  color: #166534;
}

.transfer-form-section {
  padding: 20px 24px;
  background: #fafbfc;
  border-bottom: 1px solid #e2e8f0;
}

.transfer-form-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
}

.original-info-card, .transfer-target-card {
  background: white;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.card-title {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.info-grid {
  display: grid;
  gap: 12px;
}

.info-item {
  display: flex;
  gap: 8px;
}

.info-label {
  font-size: 0.875rem;
  color: #64748b;
  min-width: 80px;
}

.info-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.form-field label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 6px;
}

.form-field label .required {
  color: #ef4444;
}

.search-input-group {
  display: flex;
  gap: 8px;
}

.code-input {
  width: 80px;
}

.name-input {
  flex: 1;
}

.btn-search-sm {
  padding: 8px 12px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-search-sm:hover {
  background: #e2e8f0;
}

.section-subtitle {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 12px;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.items-table th, .items-table td {
  padding: 10px;
  border: 1px solid #e2e8f0;
  text-align: left;
}

.items-table th {
  background: #f8fafc;
  font-weight: 600;
}

.qty-input {
  width: 80px;
  padding: 6px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  text-align: right;
}

.textarea-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  resize: vertical;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.btn-cancel {
  padding: 10px 20px;
  background: #f1f5f9;
  color: #64748b;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #e2e8f0;
}

.btn-preview {
  padding: 10px 20px;
  background: white;
  color: #3b82f6;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-preview:hover {
  background: #eff6ff;
}

.btn-save {
  padding: 10px 24px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover:not(:disabled) {
  background: #059669;
}

.btn-save:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.mt-4 {
  margin-top: 16px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1200px) {
  .search-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .transfer-form-content {
    grid-template-columns: 1fr;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .search-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .search-input-group {
    flex-wrap: wrap;
  }
  
  .code-input {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .search-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
