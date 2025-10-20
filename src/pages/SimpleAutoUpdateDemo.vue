<template>
  <div class="simple-auto-update-demo">
    <h1>跨树自动更新功能演示</h1>
    
    <div class="controls">
      <label>
        <input 
          type="checkbox" 
          v-model="autoUpdateEnabled" 
        />
        启用跨树自动更新 (crossTreeAutoUpdate)
      </label>
    </div>

    <div class="demo-container">
      <div class="tree-section">
        <h3>源树 (Source Tree)</h3>
        <Tree
          v-model:value="sourceData"
          :dragdrop="true"
          dragdrop-scope="demo"
          :cross-tree-auto-update="autoUpdateEnabled"
          @cross-tree-drop="onCrossTreeDrop"
          class="demo-tree"
        />
      </div>

      <div class="tree-section">
        <h3>目标树 (Target Tree)</h3>
        <Tree
          v-model:value="targetData"
          :dragdrop="true"
          dragdrop-scope="demo"
          :cross-tree-auto-update="autoUpdateEnabled"
          @cross-tree-drop="onCrossTreeDrop"
          class="demo-tree"
        />
      </div>
    </div>

    <div class="logs">
      <h3>操作日志</h3>
      <div class="log-container">
        <div 
          v-for="(log, index) in logs" 
          :key="index" 
          :class="['log-entry', `log-${log.type}`]"
        >
          <span class="log-time">{{ log.time }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </div>

    <div class="instructions">
      <h3>使用说明</h3>
      <ul>
        <li>✅ 启用自动更新后，拖拽节点到另一个树会自动完成数据更新</li>
        <li>❌ 禁用自动更新后，拖拽操作不会自动完成，需要手动处理</li>
        <li>🔄 尝试将左侧树的节点拖拽到右侧树中观察效果</li>
        <li>📝 所有操作都会在日志中显示</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Tree from '@/components/Tree.vue'
import type { TreeNode, CrossTreeDropEvent } from '@/lib/types'

// 响应式数据
const autoUpdateEnabled = ref(true)

const sourceData = ref<TreeNode[]>([
  {
    key: 'source-1',
    label: '源节点 1',
    children: [
      { key: 'source-1-1', label: '源子节点 1-1' },
      { key: 'source-1-2', label: '源子节点 1-2' }
    ]
  },
  {
    key: 'source-2',
    label: '源节点 2',
    children: [
      { key: 'source-2-1', label: '源子节点 2-1' }
    ]
  }
])

const targetData = ref<TreeNode[]>([
  {
    key: 'target-1',
    label: '目标节点 1',
    children: [
      { key: 'target-1-1', label: '目标子节点 1-1' }
    ]
  }
])

const logs = ref<Array<{
  time: string
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
}>>([])

// 添加日志
const addLog = (type: 'info' | 'success' | 'warning' | 'error', message: string) => {
  logs.value.push({
    time: new Date().toLocaleTimeString(),
    type,
    message
  })
}

// 跨树拖拽事件处理
const onCrossTreeDrop = (event: CrossTreeDropEvent) => {
  addLog('info', `🔄 跨树拖拽: "${event.dragNode.label}" → "${event.dropNode.label}"`)
  addLog('info', `📍 拖拽位置: ${event.dropPosition}`)
  addLog('info', `⚙️ 自动更新状态: ${autoUpdateEnabled.value ? '启用' : '禁用'}`)
  
  if (autoUpdateEnabled.value) {
    addLog('success', '✅ 自动更新已启用，数据将自动更新')
    // 不需要手动调用 accept()，组件会自动处理
  } else {
    addLog('warning', '⚠️ 自动更新已禁用，拖拽操作被取消')
    // 不调用 accept()，拖拽操作会被取消
  }
}

// 组件挂载
onMounted(() => {
  addLog('info', '🚀 跨树自动更新演示页面已加载')
  addLog('info', '💡 请尝试将左侧树的节点拖拽到右侧树中')
  addLog('info', '🔧 可以切换自动更新开关来观察不同的行为')
})
</script>

<style scoped>
.simple-auto-update-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.controls {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
}

.controls label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  cursor: pointer;
}

.demo-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.tree-section {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background: white;
}

.tree-section h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
}

.demo-tree {
  min-height: 200px;
}

.logs {
  margin-bottom: 30px;
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fafafa;
}

.log-entry {
  display: flex;
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
  font-family: monospace;
  font-size: 13px;
}

.log-entry:last-child {
  border-bottom: none;
}

.log-time {
  color: #666;
  margin-right: 12px;
  min-width: 80px;
}

.log-message {
  flex: 1;
}

.log-info .log-message {
  color: #2563eb;
}

.log-success .log-message {
  color: #16a34a;
  font-weight: 500;
}

.log-warning .log-message {
  color: #d97706;
  font-weight: 500;
}

.log-error .log-message {
  color: #dc2626;
  font-weight: 500;
}

.instructions {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
}

.instructions h3 {
  margin: 0 0 15px 0;
  color: #1e293b;
}

.instructions ul {
  margin: 0;
  padding-left: 20px;
}

.instructions li {
  margin-bottom: 8px;
  line-height: 1.5;
}
</style>