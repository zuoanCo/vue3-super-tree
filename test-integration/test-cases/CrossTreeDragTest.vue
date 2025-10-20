<template>
  <div class="cross-tree-test">
    <h2>跨树拖拽专项测试</h2>
    
    <div class="test-info">
      <p>这个测试专门验证跨树拖拽功能的可靠性，包括：</p>
      <ul>
        <li>✅ onNodeDrop 事件是否正确触发</li>
        <li>✅ 拖拽节点信息是否完整</li>
        <li>✅ 跨树状态识别是否准确</li>
        <li>✅ 数据更新是否正确</li>
      </ul>
    </div>

    <div class="test-controls">
      <button @click="runAutomaticTest" :disabled="isTestRunning">
        {{ isTestRunning ? '测试进行中...' : '运行自动化测试' }}
      </button>
      <button @click="resetTest">重置测试</button>
    </div>

    <div class="trees-container">
      <div class="tree-section">
        <h3>源树 (ID: source-tree)</h3>
        <div class="tree-wrapper">
          <Tree 
            id="source-tree"
            :value="sourceTreeData" 
            dragdrop
            dragdrop-scope="cross-tree-test"
            @node-drop="onSourceTreeDrop"
            @cross-tree-drop="onCrossTreeDropEvent"
            @cross-tree-drag-start="onCrossTreeDragStart"
            @cross-tree-drag-end="onCrossTreeDragEnd"
          />
        </div>
        <div class="tree-info">
          <p>节点数量: {{ sourceTreeData.length }}</p>
        </div>
      </div>

      <div class="tree-section">
        <h3>目标树 (ID: target-tree)</h3>
        <div class="tree-wrapper">
          <Tree 
            id="target-tree"
            :value="targetTreeData" 
            dragdrop
            dragdrop-scope="cross-tree-test"
            @node-drop="onTargetTreeDrop"
            @cross-tree-drop="onCrossTreeDropEvent"
            @cross-tree-drag-enter="onCrossTreeDragEnter"
            @cross-tree-drag-leave="onCrossTreeDragLeave"
          />
        </div>
        <div class="tree-info">
          <p>节点数量: {{ targetTreeData.length }}</p>
        </div>
      </div>
    </div>

    <div class="test-logs">
      <h3>测试日志</h3>
      <div class="log-container">
        <div 
          v-for="log in testLogs" 
          :key="log.id" 
          :class="['log-entry', log.type]"
        >
          <span class="log-time">{{ log.time }}</span>
          <span class="log-type">{{ log.type.toUpperCase() }}</span>
          <span class="log-message">{{ log.message }}</span>
          <pre v-if="log.data" class="log-data">{{ JSON.stringify(log.data, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <div class="test-results">
      <h3>测试结果</h3>
      <div class="results-grid">
        <div 
          v-for="result in testResults" 
          :key="result.name"
          :class="['result-item', result.status]"
        >
          <div class="result-name">{{ result.name }}</div>
          <div class="result-status">{{ result.status }}</div>
          <div class="result-message">{{ result.message }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Tree } from 'vue3-super-tree'
import type { TreeNode, TreeNodeDropEvent, CrossTreeDropEvent } from 'vue3-super-tree'

// 测试数据
const sourceTreeData = ref<TreeNode[]>([
  { key: 'source-1', label: '源节点 1', icon: '📁' },
  { key: 'source-2', label: '源节点 2', icon: '📄' },
  { 
    key: 'source-3', 
    label: '源节点 3 (有子节点)', 
    icon: '📁',
    children: [
      { key: 'source-3-1', label: '子节点 3-1', icon: '📄' },
      { key: 'source-3-2', label: '子节点 3-2', icon: '📄' }
    ]
  }
])

const targetTreeData = ref<TreeNode[]>([
  { key: 'target-1', label: '目标节点 1', icon: '🎯' }
])

// 测试状态
const isTestRunning = ref(false)
const testLogs = ref<Array<{
  id: number
  time: string
  type: 'info' | 'success' | 'error' | 'warning'
  message: string
  data?: any
}>>([])

const testResults = ref<Array<{
  name: string
  status: 'pending' | 'success' | 'error'
  message: string
}>>([
  { name: 'onNodeDrop 事件触发', status: 'pending', message: '等待测试...' },
  { name: '跨树状态识别', status: 'pending', message: '等待测试...' },
  { name: '拖拽节点信息完整性', status: 'pending', message: '等待测试...' },
  { name: '数据更新正确性', status: 'pending', message: '等待测试...' },
  { name: 'cross-tree-drop 事件', status: 'pending', message: '等待测试...' }
])

let logId = 0

// 日志记录
const addLog = (type: 'info' | 'success' | 'error' | 'warning', message: string, data?: any) => {
  testLogs.value.push({
    id: logId++,
    time: new Date().toLocaleTimeString(),
    type,
    message,
    data
  })
  
  // 限制日志数量
  if (testLogs.value.length > 50) {
    testLogs.value.splice(0, 10)
  }
}

// 更新测试结果
const updateTestResult = (name: string, status: 'success' | 'error', message: string) => {
  const result = testResults.value.find(r => r.name === name)
  if (result) {
    result.status = status
    result.message = message
  }
}

// 事件处理
const onSourceTreeDrop = (event: TreeNodeDropEvent) => {
  addLog('info', '源树 onNodeDrop 事件触发', {
    dragNode: event.dragNode?.label,
    dropNode: event.dropNode.label,
    isCrossTree: event.isCrossTree,
    sourceTreeId: event.sourceTreeId,
    targetTreeId: event.targetTreeId
  })
  
  updateTestResult('onNodeDrop 事件触发', 'success', '源树 onNodeDrop 正常触发')
  
  if (event.isCrossTree) {
    updateTestResult('跨树状态识别', 'success', '正确识别为跨树拖拽')
    
    if (event.dragNode && event.dragNode.key && event.dragNode.label) {
      updateTestResult('拖拽节点信息完整性', 'success', '拖拽节点信息完整')
    } else {
      updateTestResult('拖拽节点信息完整性', 'error', '拖拽节点信息不完整')
    }
  }
}

const onTargetTreeDrop = (event: TreeNodeDropEvent) => {
  addLog('info', '目标树 onNodeDrop 事件触发', {
    dragNode: event.dragNode?.label,
    dropNode: event.dropNode.label,
    isCrossTree: event.isCrossTree,
    sourceTreeId: event.sourceTreeId,
    targetTreeId: event.targetTreeId
  })
  
  updateTestResult('onNodeDrop 事件触发', 'success', '目标树 onNodeDrop 正常触发')
  
  if (event.isCrossTree) {
    updateTestResult('跨树状态识别', 'success', '正确识别为跨树拖拽')
  }
}

const onCrossTreeDropEvent = (event: CrossTreeDropEvent) => {
  addLog('success', 'cross-tree-drop 事件触发', {
    dragNode: event.dragNode.label,
    dropNode: event.dropNode.label,
    sourceTreeId: event.sourceTreeId,
    targetTreeId: event.targetTreeId,
    dropPosition: event.dropPosition
  })
  
  updateTestResult('cross-tree-drop 事件', 'success', 'cross-tree-drop 事件正常触发')
  
  // 执行数据更新
  try {
    if (event.sourceTreeId === 'source-tree' && event.targetTreeId === 'target-tree') {
      // 从源树移除节点
      const removeNode = (nodes: TreeNode[], key: string): boolean => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].key === key) {
            nodes.splice(i, 1)
            return true
          }
          if (nodes[i].children && removeNode(nodes[i].children!, key)) {
            return true
          }
        }
        return false
      }
      
      const removed = removeNode(sourceTreeData.value, event.dragNode.key)
      
      if (removed) {
        // 添加到目标树
        targetTreeData.value.push(event.dragNode)
        
        addLog('success', '数据更新成功', {
          removedFrom: 'source-tree',
          addedTo: 'target-tree',
          node: event.dragNode.label
        })
        
        updateTestResult('数据更新正确性', 'success', '跨树数据更新正确')
        
        // 接受拖拽
        event.accept()
      } else {
        addLog('error', '从源树移除节点失败', { nodeKey: event.dragNode.key })
        updateTestResult('数据更新正确性', 'error', '从源树移除节点失败')
        event.reject()
      }
    } else {
      addLog('warning', '未知的跨树拖拽方向', {
        sourceTreeId: event.sourceTreeId,
        targetTreeId: event.targetTreeId
      })
      event.reject()
    }
  } catch (error) {
    addLog('error', '数据更新时发生错误', { error: error.message })
    updateTestResult('数据更新正确性', 'error', `数据更新错误: ${error.message}`)
    event.reject()
  }
}

const onCrossTreeDragStart = (event: any) => {
  addLog('info', '跨树拖拽开始', {
    dragNode: event.dragNode.label,
    sourceTreeId: event.sourceTreeId
  })
}

const onCrossTreeDragEnd = (event: any) => {
  addLog('info', '跨树拖拽结束', {
    dragNode: event.dragNode.label,
    sourceTreeId: event.sourceTreeId
  })
}

const onCrossTreeDragEnter = (event: any) => {
  addLog('info', '拖拽进入目标树', {
    dragNode: event.dragNode.label,
    targetTreeId: event.targetTreeId
  })
}

const onCrossTreeDragLeave = (event: any) => {
  addLog('info', '拖拽离开目标树', {
    dragNode: event.dragNode.label,
    targetTreeId: event.targetTreeId
  })
}

// 自动化测试
const runAutomaticTest = async () => {
  isTestRunning.value = true
  addLog('info', '开始自动化测试')
  
  try {
    // 模拟拖拽操作
    await simulateDragDrop()
  } catch (error) {
    addLog('error', '自动化测试失败', { error: error.message })
  } finally {
    isTestRunning.value = false
    addLog('info', '自动化测试完成')
  }
}

const simulateDragDrop = async () => {
  // 这里可以添加程序化的拖拽测试
  addLog('info', '请手动测试拖拽功能：从源树拖拽节点到目标树')
  
  // 等待一段时间让用户进行手动测试
  await new Promise(resolve => setTimeout(resolve, 2000))
}

const resetTest = () => {
  // 重置数据
  sourceTreeData.value = [
    { key: 'source-1', label: '源节点 1', icon: '📁' },
    { key: 'source-2', label: '源节点 2', icon: '📄' },
    { 
      key: 'source-3', 
      label: '源节点 3 (有子节点)', 
      icon: '📁',
      children: [
        { key: 'source-3-1', label: '子节点 3-1', icon: '📄' },
        { key: 'source-3-2', label: '子节点 3-2', icon: '📄' }
      ]
    }
  ]
  
  targetTreeData.value = [
    { key: 'target-1', label: '目标节点 1', icon: '🎯' }
  ]
  
  // 重置测试结果
  testResults.value.forEach(result => {
    result.status = 'pending'
    result.message = '等待测试...'
  })
  
  // 清空日志
  testLogs.value = []
  logId = 0
  
  addLog('info', '测试已重置')
}

onMounted(() => {
  addLog('info', '跨树拖拽测试组件已加载')
  addLog('info', '请从左侧源树拖拽节点到右侧目标树进行测试')
})
</script>

<style scoped>
.cross-tree-test {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.test-info {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.test-info ul {
  margin: 10px 0 0 20px;
}

.test-controls {
  margin-bottom: 20px;
}

.test-controls button {
  margin-right: 10px;
  padding: 10px 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 14px;
}

.test-controls button:hover:not(:disabled) {
  background: #f5f5f5;
}

.test-controls button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.trees-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.tree-section {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
}

.tree-section h3 {
  margin-top: 0;
  color: #495057;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 10px;
}

.tree-wrapper {
  min-height: 200px;
  border: 1px dashed #ced4da;
  border-radius: 4px;
  padding: 15px;
  background: #f8f9fa;
}

.tree-info {
  margin-top: 10px;
  font-size: 14px;
  color: #6c757d;
}

.test-logs {
  margin-bottom: 30px;
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background: #f8f9fa;
}

.log-entry {
  display: grid;
  grid-template-columns: auto auto 1fr;
  gap: 10px;
  padding: 8px 12px;
  border-bottom: 1px solid #e9ecef;
  font-size: 13px;
  align-items: start;
}

.log-entry:last-child {
  border-bottom: none;
}

.log-entry.info {
  background: #d1ecf1;
}

.log-entry.success {
  background: #d4edda;
}

.log-entry.error {
  background: #f8d7da;
}

.log-entry.warning {
  background: #fff3cd;
}

.log-time {
  font-family: monospace;
  color: #6c757d;
}

.log-type {
  font-weight: bold;
  font-size: 11px;
}

.log-message {
  font-weight: 500;
}

.log-data {
  grid-column: 1 / -1;
  margin: 5px 0 0 0;
  padding: 8px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
  font-size: 11px;
  overflow-x: auto;
}

.results-grid {
  display: grid;
  gap: 10px;
}

.result-item {
  display: grid;
  grid-template-columns: 2fr auto 3fr;
  gap: 15px;
  padding: 12px;
  border-radius: 4px;
  align-items: center;
}

.result-item.pending {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
}

.result-item.success {
  background: #d4edda;
  border: 1px solid #c3e6cb;
}

.result-item.error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
}

.result-name {
  font-weight: bold;
}

.result-status {
  text-transform: uppercase;
  font-size: 12px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 3px;
  text-align: center;
}

.result-item.pending .result-status {
  background: #6c757d;
  color: white;
}

.result-item.success .result-status {
  background: #28a745;
  color: white;
}

.result-item.error .result-status {
  background: #dc3545;
  color: white;
}

.result-message {
  font-size: 14px;
}