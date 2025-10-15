import { ref, computed, type Ref } from 'vue'
import type { 
  TreeNode, 
  TreeDropPosition, 
  DragDropState,
  TreeNodeDropEvent,
  UseDragDropReturn
} from '../lib/types'
import { canDropNode, canCrossTreeDrop } from '../lib/utils'

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
  } | null) => void
): UseDragDropReturn {
  console.log('🔧 useDragDrop 初始化:', { dragdropScope, treeId })
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

  // 计算属性
  const isDragging = computed(() => dragState.value.isDragging)
  const dragNode = computed(() => dragState.value.dragNode)
  const dropNode = computed(() => dragState.value.dropNode)
  const dropPosition = computed(() => dragState.value.dropPosition)

  // 清除所有占位样式的辅助函数
  const clearAllDropIndicators = (treeContainer?: HTMLElement) => {
    // 如果指定了容器，只清除该容器内的指示器
    const container = treeContainer || document
    const indicators = container.querySelectorAll('.p-tree-drop-indicator, .p-tree-cross-tree-drop')
    
    indicators.forEach(element => {
      element.classList.remove('p-tree-drop-indicator', 'p-tree-cross-tree-drop')
      element.removeAttribute('data-drop-position')
    })
  }

  // 拖拽开始
  const onDragStart = (event: DragEvent, node: TreeNode) => {
    console.log('🚀 onDragStart 被调用!', {
      node: node.key,
      draggable: node.draggable,
      dragdropScope
    })
    
    if (node.draggable === false) {
      console.log('❌ 节点不可拖拽，阻止默认行为')
      event.preventDefault()
      return
    }

    // 获取源树ID，优先使用传入的treeId
    const sourceTreeId = treeId || (event.target as HTMLElement)?.closest('[data-tree-id]')?.getAttribute('data-tree-id') || undefined
    
    console.log('🏷️ 获取源树ID:', sourceTreeId, '(treeId:', treeId, ')')

    // 更新本地拖拽状态
    dragState.value = {
      ...dragState.value,
      dragNode: node,
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
      isDragging: true,
      sourceTreeId,
      dragStartPosition: {
        x: event.clientX,
        y: event.clientY
      },
      dragScope: dragdropScope
    }

    // 设置拖拽数据
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      const dragData = {
        nodeKey: node.key,
        scope: dragdropScope,
        sourceTreeId
      }
      event.dataTransfer.setData('text/plain', JSON.stringify(dragData))
      
      console.log('📦 设置拖拽数据:', dragData)
      
      // 额外设置源树ID，方便跨树拖拽时识别
      if (sourceTreeId) {
        event.dataTransfer.setData('sourceTreeId', sourceTreeId)
      }
    }

    // 添加拖拽样式
    const target = event.target as HTMLElement
    target.classList.add('p-tree-node-dragging')
    
    console.log('✅ 拖拽开始完成，状态:', dragState.value)
  }

  // 拖拽结束
  const onDragEnd = (event: DragEvent) => {
    // 移除拖拽样式
    const target = event.target as HTMLElement
    target.classList.remove('p-tree-node-dragging')

    // 清除所有残留的占位样式
    clearAllDropIndicators()

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
  }

  // 拖拽进入
  const onDragEnter = (event: DragEvent, node: TreeNode) => {
    event.preventDefault()
    
    if (!dragState.value.dragNode) return
    if (!canDropNode(dragState.value.dragNode, node, 'inside')) return

    dragState.value.dropNode = node
  }

  // 拖拽悬停
  const onDragOver = (event: DragEvent, node: TreeNode, treeId: string) => {
    event.preventDefault()
    
    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const y = event.clientY - rect.top
    const height = rect.height
    const percentage = y / height
    
    let position: TreeDropPosition
    
    // 检查是否是根节点拖拽
    if (node.key === '__root__') {
      position = 'root'
    } else if (percentage < 0.25) {
      position = 'above'
    } else if (percentage > 0.75) {
      position = 'below'
    } else {
      position = 'inside'
    }
    
    console.log('📍 位置计算:', {
      node: node.label,
      position,
      percentage: Math.round(percentage * 100) + '%'
    })
    
    // 跨树拖拽验证
    if (dragState.value.sourceTreeId && dragState.value.sourceTreeId !== treeId) {
      const dragNode = dragState.value.dragNode
      if (!dragNode || !canCrossTreeDrop(dragNode, node, position, dragState.value.sourceTreeId, treeId)) {
        event.dataTransfer!.dropEffect = 'none'
        return
      }
    }
    
    // 更新拖拽状态
    dragState.value = {
      ...dragState.value,
      dropNode: node,
      dropPosition: position,
      targetTreeId: treeId
    }
    
    // 更新全局拖拽状态
    globalDragState.value = {
      ...globalDragState.value,
      dropNode: node,
      dropPosition: position,
      targetTreeId: treeId
    }
    
    event.dataTransfer!.dropEffect = 'move'
    
    // 清除之前的拖拽指示器
    clearAllDropIndicators()
    
    // 添加拖拽指示器样式
    target.classList.add(`drop-${position}`)
    
    // 跨树拖拽样式
    if (dragState.value.sourceTreeId !== treeId) {
      target.classList.add('cross-tree-drop')
    }
  }

  // 拖拽离开
  const onDragLeave = (event: DragEvent) => {
    // 检查是否真的离开了元素
    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const x = event.clientX
    const y = event.clientY
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      // 移除放置指示器样式
      target.classList.remove('p-tree-drop-indicator')
      target.classList.remove('p-tree-cross-tree-drop')
      target.removeAttribute('data-drop-position')
      
      dragState.value.dropNode = null
      dragState.value.dropPosition = null
      
      // 清空悬停信息
      if (onHoverChange) {
        onHoverChange(null)
      }
    }
  }

  // 放置
  const onDrop = (event: DragEvent, node: TreeNode): TreeNodeDropEvent | null => {
    console.log('🎯 useDragDrop onDrop 被调用!', {
      event,
      node,
      dragState: dragState.value,
      target: event.currentTarget
    })
    
    event.preventDefault()
    
    // 清除所有占位样式
    clearAllDropIndicators()
    
    const target = event.currentTarget as HTMLElement

    // 检查本地或全局拖拽状态
    const currentDragNode = dragState.value.dragNode || globalDragState.value.dragNode
    const currentDropPosition = dragState.value.dropPosition || globalDragState.value.dropPosition
    
    if (!currentDragNode || !currentDropPosition) {
      console.log('❌ onDrop 提前返回: 缺少拖拽节点或放置位置', {
        localDragNode: dragState.value.dragNode,
        localDropPosition: dragState.value.dropPosition,
        globalDragNode: globalDragState.value.dragNode,
        globalDropPosition: globalDragState.value.dropPosition
      })
      return null
    }

    const dragNode = currentDragNode
    const dropPosition = currentDropPosition
    const sourceTreeId = dragState.value.sourceTreeId || globalDragState.value.sourceTreeId
    const targetTreeId = dragState.value.targetTreeId || globalDragState.value.targetTreeId ||
                         (target.closest('[data-tree-id]')?.getAttribute('data-tree-id') || undefined)

    console.log('🔍 拖拽信息:', {
      dragNode: dragNode.key,
      dropNode: node.key,
      dropPosition,
      sourceTreeId,
      targetTreeId
    })

    // 检查是否是跨树拖拽
    const isCrossTree = sourceTreeId && targetTreeId && sourceTreeId !== targetTreeId
    
    console.log('🌲 跨树检查:', {
      isCrossTree,
      sourceTreeId,
      targetTreeId,
      dragdropScope
    })

    // 检查拖拽作用域
    let dragScope = dragdropScope
    if (event.dataTransfer) {
      try {
        const dragData = JSON.parse(event.dataTransfer.getData('text/plain'))
        dragScope = dragData.scope
        
        console.log('📦 拖拽数据:', dragData)
        
        // 如果拖拽数据中有源树ID，优先使用
        if (dragData.sourceTreeId && !sourceTreeId) {
          dragState.value.sourceTreeId = dragData.sourceTreeId
        }
        
        if (dragScope && dragScope !== dragdropScope) {
          // 跨作用域拖拽，需要特殊处理
          // 如果作用域不匹配，但是允许跨树拖拽，则继续
          if (!isCrossTree) {
            console.log('❌ 作用域不匹配且非跨树拖拽，返回 null')
            return null
          }
        }
      } catch (e) {
        console.log('⚠️ 解析拖拽数据失败:', e)
      }
    }

    // 最终检查是否可以放置
    if (isCrossTree) {
      console.log('✅ 跨树拖拽，允许放置')
      // 跨树拖拽默认允许，可以在这里添加更多的验证逻辑
    } else if (!canDropNode(dragNode, node, dropPosition)) {
      console.log('❌ canDropNode 检查失败，返回 null')
      return null
    }

    // 创建拖拽事件对象
    const dropEvent: TreeNodeDropEvent = {
      originalEvent: event,
      dragNode,
      dropNode: node,
      dropIndex: 0, // 这个值需要根据实际位置计算
      dropPosition,
      sourceTreeId,
      targetTreeId,
      isCrossTree,
      accept: () => {
        // 接受拖拽操作的回调
        console.log('✅ Drop accepted:', { 
          dragNode, 
          dropNode: node, 
          dropPosition,
          sourceTreeId,
          targetTreeId,
          isCrossTree
        })
      }
    }

    console.log('🎉 创建拖拽事件对象:', dropEvent)
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

  // 重置拖拽状态
  const resetDragState = () => {
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
    setDragScope
  }
}