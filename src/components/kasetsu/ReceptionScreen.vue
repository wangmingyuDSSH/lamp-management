<template>
  <div class="reception-screen">
    <div class="reception-card">
      <!-- タブ -->
      <div class="reception-tabs">
        <div 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-btn', { active: currentTab === tab.id }]"
          @click="switchTab(tab.id)"
        >
          <i :class="tab.icon"></i> {{ tab.name }}
        </div>
      </div>

      <!-- ドライバー情報 -->
      <div v-show="currentTab === 'driver'" class="tab-content">
        <div class="driver-form">
          <div class="form-grid">
            <div class="form-section-left">
              <div class="form-field">
                <label class="form-label">(1) 運送会社 <span class="required">*</span></label>
                <input type="text" v-model="driverForm.company" class="form-input" placeholder="ウンソウカイシャ（カナ）入力">
                <div class="company-list">
                  <i class="fas fa-info-circle"></i> 社名一覧(2回目以降の方は選択して下さい) ▼
                </div>
              </div>
              <div class="form-field">
                <label class="form-label">(2) 名前(姓) <span class="required">*</span></label>
                <input type="text" v-model="driverForm.name" class="form-input" placeholder="ナマエ(姓のみ)（カナ）入力">
                <div class="name-list">
                  <i class="fas fa-info-circle"></i> 名前一覧(2回目以降の方は選択して下さい) ▼
                </div>
              </div>
            </div>
            <div class="form-section-right">
              <div class="form-field">
                <label class="form-label">(3) 車種選択 <span class="required">*</span></label>
                <select v-model="driverForm.vehicleType" class="form-select">
                  <option value="">選択してください</option>
                  <option value="2t">2 t</option>
                  <option value="3t">3 t</option>
                  <option value="4t">4 t</option>
                  <option value="6t">6 t</option>
                  <option value="8t">8 t</option>
                  <option value="10t">10 t</option>
                  <option value="ET">ET</option>
                </select>
              </div>
              <div class="form-field">
                <label class="form-label">(4) 車番入力 <span class="required">*</span></label>
                <input type="text" v-model="driverForm.plateNumber" class="form-input" placeholder="車番を入力">
              </div>
              <div class="form-field">
                <label class="form-label">積載重量</label>
                <div class="weight-input">
                  <input type="number" v-model="driverForm.weight" class="form-input weight-number" placeholder="0">
                  <span class="weight-unit">Kg</span>
                </div>
              </div>
            </div>
          </div>
          <div class="form-actions">
            <button class="btn-next" @click="switchTab('site')">
              次へ <i class="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- 現場選択 -->
      <div v-show="currentTab === 'site'" class="tab-content">
        <div class="site-selector">
          <div class="site-header">
            <h3>現場選択登録</h3>
            <div class="search-box">
              <i class="fas fa-search"></i>
              <input type="text" v-model="siteSearch" class="search-input" placeholder="現場名・コードで検索">
            </div>
          </div>
          <div class="site-table">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="w-12 text-center">選択</th>
                  <th>(コード)得意先</th>
                  <th>(コード)現場</th>
                  <th>現場住所</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="site in filteredSites" :key="site.id" @click="selectSite(site)" class="cursor-pointer">
                  <td class="text-center">
                    <input type="checkbox" v-model="site.selected" class="site-checkbox" @click.stop>
                  </td>
                  <td>{{ site.customer }}</td>
                  <td>{{ site.siteName }}</td>
                  <td>{{ site.address }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="form-actions between">
            <button class="btn-back" @click="switchTab('driver')">
              <i class="fas fa-arrow-left mr-2"></i>戻る
            </button>
            <button class="btn-next" @click="switchTab('slip')">
              次へ <i class="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- 入出荷情報 -->
      <div v-show="currentTab === 'slip'" class="tab-content">
        <div class="slip-info">
          <div class="slip-form">
            <div class="form-row">
              <div class="form-field">
                <label class="form-label">(1) 入荷/出荷</label>
                <select v-model="slipForm.ioType" class="form-select">
                  <option value="receipt">入荷</option>
                  <option value="shipment">出荷</option>
                </select>
              </div>
              <div class="form-field">
                <label class="form-label">(2) 得意先名</label>
                <input type="text" v-model="slipForm.customer" class="form-input" placeholder="得意先名（漢字orカナ）入力">
              </div>
              <div class="form-field">
                <label class="form-label">(3) 現場名</label>
                <input type="text" v-model="slipForm.site" class="form-input" placeholder="現場名（漢字orカナ）入力">
              </div>
            </div>
            <div class="form-actions double">
              <button class="btn-search" @click="searchSlips">(4) 検索</button>
              <button class="btn-print" @click="issueReceptionForm">(5) 受付表発行</button>
            </div>
          </div>
          <div class="slip-table">
            <table class="data-table">
              <thead>
                <tr>
                  <th>削除</th>
                  <th>得意先/現場</th>
                  <th>住所</th>
                  <th>明細確認</th>
                  <th>運送証明書</th>
                  <th>止め日</th>
                  <th>出荷/入荷</th>
                  <th>参照No.</th>
                  <th>現場コード</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="slip in slipList" :key="slip.id">
                  <td><button class="btn-delete-sm" @click="deleteSlip(slip.id)">削除</button></td>
                  <td>{{ slip.customer }} / {{ slip.site }}</td>
                  <td>{{ slip.address }}</td>
                  <td><button class="btn-detail" @click="showDetail(slip)">明細</button></td>
                  <td class="text-center">{{ slip.certificate }}</td>
                  <td>{{ slip.stopDate }}</td>
                  <td>{{ slip.type }}</td>
                  <td class="font-mono">{{ slip.referenceNo }}</td>
                  <td>{{ slip.siteCode }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="form-actions between">
            <button class="btn-back" @click="switchTab('site')">
              <i class="fas fa-arrow-left mr-2"></i>戻る
            </button>
            <button class="btn-complete" @click="completeReception">
              <i class="fas fa-check mr-2"></i>受付完了
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'

const showToast = inject('showToast')
const currentTab = ref('driver')

const tabs = [
  { id: 'driver', name: 'ドライバー情報', icon: 'fas fa-user' },
  { id: 'site', name: '現場選択', icon: 'fas fa-map-marker-alt' },
  { id: 'slip', name: '入出荷情報', icon: 'fas fa-file-alt' }
]

const driverForm = ref({
  company: '',
  name: '',
  vehicleType: '',
  plateNumber: '',
  weight: 0
})

const siteSearch = ref('')
const sites = ref([
  { id: 1, customer: '○○株式会社', siteName: '××現場', address: '埼玉県川越市...', selected: false },
  { id: 2, customer: '△△建設', siteName: '□□現場', address: '東京都...', selected: false },
  { id: 3, customer: '◇◇工務店', siteName: '☆☆現場', address: '神奈川県...', selected: false }
])

const filteredSites = computed(() => {
  if (!siteSearch.value) return sites.value
  return sites.value.filter(site => 
    site.customer.includes(siteSearch.value) || 
    site.siteName.includes(siteSearch.value) ||
    site.address.includes(siteSearch.value)
  )
})

const slipForm = ref({
  ioType: 'receipt',
  customer: '',
  site: ''
})

const slipList = ref([
  {
    id: 1,
    customer: '○○株式会社',
    site: '××現場',
    address: '××現場',
    certificate: 0,
    stopDate: '2024/09/05',
    type: '入荷',
    referenceNo: 'A1N163490',
    siteCode: '1234'
  }
])

const switchTab = (tab) => {
  currentTab.value = tab
}

const selectSite = (site) => {
  site.selected = !site.selected
  showToast('現場を選択しました')
}

const searchSlips = () => {
  showToast('伝票を検索しました')
}

const issueReceptionForm = () => {
  showToast('受付表を発行しました')
}

const deleteSlip = (id) => {
  slipList.value = slipList.value.filter(s => s.id !== id)
  showToast('削除しました')
}

const showDetail = (slip) => {
  showToast(`明細を表示: ${slip.referenceNo}`)
}

const completeReception = () => {
  showToast('受付を完了しました')
}
</script>

<style scoped>
.reception-screen {
  animation: fadeIn 0.3s ease;
}

.reception-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.reception-tabs {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  background: white;
  padding: 0 24px;
}

.tab-btn {
  padding: 12px 20px;
  cursor: pointer;
  font-weight: 500;
  color: #64748b;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #3b82f6;
}

.tab-btn.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.tab-content {
  padding: 24px;
}

.driver-form {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 16px;
  padding: 24px;
  color: white;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.form-section-left,
.form-section-right {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
}

.required {
  color: #fbbf24;
}

.form-input,
.form-select {
  padding: 12px 16px;
  border-radius: 12px;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  font-size: 0.875rem;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  box-shadow: 0 0 0 2px #fbbf24;
}

.company-list,
.name-list {
  background: rgba(254, 202, 202, 0.8);
  color: #991b1b;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.weight-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.weight-number {
  width: 120px;
  text-align: right;
}

.weight-unit {
  font-size: 1rem;
  font-weight: 500;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

.form-actions.between {
  justify-content: space-between;
}

.form-actions.double {
  gap: 16px;
  justify-content: flex-start;
}

.btn-next {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #1e293b;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-next:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
}

.btn-back {
  background: white;
  border: 1px solid #cbd5e1;
  padding: 10px 20px;
  border-radius: 12px;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #f8fafc;
}

.btn-search,
.btn-print {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-search {
  background: #e2e8f0;
  color: #1e293b;
  border: none;
}

.btn-search:hover {
  background: #cbd5e1;
}

.btn-print {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
}

.btn-print:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-complete {
  background: #10b981;
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-complete:hover {
  background: #059669;
}

.btn-delete-sm {
  background: none;
  border: 1px solid #ef4444;
  color: #ef4444;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-delete-sm:hover {
  background: #ef4444;
  color: white;
}

.btn-detail {
  background: none;
  border: 1px solid #3b82f6;
  color: #3b82f6;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-detail:hover {
  background: #3b82f6;
  color: white;
}

.site-selector {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.site-header h3 {
  font-weight: bold;
  color: #1e293b;
}

.search-box {
  position: relative;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-input {
  padding: 8px 12px 8px 36px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  width: 240px;
}

.site-table,
.slip-table {
  overflow-x: auto;
  margin: 20px 0;
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

.data-table tr:hover {
  background: #f8fafc;
}

.site-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.slip-form {
  background: #f8fafc;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.font-mono {
  font-family: monospace;
}

.text-center {
  text-align: center;
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
</style>