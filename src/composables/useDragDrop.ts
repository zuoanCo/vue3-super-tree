import { ref, computed, type Ref } from 'vue'
import type { 
  TreeNode, 
  TreeDropPosition, 
  DragDropState,
  TreeNodeDropEvent,
  UseDragDropReturn,
  CrossTreeDragStartEvent,
  CrossTreeDragEnterEvent,
  CrossTreeDragOverEvent,
  CrossTreeDragLeaveEvent,
  CrossTreeDropEvent,
  CrossTreeDragEndEvent,
  CrossTreeDragCancelEvent
} from '../lib/types'
import { canDropNode, canCrossTreeDrop, findTreeNodeWithParent } from '../lib/utils'
import { useCrossTreeDragState } from './useCrossTreeDragState'

// 标记本次拖拽会话是否已产生 drop 事件（模块级，源树与目标树实例共享）
// 用于 dragend 时区分"已处理（accept/reject 会发结束事件）"与"取消（ESC/无效位置）"
let dropHandledInSession = false

// 全局拖拽状态，用于跨树拖拽
const globalDragState = ref<DragDropState>({
  dragNode: null,
  dropNode: null,
  dropPosition: null,
  isDragging: false,
  dragScope: undefined,
  dragStartPosition: undefined,
  sourceTreeId: undefined,
  targetTreeId: undefined
})

// 性能优化：防抖函数
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: number | null = null
  return ((...args: any[]) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }) as T
}

// 性能优化：节流函数
function throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
  let inThrottle: boolean = false
  return ((...args: any[]) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }) as T
}

// 性能优化：缓存DOM查询结果
const domCache = new Map<string, HTMLElement[]>()

// 内存优化：清理缓存的函数
function clearDomCache() {
  domCache.clear()
}

// 内存优化：定期清理缓存
let cacheCleanupTimer: number | null = null
function scheduleCacheCleanup() {
  if (cacheCleanupTimer) clearTimeout(cacheCleanupTimer)
  cacheCleanupTimer = setTimeout(() => {
    clearDomCache()
    cacheCleanupTimer = null
  }, 30000) // 30秒后清理缓存
}

/**
 * 拖拽功能 Composable
 * 管理拖拽状态和拖拽逻辑
 */
export function useDragDrop(
  nodes: Ref<TreeNode[]>,
  dragdropScope?: string,
  treeId?: string,
  onHoverChange?: (hoverInfo: {
    targetTreeId?: string
    dropPosition?: string
    dropNodeLabel?: string
    isCrossTree?: boolean
  } | null) => void,
  emitCrossTreeEvent?: (eventName: string, event: any) => void,
  selectionState?: {
    isSelected: (node: TreeNode) => boolean
    selectNode: (node: TreeNode) => void
    getSelectedNodes: () => TreeNode[]
  }
): UseDragDropReturn {
  
  // 集成跨树拖拽状态管理
  const crossTreeDragState = useCrossTreeDragState()
  
  // 拖拽状态
  const dragState = ref<DragDropState>({
    dragNode: null,
    dropNode: null,
    dropPosition: null,
    isDragging: false,
    dragScope: dragdropScope,
    dragStartPosition: undefined,
    sourceTreeId: undefined,
    targetTreeId: undefined
  })

  // 跨树拖拽状态跟踪
  const crossTreeState = ref({
    hasEnteredTarget: false,
    lastTargetTreeId: null as string | null
  })

  // 计算属性
  const isDragging = computed(() => dragState.value.isDragging)
  const dragNode = computed(() => dragState.value.dragNode)
  const dropNode = computed(() => dragState.value.dropNode)
  const dropPosition = computed(() => dragState.value.dropPosition)

  // 性能优化：当前拖拽指示器元素缓存
  let currentDropIndicator: HTMLElement | null = null
  let currentDropClasses: string[] = []

  // 立即清除拖拽指示器函数 - 不使用缓存和节流，确保立即清除
  const clearAllDropIndicators = (treeContainer?: HTMLElement) => {
    // 立即清除缓存的当前指示器
    if (currentDropIndicator) {
      currentDropClasses.forEach(className => {
        currentDropIndicator!.classList.remove(className)
      })
      currentDropIndicator.removeAttribute('data-drop-position')
      currentDropIndicator = null
      currentDropClasses = []
    }

    // 如果指定了容器，只在该容器内查找，否则查找整个文档
    const container = treeContainer || document
    
    // 直接查询所有可能的拖拽样式元素，不使用缓存
    const selectors = [
      '.p-tree-drop-indicator',
      '.p-tree-cross-tree-drop', 
      '.p-tree-drop-inside',
      '.p-tree-drop-above',
      '.p-tree-drop-below',
      '[data-drop-position]'
    ]
    
    // 立即清除所有拖拽样式
    const classesToRemove = [
      'p-tree-drop-indicator',
      'p-tree-cross-tree-drop',
      'p-tree-drop-inside', 
      'p-tree-drop-above',
      'p-tree-drop-below'
    ]
    
    selectors.forEach(selector => {
      const elements = container.querySelectorAll(selector)
      elements.forEach(element => {
        // 立即移除类名，不使用 requestAnimationFrame
        classesToRemove.forEach(className => {
          element.classList.remove(className)
        })
        element.removeAttribute('data-drop-position')
      })
    })
  }

  // 移除节流版本，确保样式立即清除

  // 拖拽开始
  const onDragStart = (event: DragEvent, node: TreeNode) => {
    
    if (node.draggable === false) {
      event.preventDefault()
      return
    }

    // 自动选中拖拽节点（如果有选中状态管理）
    let selectedNodes: TreeNode[] = []
    if (selectionState) {
      // 检查是否为文件夹节点（有children的节点）
      const isFolder = node.children && node.children.length > 0
      
      // 如果当前节点未选中且不是文件夹，自动选中它
      if (!selectionState.isSelected(node) && !isFolder) {
        selectionState.selectNode(node)
      } else if (isFolder) {
      }
      
      // 获取所有选中的节点用于多选拖拽
      const selectedNodesResult = selectionState.getSelectedNodes()
      selectedNodes = selectedNodesResult || []
    }

    // 获取源树ID，优先使用传入的treeId
    const sourceTreeId = treeId || (event.target as HTMLElement)?.closest('[data-tree-id]')?.getAttribute('data-tree-id') || undefined
    

    // 更新本地拖拽状态
    dragState.value = {
      ...dragState.value,
      dragNode: node,
      selectedNodes: selectedNodes.length > 1 ? selectedNodes : null,
      isDragging: true,
      sourceTreeId,
      dragStartPosition: {
        x: event.clientX,
        y: event.clientY
      },
      dragScope: dragdropScope
    }

    // 同时更新全局拖拽状态，用于跨树拖拽
    globalDragState.value = {
      ...globalDragState.value,
      dragNode: node,
      selectedNodes: selectedNodes.length > 1 ? selectedNodes : null,
      isDragging: true,
      sourceTreeId,
      dragStartPosition: {
        x: event.clientX,
        y: event.clientY
      },
      dragScope: dragdropScope
    }

    // 新一次拖拽会话开始，重置 drop 处理标记
    dropHandledInSession = false

    // 设置拖拽数据（增强支持多选）
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      const dragData = {
        nodeKey: node.key,
        scope: dragdropScope,
        sourceTreeId,
        // 多选拖拽支持
        selectedNodes: (selectedNodes && selectedNodes.length > 1) ? selectedNodes.map(n => ({
          key: n.key,
          label: n.label,
          data: n.data
        })) : undefined,
        dragCount: (selectedNodes && selectedNodes.length > 1) ? selectedNodes.length : 1
      }
      event.dataTransfer.setData('text/plain', JSON.stringify(dragData))
      
      
      // 额外设置源树ID，方便跨树拖拽时识别
      if (sourceTreeId) {
        event.dataTransfer.setData('sourceTreeId', sourceTreeId)
      }
    }

    // 添加拖拽样式
    const target = event.target as HTMLElement
    target.classList.add('p-tree-node-dragging')
    
    // 添加多选拖拽的视觉反馈
    if (selectedNodes && selectedNodes.length > 1) {
      // 创建拖拽计数器
      const dragCounter = document.createElement('div')
      dragCounter.className = 'p-tree-drag-counter'
      dragCounter.textContent = `${selectedNodes.length}`
      
      // 将计数器添加到拖拽元素
      const nodeElement = target.closest('.p-tree-node')
      if (nodeElement) {
        nodeElement.classList.add('p-tree-node-with-counter')
        nodeElement.appendChild(dragCounter)
        
        // 记录计数器元素，以便在拖拽结束时清理
        target.setAttribute('data-drag-counter', 'true')
      }
      
    }
    
    // 启动缓存清理调度
    scheduleCacheCleanup()
    
    // 启动跨树拖拽状态管理
    if (sourceTreeId) {
      crossTreeDragState.startCrossTreeDrag(node, sourceTreeId, false) // 默认非自动更新模式
    }
    
    // 触发跨树拖拽开始事件
    if (emitCrossTreeEvent && sourceTreeId) {
      const crossTreeDragStartEvent: CrossTreeDragStartEvent = {
        originalEvent: event,
        dragNode: node,
        sourceTreeId,
        isCrossTree: false, // 开始时还不知道是否跨树
        timestamp: Date.now(),
        startPosition: {
          x: event.clientX,
          y: event.clientY
        }
      }
      emitCrossTreeEvent('cross-tree-drag-start', crossTreeDragStartEvent)
    }
    
  }

  // 拖拽结束
  const onDragEnd = (event: DragEvent) => {
    // 移除拖拽样式
    const target = event.target as HTMLElement
    target.classList.remove('p-tree-node-dragging')
    
    // 清理拖拽计数器
    if (target.getAttribute('data-drag-counter')) {
      const nodeElement = target.closest('.p-tree-node')
      if (nodeElement) {
        const dragCounter = nodeElement.querySelector('.p-tree-drag-counter')
        if (dragCounter) {
          dragCounter.remove()
        }
        nodeElement.classList.remove('p-tree-node-with-counter')
      }
      target.removeAttribute('data-drag-counter')
    }

    // 清除所有残留的占位样式
    clearAllDropIndicators()

    // 触发跨树拖拽结束/取消事件
    // 仅在跨树场景下发跨树事件；若本次会话已产生 drop（dropHandledInSession），
    // 结束事件由 accept/reject 回调负责，这里不再重复发射
    if (emitCrossTreeEvent && globalDragState.value.dragNode) {
      const isCrossTree =
        !!globalDragState.value.sourceTreeId &&
        globalDragState.value.sourceTreeId !== globalDragState.value.targetTreeId

      if (isCrossTree && !dropHandledInSession) {
        // 未产生有效 drop（ESC 取消、拖到无效位置等）：视为取消
        const crossTreeDragCancelEvent: CrossTreeDragCancelEvent = {
          originalEvent: event,
          dragNode: globalDragState.value.dragNode,
          sourceTreeId: globalDragState.value.sourceTreeId || '',
          targetTreeId: globalDragState.value.targetTreeId,
          dropNode: globalDragState.value.dropNode,
          dropPosition: globalDragState.value.dropPosition,
          isCrossTree: true,
          timestamp: Date.now(),
          reason: 'user-cancel'
        }
        emitCrossTreeEvent('cross-tree-drag-cancel', crossTreeDragCancelEvent)
      }
    }

    // 重置 drop 处理标记
    dropHandledInSession = false

    // 重置本地拖拽状态
    dragState.value = {
      dragNode: null,
      dropNode: null,
      dropPosition: null,
      isDragging: false,
      dragScope: dragdropScope,
      dragStartPosition: undefined,
      sourceTreeId: undefined,
      targetTreeId: undefined
    }

    // 同时重置全局拖拽状态
    globalDragState.value = {
      dragNode: null,
      dropNode: null,
      dropPosition: null,
      isDragging: false,
      dragScope: undefined,
      dragStartPosition: undefined,
      sourceTreeId: undefined,
      targetTreeId: undefined
    }

    // 重置跨树状态
    crossTreeState.value = {
      hasEnteredTarget: false,
      lastTargetTreeId: null
    }
    
    // 结束跨树拖拽状态管理
    crossTreeDragState.endCrossTreeDrag(false) // 默认为失败，成功的情况在 onDrop 中处理
  }

  // 拖拽进入
  const onDragEnter = (event: DragEvent, node: TreeNode) => {
    event.preventDefault()

    // 跨树场景下本地 dragNode 为空，需要回退到全局状态
    const currentDragNode = dragState.value.dragNode || globalDragState.value.dragNode
    if (!currentDragNode) return
    if (!canDropNode(currentDragNode, node, 'inside')) return

    dragState.value.dropNode = node
  }

  // 性能优化：缓存位置计算结果
  let lastPositionCache: {
    nodeKey: string | number
    y: number
    position: TreeDropPosition
    timestamp: number
  } | null = null

  // 性能优化：优化的位置计算函数
  const calculateDropPosition = (event: DragEvent, node: TreeNode): TreeDropPosition => {
    // 检查是否是根节点拖拽
    if (node.key === '__root__') {
      return 'root'
    }

    const target = event.currentTarget as HTMLElement
    const y = event.clientY
    
    // 使用缓存避免重复计算
    const now = Date.now()
    if (lastPositionCache && 
        lastPositionCache.nodeKey === node.key && 
        Math.abs(lastPositionCache.y - y) < 5 && // 5px容差
        now - lastPositionCache.timestamp < 50) { // 50ms内
      return lastPositionCache.position
    }

    const rect = target.getBoundingClientRect()
    const relativeY = y - rect.top
    const height = rect.height
    const percentage = relativeY / height
    
    let position: TreeDropPosition
    if (percentage < 0.25) {
      position = 'above'
    } else if (percentage > 0.75) {
      position = 'below'
    } else {
      position = 'inside'
    }

    // 更新缓存
    lastPositionCache = {
      nodeKey: node.key,
      y,
      position,
      timestamp: now
    }

    return position
  }

  // 精确的样式更新函数 - 立即清除和应用样式
  const updateDropIndicator = (target: HTMLElement, position: TreeDropPosition, isCrossTree: boolean) => {
    // 如果目标元素和样式没有变化，跳过更新
    if (currentDropIndicator === target && 
        currentDropClasses.includes(`p-tree-drop-${position}`) &&
        currentDropClasses.includes('p-tree-cross-tree-drop') === isCrossTree) {
      return
    }

    // 立即清除之前的指示器
    clearAllDropIndicators()
    
    // 立即设置新的指示器
    currentDropIndicator = target
    currentDropClasses = [`p-tree-drop-${position}`]
    
    target.classList.add(`p-tree-drop-${position}`)
    target.setAttribute('data-drop-position', position)
    
    if (isCrossTree) {
      target.classList.add('p-tree-cross-tree-drop')
      currentDropClasses.push('p-tree-cross-tree-drop')
    }
  }

  // 性能优化：节流的拖拽悬停处理
  // 注意：preventDefault 必须在节流之外每次都执行——HTML5 DnD 要求 dragover 被取消
  // 才允许 drop，被节流丢弃的事件不执行 preventDefault 会导致间歇性无法放置
  const throttledDragOver = throttle((event: DragEvent, node: TreeNode, treeId: string) => {
    // 检查是否有拖拽节点（本地或全局）
    const currentDragNode = dragState.value.dragNode || globalDragState.value.dragNode
    if (!currentDragNode) {
      return
    }
    
    // 优化的位置计算
    const position = calculateDropPosition(event, node)
    
    // 获取源树ID（优先使用全局状态，用于跨树拖拽）
    const sourceTreeId = dragState.value.sourceTreeId || globalDragState.value.sourceTreeId
    const isCrossTree = sourceTreeId !== treeId
    
    // 跨树拖拽验证（只在必要时进行）
    if (isCrossTree && sourceTreeId) {
      if (!canCrossTreeDrop(currentDragNode, node, position, sourceTreeId, treeId)) {
        event.dataTransfer!.dropEffect = 'none'
        return
      }
    }

    // 检查状态是否真的需要更新
    const needsStateUpdate = (
      dragState.value.dropNode?.key !== node.key ||
      dragState.value.dropPosition !== position ||
      dragState.value.targetTreeId !== treeId
    )

    if (needsStateUpdate) {
      // 批量更新状态，减少响应式更新
      const newState = {
        ...dragState.value,
        dropNode: node,
        dropPosition: position,
        targetTreeId: treeId
      }
      dragState.value = newState
      
      // 更新全局状态
      globalDragState.value = {
        ...globalDragState.value,
        dropNode: node,
        dropPosition: position,
        targetTreeId: treeId
      }
      
      // 更新跨树拖拽状态管理
      if (isCrossTree && treeId) {
        crossTreeDragState.updateTarget(treeId, node, position)
      }
    }
    
    event.dataTransfer!.dropEffect = 'move'
    
    // 高效的样式更新
    const target = event.currentTarget as HTMLElement
    updateDropIndicator(target, position, isCrossTree)
    
    // 节流的悬停变化事件
    if (onHoverChange && needsStateUpdate) {
      onHoverChange({
        targetTreeId: treeId,
        dropPosition: position,
        dropNodeLabel: node.label,
        isCrossTree
      })
    }
  }, 16) // 60fps

  // preventDefault 每次事件都执行（允许 drop），状态更新走节流
  const onDragOver = (event: DragEvent, node: TreeNode, treeId: string) => {
    event.preventDefault()
    throttledDragOver(event, node, treeId)
  }

  // 拖拽离开
  const onDragLeave = (event: DragEvent, node?: TreeNode, treeId?: string) => {
    // 立即清除所有拖拽指示器样式，避免样式残留
    clearAllDropIndicators()
    
    // 检查是否真的离开了元素
    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const x = event.clientX
    const y = event.clientY
    
    // 只有真正离开元素边界时才处理状态重置和事件触发
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      // 触发跨树拖拽离开事件
      if (emitCrossTreeEvent && node && treeId) {
        const sourceTreeId = dragState.value.sourceTreeId || globalDragState.value.sourceTreeId
        const currentDragNode = dragState.value.dragNode || globalDragState.value.dragNode
        
        if (sourceTreeId && sourceTreeId !== treeId && currentDragNode) {
          const crossTreeDragLeaveEvent: CrossTreeDragLeaveEvent = {
            originalEvent: event,
            dragNode: currentDragNode,
            sourceTreeId,
            targetTreeId: treeId,
            dropNode: node,
            isCrossTree: true,
            timestamp: Date.now()
          }
          emitCrossTreeEvent('cross-tree-drag-leave', crossTreeDragLeaveEvent)
          
          // 重置跨树状态
          crossTreeState.value.hasEnteredTarget = false
          crossTreeState.value.lastTargetTreeId = null
        }
      }
      
      dragState.value.dropNode = null
      dragState.value.dropPosition = null

      // 同步清理全局状态中的目标信息（保留 dragNode/isDragging），避免后续 drop 拿到过期位置
      globalDragState.value = {
        ...globalDragState.value,
        dropNode: null,
        dropPosition: null
      }

      // 清空悬停信息
      if (onHoverChange) {
        onHoverChange(null)
      }
    }
  }

  // 放置
  const onDrop = (event: DragEvent, node: TreeNode): TreeNodeDropEvent | null => {
    
    event.preventDefault()
    
    // 清除所有占位样式
    clearAllDropIndicators()
    
    const target = event.currentTarget as HTMLElement

    // 检查本地或全局拖拽状态
    const currentDragNode = dragState.value.dragNode || globalDragState.value.dragNode
    const currentDropPosition = dragState.value.dropPosition || globalDragState.value.dropPosition
    
    if (!currentDragNode || !currentDropPosition) {
      return null
    }

    const dragNode = currentDragNode
    const dropPosition = currentDropPosition
    const sourceTreeId = dragState.value.sourceTreeId || globalDragState.value.sourceTreeId
    const targetTreeId = dragState.value.targetTreeId || globalDragState.value.targetTreeId ||
                         (target.closest('[data-tree-id]')?.getAttribute('data-tree-id') || undefined)


    // 检查是否是跨树拖拽
    const isCrossTree = sourceTreeId && targetTreeId && sourceTreeId !== targetTreeId
    

    // 检查拖拽作用域
    let dragScope = dragdropScope
    if (event.dataTransfer) {
      try {
        const dragData = JSON.parse(event.dataTransfer.getData('text/plain'))
        dragScope = dragData.scope
        
        
        // 如果拖拽数据中有源树ID，优先使用
        if (dragData.sourceTreeId && !sourceTreeId) {
          dragState.value.sourceTreeId = dragData.sourceTreeId
        }
        
        if (dragScope && dragScope !== dragdropScope) {
          // 跨作用域拖拽，需要特殊处理
          // 如果作用域不匹配，但是允许跨树拖拽，则继续
          if (!isCrossTree) {
            return null
          }
        }
      } catch (e) {
      }
    }

    // 最终检查是否可以放置
    if (isCrossTree) {
      // 跨树拖拽默认允许，可以在这里添加更多的验证逻辑
    } else if (!canDropNode(dragNode, node, dropPosition)) {
      return null
    }

    // 根据实际位置计算 dropIndex（此前硬编码为 0，导致下游按位置计算的分支成为死代码）
    const computeDropIndex = (): number => {
      if (dropPosition === 'root' || node.key === '__root__') {
        return nodes.value.length
      }
      if (dropPosition === 'inside') {
        return node.children?.length ?? 0
      }
      const parentInfo = findTreeNodeWithParent(nodes.value, node.key)
      if (!parentInfo) return 0
      const siblings = parentInfo.parent?.children ?? nodes.value
      const index = siblings.findIndex(sibling => sibling.key === node.key)
      if (index === -1) return 0
      return dropPosition === 'below' ? index + 1 : index
    }
    const dropIndex = computeDropIndex()

    // 标记本次拖拽会话已产生 drop：dragend 不再重复发结束/取消事件，
    // cross-tree-drop 由 Tree 组件以带真实 accept/reject 回调的事件对象发射
    dropHandledInSession = true

    // 创建拖拽事件对象
    const dropEvent: TreeNodeDropEvent = {
      originalEvent: event,
      dragNode,
      dropNode: node,
      dropIndex,
      dropPosition,
      sourceTreeId,
      targetTreeId,
      isCrossTree,
      accept: () => {
        // 接受拖拽操作的回调
        
        // 清理所有拖拽状态指示器
        clearAllDropIndicators()
        
        // 重置拖拽状态
        resetDragState()
        
        // 结束跨树拖拽状态管理（成功）
        crossTreeDragState.endCrossTreeDrag(true)
        
        // 如果是跨树拖拽成功，触发成功的结束事件
        if (emitCrossTreeEvent && isCrossTree && sourceTreeId && targetTreeId) {
          const successEndEvent: CrossTreeDragEndEvent = {
            originalEvent: event,
            dragNode,
            sourceTreeId,
            targetTreeId,
            dropNode: node,
            dropPosition,
            isCrossTree: true,
            timestamp: Date.now(),
            success: true
          }
          emitCrossTreeEvent('cross-tree-drag-end', successEndEvent)
        }
      },
      reject: () => {
        // 拒绝拖拽操作的回调
        
        // 清理所有拖拽状态指示器
        clearAllDropIndicators()
        
        // 重置拖拽状态
        resetDragState()
        
        // 结束跨树拖拽状态管理（失败）
        crossTreeDragState.endCrossTreeDrag(false)
        
        // 如果是跨树拖拽被拒绝，触发取消的结束事件
        if (emitCrossTreeEvent && isCrossTree && sourceTreeId && targetTreeId) {
          const cancelEndEvent: CrossTreeDragEndEvent = {
            originalEvent: event,
            dragNode,
            sourceTreeId,
            targetTreeId,
            dropNode: node,
            dropPosition,
            isCrossTree: true,
            timestamp: Date.now(),
            success: false,
            error: 'Drop rejected by user'
          }
          emitCrossTreeEvent('cross-tree-drag-end', cancelEndEvent)
        }
      }
    }

    return dropEvent
  }

  // 检查节点是否可拖拽
  const isDraggable = (node: TreeNode) => {
    return node.draggable !== false
  }

  // 检查节点是否可作为放置目标
  const isDroppable = (node: TreeNode, position: TreeDropPosition = 'inside') => {
    if (!dragState.value.dragNode) return false
    return canDropNode(dragState.value.dragNode, node, position)
  }

  // 获取拖拽指示器样式
  const getDragIndicatorClass = (node: TreeNode) => {
    const classes: string[] = []
    
    // 检查全局拖拽状态，如果全局状态已重置，则不返回任何拖拽样式
    if (!globalDragState.value.isDragging && !globalDragState.value.dragNode) {
      return ''
    }
    
    if (dragState.value.dragNode?.key === node.key) {
      classes.push('p-tree-node-dragging')
    }
    
    if (dragState.value.dropNode?.key === node.key) {
      classes.push('p-tree-drop-indicator')
      if (dragState.value.dropPosition) {
        classes.push(`p-tree-drop-${dragState.value.dropPosition}`)
      }
    }
    
    return classes.join(' ')
  }

  // 重置拖拽状态 - 内存优化版本
  const resetDragState = () => {
    // 清理DOM缓存
    clearDomCache()

    // 清理当前拖拽指示器
    currentDropIndicator = null
    currentDropClasses = []

    // 清理位置缓存
    lastPositionCache = null

    // 重置状态
    dragState.value = {
      dragNode: null,
      dropNode: null,
      dropPosition: null,
      isDragging: false,
      dragScope: dragdropScope,
      dragStartPosition: undefined,
      sourceTreeId: undefined,
      targetTreeId: undefined
    }

    // 同步重置全局状态：accept/reject 后 dragend 才能识别本次拖拽已结束，
    // 否则会重复发射一个 success:false 的 cross-tree-drag-end
    globalDragState.value = {
      dragNode: null,
      dropNode: null,
      dropPosition: null,
      isDragging: false,
      dragScope: undefined,
      dragStartPosition: undefined,
      sourceTreeId: undefined,
      targetTreeId: undefined
    }

    // 清理定时器
    if (cacheCleanupTimer) {
      clearTimeout(cacheCleanupTimer)
      cacheCleanupTimer = null
    }
  }

  // 设置拖拽作用域
  const setDragScope = (scope: string) => {
    dragState.value.dragScope = scope
  }

  return {
    // 状态
    dragState,
    globalDragState,
    isDragging,
    dragNode,
    dropNode,
    dropPosition,
    
    // 拖拽事件处理
    onDragStart,
    onDragEnd,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
    
    // 工具方法
    isDraggable,
    isDroppable,
    getDragIndicatorClass,
    resetDragState,
    setDragScope,
    
    // 跨树拖拽状态管理
    crossTreeDragState: {
      isActive: crossTreeDragState.isActive,
      isDragging: crossTreeDragState.isDragging,
      pendingOperations: crossTreeDragState.pendingOperations,
      addPendingOperation: crossTreeDragState.addPendingOperation,
      removePendingOperation: crossTreeDragState.removePendingOperation,
      clearAllPendingOperations: crossTreeDragState.clearAllPendingOperations,
      getPendingOperationsForTree: crossTreeDragState.getPendingOperationsForTree,
      getCurrentDragInfo: crossTreeDragState.getCurrentDragInfo,
      resetAllState: crossTreeDragState.resetAllState
    }
  }
}

/**
 * 全局重置拖拽状态函数
 * 用于在外部组件中重置全局拖拽状态
 */
export function resetGlobalDragState() {
  globalDragState.value = {
    dragNode: null,
    dropNode: null,
    dropPosition: null,
    isDragging: false,
    dragScope: undefined,
    dragStartPosition: undefined,
    sourceTreeId: undefined,
    targetTreeId: undefined
  }
}