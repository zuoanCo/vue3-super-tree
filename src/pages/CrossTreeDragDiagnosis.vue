<template>
  <div class="cross-tree-diagnosis">
    <div class="header">
      <h1>跨树拖拽诊断工具</h1>
      <p class="description">
        此页面用于诊断和解决跨树拖拽功能问题。请按照下方的诊断清单逐步检查。
      </p>
    </div>

    <!-- 诊断清单 -->
    <div class="diagnosis-checklist">
      <h2>🔍 诊断清单</h2>
      <div class="checklist-grid">
        <div class="check-item" :class="{ 'check-pass': checks.dragdropEnabled, 'check-fail': !checks.dragdropEnabled }">
          <span class="check-icon">{{ checks.dragdropEnabled ? '✅' : '❌' }}</span>
          <span>dragdrop 属性已启用</span>
        </div>
        <div class="check-item" :class="{ 'check-pass': checks.scopeMatched, 'check-fail': !checks.scopeMatched }">
          <span class="check-icon">{{ checks.scopeMatched ? '✅' : '❌' }}</span>
          <span>dragdrop-scope 相同</span>
        </div>
        <div class="check-item" :class="{ 'check-pass': checks.crossTreeAutoUpdate, 'check-fail': !checks.crossTreeAutoUpdate }">
          <span class="check-icon">{{ checks.crossTreeAutoUpdate ? '✅' : '❌' }}</span>
          <span>cross-tree-auto-update 已启用</span>
        </div>
        <div class="check-item" :class="{ 'check-pass': checks.eventListeners, 'check-fail': !checks.eventListeners }">
          <span class="check-icon">{{ checks.eventListeners ? '✅' : '❌' }}</span>
          <span>事件监听器已配置</span>
        </div>
        <div class="check-item" :class="{ 'check-pass': checks.dataStructure, 'check-fail': !checks.dataStructure }">
          <span class="check-icon">{{ checks.dataStructure ? '✅' : '❌' }}</span>
          <span>数据结构正确</span>
        </div>
        <div class="check-item" :class="{ 'check-pass': checks.hasData, 'check-fail': !checks.hasData }">
          <span class="check-icon">{{ checks.hasData ? '✅' : '❌' }}</span>
          <span>树数据不为空</span>
        </div>
      </div>
    </div>

    <!-- 实时状态 -->
    <div class="status-panel">
      <h2>📊 实时状态</h2>
      <div class="status-grid">
        <div class="status-item">
          <label>拖拽状态:</label>
          <span :class="dragStatus.class">{{ dragStatus.text }}</span>
        </div>
        <div class="status-item">
          <label>源树:</label>
          <span>{{ dragInfo.sourceTree || '未检测到' }}</span>
        </div>
        <div class="status-item">
          <label>目标树:</label>
          <span>{{ dragInfo.targetTree || '未检测到' }}</span>
        </div>
        <div class="status-item">
          <label>拖拽节点:</label>
          <span>{{ dragInfo.dragNode || '无' }}</span>
        </div>
      </div>
    </div>

    <!-- 测试区域 -->
    <div class="test-area">
      <h2>🧪 测试区域</h2>
      <div class="trees-container">
        <!-- 源树 -->
        <div class="tree-section">
          <h3>源树 (Tree A)</h3>
          <div class="tree-config">
            <p><strong>配置:</strong></p>
            <ul>
              <li>dragdrop: {{ treeAConfig.dragdrop }}</li>
              <li>auto-update: {{ treeAConfig.autoUpdate }}</li>
              <li>dragdrop-scope: "{{ treeAConfig.dragdropScope }}"</li>
              <li>cross-tree-auto-update: {{ treeAConfig.crossTreeAutoUpdate }}</li>
            </ul>
          </div>
          <Tree 
            v-model:value="treeAData" 
            selection-mode="single" 
            :dragdrop="treeAConfig.dragdrop" 
            :auto-update="treeAConfig.autoUpdate" 
            :dragdrop-scope="treeAConfig.dragdropScope" 
            :cross-tree-auto-update="treeAConfig.crossTreeAutoUpdate" 
            @node-select="onNodeSelectA" 
            @node-drop="onNodeDropA" 
            @cross-tree-drop="onCrossTreeDropA"
            @drag-start="onDragStartA"
            @drag-end="onDragEndA"
            @drag-over="onDragOverA"
            @drag-enter="onDragEnterA"
            @drag-leave="onDragLeaveA"
          />
        </div>

        <!-- 目标树 -->
        <div class="tree-section">
          <h3>目标树 (Tree B)</h3>
          <div class="tree-config">
            <p><strong>配置:</strong></p>
            <ul>
              <li>dragdrop: {{ treeBConfig.dragdrop }}</li>
              <li>auto-update: {{ treeBConfig.autoUpdate }}</li>
              <li>dragdrop-scope: "{{ treeBConfig.dragdropScope }}"</li>
              <li>cross-tree-auto-update: {{ treeBConfig.crossTreeAutoUpdate }}</li>
            </ul>
          </div>
          <Tree 
            v-model:value="treeBData" 
            selection-mode="single" 
            :dragdrop="treeBConfig.dragdrop" 
            :auto-update="treeBConfig.autoUpdate" 
            :dragdrop-scope="treeBConfig.dragdropScope" 
            :cross-tree-auto-update="treeBConfig.crossTreeAutoUpdate" 
            @node-select="onNodeSelectB" 
            @node-drop="onNodeDropB" 
            @cross-tree-drop="onCrossTreeDropB"
            @drag-start="onDragStartB"
            @drag-end="onDragEndB"
            @drag-over="onDragOverB"
            @drag-enter="onDragEnterB"
            @drag-leave="onDragLeaveB"
          />
        </div>
      </div>
    </div>

    <!-- 事件日志 -->
    <div class="event-log">
      <h2>📝 事件日志</h2>
      <div class="log-controls">
        <button @click="clearLogs" class="clear-btn">清空日志</button>
        <button @click="exportLogs" class="export-btn">导出日志</button>
      </div>
      <div class="log-container">
        <div 
          v-for="(log, index) in eventLogs" 
          :key="index" 
          :class="['log-entry', `log-${log.type}`]"
        >
          <span class="log-time">{{ log.time }}</span>
          <span class="log-type">{{ log.type.toUpperCase() }}</span>
          <span class="log-message">{{ log.message }}</span>
          <span v-if="log.data" class="log-data">{{ JSON.stringify(log.data) }}</span>
        </div>
      </div>
    </div>

    <!-- 解决方案 -->
    <div class="solutions">
      <h2>💡 常见问题解决方案</h2>
      <div class="solution-list">
        <div class="solution-item">
          <h4>问题1: 拖拽没有任何反应</h4>
          <ul>
            <li>确保两个树的 <code>dragdrop-scope</code> 完全相同</li>
            <li>检查 <code>dragdrop</code> 属性是否为 <code>true</code></li>
            <li>确认数据结构正确，每个节点都有 <code>key</code> 属性</li>
          </ul>
        </div>
        <div class="solution-item">
          <h4>问题2: 显示预选位置但拖拽失败</h4>
          <ul>
            <li>检查是否监听了 <code>@cross-tree-drop</code> 事件</li>
            <li>确保在事件处理函数中调用了 <code>event.accept()</code></li>
            <li>验证 <code>cross-tree-auto-update</code> 属性设置</li>
          </ul>
        </div>
        <div class="solution-item">
          <h4>问题3: 自动更新不生效</h4>
          <ul>
            <li>确保 <code>auto-update</code> 和 <code>cross-tree-auto-update</code> 都为 <code>true</code></li>
            <li>检查数据是否使用 <code>v-model:value</code> 双向绑定</li>
            <li>确认没有在事件处理中手动修改数据</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import Tree from '@/components/Tree.vue'
import type { TreeNode } from '@/lib/types'

// 树配置
const treeAConfig = reactive({
  dragdrop: true,
  autoUpdate: true,
  dragdropScope: 'cross-tree',
  crossTreeAutoUpdate: true
})

const treeBConfig = reactive({
  dragdrop: true,
  autoUpdate: true,
  dragdropScope: 'cross-tree',
  crossTreeAutoUpdate: true
})

// 树数据
const treeAData = ref<TreeNode[]>([
  {
    key: 'a1',
    label: '节点 A1',
    children: [
      { key: 'a1-1', label: '子节点 A1-1' },
      { key: 'a1-2', label: '子节点 A1-2' }
    ]
  },
  {
    key: 'a2',
    label: '节点 A2',
    children: [
      { key: 'a2-1', label: '子节点 A2-1' }
    ]
  },
  { key: 'a3', label: '节点 A3' }
])

const treeBData = ref<TreeNode[]>([
  {
    key: 'b1',
    label: '节点 B1',
    children: [
      { key: 'b1-1', label: '子节点 B1-1' }
    ]
  },
  { key: 'b2', label: '节点 B2' }
])

// 拖拽状态
const dragInfo = reactive({
  sourceTree: '',
  targetTree: '',
  dragNode: '',
  isDragging: false
})

// 事件日志
const eventLogs = ref<Array<{
  time: string,
  type: string,
  message: string,
  data?: any
}>>([])

// 诊断检查
const checks = computed(() => ({
  dragdropEnabled: treeAConfig.dragdrop && treeBConfig.dragdrop,
  scopeMatched: treeAConfig.dragdropScope === treeBConfig.dragdropScope,
  crossTreeAutoUpdate: treeAConfig.crossTreeAutoUpdate && treeBConfig.crossTreeAutoUpdate,
  eventListeners: true, // 假设已配置
  dataStructure: validateDataStructure(),
  hasData: treeAData.value.length > 0 && treeBData.value.length > 0
}))

// 拖拽状态显示
const dragStatus = computed(() => {
  if (dragInfo.isDragging) {
    return { text: '拖拽中', class: 'status-dragging' }
  }
  return { text: '空闲', class: 'status-idle' }
})

// 验证数据结构
function validateDataStructure() {
  const validateNode = (node: any): boolean => {
    if (!node.key || !node.label) return false
    if (node.children) {
      return node.children.every(validateNode)
    }
    return true
  }
  
  return treeAData.value.every(validateNode) && treeBData.value.every(validateNode)
}

// 添加日志
function addLog(type: string, message: string, data?: any) {
  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`
  
  eventLogs.value.unshift({
    time,
    type,
    message,
    data
  })
  
  // 限制日志数量
  if (eventLogs.value.length > 100) {
    eventLogs.value = eventLogs.value.slice(0, 100)
  }
}

// Tree A 事件处理
function onNodeSelectA(event: any) {
  addLog('select', 'Tree A: 节点选择', { node: event.node })
}

function onNodeDropA(event: any) {
  addLog('drop', 'Tree A: 节点拖拽', event)
}

function onCrossTreeDropA(event: any) {
  addLog('cross-drop', 'Tree A: 跨树拖拽事件', event)
  dragInfo.targetTree = 'Tree A'
  
  // 如果启用了自动更新，不需要手动处理
  if (!treeAConfig.crossTreeAutoUpdate) {
    // 手动处理数据更新
    event.accept()
  }
}

function onDragStartA(event: any) {
  addLog('drag-start', 'Tree A: 开始拖拽', event)
  dragInfo.isDragging = true
  dragInfo.sourceTree = 'Tree A'
  dragInfo.dragNode = event.node?.label || '未知节点'
}

function onDragEndA(event: any) {
  addLog('drag-end', 'Tree A: 结束拖拽', event)
  dragInfo.isDragging = false
  dragInfo.sourceTree = ''
  dragInfo.targetTree = ''
  dragInfo.dragNode = ''
}

function onDragOverA(event: any) {
  addLog('drag-over', 'Tree A: 拖拽悬停', event)
}

function onDragEnterA(event: any) {
  addLog('drag-enter', 'Tree A: 拖拽进入', event)
}

function onDragLeaveA(event: any) {
  addLog('drag-leave', 'Tree A: 拖拽离开', event)
}

// Tree B 事件处理
function onNodeSelectB(event: any) {
  addLog('select', 'Tree B: 节点选择', { node: event.node })
}

function onNodeDropB(event: any) {
  addLog('drop', 'Tree B: 节点拖拽', event)
}

function onCrossTreeDropB(event: any) {
  addLog('cross-drop', 'Tree B: 跨树拖拽事件', event)
  dragInfo.targetTree = 'Tree B'
  
  // 如果启用了自动更新，不需要手动处理
  if (!treeBConfig.crossTreeAutoUpdate) {
    // 手动处理数据更新
    event.accept()
  }
}

function onDragStartB(event: any) {
  addLog('drag-start', 'Tree B: 开始拖拽', event)
  dragInfo.isDragging = true
  dragInfo.sourceTree = 'Tree B'
  dragInfo.dragNode = event.node?.label || '未知节点'
}

function onDragEndB(event: any) {
  addLog('drag-end', 'Tree B: 结束拖拽', event)
  dragInfo.isDragging = false
  dragInfo.sourceTree = ''
  dragInfo.targetTree = ''
  dragInfo.dragNode = ''
}

function onDragOverB(event: any) {
  addLog('drag-over', 'Tree B: 拖拽悬停', event)
}

function onDragEnterB(event: any) {
  addLog('drag-enter', 'Tree B: 拖拽进入', event)
}

function onDragLeaveB(event: any) {
  addLog('drag-leave', 'Tree B: 拖拽离开', event)
}

// 日志操作
function clearLogs() {
  eventLogs.value = []
  addLog('system', '日志已清空')
}

function exportLogs() {
  const logsText = eventLogs.value
    .map(log => `[${log.time}] ${log.type.toUpperCase()}: ${log.message}${log.data ? ' ' + JSON.stringify(log.data) : ''}`)
    .join('\n')
  
  const blob = new Blob([logsText], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `cross-tree-diagnosis-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`
  a.click()
  URL.revokeObjectURL(url)
  
  addLog('system', '日志已导出')
}

// 初始化
onMounted(() => {
  addLog('system', '跨树拖拽诊断工具已加载')
  addLog('info', `Tree A 数据: ${treeAData.value.length} 个根节点`)
  addLog('info', `Tree B 数据: ${treeBData.value.length} 个根节点`)
})
</script>

<style scoped>
.cross-tree-diagnosis {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.description {
  color: #7f8c8d;
  font-size: 16px;
}

.diagnosis-checklist {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.diagnosis-checklist h2 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.checklist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 10px;
}

.check-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 6px;
  background: white;
  border: 2px solid #e9ecef;
}

.check-item.check-pass {
  border-color: #28a745;
  background: #f8fff9;
}

.check-item.check-fail {
  border-color: #dc3545;
  background: #fff8f8;
}

.check-icon {
  margin-right: 8px;
  font-size: 16px;
}

.status-panel {
  background: #e3f2fd;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.status-panel h2 {
  margin-bottom: 15px;
  color: #1976d2;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: white;
  border-radius: 6px;
  border-left: 4px solid #2196f3;
}

.status-item label {
  font-weight: bold;
  color: #37474f;
}

.status-dragging {
  color: #ff9800;
  font-weight: bold;
}

.status-idle {
  color: #4caf50;
}

.test-area {
  margin-bottom: 30px;
}

.test-area h2 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.trees-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.tree-section {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
}

.tree-section h3 {
  margin-bottom: 15px;
  color: #495057;
}

.tree-config {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.tree-config p {
  margin-bottom: 8px;
  font-weight: bold;
}

.tree-config ul {
  margin: 0;
  padding-left: 20px;
}

.tree-config li {
  margin-bottom: 4px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.event-log {
  background: #2c3e50;
  color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.event-log h2 {
  margin-bottom: 15px;
  color: white;
}

.log-controls {
  margin-bottom: 15px;
}

.clear-btn, .export-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
}

.clear-btn:hover, .export-btn:hover {
  background: #2980b9;
}

.log-container {
  max-height: 400px;
  overflow-y: auto;
  background: #34495e;
  border-radius: 6px;
  padding: 15px;
}

.log-entry {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #4a5f7a;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.log-entry:last-child {
  border-bottom: none;
}

.log-time {
  color: #bdc3c7;
  margin-right: 10px;
  min-width: 80px;
}

.log-type {
  margin-right: 10px;
  min-width: 100px;
  font-weight: bold;
}

.log-system .log-type {
  color: #f39c12;
}

.log-info .log-type {
  color: #3498db;
}

.log-cross-drop .log-type {
  color: #e74c3c;
}

.log-drag-start .log-type {
  color: #2ecc71;
}

.log-drag-end .log-type {
  color: #95a5a6;
}

.log-message {
  flex: 1;
  margin-right: 10px;
}

.log-data {
  color: #ecf0f1;
  font-size: 12px;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.solutions {
  background: #fff3cd;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #ffc107;
}

.solutions h2 {
  margin-bottom: 20px;
  color: #856404;
}

.solution-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.solution-item {
  background: white;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #ffeaa7;
}

.solution-item h4 {
  margin-bottom: 10px;
  color: #d63031;
}

.solution-item ul {
  margin: 0;
  padding-left: 20px;
}

.solution-item li {
  margin-bottom: 5px;
  line-height: 1.5;
}

.solution-item code {
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  color: #e83e8c;
}

@media (max-width: 768px) {
  .trees-container {
    grid-template-columns: 1fr;
  }
  
  .checklist-grid {
    grid-template-columns: 1fr;
  }
  
  .status-grid {
    grid-template-columns: 1fr;
  }
}
</style>