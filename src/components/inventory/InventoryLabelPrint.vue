<template>
  <div class="inventory-label-print">
    <div class="screen-card">
      <div class="card-header">
        <h3><i class="fas fa-print mr-2"></i>付箋ラベル出力</h3>
        <p class="header-subtitle">棚卸済箇所を区別するための付箋ラベルを印刷します</p>
      </div>

      <div class="print-container">
        <!-- 印刷設定 -->
        <div class="settings-panel">
          <h4><i class="fas fa-cog mr-2"></i>印刷設定</h4>
          
          <div class="setting-group">
            <label>対象エリア</label>
            <div class="area-checkboxes">
              <label v-for="area in areas" :key="area.name" class="checkbox-label">
                <input type="checkbox" v-model="selectedAreas" :value="area.name">
                <span>{{ area.name }}</span>
                <span class="area-count">({{ area.count }}件)</span>
              </label>
            </div>
          </div>

          <div class="setting-group">
            <label>ラベルサイズ</label>
            <select v-model="labelSize" class="form-select">
              <option value="small">40mm × 60mm（コンパクト）</option>
              <option value="standard">50mm × 80mm（標準）</option>
              <option value="large">60mm × 100mm（大型）</option>
            </select>
          </div>

          <div class="setting-group">
            <label>印刷機</label>
            <select v-model="printer" class="form-select">
              <option>ラベルプリンタ LP-5230</option>
              <option>レーザープリンタ</option>
              <option>インクジェット</option>
            </select>
          </div>

          <div class="setting-group">
            <label>印刷内容</label>
            <div class="content-checkboxes">
              <label v-for="content in printContents" :key="content.key" class="checkbox-label">
                <input type="checkbox" v-model="selectedContents" :value="content.key">
                <span>{{ content.name }}</span>
              </label>
            </div>
          </div>

          <div class="summary-info">
            <div class="summary-item">
              <span>合計:</span>
              <span class="summary-value">{{ totalLabels }}件</span>
            </div>
            <div class="summary-item" v-for="area in selectedAreaDetails" :key="area.name">
              <span>{{ area.name }}:</span>
              <span>{{ area.count }}件</span>
            </div>
          </div>

          <div class="print-actions">
            <button class="btn-preview" @click="previewLabels">
              <i class="fas fa-eye mr-2"></i>プレビュー
            </button>
            <button class="btn-print" @click="printLabels">
              <i class="fas fa-print mr-2"></i>印刷実行
            </button>
          </div>
        </div>

        <!-- ラベルプレビュー -->
        <div class="preview-panel">
          <h4><i class="fas fa-eye mr-2"></i>ラベルプレビュー</h4>
          <div class="preview-grid">
            <div 
              v-for="(label, index) in previewLabelsList" 
              :key="index"
              :class="['label-card', `label-${labelSize}`]"
            >
              <div class="label-content">
                <div class="label-header">
                  <span class="area-tag" :class="`area-${label.area}`">{{ label.area }}</span>
                  <span class="label-date">{{ label.date }}</span>
                </div>
                <div class="label-qr">
                  <i class="fas fa-qrcode fa-3x"></i>
                </div>
                <div class="label-info">
                  <div class="label-code">{{ label.code }}</div>
                  <div class="label-name">{{ label.name }}</div>
                  <div class="label-spec">{{ label.spec }}</div>
                  <div class="label-qty">
                    <span class="qty-number">{{ label.qty }}</span>
                    <span class="qty-unit">{{ label.unit }}</span>
                  </div>
                  <div class="label-user">{{ label.user }}</div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="previewLabelsList.length === 0" class="preview-empty">
            <i class="fas fa-print fa-3x text-slate-300 mb-3"></i>
            <p>エリアを選択するとプレビューが表示されます</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'

const showToast = inject('showToast')

const areas = ref([
  { name: 'エリアA', count: 80 },
  { name: 'エリアB', count: 76 },
  { name: 'エリアC', count: 0 },
  { name: 'エリアD', count: 0 }
])

const selectedAreas = ref(['エリアA', 'エリアB'])
const labelSize = ref('standard')
const printer = ref('ラベルプリンタ LP-5230')

const printContents = ref([
  { key: 'qrcode', name: 'QRコード' },
  { key: 'itemInfo', name: '品番・品名' },
  { key: 'qty', name: '数量・日付' },
  { key: 'user', name: '担当者名' },
  { key: 'area', name: 'エリア表示' }
])

const selectedContents = ref(['qrcode', 'itemInfo', 'qty', 'area'])

const totalLabels = computed(() => {
  return selectedAreas.value.reduce((sum, areaName) => {
    const area = areas.value.find(a => a.name === areaName)
    return sum + (area?.count || 0)
  }, 0)
})

const selectedAreaDetails = computed(() => {
  return selectedAreas.value.map(areaName => {
    const area = areas.value.find(a => a.name === areaName)
    return { name: areaName, count: area?.count || 0 }
  }).filter(a => a.count > 0)
})

const sampleLabels = [
  { area: 'A', code: 'ABC-001', name: '鋼製足場板', spec: '300×1800', qty: 150, unit: '個', user: '山田', date: '03/23' },
  { area: 'B', code: 'XYZ-888', name: '単管パイプ', spec: '48.6×3.5', qty: 200, unit: '本', user: '鈴木', date: '03/23' },
  { area: 'A', code: 'ABC-032', name: '鋼製足場板', spec: '250×1500', qty: 85, unit: '枚', user: '田中', date: '03/23' }
]

const previewLabelsList = computed(() => {
  if (selectedAreas.value.length === 0) return []
  return sampleLabels.filter(label => selectedAreas.value.includes(`エリア${label.area}`))
})

const previewLabels = () => {
  showToast('ラベルプレビューを更新しました')
}

const printLabels = () => {
  if (selectedAreas.value.length === 0) {
    showToast('印刷するエリアを選択してください')
    return
  }
  showToast(`印刷ジョブを送信しました (${totalLabels.value}件)`)
}
</script>

<style scoped>
.inventory-label-print {
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

.print-container {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  padding: 24px;
  min-height: 600px;
}

.settings-panel {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.settings-panel h4 {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 20px;
  font-size: 0.875rem;
}

.setting-group {
  margin-bottom: 24px;
}

.setting-group label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: #475569;
  margin-bottom: 8px;
}

.area-checkboxes, .content-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 20px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.checkbox-label:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.checkbox-label input {
  width: 14px;
  height: 14px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.area-count {
  color: #94a3b8;
  font-size: 0.65rem;
}

.form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.75rem;
  background: white;
}

.summary-info {
  background: #eff6ff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  margin-bottom: 6px;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-value {
  font-weight: bold;
  color: #1e293b;
}

.print-actions {
  display: flex;
  gap: 12px;
}

.btn-preview, .btn-print {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-preview {
  background: white;
  border: 2px solid #3b82f6;
  color: #3b82f6;
}

.btn-preview:hover {
  background: #eff6ff;
}

.btn-print {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  color: white;
}

.btn-print:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.preview-panel {
  background: #f1f5f9;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.preview-panel h4 {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
  font-size: 0.875rem;
}

.preview-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  min-height: 400px;
}

.label-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.label-card:hover {
  transform: translateY(-2px);
}

.label-standard {
  width: 200px;
}

.label-small {
  width: 160px;
}

.label-large {
  width: 240px;
}

.label-content {
  padding: 12px;
  border: 2px solid #1e293b;
  border-radius: 8px;
}

.label-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.area-tag {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.6rem;
  font-weight: bold;
  color: white;
}

.area-A {
  background: #3b82f6;
}

.area-B {
  background: #8b5cf6;
}

.area-C {
  background: #ec489a;
}

.area-D {
  background: #f59e0b;
}

.label-date {
  font-size: 0.6rem;
  color: #94a3b8;
}

.label-qr {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
  padding: 8px;
  background: #f1f5f9;
  border-radius: 6px;
}

.label-info {
  text-align: center;
}

.label-code {
  font-family: monospace;
  font-weight: bold;
  font-size: 0.7rem;
  margin-bottom: 2px;
}

.label-name {
  font-size: 0.65rem;
  color: #475569;
  margin-bottom: 2px;
}

.label-spec {
  font-size: 0.6rem;
  color: #64748b;
  margin-bottom: 4px;
}

.label-qty {
  margin: 4px 0;
}

.qty-number {
  font-size: 1rem;
  font-weight: bold;
  color: #1e293b;
}

.qty-unit {
  font-size: 0.6rem;
  color: #64748b;
  margin-left: 2px;
}

.label-user {
  font-size: 0.6rem;
  color: #94a3b8;
}

.preview-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #94a3b8;
  text-align: center;
}
</style>