import { ref, computed, reactive } from 'vue'
import type { TreeNode, PendingOperation, UseCrossTreeDragStateReturn, CrossTreeDragState } from '../lib/types'

/**
 * 跨树拖拽状态管理 Composable
 * 提供全局的跨树拖拽状态管理功能
 */

// 全局状态
const globalCrossTreeState = ref<CrossTreeDragState>({
  dragNode: null,
  sourceTreeId: null,
  targetTreeId: null,
  dropNode: null,
  dropPosition: null,
  isDragging: false,
  isActive: false,
  autoUpdate: false,
  startTime: 0,
  lastUpdateTime: 0
})

// 全局待确认操作列表
const globalPendingOperations = ref<PendingOperation[]>([])

// 跨树拖拽统计信息
const crossTreeStats = reactive({
  totalOperations: 0,
  successfulOperations: 0,
  failedOperations: 0,
  pendingCount: 0,
  averageProcessingTime: 0
})

/**
 * 跨树拖拽状态管理 Composable
 */
export function useCrossTreeDragState(): UseCrossTreeDragStateReturn {
  // 计算属性
  const isActive = computed(() => globalCrossTreeState.value.isActive)
  const isDragging = computed(() => globalCrossTreeState.value.isDragging)
  const currentDragNode = computed(() => globalCrossTreeState.value.dragNode)
  const sourceTreeId = computed(() => globalCrossTreeState.value.sourceTreeId)
  const targetTreeId = computed(() => globalCrossTreeState.value.targetTreeId)
  const pendingOperations = computed(() => globalPendingOperations.value)
  const pendingCount = computed(() => globalPendingOperations.value.length)
  
  // 开始跨树拖拽
  const startCrossTreeDrag = (
    dragNode: TreeNode,
    sourceTreeId: string,
    autoUpdate: boolean = false
  ) => {
    const now = Date.now()
    
    globalCrossTreeState.value = {
      dragNode,
      sourceTreeId,
      targetTreeId: null,
      dropNode: null,
      dropPosition: null,
      isDragging: true,
      isActive: true,
      autoUpdate,
      startTime: now,
      lastUpdateTime: now
    }
    
  }
  
  // 更新目标信息
  const updateTarget = (
    targetTreeId: string,
    dropNode?: TreeNode,
    dropPosition?: string
  ) => {
    if (!globalCrossTreeState.value.isActive) return
    
    globalCrossTreeState.value.targetTreeId = targetTreeId
    globalCrossTreeState.value.dropNode = dropNode || null
    globalCrossTreeState.value.dropPosition = dropPosition || null
    globalCrossTreeState.value.lastUpdateTime = Date.now()
    
  }
  
  // 结束跨树拖拽
  const endCrossTreeDrag = (success: boolean = false) => {
    if (!globalCrossTreeState.value.isActive) return
    
    const duration = Date.now() - globalCrossTreeState.value.startTime
    
    // 更新统计信息
    crossTreeStats.totalOperations++
    if (success) {
      crossTreeStats.successfulOperations++
    } else {
      crossTreeStats.failedOperations++
    }
    
    // 计算平均处理时间
    crossTreeStats.averageProcessingTime = 
      (crossTreeStats.averageProcessingTime * (crossTreeStats.totalOperations - 1) + duration) / 
      crossTreeStats.totalOperations
    
    
    // 重置状态
    globalCrossTreeState.value = {
      dragNode: null,
      sourceTreeId: null,
      targetTreeId: null,
      dropNode: null,
      dropPosition: null,
      isDragging: false,
      isActive: false,
      autoUpdate: false,
      startTime: 0,
      lastUpdateTime: 0
    }
  }
  
  // 添加待确认操作
  const addPendingOperation = (operation: PendingOperation) => {
    globalPendingOperations.value.push(operation)
    crossTreeStats.pendingCount = globalPendingOperations.value.length
    
  }
  
  // 移除待确认操作
  const removePendingOperation = (operationId: string) => {
    const index = globalPendingOperations.value.findIndex(op => op.id === operationId)
    if (index !== -1) {
      const operation = globalPendingOperations.value[index]
      globalPendingOperations.value.splice(index, 1)
      crossTreeStats.pendingCount = globalPendingOperations.value.length
      
    }
  }
  
  // 清除所有待确认操作
  const clearAllPendingOperations = () => {
    const count = globalPendingOperations.value.length
    globalPendingOperations.value = []
    crossTreeStats.pendingCount = 0
    
  }
  
  // 获取特定树的待确认操作
  const getPendingOperationsForTree = (treeId: string) => {
    return globalPendingOperations.value.filter(
      op => op.beforeDrag.sourceTreeId === treeId || op.afterDrop.targetTreeId === treeId
    )
  }
  
  // 检查是否有跨树拖拽到指定树
  const hasCrossTreeDragToTree = (treeId: string) => {
    return globalCrossTreeState.value.isActive && 
           globalCrossTreeState.value.targetTreeId === treeId &&
           globalCrossTreeState.value.sourceTreeId !== treeId
  }
  
  // 检查是否有跨树拖拽从指定树开始
  const hasCrossTreeDragFromTree = (treeId: string) => {
    return globalCrossTreeState.value.isActive && 
           globalCrossTreeState.value.sourceTreeId === treeId
  }
  
  // 获取当前拖拽信息
  const getCurrentDragInfo = () => {
    if (!globalCrossTreeState.value.isActive) return null
    
    return {
      dragNode: globalCrossTreeState.value.dragNode,
      sourceTreeId: globalCrossTreeState.value.sourceTreeId,
      targetTreeId: globalCrossTreeState.value.targetTreeId,
      dropNode: globalCrossTreeState.value.dropNode,
      dropPosition: globalCrossTreeState.value.dropPosition,
      autoUpdate: globalCrossTreeState.value.autoUpdate,
      duration: Date.now() - globalCrossTreeState.value.startTime
    }
  }
  
  // 重置所有状态
  const resetAllState = () => {
    endCrossTreeDrag(false)
    clearAllPendingOperations()
    
    // 重置统计信息
    Object.assign(crossTreeStats, {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      pendingCount: 0,
      averageProcessingTime: 0
    })
    
  }
  
  return {
    // 状态
    globalState: globalCrossTreeState,
    isActive,
    isDragging,
    currentDragNode,
    sourceTreeId,
    targetTreeId,
    pendingOperations,
    pendingCount,
    stats: crossTreeStats,
    
    // 方法
    startCrossTreeDrag,
    updateTarget,
    endCrossTreeDrag,
    addPendingOperation,
    removePendingOperation,
    clearAllPendingOperations,
    getPendingOperationsForTree,
    hasCrossTreeDragToTree,
    hasCrossTreeDragFromTree,
    getCurrentDragInfo,
    resetAllState
  }
}

// 导出全局状态访问器（用于调试和监控）
export const getCrossTreeDragState = (): CrossTreeDragState => globalCrossTreeState.value
export const getPendingOperations = (): PendingOperation[] => globalPendingOperations.value
export const getCrossTreeStats = () => crossTreeStats