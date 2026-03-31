<template>
  <div class="master-detail">
    <div class="detail-header">
      <button class="btn-back" @click="$emit('back')">
        <i class="fas fa-arrow-left mr-2"></i>戻る
      </button>
      <h3>汎用マスタメンテナンス</h3>
      <div class="header-actions">
        <button class="btn-mode" @click="toggleMode">
          <i :class="isNewMode ? 'fas fa-edit' : 'fas fa-plus'" class="mr-2"></i>
          {{ isNewMode ? '変更モードへ' : '新規モードへ' }}
        </button>
      </div>
    </div>

    <!-- ID選択 -->
    <div class="id-selector">
      <label>ID1:</label>
      <select v-model="selectedId1" class="form-select w-48" @change="loadGenericData">
        <option value="TESTID">TESTID</option>
        <option value="STATUS">STATUS</option>
        <option value="CATEGORY">CATEGORY</option>
      </select>
    </div>

    <!-- データテーブル -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID1</th>
            <th>ID2</th>
            <th>ID3</th>
            <th>記述1(12)</th>
            <th>記述2(32)</th>
            <th>テキスト(256)</th>
            <th>作成日</th>
            <th>更新日</th>
            <th>削除</th>
			</tr>
           </thead>
        <tbody>
          <tr 
            v-for="item in filteredGenericItems" 
            :key="`${item.id1}-${item.id2}`"
            :class="{ selected: selectedItem?.id2 === item.id2 }"
            @click="selectItem(item)"
          >
            <td class="font-mono">{{ item.id1 }} </td>
            <td class="font-mono">{{ item.id2 }} </td>
            <td class="font-mono">{{ item.id3 }} </td>
            <td>{{ item.desc1 }} </td>
            <td>{{ item.desc2 }} </td>
            <td>{{ item.text }} </td>
            <td class="font-mono">{{ item.createDate }} </td>
            <td class="font-mono">{{ item.updateDate }} </td>
            <td class="text-center">
              <button class="btn-delete" @click.stop="deleteItem(item)">
                <i class="fas fa-trash-alt"></i> 削除
              </button>
            </td>
           </tr>
        </tbody>
       </table>
    </div>

    <!-- 入力エリア -->
    <div class="input-area">
      <div class="input-grid">
        <div class="input-field">
          <label>ID1</label>
          <input type="text" v-model="form.id1" class="form-input font-mono" placeholder="TESTID">
        </div>
        <div class="input-field">
          <label>ID2</label>
          <input type="text" v-model="form.id2" class="form-input" placeholder="001">
        </div>
        <div class="input-field">
          <label>ID3</label>
          <input type="text" v-model="form.id3" class="form-input" placeholder="">
        </div>
        <div class="input-field">
          <label>記述1</label>
          <input type="text" v-model="form.desc1" class="form-input" placeholder="錆び">
        </div>
        <div class="input-field">
          <label>記述2</label>
          <input type="text" v-model="form.desc2" class="form-input" placeholder="">
        </div>
        <div class="input-field">
          <label>テキスト</label>
          <input type="text" v-model="form.text" class="form-input" placeholder="">
        </div>
      </div>
      <div class="form-actions">
        <button class="btn-save" @click="saveItem">
          <i class="fas fa-save mr-2"></i>登録更新
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'

const showToast = inject('showToast')
const emit = defineEmits(['back'])

const isNewMode = ref(true)
const selectedId1 = ref('TESTID')
const selectedItem = ref(null)

const genericItems = ref([
  { id1: 'TESTID', id2: '', id3: '', desc1: '一般', desc2: '', text: '', createDate: '220819', updateDate: '000000' },
  { id1: 'TESTID', id2: '1', id3: '', desc1: '情シス', desc2: '', text: '', createDate: '220819', updateDate: '000000' },
  { id1: 'TESTID', id2: '2', id3: '', desc1: '立合', desc2: '', text: '', createDate: '220819', updateDate: '000000' },
  { id1: 'TESTID', id2: '5', id3: '', desc1: 'CHECKMAN', desc2: '', text: '', createDate: '220819', updateDate: '000000' },
  { id1: 'TESTID', id2: '777', id3: '', desc1: 'ダミー', desc2: '', text: '', createDate: '220819', updateDate: '000000' },
  { id1: 'TESTID', id2: '001', id3: '', desc1: '錆び', desc2: '', text: '', createDate: '220130', updateDate: '220906' },
  { id1: 'TESTID', id2: '002', id3: '', desc1: '曲がり', desc2: '', text: '', createDate: '220130', updateDate: '220906' },
  { id1: 'TESTID', id2: '003', id3: '', desc1: '割れ', desc2: '', text: '', createDate: '220130', updateDate: '220906' },
  { id1: 'TESTID', id2: '004', id3: '', desc1: '破損', desc2: '', text: '', createDate: '220906', updateDate: '000000' },
  { id1: 'TESTID', id2: '005', id3: '', desc1: '変形', desc2: '', text: '', createDate: '220906', updateDate: '000000' }
])

const filteredGenericItems = computed(() => {
  return genericItems.value.filter(item => item.id1 === selectedId1.value)
})

const form = ref({
  id1: 'TESTID',
  id2: '',
  id3: '',
  desc1: '',
  desc2: '',
  text: '',
  createDate: '',
  updateDate: ''
})

const selectItem = (item) => {
  selectedItem.value = item
  form.value = { ...item }
}

const toggleMode = () => {
  isNewMode.value = !isNewMode.value
  if (isNewMode.value) {
    form.value = { id1: selectedId1.value, id2: '', id3: '', desc1: '', desc2: '', text: '', createDate: '', updateDate: '' }
    selectedItem.value = null
  }
  showToast(isNewMode.value ? '新規モードに切り替えました' : '変更モードに切り替えました')
}

const loadGenericData = () => {
  form.value.id1 = selectedId1.value
  showToast(`${selectedId1.value}のデータを読み込みました`)
}

const saveItem = () => {
  if (!form.value.id2) {
    showToast('ID2は必須です')
    return
  }
  
  const existingIndex = genericItems.value.findIndex(item => 
    item.id1 === form.value.id1 && item.id2 === form.value.id2
  )
  
  if (existingIndex !== -1 && !isNewMode.value) {
    genericItems.value[existingIndex] = { ...form.value, updateDate: new Date().toISOString().slice(2, 8).replace(/-/g, '') }
    showToast('汎用マスタを更新しました')
  } else if (existingIndex === -1 && isNewMode.value) {
    genericItems.value.push({ 
      ...form.value, 
      createDate: new Date().toISOString().slice(2, 8).replace(/-/g, ''),
      updateDate: '000000'
    })
    showToast('汎用マスタを追加しました')
  } else {
    showToast('既存のID2が存在します')
    return
  }
  
  form.value = { id1: selectedId1.value, id2: '', id3: '', desc1: '', desc2: '', text: '', createDate: '', updateDate: '' }
  selectedItem.value = null
}

const deleteItem = (item) => {
  if (confirm('この汎用マスタを削除しますか？')) {
    const index = genericItems.value.findIndex(i => i.id1 === item.id1 && i.id2 === item.id2)
    if (index !== -1) {
      genericItems.value.splice(index, 1)
      showToast('削除しました')
    }
  }
}
</script>

<style scoped>
.master-detail {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.btn-back {
  padding: 6px 12px;
  background: #f1f5f9;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.detail-header h3 {
  flex: 1;
  font-weight: bold;
  color: #1e293b;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.btn-mode {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  background: #3b82f6;
  color: white;
  border: none;
}

.id-selector {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.id-selector label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #475569;
}

.w-48 {
  width: 192px;
}

.table-container {
  overflow-x: auto;
  margin-bottom: 24px;
  max-height: 400px;
  overflow-y: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.7rem;
}

.data-table th {
  background: #f8fafc;
  padding: 10px;
  text-align: left;
  font-weight: 600;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  background: #f8fafc;
}

.data-table td {
  padding: 10px;
  border-bottom: 1px solid #e2e8f0;
}

.data-table tr:hover {
  background: #eff6ff;
  cursor: pointer;
}

.data-table tr.selected {
  background: #dbeafe;
}

.font-mono {
  font-family: monospace;
}

.text-center {
  text-align: center;
}

.btn-delete {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 0.7rem;
  cursor: pointer;
}

.input-area {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.input-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.input-field label {
  display: block;
  font-size: 0.7rem;
  font-weight: 500;
  color: #475569;
  margin-bottom: 4px;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.75rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-save {
  padding: 8px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>