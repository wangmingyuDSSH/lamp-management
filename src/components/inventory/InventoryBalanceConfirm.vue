<template>
  <div class="inventory-balance">
    <div class="screen-card">
      <div class="card-header">
        <div>
          <h3><i class="fas fa-file-contract mr-2"></i>残高確認書・残高確認結果登録</h3>
          <p class="header-subtitle">他社保有の当社在庫確認と結果登録</p>
        </div>
        <button class="btn-create" @click="createNew">
          <i class="fas fa-plus mr-2"></i>新規作成
        </button>
      </div>

      <!-- 確認状況サマリー -->
      <div class="status-summary">
        <div class="summary-card" v-for="status in statusSummary" :key="status.label">
          <div :class="['summary-value', status.color]">{{ status.count }}</div>
          <div class="summary-label">{{ status.label }}</div>
        </div>
      </div>

      <!-- 未処理確認一覧 -->
      <div class="pending-list">
        <h4><i class="fas fa-exclamation-circle text-red-500 mr-2"></i>未処理確認一覧</h4>
        <div class="list-container">
          <div 
            v-for="item in pendingList" 
            :key="item.id"
            :class="['pending-item', item.status]"
            @click="selectItem(item)"
          >
            <div class="item-info">
              <div class="item-company">{{ item.company }}</div>
              <div class="item-date">作成日: {{ item.createDate }} | 期限: {{ item.deadline }}</div>
              <div class="item-count">対象品目: {{ item.itemCount }}件</div>
            </div>
            <div :class="['status-tag', item.status]">{{ item.statusText }}</div>
          </div>
        </div>
      </div>

      <!-- 詳細表示 -->
      <div v-if="selectedItem" class="detail-section">
        <div class="detail-header">
          <h4>残高確認書詳細</h4>
          <div class="detail-actions">
            <button class="btn-edit" @click="editDocument">
              <i class="fas fa-edit mr-1"></i>編集
            </button>
            <button class="btn-send" @click="sendDocument">
              <i class="fas fa-paper-plane mr-1"></i>送信
            </button>
            <button class="btn-print" @click="printDocument">
              <i class="fas fa-print mr-1"></i>印刷
            </button>
          </div>
        </div>

        <!-- 文書プレビュー -->
        <div class="document-preview">
          <div class="document-header">
            <h2>在庫残高確認書</h2>
            <div class="document-meta">
              <span>確認番号: {{ selectedItem.confirmNo }}</span>
              <span>発行日: {{ selectedItem.issueDate }}</span>
            </div>
          </div>

          <div class="document-info">
            <div class="info-row">
              <span class="info-label">確認先:</span>
              <span class="info-value">{{ selectedItem.company }} 様</span>
            </div>
            <div class="info-row">
              <span class="info-label">ご担当者:</span>
              <span class="info-value">在庫管理課 御中</span>
            </div>
            <div class="info-row">
              <span class="info-label">確認期間:</span>
              <span class="info-value">{{ selectedItem.periodFrom }} ～ {{ selectedItem.periodTo }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">回答期限:</span>
              <span class="info-value">{{ selectedItem.deadline }}</span>
            </div>
          </div>

          <div class="document-table">
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>品番</th>
                  <th>品名</th>
                  <th class="text-center">数量</th>
                  <th class="text-center">単位</th>
                  <th class="text-center">確認欄</th>
				  </tr>
                 </thead>
              <tbody>
                <tr v-for="(item, idx) in selectedItem.items" :key="idx">
                  <td>{{ idx + 1 }}</td>
                  <td class="font-mono">{{ item.code }}</td>
                  <td>{{ item.name }}</td>
                  <td class="text-center">{{ item.qty }}</td>
                  <td class="text-center">{{ item.unit }}</td>
                  <td class="text-center">
                    <span v-if="item.confirmed === 'match'" class="confirm-mark match">○</span>
                    <span v-else-if="item.confirmed === 'mismatch'" class="confirm-mark mismatch">×</span>
                    <span v-else class="confirm-mark pending">?</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="document-footer">
            <p>上記の通り、貴社にて保管している当社在庫をご確認の上、確認欄に○（一致）または×（不一致）を記入し、</p>
            <p>不一致の場合は右側の備考欄に実数量を記載の上、ご返送ください。</p>
            <div class="return-address">
              <p>返送先: 〒100-0001 東京都千代田区xxx xxxx</p>
              <p>担当: 在庫管理課 TEL: 03-xxxx-xxxx</p>
            </div>
          </div>
        </div>

        <!-- 結果登録 -->
        <div class="result-registration">
          <h5><i class="fas fa-clipboard-check text-blue-500 mr-2"></i>確認結果登録</h5>
          <div class="registration-form">
            <div class="form-field">
              <label>確認書番号</label>
              <input type="text" v-model="resultForm.confirmNo" class="form-input" readonly>
            </div>
            <div class="form-field">
              <label>回答日</label>
              <input type="date" v-model="resultForm.answerDate" class="form-input">
            </div>
            <div class="form-field">
              <label>確認結果</label>
              <select v-model="resultForm.result" class="form-select">
                <option value="">選択してください</option>
                <option value="match">全て一致</option>
                <option value="partial">一部不一致</option>
                <option value="pending">未回答</option>
              </select>
            </div>
            <div class="form-actions">
              <button class="btn-register" @click="registerResult">
                <i class="fas fa-save mr-2"></i>結果登録
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'

const showToast = inject('showToast')

const statusSummary = ref([
  { label: '未回答', count: 2, color: 'text-red-600' },
  { label: '確認中', count: 1, color: 'text-amber-600' },
  { label: '回答済', count: 5, color: 'text-green-600' },
  { label: '合計', count: 8, color: 'text-slate-800' }
])

const pendingList = ref([
  {
    id: 1,
    company: '株式会社建設商事',
    createDate: '2026/03/20',
    deadline: '2026/03/30',
    itemCount: 15,
    status: 'unanswered',
    statusText: '未回答',
    confirmNo: 'CF-2026-0320-001',
    issueDate: '2026年3月20日',
    periodFrom: '2026年2月1日',
    periodTo: '2026年2月28日',
    items: [
      { code: 'ABC-001', name: '鋼製足場板 300×1800', qty: 50, unit: '枚', confirmed: '' },
      { code: 'XYZ-888', name: '単管パイプ 48.6×3.5', qty: 120, unit: '本', confirmed: '' },
      { code: 'DEF-111', name: 'ジャッキ 2t', qty: 5, unit: '台', confirmed: '' }
    ]
  },
  {
    id: 2,
    company: '東洋レンタル株式会社',
    createDate: '2026/03/18',
    deadline: '2026/03/28',
    itemCount: 8,
    status: 'processing',
    statusText: '確認中',
    confirmNo: 'CF-2026-0318-002',
    issueDate: '2026年3月18日',
    periodFrom: '2026年2月1日',
    periodTo: '2026年2月28日',
    items: [
      { code: 'ABC-015', name: '鋼製足場板 400×1800', qty: 30, unit: '枚', confirmed: 'match' },
      { code: 'XYZ-112', name: 'コ型クランプ', qty: 45, unit: '個', confirmed: '' }
    ]
  }
])

const selectedItem = ref(null)
const resultForm = ref({
  confirmNo: '',
  answerDate: '',
  result: ''
})

const createNew = () => {
  showToast('新規残高確認書作成画面を開きました')
}

const selectItem = (item) => {
  selectedItem.value = item
  resultForm.value = {
    confirmNo: item.confirmNo,
    answerDate: new Date().toISOString().slice(0, 10),
    result: ''
  }
}

const editDocument = () => {
  showToast('残高確認書を編集します')
}

const sendDocument = () => {
  showToast('残高確認書を送信しました')
}

const printDocument = () => {
  showToast('印刷プレビューを表示します')
}

const registerResult = () => {
  if (!resultForm.value.result) {
    showToast('確認結果を選択してください')
    return
  }
  showToast('確認結果を登録しました')
  if (selectedItem.value) {
    const index = pendingList.value.findIndex(i => i.id === selectedItem.value.id)
    if (index !== -1) {
      pendingList.value[index].status = 'answered'
      pendingList.value[index].statusText = '回答済'
      statusSummary.value[0].count--
      statusSummary.value[2].count++
    }
  }
  selectedItem.value = null
}
</script>

<style scoped>
.inventory-balance {
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
  align-items: flex-start;
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

.btn-create {
  padding: 8px 16px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.status-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 24px;
}

.summary-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: bold;
}

.text-red-600 {
  color: #ef4444;
}

.text-amber-600 {
  color: #f59e0b;
}

.text-green-600 {
  color: #10b981;
}

.text-slate-800 {
  color: #1e293b;
}

.summary-label {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 4px;
}

.pending-list {
  padding: 0 24px 24px;
}

.pending-list h4 {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
  font-size: 0.875rem;
}

.list-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pending-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.pending-item.unanswered {
  background: #fef2f2;
  border: 1px solid #fee2e2;
}

.pending-item.processing {
  background: #fffbeb;
  border: 1px solid #fef3c7;
}

.pending-item.answered {
  background: #f0fdf4;
  border: 1px solid #dcfce7;
}

.pending-item:hover {
  transform: translateX(4px);
}

.item-company {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.item-date, .item-count {
  font-size: 0.7rem;
  color: #64748b;
}

.status-tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 500;
}

.status-tag.unanswered {
  background: #fee2e2;
  color: #991b1b;
}

.status-tag.processing {
  background: #fef3c7;
  color: #92400e;
}

.status-tag.answered {
  background: #dcfce7;
  color: #166534;
}

.detail-section {
  border-top: 1px solid #e2e8f0;
  padding: 24px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.detail-header h4 {
  font-weight: bold;
  color: #1e293b;
}

.detail-actions {
  display: flex;
  gap: 8px;
}

.btn-edit, .btn-send, .btn-print {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.7rem;
  cursor: pointer;
}

.btn-edit {
  background: white;
  border: 1px solid #cbd5e1;
  color: #475569;
}

.btn-send {
  background: #3b82f6;
  border: none;
  color: white;
}

.btn-print {
  background: #10b981;
  border: none;
  color: white;
}

.document-preview {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.document-header {
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #1e293b;
}

.document-header h2 {
  font-size: 1.25rem;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 8px;
}

.document-meta {
  display: flex;
  justify-content: center;
  gap: 24px;
  font-size: 0.75rem;
  color: #64748b;
}

.document-info {
  margin-bottom: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-row {
  display: flex;
  gap: 8px;
  font-size: 0.75rem;
}

.info-label {
  font-weight: 500;
  color: #475569;
}

.info-value {
  color: #1e293b;
}

.document-table {
  overflow-x: auto;
  margin-bottom: 20px;
}

.document-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.7rem;
  border: 1px solid #cbd5e1;
}

.document-table th {
  background: #f8fafc;
  padding: 8px;
  text-align: left;
  border: 1px solid #cbd5e1;
}

.document-table td {
  padding: 8px;
  border: 1px solid #cbd5e1;
}

.font-mono {
  font-family: monospace;
}

.text-center {
  text-align: center;
}

.confirm-mark {
  display: inline-block;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  border-radius: 50%;
  font-weight: bold;
}

.confirm-mark.match {
  background: #d1fae5;
  color: #10b981;
}

.confirm-mark.mismatch {
  background: #fee2e2;
  color: #ef4444;
}

.confirm-mark.pending {
  background: #f1f5f9;
  color: #94a3b8;
}

.document-footer {
  font-size: 0.65rem;
  color: #64748b;
  text-align: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.return-address {
  margin-top: 12px;
}

.result-registration {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.result-registration h5 {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
  font-size: 0.875rem;
}

.registration-form {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  align-items: end;
}

.form-field label {
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
  border-radius: 6px;
  font-size: 0.75rem;
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
}

.btn-register {
  padding: 8px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>