<template>
  <div class="user-tree-example">
    <h2>用户拖拽树示例</h2>
    <p>这是一个完整的拖拽树使用示例，包含正确的事件处理</p>
    
    <!-- 正确的 Tree 组件使用方式 -->
    <Tree 
      :value="treeData" 
      selection-mode="single" 
      :dragdrop="true" 
      dragdrop-scope="cross-tree" 
      @node-select="onNodeSelect"
      @node-drop="onNodeDrop"
    />
    
    <!-- 事件日志 -->
    <div class="event-log" v-if="eventLogs.length > 0">
      <h3>事件日志</h3>
      <div class="log-item" v-for="(log, index) in eventLogs" :key="index">
        <span class="log-time">{{ log.time }}</span>
        <span class="log-message">{{ log.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Tree from '../components/Tree.vue'
import type { TreeNode, TreeNodeDropEvent, TreeNodeSelectEvent } from '../lib/types'
import { moveTreeNode } from '../lib/utils'

// 树数据
const treeData = ref<TreeNode[]>([
  {
    key: '1',
    label: '文档',
    draggable: true,
    droppable: true,
    children: [
      {
        key: '1-1',
        label: '工作文档',
        draggable: true,
        droppable: true,
        children: [
          { key: '1-1-1', label: '项目计划.doc', draggable: true, droppable: true },
          { key: '1-1-2', label: '需求文档.pdf', draggable: true, droppable: true },
        ]
      },
      {
        key: '1-2',
        label: '个人文档',
        draggable: true,
        droppable: true,
        children: [
          { key: '1-2-1', label: '简历.pdf', draggable: true, droppable: true },
          { key: '1-2-2', label: '笔记.md', draggable: true, droppable: true },
        ]
      }
    ]
  },
  {
    key: '2',
    label: '图片',
    draggable: true,
    droppable: true,
    children: [
      { key: '2-1', label: '头像.jpg', draggable: true, droppable: true },
      { key: '2-2', label: '背景.png', draggable: true, droppable: true },
    ]
  },
  {
    key: '3',
    label: '代码',
    draggable: true,
    droppable: true,
    children: [
      { key: '3-1', label: 'main.ts', draggable: true, droppable: true },
      { key: '3-2', label: 'App.vue', draggable: true, droppable: true },
    ]
  }
])

// 事件日志
const eventLogs = ref<Array<{ time: string, message: string }>>([])

// 添加日志
const addLog = (message: string) => {
  const time = new Date().toLocaleTimeString()
  eventLogs.value.unshift({ time, message })
  // 只保留最近10条日志
  if (eventLogs.value.length > 10) {
    eventLogs.value = eventLogs.value.slice(0, 10)
  }
}

// 节点选择事件处理
const onNodeSelect = (event: TreeNodeSelectEvent) => {
  addLog(`选择节点: ${event.node.label}`)
  console.log('节点选择:', event)
}

// 关键：节点拖拽事件处理 - 这是解决问题的核心
const onNodeDrop = (event: TreeNodeDropEvent) => {
  console.log('拖拽事件:', event)
  
  try {
    // 使用 moveTreeNode 工具函数更新树数据
    const updatedData = moveTreeNode(
      treeData.value,
      event.dragNode.key,
      event.dropNode.key,
      event.dropPosition
    )
    
    // 更新树数据 - 这一步是关键！
    treeData.value = updatedData
    
    // 添加日志
    addLog(`拖拽成功: "${event.dragNode.label}" 移动到 "${event.dropNode.label}" ${event.dropPosition}`)
    
    // 接受拖拽操作
    event.accept()
    
  } catch (error) {
    console.error('拖拽失败:', error)
    addLog(`拖拽失败: ${error}`)
    // 不调用 event.accept()，拒绝拖拽操作
  }
}
</script>

<style scoped>
.user-tree-example {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.user-tree-example h2 {
  color: #333;
  margin-bottom: 10px;
}

.user-tree-example p {
  color: #666;
  margin-bottom: 20px;
}

.event-log {
  margin-top: 30px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
}

.event-log h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.log-item {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
  font-family: monospace;
  font-size: 14px;
}

.log-time {
  color: #666;
  min-width: 80px;
}

.log-message {
  color: #333;
}
</style>