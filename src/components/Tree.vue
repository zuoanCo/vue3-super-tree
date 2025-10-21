<template>
  <div :class="treeClasses" :style="treeStyles" :data-tree-id="id">
    <!-- 过滤器 -->
    <div v-if="filter" class="p-tree-filter-container">
      <div class="p-tree-filter">
        <input
          v-model="filterValue"
          type="text"
          :placeholder="filterPlaceholder || mergedConfig.i18n.filterPlaceholder"
          class="p-tree-filter-input"
          @input="handleFilterInput"
        />
        <Search :size="16" class="p-tree-filter-icon" />
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="p-tree-loading">
      <Loader2 :size="24" class="animate-spin" />
      <span class="p-tree-loading-text">{{ loadingText || mergedConfig.i18n.loadingText }}</span>
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
            {{ isDragOverContainer ? mergedConfig.i18n.dropToEmptyTree : (emptyMessage || mergedConfig.i18n.emptyMessage) }}
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
        :config="mergedConfig"
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

    <!-- 待确认操作列表 -->
    <div v-if="pendingOperations.length > 0" class="p-tree-pending-operations">
      <div class="p-tree-pending-header">
        <h4>{{ mergedConfig.i18n.pendingOperationsTitle }} ({{ pendingOperations.length }})</h4>
        <button 
          @click="clearAllPendingOperations"
          class="p-tree-pending-clear-all"
          title="清除所有待确认操作"
        >
          {{ mergedConfig.i18n.clearAllOperations }}
        </button>
      </div>
      <div class="p-tree-pending-list">
        <div 
          v-for="operation in pendingOperations" 
          :key="operation.id"
          class="p-tree-pending-item"
        >
          <div class="p-tree-pending-info">
            <div class="p-tree-pending-description">{{ operation.description }}</div>
            <div class="p-tree-pending-details">
              <span class="p-tree-pending-time">{{ formatTime(operation.timestamp) }}</span>
              <span v-if="operation.isCrossTree" class="p-tree-pending-cross-tree">{{ mergedConfig.i18n.crossTreeOperation }}</span>
            </div>
          </div>
          <div class="p-tree-pending-actions">
            <button 
              @click="acceptOperation(operation)"
              class="p-tree-pending-accept"
              :title="mergedConfig.i18n.acceptOperation"
            >
              {{ mergedConfig.i18n.accept }}
            </button>
            <button 
              @click="rejectOperation(operation)"
              class="p-tree-pending-reject"
              :title="mergedConfig.i18n.rejectOperation"
            >
              {{ mergedConfig.i18n.reject }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, provide, onMounted, onUnmounted, nextTick } from 'vue'
import { Search, Loader2, TreePine } from 'lucide-vue-next'
import TreeNode from './TreeNode.vue'
import { useTreeState } from '../composables/useTreeState'
import { useDragDrop } from '../composables/useDragDrop'
import { useSelection } from '../composables/useSelection'
import { useFocus } from '../composables/useFocus'
import { useFilter } from '../composables/useFilter'
import { crossTreeManager } from '../composables/useCrossTreeManager'
import { moveTreeNode, moveCrossTreeNode, getNodeDetailedInfo, calculateDropInfo, mergeTreeConfig, replaceTextTemplate } from '../lib/utils'
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
  CrossTreeDragCancelEvent,
  PendingOperation
} from '../lib/types'

// Props
const props = withDefaults(defineProps<TreeProps>(), {
  value: () => [],
  id: undefined,
  selectionMode: 'single',
  dragdrop: false,
  dragdropScope: undefined,
  autoUpdate: false,
  crossTreeAutoUpdate: false,
  crossTreeGroup: undefined,
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
  focusTextColor: 'white',
  config: () => ({})
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
  
  // 简化的跨树移动事件
  'cross-tree-move': [event: {
    originalEvent: Event;
    dragNode: TreeNodeType;
    dropNode: TreeNodeType;
    dropPosition: string;
    sourceTreeId: string;
    targetTreeId: string;
  }];
  
  'node-toggle': [event: any];
  'update:selectionKeys': [value: any];
  'update:expandedKeys': [value: any];
  'update:modelValue': [value: any];
  'update:value': [value: TreeNodeType[]];
}>()

// 配置合并
const mergedConfig = computed(() => mergeTreeConfig(props.config))

// 响应式数据
const filterValue = ref('')
const dragOverNode = ref<TreeNodeType | null>(null)
const pendingOperations = ref<PendingOperation[]>([])

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
  const result = props.dragdrop && !!props.dragdropScope
  console.log('🔍 Tree isDragDropEnabled:', {
    dragdrop: props.dragdrop,
    dragdropScope: props.dragdropScope,
    result: result
  })
  return result
})

// 生命周期管理
onMounted(() => {
  console.log('🌳 Tree component mounted with props:', {
    id: props.id,
    dragdropScope: props.dragdropScope,
    crossTreeGroup: props.crossTreeGroup,
    isDragDropEnabled: isDragDropEnabled.value,
    hasNodes: hasNodes.value,
    nodeCount: props.value?.length || 0
  })
  
  // 注册到跨树拖拽管理器
  if (props.id && props.dragdrop) {
    crossTreeManager.registerTree(
      props.id,
      props.crossTreeGroup || null,
      computed(() => props.value),
      (newData: TreeNodeType[]) => {
        emit('update:value', newData)
      },
      emit
    )
  }
  
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

onUnmounted(() => {
  // 从跨树拖拽管理器注销
  if (props.id) {
    crossTreeManager.unregisterTree(props.id)
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
  console.log('🚀 handleNodeDragStart:', {
    nodeLabel: event.node.label,
    treeId: props.id,
    crossTreeGroup: props.crossTreeGroup,
    isDraggable: isDraggable(event.node)
  })
  
  if (!isDraggable(event.node)) {
    event.originalEvent.preventDefault()
    return
  }
  
  // 启动跨树拖拽管理
  if (props.id && props.crossTreeGroup) {
    crossTreeManager.startCrossTreeDrag(
      event.node,
      props.id,
      props.crossTreeGroup
    )
    crossTreeManager.setCrossTreeDragData(event.originalEvent.dataTransfer!)
  }
  
  onDragStart(event.originalEvent, event.node)
  emit('node-drag-start', event)
}

const handleNodeDragEnd = (event: { originalEvent: DragEvent; node: TreeNodeType }) => {
  // 结束跨树拖拽管理
  crossTreeManager.endCrossTreeDrag()
  
  onDragEnd(event.originalEvent)
  emit('node-drag-end', event)
}

const handleNodeDrop = (event: TreeNodeDropEvent) => {
  // 检查是否为跨树拖拽
  const crossTreeInfo = crossTreeManager.getCrossTreeDragInfo()
  const isCrossTree = crossTreeInfo && crossTreeInfo.sourceTreeId !== props.id
  
  if (isCrossTree && crossTreeInfo) {
    // 跨树拖拽处理
    const canDrop = crossTreeManager.canCrossTreeDrop(
      props.id!,
      props.crossTreeGroup || null
    )
    
    if (!canDrop) {
      console.log('❌ 跨树拖拽验证失败')
      return
    }
    
    // 执行跨树拖拽
    const result = crossTreeManager.performCrossTreeDrop(
      props.id!,
      event.dropNode,
      event.dropPosition || 'inside'
    )
    
    if (result) {
      // 从 crossTreeManager 获取拖拽信息
      const dragInfo = crossTreeManager.getCrossTreeDragInfo()
      
      if (dragInfo) {
        // 触发简化的跨树移动事件
        emit('cross-tree-move', {
          originalEvent: event.originalEvent,
          dragNode: dragInfo.dragNode,
          dropNode: event.dropNode,
          dropPosition: event.dropPosition || 'inside',
          sourceTreeId: dragInfo.sourceTreeId,
          targetTreeId: props.id!
        })
      }
    }
    
    return
  }
  
  // 同树拖拽处理（保持原有逻辑）
  const currentDragNode = dragNode.value
  const currentDropPosition = dropPosition.value || 'inside'
  
  if (!currentDragNode || !isDroppable(event.dropNode)) {
    console.log('❌ 同树拖拽验证失败')
    return
  }
  
  // 设置拖拽节点信息
  event.dragNode = currentDragNode
  event.dropPosition = currentDropPosition
  event.sourceTreeId = props.id
  event.targetTreeId = props.id
  event.isCrossTree = false
  
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
      // 非自动更新模式：添加到待确认操作列表
      addToPendingOperations(event)
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
  if (props.autoUpdate) {
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

// PendingOperations 相关函数
const addToPendingOperations = (event: TreeNodeDropEvent | CrossTreeDropEvent) => {
  const operation: PendingOperation = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    isCrossTree: event.isCrossTree || false,
    description: generateOperationDescription(event),
    dragNode: event.dragNode,
    dropNode: event.dropNode,
    dropPosition: event.dropPosition as string,
    
    // 拖拽前信息
    beforeDrag: {
      sourceTreeId: event.sourceTreeId || props.id || '',
      ...getNodeDetailedInfo(props.value || [], event.dragNode.key, event.sourceTreeId || props.id || '')
    },
    
    // 拖拽后信息
    afterDrop: calculateDropInfo(props.value || [], event.dropNode, event.dropPosition as any, event.targetTreeId || props.id || ''),
    
    // 操作信息
    operationInfo: {
      isCrossTree: event.isCrossTree || false,
      timestamp: Date.now(),
      operationType: 'move',
      description: generateOperationDescription(event)
    },
    
    // 操作回调
    accept: () => {
      console.log('✅ 接受待确认操作:', operation.description)
      
      try {
        if (event.isCrossTree) {
          // 跨树拖拽处理
          performCrossTreeMove(event as CrossTreeDropEvent)
        } else {
          // 同树拖拽处理
          performSameTreeMove(event as TreeNodeDropEvent)
        }
        
        // 从待确认列表中移除
        removePendingOperation(operation.id)
        
        // 清理拖拽状态
        onDrop(event.originalEvent, event.dropNode)
        resetDragState()
        
        console.log('✅ 操作执行成功')
      } catch (error) {
        console.error('❌ 操作执行失败:', error)
        
        // 即使失败也要清理状态
        removePendingOperation(operation.id)
        onDrop(event.originalEvent, event.dropNode)
        resetDragState()
      }
    },
    
    reject: () => {
      console.log('❌ 拒绝待确认操作:', operation.description)
      
      // 从待确认列表中移除
      removePendingOperation(operation.id)
      
      // 清理拖拽状态
      onDrop(event.originalEvent, event.dropNode)
      resetDragState()
    }
  }
  
  pendingOperations.value.push(operation)
  console.log('📝 添加待确认操作:', operation.description)
}

const removePendingOperation = (operationId: string) => {
  const index = pendingOperations.value.findIndex(op => op.id === operationId)
  if (index !== -1) {
    pendingOperations.value.splice(index, 1)
  }
}

const acceptOperation = (operation: PendingOperation) => {
  operation.accept()
}

const rejectOperation = (operation: PendingOperation) => {
  operation.reject()
}

const clearAllPendingOperations = () => {
  // 拒绝所有待确认操作
  pendingOperations.value.forEach(operation => {
    operation.reject()
  })
  pendingOperations.value = []
  console.log('🧹 清除所有待确认操作')
}

const generateOperationDescription = (event: TreeNodeDropEvent | CrossTreeDropEvent): string => {
  const dragLabel = event.dragNode.label || event.dragNode.key
  const dropLabel = event.dropNode.label || event.dropNode.key
  
  if (event.isCrossTree) {
    const sourceTreeId = event.sourceTreeId || mergedConfig.value.i18n.unknownSourceTree
    const targetTreeId = event.targetTreeId || mergedConfig.value.i18n.unknownTargetTree
    
    switch (event.dropPosition) {
      case 'above':
        return replaceTextTemplate(mergedConfig.value.i18n.crossTreeMoveBefore, {
          dragLabel,
          sourceTreeId,
          targetTreeId,
          dropLabel
        })
      case 'below':
        return replaceTextTemplate(mergedConfig.value.i18n.crossTreeMoveAfter, {
          dragLabel,
          sourceTreeId,
          targetTreeId,
          dropLabel
        })
      case 'inside':
        return replaceTextTemplate(mergedConfig.value.i18n.crossTreeMoveInside, {
          dragLabel,
          sourceTreeId,
          targetTreeId,
          dropLabel
        })
      default:
        return replaceTextTemplate(mergedConfig.value.i18n.crossTreeMove, {
          dragLabel,
          sourceTreeId,
          targetTreeId
        })
    }
  } else {
    switch (event.dropPosition) {
      case 'above':
        return replaceTextTemplate(mergedConfig.value.i18n.moveBefore, {
          dragLabel,
          dropLabel
        })
      case 'below':
        return replaceTextTemplate(mergedConfig.value.i18n.moveAfter, {
          dragLabel,
          dropLabel
        })
      case 'inside':
        return replaceTextTemplate(mergedConfig.value.i18n.moveInside, {
          dragLabel,
          dropLabel
        })
      default:
        return replaceTextTemplate(mergedConfig.value.i18n.move, {
          dragLabel
        })
    }
  }
}

const performCrossTreeMove = (event: CrossTreeDropEvent) => {
  // 触发跨树拖拽事件，让父组件处理数据更新
  emit('cross-tree-drop', event)
}

const performSameTreeMove = (event: TreeNodeDropEvent) => {
  // 使用 moveTreeNode 更新数据
  const updatedData = moveTreeNode(
    props.value,
    event.dragNode.key,
    event.dropNode.key,
    event.dropPosition
  )
  
  // 触发 update:value 事件更新父组件数据
  emit('update:value', updatedData)
}

const findParentNode = (nodes: TreeNodeType[], targetNode: TreeNodeType): TreeNodeType | null => {
  for (const node of nodes) {
    if (node.children) {
      // 检查是否是直接子节点
      if (node.children.some(child => child.key === targetNode.key)) {
        return node
      }
      
      // 递归查找
      const parent = findParentNode(node.children, targetNode)
      if (parent) {
        return parent
      }
    }
  }
  return null
}

const findNodeIndex = (nodes: TreeNodeType[], targetNode: TreeNodeType): number => {
  return nodes.findIndex(node => node.key === targetNode.key)
}

const findNodePath = (nodes: TreeNodeType[], nodeKey: string | number): string[] => {
  const path: string[] = []
  
  const findPath = (currentNodes: TreeNodeType[], currentPath: string[]): boolean => {
    for (let i = 0; i < currentNodes.length; i++) {
      const node = currentNodes[i]
      const newPath = [...currentPath, node.label || String(node.key)]
      
      if (node.key === nodeKey) {
        path.push(...newPath)
        return true
      }
      
      if (node.children && findPath(node.children, newPath)) {
        return true
      }
    }
    return false
  }
  
  findPath(nodes, [])
  return path
}

const calculateDropIndex = (event: TreeNodeDropEvent | CrossTreeDropEvent): number => {
  if (event.dropIndex !== undefined) {
    return event.dropIndex
  }
  
  // 根据 dropPosition 计算索引
  if (event.dropPosition === 'inside') {
    return event.dropNode.children ? event.dropNode.children.length : 0
  }
  
  // 对于 above/below，需要找到 dropNode 在其父节点中的索引
  const parentNode = findParentNode(props.value || [], event.dropNode)
  if (parentNode && parentNode.children) {
    const dropNodeIndex = parentNode.children.findIndex(child => child.key === event.dropNode.key)
    return event.dropPosition === 'below' ? dropNodeIndex + 1 : dropNodeIndex
  }
  
  return 0
}

const calculateDropPath = (event: TreeNodeDropEvent | CrossTreeDropEvent): string[] => {
  if (event.dropPosition === 'inside') {
    return [...findNodePath(props.value || [], event.dropNode.key), event.dragNode.label || String(event.dragNode.key)]
  }
  
  const parentNode = findParentNode(props.value || [], event.dropNode)
  if (parentNode) {
    return [...findNodePath(props.value || [], parentNode.key), event.dragNode.label || String(event.dragNode.key)]
  }
  
  return [event.dragNode.label || String(event.dragNode.key)]
}

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  })
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
  resetDragState,
  // PendingOperations 相关方法
  getPendingOperations: () => pendingOperations.value,
  acceptOperation,
  rejectOperation,
  clearAllPendingOperations
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

/* 待确认操作样式 */
.p-tree-pending-operations {
  margin-top: 1rem;
  border: 1px solid var(--p-tree-border-color, #e5e7eb);
  border-radius: 0.5rem;
  background: var(--p-tree-background-color, #ffffff);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.p-tree-pending-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--p-tree-border-color, #e5e7eb);
  background: var(--p-tree-header-background-color, #f9fafb);
  border-radius: 0.5rem 0.5rem 0 0;
}

.p-tree-pending-header h4 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--p-tree-text-color, #374151);
}

.p-tree-pending-clear-all {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  color: var(--p-tree-danger-color, #dc2626);
  background: transparent;
  border: 1px solid var(--p-tree-danger-color, #dc2626);
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.p-tree-pending-clear-all:hover {
  background: var(--p-tree-danger-color, #dc2626);
  color: white;
}

.p-tree-pending-list {
  max-height: 200px;
  overflow-y: auto;
}

.p-tree-pending-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--p-tree-border-color, #e5e7eb);
}

.p-tree-pending-item:last-child {
  border-bottom: none;
}

.p-tree-pending-info {
  flex: 1;
  margin-right: 1rem;
}

.p-tree-pending-description {
  font-size: 0.875rem;
  color: var(--p-tree-text-color, #374151);
  margin-bottom: 0.25rem;
}

.p-tree-pending-details {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.p-tree-pending-time {
  font-size: 0.75rem;
  color: var(--p-tree-muted-color, #6b7280);
}

.p-tree-pending-cross-tree {
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  background: var(--p-tree-primary-color, #3b82f6);
  color: white;
  border-radius: 0.25rem;
}

.p-tree-pending-actions {
  display: flex;
  gap: 0.5rem;
}

.p-tree-pending-accept,
.p-tree-pending-reject {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.p-tree-pending-accept {
  background: var(--p-tree-success-color, #10b981);
  color: white;
}

.p-tree-pending-accept:hover {
  background: var(--p-tree-success-hover-color, #059669);
}

.p-tree-pending-reject {
  background: var(--p-tree-danger-color, #dc2626);
  color: white;
}

.p-tree-pending-reject:hover {
  background: var(--p-tree-danger-hover-color, #b91c1c);
}
</style>