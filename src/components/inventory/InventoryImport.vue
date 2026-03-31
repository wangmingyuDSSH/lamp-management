<!-- src/components/inventory/InventoryImport.vue -->
<template>
  <div class="inventory-import">
    <div class="screen-card">
      <div class="card-header">
        <div>
          <h3><i class="fas fa-file-import mr-2"></i>棚卸結果取込・棚卸調整</h3>
          <p class="header-subtitle">実施した棚卸結果を取り込み、在庫調整を行います</p>
        </div>
      </div>

      <div class="import-container">
        <!-- 左側：ファイルアップロード -->
        <div class="upload-panel">
          <div 
            class="upload-area"
            :class="{ 'drag-over': isDragOver }"
            @dragover.prevent="isDragOver = true"
            @dragleave.prevent="isDragOver = false"
            @drop.prevent="handleDrop"
            @click="triggerFileInput"
          >
            <input 
              type="file" 
              ref="fileInput"
              class="hidden-input" 
              accept=".csv,.xlsx,.xls"
              @change="handleFileSelect"
            >
            <div class="upload-icon">
              <i class="fas fa-cloud-upload-alt"></i>
            </div>
            <p class="upload-text">ファイルをドラッグ＆ドロップ</p>
            <p class="upload-subtext">またはクリックして選択</p>
            <p class="upload-note">CSV, Excel形式対応（最大10,000件）</p>
          </div>

          <div class="spec-section">
            <h4><i class="fas fa-info-circle text-blue-500 mr-2"></i>取込仕様</h4>
            <ul>
              <li>文字コード: UTF-8</li>
              <li>区切り文字: カンマ（CSV）</li>
              <li>必須項目: 品番, エリア, 実地数量</li>
              <li>最大件数: 10,000件/ファイル</li>
              <li>取込でエラーがあれば通知されます</li>
            </ul>
          </div>

          <div class="action-buttons">
            <button class="btn-template" @click="downloadTemplate">
              <i class="fas fa-file-csv mr-2 text-green-600"></i>テンプレートDL
            </button>
            <button class="btn-history" @click="showHistory">
              <i class="fas fa-history mr-2 text-blue-600"></i>取込履歴
            </button>
          </div>
        </div>

        <!-- 右側：取込ステータス / プレビュー -->
        <div class="status-panel">
          <div class="status-header">
            <h4>取込ステータス</h4>
            <span :class="['status-tag', importStatus.class]">{{ importStatus.text }}</span>
          </div>

          <div v-if="!uploadedFile" class="status-empty">
            <i class="fas fa-file-import fa-4x text-slate-300 mb-3"></i>
            <p>ファイルをアップロードすると</p>
            <p>プレビューと検証結果が表示されます</p>
          </div>

          <div v-else class="preview-section">
            <div class="file-info">
              <i class="fas fa-file-excel text-green-600 mr-2"></i>
              <span class="file-name">{{ uploadedFile.name }}</span>
              <span class="file-size">({{ formatFileSize(uploadedFile.size) }})</span>
              <button class="btn-remove" @click="clearFile">×</button>
            </div>

            <div class="preview-stats">
              <div class="stat-item">
                <span class="stat-label">総件数:</span>
                <span class="stat-value">{{ previewData.total }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">正常:</span>
                <span class="stat-value text-green-600">{{ previewData.valid }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">エラー:</span>
                <span class="stat-value text-red-600">{{ previewData.errors }}</span>
              </div>
            </div>

            <div v-if="previewData.errors > 0" class="error-list">
              <h5>エラー内容</h5>
              <div v-for="err in previewData.errorList" :key="err.row" class="error-item">
                <span class="error-row">行 {{ err.row }}:</span>
                <span class="error-msg">{{ err.message }}</span>
              </div>
            </div>

            <div class="preview-table-container">
              <table class="preview-table">
                <thead>
                  <tr>
                    <th>品番</th>
                    <th>品名</th>
                    <th>エリア</th>
                    <th class="text-right">システム在庫</th>
                    <th class="text-right">棚卸数</th>
                    <th class="text-center">状態</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in previewData.items.slice(0, 10)" :key="item.row">
                    <td class="font-mono">{{ item.code }}</td>
                    <td>{{ item.name }}</td>
                    <td>{{ item.area }}</td>
                    <td class="text-right">{{ item.systemQty }}</td>
                    <td class="text-right font-bold">{{ item.actualQty }}</td>
                    <td class="text-center">
                      <span :class="['status-badge', item.status === 'ok' ? 'status-success' : 'status-error']">
                        {{ item.status === 'ok' ? 'OK' : 'NG' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p v-if="previewData.items.length > 10" class="preview-more">
                他 {{ previewData.items.length - 10 }} 件を表示しています...
              </p>
            </div>

            <div class="import-actions">
              <button class="btn-import" @click="executeImport" :disabled="previewData.errors > 0">
                <i class="fas fa-upload mr-2"></i>取込実行
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 在庫調整セクション -->
      <div class="adjust-section">
        <div class="adjust-header">
          <h4><i class="fas fa-balance-scale text-amber-500 mr-2"></i>在庫調整</h4>
          <div class="adjust-actions">
            <button class="btn-filter" @click="openFilterModal">
              <i class="fas fa-filter mr-1"></i>フィルタ
            </button>
            <button class="btn-sort" @click="toggleSort">
              <i class="fas fa-sort mr-1"></i>並び替え
            </button>
          </div>
        </div>

        <div class="adjust-alert">
          <i class="fas fa-exclamation-triangle text-amber-500 mr-2"></i>
          <span>調整対象: <strong class="text-red-600">{{ filteredDiffItems.length }}</strong>件</span>
          <span class="mx-2">|</span>
          <span>一致: <strong class="text-green-600">{{ matchCount }}</strong>件</span>
        </div>

        <div class="adjust-table-container">
          <table class="adjust-table">
            <thead>
              <tr>
                <th>品番</th>
                <th>品名</th>
                <th>エリア</th>
                <th class="text-right">システム在庫</th>
                <th class="text-right">棚卸数</th>
                <th class="text-center">差異</th>
                <th>理由</th>
                <th class="text-center">調整</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredDiffItems" :key="item.code" :class="{ 'diff-row': item.diff !== 0 }">
                <td class="font-mono">{{ item.code }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.area }}</td>
                <td class="text-right">{{ item.systemQty }}</td>
                <td class="text-right font-bold">{{ item.actualQty }}</td>
                <td class="text-center">
                  <span :class="['diff-badge', item.diff > 0 ? 'diff-plus' : 'diff-minus']">
                    {{ item.diff > 0 ? '+' : '' }}{{ item.diff }}
                  </span>
                </td>
                <td>
                  <select v-model="item.reason" class="reason-select">
                    <option value="">選択</option>
                    <option value="damage">破損</option>
                    <option value="loss">紛失</option>
                    <option value="misregister">誤登録</option>
                    <option value="return_miss">返却漏れ</option>
                    <option value="other">その他</option>
                  </select>
                </td>
                <td class="text-center">
                  <button 
                    class="btn-adjust-item" 
                    @click="adjustItem(item)"
                    :disabled="!item.reason"
                  >
                    <i class="fas fa-check mr-1"></i>調整
                  </button>
                </td>
              </tr>
              <tr v-if="filteredDiffItems.length === 0" class="no-data">
                <td colspan="8" class="text-center">調整対象はありません</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="adjust-footer">
          <button class="btn-batch-adjust" @click="batchAdjust" :disabled="filteredDiffItems.length === 0">
            <i class="fas fa-undo mr-2"></i>一括調整
          </button>
          <button class="btn-confirm" @click="confirmAdjustments" :disabled="filteredDiffItems.length === 0">
            <i class="fas fa-save mr-2"></i>確定して連携
          </button>
        </div>
      </div>
    </div>

    <!-- 取込履歴モーダル -->
    <Teleport to="body">
      <div v-if="showHistoryModal" class="modal-overlay" @click="closeHistoryModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>取込履歴</h3>
            <button class="modal-close" @click="closeHistoryModal">×</button>
          </div>
          <div class="modal-body">
            <div class="history-list">
              <div v-for="log in importHistory" :key="log.id" class="history-item">
                <div class="history-date">{{ log.date }}</div>
                <div class="history-file">{{ log.fileName }}</div>
                <div class="history-stats">
                  <span>総件数: {{ log.total }}</span>
                  <span class="text-green-600">成功: {{ log.success }}</span>
                  <span class="text-red-600">失敗: {{ log.fail }}</span>
                </div>
                <div :class="['history-status', log.status === 'success' ? 'status-success' : 'status-error']">
                  {{ log.status === 'success' ? '成功' : '失敗' }}
                </div>
              </div>
              <div v-if="importHistory.length === 0" class="history-empty">
                取込履歴はありません
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-close" @click="closeHistoryModal">閉じる</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- フィルタモーダル -->
    <Teleport to="body">
      <div v-if="showFilterModal" class="modal-overlay" @click="closeFilterModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>フィルタ設定</h3>
            <button class="modal-close" @click="closeFilterModal">×</button>
          </div>
          <div class="modal-body">
            <div class="filter-form">
              <div class="filter-field">
                <label>エリア</label>
                <select v-model="filterOptions.area">
                  <option value="">すべて</option>
                  <option value="A">エリアA</option>
                  <option value="B">エリアB</option>
                  <option value="C">エリアC</option>
                  <option value="D">エリアD</option>
                </select>
              </div>
              <div class="filter-field">
                <label>差異タイプ</label>
                <select v-model="filterOptions.diffType">
                  <option value="">すべて</option>
                  <option value="plus">増加のみ</option>
                  <option value="minus">減少のみ</option>
                </select>
              </div>
              <div class="filter-field">
                <label>品番</label>
                <input type="text" v-model="filterOptions.itemCode" placeholder="品番で絞り込み">
              </div>
              <div class="filter-field">
                <label>理由ステータス</label>
                <select v-model="filterOptions.reasonStatus">
                  <option value="">すべて</option>
                  <option value="selected">理由選択済み</option>
                  <option value="unselected">理由未選択</option>
                </select>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-reset" @click="resetFilter">リセット</button>
            <button class="btn-apply" @click="applyFilter">適用</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 一括調整確認モーダル -->
    <Teleport to="body">
      <div v-if="showBatchConfirmModal" class="modal-overlay" @click="closeBatchConfirmModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>一括調整確認</h3>
            <button class="modal-close" @click="closeBatchConfirmModal">×</button>
          </div>
          <div class="modal-body">
            <div class="confirm-message">
              <i class="fas fa-exclamation-triangle text-amber-500 text-2xl mb-3"></i>
              <p>{{ filteredDiffItems.length }}件の調整を一括で実行します。</p>
              <p class="text-sm text-slate-500 mt-2">この操作は元に戻せません。</p>
            </div>
            <div class="confirm-list">
              <div v-for="item in filteredDiffItems" :key="item.code" class="confirm-item">
                <span class="font-mono">{{ item.code }}</span>
                <span>{{ item.name }}</span>
                <span :class="item.diff > 0 ? 'text-green-600' : 'text-red-600'">
                  {{ item.diff > 0 ? '+' : '' }}{{ item.diff }}
                </span>
                <span class="text-slate-500 text-xs">(理由: {{ getReasonText(item.reason) }})</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeBatchConfirmModal">キャンセル</button>
            <button class="btn-confirm" @click="executeBatchAdjust">実行</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'

const showToast = inject('showToast')

// アップロード関連
const fileInput = ref(null)
const isDragOver = ref(false)
const uploadedFile = ref(null)
const importStatus = ref({ text: '待機中', class: 'status-waiting' })

// プレビューデータ
const previewData = ref({
  total: 0,
  valid: 0,
  errors: 0,
  errorList: [],
  items: []
})

// 調整対象データ
const diffItems = ref([])
const matchCount = ref(0)

// フィルタ
const showFilterModal = ref(false)
const filterOptions = ref({
  area: '',
  diffType: '',
  itemCode: '',
  reasonStatus: ''
})

// フィルタリング後の差異データ
const filteredDiffItems = computed(() => {
  let result = diffItems.value
  if (filterOptions.value.area) {
    result = result.filter(item => item.area === filterOptions.value.area)
  }
  if (filterOptions.value.diffType === 'plus') {
    result = result.filter(item => item.diff > 0)
  }
  if (filterOptions.value.diffType === 'minus') {
    result = result.filter(item => item.diff < 0)
  }
  if (filterOptions.value.itemCode) {
    result = result.filter(item => item.code.includes(filterOptions.value.itemCode))
  }
  if (filterOptions.value.reasonStatus === 'selected') {
    result = result.filter(item => item.reason && item.reason !== '')
  }
  if (filterOptions.value.reasonStatus === 'unselected') {
    result = result.filter(item => !item.reason || item.reason === '')
  }
  return result
})

// 履歴
const showHistoryModal = ref(false)
const importHistory = ref([
  { id: 1, date: '2026/03/23 10:30:25', fileName: 'inventory_20260323.csv', total: 156, success: 152, fail: 4, status: 'success' },
  { id: 2, date: '2026/03/22 09:15:42', fileName: 'inventory_20260322.xlsx', total: 203, success: 203, fail: 0, status: 'success' },
  { id: 3, date: '2026/03/21 14:20:10', fileName: 'inventory_20260321.csv', total: 98, success: 95, fail: 3, status: 'fail' },
  { id: 4, date: '2026/03/20 16:45:30', fileName: 'inventory_20260320.csv', total: 245, success: 240, fail: 5, status: 'success' }
])

// 一括調整確認モーダル
const showBatchConfirmModal = ref(false)

// サンプルデータ生成
const generateSamplePreviewData = () => {
  return {
    total: 23,
    valid: 20,
    errors: 3,
    errorList: [
      { row: 5, message: '品番が不正です' },
      { row: 12, message: '数量が数値ではありません' },
      { row: 18, message: 'エリアコードが不正です' }
    ],
    items: [
      { row: 1, code: 'ABC-001', name: '鋼製足場板 300×1800', area: 'A', systemQty: 150, actualQty: 150, status: 'ok' },
      { row: 2, code: 'ABC-015', name: '鋼製足場板 400×1800', area: 'A', systemQty: 12, actualQty: 8, status: 'ok' },
      { row: 3, code: 'XYZ-888', name: '単管パイプ 48.6×3.5', area: 'B', systemQty: 200, actualQty: 200, status: 'ok' },
      { row: 4, code: 'DEF-222', name: 'ジャッキ 油圧式 5t', area: 'C', systemQty: 10, actualQty: 7, status: 'ok' },
      { row: 5, code: 'INVALID', name: '????', area: 'X', systemQty: 0, actualQty: 5, status: 'error' },
      { row: 6, code: 'ABC-032', name: '鋼製足場板 250×1500', area: 'A', systemQty: 85, actualQty: 85, status: 'ok' },
      { row: 7, code: 'XYZ-112', name: 'コ型クランプ 48.6', area: 'B', systemQty: 50, actualQty: 52, status: 'ok' },
      { row: 8, code: 'DEF-333', name: 'ジャッキ 油圧式 3t', area: 'C', systemQty: 5, actualQty: 5, status: 'ok' },
      { row: 9, code: 'ABC-045', name: '足場パネル', area: 'A', systemQty: 30, actualQty: 28, status: 'ok' },
      { row: 10, code: 'XYZ-999', name: '単管クランプ', area: 'B', systemQty: 120, actualQty: 118, status: 'ok' }
    ]
  }
}

// 調整データの初期化
const initAdjustmentData = () => {
  return [
    { code: 'ABC-015', name: '鋼製足場板 400×1800', area: 'A', systemQty: 12, actualQty: 8, diff: -4, reason: '' },
    { code: 'DEF-222', name: 'ジャッキ 油圧式 5t', area: 'C', systemQty: 10, actualQty: 7, diff: -3, reason: 'loss' },
    { code: 'XYZ-112', name: 'コ型クランプ 48.6', area: 'B', systemQty: 50, actualQty: 52, diff: 2, reason: '' },
    { code: 'ABC-045', name: '足場パネル', area: 'A', systemQty: 30, actualQty: 28, diff: -2, reason: '' },
    { code: 'XYZ-999', name: '単管クランプ', area: 'B', systemQty: 120, actualQty: 118, diff: -2, reason: 'damage' }
  ]
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getReasonText = (reason) => {
  const reasonMap = {
    damage: '破損',
    loss: '紛失',
    misregister: '誤登録',
    return_miss: '返却漏れ',
    other: 'その他'
  }
  return reasonMap[reason] || reason
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
}

const handleDrop = (event) => {
  isDragOver.value = false
  const file = event.dataTransfer.files[0]
  if (file) {
    processFile(file)
  }
}

const processFile = (file) => {
  uploadedFile.value = file
  importStatus.value = { text: '検証中...', class: 'status-loading' }
  
  // ファイル解析シミュレーション
  setTimeout(() => {
    previewData.value = generateSamplePreviewData()
    
    if (previewData.value.errors > 0) {
      importStatus.value = { text: 'エラーあり', class: 'status-error' }
      showToast('ファイルにエラーがあります。詳細を確認してください。', 'error')
    } else {
      importStatus.value = { text: '検証完了', class: 'status-success' }
      showToast('ファイルの検証が完了しました')
    }
    
    // 調整データをセット
    diffItems.value = initAdjustmentData()
    matchCount.value = previewData.value.valid - diffItems.value.length
  }, 800)
}

const clearFile = () => {
  uploadedFile.value = null
  previewData.value = { total: 0, valid: 0, errors: 0, errorList: [], items: [] }
  importStatus.value = { text: '待機中', class: 'status-waiting' }
  diffItems.value = []
  matchCount.value = 0
  if (fileInput.value) fileInput.value.value = ''
}

const executeImport = () => {
  if (previewData.value.errors > 0) {
    showToast('エラーがあるため取込を実行できません', 'error')
    return
  }
  
  importStatus.value = { text: '取込中...', class: 'status-loading' }
  
  setTimeout(() => {
    importStatus.value = { text: '取込完了', class: 'status-success' }
    showToast(`${previewData.value.valid}件の棚卸結果を取り込みました`)
    
    // 取込履歴に追加
    importHistory.value.unshift({
      id: Date.now(),
      date: new Date().toLocaleString(),
      fileName: uploadedFile.value.name,
      total: previewData.value.total,
      success: previewData.value.valid,
      fail: previewData.value.errors,
      status: previewData.value.errors > 0 ? 'fail' : 'success'
    })
  }, 1500)
}

const downloadTemplate = () => {
  // CSVテンプレート作成
  const headers = ['品番', '品名', 'エリア', '実地数量', '備考']
  const sampleRows = [
    ['ABC-001', '鋼製足場板 300×1800', 'A', '150', ''],
    ['ABC-015', '鋼製足場板 400×1800', 'A', '8', ''],
    ['XYZ-888', '単管パイプ 48.6×3.5', 'B', '200', '']
  ]
  
  const csvContent = [
    headers.join(','),
    ...sampleRows.map(row => row.join(','))
  ].join('\n')
  
  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.href = url
  link.setAttribute('download', 'inventory_template.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  showToast('テンプレートをダウンロードしました')
}

const showHistory = () => {
  showHistoryModal.value = true
}

const closeHistoryModal = () => {
  showHistoryModal.value = false
}

const openFilterModal = () => {
  showFilterModal.value = true
}

const closeFilterModal = () => {
  showFilterModal.value = false
}

const resetFilter = () => {
  filterOptions.value = {
    area: '',
    diffType: '',
    itemCode: '',
    reasonStatus: ''
  }
}

const applyFilter = () => {
  closeFilterModal()
  showToast('フィルタを適用しました')
}

const toggleSort = () => {
  // 差異の大きい順にソート
  diffItems.value.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
  showToast('差異の大きい順に並び替えました')
}

const adjustItem = (item) => {
  if (!item.reason) {
    showToast('理由を選択してください', 'error')
    return
  }
  
  // 調整後リストから削除
  const index = diffItems.value.findIndex(i => i.code === item.code)
  if (index !== -1) {
    diffItems.value.splice(index, 1)
    matchCount.value++
    showToast(`${item.code} を調整しました`)
  }
}

const batchAdjust = () => {
  const unassigned = filteredDiffItems.value.filter(i => !i.reason)
  if (unassigned.length > 0) {
    showToast(`理由が未選択の項目が ${unassigned.length} 件あります`, 'error')
    return
  }
  
  showBatchConfirmModal.value = true
}

const closeBatchConfirmModal = () => {
  showBatchConfirmModal.value = false
}

const executeBatchAdjust = () => {
  const adjustedCount = filteredDiffItems.value.length
  // 調整対象を一括削除
  filteredDiffItems.value.forEach(item => {
    const index = diffItems.value.findIndex(i => i.code === item.code)
    if (index !== -1) {
      diffItems.value.splice(index, 1)
    }
  })
  matchCount.value += adjustedCount
  
  showBatchConfirmModal.value = false
  showToast(`${adjustedCount}件を一括調整しました`)
}

const confirmAdjustments = () => {
  const unassigned = diffItems.value.filter(i => !i.reason)
  if (unassigned.length > 0) {
    showToast(`理由が未選択の項目が ${unassigned.length} 件あります`, 'error')
    return
  }
  
  if (diffItems.value.length === 0) {
    showToast('調整対象はありません', 'error')
    return
  }
  
  showToast(`${diffItems.value.length}件の調整を確定し、システム連携しました`)
  
  // 確定後、調整リストをクリア
  diffItems.value = []
  matchCount.value = previewData.value.valid
}
</script>

<style scoped>
.inventory-import {
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

.header-subtitle {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 4px;
}

.import-container {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.upload-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.upload-area {
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafcff;
}

.upload-area:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.upload-area.drag-over {
  border-color: #3b82f6;
  background: #eff6ff;
}

.hidden-input {
  display: none;
}

.upload-icon i {
  font-size: 3rem;
  color: #94a3b8;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 4px;
}

.upload-subtext {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 8px;
}

.upload-note {
  font-size: 0.7rem;
  color: #94a3b8;
}

.spec-section {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
}

.spec-section h4 {
  font-size: 0.75rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
}

.spec-section ul {
  list-style: disc;
  padding-left: 20px;
  font-size: 0.7rem;
  color: #475569;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.btn-template, .btn-history {
  flex: 1;
  padding: 8px 12px;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-template:hover, .btn-history:hover {
  background: #f1f5f9;
}

.status-panel {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.status-header h4 {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.875rem;
}

.status-tag {
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 500;
}

.status-waiting {
  background: #e2e8f0;
  color: #475569;
}

.status-loading {
  background: #fef3c7;
  color: #92400e;
  animation: pulse 1.5s infinite;
}

.status-success {
  background: #d1fae5;
  color: #065f46;
}

.status-error {
  background: #fee2e2;
  color: #991b1b;
}

.status-empty {
  text-align: center;
  padding: 48px 20px;
  color: #94a3b8;
}

.preview-section {
  animation: fadeIn 0.3s ease;
}

.file-info {
  background: #ecfdf5;
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-name {
  font-size: 0.75rem;
  font-weight: 500;
  color: #1e293b;
}

.file-size {
  font-size: 0.65rem;
  color: #64748b;
}

.btn-remove {
  margin-left: auto;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 1rem;
  padding: 0 4px;
}

.btn-remove:hover {
  color: #ef4444;
}

.preview-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  padding: 12px;
  background: white;
  border-radius: 8px;
}

.stat-item {
  font-size: 0.75rem;
}

.stat-label {
  color: #64748b;
  margin-right: 8px;
}

.stat-value {
  font-weight: bold;
  color: #1e293b;
}

.error-list {
  background: #fef2f2;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.error-list h5 {
  font-size: 0.7rem;
  font-weight: 600;
  color: #991b1b;
  margin-bottom: 8px;
}

.error-item {
  font-size: 0.7rem;
  padding: 4px 0;
}

.error-row {
  font-weight: 500;
  color: #991b1b;
}

.error-msg {
  color: #7f1a1a;
  margin-left: 8px;
}

.preview-table-container {
  overflow-x: auto;
  margin-bottom: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.7rem;
}

.preview-table th {
  background: #e2e8f0;
  padding: 8px;
  text-align: left;
  font-weight: 600;
  position: sticky;
  top: 0;
}

.preview-table td {
  padding: 6px 8px;
  border-bottom: 1px solid #e2e8f0;
}

.preview-more {
  font-size: 0.65rem;
  color: #64748b;
  text-align: center;
  padding: 8px;
}

.import-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-import {
  padding: 8px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.btn-import:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.adjust-section {
  padding: 24px;
}

.adjust-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.adjust-header h4 {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.875rem;
}

.adjust-actions {
  display: flex;
  gap: 8px;
}

.btn-filter, .btn-sort {
  padding: 4px 10px;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.7rem;
  cursor: pointer;
}

.btn-filter:hover, .btn-sort:hover {
  background: #f1f5f9;
}

.adjust-alert {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 10px 16px;
  margin-bottom: 20px;
  font-size: 0.75rem;
  color: #92400e;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.mx-2 {
  margin-left: 8px;
  margin-right: 8px;
}

.adjust-table-container {
  overflow-x: auto;
  margin-bottom: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.adjust-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
}

.adjust-table th {
  background: #f8fafc;
  padding: 10px;
  text-align: left;
  font-weight: 600;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  background: #f8fafc;
}

.adjust-table td {
  padding: 10px;
  border-bottom: 1px solid #e2e8f0;
}

.diff-row {
  background: #fef3c7;
}

.diff-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.7rem;
}

.diff-plus {
  background: #dbeafe;
  color: #1e40af;
}

.diff-minus {
  background: #fee2e2;
  color: #991b1b;
}

.reason-select {
  padding: 4px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 0.7rem;
  width: 100px;
}

.btn-adjust-item {
  padding: 4px 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-adjust-item:hover:not(:disabled) {
  background: #2563eb;
}

.btn-adjust-item:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.adjust-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.btn-batch-adjust {
  padding: 8px 20px;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-batch-adjust:hover:not(:disabled) {
  background: #f1f5f9;
}

.btn-batch-adjust:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-confirm {
  padding: 8px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-confirm:hover:not(:disabled) {
  background: #2563eb;
}

.btn-confirm:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.no-data {
  color: #94a3b8;
  padding: 40px;
  text-align: center;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.text-green-600 {
  color: #10b981;
}

.text-red-600 {
  color: #ef4444;
}

.text-amber-500 {
  color: #f59e0b;
}

.font-mono {
  font-family: monospace;
}

/* モーダルスタイル */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 16px 16px 0 0;
}

.modal-header h3 {
  color: white;
  font-weight: bold;
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
  max-height: calc(80vh - 120px);
  overflow-y: auto;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: white;
  border-radius: 0 0 16px 16px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.history-date {
  font-size: 0.7rem;
  color: #64748b;
  font-family: monospace;
}

.history-file {
  flex: 1;
  font-size: 0.75rem;
  font-weight: 500;
}

.history-stats {
  font-size: 0.7rem;
  display: flex;
  gap: 12px;
}

.history-status {
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 500;
}

.history-empty {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
}

.filter-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-field label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #475569;
}

.filter-field select,
.filter-field input {
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.75rem;
}

.btn-reset, .btn-apply {
  padding: 6px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-reset {
  background: white;
  border: 1px solid #cbd5e1;
}

.btn-apply {
  background: #3b82f6;
  color: white;
  border: none;
}

.btn-cancel, .btn-close {
  padding: 8px 20px;
  background: #e2e8f0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.confirm-message {
  text-align: center;
  padding: 20px;
}

.confirm-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-top: 16px;
}

.confirm-item {
  display: flex;
  gap: 12px;
  padding: 8px 12px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.75rem;
}

.confirm-item:last-child {
  border-bottom: none;
}

.text-xs {
  font-size: 0.65rem;
}

.text-slate-500 {
  color: #64748b;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
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