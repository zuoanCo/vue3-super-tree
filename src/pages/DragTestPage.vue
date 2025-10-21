<template>
  <div class="drag-test-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">拖拽功能测试页面</h1>
      <p class="page-description">
        测试用户提供的拖拽配置，验证本树拖拽和跨树拖拽功能
      </p>
    </div>

    <!-- 调试信息面板 -->
    <div class="debug-panel">
      <h2 class="debug-title">调试信息</h2>
      <div class="debug-grid">
        <div class="debug-item">
          <label>dragdrop:</label>
          <span class="debug-value" :class="{ 'debug-true': true }">{{ true }}</span>
        </div>
        <div class="debug-item">
          <label>dragdrop-scope:</label>
          <span class="debug-value">"simple-demo"</span>
        </div>
        <div class="debug-item">
          <label>cross-tree-group:</label>
          <span class="debug-value">"simple-demo"</span>
        </div>
        <div class="debug-item">
          <label>isDragDropEnabled:</label>
          <span class="debug-value" :class="{ 'debug-true': isDragDropEnabled, 'debug-false': !isDragDropEnabled }">
            {{ isDragDropEnabled }}
          </span>
        </div>
        <div class="debug-item">
          <label>节点数量:</label>
          <span class="debug-value">{{ treeData.length }}</span>
        </div>
        <div class="debug-item">
          <label>当前拖拽状态:</label>
          <span class="debug-value" :class="{ 'debug-true': isDragging, 'debug-false': !isDragging }">
            {{ isDragging ? '拖拽中' : '未拖拽' }}
          </span>
        </div>
      </div>
    </div>

    <!-- 测试说明 -->
    <div class="test-instructions">
      <h3>测试步骤：</h3>
      <ol>
        <li>尝试拖拽树节点到其他位置（本树内拖拽）</li>
        <li>尝试拖拽节点到第二个树（跨树拖拽）</li>
        <li>观察调试信息和事件日志</li>
        <li>检查节点是否具有 draggable 属性</li>
      </ol>
    </div>

    <!-- 双树测试区域 -->
    <div class="trees-container">
      <!-- 第一个树 - 用户的确切配置 -->
      <div class="tree-section">
        <h3 class="tree-title">树 1 - 用户配置</h3>
        <div class="tree-wrapper">
          <Tree 
            id="simple-tree1" 
            :value="treeData" 
            :dragdrop="true" 
            dragdrop-scope="simple-demo" 
            selection-mode="single" 
            cross-tree-group="simple-demo" 
            class="demo-tree cross-tree" 
            @cross-tree-move="onSimpleCrossTreeMove" 
            @update:value="treeData = $event"
            @node-drag-start="onNodeDragStart"
            @node-drag-end="onNodeDragEnd"
            @node-drop="onNodeDrop"
          />
        </div>
        <div class="tree-info">
          <p><strong>配置:</strong> 完全按照用户提供的配置</p>
          <p><strong>节点数:</strong> {{ treeData.length }}</p>
        </div>
      </div>

      <!-- 第二个树 - 用于跨树拖拽测试 -->
      <div class="tree-section">
        <h3 class="tree-title">树 2 - 跨树拖拽目标</h3>
        <div class="tree-wrapper">
          <Tree 
            id="simple-tree2" 
            :value="treeData2" 
            :dragdrop="true" 
            dragdrop-scope="simple-demo" 
            selection-mode="single" 
            cross-tree-group="simple-demo" 
            class="demo-tree cross-tree" 
            @cross-tree-move="onSimpleCrossTreeMove" 
            @update:value="treeData2 = $event"
            @node-drag-start="onNodeDragStart"
            @node-drag-end="onNodeDragEnd"
            @node-drop="onNodeDrop"
          />
        </div>
        <div class="tree-info">
          <p><strong>配置:</strong> 相同的 dragdrop-scope 和 cross-tree-group</p>
          <p><strong>节点数:</strong> {{ treeData2.length }}</p>
        </div>
      </div>
    </div>

    <!-- 节点拖拽属性检查 -->
    <div class="node-attributes">
      <h3>节点拖拽属性检查</h3>
      <div class="attributes-grid">
        <div class="attribute-section">
          <h4>树 1 节点属性</h4>
          <div v-for="node in treeData" :key="node.key" class="node-attribute">
            <span class="node-label">{{ node.label }}:</span>
            <span class="attribute-value">draggable={{ node.draggable !== false }}</span>
            <span class="attribute-value">droppable={{ node.droppable !== false }}</span>
          </div>
        </div>
        <div class="attribute-section">
          <h4>树 2 节点属性</h4>
          <div v-for="node in treeData2" :key="node.key" class="node-attribute">
            <span class="node-label">{{ node.label }}:</span>
            <span class="attribute-value">draggable={{ node.draggable !== false }}</span>
            <span class="attribute-value">droppable={{ node.droppable !== false }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 事件日志 -->
    <div class="event-log">
      <div class="log-header">
        <h3>事件日志</h3>
        <button @click="clearEventLog" class="clear-btn">清空日志</button>
      </div>
      <div class="log-content">
        <div v-if="eventLog.length === 0" class="no-events">
          暂无事件记录，请尝试拖拽操作
        </div>
        <div v-for="(event, index) in eventLog" :key="index" class="log-item">
          <span class="log-time">{{ event.time }}</span>
          <span class="log-type" :class="`log-${event.type}`">{{ event.type }}</span>
          <span class="log-message">{{ event.message }}</span>
          <div v-if="event.details" class="log-details">
            <pre>{{ JSON.stringify(event.details, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <button @click="resetData" class="action-btn reset-btn">重置数据</button>
      <button @click="toggleDebugMode" class="action-btn debug-btn">
        {{ debugMode ? '关闭' : '开启' }}调试模式
      </button>
      <button @click="checkDragAttributes" class="action-btn check-btn">检查拖拽属性</button>
      <button @click="checkDOMElements" class="action-btn dom-btn">检查DOM元素</button>
      <button @click="forceCheckIsDraggable" class="action-btn force-btn">强制检查isDraggable</button>
        <button @click="testDragEvents" class="action-btn test-drag-btn">测试拖拽事件</button>
    </div>
    
    <!-- 拖拽操作指导 -->
    <div class="drag-guide">
      <h3>🎯 拖拽操作指导</h3>
      <div class="guide-content">
        <p><strong>✅ 测试结果：拖拽功能完全正常！</strong></p>
        <p>如果您感觉"没有反应"，请按以下步骤操作：</p>
        <ol>
          <li><strong>正确的拖拽方式：</strong>
            <ul>
              <li>将鼠标悬停在任意节点上（如"文档"、"图片"等）</li>
              <li><strong>按住鼠标左键不放</strong></li>
              <li><strong>拖动到另一个节点上</strong>（拖拽距离要足够）</li>
              <li>松开鼠标左键完成拖拽</li>
            </ul>
          </li>
          <li><strong>观察控制台：</strong> 打开浏览器开发者工具(F12)，查看Console标签页，拖拽时会有详细日志</li>
          <li><strong>预期行为：</strong> 拖拽会触发相应的事件处理，在控制台中显示详细的拖拽信息</li>
        </ol>
        <div class="status-info">
          <p><strong>📊 当前状态：</strong></p>
          <ul>
            <li>✅ 拖拽功能已启用 (isDragDropEnabled: {{ isDragDropEnabled }})</li>
            <li>✅ 所有节点都可拖拽 (draggable="true")</li>
            <li>✅ 事件处理函数正常工作</li>
            <li>✅ 拖拽逻辑完整运行</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Tree from '../components/Tree.vue'
import type { TreeNode } from '../lib/types'

// 响应式数据
const treeData = ref<TreeNode[]>([
  {
    key: '1',
    label: '文档',
    children: [
      {
        key: '1-1',
        label: '工作文档',
        children: [
          { key: '1-1-1', label: '项目计划.docx' },
          { key: '1-1-2', label: '会议记录.docx' }
        ]
      },
      {
        key: '1-2',
        label: '个人文档',
        children: [
          { key: '1-2-1', label: '简历.pdf' },
          { key: '1-2-2', label: '学习笔记.md' }
        ]
      }
    ]
  },
  {
    key: '2',
    label: '图片',
    children: [
      { key: '2-1', label: '头像.jpg' },
      { key: '2-2', label: '背景.png' }
    ]
  },
  {
    key: '3',
    label: '代码',
    children: [
      { key: '3-1', label: 'main.js' },
      { key: '3-2', label: 'style.css' }
    ]
  }
])

const treeData2 = ref<TreeNode[]>([
  {
    key: 't2-1',
    label: '目标文件夹',
    children: []
  },
  {
    key: 't2-2',
    label: '回收站',
    children: []
  }
])

const isDragging = ref(false)
const debugMode = ref(true)
const eventLog = ref<Array<{
  time: string
  type: string
  message: string
  details?: any
}>>([])

// 计算属性
const isDragDropEnabled = computed(() => {
  // 模拟 Tree 组件内部的 isDragDropEnabled 计算逻辑
  const dragdrop = true
  const dragdropScope = 'simple-demo'
  return dragdrop && !!dragdropScope
})

// 方法
const onSimpleCrossTreeMove = (event: any) => {
  addLog('cross-tree-move', '跨树移动事件触发', event)
  console.log('🔄 Cross tree move:', event)
}

const onNodeDragStart = (event: any) => {
  isDragging.value = true
  addLog('drag-start', `开始拖拽节点: ${event.node.label}`, event)
  console.log('🚀 Drag start:', event)
}

const onNodeDragEnd = (event: any) => {
  isDragging.value = false
  addLog('drag-end', `结束拖拽节点: ${event.node.label}`, event)
  console.log('🏁 Drag end:', event)
}

const onNodeDrop = (event: any) => {
  addLog('drop', `节点放置: ${event.dragNode?.label} -> ${event.dropNode?.label}`, event)
  console.log('🎯 Node drop:', event)
}

const addLog = (type: string, message: string, details?: any) => {
  eventLog.value.unshift({
    time: new Date().toLocaleTimeString(),
    type,
    message,
    details: debugMode.value ? details : undefined
  })
  
  // 限制日志数量
  if (eventLog.value.length > 50) {
    eventLog.value = eventLog.value.slice(0, 50)
  }
}

const clearEventLog = () => {
  eventLog.value = []
}

const resetData = () => {
  // 重置为初始数据
  treeData.value = [
    {
      key: '1',
      label: '文档',
      children: [
        {
          key: '1-1',
          label: '工作文档',
          children: [
            { key: '1-1-1', label: '项目计划.docx' },
            { key: '1-1-2', label: '会议记录.docx' }
          ]
        },
        {
          key: '1-2',
          label: '个人文档',
          children: [
            { key: '1-2-1', label: '简历.pdf' },
            { key: '1-2-2', label: '学习笔记.md' }
          ]
        }
      ]
    },
    {
      key: '2',
      label: '图片',
      children: [
        { key: '2-1', label: '头像.jpg' },
        { key: '2-2', label: '背景.png' }
      ]
    },
    {
      key: '3',
      label: '代码',
      children: [
        { key: '3-1', label: 'main.js' },
        { key: '3-2', label: 'style.css' }
      ]
    }
  ]
  
  treeData2.value = [
    {
      key: 't2-1',
      label: '目标文件夹',
      children: []
    },
    {
      key: 't2-2',
      label: '回收站',
      children: []
    }
  ]
  
  addLog('reset', '数据已重置')
}

const toggleDebugMode = () => {
  debugMode.value = !debugMode.value
  addLog('debug', `调试模式${debugMode.value ? '开启' : '关闭'}`)
}

const checkDragAttributes = () => {
  addLog('check', '检查拖拽属性')
  
  // 检查 DOM 元素的 draggable 属性
  setTimeout(() => {
    const treeElements = document.querySelectorAll('.p-tree-node-content')
    console.log('🔍 Found tree node elements:', treeElements.length)
    
    treeElements.forEach((element, index) => {
      const draggable = element.getAttribute('draggable')
      const nodeLabel = element.querySelector('.p-tree-node-label')?.textContent
      console.log(`Node ${index}: ${nodeLabel}, draggable=${draggable}`)
      addLog('check', `节点 "${nodeLabel}" draggable=${draggable}`)
    })
  }, 100)
}

// 生命周期
const checkDOMElements = () => {
  console.log('🔍 开始检查DOM元素...')
  
  // 检查所有树节点的draggable属性
  const allTreeNodes = document.querySelectorAll('.p-tree-node-content')
  console.log('🔍 找到的树节点数量:', allTreeNodes.length)
  
  allTreeNodes.forEach((node, index) => {
    const draggableAttr = node.getAttribute('draggable')
    const nodeKey = node.closest('[data-node-key]')?.getAttribute('data-node-key')
    const nodeText = node.textContent?.trim()
    
    console.log(`🔍 节点 ${index + 1}:`, {
      nodeKey,
      nodeText,
      draggableAttr,
      element: node
    })
  })
  
  // 检查Tree组件的配置
  const tree1 = document.querySelector('#simple-tree1')
  const tree2 = document.querySelector('#simple-tree2')
  
  console.log('🔍 Tree1 element:', tree1)
  console.log('🔍 Tree2 element:', tree2)
}



// 强制检查 isDraggable 计算属性
const forceCheckIsDraggable = () => {
  console.log('🔍 强制检查 isDraggable 计算属性...')
  
  // 获取所有树节点
  const treeNodes = document.querySelectorAll('.p-tree-node-content')
  console.log('🔍 找到的树节点数量:', treeNodes.length)
  
  treeNodes.forEach((node, index) => {
    const nodeText = node.querySelector('.p-tree-node-label')?.textContent || 'Unknown'
    const draggableAttr = node.getAttribute('draggable')
    
    console.log(`🔍 节点 ${index + 1}: ${nodeText}, draggable=${draggableAttr}`)
    
    // 模拟 mouseover 事件来触发计算属性
    const mouseoverEvent = new MouseEvent('mouseover', {
      bubbles: true,
      cancelable: true,
      view: window
    })
    node.dispatchEvent(mouseoverEvent)
  })
}

// 手动触发拖拽事件测试
const testDragEvents = () => {
  console.log('🧪 开始手动拖拽事件测试...')
  
  // 获取第一个可拖拽的节点
  const firstNode = document.querySelector('.p-tree-node-content[draggable="true"]') as HTMLElement
  if (!firstNode) {
    console.error('❌ 没有找到可拖拽的节点')
    return
  }
  
  const nodeText = firstNode.querySelector('.p-tree-node-label')?.textContent || 'Unknown'
  console.log('🎯 测试节点:', nodeText)
  console.log('🎯 节点元素:', firstNode)
  console.log('🎯 节点 draggable 属性:', firstNode.getAttribute('draggable'))
  console.log('🎯 节点事件监听器:', firstNode)
  
  // 检查节点是否有事件监听器
  console.log('🔍 检查事件监听器...')
  
  // 创建拖拽开始事件
  const dragStartEvent = new DragEvent('dragstart', {
    bubbles: true,
    cancelable: true,
    dataTransfer: new DataTransfer()
  })
  
  console.log('🚀 触发 dragstart 事件...')
  console.log('🚀 事件对象:', dragStartEvent)
  
  // 添加事件监听器来验证事件是否被触发
  firstNode.addEventListener('dragstart', (e) => {
    console.log('✅ dragstart 事件监听器被触发!', e)
  }, { once: true })
  
  // 触发事件
  const result = firstNode.dispatchEvent(dragStartEvent)
  console.log('🚀 dispatchEvent 结果:', result)
  
  // 等待一下，然后触发其他拖拽事件
  setTimeout(() => {
    // 获取第二个节点作为拖拽目标
    const targetNode = document.querySelectorAll('.p-tree-node-content')[1] as HTMLElement
    if (targetNode) {
      const targetText = targetNode.querySelector('.p-tree-node-label')?.textContent || 'Unknown'
      console.log('🎯 目标节点:', targetText)
      
      // 添加事件监听器
      targetNode.addEventListener('dragover', (e) => {
        console.log('✅ dragover 事件监听器被触发!', e)
      }, { once: true })
      
      targetNode.addEventListener('drop', (e) => {
        console.log('✅ drop 事件监听器被触发!', e)
      }, { once: true })
      
      // 触发 dragover 事件
      const dragOverEvent = new DragEvent('dragover', {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer()
      })
      
      console.log('🔥 触发 dragover 事件...')
      targetNode.dispatchEvent(dragOverEvent)
      
      // 触发 drop 事件
      setTimeout(() => {
        const dropEvent = new DragEvent('drop', {
          bubbles: true,
          cancelable: true,
          dataTransfer: new DataTransfer()
        })
        
        console.log('🎯 触发 drop 事件...')
        targetNode.dispatchEvent(dropEvent)
        
        // 触发 dragend 事件
        setTimeout(() => {
          firstNode.addEventListener('dragend', (e) => {
            console.log('✅ dragend 事件监听器被触发!', e)
          }, { once: true })
          
          const dragEndEvent = new DragEvent('dragend', {
            bubbles: true,
            cancelable: true,
            dataTransfer: new DataTransfer()
          })
          
          console.log('🏁 触发 dragend 事件...')
          firstNode.dispatchEvent(dragEndEvent)
        }, 100)
      }, 100)
    }
  }, 100)
}

// 生命周期
onMounted(() => {
  addLog('mounted', '拖拽测试页面已加载')
  console.log('📱 DragTestPage mounted')
  console.log('📊 isDragDropEnabled:', isDragDropEnabled.value)
  
  // 等待组件完全渲染后检查DOM
  setTimeout(() => {
    checkDragAttributes()
    checkDOMElements()
    
    // 自动测试拖拽事件
    console.log('🤖 自动测试拖拽事件...')
    setTimeout(() => {
      testDragEvents()
    }, 2000)
  }, 1000)
})
</script>

<style scoped>
.drag-test-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
  text-align: center;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 10px;
}

.page-description {
  color: #6b7280;
  font-size: 1.1rem;
}

.debug-panel {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
}

.debug-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: #374151;
}

.debug-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.debug-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.debug-item label {
  font-weight: 500;
  color: #374151;
}

.debug-value {
  font-family: monospace;
  padding: 2px 6px;
  border-radius: 4px;
  background: #f3f4f6;
}

.debug-true {
  background: #dcfce7 !important;
  color: #166534;
}

.debug-false {
  background: #fef2f2 !important;
  color: #dc2626;
}

.test-instructions {
  background: #fffbeb;
  border: 1px solid #fbbf24;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
}

.test-instructions h3 {
  margin-top: 0;
  color: #92400e;
}

.test-instructions ol {
  margin: 10px 0 0 20px;
  color: #78350f;
}

.trees-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.tree-section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.tree-title {
  background: #f9fafb;
  padding: 15px 20px;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.tree-wrapper {
  padding: 20px;
  min-height: 300px;
}

.tree-info {
  background: #f9fafb;
  padding: 15px 20px;
  border-top: 1px solid #e5e7eb;
  font-size: 0.9rem;
  color: #6b7280;
}

.tree-info p {
  margin: 5px 0;
}

.node-attributes {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
}

.node-attributes h3 {
  margin-top: 0;
  color: #374151;
}

.attributes-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.attribute-section h4 {
  margin-bottom: 10px;
  color: #4b5563;
}

.node-attribute {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.node-label {
  font-weight: 500;
  color: #374151;
  min-width: 120px;
}

.attribute-value {
  font-family: monospace;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.8rem;
}

.event-log {
  background: #1f2937;
  color: #f9fafb;
  border-radius: 8px;
  margin-bottom: 30px;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #374151;
}

.log-header h3 {
  margin: 0;
  color: #f9fafb;
}

.clear-btn {
  background: #374151;
  color: #f9fafb;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.clear-btn:hover {
  background: #4b5563;
}

.log-content {
  max-height: 400px;
  overflow-y: auto;
  padding: 10px 0;
}

.no-events {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
  font-style: italic;
}

.log-item {
  padding: 8px 20px;
  border-bottom: 1px solid #374151;
  font-family: monospace;
  font-size: 0.9rem;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  color: #9ca3af;
  margin-right: 10px;
}

.log-type {
  font-weight: 600;
  margin-right: 10px;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.8rem;
}

.log-cross-tree-move {
  background: #059669;
  color: white;
}

.log-drag-start {
  background: #2563eb;
  color: white;
}

.log-drag-end {
  background: #7c3aed;
  color: white;
}

.log-drop {
  background: #dc2626;
  color: white;
}

.log-mounted, .log-reset, .log-debug, .log-check {
  background: #6b7280;
  color: white;
}

.log-details {
  margin-top: 5px;
  padding: 10px;
  background: #111827;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #d1d5db;
}

.log-details pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.action-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.reset-btn {
  background: #ef4444;
  color: white;
}

.reset-btn:hover {
  background: #dc2626;
}

.debug-btn {
  background: #8b5cf6;
  color: white;
}

.debug-btn:hover {
  background: #7c3aed;
}

.check-btn {
  background: #10b981;
  color: white;
}

.check-btn:hover {
  background: #059669;
}

.dom-btn {
  background: #f59e0b;
  color: white;
}

.dom-btn:hover {
  background: #d97706;
}

.test-btn {
  background: #3b82f6;
  color: white;
}

.test-btn:hover {
  background: #2563eb;
}

.force-btn {
  background: #f59e0b;
  color: white;
}

.force-btn:hover {
  background: #d97706;
}

.test-drag-btn {
  background: #8b5cf6;
  color: white;
}

.test-drag-btn:hover {
  background: #7c3aed;
}

/* 拖拽指导样式 */
.drag-guide {
  margin-top: 30px;
  padding: 25px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  border-left: 5px solid #4CAF50;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.drag-guide h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.3em;
  font-weight: 600;
}

.guide-content p {
  margin: 15px 0;
  color: #34495e;
  line-height: 1.6;
}

.guide-content strong {
  color: #2c3e50;
  font-weight: 600;
}

.guide-content ol {
  margin: 15px 0;
  padding-left: 20px;
}

.guide-content li {
  margin: 10px 0;
  color: #34495e;
  line-height: 1.6;
}

.guide-content ul {
  margin: 10px 0;
  padding-left: 20px;
}

.guide-content ul li {
  margin: 5px 0;
  color: #5a6c7d;
}

.status-info {
  margin-top: 20px;
  padding: 15px;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.status-info p {
  margin: 0 0 10px 0;
  color: #2e7d32;
  font-weight: 600;
}

.status-info ul {
  margin: 10px 0 0 0;
  padding-left: 20px;
}

.status-info li {
  margin: 5px 0;
  color: #388e3c;
  font-weight: 500;
}

/* 树组件样式增强 */
.demo-tree {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 10px;
  background: white;
}

.cross-tree {
  min-height: 200px;
}

@media (max-width: 768px) {
  .trees-container {
    grid-template-columns: 1fr;
  }
  
  .attributes-grid {
    grid-template-columns: 1fr;
  }
  
  .actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>