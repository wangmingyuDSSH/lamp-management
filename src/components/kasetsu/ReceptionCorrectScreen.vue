<template>
  <div class="truck-master-screen">
    <div class="screen-card">
      <div class="card-header">
        <h3><i class="fas fa-truck mr-2"></i>トラックIDメンテナンス</h3>
        <button class="btn-add-new" @click="openNewModal">
          <i class="fas fa-plus mr-2"></i>新規登録
        </button>
      </div>

      <!-- 一覧テーブル -->
      <div class="master-table-container">
        <table class="data-table">
          <thead>
			<tr>
            <th>トラックID</th>
              <th>運送会社(カナ)</th>
              <th>運転手(カナ)</th>
              <th>車種</th>
              <th>車種(t)</th>
              <th>車番</th>
              <th>積載重量</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="truck in truckList" 
              :key="truck.id"
              :class="{ selected: selectedTruck?.id === truck.id }"
              @click="selectTruck(truck)"
              class="hover-row"
            >
              <td class="font-mono">{{ truck.id }}</td>
              <td>{{ truck.company }}</td>
              <td>{{ truck.driver }}</td>
              <td>{{ truck.vehicleCode }}</td>
              <td>{{ truck.vehicleType }}</td>
              <td class="font-mono">{{ truck.plateNumber }}</td>
              <td class="text-right">{{ truck.weight.toLocaleString() }}</td>
              <td>
                <button class="btn-edit" @click.stop="editTruck(truck)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" @click.stop="deleteTruck(truck.id)">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 入力エリア -->
      <div class="input-area">
        <div class="input-fields-wrapper">
          <div class="input-fields">
            <div class="input-field">
              <label>トラックID</label>
              <input type="text" v-model="formData.id" class="form-input bg-slate-100" readonly>
            </div>
            <div class="input-field">
              <label>運送会社</label>
              <input type="text" v-model="formData.company" class="form-input" placeholder="運送会社名">
            </div>
            <div class="input-field">
              <label>運転手名</label>
              <input type="text" v-model="formData.driver" class="form-input" placeholder="運転手名">
            </div>
            <div class="input-field">
              <label>車種</label>
              <select v-model="formData.vehicleCode" class="form-select">
                <option value="2U">2U</option>
                <option value="3U">3U</option>
                <option value="4U">4U</option>
                <option value="6U">6U</option>
                <option value="8U">8U</option>
                <option value="10U">10U</option>
              </select>
            </div>
            <div class="input-field">
              <label>車種(t)</label>
              <select v-model="formData.vehicleType" class="form-select">
                <option>2 t</option>
                <option>3 t</option>
                <option>4 t</option>
                <option>6 t</option>
                <option>8 t</option>
                <option>10 t</option>
              </select>
            </div>
            <div class="input-field">
              <label>車番</label>
              <input type="text" v-model="formData.plateNumber" class="form-input" placeholder="車番">
            </div>
            <div class="input-field">
              <label>積載重量</label>
              <input type="number" v-model="formData.weight" class="form-input text-right" placeholder="Kg">
            </div>
          </div>
          <div class="button-group">
            <button class="btn-save" @click="saveTruck">
              <i class="fas fa-save mr-2"></i>追加・変更
            </button>
            <button class="btn-delete-action" @click="deleteSelectedTruck">
              <i class="fas fa-trash mr-2"></i>削除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新規登録モーダル -->
    <div v-if="showNewModal" class="modal-overlay active" @click.self="closeNewModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3><i class="fas fa-plus mr-2"></i>新規トラック登録</h3>
          <button class="modal-close" @click="closeNewModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>運送会社 <span class="required">*</span></label>
            <input 
              type="text" 
              v-model="newTruck.company" 
              class="form-input" 
              placeholder="運送会社名"
              id="newCompanyName"
            >
          </div>
          <div class="form-group">
            <label>運転手名 <span class="required">*</span></label>
            <input 
              type="text" 
              v-model="newTruck.driver" 
              class="form-input" 
              placeholder="運転手名"
              id="newDriverName"
            >
          </div>
          <div class="form-row">
            <div class="form-group flex-1">
              <label>車種</label>
              <select v-model="newTruck.vehicleCode" class="form-select" id="newVehicleCode">
                <option value="2U">2U</option>
                <option value="3U">3U</option>
                <option value="4U">4U</option>
                <option value="6U">6U</option>
                <option value="8U">8U</option>
                <option value="10U">10U</option>
              </select>
            </div>
            <div class="form-group flex-1">
              <label>車種(t)</label>
              <select v-model="newTruck.vehicleType" class="form-select" id="newVehicleType">
                <option>2 t</option>
                <option>3 t</option>
                <option>4 t</option>
                <option>6 t</option>
                <option>8 t</option>
                <option>10 t</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group flex-1">
              <label>車番</label>
              <input 
                type="text" 
                v-model="newTruck.plateNumber" 
                class="form-input" 
                placeholder="車番"
                id="newPlateNumber"
              >
            </div>
            <div class="form-group flex-1">
              <label>積載重量(Kg)</label>
              <input 
                type="number" 
                v-model="newTruck.weight" 
                class="form-input text-right" 
                placeholder="0"
                id="newCapacity"
              >
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeNewModal">キャンセル</button>
          <button class="btn-confirm" @click="addNewTruck">登録</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'

const showToast = inject('showToast')

const truckList = ref([
  { id: 1, company: '○○カブシキガイシャ', driver: 'アルインコ', vehicleCode: '2U', vehicleType: '2 t', plateNumber: '123', weight: 3700 },
  { id: 2, company: '○○カブシキガイシャ', driver: 'アルインコ', vehicleCode: '4U', vehicleType: '4 t', plateNumber: '123', weight: 3000 },
  { id: 96, company: 'アルインコ', driver: 'テスト', vehicleCode: '2U', vehicleType: '2 t', plateNumber: '1234', weight: 99999 }
])

const selectedTruck = ref(null)
const formData = ref({
  id: '',
  company: '',
  driver: '',
  vehicleCode: '',
  vehicleType: '',
  plateNumber: '',
  weight: 0
})

const showNewModal = ref(false)
const newTruck = ref({
  company: '',
  driver: '',
  vehicleCode: '2U',
  vehicleType: '2 t',
  plateNumber: '',
  weight: 0
})

const selectTruck = (truck) => {
  selectedTruck.value = truck
  formData.value = { ...truck }
}

const saveTruck = () => {
  if (!formData.value.company || !formData.value.driver) {
    showToast('運送会社と運転手名は必須です')
    return
  }
  
  if (formData.value.id) {
    const index = truckList.value.findIndex(t => t.id === formData.value.id)
    if (index !== -1) {
      truckList.value[index] = { ...formData.value }
      showToast('トラック情報を更新しました')
    }
  } else {
    const newId = Math.max(...truckList.value.map(t => t.id), 0) + 1
    truckList.value.push({ ...formData.value, id: newId })
    showToast('トラック情報を追加しました')
  }
  formData.value = { id: '', company: '', driver: '', vehicleCode: '', vehicleType: '', plateNumber: '', weight: 0 }
  selectedTruck.value = null
}

const deleteSelectedTruck = () => {
  if (!selectedTruck.value) {
    showToast('削除するトラックを選択してください')
    return
  }
  if (confirm('このトラック情報を削除しますか？')) {
    truckList.value = truckList.value.filter(t => t.id !== selectedTruck.value.id)
    formData.value = { id: '', company: '', driver: '', vehicleCode: '', vehicleType: '', plateNumber: '', weight: 0 }
    selectedTruck.value = null
    showToast('削除しました')
  }
}

const deleteTruck = (id) => {
  if (confirm('このトラック情報を削除しますか？')) {
    truckList.value = truckList.value.filter(t => t.id !== id)
    if (selectedTruck.value?.id === id) {
      formData.value = { id: '', company: '', driver: '', vehicleCode: '', vehicleType: '', plateNumber: '', weight: 0 }
      selectedTruck.value = null
    }
    showToast('削除しました')
  }
}

const editTruck = (truck) => {
  selectTruck(truck)
}

// 新規登録モーダルを開く
const openNewModal = () => {
  // フォームを初期化
  newTruck.value = {
    company: '',
    driver: '',
    vehicleCode: '2U',
    vehicleType: '2 t',
    plateNumber: '',
    weight: 0
  }
  showNewModal.value = true
}

const closeNewModal = () => {
  showNewModal.value = false
}

const addNewTruck = () => {
  // バリデーション
  if (!newTruck.value.company || !newTruck.value.driver) {
    showToast('運送会社と運転手名は必須です')
    return
  }
  
  // 新しいIDを生成
  const newId = Math.max(...truckList.value.map(t => t.id), 0) + 1
  
  // トラックを追加
  truckList.value.push({
    ...newTruck.value,
    id: newId
  })
  
  showToast('トラック情報を登録しました')
  closeNewModal()
}
</script>

<style scoped>
.truck-master-screen {
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

.btn-add-new {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-add-new:hover {
  background: #2563eb;
}

.master-table-container {
  padding: 24px;
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

.selected {
  background: #dbeafe;
}

.font-mono {
  font-family: monospace;
}

.text-right {
  text-align: right;
}

.btn-edit, .btn-delete {
  background: none;
  border: none;
  padding: 4px 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-edit {
  color: #3b82f6;
}

.btn-edit:hover {
  color: #2563eb;
}

.btn-delete {
  color: #ef4444;
}

.btn-delete:hover {
  color: #dc2626;
}

.input-area {
  padding: 24px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.input-fields-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 20px;
  flex-wrap: wrap;
}

.input-fields {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, minmax(100px, 1fr));
  gap: 16px;
  align-items: end;
}

.input-field label {
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
  background: white;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.bg-slate-100 {
  background: #f1f5f9;
}

.button-group {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.btn-save, .btn-delete-action {
  padding: 8px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.btn-save {
  background: #475569;
  color: white;
}

.btn-save:hover {
  background: #334155;
}

.btn-delete-action {
  background: #ef4444;
  color: white;
}

.btn-delete-action:hover {
  background: #dc2626;
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
  max-width: 500px;
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

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: #475569;
  margin-bottom: 4px;
}

.required {
  color: #ef4444;
}

.form-row {
  display: flex;
  gap: 16px;
}

.flex-1 {
  flex: 1;
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
}

.btn-confirm:hover {
  background: #2563eb;
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

/* レスポンシブ対応 */
@media (max-width: 1200px) {
  .input-fields {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .input-fields-wrapper {
    flex-direction: column;
    align-items: stretch;
  }
  
  .button-group {
    justify-content: flex-end;
    margin-top: 12px;
  }
}
</style>