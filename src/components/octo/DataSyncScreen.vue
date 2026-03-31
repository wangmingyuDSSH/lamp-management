<template>
  <div class="data-sync">
    <div class="screen-card">
      <div class="card-header">
        <h3><i class="fas fa-sync mr-2"></i>オクト・レンタルシステム連携状況</h3>
      </div>

      <!-- 連携状況サマリー -->
      <div class="summary-cards">
        <div class="summary-card success">
          <div class="summary-number">正常</div>
          <div class="summary-label">連携ステータス</div>
        </div>
        <div class="summary-card">
          <div class="summary-number">156</div>
          <div class="summary-label">本日連携件数</div>
        </div>
        <div class="summary-card">
          <div class="summary-number">0</div>
          <div class="summary-label">エラー件数</div>
        </div>
      </div>

      <!-- 連携履歴 -->
      <div class="history-section">
        <h4><i class="fas fa-history mr-2"></i>連携履歴</h4>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>連携日時</th>
                <th>連携種別</th>
                <th>データ件数</th>
                <th>ステータス</th>
                <th>メッセージ</th>
				</tr>
               </thead>
            <tbody>
              <tr v-for="log in syncLogs" :key="log.id">
                <td>{{ log.datetime }} </td>
                <td>{{ log.type }} </td>
                <td>{{ log.count }}件 </td>
                <td>
                  <span :class="['status-badge', log.status === 'success' ? 'status-success' : 'status-error']">
                    {{ log.status === 'success' ? '成功' : '失敗' }}
                  </span>
                </td>
                <td>{{ log.message }} </td>
               </tr>
            </tbody>
           </table>
        </div>
      </div>

      <!-- 連携設定 -->
      <div class="settings-section">
        <h4><i class="fas fa-cog mr-2"></i>連携設定</h4>
        <div class="settings-grid">
          <div class="setting-field">
            <label>自動連携間隔</label>
            <select v-model="syncInterval" class="form-select">
              <option>5分</option>
              <option selected>15分</option>
              <option>30分</option>
              <option>1時間</option>
            </select>
          </div>
          <div class="setting-field">
            <label>連携対象</label>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="syncTargets.instruction" checked>
                <span>工事指示</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" v-model="syncTargets.completion" checked>
                <span>工事完了情報</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" v-model="syncTargets.stock" checked>
                <span>入出庫実績</span>
              </label>
            </div>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn-save" @click="saveSettings">
            <i class="fas fa-save mr-2"></i>設定保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'

const showToast = inject('showToast')

const syncInterval = ref('15分')
const syncTargets = ref({
  instruction: true,
  completion: true,
  stock: true
})

const syncLogs = ref([
  { id: 1, datetime: '2024/06/12 14:30:25', type: '工事指示取込', count: 5, status: 'success', message: '正常に完了しました' },
  { id: 2, datetime: '2024/06/12 14:25:10', type: '工事完了連携', count: 3, status: 'success', message: '正常に完了しました' },
  { id: 3, datetime: '2024/06/12 14:20:00', type: '出庫実績連携', count: 12, status: 'success', message: '正常に完了しました' },
  { id: 4, datetime: '2024/06/12 14:15:30', type: '入庫実績連携', count: 8, status: 'success', message: '正常に完了しました' }
])

const saveSettings = () => {
  showToast('連携設定を保存しました')
}
</script>

<style scoped>
.data-sync {
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

.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 24px;
}

.summary-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.summary-card.success {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
}

.summary-number {
  font-size: 1.75rem;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 8px;
}

.summary-label {
  font-size: 0.75rem;
  color: #64748b;
}

.history-section, .settings-section {
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
}

.history-section h4, .settings-section h4 {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
  font-size: 0.875rem;
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

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
}

.status-success {
  background: #d1fae5;
  color: #065f46;
}

.status-error {
  background: #fee2e2;
  color: #991b1b;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 20px;
}

.setting-field label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: #475569;
  margin-bottom: 8px;
}

.form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.875rem;
}

.checkbox-label input {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-save {
  padding: 8px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
</style>