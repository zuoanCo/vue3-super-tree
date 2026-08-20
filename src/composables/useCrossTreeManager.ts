/**
 * 跨树拖拽管理器
 * 简化跨树拖拽的实现，让组件内部自动处理跨树拖拽逻辑
 */

import { ref, reactive, computed } from 'vue'
import type { TreeNode, TreeDropPosition, CrossTreeDataProvider } from '../lib/types'
import { moveCrossTreeNode, moveCrossTreeNodes } from '../lib/utils'

// 全局跨树拖拽状态
interface CrossTreeState {
  /** 当前拖拽的节点 */
  dragNode: TreeNode | null
  /** 多选拖拽时所有选中的节点（含 dragNode） */
  selectedNodes: TreeNode[] | null
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
  /** 可选的跨树数据提供者（提供时优先于 dataRef/updateData） */
  dataProvider?: CrossTreeDataProvider
}

// 全局状态
const globalState = reactive<CrossTreeState>({
  dragNode: null,
  selectedNodes: null,
  sourceTreeId: null,
  sourceGroup: null,
  startTime: null,
  isDragging: false
})

// 注册的树实例
const treeInstances = new Map<string, TreeInstance>()

/**
 * 跨树拖拽管理器
 */
export function useCrossTreeManager() {
  
  /**
   * 注册树实例
   */
  const registerTree = (
    id: string,
    group: string | null,
    dataRef: any,
    updateData: (data: TreeNode[]) => void,
    emit: (event: string, ...args: any[]) => void,
    dataProvider?: CrossTreeDataProvider
  ) => {
    treeInstances.set(id, {
      id,
      group,
      dataRef,
      updateData,
      emit,
      dataProvider
    })

  }
  
  /**
   * 注销树实例
   */
  const unregisterTree = (id: string) => {
    treeInstances.delete(id)
  }
  
  /**
   * 开始跨树拖拽
   */
  const startCrossTreeDrag = (
    dragNode: TreeNode,
    sourceTreeId: string,
    sourceGroup: string | null,
    selectedNodes?: TreeNode[] | null
  ) => {
    globalState.dragNode = dragNode
    globalState.selectedNodes = selectedNodes && selectedNodes.length > 1 ? selectedNodes : null
    globalState.sourceTreeId = sourceTreeId
    globalState.sourceGroup = sourceGroup
    globalState.startTime = Date.now()
    globalState.isDragging = true
    
    
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
    globalState.selectedNodes = null
    globalState.sourceTreeId = null
    globalState.sourceGroup = null
    globalState.startTime = null
    globalState.isDragging = false
    
    // 清理全局拖拽数据
    if (typeof window !== 'undefined') {
      delete (window as any).__crossTreeDragData
    }
    
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

    // 组名必须匹配（含双方都未设置的情况）；仅一方设置组名时拒绝，
    // 否则有组隔离的树会被任意无组树突破
    return globalState.sourceGroup === targetGroup
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
    
    // 读取/写回数据时优先使用 CrossTreeDataProvider，否则用注册的响应式引用
    const getData = (tree: TreeInstance): TreeNode[] => {
      if (tree.dataProvider) {
        return tree.dataProvider.getTreeData(tree.id) || []
      }
      return tree.dataRef.value || []
    }
    const setData = (tree: TreeInstance, data: TreeNode[]) => {
      if (tree.dataProvider) {
        tree.dataProvider.updateTreeData(tree.id, data)
      } else {
        tree.updateData(data)
      }
    }

    try {
      // 获取当前数据
      const sourceData = getData(sourceTree)
      const targetData = getData(targetTree)

      // 多选拖拽时移动所有选中节点，否则只移动拖拽节点
      const dragKeys = (globalState.selectedNodes && globalState.selectedNodes.length > 1)
        ? globalState.selectedNodes.map(n => n.key)
        : [globalState.dragNode.key]


      // 执行数据移动
      const result = dragKeys.length > 1
        ? moveCrossTreeNodes(sourceData, targetData, dragKeys, dropNode.key, dropPosition)
        : moveCrossTreeNode(sourceData, targetData, dragKeys[0], dropNode.key, dropPosition)

      if (result.success) {
        // 更新两个树的数据
        setData(sourceTree, result.sourceNodes)
        setData(targetTree, result.targetNodes)

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