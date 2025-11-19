/**
 * 跨树拖拽管理器
 * 简化跨树拖拽的实现，让组件内部自动处理跨树拖拽逻辑
 */

import { ref, reactive, computed } from 'vue'
import type { TreeNode, TreeDropPosition } from '../lib/types'
import { moveCrossTreeNode } from '../lib/utils'

// 全局跨树拖拽状态
interface CrossTreeState {
  /** 当前拖拽的节点 */
  dragNode: TreeNode | null
  /** 源树ID */
  sourceTreeId: string | null
  /** 源树组名 */
  sourceGroup: string | null
  /** 拖拽开始时间 */
  startTime: number | null
  /** 是否正在拖拽 */
  isDragging: boolean
}

// 树实例注册信息
interface TreeInstance {
  /** 树ID */
  id: string
  /** 树组名 */
  group: string | null
  /** 树数据的响应式引用 */
  dataRef: any
  /** 更新树数据的方法 */
  updateData: (data: TreeNode[]) => void
  /** 触发事件的方法 */
  emit: (event: string, ...args: any[]) => void
  /** 获取展开状态的方法 */
  getExpandedKeys?: () => Record<string | number, boolean>
  /** 设置展开状态的方法 */
  setExpandedKeys?: (keys: Record<string | number, boolean>) => void
}

// 全局状态
const globalState = reactive<CrossTreeState>({
  dragNode: null,
  sourceTreeId: null,
  sourceGroup: null,
  startTime: null,
  isDragging: false
})

// 注册的树实例
const treeInstances = new Map<string, TreeInstance>()

/**
 * 跨树拖拽管理器返回类型
 */
export interface UseCrossTreeManagerReturn {
  isDragging: any
  currentDragNode: any
  sourceTreeId: any
  registerTree: (
    id: string,
    group: string | null,
    dataRef: any,
    updateData: (data: TreeNode[]) => void,
    emit: (event: string, ...args: any[]) => void,
    getExpandedKeys?: () => Record<string | number, boolean>,
    setExpandedKeys?: (keys: Record<string | number, boolean>) => void
  ) => void
  unregisterTree: (id: string) => void
  startCrossTreeDrag: (dragNode: TreeNode, sourceTreeId: string, sourceGroup: string | null) => void
  endCrossTreeDrag: () => void
  canCrossTreeDrop: (targetTreeId: string, targetGroup: string | null) => boolean
  performCrossTreeDrop: (targetTreeId: string, dropNode: TreeNode, dropPosition: TreeDropPosition) => boolean
  getCrossTreeDragInfo: (dataTransfer?: DataTransfer) => any
  setCrossTreeDragData: (dataTransfer: DataTransfer) => void
}

/**
 * 跨树拖拽管理器
 */
export function useCrossTreeManager(): UseCrossTreeManagerReturn {
  
  /**
   * 注册树实例
   */
  const registerTree = (
    id: string,
    group: string | null,
    dataRef: any,
    updateData: (data: TreeNode[]) => void,
    emit: (event: string, ...args: any[]) => void,
    getExpandedKeys?: () => Record<string | number, boolean>,
    setExpandedKeys?: (keys: Record<string | number, boolean>) => void
  ) => {
    treeInstances.set(id, {
      id,
      group,
      dataRef,
      updateData,
      emit,
      getExpandedKeys,
      setExpandedKeys
    })
    
    console.log(`🌲 注册树实例: ${id}, 组: ${group || '无'}`)
  }
  
  /**
   * 注销树实例
   */
  const unregisterTree = (id: string) => {
    treeInstances.delete(id)
    console.log(`🗑️ 注销树实例: ${id}`)
  }
  
  /**
   * 开始跨树拖拽
   */
  const startCrossTreeDrag = (
    dragNode: TreeNode,
    sourceTreeId: string,
    sourceGroup: string | null
  ) => {
    globalState.dragNode = dragNode
    globalState.sourceTreeId = sourceTreeId
    globalState.sourceGroup = sourceGroup
    globalState.startTime = Date.now()
    globalState.isDragging = true
    
    console.log(`🚀 开始跨树拖拽: ${dragNode.label} 从 ${sourceTreeId}`)
    
    // 在 dataTransfer 中设置跨树拖拽信息
    if (typeof window !== 'undefined') {
      // 设置全局拖拽数据，供其他树使用
      (window as any).__crossTreeDragData = {
        dragNode,
        sourceTreeId,
        sourceGroup,
        startTime: globalState.startTime
      }
    }
  }
  
  /**
   * 结束跨树拖拽
   */
  const endCrossTreeDrag = () => {
    globalState.dragNode = null
    globalState.sourceTreeId = null
    globalState.sourceGroup = null
    globalState.startTime = null
    globalState.isDragging = false
    
    // 清理全局拖拽数据
    if (typeof window !== 'undefined') {
      delete (window as any).__crossTreeDragData
    }
    
    console.log(`🏁 结束跨树拖拽`)
  }
  
  /**
   * 检查是否可以跨树拖拽
   */
  const canCrossTreeDrop = (targetTreeId: string, targetGroup: string | null): boolean => {
    if (!globalState.isDragging || !globalState.sourceTreeId) {
      return false
    }
    
    // 不能拖拽到同一个树
    if (globalState.sourceTreeId === targetTreeId) {
      return false
    }
    
    // 检查组名匹配
    if (globalState.sourceGroup && targetGroup) {
      return globalState.sourceGroup === targetGroup
    }
    
    // 如果没有组名限制，允许跨树拖拽
    return true
  }
  
  /**
   * 收集节点及其所有子节点的展开状态
   */
  const collectExpandedState = (node: TreeNode, expandedKeys: Record<string | number, boolean>): Record<string | number, boolean> => {
    const result: Record<string | number, boolean> = {}
    
    const collect = (n: TreeNode) => {
      if (expandedKeys[n.key]) {
        result[n.key] = true
      }
      if (n.children) {
        n.children.forEach(child => collect(child))
      }
    }
    
    collect(node)
    return result
  }
  
  /**
   * 更新节点key并保持展开状态的映射关系
   */
  const updateExpandedKeysForCrossTree = (
    oldExpandedKeys: Record<string | number, boolean>,
    oldKey: string | number,
    newKey: string | number,
    node: TreeNode
  ): Record<string | number, boolean> => {
    const result = { ...oldExpandedKeys }
    
    // 递归更新节点及其子节点的展开状态key
    const updateKeys = (n: TreeNode, oldPrefix: string, newPrefix: string) => {
      const oldNodeKey = n.key.toString()
      const newNodeKey = oldNodeKey.replace(oldPrefix, newPrefix)
      
      if (result[n.key]) {
        delete result[n.key]
        result[newNodeKey] = true
      }
      
      if (n.children) {
        n.children.forEach(child => updateKeys(child, oldPrefix, newPrefix))
      }
    }
    
    // 提取树ID前缀
    const oldKeyStr = oldKey.toString()
    const newKeyStr = newKey.toString()
    const oldPrefix = oldKeyStr.split('-')[0]
    const newPrefix = newKeyStr.split('-')[0]
    
    if (oldPrefix !== newPrefix) {
      updateKeys(node, oldPrefix, newPrefix)
    }
    
    return result
  }
  
  /**
   * 执行跨树拖拽
   */
  const performCrossTreeDrop = (
    targetTreeId: string,
    dropNode: TreeNode,
    dropPosition: TreeDropPosition
  ): boolean => {
    if (!globalState.dragNode || !globalState.sourceTreeId) {
      console.error('❌ 跨树拖拽状态无效')
      return false
    }
    
    const sourceTree = treeInstances.get(globalState.sourceTreeId)
    const targetTree = treeInstances.get(targetTreeId)
    
    if (!sourceTree || !targetTree) {
      console.error('❌ 找不到源树或目标树实例')
      return false
    }
    
    try {
      // 获取当前数据
      const sourceData = sourceTree.dataRef.value || []
      const targetData = targetTree.dataRef.value || []
      
      console.log('🔄 执行跨树数据移动:', {
        dragNode: globalState.dragNode.label,
        dropNode: dropNode.label,
        dropPosition,
        sourceTreeId: globalState.sourceTreeId,
        targetTreeId
      })
      
      // 收集被拖拽节点的展开状态
      let dragNodeExpandedState: Record<string | number, boolean> = {}
      if (sourceTree.getExpandedKeys) {
        const sourceExpandedKeys = sourceTree.getExpandedKeys()
        dragNodeExpandedState = collectExpandedState(globalState.dragNode, sourceExpandedKeys)
        console.log('📋 收集到的展开状态:', dragNodeExpandedState)
      }
      
      // 执行数据移动
      const result = moveCrossTreeNode(
        sourceData,
        targetData,
        globalState.dragNode.key,
        dropNode.key,
        dropPosition
      )
      
      if (result.success) {
        // 更新两个树的数据
        sourceTree.updateData(result.sourceNodes)
        targetTree.updateData(result.targetNodes)
        
        // 传递展开状态到目标树
        if (Object.keys(dragNodeExpandedState).length > 0 && targetTree.setExpandedKeys && targetTree.getExpandedKeys) {
          const targetExpandedKeys = targetTree.getExpandedKeys()
          
          // 更新展开状态的key（从源树ID前缀改为目标树ID前缀）
          const updatedExpandedState = updateExpandedKeysForCrossTree(
            dragNodeExpandedState,
            globalState.dragNode.key,
            globalState.dragNode.key, // 这里会在 moveCrossTreeNode 中更新
            globalState.dragNode
          )
          
          // 合并到目标树的展开状态
          const newTargetExpandedKeys = { ...targetExpandedKeys, ...updatedExpandedState }
          targetTree.setExpandedKeys(newTargetExpandedKeys)
          console.log('✅ 展开状态已传递到目标树')
          
          // 从源树移除已移动节点的展开状态
          if (sourceTree.setExpandedKeys && sourceTree.getExpandedKeys) {
            const sourceExpandedKeys = sourceTree.getExpandedKeys()
            const newSourceExpandedKeys = { ...sourceExpandedKeys }
            Object.keys(dragNodeExpandedState).forEach(key => {
              delete newSourceExpandedKeys[key]
            })
            sourceTree.setExpandedKeys(newSourceExpandedKeys)
          }
        }
        
        // 触发跨树移动事件
        const moveEvent = {
          dragNode: globalState.dragNode,
          dropNode,
          dropPosition,
          sourceTreeId: globalState.sourceTreeId,
          targetTreeId,
          sourceData,
          targetData,
          newSourceData: result.sourceNodes,
          newTargetData: result.targetNodes
        }
        
        // 在源树和目标树上都触发事件
        sourceTree.emit('cross-tree-move', moveEvent)
        targetTree.emit('cross-tree-move', moveEvent)
        
        console.log('✅ 跨树拖拽成功')
        return true
      } else {
        console.error('❌ 跨树数据移动失败')
        return false
      }
    } catch (error) {
      console.error('❌ 跨树拖拽异常:', error)
      return false
    }
  }
  
  /**
   * 从 dataTransfer 或全局状态获取拖拽信息
   */
  const getCrossTreeDragInfo = (dataTransfer?: DataTransfer) => {
    // 优先从全局状态获取
    if (globalState.isDragging && globalState.dragNode) {
      return {
        dragNode: globalState.dragNode,
        sourceTreeId: globalState.sourceTreeId,
        sourceGroup: globalState.sourceGroup,
        startTime: globalState.startTime
      }
    }
    
    // 从全局变量获取（跨窗口/iframe 场景）
    if (typeof window !== 'undefined' && (window as any).__crossTreeDragData) {
      return (window as any).__crossTreeDragData
    }
    
    // 从 dataTransfer 获取（传统方式）
    if (dataTransfer) {
      try {
        const data = dataTransfer.getData('application/cross-tree-drag')
        if (data) {
          return JSON.parse(data)
        }
      } catch (error) {
        console.warn('解析 dataTransfer 中的跨树拖拽数据失败:', error)
      }
    }
    
    return null
  }
  
  /**
   * 设置 dataTransfer 数据
   */
  const setCrossTreeDragData = (dataTransfer: DataTransfer) => {
    if (globalState.dragNode && globalState.sourceTreeId) {
      const data = {
        dragNode: globalState.dragNode,
        sourceTreeId: globalState.sourceTreeId,
        sourceGroup: globalState.sourceGroup,
        startTime: globalState.startTime
      }
      
      try {
        dataTransfer.setData('application/cross-tree-drag', JSON.stringify(data))
        dataTransfer.setData('text/plain', globalState.dragNode.label)
      } catch (error) {
        console.warn('设置 dataTransfer 数据失败:', error)
      }
    }
  }
  
  // 计算属性
  const isDragging = computed(() => globalState.isDragging)
  const currentDragNode = computed(() => globalState.dragNode)
  const sourceTreeId = computed(() => globalState.sourceTreeId)
  
  return {
    // 状态
    isDragging,
    currentDragNode,
    sourceTreeId,
    
    // 方法
    registerTree,
    unregisterTree,
    startCrossTreeDrag,
    endCrossTreeDrag,
    canCrossTreeDrop,
    performCrossTreeDrop,
    getCrossTreeDragInfo,
    setCrossTreeDragData
  }
}