<template>
  <div class="reception-screen">
    <div class="reception-card">
      <div class="card-header">
        <h3><i class="fas fa-clipboard-check mr-2"></i>センター入場受付</h3>
      </div>

      <!-- ステップインジケーター -->
      <div class="step-indicator">
        <div :class="['step-item', { active: currentStep === 1, completed: currentStep > 1 }]">
          <div class="step-number">1</div>
          <div class="step-content">
            <div class="step-title">ドライバー情報</div>
            <div class="step-desc">運送会社・車両情報</div>
          </div>
        </div>
        <div class="step-arrow">
          <i class="fas fa-chevron-right"></i>
        </div>
        <div :class="['step-item', { active: currentStep === 2, completed: currentStep > 2 }]">
          <div class="step-number">2</div>
          <div class="step-content">
            <div class="step-title">現場選択</div>
            <div class="step-desc">入出荷現場の登録</div>
          </div>
        </div>
        <div class="step-arrow">
          <i class="fas fa-chevron-right"></i>
        </div>
        <div :class="['step-item', { active: currentStep === 3, completed: currentStep > 3 }]">
          <div class="step-number">3</div>
          <div class="step-content">
            <div class="step-title">入出荷情報</div>
            <div class="step-desc">伝票検索・受付完了</div>
          </div>
        </div>
      </div>

      <!-- 現在のステップ情報バー -->
      <div class="current-step-bar">
        <div class="step-status">
          <span class="step-label">現在のステップ</span>
          <span class="step-name">{{ currentStepName }}</span>
        </div>
        <div class="step-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: ((currentStep / 3) * 100) + '%' }"></div>
          </div>
          <span class="progress-text">{{ currentStep }} / 3</span>
        </div>
      </div>

      <!-- STEP 1: ドライバー情報 -->
      <div v-show="currentStep === 1" class="step-content">
        <div class="step-content-header">
          <div class="step-badge">STEP 1</div>
          <h4 class="step-content-title">ドライバー情報を入力してください</h4>
        </div>
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
            <button class="btn-primary btn-next" @click="goToStep2">
              <span>次へ：現場選択</span>
              <i class="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- STEP 2: 現場選択 -->
      <div v-show="currentStep === 2" class="step-content">
        <div class="step-content-header">
          <div class="step-badge">STEP 2</div>
          <h4 class="step-content-title">現場を選択してください</h4>
          <span class="step-content-subtitle" v-if="driverForm.company">
            運送会社: {{ driverForm.company }} | ドライバー: {{ driverForm.name }} | 車種: {{ driverForm.vehicleType }}
          </span>
        </div>
        <div class="step-nav-bar">
          <button class="btn-nav btn-nav-back" @click="goToStep1">
            <i class="fas fa-arrow-left mr-2"></i>ステップ1に戻る
          </button>
          <span class="nav-text">入出荷を行う現場を選択してください</span>
        </div>
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
        </div>
        <div class="step-actions-footer">
          <button class="btn-nav btn-nav-back" @click="goToStep1">
            <i class="fas fa-arrow-left mr-2"></i>ステップ1に戻る
          </button>
          <button class="btn-primary btn-next" @click="goToStep3">
            <span>次へ：入出荷情報</span>
            <i class="fas fa-arrow-right ml-2"></i>
          </button>
        </div>
      </div>

      <!-- STEP 3: 入出荷情報 -->
      <div v-show="currentStep === 3" class="step-content">
        <div class="step-content-header">
          <div class="step-badge">STEP 3</div>
          <h4 class="step-content-title">入出荷情報を確認・登録してください</h4>
          <span class="step-content-subtitle" v-if="selectedSitesText">
            選択現場: {{ selectedSitesText }}
          </span>
        </div>
        <div class="step-nav-bar">
          <button class="btn-nav btn-nav-back" @click="goToStep2">
            <i class="fas fa-arrow-left mr-2"></i>ステップ2に戻る
          </button>
          <span class="nav-text">伝票を検索して受付を完了してください</span>
        </div>
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
          <div class="detail-actions">
            <div class="action-group-left">
              <button class="btn-nav btn-nav-back" @click="goToStep2">
                <i class="fas fa-arrow-left mr-2"></i>現場選択に戻る
              </button>
            </div>
            <div class="action-group-right">
              <button class="btn-complete" @click="completeReception">
                <i class="fas fa-check mr-2"></i>受付完了
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
const currentStep = ref(1)

// 現在ステップの名前
const currentStepName = computed(() => {
  const names = {
    1: 'ドライバー情報',
    2: '現場選択',
    3: '入出荷情報'
  }
  return names[currentStep.value] || ''
})

// 選択された現場のテキスト表示
const selectedSitesText = computed(() => {
  const selected = sites.value.filter(site => site.selected)
  if (selected.length === 0) return ''
  if (selected.length === 1) return selected[0].siteName
  return `${selected[0].siteName} ほか${selected.length - 1}件`
})

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

const goToStep1 = () => {
  currentStep.value = 1
}

const goToStep2 = () => {
  currentStep.value = 2
  showToast('現場選択に進みました')
}

const goToStep3 = () => {
  currentStep.value = 3
  showToast('入出荷情報に進みました')
}

const selectSite = (site) => {
  site.selected = !site.selected
  showToast(site.selected ? '現場を選択しました' : '現場の選択を解除しました')
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
  // 完了後、初期状態に戻す
  setTimeout(() => {
    currentStep.value = 1
    driverForm.value = { company: '', name: '', vehicleType: '', plateNumber: '', weight: 0 }
    sites.value.forEach(site => site.selected = false)
  }, 1500)
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

.card-header {
  padding: 12px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  font-weight: bold;
  color: #1e293b;
  font-size: 1rem;
}

/* ステップインジケーター - コンパクト版 */
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  min-width: auto;
  transition: all 0.2s ease;
}

.step-item.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.step-item.completed {
  border-color: #10b981;
  background: #f0fdf4;
}

.step-number {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e2e8f0;
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.7rem;
  color: #64748b;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.step-item.active .step-number {
  background: #3b82f6;
  color: white;
}

.step-item.completed .step-number {
  background: #10b981;
  color: white;
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.step-title {
  font-weight: 500;
  font-size: 0.75rem;
  color: #1e293b;
}

.step-desc {
  font-size: 0.65rem;
  color: #94a3b8;
  display: none; /* 説明を非表示にして省スペース */
}

.step-arrow {
  color: #cbd5e1;
  font-size: 0.75rem;
}

/* 現在のステップ情報バー - コンパクト版 */
.current-step-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 16px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.step-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.step-label {
  font-size: 0.7rem;
  color: #94a3b8;
}

.step-name {
  font-weight: 600;
  color: #3b82f6;
  font-size: 0.8rem;
}

.step-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  width: 80px;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.7rem;
  color: #64748b;
  font-weight: 500;
}

.step-content {
  padding: 16px 20px;
}

/* ステップコンテンツヘッダー - コンパクト版 */
.step-content-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
  flex-wrap: wrap;
}

.step-badge {
  display: inline-block;
  width: fit-content;
  padding: 2px 8px;
  background: #3b82f6;
  color: white;
  font-size: 0.65rem;
  font-weight: 600;
  border-radius: 4px;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.step-content-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.step-content-subtitle {
  font-size: 0.8rem;
  color: #64748b;
  width: 100%;
  margin-left: 44px; /* step-badge の幅分 */
}

/* ステップナビゲーションバー */
.step-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.btn-nav {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-nav-back {
  background: white;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.btn-nav-back:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}

.nav-text {
  font-size: 0.875rem;
  color: #64748b;
  font-style: italic;
}

.step-actions-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
}

/* ドライバー情報フォーム */
.driver-form {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 12px;
  padding: 20px;
  color: white;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.form-section-left,
.form-section-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
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
  padding: 10px 14px;
  border-radius: 8px;
  border: 2px solid transparent;
  background: white;
  font-size: 0.875rem;
  color: #1e293b;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  box-shadow: 0 0 0 2px #fbbf24;
}

.company-list,
.name-list {
  background: rgba(254, 202, 202, 0.9);
  color: #991b1b;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.weight-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.weight-number {
  width: 100px;
  text-align: right;
  background: white;
  color: #1e293b;
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 10px 14px;
}

.weight-unit {
  font-size: 0.875rem;
  font-weight: 500;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.form-actions.double {
  gap: 12px;
  justify-content: flex-start;
}

.btn-primary {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #1e293b;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
}

.btn-next {
  display: inline-flex;
  align-items: center;
}

/* 現場選択 */
.site-selector {
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.site-header h3 {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.9rem;
}

.search-box {
  position: relative;
}

.search-box i {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-input {
  padding: 6px 10px 6px 32px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  width: 220px;
  font-size: 0.875rem;
}

.site-table,
.slip-table {
  overflow-x: auto;
  margin: 16px 0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}

.data-table th {
  background: #f8fafc;
  padding: 10px;
  text-align: left;
  font-weight: 600;
  color: #475569;
  border-bottom: 2px solid #e2e8f0;
}

.data-table td {
  padding: 10px;
  border-bottom: 1px solid #e2e8f0;
}

.data-table tr:hover {
  background: #f8fafc;
}

.site-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.cursor-pointer {
  cursor: pointer;
}

.text-center {
  text-align: center;
}

.w-12 {
  width: 3rem;
}

/* 入出荷情報 */
.slip-form {
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.btn-search,
.btn-print {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 0.875rem;
}

.btn-search {
  background: #e2e8f0;
  color: #1e293b;
}

.btn-search:hover {
  background: #cbd5e1;
}

.btn-print {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.btn-print:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
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

.btn-complete {
  background: #10b981;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
}

.btn-complete:hover {
  background: #059669;
}

.detail-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
}

.action-group-left,
.action-group-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-group-right {
  margin-left: auto;
}

.font-mono {
  font-family: monospace;
}

.mr-1 { margin-right: 0.25rem; }
.mr-2 { margin-right: 0.5rem; }
.ml-2 { margin-left: 0.5rem; }

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
