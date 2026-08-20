<template>
  <li 
    :class="nodeClasses"
    :style="nodeStyles"
    role="treeitem"
    :aria-expanded="hasChildren ? isExpanded : undefined"
    :aria-selected="isSelected && !hasChildren"
    :aria-level="level + 1"
    :data-node-key="node.key"
  >
    <!-- 节点内容 -->
    <div
      ref="contentRef"
      :class="contentClasses"
      :style="contentStyles"
      :tabindex="0"
      @click="handleNodeClick"
      @dblclick="handleNodeDoubleClick"
      @contextmenu="handleContextMenu"
      @dragstart="handleDragStart"
      @dragend="handleDragEnd"
      @dragenter="handleDragEnter"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      :draggable="isDraggable"
    >
      <!-- 缩进 -->
      <span 
        v-for="i in level" 
        :key="i" 
        class="p-tree-node-indent"
        :style="{ width: `${indent}px` }"
      ></span>

      <!-- 展开/折叠按钮 -->
      <button
        v-if="hasChildren"
        :class="togglerClasses"
        @click.stop="handleToggle"
        type="button"
        :aria-label="isExpanded ? mergedConfig.i18n.collapse : mergedConfig.i18n.expand"
        tabindex="-1"
      >
        <svg 
          :class="togglerIconClasses"
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          fill="currentColor"
        >
          <polygon points="6,4 6,12 10,8" />
        </svg>
      </button>
      <span v-else class="p-tree-node-toggler-spacer"></span>

      <!-- 复选框 (仅在 checkbox 模式下显示) -->
      <div
        v-if="selectionMode === 'checkbox'"
        :class="checkboxClasses"
        @click.stop="handleCheckboxClick"
      >
        <input
          type="checkbox"
          :checked="isSelected"
          :indeterminate="isPartiallySelected"
          class="p-tree-node-checkbox-input"
          tabindex="-1"
          readonly
        />
        <div class="p-tree-node-checkbox-box">
          <Check v-if="isSelected" :size="12" />
          <Minus v-else-if="isPartiallySelected" :size="12" />
        </div>
      </div>

      <!-- 节点图标 -->
      <span v-if="nodeIcon" :class="iconClasses">
        <component 
          v-if="isIconComponent(nodeIcon)" 
          :is="nodeIcon" 
          :size="16" 
        />
        <i v-else :class="nodeIcon"></i>
      </span>

      <!-- 加载指示器 -->
      <span v-if="node.loading" class="p-tree-node-loading">
        <Loader2 :size="16" class="animate-spin" />
      </span>

      <!-- 节点标签 -->
      <span :class="labelClasses">
        <slot name="node" :node="node" :level="level">
          {{ node.label }}
        </slot>
      </span>

      <!-- 节点操作按钮（悬停显示；点击不触发选中/展开/拖拽） -->
      <span
        v-if="$slots.actions || resolvedActions.length > 0"
        class="p-tree-node-actions"
        @click.stop
        @dblclick.stop
        @contextmenu.stop
        @mousedown.stop
        @dragstart.stop
      >
        <slot name="actions" :node="node" :level="level">
          <button
            v-for="action in resolvedActions"
            :key="action.key"
            type="button"
            class="p-tree-node-action"
            :class="{ 'p-tree-node-action-danger': action.danger }"
            :title="action.title"
            :aria-label="action.title || action.label || action.key"
            :disabled="isActionDisabled(action)"
            tabindex="-1"
            @click.stop="handleActionClick(action, $event)"
          >
            <component
              v-if="action.icon && isIconComponent(action.icon)"
              :is="action.icon"
              :size="14"
            />
            <i v-else-if="action.icon" :class="action.icon"></i>
            <span v-else>{{ action.label }}</span>
          </button>
        </slot>
      </span>
    </div>

    <!-- 子节点 -->
    <ul
      v-if="hasChildren && isExpanded"
      :class="childrenClasses"
      role="group"
    >
      <TreeNode
        v-for="child in node.children"
        :key="child.key"
        :node="child"
        :level="level + 1"
        :indent="indent"
        :selection-mode="selectionMode"
        :is-selected="isChildSelected(child)"
        :is-partially-selected="isChildPartiallySelected(child)"
        :is-expanded="isChildExpanded(child)"
        :drag-indicator-class="getDragIndicatorClass(child)"
        :draggable-nodes="draggableNodes"
        :selected-background-color="selectedBackgroundColor"
        :selected-text-color="selectedTextColor"
        :focus-background-color="focusBackgroundColor"
        :focus-text-color="focusTextColor"
        :tree-id="treeId"
        :config="config"
        :node-actions="nodeActions"
        @node-click="$emit('node-click', $event)"
        @node-double-click="$emit('node-double-click', $event)"
        @node-context-menu="$emit('node-context-menu', $event)"
        @node-toggle="$emit('node-toggle', $event)"
        @node-select="$emit('node-select', $event)"
        @node-unselect="$emit('node-unselect', $event)"
        @node-drag-start="$emit('node-drag-start', $event)"
        @node-drag-end="$emit('node-drag-end', $event)"
        @node-drop="$emit('node-drop', $event)"
      >
        <template #node="slotProps">
          <slot name="node" v-bind="slotProps" />
        </template>
        <template #actions="slotProps">
          <slot name="actions" v-bind="slotProps" />
        </template>
      </TreeNode>
    </ul>
  </li>
</template>

<script setup lang="ts">
import { computed, inject, type Component, ref } from 'vue'
import { Check, Minus, Loader2 } from 'lucide-vue-next'
import type {
  TreeNode as TreeNodeType,
  TreeSelectionMode,
  TreeNodeSelectEvent,
  TreeNodeUnselectEvent,
  TreeNodeExpandEvent,
  TreeNodeCollapseEvent,
  TreeNodeDropEvent,
  TreeConfig,
  TreeNodeAction
} from '../lib/types'
import { DEFAULT_TREE_CONFIG } from '../lib/types'

// Props
interface Props {
  node: TreeNodeType
  level?: number
  indent?: number
  selectionMode?: TreeSelectionMode
  isSelected?: boolean
  isPartiallySelected?: boolean
  isExpanded?: boolean
  dragIndicatorClass?: string
  draggableNodes?: boolean
  selectedBackgroundColor?: string
  selectedTextColor?: string
  focusBackgroundColor?: string
  focusTextColor?: string
  treeId?: string
  config?: TreeConfig
  nodeActions?: TreeNodeAction[]
}

const props = withDefaults(defineProps<Props>(), {
  level: 0,
  indent: 20,
  selectionMode: 'single',
  isSelected: false,
  isPartiallySelected: false,
  isExpanded: false,
  dragIndicatorClass: '',
  draggableNodes: false,
  selectedBackgroundColor: '#e3f2fd',
  selectedTextColor: '#1565c0',
  focusBackgroundColor: '#1e40af',
  focusTextColor: 'white',
  nodeActions: () => []
})

// Emits
interface Emits {
  'node-click': [event: { originalEvent: Event; node: TreeNodeType }]
  'node-double-click': [event: { originalEvent: Event; node: TreeNodeType }]
  'node-context-menu': [event: { originalEvent: Event; node: TreeNodeType }]
  'node-toggle': [event: TreeNodeExpandEvent | TreeNodeCollapseEvent]
  'node-select': [event: TreeNodeSelectEvent]
  'node-unselect': [event: TreeNodeUnselectEvent]
  'node-drag-start': [event: { originalEvent: DragEvent; node: TreeNodeType }]
  'node-drag-end': [event: { originalEvent: DragEvent; node: TreeNodeType }]
  'node-drop': [event: TreeNodeDropEvent]
}

const emit = defineEmits<Emits>()

// 配置合并
const mergedConfig = computed(() => ({
  ...DEFAULT_TREE_CONFIG,
  ...props.config
}))

// 添加ref来引用DOM元素
const contentRef = ref<HTMLElement | null>(null)

// 计算属性
const hasChildren = computed(() => {
  return props.node.children && props.node.children.length > 0
})

const isDraggable = computed(() => {
  const result = props.draggableNodes && props.node.draggable !== false
  // 添加更详细的调试信息
  return result
})

const nodeIcon = computed(() => {
  if (props.node.loading) return null
  
  if (hasChildren.value) {
    return props.isExpanded 
      ? (props.node.expandedIcon || props.node.icon)
      : (props.node.collapsedIcon || props.node.icon)
  }
  
  return props.node.icon
})

// 样式类
const nodeClasses = computed(() => [
  'p-tree-node',
  {
    'p-tree-node-leaf': !hasChildren.value,
    'p-tree-node-expanded': hasChildren.value && props.isExpanded,
    'p-tree-node-collapsed': hasChildren.value && !props.isExpanded,
    // 只有叶子节点（文件）才能显示选中样式，文件夹不显示选中样式
    'p-tree-node-selected': props.isSelected && !hasChildren.value,
    'p-tree-node-partial': props.isPartiallySelected && !hasChildren.value,
    'p-tree-node-loading': props.node.loading,
  },
  props.node.styleClass,
  props.dragIndicatorClass
])

const contentClasses = computed(() => [
  'p-tree-node-content',
  {
    // 只有叶子节点（文件）才能被选中，文件夹节点不应该有选中相关的类
    'p-tree-node-selectable': props.node.selectable !== false && !hasChildren.value,
    'p-tree-node-draggable': isDraggable.value,
    'p-tree-node-droppable': props.node.droppable !== false,
  }
])

const togglerClasses = computed(() => [
  'p-tree-node-toggler',
  {
    'p-tree-node-toggler-expanded': props.isExpanded,
    'p-tree-node-toggler-collapsed': !props.isExpanded,
  }
])

const togglerIconClasses = computed(() => [
  'p-tree-node-toggler-icon',
  {
    'p-tree-node-toggler-icon-expanded': props.isExpanded,
    'p-tree-node-toggler-icon-collapsed': !props.isExpanded,
  }
])

const checkboxClasses = computed(() => [
  'p-tree-node-checkbox',
  {
    'p-tree-node-checkbox-checked': props.isSelected,
    'p-tree-node-checkbox-partial': props.isPartiallySelected,
  }
])

const iconClasses = computed(() => [
  'p-tree-node-icon',
  {
    'p-tree-node-icon-expanded': hasChildren.value && props.isExpanded,
    'p-tree-node-icon-collapsed': hasChildren.value && !props.isExpanded,
    'p-tree-node-icon-leaf': !hasChildren.value,
  }
])

const labelClasses = computed(() => [
  'p-tree-node-label',
  {
    // 只有叶子节点（文件）才能显示选中样式，文件夹不显示选中样式
    'p-tree-node-label-selected': props.isSelected && !hasChildren.value,
  }
])

const childrenClasses = computed(() => [
  'p-tree-node-children'
])

// 样式
const nodeStyles = computed(() => ({
  ...props.node.style
}))

const contentStyles = computed(() => {
  const styles: Record<string, any> = {
    paddingLeft: `${props.level * props.indent}px`
  }
  
  // 设置CSS变量，用于CSS文件中的样式
  const focusBackgroundColor = props.focusBackgroundColor || mergedConfig.value.style.focusBackgroundColor
  const focusTextColor = props.focusTextColor || mergedConfig.value.style.focusTextColor
  
  if (focusBackgroundColor) {
    styles['--p-tree-focus-background'] = focusBackgroundColor
  }
  if (focusTextColor) {
    styles['--p-tree-focus-color'] = focusTextColor
  }
  
  // 只有叶子节点才应用选中样式
  if (!hasChildren.value && props.isSelected) {
    // 选中样式
    const selectedBackgroundColor = props.selectedBackgroundColor || mergedConfig.value.style.selectedBackgroundColor
    const selectedTextColor = props.selectedTextColor || mergedConfig.value.style.selectedTextColor
    
    if (selectedBackgroundColor) {
      styles.backgroundColor = selectedBackgroundColor
    }
    if (selectedTextColor) {
      styles.color = selectedTextColor
    }
  }
  
  return styles
})

// 事件处理
const handleNodeClick = (event: MouseEvent) => {
  try {
    if (props.node.selectable === false) return
    
    emit('node-click', { originalEvent: event, node: props.node })
    
    // 检查是否为文件夹节点（有children的节点）
    const isFolder = hasChildren.value
    
    if (isFolder) {
      // 文件夹节点只触发展开/折叠，不触发选中
      handleToggle(event)
      return
    }
    
    // 只有叶子节点（文件）才能被选中
    // 自动选择逻辑
    if (props.selectionMode === 'single') {
      if (!props.isSelected) {
        emit('node-select', { originalEvent: event, node: props.node })
      }
    } else if (props.selectionMode === 'multiple') {
      if (event.ctrlKey || event.metaKey) {
        if (props.isSelected) {
          emit('node-unselect', { originalEvent: event, node: props.node })
        } else {
          emit('node-select', { originalEvent: event, node: props.node })
        }
      } else {
        emit('node-select', { originalEvent: event, node: props.node })
      }
    }
  } catch (error) {
    console.error('TreeNode click error:', error)
  }
}

const handleNodeDoubleClick = (event: Event) => {
  emit('node-double-click', { originalEvent: event, node: props.node })
  
  // 双击展开/折叠
  if (hasChildren.value) {
    handleToggle(event)
  }
}

const handleContextMenu = (event: Event) => {
  emit('node-context-menu', { originalEvent: event, node: props.node })
}

const handleToggle = (event: Event) => {
  if (!hasChildren.value) return
  
  if (props.isExpanded) {
    emit('node-toggle', {
      originalEvent: event,
      node: props.node
    } as TreeNodeCollapseEvent)
  } else {
    emit('node-toggle', {
      originalEvent: event,
      node: props.node
    } as TreeNodeExpandEvent)
  }
}

const handleCheckboxClick = (event: Event) => {
  if (props.selectionMode !== 'checkbox') return
  
  if (props.isSelected) {
    emit('node-unselect', { originalEvent: event, node: props.node })
  } else {
    emit('node-select', { originalEvent: event, node: props.node })
  }
}

// 拖拽事件
const handleDragStart = (event: DragEvent) => {
  
  if (!isDraggable.value) {
    event.preventDefault()
    return
  }
  
  // 调用父组件的拖拽开始方法
  if (tree.onDragStart) {
    tree.onDragStart(event, props.node)
  } else {
  }
  
  // 发出拖拽开始事件
  emit('node-drag-start', { originalEvent: event, node: props.node })
}

const handleDragEnd = (event: DragEvent) => {
  // 调用父组件的拖拽结束方法
  if (tree.onDragEnd) {
    tree.onDragEnd(event)
  }
  
  emit('node-drag-end', { originalEvent: event, node: props.node })
}

const handleDragEnter = (event: DragEvent) => {
  event.preventDefault()
  
  // 调用父组件的拖拽进入方法
  if (tree.onDragEnter) {
    tree.onDragEnter(event, props.node)
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (tree.onDragOver) {
    tree.onDragOver(event, props.node, props.treeId || '')
  }
}

const handleDragLeave = (event: DragEvent) => {
  if (tree.onDragLeave) {
    tree.onDragLeave(event)
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  
  
  // 调用父组件的拖拽放置方法
  let dropEvent: TreeNodeDropEvent | null = null
  if (tree.onDrop) {
    dropEvent = tree.onDrop(event, props.node)
  }
  
  // 对于跨树拖拽，即使 tree.onDrop 返回 null，也要触发 node-drop 事件
  // 让 Tree 组件来处理跨树拖拽逻辑
  if (!dropEvent) {
    // 创建一个基础的 dropEvent 对象，让 Tree 组件处理
    dropEvent = {
      originalEvent: event,
      dragNode: null as any, // 将在 Tree 组件中设置
      dropNode: props.node,
      dropIndex: 0,
      dropPosition: 'inside',
      sourceTreeId: undefined,
      targetTreeId: undefined,
      isCrossTree: false,
      accept: () => {},
      reject: () => {}
    }
  }
  
  // 如果仍然没有有效的事件对象，才跳过
  if (!dropEvent) {
    return
  }
  
  emit('node-drop', dropEvent)
}

// 从父组件注入状态检查函数
interface TreeContext {
  isNodeSelected: (node: TreeNodeType) => boolean;
  isNodePartiallySelected: (node: TreeNodeType) => boolean;
  isNodeExpanded: (node: TreeNodeType) => boolean;
  getDragIndicatorClass: (node: TreeNodeType) => string;
  onDragStart?: (event: DragEvent, node: TreeNodeType) => void;
  onDragEnd?: (event: DragEvent) => void;
  onDragEnter?: (event: DragEvent, node: TreeNodeType) => void;
  onDragOver?: (event: DragEvent, node: TreeNodeType, treeId: string) => void;
  onDragLeave?: (event: DragEvent) => void;
  onDrop?: (event: DragEvent, node: TreeNodeType) => TreeNodeDropEvent | null;
}

const tree = inject<TreeContext>('tree', {
  isNodeSelected: () => false,
  isNodePartiallySelected: () => false,
  isNodeExpanded: () => false,
  getDragIndicatorClass: () => ''
})

// 子节点状态检查
const isChildSelected = (child: TreeNodeType) => {
  return tree.isNodeSelected(child)
}

const isChildPartiallySelected = (child: TreeNodeType) => {
  return tree.isNodePartiallySelected(child)
}

const isChildExpanded = (child: TreeNodeType) => {
  return tree.isNodeExpanded(child)
}

const getDragIndicatorClass = (child: TreeNodeType) => {
  return tree.getDragIndicatorClass(child)
}

// 工具函数
const isIconComponent = (icon: any): icon is Component => {
  return typeof icon === 'object' || typeof icon === 'function'
}

// 节点操作按钮：按 visible 过滤
const resolvedActions = computed(() => {
  return (props.nodeActions || []).filter(action => {
    if (action.visible === undefined) return true
    return typeof action.visible === 'function' ? action.visible(props.node) : action.visible
  })
})

const isActionDisabled = (action: TreeNodeAction): boolean => {
  if (action.disabled === undefined) return false
  return typeof action.disabled === 'function' ? action.disabled(props.node) : action.disabled
}

const handleActionClick = (action: TreeNodeAction, event: MouseEvent) => {
  if (isActionDisabled(action)) return
  action.onClick(props.node, event)
}
</script>

<style scoped>
/* 移除所有Tailwind类，使用tree.css中的全局样式 */
/* 这些样式现在由tree.css和主题系统统一管理 */

/* 只保留组件特定的样式覆盖 */
.p-tree-node-content {
  /* 确保内联样式优先级 */
}

.p-tree-node-content[style*="background-color"] {
  /* 内联样式会自动覆盖全局样式 */
}

.p-tree-node-content[style*="color"] {
  /* 内联样式会自动覆盖全局样式 */
}

/* 焦点状态样式重置 - 确保与全局样式一致 */
.p-tree-node-focused .p-tree-node-content {
  outline: none !important;
  border: none !important;
  box-shadow: none !important;
}

/* 选中且焦点状态 - 确保与全局样式一致 */
.p-tree-node-selected.p-tree-node-focused .p-tree-node-content {
  outline: none !important;
  border: none !important;
  box-shadow: none !important;
}
</style>