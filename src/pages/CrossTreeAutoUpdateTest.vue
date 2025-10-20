<template>
  <div class="cross-tree-test">
    <h1>跨树自动更新测试页面</h1>
    
    <div class="test-section">
      <h2>测试 1: 使用 kebab-case 属性名 (cross-tree-auto-update)</h2>
      <p class="test-description">
        测试用户使用的 :cross-tree-auto-update="true" 是否有效
      </p>
      
      <div class="test-controls">
        <label>
          <input type="checkbox" v-model="kebabCaseEnabled" />
          启用 kebab-case 自动更新
        </label>
      </div>
      
      <div class="tree-container">
        <div class="tree-pair">
          <div class="tree-wrapper">
            <h3>源树 (kebab-case)</h3>
            <Tree
              ref="kebabTree1"
              id="kebab-tree1"
              :value="kebabData1"
              :cross-tree-auto-update="kebabCaseEnabled"
              :dragdrop="true"
              dragdrop-scope="kebab-test"
              @node-drop="onKebabDrop"
              @cross-tree-drop="onKebabCrossDrop"
              class="test-tree"
            />
          </div>
          
          <div class="tree-wrapper">
            <h3>目标树 (kebab-case)</h3>
            <Tree
              ref="kebabTree2"
              id="kebab-tree2"
              :value="kebabData2"
              :cross-tree-auto-update="kebabCaseEnabled"
              :dragdrop="true"
              dragdrop-scope="kebab-test"
              @node-drop="onKebabDrop"
              @cross-tree-drop="onKebabCrossDrop"
              class="test-tree"
            />
          </div>
        </div>
        
        <div class="test-result">
          <h4>Kebab-case 测试结果:</h4>
          <pre>{{ JSON.stringify({ kebabData1, kebabData2 }, null, 2) }}</pre>
        </div>
      </div>
    </div>
    
    <div class="test-section">
      <h2>测试 2: 使用 camelCase 属性名 (crossTreeAutoUpdate)</h2>
      <p class="test-description">
        测试正确的 :crossTreeAutoUpdate="true" 是否有效
      </p>
      
      <div class="test-controls">
        <label>
          <input type="checkbox" v-model="camelCaseEnabled" />
          启用 camelCase 自动更新
        </label>
      </div>
      
      <div class="tree-container">
        <div class="tree-pair">
          <div class="tree-wrapper">
            <h3>源树 (camelCase)</h3>
            <Tree
              ref="camelTree1"
              id="camel-tree1"
              :value="camelData1"
              :crossTreeAutoUpdate="camelCaseEnabled"
              :dragdrop="true"
              dragdrop-scope="camel-test"
              @node-drop="onCamelDrop"
              @cross-tree-drop="onCamelCrossDrop"
              class="test-tree"
            />
          </div>
          
          <div class="tree-wrapper">
            <h3>目标树 (camelCase)</h3>
            <Tree
              ref="camelTree2"
              id="camel-tree2"
              :value="camelData2"
              :crossTreeAutoUpdate="camelCaseEnabled"
              :dragdrop="true"
              dragdrop-scope="camel-test"
              @node-drop="onCamelDrop"
              @cross-tree-drop="onCamelCrossDrop"
              class="test-tree"
            />
          </div>
        </div>
        
        <div class="test-result">
          <h4>CamelCase 测试结果:</h4>
          <pre>{{ JSON.stringify({ camelData1, camelData2 }, null, 2) }}</pre>
        </div>
      </div>
    </div>
    
    <div class="test-section">
      <h2>Props 调试信息</h2>
      <div class="debug-info">
        <h4>Kebab Tree 1 Props:</h4>
        <pre>{{ getTreeProps('kebab1') }}</pre>
        <h4>Camel Tree 1 Props:</h4>
        <pre>{{ getTreeProps('camel1') }}</pre>
      </div>
    </div>
    
    <div class="test-section">
      <h2>测试日志</h2>
      <div class="log-container">
        <div v-for="(log, index) in testLogs" :key="index" class="log-entry">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-type" :class="log.type">{{ log.type }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import Tree from '../components/Tree.vue'
import type { TreeNode, TreeNodeDropEvent, CrossTreeDropEvent } from '../lib/types'

// 测试数据
const kebabData1 = ref<TreeNode[]>([
  {
    key: 'kebab-1',
    label: 'Kebab 节点 1',
    children: [
      { key: 'kebab-1-1', label: 'Kebab 子节点 1-1' },
      { key: 'kebab-1-2', label: 'Kebab 子节点 1-2' }
    ]
  }
])

const kebabData2 = ref<TreeNode[]>([
  {
    key: 'kebab-target',
    label: 'Kebab 目标文件夹',
    children: []
  }
])

const camelData1 = ref<TreeNode[]>([
  {
    key: 'camel-1',
    label: 'Camel 节点 1',
    children: [
      { key: 'camel-1-1', label: 'Camel 子节点 1-1' },
      { key: 'camel-1-2', label: 'Camel 子节点 1-2' }
    ]
  }
])

const camelData2 = ref<TreeNode[]>([
  {
    key: 'camel-target',
    label: 'Camel 目标文件夹',
    children: []
  }
])

// 控制状态
const kebabCaseEnabled = ref(true)
const camelCaseEnabled = ref(true)

// 组件引用
const kebabTree1 = ref()
const kebabTree2 = ref()
const camelTree1 = ref()
const camelTree2 = ref()

// 测试日志
const testLogs = ref<Array<{
  time: string
  type: 'info' | 'success' | 'error' | 'warning' | 'cross-drop' | 'drop'
  message: string
}>>([]);

// 日志记录函数已移除，直接使用 testLogs.value.push()

// 获取组件 props 用于调试
const getTreeProps = (treeType: string) => {
  try {
    let treeRef
    switch (treeType) {
      case 'kebab1':
        treeRef = kebabTree1.value
        break
      case 'camel1':
        treeRef = camelTree1.value
        break
      default:
        return 'Unknown tree type'
    }
    
    if (treeRef && treeRef.$props) {
      return {
        crossTreeAutoUpdate: treeRef.$props.crossTreeAutoUpdate,
        dragdrop: treeRef.$props.dragdrop,
        dragdropScope: treeRef.$props.dragdropScope,
        autoUpdate: treeRef.$props.autoUpdate
      }
    }
    return 'Props not available'
  } catch (error) {
    return `Error: ${error}`
  }
}

// 事件处理
const onKebabDrop = (event: TreeNodeDropEvent) => {
  const log = `[Kebab Drop] 拖拽节点: ${event.dragNode.label} -> ${event.dropNode.label}, 位置: ${event.dropPosition}, 跨树: ${event.isCrossTree}, 自动更新: ${kebabCaseEnabled.value}`
  testLogs.value.push({ time: new Date().toLocaleTimeString(), type: 'drop', message: log })
  
  // 检查自动更新状态
  if (kebabCaseEnabled.value) {
    testLogs.value.push({ time: new Date().toLocaleTimeString(), type: 'info', message: '[Kebab] 自动更新已启用，组件会自动调用 accept()' })
    // 不手动调用 accept()，让组件的自动更新逻辑处理
  } else {
    testLogs.value.push({ time: new Date().toLocaleTimeString(), type: 'info', message: '[Kebab] 自动更新已禁用，手动调用 accept()' })
    event.accept()
  }
}

const onKebabCrossDrop = (event: CrossTreeDropEvent) => {
  const log = `[Kebab Cross Drop] 拖拽节点: ${event.dragNode.label} -> ${event.dropNode.label}, 位置: ${event.dropPosition}, 跨树: ${event.isCrossTree}, 自动更新: ${kebabCaseEnabled.value}`
  testLogs.value.push({ time: new Date().toLocaleTimeString(), type: 'cross-drop', message: log })
  
  // 检查自动更新状态
  if (kebabCaseEnabled.value) {
    testLogs.value.push({ time: new Date().toLocaleTimeString(), type: 'info', message: '[Kebab Cross] 自动更新已启用，组件会自动调用 accept()' })
    // 不手动调用 accept()，让组件的自动更新逻辑处理
  } else {
    testLogs.value.push({ time: new Date().toLocaleTimeString(), type: 'info', message: '[Kebab Cross] 自动更新已禁用，手动调用 accept()' })
    event.accept()
  }
}

const onCamelDrop = (event: TreeNodeDropEvent) => {
  const log = `[Camel Drop] 拖拽节点: ${event.dragNode.label} -> ${event.dropNode.label}, 位置: ${event.dropPosition}, 跨树: ${event.isCrossTree}, 自动更新: ${camelCaseEnabled.value}`
  testLogs.value.push({ time: new Date().toLocaleTimeString(), type: 'drop', message: log })
  
  // 检查自动更新状态
  if (camelCaseEnabled.value) {
    testLogs.value.push({ time: new Date().toLocaleTimeString(), type: 'info', message: '[Camel] 自动更新已启用，组件会自动调用 accept()' })
    // 不手动调用 accept()，让组件的自动更新逻辑处理
  } else {
    testLogs.value.push({ time: new Date().toLocaleTimeString(), type: 'info', message: '[Camel] 自动更新已禁用，手动调用 accept()' })
    event.accept()
  }
}

const onCamelCrossDrop = (event: CrossTreeDropEvent) => {
  const log = `[Camel Cross Drop] 拖拽节点: ${event.dragNode.label} -> ${event.dropNode.label}, 位置: ${event.dropPosition}, 跨树: ${event.isCrossTree}, 自动更新: ${camelCaseEnabled.value}`
  testLogs.value.push({ time: new Date().toLocaleTimeString(), type: 'cross-drop', message: log })
  
  // 检查自动更新状态
  if (camelCaseEnabled.value) {
    testLogs.value.push({ time: new Date().toLocaleTimeString(), type: 'info', message: '[Camel Cross] 自动更新已启用，组件会自动调用 accept()' })
    // 不手动调用 accept()，让组件的自动更新逻辑处理
  } else {
    testLogs.value.push({ time: new Date().toLocaleTimeString(), type: 'info', message: '[Camel Cross] 自动更新已禁用，手动调用 accept()' })
    event.accept()
  }
}

// 初始化日志
testLogs.value.push({ time: new Date().toLocaleTimeString(), type: 'info', message: '跨树自动更新测试页面已加载' })
testLogs.value.push({ time: new Date().toLocaleTimeString(), type: 'info', message: '请尝试在不同的树之间拖拽节点来测试自动更新功能' })

// 等待组件挂载后检查 props
nextTick(() => {
  testLogs.value.push({ time: new Date().toLocaleTimeString(), type: 'info', message: '组件已挂载，检查 props...' })
})
</script>

<style scoped>
.cross-tree-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-section {
  margin-bottom: 40px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
}

.test-section h2 {
  color: #333;
  margin-bottom: 10px;
}

.test-description {
  color: #666;
  margin-bottom: 15px;
  font-style: italic;
}

.test-controls {
  margin-bottom: 20px;
}

.test-controls label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.tree-container {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
}

.tree-pair {
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
  font-size: 16px;
}

.test-tree {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px;
  min-height: 150px;
  background-color: #fafafa;
}

.test-result {
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 15px;
}

.test-result h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
}

.test-result pre {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.4;
  max-height: 200px;
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