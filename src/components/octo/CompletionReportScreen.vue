<template>
  <div class="completion-report">
    <div class="screen-card">
      <div class="card-header">
        <h3><i class="fas fa-clipboard-check mr-2"></i>工事完了報告</h3>
      </div>

      <!-- ヘッダー情報 -->
      <div class="info-section">
        <div class="info-grid">
          <div class="info-field">
            <label>工事日付</label>
            <input type="date" v-model="form.date" class="form-input">
          </div>
          <div class="info-field">
            <label>工事No.</label>
            <input type="text" v-model="form.workNo" class="form-input font-mono" placeholder="NT0011">
          </div>
          <div class="info-field">
            <label>帰着先</label>
            <input type="text" v-model="form.returnTo" class="form-input" placeholder="相模原C">
          </div>
          <div class="info-field">
            <label>工事区分</label>
            <select v-model="form.workType" class="form-select">
              <option>組立</option>
              <option>現場</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 状況選択 -->
      <div class="status-section">
        <label>状況</label>
        <select v-model="form.status" class="form-select w-48">
          <option>組立</option>
          <option>増設</option>
          <option>解体</option>
          <option>完了</option>
        </select>
      </div>

      <!-- 工事完了チェックリスト -->
      <div class="checklist-section">
        <h4><i class="fas fa-tasks mr-2"></i>工事完了チェックリスト</h4>
        <div class="checklist-table">
          <table class="data-table">
            <thead>
              <tr>
                <th class="w-16 text-center">完了</th>
                <th class="w-16">コード</th>
                <th>工事内容</th>
                <th class="w-32 text-center">追加/取消</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in checklist" :key="item.code">
                <td class="text-center">
                  <input type="checkbox" v-model="item.completed" class="complete-checkbox">
                </td>
                <td class="font-mono text-center">{{ item.code }}</td>
                <td>{{ item.name }}</td>
                <td class="text-center">
                  <button v-if="item.completed" class="btn-cancel-item" @click="cancelItem(item)">
                    <i class="fas fa-minus-circle"></i> 取消
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 追加工事 -->
      <div class="add-work-section">
        <h4><i class="fas fa-plus-circle mr-2"></i>追加工事</h4>
        <div class="add-work-form">
          <select v-model="selectedExtraWork" class="form-select flex-1">
            <option value="">追加工事を選択</option>
            <option value="01">追加：外部足場工事</option>
            <option value="05">追加：メッシュシート工事</option>
            <option value="09">追加：イメージシート工事</option>
          </select>
          <button class="btn-add-work" @click="addExtraWork">
            <i class="fas fa-plus mr-2"></i>追加
          </button>
        </div>
      </div>

      <!-- 現場写真 -->
      <div class="photo-section">
        <h4><i class="fas fa-camera mr-2"></i>現場写真・KY活動写真</h4>
        <div class="photo-grid">
          <div 
            v-for="(photo, index) in photos" 
            :key="index"
            :class="['photo-item', { 'has-image': photo.hasImage }]"
            @click="openPhotoUpload(index)"
          >
            <i :class="photo.hasImage ? 'fas fa-check-circle text-green-500' : 'fas fa-camera text-slate-400'" class="text-2xl mb-2"></i>
            <span class="text-sm text-slate-600">{{ photo.label }}</span>
            <span class="text-xs text-slate-400 mt-1">{{ photo.hasImage ? 'アップロード済' : 'タップして追加' }}</span>
          </div>
        </div>
        <p class="photo-note">
          <i class="fas fa-info-circle mr-1"></i>
          現場写真、工事部位の写真は登録から一定時間が経過すると自動で削除されます。
        </p>
      </div>

      <!-- 現場コメント -->
      <div class="comment-section">
        <h4><i class="fas fa-comment-alt mr-2"></i>現場コメント</h4>
        <textarea v-model="form.comment" rows="3" class="comment-input" placeholder="現場での特記事項を入力してください"></textarea>
      </div>

      <div class="form-actions">
        <button class="btn-back" @click="$emit('back')">
          <i class="fas fa-arrow-left mr-2"></i>戻る
        </button>
        <button class="btn-submit" @click="submitReport">
          <i class="fas fa-check-circle mr-2"></i>完了報告
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'

const showToast = inject('showToast')
const emit = defineEmits(['back'])

const form = ref({
  date: '2024-06-12',
  workNo: 'NT0011',
  returnTo: '相模原C',
  workType: '組立',
  status: '組立',
  comment: ''
})

const checklist = ref([
  { code: '01', name: '外部足場工事', completed: true },
  { code: '05', name: 'メッシュシート工事', completed: true },
  { code: '09', name: 'イメージシート工事', completed: true },
  { code: '15', name: 'ステップ階段工事', completed: true }
])

const selectedExtraWork = ref('')

const photos = ref([
  { label: '現場全景', hasImage: true },
  { label: '工事部位①', hasImage: true },
  { label: '工事部位②', hasImage: false },
  { label: 'KY活動写真', hasImage: false },
  { label: '予定外工事証跡', hasImage: false },
  { label: 'その他', hasImage: false }
])

const cancelItem = (item) => {
  item.completed = false
  showToast(`${item.name} を取消しました`)
}

const addExtraWork = () => {
  if (!selectedExtraWork.value) {
    showToast('追加工事を選択してください')
    return
  }
  const workMap = {
    '01': { code: '01', name: '外部足場工事', completed: true },
    '05': { code: '05', name: 'メッシュシート工事', completed: true },
    '09': { code: '09', name: 'イメージシート工事', completed: true }
  }
  const newWork = workMap[selectedExtraWork.value]
  if (newWork && !checklist.value.find(w => w.code === newWork.code)) {
    checklist.value.push(newWork)
    showToast(`追加工事を追加しました: ${newWork.name}`)
    selectedExtraWork.value = ''
  }
}

const openPhotoUpload = (index) => {
  showToast(`写真アップロード画面を開きました（${photos.value[index].label}）`)
  photos.value[index].hasImage = true
}

const submitReport = () => {
  if (confirm('工事完了報告を送信しますか？')) {
    showToast('工事完了報告を送信しました')
    setTimeout(() => {
      showToast('オクト・レンタルシステムに連携しました')
    }, 1500)
  }
}
</script>

<style scoped>
.completion-report {
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

.info-section {
  padding: 24px 24px 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.info-field label {
  display: block;
  font-size: 0.75rem;
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

.font-mono {
  font-family: monospace;
}

.w-48 {
  width: 192px;
}

.status-section {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-section label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
}

.checklist-section, .add-work-section, .photo-section, .comment-section {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.checklist-section h4, .add-work-section h4, .photo-section h4, .comment-section h4 {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
}

.checklist-table {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
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
  border-bottom: 1px solid #f1f5f9;
}

.w-16 {
  width: 64px;
}

.text-center {
  text-align: center;
}

.complete-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.btn-cancel-item {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 0.75rem;
  cursor: pointer;
}

.btn-cancel-item:hover {
  color: #dc2626;
}

.add-work-form {
  display: flex;
  gap: 16px;
  align-items: center;
}

.flex-1 {
  flex: 1;
}

.btn-add-work {
  padding: 8px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add-work:hover {
  background: #2563eb;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 12px;
}

.photo-item {
  aspect-ratio: 4/3;
  background: #f1f5f9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px dashed #cbd5e1;
}

.photo-item:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.photo-item.has-image {
  border-style: solid;
  border-color: #10b981;
  background: #ecfdf5;
}

.photo-note {
  font-size: 0.7rem;
  color: #94a3b8;
  margin-top: 8px;
}

.comment-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  resize: vertical;
  font-size: 0.875rem;
}

.comment-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.form-actions {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.btn-back, .btn-submit {
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back {
  background: white;
  border: 1px solid #cbd5e1;
  color: #475569;
}

.btn-back:hover {
  background: #f8fafc;
}

.btn-submit {
  background: #10b981;
  border: none;
  color: white;
}

.btn-submit:hover {
  background: #059669;
}
</style>