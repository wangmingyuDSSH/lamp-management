<template>
  <div class="exit-registration-screen">
    <div class="screen-card">
      <div class="card-header">
        <h3><i class="fas fa-sign-out-alt mr-2"></i>センター退場登録</h3>
      </div>

      <!-- 検索条件 -->
      <div class="search-section">
        <div class="search-grid">
          <div class="search-field">
            <label>車番</label>
            <input 
              type="text" 
              v-model="searchPlate" 
              class="form-input" 
              placeholder="車番を入力"
              @keyup.enter="searchVehicles"
            >
          </div>
          <div class="search-field">
            <label>運送会社</label>
            <input 
              type="text" 
              v-model="searchCarrier" 
              class="form-input" 
              placeholder="運送会社名（カナ）"
            >
          </div>
          <div class="search-field">
            <label>入場日</label>
            <input type="date" v-model="searchDate" class="form-input">
          </div>
          <div class="search-field">
            <button class="btn-search" @click="searchVehicles">
              <i class="fas fa-search mr-2"></i>検索
            </button>
          </div>
        </div>
      </div>

      <!-- 入場中車両一覧 -->
      <div class="vehicles-section">
        <div class="section-title">
          <i class="fas fa-truck mr-2"></i>入場中車両一覧
          <span class="badge">{{ filteredVehicles.length }}件</span>
        </div>
        
        <div class="vehicles-table">
          <table class="data-table">
            <thead>
              <tr>
                <th>選択</th>
                <th>入場No.</th>
                <th>入場日時</th>
                <th>車番</th>
                <th>車種</th>
                <th>運送会社</th>
                <th>運転手</th>
                <th>目的</th>
                <th>状態</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="vehicle in filteredVehicles" 
                :key="vehicle.entryNo"
                :class="{ selected: selectedVehicle?.entryNo === vehicle.entryNo }"
              >
                <td class="text-center">
                  <input 
                    type="radio" 
                    :value="vehicle" 
                    v-model="selectedVehicle"
                    name="vehicleSelect"
                  >
                </td>
                <td class="font-mono">{{ vehicle.entryNo }}</td>
                <td>{{ vehicle.entryDate }} {{ vehicle.entryTime }}</td>
                <td class="font-mono">{{ vehicle.plateNumber }}</td>
                <td>{{ vehicle.vehicleType }}</td>
                <td>{{ vehicle.carrier }}</td>
                <td>{{ vehicle.driver }}</td>
                <td>
                  <span :class="['purpose-badge', `purpose-${vehicle.purpose}`]">
                    {{ purposeLabel(vehicle.purpose) }}
                  </span>
                </td>
                <td>
                  <span class="status-badge status-entry">入場中</span>
                </td>
              </tr>
              <tr v-if="filteredVehicles.length === 0">
                <td colspan="9" class="text-center text-gray-500 py-8">
                  入場中の車両がありません
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 退場登録フォーム -->
      <div v-if="selectedVehicle" class="exit-form">
        <div class="section-title">
          <i class="fas fa-clipboard-check mr-2"></i>退場登録
        </div>
        
        <div class="exit-form-content">
          <div class="vehicle-info-card">
            <div class="info-row">
              <span class="info-label">入場No:</span>
              <span class="info-value font-mono">{{ selectedVehicle.entryNo }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">車番:</span>
              <span class="info-value font-mono">{{ selectedVehicle.plateNumber }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">運送会社:</span>
              <span class="info-value">{{ selectedVehicle.carrier }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">運転手:</span>
              <span class="info-value">{{ selectedVehicle.driver }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">入場時刻:</span>
              <span class="info-value">{{ selectedVehicle.entryDate }} {{ selectedVehicle.entryTime }}</span>
            </div>
          </div>

          <div class="exit-input-section">
            <div class="form-row">
              <div class="form-field">
                <label>退場予定時刻 <span class="required">*</span></label>
                <input type="time" v-model="exitTime" class="form-input">
              </div>
              <div class="form-field">
                <label>メーター表示（km）</label>
                <input 
                  type="number" 
                  v-model="meterReading" 
                  class="form-input" 
                  placeholder="メーター読み"
                >
              </div>
            </div>

            <div class="form-field">
              <label>作業完了確認</label>
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="workComplete.shipment">
                  <span>出荷作業完了</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" v-model="workComplete.receipt">
                  <span>入荷作業完了</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" v-model="workComplete.loading">
                  <span>積込み完了</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" v-model="workComplete.unloading">
                  <span>荷卸し完了</span>
                </label>
              </div>
            </div>

            <div class="form-field">
              <label>備考</label>
              <textarea 
                v-model="remarks" 
                rows="2" 
                class="textarea-input" 
                placeholder="退場に関する備考を入力"
              ></textarea>
            </div>

            <div class="form-actions">
              <button class="btn-cancel" @click="clearSelection">
                <i class="fas fa-times mr-2"></i>キャンセル
              </button>
              <button class="btn-exit" @click="registerExit" :disabled="!canRegister">
                <i class="fas fa-sign-out-alt mr-2"></i>退場登録
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'

const showToast = inject('showToast')

// 検索条件
const searchPlate = ref('')
const searchCarrier = ref('')
const searchDate = ref('')

// 選択中の車両
const selectedVehicle = ref(null)

// 退場フォーム
const exitTime = ref('')
const meterReading = ref('')
const workComplete = ref({
  shipment: false,
  receipt: false,
  loading: false,
  unloading: false
})
const remarks = ref('')

// 入場中車両データ（デモ用）
const vehicles = ref([
  {
    entryNo: 'E250301001',
    entryDate: '2025/03/01',
    entryTime: '08:30',
    plateNumber: '1234',
    vehicleType: '4t',
    carrier: 'A運送株式会社',
    driver: '山田太郎',
    purpose: 'shipment'
  },
  {
    entryNo: 'E250301002',
    entryDate: '2025/03/01',
    entryTime: '09:15',
    plateNumber: '5678',
    vehicleType: '2t',
    carrier: 'B運送株式会社',
    driver: '佐藤花子',
    purpose: 'receipt'
  },
  {
    entryNo: 'E250301003',
    entryDate: '2025/03/01',
    entryTime: '10:00',
    plateNumber: '9012',
    vehicleType: '8t',
    carrier: 'C運送株式会社',
    driver: '鈴木一郎',
    purpose: 'both'
  },
  {
    entryNo: 'E250301004',
    entryDate: '2025/03/01',
    entryTime: '11:30',
    plateNumber: '3456',
    vehicleType: '4t',
    carrier: 'D運送株式会社',
    driver: '田中次郎',
    purpose: 'shipment'
  }
])

// フィルタリングされた車両
const filteredVehicles = computed(() => {
  return vehicles.value.filter(v => {
    const matchPlate = !searchPlate.value || v.plateNumber.includes(searchPlate.value)
    const matchCarrier = !searchCarrier.value || v.carrier.includes(searchCarrier.value)
    const matchDate = !searchDate.value || v.entryDate === searchDate.value.replace(/-/g, '/')
    return matchPlate && matchCarrier && matchDate
  })
})

// 登録可能かチェック
const canRegister = computed(() => {
  return exitTime.value
})

// 目的ラベル
const purposeLabel = (purpose) => {
  const labels = {
    shipment: '出荷',
    receipt: '入荷',
    both: '出荷/入荷',
    other: 'その他'
  }
  return labels[purpose] || purpose
}

// 検索
const searchVehicles = () => {
  showToast(`${filteredVehicles.value.length}件の車両が見つかりました`)
}

// 選択解除
const clearSelection = () => {
  selectedVehicle.value = null
  exitTime.value = ''
  meterReading.value = ''
  workComplete.value = {
    shipment: false,
    receipt: false,
    loading: false,
    unloading: false
  }
  remarks.value = ''
}

// 退場登録
const registerExit = () => {
  if (!confirm('退場登録を行いますか？')) return
  
  // デモ用：実際はAPI呼び出し
  const index = vehicles.value.findIndex(v => v.entryNo === selectedVehicle.value.entryNo)
  if (index > -1) {
    vehicles.value.splice(index, 1)
  }
  
  showToast(`車番 ${selectedVehicle.value.plateNumber} の退場登録が完了しました`)
  clearSelection()
}
</script>

<style scoped>
.exit-registration-screen {
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
  border-bottom: 1px solid #e2e8f0;
  background: #fafbfc;
}

.search-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  align-items: end;
}

.search-field label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.btn-search {
  padding: 8px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-search:hover {
  background: #2563eb;
}

.vehicles-section {
  padding: 20px 24px;
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

.vehicles-table {
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

.purpose-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.purpose-shipment {
  background: #dbeafe;
  color: #1e40af;
}

.purpose-receipt {
  background: #dcfce7;
  color: #166534;
}

.purpose-both {
  background: #fef3c7;
  color: #92400e;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-entry {
  background: #dcfce7;
  color: #166534;
}

.exit-form {
  padding: 20px 24px;
  border-top: 2px solid #e2e8f0;
  background: #fafbfc;
}

.exit-form-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
}

.vehicle-info-card {
  background: white;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: #64748b;
  font-size: 0.875rem;
}

.info-value {
  font-weight: 500;
  color: #1e293b;
}

.exit-input-section {
  background: white;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-field {
  margin-bottom: 16px;
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

.textarea-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  resize: vertical;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #475569;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
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

.btn-exit {
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

.btn-exit:hover:not(:disabled) {
  background: #059669;
}

.btn-exit:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1024px) {
  .search-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .exit-form-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .search-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
