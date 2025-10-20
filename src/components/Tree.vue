<template>
  <div :class="treeClasses" :style="treeStyles" :data-tree-id="id">
    <!-- 过滤器 -->
    <div v-if="filter" class="p-tree-filter-container">
      <div class="p-tree-filter">
        <input
          v-model="filterValue"
          type="text"
          :placeholder="filterPlaceholder"
          class="p-tree-filter-input"
          @input="handleFilterInput"
        />
        <Search :size="16" class="p-tree-filter-icon" />
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="p-tree-loading">
      <Loader2 :size="24" class="animate-spin" />
      <span class="p-tree-loading-text">{{ loadingText }}</span>
    </div>

    <!-- 空状态 -->
    <div 
      v-else-if="!hasNodes" 
      class="p-tree-empty"
      :class="{ 'p-tree-empty-drag-over': isDragOverContainer }"
      @dragover="handleEmptyDragOver"
      @drop="handleEmptyDrop"
      @dragenter="handleEmptyDragEnter"
      @dragleave="handleEmptyDragLeave"
    >
      <slot name="empty">
        <div class="p-tree-empty-content">
          <TreePine :size="48" class="p-tree-empty-icon" />
          <p class="p-tree-empty-text">
            {{ isDragOverContainer ? '释放以添加到空树' : emptyMessage }}
          </p>
          <div v-if="isDragOverContainer" class="p-tree-empty-drop-hint">
            <div class="p-tree-empty-drop-indicator"></div>
          </div>
        </div>
      </slot>
    </div>

    <!-- 树节点 -->
    <ul 
      v-else 
      :class="rootClasses" 
      role="tree" 
      :aria-label="ariaLabel"
      tabindex="0"
      @keydown="handleTreeKeyDown"
      @dragover="handleRootDragOver"
      @drop="handleRootDrop"
      @dragenter="handleRootDragEnter"
      @dragleave="handleRootDragLeave"
    >
      <TreeNode
        v-for="node in filteredNodes"
        :key="node.key"
        :node="node"
        :level="0"
        :indent="indent"
        :selection-mode="selectionMode"
        :is-selected="isNodeSelected(node)"
        :is-partially-selected="isNodePartiallySelected(node)"
        :is-expanded="isNodeExpanded(node)"

        :drag-indicator-class="getDragIndicatorClass(node)"
        :draggable-nodes="isDragDropEnabled"
        :selected-background-color="selectedBackgroundColor"
        :selected-text-color="selectedTextColor"
        :focus-background-color="focusBackgroundColor"
        :focus-text-color="focusTextColor"
        @node-click="handleNodeClick"
        @node-double-click="handleNodeDoubleClick"
        @node-context-menu="handleNodeContextMenu"
        @node-toggle="handleNodeToggle"
        @node-select="handleNodeSelect"
        @node-unselect="handleNodeUnselect"
        @node-drag-start="handleNodeDragStart"
        @node-drag-end="handleNodeDragEnd"
        @node-drop="handleNodeDrop"
      >
        <template #node="slotProps">
          <slot name="node" v-bind="slotProps" />
        </template>
      </TreeNode>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, provide, onMounted, nextTick } from 'vue'
import { Search, Loader2, TreePine } from 'lucide-vue-next'
import TreeNode from './TreeNode.vue'
import { useTreeState } from '../composables/useTreeState'
import { useDragDrop } from '../composables/useDragDrop'
import { useSelection } from '../composables/useSelection'
import { useFocus } from '../composables/useFocus'
import { useFilter } from '../composables/useFilter'
import { moveTreeNode } from '../lib/utils'
import type {
  TreeNode as TreeNodeType,
  TreeProps,
  TreeEmits,
  TreeSelectionMode,
  TreeFilterMode,
  TreeNodeSelectEvent,
  TreeNodeUnselectEvent,
  TreeNodeExpandEvent,
  TreeNodeCollapseEvent,
  TreeNodeDropEvent,
  TreeNodeFocusEvent,
  TreeNodeBlurEvent,
  TreeNodeClickEvent,
  CrossTreeDragStartEvent,
  CrossTreeDragEnterEvent,
  CrossTreeDragOverEvent,
  CrossTreeDragLeaveEvent,
  CrossTreeDropEvent,
  CrossTreeDragEndEvent,
  CrossTreeDragCancelEvent
} from '../lib/types'

// Props
const props = withDefaults(defineProps<TreeProps>(), {
  value: () => [],
  id: undefined,
  selectionMode: 'single',
  dragdrop: false,
  autoUpdate: false,
  crossTreeAutoUpdate: false,
  metaKeySelection: true,
  propagateSelectionUp: true,
  propagateSelectionDown: true,
  loading: false,
  loadingText: 'Loading...',
  filter: false,
  filterMode: 'lenient',
  filterPlaceholder: 'Search...',
  filterLocale: undefined,
  scrollHeight: 'flex',
  virtualScrollerOptions: undefined,
  indent: 20,
  emptyMessage: 'No data found',
  ariaLabel: 'Tree',
  ariaLabelledBy: undefined,
  validateDrop: false,
  selectedBackgroundColor: '#e3f2fd',
  selectedTextColor: '#1565c0',
  focusBackgroundColor: '#1e40af',
  focusTextColor: 'white'
})

// Emits
const emit = defineEmits<{
  'node-select': [event: TreeNodeSelectEvent];
  'node-unselect': [event: TreeNodeUnselectEvent];
  'node-expand': [event: TreeNodeExpandEvent];
  'node-collapse': [event: TreeNodeCollapseEvent];
  'node-focus': [event: TreeNodeFocusEvent];
  'node-blur': [event: TreeNodeBlurEvent];
  'node-click': [event: TreeNodeClickEvent];
  'node-double-click': [event: { originalEvent: Event; node: TreeNodeType }];
  'node-context-menu': [event: { originalEvent: Event; node: TreeNodeType }];
  'node-drop': [event: TreeNodeDropEvent];
  'node-drag-from': [event: { 
    originalEvent: DragEvent; 
    dragNode: TreeNodeType; 
    dropNode: TreeNodeType; 
    dropPosition: string;
    sourceTreeId: string;
    targetTreeId: string;
  }];
  'node-drag-to': [event: { 
    originalEvent: DragEvent; 
    dragNode: TreeNodeType; 
    dropNode: TreeNodeType; 
    dropPosition: string;
    sourceTreeId: string;
    targetTreeId: string;
  }];
  'node-load': [event: any];
  'filter': [event: { originalEvent: Event; value: string }];
  'selection-change': [event: { originalEvent: Event; value: any }];
  'node-drag-start': [event: { originalEvent: DragEvent; node: TreeNodeType }];
  'node-drag-end': [event: { originalEvent: DragEvent; node: TreeNodeType }];
  'hover-change': [hoverInfo: {
    targetTreeId?: string
    dropPosition?: string
    dropNodeLabel?: string
    isCrossTree?: boolean
  } | null];
  
  // 跨树拖拽事件
  'cross-tree-drag-start': [event: CrossTreeDragStartEvent];
  'cross-tree-drag-enter': [event: CrossTreeDragEnterEvent];
  'cross-tree-drag-over': [event: CrossTreeDragOverEvent];
  'cross-tree-drag-leave': [event: CrossTreeDragLeaveEvent];
  'cross-tree-drop': [event: CrossTreeDropEvent];
  'cross-tree-drag-end': [event: CrossTreeDragEndEvent];
  'cross-tree-drag-cancel': [event: CrossTreeDragCancelEvent];
  
  'node-toggle': [event: any];
  'update:selectionKeys': [value: any];
  'update:expandedKeys': [value: any];
  'update:modelValue': [value: any];
  'update:value': [value: TreeNodeType[]];
}>()

// 响应式数据
const filterValue = ref('')
const dragOverNode = ref<TreeNodeType | null>(null)

// Composables
const {
  selectionKeys,
  expandedKeys,
  loading: stateLoading,
  selectedNodes,
  expandedNodes,
  hasSelection,
  hasExpanded,
  selectNode,
  toggleNodeSelection: toggleNode,
  expandNode,
  toggleNodeExpansion: collapseNode,
  clearSelection,
  resetState
} = useTreeState(computed(() => props.value || []), props.selectionKeys, props.expandedKeys, props.selectionMode)

// 新的选择管理 - 需要在 useDragDrop 之前初始化
const {
  selectionKeys: newSelectionKeys,
  selectedNodes: newSelectedNodes,
  selectedCount,
  hasSelection: newHasSelection,
  allSelected,
  partiallySelected,
  selectNode: newSelectNode,
  toggleNodeSelection: newToggleNodeSelection,
  clearSelection: newClearSelection,
  selectMultipleNodes,
  isSelected: isNodeSelectedNew,
  isPartiallySelected: isNodePartiallySelectedNew,
  setSelectionKeys
} = useSelection(computed(() => props.value || []), ref(props.selectionMode), props.modelValue || props.selectionKeys)

const {
  dragState,
  globalDragState,
  isDragging,
  dragNode,
  dropNode,
  dropPosition,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
  isDraggable,
  isDroppable,
  getDragIndicatorClass: getDragIndicator,
  resetDragState,
  setDragScope
} = useDragDrop(
  computed(() => props.value || []), 
  props.dragdropScope, 
  props.id,
  (hoverInfo) => {
    // 通过事件向上传递悬停信息
    emit('hover-change', hoverInfo)
  },
  (eventName: string, event: any) => {
    // 触发跨树拖拽事件
    emit(eventName as any, event)
  },
  // 传递选中状态管理
  {
    isSelected: isNodeSelectedNew,
    selectNode: newSelectNode,
    getSelectedNodes: () => newSelectedNodes.value
  }
)

console.log('🔧 Tree组件初始化:', { id: props.id, dragdropScope: props.dragdropScope })

// 空树拖拽状态
const isDragOverContainer = ref(false)

// 键盘导航管理
const {
  focusableNodes,
  focusNext,
  focusPrevious,
  focusFirst,
  focusLast,
  handleKeyDown,
  focusElementByNodeKey,
  getCurrentFocusedElement,
  getCurrentFocusedNodeKey
} = useFocus(computed(() => props.value || []))

const {
  filteredNodes: filterNodes,
  filteredCount,
  hasFilter,
  setFilter,
  clearFilter,
  filterByPredicate,
  filterByType,
  searchNodes
} = useFilter(computed(() => props.value || []))

// 计算属性
const hasNodes = computed(() => {
  return props.value && props.value.length > 0
})

const isDragDropEnabled = computed(() => {
  const result = !!props.dragdropScope
  console.log('🔍 Tree isDragDropEnabled:', {
    dragdropScope: props.dragdropScope,
    result: result
  })
  return result
})

// 调试信息
onMounted(() => {
  console.log('🌳 Tree component mounted with props:', {
    dragdropScope: props.dragdropScope,
    isDragDropEnabled: isDragDropEnabled.value,
    hasNodes: hasNodes.value,
    nodeCount: props.value?.length || 0
  })
  
  // 检查每个节点的拖拽属性
  if (props.value) {
    props.value.forEach((node, index) => {
      console.log(`🔍 Root node ${index}:`, {
        key: node.key,
        label: node.label,
        draggable: node.draggable,
        droppable: node.droppable
      })
    })
  }
})

const filteredNodes = computed(() => {
  if (!hasNodes.value) return []
  
  const nodes = props.value
  
  if (!props.filter || !filterValue.value.trim()) {
    return nodes
  }
  
  try {
    return searchNodes(filterValue.value)
  } catch (error) {
    console.warn('Tree filter error:', error)
    return nodes
  }
})

const treeClasses = computed(() => [
  'p-tree',
  'p-component',
  {
    'p-tree-selectable': props.selectionMode !== null,
    'p-tree-loading': props.loading || stateLoading.value,
    'p-tree-flex-scrollable': props.scrollHeight === 'flex'
  },
  props.class
])

const treeStyles = computed(() => ({
  height: props.scrollHeight !== 'flex' ? props.scrollHeight : undefined,
  ...props.style
}))

const rootClasses = computed(() => [
  'p-tree-container',
  'p-tree-root'
])

// 节点状态检查
const isNodeSelected = (node: TreeNodeType): boolean => {
  return isNodeSelectedNew(node)
}

const isNodePartiallySelected = (node: TreeNodeType): boolean => {
  return isNodePartiallySelectedNew(node)
}



const isNodeExpanded = (node: TreeNodeType): boolean => {
  return expandedKeys.value?.[node.key] === true
}

const getDragIndicatorClass = (node: TreeNodeType): string => {
  return getDragIndicator(node)
}

// 事件处理
const handleNodeClick = (event: TreeNodeClickEvent) => {
  emit('node-click', event)
}

const handleNodeDoubleClick = (event: { originalEvent: Event; node: TreeNodeType }) => {
  emit('node-double-click', event)
}

const handleNodeContextMenu = (event: { originalEvent: Event; node: TreeNodeType }) => {
  emit('node-context-menu', event)
}

const handleNodeToggle = (event: TreeNodeExpandEvent | TreeNodeCollapseEvent) => {
  const { node } = event
  
  if (isNodeExpanded(node)) {
    collapseNode(node)
    emit('node-collapse', event as TreeNodeCollapseEvent)
  } else {
    // 检查是否需要懒加载
    if (node.lazy && (!node.children || node.children.length === 0)) {
      emit('node-expand', {
        ...event,
        node: { ...node, loading: true }
      } as TreeNodeExpandEvent)
    } else {
      expandNode(node)
      emit('node-expand', event as TreeNodeExpandEvent)
    }
  }
  
  emit('node-toggle', event)
}

const handleNodeSelect = (event: TreeNodeSelectEvent) => {
  const { node } = event
  
  // 使用新的选择管理
  const result = newSelectNode(node, true, event.originalEvent)
  
  if (result) {
    if (result.type === 'select') {
      emit('node-select', result.event as TreeNodeSelectEvent)
    } else if (result.type === 'unselect') {
      emit('node-unselect', result.event as TreeNodeUnselectEvent)
    }
  }
  
  // 触发选择变化事件
  emit('selection-change', {
    originalEvent: event.originalEvent,
    value: newSelectionKeys.value
  })
  
  // 触发 v-model 更新
  emit('update:modelValue', newSelectionKeys.value)
  emit('update:selectionKeys', newSelectionKeys.value)
}

const handleNodeUnselect = (event: TreeNodeUnselectEvent) => {
  const { node } = event
  
  // 使用新的选择管理
  const result = newSelectNode(node, false, event.originalEvent)
  
  if (result) {
    if (result.type === 'unselect') {
      emit('node-unselect', result.event as TreeNodeUnselectEvent)
    }
  }
  
  // 触发选择变化事件
  emit('selection-change', {
    originalEvent: event.originalEvent,
    value: newSelectionKeys.value
  })
  
  // 触发 v-model 更新
  emit('update:modelValue', newSelectionKeys.value)
  emit('update:selectionKeys', newSelectionKeys.value)
}

// 拖拽事件处理
const handleNodeDragStart = (event: { originalEvent: DragEvent; node: TreeNodeType }) => {
  if (!isDraggable(event.node)) {
    event.originalEvent.preventDefault()
    return
  }
  
  onDragStart(event.originalEvent, event.node)
  emit('node-drag-start', event)
}

const handleNodeDragEnd = (event: { originalEvent: DragEvent; node: TreeNodeType }) => {
  onDragEnd(event.originalEvent)
  emit('node-drag-end', event)
}

const handleNodeDrop = (event: TreeNodeDropEvent) => {
  // 对于跨树拖拽，使用事件中的拖拽节点信息
  const currentDragNode = event.isCrossTree ? event.dragNode : dragNode.value
  const currentDropPosition = event.isCrossTree ? event.dropPosition : dropPosition.value
  
  // 对于跨树拖拽，跳过本地的 isDroppable 检查，因为拖拽节点不在当前树中
  if (!event.isCrossTree && (!currentDragNode || !isDroppable(event.dropNode))) {
    return
  }
  
  if (event.isCrossTree && !currentDragNode) {
    return
  }
  
  // 设置拖拽节点信息
  event.dragNode = currentDragNode
  event.dropPosition = currentDropPosition
  
  // 验证拖拽
  if (props.validateDrop) {
    let isValid = true
    
    // 不能拖拽到自己或子节点
    if (event.dragNode.key === event.dropNode.key) {
      isValid = false
    }
    
    // 检查是否拖拽到子节点
    if (isValid && isDescendant(event.dropNode, event.dragNode)) {
      isValid = false
    }
    
    if (!isValid) {
      return
    }
  }
  
  // 设置接受拖拽的回调
  event.accept = () => {
    if (event.isCrossTree) {
      // 跨树拖拽：触发 cross-tree-drop 事件，让父组件处理数据更新
      const crossTreeDropEvent: CrossTreeDropEvent = {
        originalEvent: event.originalEvent,
        dragNode: event.dragNode,
        dropNode: event.dropNode,
        dropPosition: event.dropPosition,
        dropIndex: event.dropIndex || 0,
        sourceTreeId: event.sourceTreeId || '',
        targetTreeId: event.targetTreeId || '',
        isCrossTree: true,
        timestamp: Date.now(),
        accept: () => {
          // 清理拖拽状态
          onDrop(event.originalEvent, event.dropNode)
          resetDragState()
        },
        reject: () => {
          // 拒绝拖拽：直接清理状态，不更新数据
          onDrop(event.originalEvent, event.dropNode)
          resetDragState()
        }
      }
      
      // 触发跨树拖拽事件，让父组件处理
      emit('cross-tree-drop', crossTreeDropEvent)
    } else {
      // 同树拖拽：自动更新模式处理数据更新
      if (props.autoUpdate) {
        try {
          // 使用 moveTreeNode 更新数据
          const updatedData = moveTreeNode(
            props.value,
            event.dragNode.key,
            event.dropNode.key,
            event.dropPosition
          )
          
          // 触发 update:value 事件更新父组件数据
          emit('update:value', updatedData)
          
          // 等待下一个 tick 确保数据更新完成
          nextTick(() => {
            // 清理拖拽状态
            onDrop(event.originalEvent, event.dropNode)
            
            // 重置拖拽状态
            resetDragState()
          })
        } catch (error) {
          console.error('自动更新数据失败:', error)
          
          // 即使出错也要清理状态
          onDrop(event.originalEvent, event.dropNode)
          resetDragState()
        }
      } else {
        // 非自动更新模式：直接清理状态
        onDrop(event.originalEvent, event.dropNode)
        resetDragState()
      }
    }
  }
  
  // 设置拒绝拖拽的回调
  event.reject = () => {
    // 拒绝拖拽：直接清理状态，不更新数据
    onDrop(event.originalEvent, event.dropNode)
    resetDragState()
  }
  
  // 触发拖拽事件
  emit('node-drop', event)
  
  // 自动更新模式：自动接受拖拽操作
  if ((props.autoUpdate && !event.isCrossTree) || (props.crossTreeAutoUpdate && event.isCrossTree)) {
    event.accept()
  }
}

// 根级别拖拽事件处理
const handleRootDragOver = (event: DragEvent) => {
  // 检查是否有拖拽节点（本地或全局）
  const currentDragNode = dragNode.value || globalDragState.value.dragNode
  if (!isDragging.value || !currentDragNode) {
    return
  }
  
  // 扩大边缘区域判定范围（从20px增加到50px）
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const y = event.clientY
  const edgeThreshold = 50
  
  const isTopEdge = y - rect.top <= edgeThreshold
  const isBottomEdge = rect.bottom - y <= edgeThreshold
  
  // 在边缘区域或者树节点较少时（少于5个节点）允许根级别拖拽
  const nodeCount = (props.value || []).length
  const allowRootDrop = isTopEdge || isBottomEdge || nodeCount < 5
  
  if (allowRootDrop) {
    event.preventDefault()
    event.stopPropagation()
    event.dataTransfer!.dropEffect = 'move'
    
    // 创建一个虚拟的根节点来处理拖拽逻辑
    const rootNode: TreeNodeType = {
      key: '__root__',
      label: 'Root',
      children: props.value || []
    }
    
    onDragOver(event, rootNode, props.id)
  }
  // 否则让事件继续传播给TreeNode处理
}

const handleRootDrop = (event: DragEvent) => {
  // 检查是否有拖拽节点（本地或全局）
  const currentDragNode = dragNode.value || globalDragState.value.dragNode
  if (!isDragging.value || !currentDragNode) {
    return
  }
  
  // 扩大边缘区域判定范围（从20px增加到50px）
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const y = event.clientY
  const edgeThreshold = 50
  
  const isTopEdge = y - rect.top <= edgeThreshold
  const isBottomEdge = rect.bottom - y <= edgeThreshold
  
  // 在边缘区域或者树节点较少时（少于5个节点）允许根级别拖拽
  const nodeCount = (props.value || []).length
  const allowRootDrop = isTopEdge || isBottomEdge || nodeCount < 5
  
  if (allowRootDrop) {
    event.preventDefault()
    event.stopPropagation()
    
    // 获取正确的拖拽信息（优先使用全局状态，用于跨树拖拽）
    const currentDragNode = dragNode.value || globalDragState.value.dragNode
    const sourceTreeId = dragState.value.sourceTreeId || globalDragState.value.sourceTreeId
    const targetTreeId = props.id
    const isCrossTree = sourceTreeId && targetTreeId && sourceTreeId !== targetTreeId
    
    // 创建根级别拖拽事件
    const dropEvent: TreeNodeDropEvent = {
      originalEvent: event,
      dragNode: currentDragNode,
      dropNode: {
        key: '__root__',
        label: 'Root',
        children: props.value || []
      },
      dropIndex: (props.value || []).length, // 添加到末尾
      dropPosition: 'root',
      sourceTreeId,
      targetTreeId,
      isCrossTree,
      accept: () => {
        onDrop(event, {
          key: '__root__',
          label: 'Root',
          children: props.value || []
        })
        resetDragState()
      },
      reject: () => {
        // 拒绝拖拽：直接清理状态，不更新数据
        resetDragState()
      }
    }
    
    emit('node-drop', dropEvent)
  }
  // 否则让事件继续传播给TreeNode处理
}

const handleRootDragEnter = (event: DragEvent) => {
  // 检查是否有拖拽节点（本地或全局）
  const currentDragNode = dragNode.value || globalDragState.value.dragNode
  if (!isDragging.value || !currentDragNode) {
    return
  }
  
  // 扩大边缘区域判定范围（从20px增加到50px）
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const y = event.clientY
  const edgeThreshold = 50
  
  const isTopEdge = y - rect.top <= edgeThreshold
  const isBottomEdge = rect.bottom - y <= edgeThreshold
  
  // 在边缘区域或者树节点较少时（少于5个节点）允许根级别拖拽
  const nodeCount = (props.value || []).length
  const allowRootDrop = isTopEdge || isBottomEdge || nodeCount < 5
  
  if (allowRootDrop) {
    event.preventDefault()
    event.stopPropagation()
    
    const rootNode: TreeNodeType = {
      key: '__root__',
      label: 'Root',
      children: props.value || []
    }
    
    onDragEnter(event, rootNode)
  }
  // 否则让事件继续传播给TreeNode处理
}

const handleRootDragLeave = (event: DragEvent) => {
  if (!isDragging.value) {
    return
  }
  
  // 检查是否真的离开了根容器
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const x = event.clientX
  const y = event.clientY
  
  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    onDragLeave(event)
  }
}

// 空树拖拽事件处理
const handleEmptyDragOver = (event: DragEvent) => {
  // 检查是否有拖拽节点（本地或全局）
  const currentDragNode = dragNode.value || globalDragState.value.dragNode
  if (!isDragging.value || !currentDragNode) {
    return
  }
  
  event.preventDefault()
  event.stopPropagation()
  event.dataTransfer!.dropEffect = 'move'
  
  // 设置拖拽悬停状态
  isDragOverContainer.value = true
  
  // 创建一个虚拟的根节点来处理拖拽逻辑
  const rootNode: TreeNodeType = {
    key: '__root__',
    label: 'Root',
    children: props.value || []
  }
  
  onDragOver(event, rootNode, props.id)
}

const handleEmptyDrop = (event: DragEvent) => {
  // 检查是否有拖拽节点（本地或全局）
  const currentDragNode = dragNode.value || globalDragState.value.dragNode
  if (!isDragging.value || !currentDragNode) {
    return
  }
  
  event.preventDefault()
  event.stopPropagation()
  
  // 获取正确的拖拽信息（优先使用全局状态，用于跨树拖拽）
  const sourceTreeId = dragState.value.sourceTreeId || globalDragState.value.sourceTreeId
  const targetTreeId = props.id
  const isCrossTree = sourceTreeId && targetTreeId && sourceTreeId !== targetTreeId
  
  // 创建空树拖拽事件
  const dropEvent: TreeNodeDropEvent = {
    originalEvent: event,
    dragNode: currentDragNode,
    dropNode: {
      key: '__root__',
      label: 'Root',
      children: props.value || []
    },
    dropIndex: 0, // 添加到开头
    dropPosition: 'root',
    sourceTreeId,
    targetTreeId,
    isCrossTree,
    accept: () => {
      onDrop(event, {
        key: '__root__',
        label: 'Root',
        children: props.value || []
      })
      resetDragState()
      isDragOverContainer.value = false
    },
    reject: () => {
      // 拒绝拖拽：直接清理状态，不更新数据
      resetDragState()
      isDragOverContainer.value = false
    }
  }
  
  emit('node-drop', dropEvent)
  
  // 自动更新模式：自动接受拖拽操作
  if ((props.autoUpdate && !isCrossTree) || (props.crossTreeAutoUpdate && isCrossTree)) {
    dropEvent.accept()
  }
}

const handleEmptyDragEnter = (event: DragEvent) => {
  // 检查是否有拖拽节点（本地或全局）
  const currentDragNode = dragNode.value || globalDragState.value.dragNode
  if (!isDragging.value || !currentDragNode) {
    return
  }
  
  event.preventDefault()
  event.stopPropagation()
  
  isDragOverContainer.value = true
  
  const rootNode: TreeNodeType = {
    key: '__root__',
    label: 'Root',
    children: props.value || []
  }
  
  onDragEnter(event, rootNode)
}

const handleEmptyDragLeave = (event: DragEvent) => {
  if (!isDragging.value) {
    return
  }
  
  // 检查是否真的离开了空树容器
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const x = event.clientX
  const y = event.clientY
  
  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    isDragOverContainer.value = false
    onDragLeave(event)
  }
}



// 键盘事件处理
const handleTreeKeyDown = (event: KeyboardEvent) => {
  const result = handleKeyDown(event)
  
  if (result) {
    if ('type' in result && result.type === 'activate' && result.node) {
      // 处理激活事件（Enter/Space）
      const selectEvent: TreeNodeSelectEvent = {
        originalEvent: event,
        node: result.node
      }
      handleNodeSelect(selectEvent)
    } else if ('focusEvent' in result || 'blurEvent' in result) {
      // 处理焦点变化事件
      const focusResult = result as { blurEvent: TreeNodeBlurEvent | null; focusEvent: TreeNodeFocusEvent | null }
      if (focusResult.focusEvent) {
        emit('node-focus', focusResult.focusEvent)
      }
      
      if (focusResult.blurEvent) {
        emit('node-blur', focusResult.blurEvent)
      }
    }
  }
}

// 过滤处理
const handleFilterInput = () => {
  if (filterValue.value.trim()) {
    setFilter(filterValue.value)
  } else {
    clearFilter()
  }
  
  emit('filter', {
    originalEvent: new Event('filter'),
    value: filterValue.value
  })
}

// 工具函数
const unselectNode = (node: TreeNodeType) => {
  selectNode(node, false)
}

const findNodeByKey = (nodes: TreeNodeType[], key: string | number): TreeNodeType | null => {
  for (const node of nodes) {
    if (node.key === key) return node
    if (node.children) {
      const found = findNodeByKey(node.children, key)
      if (found) return found
    }
  }
  return null
}

const propagateSelectionDown = (node: TreeNodeType, selected: boolean) => {
  if (!node.children) return
  
  for (const child of node.children) {
    if (child.selectable !== false) {
      if (selected) {
        selectNode(child)
      } else {
        unselectNode(child)
      }
      
      // 递归处理子节点
      propagateSelectionDown(child, selected)
    }
  }
}

const propagateSelectionUp = (node: TreeNodeType) => {
  // 查找父节点并更新选择状态
  // 这需要维护父子关系映射
}

const isDescendant = (ancestor: TreeNodeType, descendant: TreeNodeType): boolean => {
  if (!ancestor.children) return false
  
  for (const child of ancestor.children) {
    if (child.key === descendant.key) {
      return true
    }
    
    if (isDescendant(child, descendant)) {
      return true
    }
  }
  
  return false
}

// 公共方法
const getSelectedNodes = () => {
  return selectedNodes.value
}

const getExpandedNodes = () => {
  return expandedNodes.value
}

const scrollToNode = (nodeKey: string) => {
  nextTick(() => {
    const element = document.querySelector(`[data-node-key="${nodeKey}"]`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

// 跨树拖拽事件触发方法
const emitNodeDragFrom = (event: DragEvent, dragNode: TreeNodeType, dropNode: TreeNodeType, dropPosition: string, sourceTreeId: string, targetTreeId: string) => {
  emit('node-drag-from', {
    originalEvent: event,
    dragNode,
    dropNode,
    dropPosition,
    sourceTreeId,
    targetTreeId
  })
}

const emitNodeDragTo = (event: DragEvent, dragNode: TreeNodeType, dropNode: TreeNodeType, dropPosition: string, sourceTreeId: string, targetTreeId: string) => {
  emit('node-drag-to', {
    originalEvent: event,
    dragNode,
    dropNode,
    dropPosition,
    sourceTreeId,
    targetTreeId
  })
}

// Provide/Inject
provide('tree', {
  props,
  selectionKeys: newSelectionKeys,
  expandedKeys,
  isNodeSelected,
  isNodePartiallySelected,
  isNodeExpanded,
  getDragIndicatorClass,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
  emitNodeDragFrom,
  emitNodeDragTo
})

// 监听器
watch(() => props.value, (newValue) => {
  if (newValue) {
    resetState()
  }
}, { deep: true })

watch(() => props.expandedKeys, (newKeys) => {
  if (newKeys) {
    // 同步展开状态
    Object.keys(newKeys).forEach(key => {
      const node = findNodeByKey(props.value || [], key)
      if (node) {
        if (newKeys[key]) {
          expandNode(node)
        } else {
          collapseNode(node)
        }
      }
    })
  }
}, { deep: true })

// v-model 监听器
watch(() => props.modelValue, (newValue) => {
  if (newValue !== newSelectionKeys.value) {
    setSelectionKeys(newValue)
  }
}, { deep: true })

watch(() => props.selectionKeys, (newValue) => {
  if (newValue !== newSelectionKeys.value) {
    setSelectionKeys(newValue)
  }
}, { deep: true })

// 暴露方法
defineExpose({
  getSelectedNodes: () => newSelectedNodes.value,
  getExpandedNodes,
  scrollToNode,
  clearSelection: newClearSelection,
  resetState,
  focusNext,
  focusPrevious,
  focusFirst,
  focusLast,
  getCurrentFocusedNodeKey,
  emitNodeDragFrom,
  emitNodeDragTo,
  resetDragState
})

// 生命周期
onMounted(() => {
  // 初始化展开状态
  if (props.expandedKeys) {
    Object.keys(props.expandedKeys).forEach(key => {
      if (props.expandedKeys![key]) {
        const node = findNodeByKey(props.value || [], key)
        if (node) {
          expandNode(node)
        }
      }
    })
  }
})
</script>

<style scoped>
/* 移除所有Tailwind类，使用tree.css中的全局样式 */
/* 这些样式现在由tree.css和主题系统统一管理 */

/* 只保留组件特定的布局样式 */
.p-tree-flex-scrollable {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.p-tree-flex-scrollable .p-tree-container {
  flex: 1;
  overflow: auto;
}

/* 空状态拖拽动画 - 使用CSS变量 */
.p-tree-empty-drop-indicator {
  width: 4rem;
  height: 4rem;
  border: 4px dashed var(--p-tree-drop-line-color);
  border-radius: 50%;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>