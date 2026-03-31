<template>
  <div class="maintenance-screen">
    <div class="screen-card">
      <div class="card-header">
        <h3><i class="fas fa-tools mr-2"></i>整備振替入力</h3>
      </div>

      <!-- 検索バー -->
      <div class="search-bar">
        <div class="search-wrapper">
          <input 
            type="text" 
            v-model="searchKeyword" 
            class="search-input" 
            placeholder="検索キーワード"
            @keyup.enter="searchItems"
          >
          <button class="btn-filter" @click="searchItems">絞込</button>
        </div>
        <label class="checkbox-label">
          <input type="checkbox" v-model="showAll" class="mr-2">
          <span>全品番表示</span>
        </label>
        <button class="btn-layout" @click="openLayoutModal">
          <i class="fas fa-sliders-h mr-2"></i>レイアウト
        </button>
      </div>

      <!-- 品目一覧 -->
      <div class="items-container">
        <table class="items-table">
          <thead>
            <tr>
              <th v-if="layoutSettings.showName">品名+色</th>
              <th v-if="layoutSettings.showCode">品番</th>
              <th v-if="layoutSettings.showNewQty" class="text-red-600">新規数</th>
              <th v-if="layoutSettings.showInputQty">入力済み</th>
              <th>チェック</th>
              <th>入力可能</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="item in filteredItems" 
              :key="item.code"
              class="hover-row"
            >
              <td v-if="layoutSettings.showName">{{ item.name }}</td>
              <td v-if="layoutSettings.showCode" class="font-mono">{{ item.code }}</td>
              <td v-if="layoutSettings.showNewQty" class="text-right">
                <input 
                  type="number" 
                  v-model="item.newQty" 
                  class="qty-input" 
                  min="0" 
                  @click.stop
                >
              </td>
              <td v-if="layoutSettings.showInputQty" class="text-right">{{ item.inputQty }}</td>
              <td class="text-center">
                <input 
                  type="checkbox" 
                  v-model="item.checked" 
                  class="item-checkbox" 
                  @click.stop
                >
              </td>
              <td class="text-center">
                <button class="btn-detail" @click.stop="openDetailModal(item)">
                  明細
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- アクション -->
      <div class="action-buttons">
        <button class="btn-add-item" @click="openAddItemModal">
          <i class="fas fa-plus mr-2"></i>品番追加
        </button>
        <button class="btn-update" @click="updateItems">
          <i class="fas fa-save mr-2"></i>更新
        </button>
      </div>
    </div>

    <!-- 整備振替品番一覧モーダル -->
    <div v-if="showDetailModal" class="modal-overlay active" @click.self="closeDetailModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3><i class="fas fa-list-alt mr-2"></i>整備振替品番一覧</h3>
          <button class="modal-close" @click="closeDetailModal">×</button>
        </div>
        <div class="modal-body">
          <div class="item-info-badge">
            <span>品番: <strong class="font-mono">{{ currentItem?.code }}</strong></span>
            <span>品名: <strong>{{ currentItem?.name }}</strong></span>
          </div>
          <div class="detail-table-container">
            <table class="detail-table">
              <thead>
                <tr>
                  <th>品番SEQ</th>
                  <th class="text-right">振替数</th>
                  <th class="text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(seq, index) in detailItems" :key="index">
                  <td>
                    <input 
                      type="text" 
                      v-model="seq.seq" 
                      class="seq-input" 
                      placeholder="SEQ"
                    >
                  </td>
                  <td class="text-right">
                    <input 
                      type="number" 
                      v-model="seq.qty" 
                      class="qty-input-detail" 
                      min="0"
                    >
                  </td>
                  <td class="text-center">
                    <button 
                      class="btn-delete-row" 
                      @click="deleteDetailItem(index)"
                      title="削除"
                    >
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <button class="btn-add-row" @click="addDetailItem">
              <i class="fas fa-plus mr-1"></i>行追加
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeDetailModal">閉じる</button>
          <button class="btn-save" @click="saveDetailItems">保存</button>
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
            <input 
              type="text" 
              v-model="newItem.code" 
              class="form-input" 
              placeholder="品番を入力"
            >
          </div>
          <div class="form-group">
            <label>品名 <span class="required">*</span></label>
            <input 
              type="text" 
              v-model="newItem.name" 
              class="form-input" 
              placeholder="品名を入力"
            >
          </div>
          <div class="form-group">
            <label>初期新規数</label>
            <input 
              type="number" 
              v-model="newItem.newQty" 
              class="form-input text-right" 
              min="0"
            >
          </div>
          <div class="form-group">
            <label>初期入力済み数</label>
            <input 
              type="number" 
              v-model="newItem.inputQty" 
              class="form-input text-right" 
              min="0"
            >
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeAddItemModal">キャンセル</button>
          <button class="btn-confirm" @click="addNewItem">追加</button>
        </div>
      </div>
    </div>

    <!-- レイアウト設定モーダル -->
    <div v-if="showLayoutModal" class="modal-overlay active" @click.self="closeLayoutModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3><i class="fas fa-sliders-h mr-2"></i>レイアウト設定</h3>
          <button class="modal-close" @click="closeLayoutModal">×</button>
        </div>
        <div class="modal-body">
          <div class="layout-options">
            <label class="checkbox-label">
              <input type="checkbox" v-model="layoutSettings.showCode">
              <span>品番表示</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="layoutSettings.showName">
              <span>品名表示</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="layoutSettings.showNewQty">
              <span>新規数表示</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="layoutSettings.showInputQty">
              <span>入力済み表示</span>
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeLayoutModal">キャンセル</button>
          <button class="btn-save" @click="saveLayoutSettings">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'

const showToast = inject('showToast')

// 検索関連
const searchKeyword = ref('')
const showAll = ref(false)

// モーダル表示フラグ
const showDetailModal = ref(false)
const showLayoutModal = ref(false)
const showAddItemModal = ref(false)

// 選択中のアイテム
const currentItem = ref(null)

// レイアウト設定
const layoutSettings = ref({
  showCode: true,
  showName: true,
  showNewQty: true,
  showInputQty: true
})

// 品目リスト
const items = ref([
  { code: 'AA1411', name: '手摺枠', newQty: 0, inputQty: 1, checked: false },
  { code: 'AA1412', name: '手摺支柱', newQty: 0, inputQty: 0, checked: false },
  { code: 'BB2233', name: '足場板', newQty: 0, inputQty: 0, checked: false }
])

// 明細リスト
const detailItems = ref([
  { seq: '00', qty: 1 }
])

// 新規品番
const newItem = ref({
  code: '',
  name: '',
  newQty: 0,
  inputQty: 0,
  checked: false
})

// フィルタリング
const filteredItems = computed(() => {
  let result = items.value
  if (!showAll.value) {
    result = result.filter(item => item.inputQty > 0 || item.newQty > 0)
  }
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(item => 
      item.code.toLowerCase().includes(keyword) || 
      item.name.toLowerCase().includes(keyword)
    )
  }
  return result
})

// 検索処理
const searchItems = () => {
  if (searchKeyword.value) {
    const resultCount = filteredItems.value.length
    showToast(`${resultCount}件の品番が見つかりました`)
  } else {
    showToast('絞り込みを解除しました')
  }
}

// 明細モーダル関連
const openDetailModal = (item) => {
  currentItem.value = item
  // 既存の明細データを読み込む（実際はAPIから取得）
  detailItems.value = [
    { seq: '00', qty: 1 },
    { seq: '01', qty: 0 }
  ]
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  currentItem.value = null
}

const addDetailItem = () => {
  detailItems.value.push({ seq: '', qty: 0 })
  showToast('行を追加しました')
}

const deleteDetailItem = (index) => {
  if (confirm('この明細行を削除しますか？')) {
    detailItems.value.splice(index, 1)
    showToast('削除しました')
  }
}

const saveDetailItems = () => {
  // バリデーション
  const invalidItems = detailItems.value.filter(item => !item.seq && item.qty > 0)
  if (invalidItems.length > 0) {
    showToast('SEQが未入力の明細があります')
    return
  }
  showToast('明細情報を保存しました')
  closeDetailModal()
}

// 品番追加モーダル関連
const openAddItemModal = () => {
  newItem.value = {
    code: '',
    name: '',
    newQty: 0,
    inputQty: 0,
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
  
  const exists = items.value.some(item => item.code === newItem.value.code)
  if (exists) {
    showToast('この品番は既に登録されています')
    return
  }
  
  items.value.push({ ...newItem.value })
  showToast(`品番 ${newItem.value.code} を追加しました`)
  closeAddItemModal()
}

// レイアウト設定関連
const openLayoutModal = () => {
  showLayoutModal.value = true
}

const closeLayoutModal = () => {
  showLayoutModal.value = false
}

const saveLayoutSettings = () => {
  showToast('レイアウト設定を保存しました')
  closeLayoutModal()
}

// 更新処理
const updateItems = () => {
  const checkedItems = items.value.filter(item => item.checked)
  if (checkedItems.length > 0) {
    showToast(`${checkedItems.length}件の項目がチェックされています`)
  }
  showToast('整備振替情報を更新しました')
}
</script>

<style scoped>
.maintenance-screen {
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

.screen-badge {
  font-size: 0.75rem;
  color: #64748b;
}

.search-bar {
  padding: 20px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.search-wrapper {
  flex: 1;
  display: flex;
  gap: 12px;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.875rem;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.btn-filter {
  padding: 8px 16px;
  background: #475569;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-filter:hover {
  background: #334155;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 0.875rem;
}

.checkbox-label input {
  cursor: pointer;
}

.btn-layout {
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

.btn-layout:hover {
  background: #2563eb;
}

.items-container {
  padding: 20px 24px;
  overflow-x: auto;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.items-table th {
  background: #f8fafc;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
}

.items-table td {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.hover-row:hover {
  background: #eff6ff;
  cursor: pointer;
}

.font-mono {
  font-family: monospace;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.text-red-600 {
  color: #ef4444;
}

.qty-input {
  width: 80px;
  padding: 4px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  text-align: right;
}

.qty-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.item-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.btn-detail {
  background: none;
  border: 1px solid #3b82f6;
  color: #3b82f6;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-detail:hover {
  background: #3b82f6;
  color: white;
}

.action-buttons {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
}

.btn-add-item {
  padding: 8px 16px;
  background: #e2e8f0;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-add-item:hover {
  background: #cbd5e1;
}

.btn-update {
  padding: 8px 24px;
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

.btn-update:hover {
  background: #2563eb;
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
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.item-info-badge strong {
  color: #1e293b;
}

.detail-table-container {
  overflow-x: auto;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.detail-table th,
.detail-table td {
  padding: 10px;
  border: 1px solid #e2e8f0;
  text-align: left;
}

.detail-table th {
  background: #f8fafc;
  font-weight: 600;
}

.seq-input {
  width: 80px;
  padding: 4px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-family: monospace;
}

.seq-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.qty-input-detail {
  width: 80px;
  padding: 4px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  text-align: right;
}

.qty-input-detail:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.btn-delete-row {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 4px 8px;
  transition: all 0.2s;
}

.btn-delete-row:hover {
  color: #dc2626;
}

.btn-add-row {
  margin-top: 12px;
  padding: 6px 12px;
  background: #e2e8f0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.btn-add-row:hover {
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

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.875rem;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

/* レイアウト設定モーダル用 */
.layout-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel,
.btn-close {
  padding: 8px 20px;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover,
.btn-close:hover {
  background: #f1f5f9;
}

.btn-save,
.btn-confirm {
  padding: 8px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover,
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
</style>