<template>
  <div class="receipt-result">
    <div class="screen-card">
      <div class="card-header">
        <h3><i class="fas fa-warehouse mr-2"></i>入庫実績登録</h3>
      </div>

      <!-- 基本情報 -->
      <div class="basic-info">
        <div class="info-grid">
          <div class="info-field">
            <label>入庫日</label>
            <input type="date" v-model="form.date" class="form-input">
          </div>
          <div class="info-field">
            <label>車両番号</label>
            <input type="text" v-model="form.carNo" class="form-input font-mono">
          </div>
          <div class="info-field">
            <label>運転手</label>
            <input type="text" v-model="form.driver" class="form-input">
          </div>
          <div class="info-field">
            <label>運送会社</label>
            <input type="text" v-model="form.carrier" class="form-input">
          </div>
        </div>
      </div>

      <!-- 関連工事指示 -->
      <div class="related-work">
        <h4><i class="fas fa-link mr-2"></i>関連工事指示（複数選択可）</h4>
        <div class="table-container">
          <table class="work-table">
            <thead>
              <tr>
                <th class="w-12">選択</th>
                <th>工事No.</th>
                <th>工事日</th>
                <th>現場</th>
                <th>工事内容</th>
				</tr>
               </thead>
            <tbody>
              <tr v-for="work in workList" :key="work.no" class="hover-row">
                <td class="text-center">
                  <input type="checkbox" v-model="work.selected" class="work-checkbox">
                 </td>
                <td class="font-mono">{{ work.no }} </td>
                <td>{{ work.date }} </td>
                <td>{{ work.site }} </td>
                <td>{{ work.content }} </td>
               </tr>
            </tbody>
           </table>
        </div>
      </div>

      <!-- 入庫品目 -->
      <div class="items-section">
        <h4><i class="fas fa-boxes mr-2"></i>入庫品目（組立数/解体数）</h4>
        <div class="table-container">
          <table class="items-table">
            <thead>
              <tr>
                <th>品番</th>
                <th>品名</th>
                <th class="text-right">組立数</th>
                <th class="text-right">解体数</th>
                <th>備考</th>
				</tr>
               </thead>
            <tbody>
              <tr v-for="item in items" :key="item.code">
                <td class="font-mono">{{ item.code }} </td>
                <td>{{ item.name }} </td>
                <td class="text-right">
                  <input type="number" v-model="item.assemblyQty" class="qty-input text-right" min="0">
                </td>
                <td class="text-right">
                  <input type="number" v-model="item.dismantleQty" class="qty-input text-right bg-green-50" min="0">
                </td>
                <td>
                  <input type="text" v-model="item.remarks" class="form-input-sm" placeholder="備考">
                </td>
               </tr>
            </tbody>
           </table>
        </div>
      </div>

      <!-- アクション -->
      <div class="action-buttons">
        <button class="btn-back" @click="$emit('back')">
          <i class="fas fa-arrow-left mr-2"></i>戻る
        </button>
        <div class="right-buttons">
          <button class="btn-draft" @click="saveDraft">
            <i class="fas fa-save mr-2"></i>一時保存
          </button>
          <button class="btn-submit" @click="submitResult">
            <i class="fas fa-check mr-2"></i>入庫登録
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'

const showToast = inject('showToast')
const emit = defineEmits(['back'])

const form = ref({
  date: '2024-06-15',
  carNo: '0136',
  driver: '山田太郎',
  carrier: '○○運送'
})

const workList = ref([
  { no: 'NT0011', date: '2024/06/12', site: '××現場', content: '外部足場工事', selected: true }
])

const items = ref([
  { code: 'XP3800', name: '支柱3800', assemblyQty: 0, dismantleQty: 36, remarks: '' },
  { code: 'XP1900', name: '支柱1900', assemblyQty: 0, dismantleQty: 40, remarks: '' },
  { code: 'XP950', name: '支柱950', assemblyQty: 0, dismantleQty: 30, remarks: '' }
])

const saveDraft = () => {
  showToast('入庫実績を一時保存しました')
}

const submitResult = () => {
  if (confirm('入庫実績を登録しますか？')) {
    showToast('入庫実績を登録しました')
    setTimeout(() => {
      showToast('オクト・レンタルシステムに連携しました')
    }, 1500)
  }
}
</script>

<style scoped>
.receipt-result {
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

.basic-info {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.info-field label {
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

.font-mono {
  font-family: monospace;
}

.related-work, .items-section {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.related-work h4, .items-section h4 {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
  font-size: 0.875rem;
}

.table-container {
  overflow-x: auto;
}

.work-table, .items-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.work-table th, .items-table th {
  background: #f8fafc;
  padding: 10px;
  text-align: left;
  font-weight: 600;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
}

.work-table td, .items-table td {
  padding: 10px;
  border-bottom: 1px solid #e2e8f0;
}

.hover-row:hover {
  background: #eff6ff;
}

.w-12 {
  width: 48px;
}

.text-center {
  text-align: center;
}

.work-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.text-right {
  text-align: right;
}

.qty-input {
  width: 80px;
  padding: 4px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
}

.bg-green-50 {
  background: #f0fdf4;
}

.form-input-sm {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 0.75rem;
}

.action-buttons {
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
}

.right-buttons {
  display: flex;
  gap: 12px;
}

.btn-back {
  padding: 8px 16px;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
}

.btn-draft {
  padding: 8px 16px;
  background: #e2e8f0;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.btn-submit {
  padding: 8px 20px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
</style>