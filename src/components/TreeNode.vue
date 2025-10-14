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
      :tabindex="!hasChildren ? 0 : -1"
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
      :data-debug-focused="isFocused"
      :data-debug-selected="isSelected"
      :data-debug-has-children="hasChildren"
      :data-debug-node-key="node.key"
      :data-debug-focus-bg="focusBackgroundColor"
      :data-debug-focus-text="focusTextColor"
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
        :aria-label="isExpanded ? 'Collapse' : 'Expand'"
        tabindex="-1"
      >
        <ChevronRight 
          :class="togglerIconClasses"
          :size="16"
        />
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
      </TreeNode>
    </ul>
  </li>
</template>

<script setup lang="ts">
import { computed, inject, type Component, onMounted, ref, nextTick } from 'vue'
import { ChevronRight, Check, Minus, Loader2 } from 'lucide-vue-next'
import type { 
  TreeNode as TreeNodeType, 
  TreeSelectionMode,
  TreeNodeSelectEvent,
  TreeNodeUnselectEvent,
  TreeNodeExpandEvent,
  TreeNodeCollapseEvent,
  TreeNodeDropEvent
} from '../lib/types'

// Props
interface Props {
  node: TreeNodeType
  level?: number
  indent?: number
  selectionMode?: TreeSelectionMode
  isSelected?: boolean
  isPartiallySelected?: boolean
  isExpanded?: boolean
  isFocused?: boolean
  dragIndicatorClass?: string
  draggableNodes?: boolean
  selectedBackgroundColor?: string
  selectedTextColor?: string
  focusBackgroundColor?: string
  focusTextColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  level: 0,
  indent: 20,
  selectionMode: 'single',
  isSelected: false,
  isPartiallySelected: false,
  isExpanded: false,
  isFocused: false,
  dragIndicatorClass: '',
  draggableNodes: false,
  selectedBackgroundColor: '#e3f2fd',
  selectedTextColor: '#1565c0',
  focusBackgroundColor: '#1e40af',
  focusTextColor: 'white'
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

// 添加ref来引用DOM元素
const contentRef = ref<HTMLElement | null>(null)

// 计算属性
const hasChildren = computed(() => {
  return props.node.children && props.node.children.length > 0
})

const isDraggable = computed(() => {
  const result = props.draggableNodes && props.node.draggable !== false
  // 添加更详细的调试信息
  console.log('🔍 isDraggable computed for node:', props.node.key, {
    draggableNodes: props.draggableNodes,
    nodeDraggable: props.node.draggable,
    result: result
  })
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
    // 只有叶子节点（文件）才能有focus样式，文件夹节点不应该有focus样式
    'p-tree-node-focused': props.isFocused && !hasChildren.value,
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
    // 只有叶子节点（文件）才能有focus样式，文件夹节点不应该有focus样式
    'p-tree-node-content-focused': props.isFocused && !hasChildren.value,
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
  if (props.focusBackgroundColor) {
    styles['--p-tree-focus-background'] = props.focusBackgroundColor
  }
  if (props.focusTextColor) {
    styles['--p-tree-focus-color'] = props.focusTextColor
  }
  
  // 只有叶子节点才应用选中和焦点样式
  if (!hasChildren.value) {
    if (props.isFocused) {
      // 焦点样式优先级更高 - 内联样式优先级最高
      if (props.focusBackgroundColor) {
        styles.backgroundColor = props.focusBackgroundColor
      }
      if (props.focusTextColor) {
        styles.color = props.focusTextColor
      }
      styles.outline = 'none'
      styles.border = 'none'
      styles.boxShadow = 'none'
      
      // 调试日志
      console.log('🔥 FOCUS STYLES APPLIED:', {
        nodeKey: props.node.key,
        nodeLabel: props.node.label,
        isFocused: props.isFocused,
        isSelected: props.isSelected,
        hasChildren: hasChildren.value,
        focusBackgroundColor: props.focusBackgroundColor,
        focusTextColor: props.focusTextColor,
        cssVariables: {
          '--p-tree-focus-background': props.focusBackgroundColor,
          '--p-tree-focus-color': props.focusTextColor
        },
        appliedStyles: styles,
        nodeClasses: nodeClasses.value,
        contentClasses: contentClasses.value
      })
    } else if (props.isSelected) {
      // 选中样式
      if (props.selectedBackgroundColor) {
        styles.backgroundColor = props.selectedBackgroundColor
      }
      if (props.selectedTextColor) {
        styles.color = props.selectedTextColor
      }
      
      // 调试日志
      console.log('✅ SELECTED STYLES APPLIED:', {
        nodeKey: props.node.key,
        nodeLabel: props.node.label,
        isFocused: props.isFocused,
        isSelected: props.isSelected,
        hasChildren: hasChildren.value,
        selectedBackgroundColor: props.selectedBackgroundColor,
        selectedTextColor: props.selectedTextColor,
        appliedStyles: styles,
        nodeClasses: nodeClasses.value,
        contentClasses: contentClasses.value
      })
    }
  } else {
    // 调试日志 - 文件夹节点
    console.log('📁 FOLDER NODE (no styles):', {
      nodeKey: props.node.key,
      nodeLabel: props.node.label,
      isFocused: props.isFocused,
      isSelected: props.isSelected,
      hasChildren: hasChildren.value
    })
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
  console.log('🚀🚀🚀 TreeNode handleDragStart called:', props.node.key, props.node.label)
  console.log('🚀 isDraggable:', isDraggable.value)
  console.log('🚀 props.draggableNodes:', props.draggableNodes)
  console.log('🚀 props.node.draggable:', props.node.draggable)
  console.log('🚀 event.target:', event.target)
  console.log('🚀 event.target draggable attribute:', (event.target as HTMLElement)?.getAttribute('draggable'))
  console.log('🚀 contentRef.value:', contentRef.value)
  console.log('🚀 contentRef.value draggable:', contentRef.value?.getAttribute('draggable'))
  console.log('🚀 tree object:', tree)
  console.log('🚀 tree.onDragStart available:', !!tree.onDragStart)
  console.log('🚀 event:', event)
  
  if (!isDraggable.value) {
    console.log('❌ Node is not draggable, preventing default')
    event.preventDefault()
    return
  }
  
  // 调用父组件的拖拽开始方法
  if (tree.onDragStart) {
    console.log('✅ Calling tree.onDragStart')
    tree.onDragStart(event, props.node)
  } else {
    console.log('❌ tree.onDragStart is not available')
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
  console.log('🔥 DRAG OVER:', props.node.label)
  event.preventDefault()
  tree.onDragOver(event, props.node)
}

const handleDragLeave = (event: DragEvent) => {
  console.log('🔥 DRAG LEAVE:', props.node.label)
  tree.onDragLeave(event)
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  
  // 调用父组件的拖拽放置方法
  let dropEvent: TreeNodeDropEvent | null = null
  if (tree.onDrop) {
    dropEvent = tree.onDrop(event, props.node)
  }
  
  // 如果没有返回事件对象，创建一个默认的
  if (!dropEvent) {
    dropEvent = {
      originalEvent: event,
      dragNode: null as any,
      dropNode: props.node,
      dropIndex: 0,
      dropPosition: 'inside',
      accept: () => {}
    }
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
  onDragOver?: (event: DragEvent, node: TreeNodeType) => void;
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

// 调试：检查跨树节点的 DOM 元素
onMounted(() => {
  console.log('🔧 TreeNode mounted:', props.node.label)
  console.log('🔧 Adding direct event listeners to:', props.node.label)
  
  // 使用 nextTick 确保 DOM 已经完全渲染
  nextTick(() => {
    console.log('🔧 contentRef.value:', contentRef.value)
    console.log('🔧 contentRef.value type:', typeof contentRef.value)
    
    if (contentRef.value) {
      console.log('🔧 contentRef.value is valid, adding event listeners')
      console.log('🔧 contentRef.value tagName:', contentRef.value.tagName)
      console.log('🔧 contentRef.value classList:', contentRef.value.classList.toString())
      
      // 添加点击事件测试
      contentRef.value.addEventListener('click', (e) => {
        console.log('🎯 Click event triggered on:', props.node.label)
      })
      
      // 添加鼠标按下事件测试
      contentRef.value.addEventListener('mousedown', (e) => {
        console.log('🎯 Mousedown event triggered on:', props.node.label)
      })
      
      // 添加拖拽开始事件测试
      contentRef.value.addEventListener('dragstart', (e) => {
        console.log('🎯 Direct dragstart event triggered on:', props.node.label)
      })
    } else {
      console.log('🔧 contentRef.value is null or undefined')
    }
  })

  // 原有的跨树节点调试逻辑
  if (props.node.key.toString().startsWith('tree1-') || props.node.key.toString().startsWith('tree2-')) {
    console.log(`🔍 Cross-tree node: ${props.node.key} ${props.node.label} | isDraggable: ${isDraggable.value} | draggableNodes: ${props.draggableNodes} | node.draggable: ${props.node.draggable}`)
    
    // 获取节点的 DOM 元素
    setTimeout(() => {
      const nodeElement = document.querySelector(`[data-node-key="${props.node.key}"]`)
      if (nodeElement) {
        const contentElement = nodeElement.querySelector('.p-tree-node-content')
        console.log(`🔍 DOM element for ${props.node.key}:`, {
          nodeElement,
          contentElement,
          draggable: contentElement?.getAttribute('draggable'),
          hasContentElement: !!contentElement
        })
      } else {
        console.log(`❌ No DOM element found for ${props.node.key}`)
      }
    }, 500)
  }
})
</script>

<style scoped>
/* 基础样式将在单独的 CSS 文件中定义 */
.p-tree-node {
  @apply list-none;
}

.p-tree-node-content {
  @apply flex items-center py-1 px-2 cursor-pointer select-none;
  @apply transition-colors duration-200;
}

.p-tree-node-content.p-tree-node-selectable:hover:not(.p-tree-node-content-focused) {
  @apply bg-blue-50;
}

.p-tree-node-content:hover:not(.p-tree-node-content-focused):not([style*="background-color"]) {
  @apply bg-gray-100;
}

/* 选中状态的默认样式 - 只在没有内联样式时生效 */
.p-tree-node-selected .p-tree-node-content:not([style*="background-color"]) {
  @apply bg-blue-100;
}

.p-tree-node-selected .p-tree-node-content:not([style*="color"]) {
  @apply text-blue-900;
}

/* 焦点状态样式重置 - 移除边框和轮廓，但保留内联样式的优先级 */
.p-tree-node-focused .p-tree-node-content,
.p-tree-node-content-focused {
  outline: none !important;
  border: none !important;
  box-shadow: none !important;
}

/* 选中且焦点状态 - 焦点优先，移除边框和轮廓 */
.p-tree-node-selected.p-tree-node-focused .p-tree-node-content {
  outline: none !important;
  border: none !important;
  box-shadow: none !important;
}

/* 确保内联样式优先级最高 - 使用更高的选择器优先级 */
.p-tree-node .p-tree-node-content[style*="background-color"] {
  /* 内联样式会自动覆盖这里的样式 */
}

.p-tree-node .p-tree-node-content[style*="color"] {
  /* 内联样式会自动覆盖这里的样式 */
}

.p-tree-node-indent {
  @apply inline-block;
}

.p-tree-node-toggler {
  @apply flex items-center justify-center w-6 h-6 rounded;
  @apply hover:bg-gray-200 transition-colors duration-200;
  @apply border-none bg-transparent cursor-pointer;
}

.p-tree-node-toggler-spacer {
  @apply inline-block w-6 h-6;
}

.p-tree-node-toggler-icon {
  @apply transition-transform duration-200;
}

.p-tree-node-toggler-icon-expanded {
  @apply rotate-90;
}

.p-tree-node-checkbox {
  @apply flex items-center justify-center w-5 h-5 mr-2 cursor-pointer;
}

.p-tree-node-checkbox-input {
  @apply sr-only;
}

.p-tree-node-checkbox-box {
  @apply w-4 h-4 border border-gray-300 rounded flex items-center justify-center;
  @apply transition-colors duration-200;
}

.p-tree-node-checkbox-checked .p-tree-node-checkbox-box {
  @apply bg-blue-600 border-blue-600 text-white;
}

.p-tree-node-checkbox-partial .p-tree-node-checkbox-box {
  @apply bg-blue-100 border-blue-300 text-blue-600;
}

.p-tree-node-icon {
  @apply flex items-center justify-center w-5 h-5 mr-2;
}

.p-tree-node-loading {
  @apply flex items-center justify-center w-5 h-5 mr-2 text-blue-600;
}

.p-tree-node-label {
  @apply flex-1 truncate;
}

.p-tree-node-children {
  @apply list-none m-0 p-0;
}

/* 拖拽样式 */
.p-tree-node-dragging {
  @apply opacity-50;
}

.p-tree-drop-indicator {
  @apply relative;
}

.p-tree-drop-indicator::before {
  @apply absolute inset-0 bg-blue-100 border border-blue-300 rounded;
  content: '';
  pointer-events: none;
}

.p-tree-drop-above::before {
  @apply -top-1 h-0.5 bg-blue-600;
}

.p-tree-drop-below::before {
  @apply -bottom-1 h-0.5 bg-blue-600;
}

/* 跨树拖拽样式 */
.p-tree-cross-tree-drop::before {
  @apply border-green-400 bg-green-50;
}

.p-tree-cross-tree-drop.p-tree-drop-above::before {
  @apply bg-green-600;
}

.p-tree-cross-tree-drop.p-tree-drop-below::before {
  @apply bg-green-600;
}
</style>