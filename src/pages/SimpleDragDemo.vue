<template>
  <div class="simple-drag-demo">
    <!-- 页面标题 -->
    <div class="demo-header">
      <h1 class="demo-title">简化拖拽排序Demo</h1>
      <p class="demo-description">
        演示本树拖拽排序和跨树拖拽功能，通过事件驱动的方式修改数据
      </p>
    </div>

    <!-- 拖拽区域 -->
    <div class="drag-container">
      <!-- 左侧树 -->
      <div class="tree-section">
        <h3 class="tree-title">左侧树 (tree1)</h3>
        <Tree
          ref="tree1Ref"
          :value="tree1Data"
          :tree-id="'tree1'"
          :dragdrop="true"
          :dragdropScope="'simple-demo'"
          :crossTreeAutoUpdate="false"
          :expanded-keys="tree1ExpandedKeys"
          class="demo-tree"
          @node-drop="onNodeDrop"
          @cross-tree-drop="onCrossTreeDrop"
          @update:expanded-keys="tree1ExpandedKeys = $event"
        />
      </div>

      <!-- 右侧树 -->
      <div class="tree-section">
        <h3 class="tree-title">右侧树 (tree2)</h3>
        <Tree
          ref="tree2Ref"
          :value="tree2Data"
          :tree-id="'tree2'"
          :dragdrop="true"
          :dragdropScope="'simple-demo'"
          :crossTreeAutoUpdate="false"
          :expanded-keys="tree2ExpandedKeys"
          class="demo-tree"
          @node-drop="onNodeDrop"
          @cross-tree-drop="onCrossTreeDrop"
          @update:expanded-keys="tree2ExpandedKeys = $event"
        />
      </div>
    </div>

    <!-- 事件日志 -->
    <div class="event-log-section">
      <div class="log-header">
        <h3 class="log-title">事件日志</h3>
        <div class="log-actions">
          <button @click="testCrossTreeDrag" class="test-btn">
            测试跨树拖拽
          </button>
          <button @click="clearEventLog" class="clear-btn">
            清空日志
          </button>
        </div>
      </div>
      <div class="event-log">
        <div 
          v-for="(log, index) in eventLogs" 
          :key="index"
          class="log-entry"
          :class="log.type"
        >
          <span class="log-time">{{ log.time }}</span>
          <span class="log-type">{{ log.type }}</span>
          <span class="log-message">{{ log.message }}</span>
          <div v-if="log.details" class="log-details">
            {{ JSON.stringify(log.details, null, 2) }}
          </div>
        </div>
        <div v-if="eventLogs.length === 0" class="no-logs">
          暂无事件日志
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import Tree from '@/components/Tree.vue'
import type { TreeNode, TreeExpandedKeys, TreeDropPosition } from '@/lib/types'
import { moveTreeNode, moveCrossTreeNode, extractTreeIdFromNodeKey } from '@/lib/utils'

// 事件日志类型
interface EventLog {
  time: string
  type: 'drag-start' | 'same-tree' | 'cross-tree' | 'error'
  message: string
  details?: any
}

// 响应式数据
const tree1Data = ref<TreeNode[]>([
  {
    key: 'tree1-1',
    label: '文档',
    draggable: true,
    children: [
      { key: 'tree1-1-1', label: '项目计划.docx', draggable: true },
      { key: 'tree1-1-2', label: '需求文档.pdf', draggable: true }
    ]
  },
  {
    key: 'tree1-2',
    label: '图片',
    draggable: true,
    children: [
      { key: 'tree1-2-1', label: '截图1.png', draggable: true },
      { key: 'tree1-2-2', label: '图标.svg', draggable: true }
    ]
  },
  {
    key: 'tree1-3',
    label: '代码文件.js',
    draggable: true
  }
])

const tree2Data = ref<TreeNode[]>([
  {
    key: 'tree2-1',
    label: '备份',
    draggable: true,
    children: [
      { key: 'tree2-1-1', label: '数据备份.zip', draggable: true }
    ]
  },
  {
    key: 'tree2-2',
    label: '临时文件',
    draggable: true,
    children: [
      { key: 'tree2-2-1', label: 'temp1.tmp', draggable: true },
      { key: 'tree2-2-2', label: 'temp2.tmp', draggable: true }
    ]
  }
])

const tree1ExpandedKeys = ref<TreeExpandedKeys>({
  'tree1-1': true,
  'tree1-2': true
})

const tree2ExpandedKeys = ref<TreeExpandedKeys>({
  'tree2-1': true,
  'tree2-2': true
})

const eventLogs = ref<EventLog[]>([])

// 组件引用
const tree1Ref = ref()
const tree2Ref = ref()

// 添加事件日志
const addEventLog = (type: EventLog['type'], message: string, details?: any) => {
  const log: EventLog = {
    time: new Date().toLocaleTimeString(),
    type,
    message,
    details
  }
  eventLogs.value.unshift(log)
  
  // 限制日志数量
  if (eventLogs.value.length > 50) {
    eventLogs.value = eventLogs.value.slice(0, 50)
  }
}

// 清空事件日志
const clearEventLog = () => {
  eventLogs.value = []
}

// 获取树数据引用
const getTreeDataRef = (treeId: string) => {
  if (treeId === 'tree1') return tree1Data
  if (treeId === 'tree2') return tree2Data
  return null
}

// 本树拖拽处理
const onNodeDrop = (event: any) => {
  addEventLog('drag-start', `开始处理拖拽: ${event.dragNode.label} → ${event.dropNode.label}`)
  
  try {
    // 确定源树ID
    const sourceTreeId = extractTreeIdFromNodeKey(event.dragNode.key) || 'tree1'
    const targetTreeId = extractTreeIdFromNodeKey(event.dropNode.key) || 'tree1'
    
    if (sourceTreeId === targetTreeId) {
      // 同树拖拽
      const treeDataRef = getTreeDataRef(sourceTreeId)
      if (!treeDataRef) {
        addEventLog('error', `未找到树数据: ${sourceTreeId}`)
        return
      }
      
      // 使用事件驱动的方式更新数据
      const updatedData = moveTreeNode(
        treeDataRef.value,
        event.dragNode.key,
        event.dropNode.key,
        event.dropPosition
      )
      
      // 通过响应式更新数据
      treeDataRef.value = updatedData
      
      addEventLog('same-tree', `同树拖拽完成: ${event.dragNode.label} 移动到 ${event.dropNode.label} (${event.dropPosition})`, {
        sourceTree: sourceTreeId,
        dragNode: event.dragNode.label,
        dropNode: event.dropNode.label,
        position: event.dropPosition
      })
      
      // 接受拖拽
      event.accept()
    }
  } catch (error) {
    addEventLog('error', `拖拽处理失败: ${error instanceof Error ? error.message : '未知错误'}`)
    console.error('拖拽处理失败:', error)
  }
}

// 跨树拖拽处理
const onCrossTreeDrop = (event: any) => {
  console.log('🌲 跨树拖拽事件触发:', event)
  
  addEventLog('drag-start', `开始处理跨树拖拽: ${event.dragNode?.label || '未知节点'} → ${event.dropNode?.label || '未知目标'}`)
  
  try {
    // 验证事件对象
    if (!event.dragNode || !event.dropNode) {
      addEventLog('error', '跨树拖拽事件缺少必要的节点信息')
      console.error('❌ 跨树拖拽事件无效:', { dragNode: event.dragNode, dropNode: event.dropNode })
      return
    }
    
    // 确定源树和目标树ID - 使用事件中的ID或从节点key提取
    const sourceTreeId = event.sourceTreeId || extractTreeIdFromNodeKey(event.dragNode.key) || 'tree1'
    const targetTreeId = event.targetTreeId || extractTreeIdFromNodeKey(event.dropNode.key) || 'tree2'
    
    console.log('🔍 跨树拖拽详细信息:', {
      sourceTreeId,
      targetTreeId,
      dragNodeKey: event.dragNode.key,
      dropNodeKey: event.dropNode.key,
      dropPosition: event.dropPosition,
      isCrossTree: event.isCrossTree
    })
    
    // 验证是否真的是跨树拖拽
    if (sourceTreeId === targetTreeId) {
      addEventLog('error', `不是跨树拖拽: 源树和目标树相同 (${sourceTreeId})`)
      console.warn('⚠️ 不是跨树拖拽，源树和目标树相同')
      return
    }
    
    const sourceTreeDataRef = getTreeDataRef(sourceTreeId)
    const targetTreeDataRef = getTreeDataRef(targetTreeId)
    
    if (!sourceTreeDataRef || !targetTreeDataRef) {
      addEventLog('error', `未找到树数据: source=${sourceTreeId}, target=${targetTreeId}`)
      console.error('❌ 未找到树数据引用:', { sourceTreeId, targetTreeId, sourceTreeDataRef, targetTreeDataRef })
      return
    }
    
    console.log('📊 拖拽前数据状态:', {
      sourceTreeLength: sourceTreeDataRef.value.length,
      targetTreeLength: targetTreeDataRef.value.length,
      sourceTreeData: sourceTreeDataRef.value,
      targetTreeData: targetTreeDataRef.value
    })
    
    // 使用事件驱动的方式处理跨树拖拽
    const result = moveCrossTreeNode(
      sourceTreeDataRef.value,
      targetTreeDataRef.value,
      event.dragNode.key,
      event.dropNode.key,
      event.dropPosition
    )
    
    console.log('🔄 跨树移动结果:', result)
    
    if (result.success) {
      // 通过响应式更新数据
      sourceTreeDataRef.value = result.sourceNodes
      targetTreeDataRef.value = result.targetNodes
      
      console.log('📊 拖拽后数据状态:', {
        sourceTreeLength: result.sourceNodes.length,
        targetTreeLength: result.targetNodes.length,
        sourceTreeData: result.sourceNodes,
        targetTreeData: result.targetNodes
      })
      
      addEventLog('cross-tree', `跨树拖拽完成: ${event.dragNode.label} 从 ${sourceTreeId} 移动到 ${targetTreeId} (${event.dropPosition})`, {
        sourceTree: sourceTreeId,
        targetTree: targetTreeId,
        dragNode: event.dragNode.label,
        dropNode: event.dropNode.label,
        position: event.dropPosition,
        sourceTreeLength: result.sourceNodes.length,
        targetTreeLength: result.targetNodes.length
      })
      
      // 接受拖拽
      if (typeof event.accept === 'function') {
        event.accept()
        console.log('✅ 跨树拖拽已接受')
      } else {
        console.warn('⚠️ 事件对象没有accept方法')
      }
    } else {
      addEventLog('error', `跨树拖拽失败: 数据更新失败 - 未知原因`)
      console.error('❌ 跨树拖拽数据更新失败:', result)
      
      // 拒绝拖拽
      if (typeof event.reject === 'function') {
        event.reject()
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    addEventLog('error', `跨树拖拽处理失败: ${errorMessage}`)
    console.error('❌ 跨树拖拽处理异常:', error)
    
    // 拒绝拖拽
    if (typeof event.reject === 'function') {
      event.reject()
    }
  }
}

// 测试跨树拖拽功能
const testCrossTreeDrag = () => {
  console.log('🧪 开始测试跨树拖拽功能')
  addEventLog('drag-start', '开始测试跨树拖拽功能')
  
  // 查找源节点（从tree1）
  const sourceNode = tree1Data.value[0]?.children?.[0] // 获取第一个子节点
  if (!sourceNode) {
    addEventLog('error', '找不到源节点进行测试')
    console.error('❌ 找不到源节点')
    return
  }
  
  // 查找目标节点（从tree2）
  const targetNode = tree2Data.value[0] // 获取tree2的根节点
  if (!targetNode) {
    addEventLog('error', '找不到目标节点进行测试')
    console.error('❌ 找不到目标节点')
    return
  }
  
  console.log('✅ 找到测试节点:', {
    sourceNode: { key: sourceNode.key, label: sourceNode.label },
    targetNode: { key: targetNode.key, label: targetNode.label }
  })
  
  // 模拟跨树拖拽事件
  const mockEvent = {
    originalEvent: new Event('drop'),
    dragNode: sourceNode,
    dropNode: targetNode,
    dropPosition: 'inside' as const,
    sourceTreeId: 'tree1',
    targetTreeId: 'tree2',
    isCrossTree: true,
    accept: () => {
      console.log('✅ 测试拖拽被接受')
      addEventLog('cross-tree', '测试跨树拖拽成功完成')
    },
    reject: () => {
      console.log('❌ 测试拖拽被拒绝')
      addEventLog('error', '测试跨树拖拽被拒绝')
    }
  }
  
  console.log('🚀 执行测试跨树拖拽:', mockEvent)
  addEventLog('drag-start', `测试拖拽: ${sourceNode.label} → ${targetNode.label}`)
  
  // 调用跨树拖拽处理函数
  onCrossTreeDrop(mockEvent)
}
</script>

<style scoped>
.simple-drag-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: 30px;
}

.demo-title {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 10px;
}

.demo-description {
  font-size: 1rem;
  color: #6b7280;
  max-width: 600px;
  margin: 0 auto;
}

.drag-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.tree-section {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  background: #f9fafb;
}

.tree-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 15px;
  text-align: center;
}

.demo-tree {
  min-height: 300px;
  background: white;
  border-radius: 6px;
  padding: 15px;
  border: 1px solid #d1d5db;
}

.event-log-section {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  background: #f9fafb;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.log-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
}

.log-actions {
  display: flex;
  gap: 10px;
}

.test-btn {
  padding: 6px 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.test-btn:hover {
  background: #2563eb;
}

.clear-btn {
  padding: 6px 12px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.clear-btn:hover {
  background: #dc2626;
}

.event-log {
  background: white;
  border-radius: 6px;
  padding: 15px;
  border: 1px solid #d1d5db;
  max-height: 400px;
  overflow-y: auto;
}

.log-entry {
  padding: 8px 12px;
  margin-bottom: 8px;
  border-radius: 4px;
  border-left: 4px solid #d1d5db;
  background: #f8fafc;
}

.log-entry.drag-start {
  border-left-color: #3b82f6;
  background: #eff6ff;
}

.log-entry.same-tree {
  border-left-color: #10b981;
  background: #ecfdf5;
}

.log-entry.cross-tree {
  border-left-color: #8b5cf6;
  background: #f3e8ff;
}

.log-entry.error {
  border-left-color: #ef4444;
  background: #fef2f2;
}

.log-time {
  font-size: 0.75rem;
  color: #6b7280;
  margin-right: 8px;
}

.log-type {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-right: 8px;
  padding: 2px 6px;
  border-radius: 3px;
  background: #e5e7eb;
  color: #374151;
}

.log-entry.drag-start .log-type {
  background: #dbeafe;
  color: #1e40af;
}

.log-entry.same-tree .log-type {
  background: #d1fae5;
  color: #065f46;
}

.log-entry.cross-tree .log-type {
  background: #e9d5ff;
  color: #5b21b6;
}

.log-entry.error .log-type {
  background: #fecaca;
  color: #991b1b;
}

.log-message {
  font-size: 0.875rem;
  color: #374151;
}

.log-details {
  margin-top: 8px;
  padding: 8px;
  background: #f1f5f9;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.75rem;
  color: #475569;
  white-space: pre-wrap;
  overflow-x: auto;
}

.no-logs {
  text-align: center;
  color: #9ca3af;
  font-style: italic;
  padding: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .drag-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .demo-title {
    font-size: 1.5rem;
  }
  
  .simple-drag-demo {
    padding: 15px;
  }
}
</style>