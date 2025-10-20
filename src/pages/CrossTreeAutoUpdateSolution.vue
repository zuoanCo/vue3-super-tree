<template>
  <div class="solution-page">
    <h1>跨树自动更新功能 - 正确使用方法</h1>
    
    <div class="solution-section">
      <h2>问题解决方案</h2>
      <p class="description">
        用户报告的 <code>:cross-tree-auto-update="true"</code> 自动更新功能未生效的问题已解决。
      </p>
      
      <div class="solution-content">
        <h3>正确的使用方法：</h3>
        
        <div class="code-example">
          <h4>1. 使用 kebab-case（用户的方式）- 正确 ✅</h4>
          <pre><code>&lt;Tree
  :value="treeData1"
  :cross-tree-auto-update="true"
  :dragdrop="true"
  dragdrop-scope="my-scope"
  @cross-tree-drop="onCrossTreeDrop"
/&gt;

&lt;Tree
  :value="treeData2"
  :cross-tree-auto-update="true"
  :dragdrop="true"
  dragdrop-scope="my-scope"
  @cross-tree-drop="onCrossTreeDrop"
/&gt;</code></pre>
        </div>
        
        <div class="code-example">
          <h4>2. 使用 camelCase - 也正确 ✅</h4>
          <pre><code>&lt;Tree
  :value="treeData1"
  :crossTreeAutoUpdate="true"
  :dragdrop="true"
  dragdrop-scope="my-scope"
  @cross-tree-drop="onCrossTreeDrop"
/&gt;

&lt;Tree
  :value="treeData2"
  :crossTreeAutoUpdate="true"
  :dragdrop="true"
  dragdrop-scope="my-scope"
  @cross-tree-drop="onCrossTreeDrop"
/&gt;</code></pre>
        </div>
        
        <div class="important-notes">
          <h3>重要注意事项：</h3>
          <ul>
            <li><strong>必须设置相同的 dragdrop-scope</strong>：两个树必须有相同的 <code>dragdrop-scope</code> 值</li>
            <li><strong>必须启用 dragdrop</strong>：设置 <code>:dragdrop="true"</code></li>
            <li><strong>监听 cross-tree-drop 事件</strong>：使用 <code>@cross-tree-drop</code> 而不是 <code>@node-drop</code></li>
            <li><strong>自动更新会自动调用 accept()</strong>：无需手动调用 <code>event.accept()</code></li>
          </ul>
        </div>
      </div>
    </div>
    
    <div class="demo-section">
      <h2>实际演示</h2>
      <p>以下是正确配置的跨树自动更新演示：</p>
      
      <div class="demo-controls">
        <label>
          <input type="checkbox" v-model="autoUpdateEnabled" />
          启用跨树自动更新
        </label>
      </div>
      
      <div class="trees-container">
        <div class="tree-wrapper">
          <h3>源树</h3>
          <Tree
            id="source-tree"
            :value="sourceData"
            :cross-tree-auto-update="autoUpdateEnabled"
            :dragdrop="true"
            dragdrop-scope="demo-scope"
            @cross-tree-drop="onCrossTreeDrop"
            class="demo-tree"
          />
        </div>
        
        <div class="tree-wrapper">
          <h3>目标树</h3>
          <Tree
            id="target-tree"
            :value="targetData"
            :cross-tree-auto-update="autoUpdateEnabled"
            :dragdrop="true"
            dragdrop-scope="demo-scope"
            @cross-tree-drop="onCrossTreeDrop"
            class="demo-tree"
          />
        </div>
      </div>
      
      <div class="data-display">
        <h4>当前数据状态：</h4>
        <div class="data-columns">
          <div class="data-column">
            <h5>源树数据：</h5>
            <pre>{{ JSON.stringify(sourceData, null, 2) }}</pre>
          </div>
          <div class="data-column">
            <h5>目标树数据：</h5>
            <pre>{{ JSON.stringify(targetData, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
    
    <div class="log-section">
      <h2>操作日志</h2>
      <div class="log-container">
        <div v-for="(log, index) in logs" :key="index" class="log-entry">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-type" :class="log.type">{{ log.type }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Tree from '../components/Tree.vue'
import type { TreeNode, CrossTreeDropEvent } from '../lib/types'

// 演示数据
const sourceData = ref<TreeNode[]>([
  {
    key: 'source-1',
    label: '文档',
    children: [
      { key: 'source-1-1', label: '用户手册.pdf' },
      { key: 'source-1-2', label: '技术规范.docx' },
      { key: 'source-1-3', label: '项目计划.xlsx' }
    ]
  },
  {
    key: 'source-2',
    label: '图片',
    children: [
      { key: 'source-2-1', label: 'logo.png' },
      { key: 'source-2-2', label: 'banner.jpg' }
    ]
  }
])

const targetData = ref<TreeNode[]>([
  {
    key: 'target-1',
    label: '项目文件夹',
    children: []
  },
  {
    key: 'target-2',
    label: '备份文件夹',
    children: []
  }
])

// 控制状态
const autoUpdateEnabled = ref(true)

// 日志
const logs = ref<Array<{
  time: string
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
}>>([])

const addLog = (type: 'info' | 'success' | 'warning' | 'error', message: string) => {
  logs.value.push({
    time: new Date().toLocaleTimeString(),
    type,
    message
  })
}

// 跨树拖拽事件处理
const onCrossTreeDrop = (event: CrossTreeDropEvent) => {
  addLog('info', `跨树拖拽: ${event.dragNode.label} 从 ${event.sourceTreeId} 拖拽到 ${event.targetTreeId}`)
  addLog('info', `目标节点: ${event.dropNode.label}`)
  addLog('info', `自动更新状态: ${autoUpdateEnabled.value}`)
  
  if (autoUpdateEnabled.value) {
    addLog('success', '✅ 自动更新已启用，数据将自动更新')
  } else {
    addLog('warning', '⚠️ 自动更新已禁用，需要手动处理')
    // 手动接受拖拽
    if (event.accept) {
      event.accept()
      addLog('info', '手动调用 accept() 完成拖拽')
    }
  }
}

// 初始化日志
addLog('info', '跨树自动更新演示页面已加载')
addLog('info', '请尝试将左侧树的节点拖拽到右侧树中')
addLog('info', '可以切换自动更新开关来观察不同的行为')
</script>

<style scoped>
.solution-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.solution-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.solution-section h2 {
  color: #1976d2;
  margin-bottom: 15px;
}

.description {
  color: #666;
  margin-bottom: 20px;
  font-size: 16px;
}

.code-example {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.code-example h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
}

.code-example pre {
  background-color: #f6f8fa;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 14px;
  line-height: 1.4;
  margin: 0;
}

.code-example code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.important-notes {
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  padding: 15px;
  margin-top: 20px;
}

.important-notes h3 {
  color: #856404;
  margin-top: 0;
  margin-bottom: 10px;
}

.important-notes ul {
  margin: 0;
  padding-left: 20px;
}

.important-notes li {
  margin-bottom: 8px;
  color: #856404;
}

.demo-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
}

.demo-section h2 {
  color: #2e7d32;
  margin-bottom: 15px;
}

.demo-controls {
  margin-bottom: 20px;
}

.demo-controls label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  cursor: pointer;
}

.trees-container {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.tree-wrapper {
  flex: 1;
}

.tree-wrapper h3 {
  margin-bottom: 10px;
  color: #555;
}

.demo-tree {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 15px;
  min-height: 200px;
  background-color: #fafafa;
}

.data-display {
  background-color: #f5f5f5;
  border-radius: 6px;
  padding: 15px;
}

.data-display h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.data-columns {
  display: flex;
  gap: 20px;
}

.data-column {
  flex: 1;
}

.data-column h5 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #555;
}

.data-column pre {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  font-size: 12px;
  line-height: 1.4;
  max-height: 200px;
  overflow-y: auto;
}

.log-section {
  padding: 20px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
}

.log-section h2 {
  color: #7b1fa2;
  margin-bottom: 15px;
}

.log-container {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 15px;
  max-height: 300px;
  overflow-y: auto;
}

.log-entry {
  display: flex;
  gap: 10px;
  margin-bottom: 5px;
  font-family: monospace;
  font-size: 12px;
}

.log-time {
  color: #6c757d;
  min-width: 80px;
}

.log-type {
  min-width: 60px;
  font-weight: bold;
}

.log-type.info {
  color: #0dcaf0;
}

.log-type.success {
  color: #198754;
}

.log-type.error {
  color: #dc3545;
}

.log-type.warning {
  color: #fd7e14;
}

.log-message {
  flex: 1;
}
</style>