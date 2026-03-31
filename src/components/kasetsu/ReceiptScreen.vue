<template>
  <div class="receipt-screen">
    <div class="screen-card">
      <!-- 第1层：入荷伝票一覧 -->
      <div v-if="currentLayer === 'list'" class="list-layer">
        <div class="card-header">
          <h3><i class="fas fa-clipboard-list mr-2"></i>入荷伝票一覧</h3>
        </div>

        <!-- フィルター -->
        <div class="filter-section">
          <div class="filter-grid">
            <div class="filter-field">
              <label>倉庫</label>
              <select v-model="filters.warehouse" class="form-select">
                <option>センターA</option>
                <option>センターB</option>
                <option>大阪センター</option>
              </select>
            </div>
            <div class="filter-field">
              <label>入荷日(From)</label>
              <input type="date" v-model="filters.dateFrom" class="form-input">
            </div>
            <div class="filter-field">
              <label>入荷日(To)</label>
              <input type="date" v-model="filters.dateTo" class="form-input">
            </div>
            <div class="filter-field">
              <label>得意先</label>
              <input type="text" v-model="filters.customer" class="form-input" placeholder="名称/コード">
            </div>
            <div class="filter-field">
              <label>運送会社</label>
              <input type="text" v-model="filters.carrier" class="form-input" placeholder="カナ">
            </div>
            <div class="filter-field">
              <button class="btn-search" @click="searchReceipts">
                <i class="fas fa-search mr-2"></i>検索
              </button>
            </div>
          </div>
        </div>

        <!-- 伝票一覧 -->
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>入荷No.</th>
                <th>入荷日</th>
                <th>得意先</th>
                <th>現場</th>
                <th>運送会社(運転手)</th>
                <th>受付</th>
                <th>入場時間</th>
                <th>退場時間</th>
                <th>未検収</th>
                <th>修/能</th>
              </tr>
              </thead>
            <tbody>
              <tr 
                v-for="slip in receiptList" 
                :key="slip.no"
                class="hover-row"
                @click="openWorkLayer(slip)"
              >
                <td class="font-mono text-blue-600 underline">{{ slip.no }}</td>
                <td class="font-mono">{{ slip.date }}</td>
                <td class="whitespace-pre-line">{{ slip.customer }}</td>
                <td class="whitespace-pre-line">{{ slip.site }}</td>
                <td>{{ slip.carrier }}</td>
                <td>{{ slip.reception }}</td>
                <td>{{ slip.entryTime }}</td>
                <td>{{ slip.exitTime }}</td>
                <td class="text-red-600">{{ slip.uninspected }}</td>
                <td>{{ slip.repair }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="list-footer">
          <span class="status-badge status-info">受付済＆作業未済</span>
        </div>
      </div>

      <!-- 第2层：入荷/検収作業 -->
      <div v-else class="work-layer">
        <div class="work-header">
          <button class="btn-back" @click="backToList">
            <i class="fas fa-arrow-left mr-2"></i>一覧へ戻る
          </button>
          <h3><i class="fas fa-clipboard-list mr-2"></i>入荷/検収作業</h3>
        </div>

        <!-- 作業情報 -->
        <div class="work-info">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">得意先名:</span>
              <span class="info-value">{{ currentSlip?.customer }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">現場名:</span>
              <span class="info-value">{{ currentSlip?.site }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">入荷No:</span>
              <span class="info-value font-mono">{{ currentSlip?.no }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">タブレット止め日:</span>
              <span class="info-value">{{ tabletStopDate }}</span>
            </div>
          </div>
        </div>

        <!-- 表示グループ -->
        <div class="display-group">
          <span class="group-label">表示グループ:</span>
          <select v-model="displayGroup" class="form-select-sm">
            <option value="all">全品番表示</option>
            <option value="uninspected">未検収のみ</option>
          </select>
        </div>

        <!-- 品目一覧 -->
        <div class="items-container">
          <table class="items-table">
            <thead>
              <tr>
                <th>品名+色</th>
                <th>品番</th>
                <th>借入先名</th>
                <th>貸出中</th>
                <th class="text-red-600">返却数</th>
                <th>(不能数)</th>
                <th>修理/不能</th>
                <th>未検</th>
                <th>検収済</th>
                <th>計算</th>
              </tr>
              </thead>
            <tbody>
              <tr v-for="item in filteredWorkItems" :key="item.code">
                <td>{{ item.name }}</td>
                <td class="font-mono">{{ item.code }}</td>
                <td>{{ item.borrower }}</td>
                <td class="text-right">{{ item.loanQty }}</td>
                <td class="text-right">
                  <input type="number" v-model="item.returnQty" class="qty-input-sm" min="0">
                </td>
                <td class="text-right">{{ item.damageQty }}</td>
                <td class="text-center">
                  <button class="btn-repair" @click="openDamageRepairModal(item)">
                    入力
                  </button>
                </td>
                <td class="text-center">
                  <input type="checkbox" v-model="item.uninspected" class="item-checkbox">
                </td>
                <td class="text-center">
                  <button class="btn-checked" @click="markAsChecked(item)">
                    <i class="fas fa-check"></i>
                  </button>
                </td>
                <td class="text-center">
                  <button class="btn-calc" @click="openReturnQtyModal(item)">
                    計算
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- アクションボタン -->
        <div class="work-actions">
          <button class="btn-add-item" @click="openAddItemModal">
            <i class="fas fa-plus mr-2"></i>品番追加
          </button>
          <button class="btn-rereturn" @click="openRereturnModal">
            <i class="fas fa-undo mr-2"></i>再リース返却
          </button>
          <button class="btn-uninspected-info" @click="openUninspectedInfoModal">
            <i class="fas fa-exclamation-circle mr-2"></i>未検収情報
          </button>
          <button class="btn-camera" @click="openCamera">
            <i class="fas fa-camera mr-2"></i>カメラ
          </button>
          <button class="btn-complete" @click="completeWork">
            <i class="fas fa-check mr-2"></i>作業完了
          </button>
        </div>
      </div>
    </div>

    <!-- 不能／修理情報モーダル -->
    <div v-if="showDamageRepairModal" class="modal-overlay active" @click.self="closeDamageRepairModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3><i class="fas fa-tools mr-2"></i>不能／修理情報</h3>
          <button class="modal-close" @click="closeDamageRepairModal">×</button>
        </div>
        <div class="modal-body">
          <div class="item-info-badge">
            <span>品番: <strong class="font-mono">{{ currentItem?.code }}</strong></span>
            <span>品名: <strong>{{ currentItem?.name }}</strong></span>
          </div>

          <!-- 不能セクション -->
          <div class="damage-section">
            <h4>不能</h4>
            <div class="damage-rows">
              <div v-for="(damage, idx) in damageList" :key="idx" class="damage-row">
                <select v-model="damage.type" class="form-select-sm">
                  <option value="">-</option>
                  <option value="bent">曲がり</option>
                  <option value="broken">破損</option>
                  <option value="rust">腐食</option>
                </select>
                <input type="number" v-model="damage.qty" class="qty-input-sm" min="0">
                <button class="btn-photo" @click="takeDamagePhoto(idx)">
                  <i class="fas fa-camera mr-1"></i> 撮影
                </button>
                <button v-if="damage.photo" class="btn-photo-preview" @click="previewPhoto(damage.photo)">
                  <i class="fas fa-eye"></i>
                </button>
              </div>
              <button class="btn-add-row" @click="addDamageItem">
                <i class="fas fa-plus mr-1"></i>不能項目追加
              </button>
            </div>
          </div>

          <!-- 修理セクション -->
          <div class="repair-section">
            <h4>修理</h4>
            <div class="repair-rows">
              <div v-for="(repair, idx) in repairList" :key="idx" class="repair-row">
                <span class="repair-name">{{ repair.name }}</span>
                <input type="number" v-model="repair.qty" class="qty-input-sm" min="0">
                <button class="btn-photo" @click="takeRepairPhoto(idx)">
                  <i class="fas fa-camera mr-1"></i> 撮影
                </button>
                <button v-if="repair.photo" class="btn-photo-preview" @click="previewPhoto(repair.photo)">
                  <i class="fas fa-eye"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn-camera-all" @click="openPhotoCheck">
              <i class="fas fa-images mr-2"></i>修理不能写真確認
            </button>
            <button class="btn-cancel" @click="closeDamageRepairModal">閉じる</button>
            <button class="btn-save" @click="saveDamageRepair">更新</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 返却数入力モーダル -->
    <div v-if="showReturnQtyModal" class="modal-overlay active" @click.self="closeReturnQtyModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3><i class="fas fa-calculator mr-2"></i>返却数入力</h3>
          <button class="modal-close" @click="closeReturnQtyModal">×</button>
        </div>
        <div class="modal-body">
          <div class="item-info-badge">
            <span>{{ currentItem?.code }} {{ currentItem?.name }}</span>
            <p class="info-text mt-2">返却数に加算する数量を入力してください。</p>
          </div>
          <div class="qty-grid">
            <div v-for="i in 12" :key="i" class="qty-grid-item">
              <label class="qty-label">{{ i }}</label>
              <input 
                type="number" 
                v-model="returnQtys[i-1]" 
                class="qty-input-grid"
                min="0"
                @input="updateTotalReturnQty"
              >
            </div>
          </div>
          <div class="total-summary">
            <span>合計: <span class="total-value">{{ totalReturnQty }}</span></span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeReturnQtyModal">閉じる</button>
          <button class="btn-save" @click="saveReturnQty">保存</button>
        </div>
      </div>
    </div>

    <!-- 未検収情報モーダル -->
    <div v-if="showUninspectedInfoModal" class="modal-overlay active" @click.self="closeUninspectedInfoModal">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h3><i class="fas fa-exclamation-triangle mr-2"></i>未検収情報入力</h3>
          <button class="modal-close" @click="closeUninspectedInfoModal">×</button>
        </div>
        <div class="modal-body">
          <div class="info-header">
            <div>入荷No: <span class="font-mono font-bold">{{ currentSlip?.no }}</span></div>
            <div>倉庫: <span>{{ currentSlip?.warehouse || '312' }}</span></div>
            <div>
              <select v-model="labelOption" class="form-select-sm">
                <option value="print">未検ラベル発行</option>
                <option value="reprint">再発行</option>
              </select>
            </div>
            <button class="btn-print-label" @click="printLabel">未検ラベル発行</button>
          </div>

          <div class="item-summary">
            <table class="summary-table">
              <thead>
                <tr><th>品番</th><th>品名</th><th>数量</th><th>単位</th><th>ラベル枚数</th></tr>
              </thead>
              <tbody>
                <tr v-for="item in uninspectedItems" :key="item.code">
                  <td class="font-mono">{{ item.code }}</td>
                  <td>{{ item.name }}</td>
                  <td class="text-right">{{ item.qty }}</td>
                  <td>{{ item.unit }}</td>
                  <td class="text-right">{{ item.labelCount }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="uninspected-input">
            <h4>未検収内容入力</h4>
            <div v-for="(detail, idx) in uninspectedDetails" :key="idx" class="uninspected-row">
              <select v-model="detail.type" class="form-select-sm">
                <option value="">-</option>
                <option value="damage">破損</option>
                <option value="loss">紛失</option>
                <option value="other">その他</option>
              </select>
              <input type="text" v-model="detail.description" class="form-input-sm" placeholder="内容を入力">
              <input type="number" v-model="detail.qty" class="qty-input-sm" min="0">
              <select v-model="detail.unit" class="form-select-sm">
                <option value="">-</option>
                <option value="個">個</option>
                <option value="本">本</option>
                <option value="枚">枚</option>
              </select>
              <input type="number" v-model="detail.labelCount" class="qty-input-sm bg-slate-100" readonly>
              <span class="label-count">{{ detail.labelCount }}</span>
              <button class="btn-delete-row" @click="deleteUninspectedDetail(idx)">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
            <button class="btn-add-row" @click="addUninspectedDetail">
              <i class="fas fa-plus mr-1"></i>行追加
            </button>
          </div>

          <div class="modal-footer">
            <span>発行枚数: <span class="font-bold text-blue-600">{{ totalUninspectedLabelCount }}</span></span>
            <div class="footer-buttons">
              <button class="btn-cancel" @click="closeUninspectedInfoModal">閉じる</button>
              <button class="btn-save" @click="saveUninspectedInfo">更新</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 再リース返却モーダル -->
    <div v-if="showRereturnModal" class="modal-overlay active" @click.self="closeRereturnModal">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h3><i class="fas fa-undo-alt mr-2"></i>再リース返却情報入力</h3>
          <button class="modal-close" @click="closeRereturnModal">×</button>
        </div>
        <div class="modal-body">
          <div class="info-header">
            <div>入荷No: <span class="font-mono font-bold">{{ currentSlip?.no }}</span></div>
            <div>倉庫: <span>{{ currentSlip?.warehouse || '312' }}</span></div>
            <div>
              <select v-model="rereturnLabelOption" class="form-select-sm">
                <option value="print">未検ラベル発行</option>
                <option value="reprint">再発行</option>
              </select>
            </div>
            <button class="btn-print-label" @click="printRereturnLabel">未検ラベル発行</button>
          </div>
          
          <div class="item-summary">
            <table class="summary-table">
              <thead>
                <tr><th>再リース品番</th><th>再リース品名</th><th>数量</th><th>単位</th><th>ラベル枚数</th></tr>
              </thead>
              <tbody>
                <tr v-for="item in rereturnItems" :key="item.code">
                  <td class="font-mono">{{ item.code }}</td>
                  <td>{{ item.name }}</td>
                  <td class="text-right">{{ item.qty }}</td>
                  <td>{{ item.unit }}</td>
                  <td class="text-right">{{ item.labelCount }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="rereturn-input">
            <h4>再リース返却内容</h4>
            <div v-for="(detail, idx) in rereturnDetails" :key="idx" class="rereturn-row">
              <select v-model="detail.type" class="form-select-sm">
                <option value="">-</option>
                <option value="rereturn">再リース</option>
                <option value="purchase">買取</option>
              </select>
              <input type="text" v-model="detail.description" class="form-input-sm" placeholder="内容を入力">
              <input type="number" v-model="detail.qty" class="qty-input-sm" min="0">
              <select v-model="detail.unit" class="form-select-sm">
                <option value="">-</option>
                <option value="個">個</option>
                <option value="本">本</option>
                <option value="枚">枚</option>
              </select>
              <span class="label-count">{{ detail.qty || 0 }}</span>
              <button class="btn-delete-row" @click="deleteRereturnDetail(idx)">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
            <button class="btn-add-row" @click="addRereturnDetail">
              <i class="fas fa-plus mr-1"></i>行追加
            </button>
          </div>

          <div class="modal-footer">
            <span>発行枚数: <span class="font-bold text-blue-600">{{ totalRereturnLabelCount }}</span></span>
            <div class="footer-buttons">
              <button class="btn-cancel" @click="closeRereturnModal">閉じる</button>
              <button class="btn-save" @click="saveRereturnInfo">更新</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 品番追加モーダル -->
    <div v-if="showAddItemModal" class="modal-overlay active" @click.self="closeAddItemModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3><i class="fas fa-plus mr-2"></i>品番追加</h3>
          <button class="modal-close" @click="closeAddItemModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>品番 <span class="required">*</span></label>
            <input type="text" v-model="newItem.code" class="form-input" placeholder="品番を入力">
          </div>
          <div class="form-group">
            <label>品名 <span class="required">*</span></label>
            <input type="text" v-model="newItem.name" class="form-input" placeholder="品名を入力">
          </div>
          <div class="form-group">
            <label>借入先</label>
            <input type="text" v-model="newItem.borrower" class="form-input" placeholder="借入先">
          </div>
          <div class="form-group">
            <label>貸出中数量</label>
            <input type="number" v-model="newItem.loanQty" class="form-input text-right" min="0">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeAddItemModal">キャンセル</button>
          <button class="btn-confirm" @click="addNewItem">追加</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'

const showToast = inject('showToast')

const currentLayer = ref('list')
const currentSlip = ref(null)
const displayGroup = ref('all')
const tabletStopDate = ref('2024/08/22')

const filters = ref({
  warehouse: 'センターA',
  dateFrom: '2024-09-06',
  dateTo: '2024-09-06',
  customer: '',
  carrier: ''
})

const receiptList = ref([
  {
    no: 'A1N163385',
    date: '20240906',
    customer: '(123456)ア\nル',
    site: '(7890)テス\nト現場',
    carrier: 'Aカイシャ(ナマエ)',
    reception: '2',
    entryTime: '10:29:01',
    exitTime: '',
    uninspected: '',
    repair: '',
    warehouse: '312',
    items: [
      { code: 'ALASLE', name: 'アルミサガオ 主材 左', borrower: '', loanQty: 1, returnQty: 0, damageQty: 0, uninspected: false, checked: false },
      { code: 'ALASRE', name: 'アルミサガオ 主材 右', borrower: '', loanQty: 1, returnQty: 0, damageQty: 0, uninspected: false, checked: false }
    ]
  },
  {
    no: 'A1N163386',
    date: '20240906',
    customer: '(123456)ア\nル',
    site: '(7890)テス\nト現場',
    carrier: 'Aカイシャ(ナマエ)',
    reception: '2',
    entryTime: '10:30:15',
    exitTime: '',
    uninspected: '未検\n残有',
    repair: '',
    warehouse: '312',
    items: []
  }
])

const workItems = computed(() => currentSlip.value?.items || [])
const filteredWorkItems = computed(() => {
  if (displayGroup.value === 'uninspected') {
    return workItems.value.filter(item => item.uninspected)
  }
  return workItems.value
})

// 不能／修理モーダル関連
const showDamageRepairModal = ref(false)
const currentItem = ref(null)

const createEmptyDamage = () => ({ type: '', qty: 0, photo: null })
const damageList = ref([createEmptyDamage()])

const repairList = ref([
  { name: 'メクレン', qty: 0, photo: null },
  { name: '特別メクレン', qty: 0, photo: null },
  { name: '6"ボルト取替(1)', qty: 0, photo: null },
  { name: 'リベット取替', qty: 0, photo: null }
])

const openDamageRepairModal = (item) => {
  currentItem.value = item
  damageList.value = [createEmptyDamage()]
  repairList.value = repairList.value.map(r => ({ ...r, qty: 0, photo: null }))
  showDamageRepairModal.value = true
}

const closeDamageRepairModal = () => {
  showDamageRepairModal.value = false
  currentItem.value = null
}

const addDamageItem = () => {
  damageList.value.push(createEmptyDamage())
  showToast('不能項目を追加しました')
}

const takeDamagePhoto = (index) => {
  const dummyPhotoUrl = `https://via.placeholder.com/100x100?text=Damage+${index + 1}`
  damageList.value[index].photo = dummyPhotoUrl
  showToast(`不能写真 ${index + 1} を撮影しました`)
}

const takeRepairPhoto = (index) => {
  const dummyPhotoUrl = `https://via.placeholder.com/100x100?text=Repair+${index + 1}`
  repairList.value[index].photo = dummyPhotoUrl
  showToast(`修理写真 ${index + 1} を撮影しました`)
}

const previewPhoto = (photoUrl) => {
  window.open(photoUrl, '_blank')
}

const openPhotoCheck = () => {
  showToast('修理不能写真確認画面を開きます')
}

const saveDamageRepair = () => {
  const totalDamage = damageList.value.reduce((sum, d) => sum + (Number(d.qty) || 0), 0)
  const totalRepair = repairList.value.reduce((sum, r) => sum + (Number(r.qty) || 0), 0)
  if (totalDamage > 0 || totalRepair > 0) {
    showToast(`不能:${totalDamage}件, 修理:${totalRepair}件を保存しました`)
  } else {
    showToast('不能／修理情報を保存しました')
  }
  closeDamageRepairModal()
}

// 返却数入力モーダル関連
const showReturnQtyModal = ref(false)
const returnQtys = ref(Array(12).fill(0))
const totalReturnQty = ref(0)

const updateTotalReturnQty = () => {
  totalReturnQty.value = returnQtys.value.reduce((a, b) => a + (Number(b) || 0), 0)
}

const openReturnQtyModal = (item) => {
  currentItem.value = item
  returnQtys.value = Array(12).fill(0)
  totalReturnQty.value = 0
  showReturnQtyModal.value = true
}

const closeReturnQtyModal = () => {
  showReturnQtyModal.value = false
}

const saveReturnQty = () => {
  if (totalReturnQty.value > 0 && currentItem.value) {
    currentItem.value.returnQty = (Number(currentItem.value.returnQty) || 0) + totalReturnQty.value
    showToast(`返却数 ${totalReturnQty.value} を ${currentItem.value.name} に加算しました`)
  }
  closeReturnQtyModal()
}

// 未検収情報モーダル関連
const showUninspectedInfoModal = ref(false)
const labelOption = ref('print')
const uninspectedItems = ref([
  { code: 'ALASLE', name: 'アルミサガオ 主材 左', qty: 1, unit: '個', labelCount: 0 }
])

const createEmptyUninspectedDetail = () => ({
  type: '',
  description: '',
  qty: 0,
  unit: '',
  labelCount: 0
})

const uninspectedDetails = ref([createEmptyUninspectedDetail()])
const totalUninspectedLabelCount = computed(() => {
  return uninspectedDetails.value.reduce((sum, d) => sum + (Number(d.qty) || 0), 0)
})

const openUninspectedInfoModal = () => {
  uninspectedDetails.value = [createEmptyUninspectedDetail()]
  labelOption.value = 'print'
  showUninspectedInfoModal.value = true
}

const closeUninspectedInfoModal = () => {
  showUninspectedInfoModal.value = false
}

const addUninspectedDetail = () => {
  uninspectedDetails.value.push(createEmptyUninspectedDetail())
  showToast('行を追加しました')
}

const deleteUninspectedDetail = (index) => {
  if (confirm('この行を削除しますか？')) {
    uninspectedDetails.value.splice(index, 1)
    showToast('削除しました')
  }
}

const printLabel = () => {
  if (totalUninspectedLabelCount.value === 0) {
    showToast('発行するラベルがありません')
    return
  }
  showToast(`未検ラベルを ${totalUninspectedLabelCount.value} 枚発行します`)
}

const saveUninspectedInfo = () => {
  const validDetails = uninspectedDetails.value.filter(d => d.type && d.qty > 0)
  if (validDetails.length === 0 && uninspectedDetails.value.length > 0) {
    if (uninspectedDetails.value.every(d => !d.type && !d.qty)) {
      showToast('未検収内容を入力してください')
      return
    }
  }
  showToast('未検収情報を保存しました')
  closeUninspectedInfoModal()
}

// 再リース返却モーダル関連
const showRereturnModal = ref(false)
const rereturnLabelOption = ref('print')
const rereturnItems = ref([
  { code: 'ALASLE', name: 'アルミサガオ 主材 左', qty: 1, unit: '個', labelCount: 0 }
])

const createEmptyRereturnDetail = () => ({
  type: '',
  description: '',
  qty: 0,
  unit: ''
})

const rereturnDetails = ref([createEmptyRereturnDetail()])
const totalRereturnLabelCount = computed(() => {
  return rereturnDetails.value.reduce((sum, d) => sum + (Number(d.qty) || 0), 0)
})

const openRereturnModal = () => {
  rereturnDetails.value = [createEmptyRereturnDetail()]
  rereturnLabelOption.value = 'print'
  showRereturnModal.value = true
}

const closeRereturnModal = () => {
  showRereturnModal.value = false
}

const addRereturnDetail = () => {
  rereturnDetails.value.push(createEmptyRereturnDetail())
  showToast('行を追加しました')
}

const deleteRereturnDetail = (index) => {
  if (confirm('この行を削除しますか？')) {
    rereturnDetails.value.splice(index, 1)
    showToast('削除しました')
  }
}

const printRereturnLabel = () => {
  if (totalRereturnLabelCount.value === 0) {
    showToast('発行するラベルがありません')
    return
  }
  showToast(`再リース返却ラベルを ${totalRereturnLabelCount.value} 枚発行します`)
}

const saveRereturnInfo = () => {
  const validDetails = rereturnDetails.value.filter(d => d.type && d.qty > 0)
  if (validDetails.length === 0 && rereturnDetails.value.length > 0) {
    if (rereturnDetails.value.every(d => !d.type && !d.qty)) {
      showToast('再リース返却内容を入力してください')
      return
    }
  }
  showToast('再リース返却情報を保存しました')
  closeRereturnModal()
}

// 品番追加モーダル関連
const showAddItemModal = ref(false)
const newItem = ref({
  code: '',
  name: '',
  borrower: '',
  loanQty: 0,
  returnQty: 0,
  damageQty: 0,
  uninspected: false,
  checked: false
})

const openAddItemModal = () => {
  newItem.value = {
    code: '',
    name: '',
    borrower: '',
    loanQty: 0,
    returnQty: 0,
    damageQty: 0,
    uninspected: false,
    checked: false
  }
  showAddItemModal.value = true
}

const closeAddItemModal = () => {
  showAddItemModal.value = false
}

const addNewItem = () => {
  if (!newItem.value.code) {
    showToast('品番を入力してください')
    return
  }
  if (!newItem.value.name) {
    showToast('品名を入力してください')
    return
  }
  
  if (currentSlip.value) {
    const exists = currentSlip.value.items.some(item => item.code === newItem.value.code)
    if (exists) {
      showToast('この品番は既に登録されています')
      return
    }
    currentSlip.value.items.push({ ...newItem.value })
    showToast(`品番 ${newItem.value.code} を追加しました`)
  }
  closeAddItemModal()
}

// その他の関数
const searchReceipts = () => {
  showToast('入荷伝票を検索しました')
}

const openWorkLayer = (slip) => {
  currentSlip.value = slip
  currentLayer.value = 'work'
  showToast(`伝票 ${slip.no} の入荷作業を開始します`)
}

const backToList = () => {
  currentLayer.value = 'list'
  currentSlip.value = null
}

const markAsChecked = (item) => {
  item.checked = true
  showToast(`${item.name} を検収済みにしました`)
}

const openCamera = () => {
  showToast('カメラを起動します')
}

const completeWork = () => {
  if (confirm('入荷作業を完了しますか？')) {
    showToast('入荷作業を完了しました')
    backToList()
  }
}
</script>

<style scoped>
/* 既存のスタイルは維持し、追加分のみ記述 */

.receipt-screen {
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

.filter-section {
  padding: 20px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  align-items: end;
}

.filter-field label {
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
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.form-select-sm, .form-input-sm {
  padding: 4px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 0.75rem;
}

.form-select-sm:focus, .form-input-sm:focus {
  outline: none;
  border-color: #3b82f6;
}

.btn-search {
  width: 100%;
  padding: 8px 12px;
  background: #475569;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-search:hover {
  background: #334155;
}

.table-container {
  padding: 0 24px 20px;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
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

.hover-row:hover {
  background: #eff6ff;
  cursor: pointer;
}

.font-mono {
  font-family: monospace;
}

.text-blue-600 {
  color: #3b82f6;
}

.text-red-600 {
  color: #ef4444;
}

.underline {
  text-decoration: underline;
}

.whitespace-pre-line {
  white-space: pre-line;
}

.list-footer {
  padding: 12px 24px 24px;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.7rem;
}

.status-info {
  background: #d1fae5;
  color: #065f46;
}

.work-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.work-header h3 {
  font-weight: bold;
  color: #1e293b;
}

.btn-back {
  padding: 6px 12px;
  background: #e2e8f0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #cbd5e1;
}

.work-info {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  gap: 8px;
}

.info-label {
  font-size: 0.7rem;
  color: #64748b;
}

.info-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
}

.display-group {
  padding: 12px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.group-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #475569;
}

.items-container {
  padding: 20px 24px;
  overflow-x: auto;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
}

.items-table th {
  background: #f8fafc;
  padding: 10px;
  text-align: left;
  font-weight: 600;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
}

.items-table td {
  padding: 10px;
  border-bottom: 1px solid #e2e8f0;
}

.qty-input-sm {
  width: 70px;
  padding: 4px 6px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  text-align: right;
}

.qty-input-sm:focus {
  outline: none;
  border-color: #3b82f6;
}

.item-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.btn-repair, .btn-checked, .btn-calc {
  background: none;
  border: 1px solid;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.65rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-repair {
  border-color: #3b82f6;
  color: #3b82f6;
}

.btn-repair:hover {
  background: #3b82f6;
  color: white;
}

.btn-checked {
  border-color: #10b981;
  color: #10b981;
}

.btn-checked:hover {
  background: #10b981;
  color: white;
}

.btn-calc {
  border-color: #f59e0b;
  color: #f59e0b;
}

.btn-calc:hover {
  background: #f59e0b;
  color: white;
}

.work-actions {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-add-item, .btn-rereturn, .btn-uninspected-info, .btn-camera, .btn-complete {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.btn-add-item {
  background: #e2e8f0;
  border: none;
}

.btn-add-item:hover {
  background: #cbd5e1;
}

.btn-rereturn {
  background: #f59e0b;
  color: white;
  border: none;
}

.btn-rereturn:hover {
  background: #d97706;
}

.btn-uninspected-info {
  background: #fee2e2;
  color: #991b1b;
  border: none;
}

.btn-uninspected-info:hover {
  background: #fecaca;
}

.btn-camera {
  background: linear-gradient(135deg, #64748b, #475569);
  color: white;
  border: none;
}

.btn-camera:hover {
  background: linear-gradient(135deg, #475569, #334155);
}

.btn-complete {
  background: #10b981;
  color: white;
  border: none;
  margin-left: auto;
}

.btn-complete:hover {
  background: #059669;
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
  max-width: 600px;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-large {
  max-width: 800px;
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
  max-height: calc(85vh - 70px);
  overflow-y: auto;
}

.item-info-badge {
  background: #f8fafc;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.item-info-badge strong {
  color: #1e293b;
}

.info-text {
  font-size: 0.7rem;
  color: #64748b;
}

.mt-2 {
  margin-top: 8px;
}

.damage-section, .repair-section {
  margin-bottom: 24px;
}

.damage-section h4, .repair-section h4 {
  font-weight: 600;
  margin-bottom: 12px;
  font-size: 0.875rem;
}

.damage-row, .repair-row {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.damage-row select, .repair-row select {
  width: 120px;
}

.btn-photo, .btn-photo-preview {
  background: #475569;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-photo:hover, .btn-photo-preview:hover {
  background: #334155;
}

.btn-photo-preview {
  background: #3b82f6;
}

.btn-photo-preview:hover {
  background: #2563eb;
}

.btn-add-row {
  margin-top: 8px;
  padding: 4px 12px;
  background: #e2e8f0;
  border: none;
  border-radius: 4px;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.btn-add-row:hover {
  background: #cbd5e1;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.qty-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  margin: 16px 0;
}

.qty-grid-item {
  text-align: center;
}

.qty-label {
  display: block;
  font-size: 0.7rem;
  color: #64748b;
  margin-bottom: 4px;
}

.qty-input-grid {
  width: 100%;
  padding: 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  text-align: center;
}

.qty-input-grid:focus {
  outline: none;
  border-color: #3b82f6;
}

.total-summary {
  text-align: right;
  font-size: 0.875rem;
  margin-top: 12px;
}

.total-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: #3b82f6;
}

.info-header {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.btn-print-label {
  padding: 4px 12px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.7rem;
  transition: all 0.2s;
}

.btn-print-label:hover {
  background: #dc2626;
}

.summary-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
  margin-bottom: 20px;
}

.summary-table th, .summary-table td {
  border: 1px solid #e2e8f0;
  padding: 8px;
  text-align: left;
}

.summary-table th {
  background: #f8fafc;
  font-weight: 600;
}

.uninspected-input h4, .rereturn-input h4 {
  font-weight: 600;
  margin-bottom: 12px;
  font-size: 0.875rem;
}

.uninspected-row, .rereturn-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.uninspected-row select:first-child, .rereturn-row select:first-child {
  width: 90px;
}

.uninspected-row input[type="text"], .rereturn-row input[type="text"] {
  width: 150px;
}

.label-count {
  width: 30px;
  text-align: center;
  font-size: 0.75rem;
  color: #475569;
}

.btn-delete-row {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 4px;
  transition: all 0.2s;
}

.btn-delete-row:hover {
  color: #dc2626;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.footer-buttons {
  display: flex;
  gap: 12px;
}

.btn-cancel {
  padding: 6px 16px;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f1f5f9;
}

.btn-save, .btn-confirm {
  padding: 6px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover, .btn-confirm:hover {
  background: #2563eb;
}

.btn-camera-all {
  padding: 6px 16px;
  background: #e2e8f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-camera-all:hover {
  background: #cbd5e1;
}

/* 品番追加モーダル用 */
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

.bg-slate-100 {
  background: #f1f5f9;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.font-bold {
  font-weight: bold;
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