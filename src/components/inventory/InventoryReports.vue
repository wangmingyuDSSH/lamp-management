<template>
  <div class="inventory-reports">
    <div class="screen-card">
      <div class="card-header">
        <h3><i class="fas fa-chart-bar mr-2"></i>棚卸集計表・差異表</h3>
        <div class="header-actions">
          <button class="btn-export" @click="exportPDF">
            <i class="fas fa-file-pdf mr-2 text-red-500"></i>PDF出力
          </button>
          <button class="btn-export" @click="exportCSV">
            <i class="fas fa-file-csv mr-2 text-green-500"></i>CSV出力
          </button>
        </div>
      </div>

      <div class="reports-container">
        <!-- 帳票選択 -->
        <div class="report-selector">
          <div 
            v-for="report in reportTypes" 
            :key="report.id"
            :class="['report-card', { active: selectedReport === report.id }]"
            @click="selectedReport = report.id"
          >
            <div class="report-icon" :class="report.iconBg">
              <i :class="report.icon"></i>
            </div>
            <div class="report-info">
              <h4>{{ report.name }}</h4>
              <p>{{ report.description }}</p>
            </div>
          </div>
        </div>

        <!-- 出力条件 -->
        <div class="condition-panel">
          <h4><i class="fas fa-filter mr-2"></i>出力条件</h4>
          <div class="condition-grid">
            <div class="condition-field">
              <label>対象期間</label>
              <div class="date-range">
                <input type="date" v-model="dateFrom" class="form-input">
                <span>～</span>
                <input type="date" v-model="dateTo" class="form-input">
              </div>
            </div>
            <div class="condition-field">
              <label>対象エリア</label>
              <select v-model="filterArea" class="form-select">
                <option value="">全エリア</option>
                <option value="A">エリアA</option>
                <option value="B">エリアB</option>
                <option value="C">エリアC</option>
                <option value="D">エリアD</option>
              </select>
            </div>
            <div class="condition-field">
              <label>対象システム</label>
              <select v-model="filterSystem" class="form-select">
                <option value="">全システム</option>
                <option>仮設リースレンタル</option>
                <option>建設機材レンタル</option>
                <option>オクトレンタル</option>
              </select>
            </div>
            <div class="condition-field">
              <label>ステータス</label>
              <select v-model="filterStatus" class="form-select">
                <option value="">全て</option>
                <option value="diff">差異ありのみ</option>
                <option value="match">一致のみ</option>
              </select>
            </div>
          </div>
        </div>

        <!-- サマリー -->
        <div class="summary-panel">
          <h4><i class="fas fa-chart-pie mr-2"></i>サマリー</h4>
          <div class="summary-grid">
            <div class="summary-card">
              <div class="summary-label">総件数</div>
              <div class="summary-number">{{ totalItems.toLocaleString() }}</div>
            </div>
            <div class="summary-card success">
              <div class="summary-label">一致</div>
              <div class="summary-number">{{ matchItems.toLocaleString() }}</div>
              <div class="summary-percent">{{ matchPercent }}%</div>
            </div>
            <div class="summary-card warning">
              <div class="summary-label">差異あり</div>
              <div class="summary-number">{{ diffItems.toLocaleString() }}</div>
              <div class="summary-percent">{{ diffPercent }}%</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">未盘点</div>
              <div class="summary-number">0</div>
            </div>
          </div>
          <div class="summary-note">
            <i class="fas fa-info-circle mr-1"></i>
            運用上入出荷は停止していますが、システム在庫について異動があった場合はその対象が分かります。
          </div>
        </div>

        <!-- グラフ -->
        <div class="chart-panel">
          <h4><i class="fas fa-chart-bar mr-2"></i>差異分析グラフ</h4>
          <canvas ref="chartCanvas" class="chart-canvas"></canvas>
        </div>

        <!-- 差異一覧テーブル（差異表選択時のみ表示） -->
        <div v-if="selectedReport === 'diff'" class="diff-table-panel">
          <h4><i class="fas fa-list mr-2"></i>差異一覧</h4>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>品番</th>
                  <th>品名</th>
                  <th>エリア</th>
                  <th class="text-right">システム在庫</th>
                  <th class="text-right">棚卸数</th>
                  <th class="text-center">差異</th>
                  <th>理由</th>
				  </tr>
                 </thead>
              <tbody>
                <tr v-for="item in diffList" :key="item.code">
                  <td class="font-mono">{{ item.code }}</td>
                  <td>{{ item.name }}</td>
                  <td>{{ item.area }}</td>
                  <td class="text-right">{{ item.systemQty }}</td>
                  <td class="text-right">{{ item.actualQty }}</td>
                  <td class="text-center">
                    <span :class="['diff-badge', item.diff > 0 ? 'diff-plus' : 'diff-minus']">
                      {{ item.diff > 0 ? '+' : '' }}{{ item.diff }}
                    </span>
                  </td>
                  <td>
                    <select v-model="item.reason" class="reason-select">
                      <option value="">選択</option>
                      <option>破損</option>
                      <option>紛失</option>
                      <option>誤登録</option>
                      <option>その他</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="diff-actions">
            <button class="btn-adjust" @click="adjustAll">一括調整</button>
            <button class="btn-save" @click="saveAdjustments">確定して連携</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue'
import Chart from 'chart.js/auto'

const showToast = inject('showToast')

const selectedReport = ref('summary')
const dateFrom = ref('2026-03-01')
const dateTo = ref('2026-03-23')
const filterArea = ref('')
const filterSystem = ref('')
const filterStatus = ref('')

const reportTypes = [
  { id: 'summary', name: '棚卸集計表', description: 'エリア別集計・合計', icon: 'fas fa-file-alt', iconBg: 'bg-blue-100 text-blue-600' },
  { id: 'diff', name: '差異表', description: '不一致項目のみ抽出', icon: 'fas fa-chart-line', iconBg: 'bg-amber-100 text-amber-600' },
  { id: 'checklist', name: '棚卸CHECKLIST', description: '未盘点項目チェック用', icon: 'fas fa-check-double', iconBg: 'bg-green-100 text-green-600' },
  { id: 'monitor', name: '実地棚卸モニターリスト', description: '進捗監視用', icon: 'fas fa-eye', iconBg: 'bg-purple-100 text-purple-600' }
]

const totalItems = ref(1600)
const matchItems = ref(1577)
const diffItems = ref(23)

const matchPercent = computed(() => ((matchItems.value / totalItems.value) * 100).toFixed(1))
const diffPercent = computed(() => ((diffItems.value / totalItems.value) * 100).toFixed(1))

const diffList = ref([
  { code: 'ABC-015', name: '鋼製足場板 400×1800', area: 'A', systemQty: 12, actualQty: 8, diff: -4, reason: '' },
  { code: 'DEF-222', name: 'ジャッキ 油圧式 5t', area: 'C', systemQty: 10, actualQty: 7, diff: -3, reason: '紛失' },
  { code: 'XYZ-112', name: 'コ型クランプ 48.6', area: 'B', systemQty: 50, actualQty: 52, diff: 2, reason: '' }
])

const chartCanvas = ref(null)
let chart = null

const initChart = () => {
  if (!chartCanvas.value) return
  if (chart) chart.destroy()
  
  chart = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels: ['エリアA', 'エリアB', 'エリアC', 'エリアD'],
      datasets: [
        {
          label: '一致',
          data: [380, 312, 248, 120],
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1
        },
        {
          label: '差異あり',
          data: [5, 12, 4, 2],
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true }
      },
      plugins: {
        legend: { position: 'top' }
      }
    }
  })
}

const exportPDF = () => {
  showToast('PDF出力を開始しました')
}

const exportCSV = () => {
  showToast('CSVダウンロードを開始しました')
}

const adjustAll = () => {
  showToast('一括調整を実行しました')
}

const saveAdjustments = () => {
  showToast('調整を確定し、システム連携しました')
}

watch([dateFrom, dateTo, filterArea, filterSystem, filterStatus], () => {
  showToast('条件を更新しました')
})

onMounted(() => {
  initChart()
})
</script>

<style scoped>
.inventory-reports {
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

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-export {
  padding: 6px 12px;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-export:hover {
  background: #f1f5f9;
}

.reports-container {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.report-selector {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.report-card {
  display: flex;
  gap: 12px;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.report-card:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
}

.report-card.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.report-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.report-info h4 {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
  font-size: 0.875rem;
}

.report-info p {
  font-size: 0.7rem;
  color: #64748b;
}

.condition-panel, .summary-panel, .chart-panel, .diff-table-panel {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.condition-panel h4, .summary-panel h4, .chart-panel h4, .diff-table-panel h4 {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
  font-size: 0.875rem;
}

.condition-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.condition-field label {
  display: block;
  font-size: 0.7rem;
  font-weight: 500;
  color: #475569;
  margin-bottom: 6px;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-range .form-input {
  flex: 1;
}

.form-input, .form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.75rem;
  background: white;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  border: 1px solid #e2e8f0;
}

.summary-card.success {
  border-left: 4px solid #10b981;
}

.summary-card.warning {
  border-left: 4px solid #f59e0b;
}

.summary-label {
  font-size: 0.7rem;
  color: #64748b;
  margin-bottom: 8px;
}

.summary-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1e293b;
}

.summary-percent {
  font-size: 0.7rem;
  color: #64748b;
  margin-top: 4px;
}

.summary-note {
  font-size: 0.7rem;
  color: #3b82f6;
  background: #eff6ff;
  padding: 10px;
  border-radius: 8px;
}

.chart-canvas {
  height: 50vh;
  max-height: 400px;
  width: 100%;
}

.table-container {
  overflow-x: auto;
  margin-bottom: 20px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
}

.data-table th {
  background: #f1f5f9;
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

.font-mono {
  font-family: monospace;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
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

.diff-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-adjust, .btn-save {
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-adjust {
  background: white;
  border: 1px solid #cbd5e1;
  color: #475569;
}

.btn-adjust:hover {
  background: #f1f5f9;
}

.btn-save {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  color: white;
}

.btn-save:hover {
  transform: translateY(-2px);
}
</style>