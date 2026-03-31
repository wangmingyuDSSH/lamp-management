<template>
  <div class="carrier-master-screen">
    <div class="screen-card">
      <div class="card-header">
        <h3><i class="fas fa-building mr-2"></i>受付運送会社 表示/非表示メンテナンス</h3>
      </div>

      <div class="carrier-container">
        <!-- 左側：表示中の運送会社 -->
        <div class="carrier-panel">
          <div class="panel-header">
            <h4>現在、受付で表示されている運送会社</h4>
          </div>
          <div class="carrier-list">
            <div 
              v-for="carrier in visibleCarriers" 
              :key="carrier.id"
              :class="['carrier-item', { selected: selectedVisible.includes(carrier.id) }]"
              @click="toggleSelectVisible(carrier.id)"
            >
              <input type="checkbox" :checked="selectedVisible.includes(carrier.id)" class="carrier-checkbox" @click.stop>
              <span class="carrier-name">{{ carrier.name }}</span>
            </div>
          </div>
        </div>

        <!-- 中央：操作ボタン -->
        <div class="action-buttons">
          <button class="arrow-btn" @click="moveToHidden" title="非表示へ移動">
            <i class="fas fa-arrow-right"></i>
          </button>
          <button class="arrow-btn" @click="moveToVisible" title="表示へ移動">
            <i class="fas fa-arrow-left"></i>
          </button>
        </div>

        <!-- 右側：非表示の運送会社 -->
        <div class="carrier-panel">
          <div class="panel-header">
            <h4>非表示の運送会社</h4>
          </div>
          <div class="carrier-list">
            <div 
              v-for="carrier in hiddenCarriers" 
              :key="carrier.id"
              :class="['carrier-item', { selected: selectedHidden.includes(carrier.id) }]"
              @click="toggleSelectHidden(carrier.id)"
            >
              <input type="checkbox" :checked="selectedHidden.includes(carrier.id)" class="carrier-checkbox" @click.stop>
              <span class="carrier-name">{{ carrier.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn-save" @click="saveSettings">
          <i class="fas fa-save mr-2"></i>設定保存
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'

const showToast = inject('showToast')

const visibleCarriers = ref([
  { id: 1, name: '○○カブシキガイシャ' },
  { id: 2, name: '△△運送' },
  { id: 3, name: '××運輸' },
  { id: 4, name: '□□商事' },
  { id: 5, name: '◇◇物流' },
  { id: 6, name: '◎◎運送' }
])

const hiddenCarriers = ref([
  { id: 7, name: '★★運送' },
  { id: 8, name: '☆☆運輸' },
  { id: 9, name: '♪♪商事' },
  { id: 10, name: '♫♫物流' }
])

const selectedVisible = ref([])
const selectedHidden = ref([])

const toggleSelectVisible = (id) => {
  const index = selectedVisible.value.indexOf(id)
  if (index === -1) {
    selectedVisible.value.push(id)
  } else {
    selectedVisible.value.splice(index, 1)
  }
}

const toggleSelectHidden = (id) => {
  const index = selectedHidden.value.indexOf(id)
  if (index === -1) {
    selectedHidden.value.push(id)
  } else {
    selectedHidden.value.splice(index, 1)
  }
}

const moveToHidden = () => {
  if (selectedVisible.value.length === 0) {
    showToast('移動する運送会社を選択してください')
    return
  }
  const moving = visibleCarriers.value.filter(c => selectedVisible.value.includes(c.id))
  hiddenCarriers.value.push(...moving)
  visibleCarriers.value = visibleCarriers.value.filter(c => !selectedVisible.value.includes(c.id))
  selectedVisible.value = []
  showToast(`${moving.length}件の運送会社を非表示にしました`)
}

const moveToVisible = () => {
  if (selectedHidden.value.length === 0) {
    showToast('移動する運送会社を選択してください')
    return
  }
  const moving = hiddenCarriers.value.filter(c => selectedHidden.value.includes(c.id))
  visibleCarriers.value.push(...moving)
  hiddenCarriers.value = hiddenCarriers.value.filter(c => !selectedHidden.value.includes(c.id))
  selectedHidden.value = []
  showToast(`${moving.length}件の運送会社を表示にしました`)
}

const saveSettings = () => {
  showToast('運送会社の表示設定を保存しました')
}
</script>

<style scoped>
.carrier-master-screen {
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

.carrier-container {
  display: flex;
  gap: 24px;
  padding: 24px;
  min-height: 500px;
}

.carrier-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 12px 16px;
  background: #f1f5f9;
  border-radius: 8px;
  margin-bottom: 12px;
}

.panel-header h4 {
  font-weight: 500;
  color: #1e293b;
  font-size: 0.875rem;
}

.carrier-list {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  max-height: 400px;
  overflow-y: auto;
}

.carrier-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background 0.2s;
}

.carrier-item:hover {
  background: #f8fafc;
}

.carrier-item.selected {
  background: #eff6ff;
}

.carrier-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.carrier-name {
  font-size: 0.875rem;
  color: #1e293b;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
  padding: 0 8px;
}

.arrow-btn {
  width: 60px;
  height: 60px;
  background: #e2e8f0;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.5rem;
  color: #475569;
}

.arrow-btn:hover {
  background: #cbd5e1;
  transform: scale(1.05);
}

.form-actions {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
}

.btn-save {
  padding: 10px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover {
  background: #2563eb;
}
</style>