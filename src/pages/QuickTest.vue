<template>
  <div class="quick-test">
    <h1>跨树拖拽快速测试</h1>
    
    <div class="status">
      <p><strong>crossTreeAutoUpdate:</strong> <span class="enabled">启用</span></p>
      <p><strong>测试说明:</strong> 将左侧节点拖拽到右侧树中，数据应该自动更新</p>
    </div>

    <div class="trees-container">
      <div class="tree-box">
        <div class="tree-header">
          <h3>源树 (Tree A)</h3>
          <button @click="clearTreeA" class="clear-btn" :disabled="treeA.length === 0">
            清空树A
          </button>
        </div>
        <Tree
          id="tree-a"
          v-model:value="treeA"
          :dragdrop="true"
          dragdrop-scope="cross-tree-test"
          :crossTreeAutoUpdate="true"
          @cross-tree-drop="onCrossTreeDrop"
          @node-drop="onNodeDrop"
          class="test-tree"
        />
        <div class="data-display">
          <strong>数据:</strong>
          <pre>{{ JSON.stringify(treeA, null, 2) }}</pre>
        </div>
      </div>

      <div class="tree-box">
        <div class="tree-header">
          <h3>目标树 (Tree B)</h3>
          <button @click="clearTreeB" class="clear-btn" :disabled="treeB.length === 0">
            清空树B
          </button>
        </div>
        <Tree
          id="tree-b"
          v-model:value="treeB"
          :dragdrop="true"
          dragdrop-scope="cross-tree-test"
          :crossTreeAutoUpdate="true"
          @cross-tree-drop="onCrossTreeDrop"
          @node-drop="onNodeDrop"
          class="test-tree"
        />
        <div class="data-display">
          <strong>数据:</strong>
          <pre>{{ JSON.stringify(treeB, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <div class="logs">
      <h3>操作日志</h3>
      <div class="log-list">
        <div v-for="(log, index) in logs" :key="index" class="log-item">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Tree from '@/components/Tree.vue'
import { removeTreeNode, insertTreeNode } from '@/lib/utils'
import type { TreeNode, CrossTreeDropEvent, TreeNodeDropEvent } from '@/lib/types'

// 简单的测试数据
const treeA = ref<TreeNode[]>([
  { key: 'a1', label: '节点 A1', draggable: true, droppable: true },
  { key: 'a2', label: '节点 A2', draggable: true, droppable: true }
])

const treeB = ref<TreeNode[]>([
  { key: 'b1', label: '节点 B1', draggable: true, droppable: true }
])

const logs = ref<Array<{ time: string; message: string }>>([])

// 添加日志
const addLog = (message: string) => {
  logs.value.push({
    time: new Date().toLocaleTimeString(),
    message
  })
  console.log(`[QuickTest] ${message}`)
}

// 跨树拖拽事件
const onCrossTreeDrop = (event: CrossTreeDropEvent) => {
  const isEmptyTreeDrop = event.dropNode.key === '__root__'
  
  if (isEmptyTreeDrop) {
    addLog(`🔄 空树拖拽: "${event.dragNode.label}" → 空树`)
    addLog(`🌲 源树: ${event.sourceTreeId}, 目标树: ${event.targetTreeId}`)
  } else {
    addLog(`🔄 跨树拖拽: "${event.dragNode.label}" → "${event.dropNode.label}"`)
    addLog(`📍 位置: ${event.dropPosition}`)
    addLog(`🌲 源树: ${event.sourceTreeId}, 目标树: ${event.targetTreeId}`)
  }
  
  try {
    // 确定源树和目标树
    let sourceTree: typeof treeA | typeof treeB
    let targetTree: typeof treeA | typeof treeB
    
    if (event.sourceTreeId === 'tree-a') {
      sourceTree = treeA
      targetTree = treeB
    } else if (event.sourceTreeId === 'tree-b') {
      sourceTree = treeB
      targetTree = treeA
    } else {
      addLog(`❌ 无法识别源树ID: ${event.sourceTreeId}`)
      return
    }
    
    // 从源树中移除节点
    const removeResult = removeTreeNode(sourceTree.value, event.dragNode.key)
    if (!removeResult.removedNode) {
      addLog(`❌ 无法从源树中找到节点: ${event.dragNode.key}`)
      return
    }
    
    // 更新源树数据
    sourceTree.value = removeResult.nodes
    addLog(`✅ 从源树移除节点: ${removeResult.removedNode.label}`)
    
    // 处理空树拖拽
    if (isEmptyTreeDrop) {
      // 直接添加到目标树的根级别
      targetTree.value = [...targetTree.value, removeResult.removedNode]
      addLog(`✅ 添加到空树根级别: ${removeResult.removedNode.label}`)
    } else {
      // 添加到目标树的指定位置
      const updatedTargetNodes = insertTreeNode(
        targetTree.value,
        event.dropNode.key,
        removeResult.removedNode,
        event.dropPosition
      )
      
      // 更新目标树数据
      targetTree.value = updatedTargetNodes
      addLog(`✅ 添加到目标树: ${removeResult.removedNode.label}`)
    }
    
    addLog(`🎉 跨树拖拽完成！数据已自动更新`)
    
    // 调用accept回调
    event.accept()
    
  } catch (error) {
    addLog(`❌ 跨树拖拽失败: ${error}`)
    console.error('跨树拖拽错误:', error)
    event.reject()
  }
}

// 普通拖拽事件
const onNodeDrop = (event: TreeNodeDropEvent) => {
  if (event.isCrossTree) {
    addLog(`🌲 检测到跨树拖拽事件`)
  } else {
    addLog(`🔄 同树拖拽: "${event.dragNode.label}" → "${event.dropNode.label}"`)
  }
}

// 清空树的方法
const clearTreeA = () => {
  treeA.value = []
  addLog('🗑️ 已清空树A - 现在可以测试向空树拖拽节点')
}

const clearTreeB = () => {
  treeB.value = []
  addLog('🗑️ 已清空树B - 现在可以测试向空树拖拽节点')
}

onMounted(() => {
  addLog('🚀 快速测试页面已加载')
  addLog('💡 请将左侧节点拖拽到右侧树中测试')
  addLog('💡 使用"清空树"按钮可以测试向空树拖拽功能')
})
</script>

<style scoped>
.quick-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

.status {
  background: #e8f5e8;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 2px solid #4caf50;
}

.enabled {
  color: #4caf50;
  font-weight: bold;
}

.trees-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.tree-box {
  border: 2px solid #2196f3;
  border-radius: 8px;
  padding: 15px;
  background: #f8f9fa;
}

.tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.tree-box h3 {
  margin: 0;
  color: #2196f3;
}

.clear-btn {
  padding: 6px 12px;
  background: #ff5722;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.clear-btn:hover:not(:disabled) {
  background: #d84315;
  transform: translateY(-1px);
}

.clear-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.test-tree {
  min-height: 150px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 15px;
}

.data-display {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
}

.data-display pre {
  margin: 5px 0 0 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.logs {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background: #fafafa;
}

.log-list {
  max-height: 200px;
  overflow-y: auto;
}

.log-item {
  display: flex;
  gap: 10px;
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}

.log-time {
  color: #666;
  font-size: 12px;
  min-width: 80px;
}

.log-message {
  flex: 1;
}
</style>