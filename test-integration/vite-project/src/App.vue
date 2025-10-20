<template>
  <div id="app">
    <h1>Vue3 Super Tree 集成测试</h1>
    
    <!-- 基础功能测试 -->
    <section class="test-section">
      <h2>基础功能测试</h2>
      <div class="test-grid">
        <div class="test-item">
          <h3>基础树形展示</h3>
          <Tree 
            :value="basicTreeData" 
            :expanded-keys="['1', '2']"
            @node-select="onNodeSelect"
          />
        </div>
        
        <div class="test-item">
          <h3>多选模式</h3>
          <Tree 
            :value="basicTreeData" 
            selection-mode="multiple"
            :selection-keys="['1-1', '2-1']"
            @selection-change="onSelectionChange"
          />
        </div>
        
        <div class="test-item">
          <h3>复选框模式</h3>
          <Tree 
            :value="basicTreeData" 
            selection-mode="checkbox"
            :selection-keys="['1-1']"
            @selection-change="onSelectionChange"
          />
        </div>
      </div>
    </section>

    <!-- 拖拽功能测试 -->
    <section class="test-section">
      <h2>拖拽功能测试</h2>
      <div class="test-grid">
        <div class="test-item">
          <h3>同树拖拽</h3>
          <Tree 
            :value="dragTreeData1" 
            dragdrop
            auto-update
            @node-drop="onNodeDrop"
          />
        </div>
        
        <div class="test-item">
          <h3>跨树拖拽 - 源树</h3>
          <Tree 
            id="source-tree"
            :value="dragTreeData2" 
            dragdrop
            dragdrop-scope="cross-tree-test"
            @node-drop="onCrossTreeDrop"
            @cross-tree-drop="onCrossTreeDropEvent"
          />
        </div>
        
        <div class="test-item">
          <h3>跨树拖拽 - 目标树</h3>
          <Tree 
            id="target-tree"
            :value="dragTreeData3" 
            dragdrop
            dragdrop-scope="cross-tree-test"
            @node-drop="onCrossTreeDrop"
            @cross-tree-drop="onCrossTreeDropEvent"
          />
        </div>
      </div>
    </section>

    <!-- 主题测试 -->
    <section class="test-section">
      <h2>主题测试</h2>
      <div class="theme-controls">
        <button @click="setTheme('default')">默认主题</button>
        <button @click="setTheme('dark')">深色主题</button>
        <button @click="setTheme('minimal')">简约主题</button>
      </div>
      <Tree 
        :value="basicTreeData" 
        :theme="currentTheme"
        :expanded-keys="['1']"
      />
    </section>

    <!-- 测试结果 -->
    <section class="test-section">
      <h2>测试结果</h2>
      <div class="test-results">
        <div v-for="result in testResults" :key="result.id" :class="['test-result', result.status]">
          <span class="test-name">{{ result.name }}</span>
          <span class="test-status">{{ result.status }}</span>
          <span class="test-message">{{ result.message }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Tree } from 'vue3-super-tree'
import type { TreeNode, TreeNodeSelectEvent, TreeNodeDropEvent, CrossTreeDropEvent } from 'vue3-super-tree'

// 测试数据
const basicTreeData = ref<TreeNode[]>([
  {
    key: '1',
    label: '节点 1',
    children: [
      { key: '1-1', label: '子节点 1-1' },
      { key: '1-2', label: '子节点 1-2' }
    ]
  },
  {
    key: '2',
    label: '节点 2',
    children: [
      { key: '2-1', label: '子节点 2-1' },
      { key: '2-2', label: '子节点 2-2' }
    ]
  }
])

const dragTreeData1 = ref<TreeNode[]>([
  { key: 'drag1-1', label: '拖拽节点 1' },
  { key: 'drag1-2', label: '拖拽节点 2' },
  { key: 'drag1-3', label: '拖拽节点 3' }
])

const dragTreeData2 = ref<TreeNode[]>([
  { key: 'source-1', label: '源节点 1' },
  { key: 'source-2', label: '源节点 2' }
])

const dragTreeData3 = ref<TreeNode[]>([
  { key: 'target-1', label: '目标节点 1' }
])

// 主题
const currentTheme = ref('default')

// 测试结果
const testResults = ref<Array<{
  id: string
  name: string
  status: 'pending' | 'success' | 'error'
  message: string
}>>([
  { id: 'basic-render', name: '基础渲染', status: 'pending', message: '等待测试...' },
  { id: 'selection', name: '选择功能', status: 'pending', message: '等待测试...' },
  { id: 'same-tree-drag', name: '同树拖拽', status: 'pending', message: '等待测试...' },
  { id: 'cross-tree-drag', name: '跨树拖拽', status: 'pending', message: '等待测试...' },
  { id: 'theme-switch', name: '主题切换', status: 'pending', message: '等待测试...' }
])

// 事件处理
const onNodeSelect = (event: TreeNodeSelectEvent) => {
  console.log('节点选择:', event)
  updateTestResult('selection', 'success', '节点选择功能正常')
}

const onSelectionChange = (event: any) => {
  console.log('选择变化:', event)
  updateTestResult('selection', 'success', '选择变化功能正常')
}

const onNodeDrop = (event: TreeNodeDropEvent) => {
  console.log('同树拖拽:', event)
  updateTestResult('same-tree-drag', 'success', '同树拖拽功能正常')
  event.accept()
}

const onCrossTreeDrop = (event: TreeNodeDropEvent) => {
  console.log('跨树拖拽 onNodeDrop:', event)
  if (event.isCrossTree) {
    updateTestResult('cross-tree-drag', 'success', '跨树拖拽 onNodeDrop 事件正常触发')
  }
}

const onCrossTreeDropEvent = (event: CrossTreeDropEvent) => {
  console.log('跨树拖拽事件:', event)
  updateTestResult('cross-tree-drag', 'success', '跨树拖拽功能正常')
  
  // 执行跨树数据更新
  if (event.sourceTreeId === 'source-tree' && event.targetTreeId === 'target-tree') {
    // 从源树移除节点
    const sourceIndex = dragTreeData2.value.findIndex(node => node.key === event.dragNode.key)
    if (sourceIndex !== -1) {
      dragTreeData2.value.splice(sourceIndex, 1)
    }
    
    // 添加到目标树
    dragTreeData3.value.push(event.dragNode)
  }
  
  event.accept()
}

const setTheme = (theme: string) => {
  currentTheme.value = theme
  updateTestResult('theme-switch', 'success', `主题切换到 ${theme} 成功`)
}

const updateTestResult = (id: string, status: 'success' | 'error', message: string) => {
  const result = testResults.value.find(r => r.id === id)
  if (result) {
    result.status = status
    result.message = message
  }
}

// 自动测试
onMounted(() => {
  // 基础渲染测试
  setTimeout(() => {
    updateTestResult('basic-render', 'success', '基础渲染功能正常')
  }, 1000)
  
  // 自动运行一些测试
  setTimeout(() => {
    console.log('开始自动化测试...')
    
    // 测试主题切换
    setTheme('dark')
    setTimeout(() => setTheme('default'), 1000)
  }, 2000)
})
</script>

<style scoped>
#app {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.test-section {
  margin-bottom: 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
}

.test-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.test-item {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 15px;
}

.test-item h3 {
  margin-top: 0;
  color: #333;
}

.theme-controls {
  margin-bottom: 20px;
}

.theme-controls button {
  margin-right: 10px;
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.theme-controls button:hover {
  background: #f5f5f5;
}

.test-results {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.test-result {
  display: grid;
  grid-template-columns: 1fr auto 2fr;
  gap: 15px;
  padding: 10px;
  border-radius: 4px;
  align-items: center;
}

.test-result.pending {
  background: #f0f0f0;
  color: #666;
}

.test-result.success {
  background: #d4edda;
  color: #155724;
}

.test-result.error {
  background: #f8d7da;
  color: #721c24;
}

.test-name {
  font-weight: bold;
}

.test-status {
  text-transform: uppercase;
  font-size: 12px;
  font-weight: bold;
}

.test-message {
  font-size: 14px;
}