<template>
  <div class="cross-tree-auto-update-test">
    <h1>跨树拖拽自动更新测试</h1>
    <p>这个页面测试新的 crossTreeDataProvider 功能</p>
    
    <div class="controls">
      <button @click="toggleAutoUpdate" :class="{ active: autoUpdateEnabled }">
        {{ autoUpdateEnabled ? '禁用' : '启用' }} 自动更新
      </button>
      <button @click="resetData">重置数据</button>
      <button @click="showLogs = !showLogs">{{ showLogs ? '隐藏' : '显示' }} 日志</button>
    </div>
    
    <div class="tree-container">
      <div class="tree-section">
        <h3>源树 (source-tree)</h3>
        <Tree
          id="source-tree"
          :value="sourceData"
          dragdrop
          dragdrop-scope="test-scope"
          :cross-tree-auto-update="autoUpdateEnabled"
          :cross-tree-data-provider="crossTreeDataProvider"
          @cross-tree-drop="onCrossTreeDrop"
          @update:value="sourceData = $event"
        />
      </div>
      
      <div class="tree-section">
        <h3>目标树 (target-tree)</h3>
        <Tree
          id="target-tree"
          :value="targetData"
          dragdrop
          dragdrop-scope="test-scope"
          :cross-tree-auto-update="autoUpdateEnabled"
          :cross-tree-data-provider="crossTreeDataProvider"
          @cross-tree-drop="onCrossTreeDrop"
          @update:value="targetData = $event"
        />
      </div>
    </div>
    
    <div v-if="showLogs" class="logs">
      <h3>操作日志</h3>
      <div class="log-list">
        <div v-for="log in logs" :key="log.id" :class="['log-item', log.type]">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import Tree from '../components/Tree.vue'
import type { TreeNode, CrossTreeDataProvider, CrossTreeDropEvent } from '../lib/types'

// 数据状态
const sourceData = ref<TreeNode[]>([
  {
    key: 'source-1',
    label: '源文件夹 1',
    children: [
      { key: 'source-1-1', label: '文档 A.txt' },
      { key: 'source-1-2', label: '图片 B.jpg' },
      { key: 'source-1-3', label: '视频 C.mp4' }
    ]
  },
  {
    key: 'source-2',
    label: '源文件夹 2',
    children: [
      { key: 'source-2-1', label: '代码 D.js' },
      { key: 'source-2-2', label: '样式 E.css' }
    ]
  }
])

const targetData = ref<TreeNode[]>([
  {
    key: 'target-1',
    label: '目标文件夹 1',
    children: []
  },
  {
    key: 'target-2',
    label: '目标文件夹 2',
    children: []
  }
])

// 控制状态
const autoUpdateEnabled = ref(true)
const showLogs = ref(true)

// 日志系统
interface LogEntry {
  id: number
  time: string
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
}

const logs = ref<LogEntry[]>([])
let logId = 0

const addLog = (type: LogEntry['type'], message: string) => {
  logs.value.push({
    id: logId++,
    time: new Date().toLocaleTimeString(),
    type,
    message
  })
  
  // 保持最多 50 条日志
  if (logs.value.length > 50) {
    logs.value.shift()
  }
}

// 跨树数据提供者
const crossTreeDataProvider: CrossTreeDataProvider = {
  getTreeData: (treeId: string) => {
    addLog('info', `获取树数据: ${treeId}`)
    
    if (treeId === 'source-tree') {
      return sourceData.value
    } else if (treeId === 'target-tree') {
      return targetData.value
    } else {
      addLog('error', `未知的树ID: ${treeId}`)
      return []
    }
  },
  
  updateTreeData: (treeId: string, data: TreeNode[]) => {
    addLog('success', `更新树数据: ${treeId}, 节点数: ${data.length}`)
    
    if (treeId === 'source-tree') {
      sourceData.value = data
    } else if (treeId === 'target-tree') {
      targetData.value = data
    } else {
      addLog('error', `无法更新未知的树ID: ${treeId}`)
    }
  }
}

// 事件处理
const onCrossTreeDrop = (event: CrossTreeDropEvent) => {
  addLog('info', `跨树拖拽事件: ${event.dragNode.label} 从 ${event.sourceTreeId} 到 ${event.targetTreeId}`)
  addLog('info', `自动更新模式: ${autoUpdateEnabled.value}`)
  
  if (!autoUpdateEnabled.value) {
    addLog('warning', '自动更新已禁用，需要手动处理')
  }
}

// 控制方法
const toggleAutoUpdate = () => {
  autoUpdateEnabled.value = !autoUpdateEnabled.value
  addLog('info', `跨树拖拽自动更新: ${autoUpdateEnabled.value ? '启用' : '禁用'}`)
}

const resetData = () => {
  sourceData.value = [
    {
      key: 'source-1',
      label: '源文件夹 1',
      children: [
        { key: 'source-1-1', label: '文档 A.txt' },
        { key: 'source-1-2', label: '图片 B.jpg' },
        { key: 'source-1-3', label: '视频 C.mp4' }
      ]
    },
    {
      key: 'source-2',
      label: '源文件夹 2',
      children: [
        { key: 'source-2-1', label: '代码 D.js' },
        { key: 'source-2-2', label: '样式 E.css' }
      ]
    }
  ]
  
  targetData.value = [
    {
      key: 'target-1',
      label: '目标文件夹 1',
      children: []
    },
    {
      key: 'target-2',
      label: '目标文件夹 2',
      children: []
    }
  ]
  
  addLog('info', '数据已重置')
}

// 初始化日志
addLog('info', '跨树拖拽自动更新测试页面已加载')
addLog('info', '请尝试从左侧源树拖拽节点到右侧目标树')
</script>

<style scoped>
.cross-tree-auto-update-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.controls {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.controls button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.controls button:hover {
  background: #f5f5f5;
}

.controls button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.tree-container {
  display: flex;
  gap: 20px;
  margin: 20px 0;
}

.tree-section {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  background: #fafafa;
}

.tree-section h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 16px;
}

.logs {
  margin-top: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  background: #f9f9f9;
}

.logs h3 {
  margin: 0 0 16px 0;
  color: #333;
}

.log-list {
  max-height: 300px;
  overflow-y: auto;
}

.log-item {
  display: flex;
  gap: 10px;
  padding: 4px 0;
  border-bottom: 1px solid #eee;
  font-family: monospace;
  font-size: 12px;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  color: #666;
  min-width: 80px;
}

.log-message {
  flex: 1;
}

.log-item.info .log-message {
  color: #333;
}

.log-item.success .log-message {
  color: #28a745;
}

.log-item.warning .log-message {
  color: #ffc107;
}

.log-item.error .log-message {
  color: #dc3545;
}
</style>