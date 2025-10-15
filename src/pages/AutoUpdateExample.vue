<template>
  <div class="auto-update-example">
    <h1>Tree 组件自动更新示例</h1>
    
    <div class="example-section">
      <h2>自动更新模式 (auto-update="true")</h2>
      <p>拖拽节点时会自动更新数据，无需手动处理 @node-drop 事件</p>
      
      <Tree 
        v-model:value="autoTreeData" 
        :dragdrop="true"
        :auto-update="true"
        dragdrop-scope="auto-tree"
        class="tree-container"
      />
      
      <div class="data-display">
        <h3>当前数据：</h3>
        <pre>{{ JSON.stringify(autoTreeData, null, 2) }}</pre>
      </div>
    </div>
    
    <div class="example-section">
      <h2>手动处理模式 (传统方式)</h2>
      <p>需要手动监听 @node-drop 事件并处理数据更新</p>
      
      <Tree 
        v-model:value="manualTreeData" 
        :dragdrop="true"
        :auto-update="false"
        dragdrop-scope="manual-tree"
        @node-drop="onNodeDrop"
        class="tree-container"
      />
      
      <div class="data-display">
        <h3>当前数据：</h3>
        <pre>{{ JSON.stringify(manualTreeData, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Tree from '../components/Tree.vue'
import type { TreeNode, TreeNodeDropEvent } from '../lib/types'
import { moveTreeNode } from '../lib/utils'

// 自动更新模式的数据
const autoTreeData = ref<TreeNode[]>([
  {
    key: 'auto-1',
    label: '自动节点 1',
    children: [
      { key: 'auto-1-1', label: '自动子节点 1-1' },
      { key: 'auto-1-2', label: '自动子节点 1-2' }
    ]
  },
  {
    key: 'auto-2',
    label: '自动节点 2',
    children: [
      { key: 'auto-2-1', label: '自动子节点 2-1' }
    ]
  },
  {
    key: 'auto-3',
    label: '自动节点 3'
  }
])

// 手动处理模式的数据
const manualTreeData = ref<TreeNode[]>([
  {
    key: 'manual-1',
    label: '手动节点 1',
    children: [
      { key: 'manual-1-1', label: '手动子节点 1-1' },
      { key: 'manual-1-2', label: '手动子节点 1-2' }
    ]
  },
  {
    key: 'manual-2',
    label: '手动节点 2',
    children: [
      { key: 'manual-2-1', label: '手动子节点 2-1' }
    ]
  },
  {
    key: 'manual-3',
    label: '手动节点 3'
  }
])

// 手动处理拖拽事件
const onNodeDrop = (event: TreeNodeDropEvent) => {
  console.log('手动处理拖拽事件:', event)
  
  // 手动更新数据
  const updatedData = moveTreeNode(
    manualTreeData.value,
    event.dragNode.key,
    event.dropNode.key,
    event.dropPosition
  )
  
  manualTreeData.value = updatedData
  
  // 接受拖拽操作
  event.accept()
}
</script>

<style scoped>
.auto-update-example {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.example-section {
  margin-bottom: 40px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
}

.example-section h2 {
  color: #333;
  margin-bottom: 10px;
}

.example-section p {
  color: #666;
  margin-bottom: 20px;
}

.tree-container {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  min-height: 200px;
  margin-bottom: 20px;
}

.data-display {
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 15px;
}

.data-display h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
}

.data-display pre {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.4;
}
</style>