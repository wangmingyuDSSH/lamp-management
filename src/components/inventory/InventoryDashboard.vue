<template>
  <div class="dashboard">
    <!-- ステータスカード -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-header">
          <div class="stat-icon bg-blue-100">
            <i class="fas fa-clipboard-check text-blue-600"></i>
          </div>
          <span class="stat-badge">進行中</span>
        </div>
        <div class="stat-value">1,247</div>
        <div class="stat-label">今月の棚卸件数</div>
        <div class="stat-trend">
          <i class="fas fa-arrow-up text-green-500 mr-1"></i>
          <span>前月比 +12%</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <div class="stat-icon bg-amber-100">
            <i class="fas fa-exclamation-triangle text-amber-600"></i>
          </div>
          <span class="stat-badge bg-amber-100 text-amber-600">要確認</span>
        </div>
        <div class="stat-value">23</div>
        <div class="stat-label">差異あり件数</div>
        <div class="stat-trend">
          <span>システム在庫と不一致</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <div class="stat-icon bg-purple-100">
            <i class="fas fa-tags text-purple-600"></i>
          </div>
          <span class="stat-badge bg-purple-100 text-purple-600">印刷待ち</span>
        </div>
        <div class="stat-value">156</div>
        <div class="stat-label">付箋ラベル未出力</div>
        <div class="stat-trend">
          <span>エリアA, B, C</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <div class="stat-icon bg-green-100">
            <i class="fas fa-check-circle text-green-600"></i>
          </div>
          <span class="stat-badge bg-green-100 text-green-600">完了</span>
        </div>
        <div class="stat-value">89%</div>
        <div class="stat-label">棚卸進捗率</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: 89%"></div>
        </div>
      </div>
    </div>

    <!-- エリア別進捗 -->
    <div class="progress-section">
      <div class="section-header">
        <h3>エリア別棚卸進捗</h3>
        <button class="detail-link">詳細 <i class="fas fa-expand-alt ml-1"></i></button>
      </div>
      <div class="area-progress">
        <div v-for="area in areaProgress" :key="area.name" class="progress-item">
          <div class="progress-label">{{ area.name }}</div>
          <div class="progress-track">
            <div class="progress-bar-fill" :style="{ width: area.percent + '%', background: area.color }">
              <span class="progress-text">{{ area.percent }}%</span>
            </div>
          </div>
          <div class="progress-count">{{ area.completed }}/{{ area.total }}</div>
        </div>
      </div>
    </div>

    <!-- 最近の活動 -->
    <div class="activities-section">
      <h3>最近の活動</h3>
      <div class="activity-list">
        <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
          <div :class="['activity-icon', activity.iconBg]">
            <i :class="activity.icon"></i>
          </div>
          <div class="activity-content">
            <p class="activity-title">{{ activity.title }}</p>
            <p class="activity-desc">{{ activity.description }}</p>
            <p class="activity-time">{{ activity.time }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- クイックアクション -->
    <div class="quick-actions">
      <h3>クイックアクション</h3>
      <div class="action-grid">
        <div class="action-card" @click="navigateTo('inventoryInput')">
          <i class="fas fa-plus-circle text-2xl text-blue-500 mb-2"></i>
          <p>新規棚卸</p>
        </div>
        <div class="action-card" @click="navigateTo('labelPrint')">
          <i class="fas fa-tags text-2xl text-purple-500 mb-2"></i>
          <p>付箋印刷</p>
        </div>
        <div class="action-card" @click="navigateTo('reports')">
          <i class="fas fa-file-export text-2xl text-green-500 mb-2"></i>
          <p>集計出力</p>
        </div>
        <div class="action-card" @click="navigateTo('import')">
          <i class="fas fa-upload text-2xl text-amber-500 mb-2"></i>
          <p>データ取込</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'

const emit = defineEmits(['navigate'])
const showToast = inject('showToast')

const areaProgress = ref([
  { name: 'エリアA', completed: 380, total: 400, percent: 95, color: 'linear-gradient(90deg, #3b82f6, #2563eb)' },
  { name: 'エリアB', completed: 312, total: 400, percent: 78, color: 'linear-gradient(90deg, #6366f1, #4f46e5)' },
  { name: 'エリアC', completed: 248, total: 400, percent: 62, color: 'linear-gradient(90deg, #a855f7, #9333ea)' },
  { name: 'エリアD', completed: 120, total: 400, percent: 30, color: 'linear-gradient(90deg, #94a3b8, #64748b)' }
])

const recentActivities = ref([
  {
    id: 1,
    title: '棚卸登録',
    description: 'エリアB-123: 品番ABC-001 (15個)',
    time: '3分前',
    icon: 'fas fa-edit',
    iconBg: 'bg-blue-100 text-blue-600'
  },
  {
    id: 2,
    title: '差異調整完了',
    description: '品番XYZ-888: 在庫調整 +5個',
    time: '15分前',
    icon: 'fas fa-check',
    iconBg: 'bg-green-100 text-green-600'
  },
  {
    id: 3,
    title: 'ラベル出力',
    description: 'エリアC: 48枚印刷完了',
    time: '1時間前',
    icon: 'fas fa-print',
    iconBg: 'bg-purple-100 text-purple-600'
  },
  {
    id: 4,
    title: '差異検出',
    description: '品番DEF-222: システム10/実地7',
    time: '2時間前',
    icon: 'fas fa-exclamation',
    iconBg: 'bg-amber-100 text-amber-600'
  }
])

const navigateTo = (screen) => {
  emit('navigate', screen)
}
</script>

<style scoped>
.dashboard {
  animation: fadeIn 0.3s ease;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-badge {
  font-size: 0.7rem;
  padding: 4px 8px;
  border-radius: 20px;
  background: #f1f5f9;
  color: #475569;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 8px;
}

.stat-trend {
  font-size: 0.75rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 12px;
}

.progress-fill {
  height: 100%;
  background: #10b981;
  border-radius: 4px;
  transition: width 0.3s;
}

.progress-section,
.activities-section,
.quick-actions {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3,
.activities-section h3,
.quick-actions h3 {
  font-weight: bold;
  color: #1e293b;
  font-size: 1.125rem;
}

.detail-link {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 0.875rem;
  cursor: pointer;
}

.area-progress {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.progress-label {
  width: 70px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
}

.progress-track {
  flex: 1;
  height: 32px;
  background: #f1f5f9;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 12px;
  transition: width 0.3s;
}

.progress-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.progress-count {
  width: 70px;
  font-size: 0.75rem;
  color: #64748b;
  text-align: right;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.activity-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 4px;
}

.activity-desc {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 0.7rem;
  color: #94a3b8;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 16px;
}

.action-card {
  padding: 20px;
  text-align: center;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-card:hover {
  border-color: #3b82f6;
  background: #eff6ff;
  transform: translateY(-2px);
}

.action-card p {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
  margin-top: 8px;
}

.bg-blue-100 {
  background: #dbeafe;
}

.text-blue-600 {
  color: #3b82f6;
}

.bg-amber-100 {
  background: #fef3c7;
}

.text-amber-600 {
  color: #d97706;
}

.bg-purple-100 {
  background: #f3e8ff;
}

.text-purple-600 {
  color: #9333ea;
}

.bg-green-100 {
  background: #d1fae5;
}

.text-green-600 {
  color: #10b981;
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
