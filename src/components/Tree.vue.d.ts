import { DefineComponent } from 'vue'
import type {
  TreeNode,
  TreeProps,
  TreeSelectionKeys,
  TreeExpandedKeys,
  TreeNodeSelectEvent,
  TreeNodeUnselectEvent,
  TreeNodeExpandEvent,
  TreeNodeCollapseEvent,
  TreeNodeDropEvent,
  TreeNodeFocusEvent,
  TreeNodeBlurEvent,
  TreeNodeClickEvent
} from '../lib/types'

// Tree 组件的 Expose 接口
export interface TreeExpose {
  /**
   * 获取选中的节点
   */
  getSelectedNodes: () => TreeNode[]
  
  /**
   * 获取展开的节点
   */
  getExpandedNodes: () => TreeNode[]
  
  /**
   * 滚动到指定节点
   */
  scrollToNode: (nodeKey: string | number) => void
  
  /**
   * 清除选择
   */
  clearSelection: () => void
  
  /**
   * 重置状态
   */
  resetState: () => void
  
  /**
   * 聚焦到指定节点
   */
  focusNode: (node: TreeNode) => void
  
  /**
   * 清除焦点
   */
  clearFocus: () => void
  
  /**
   * 聚焦到下一个节点
   */
  focusNext: () => void
  
  /**
   * 聚焦到上一个节点
   */
  focusPrevious: () => void
  
  /**
   * 聚焦到第一个节点
   */
  focusFirst: () => void
  
  /**
   * 聚焦到最后一个节点
   */
  focusLast: () => void
  
  /**
   * 获取当前聚焦的节点
   */
  getFocusedNode: () => TreeNode | null
  
  /**
   * 发出节点拖拽开始事件
   */
  emitNodeDragFrom: (event: any) => void
  
  /**
   * 发出节点拖拽结束事件
   */
  emitNodeDragTo: (event: any) => void
}

// Tree 组件的 Emits 接口
export interface TreeEmits {
  'node-select': [event: TreeNodeSelectEvent]
  'node-unselect': [event: TreeNodeUnselectEvent]
  'node-expand': [event: TreeNodeExpandEvent]
  'node-collapse': [event: TreeNodeCollapseEvent]
  'node-focus': [event: TreeNodeFocusEvent]
  'node-blur': [event: TreeNodeBlurEvent]
  'node-click': [event: TreeNodeClickEvent]
  'node-double-click': [event: { originalEvent: Event; node: TreeNode }]
  'node-context-menu': [event: { originalEvent: Event; node: TreeNode }]
  'node-drop': [event: TreeNodeDropEvent]
  'node-drag-from': [event: { 
    originalEvent: DragEvent
    dragNode: TreeNode
    dropNode: TreeNode
    dropPosition: string
    sourceTreeId: string
    targetTreeId: string
  }]
  'node-drag-to': [event: { 
    originalEvent: DragEvent
    dragNode: TreeNode
    dropNode: TreeNode
    dropPosition: string
    sourceTreeId: string
    targetTreeId: string
  }]
  'node-load': [event: any]
  'filter': [event: { originalEvent: Event; value: string }]
  'selection-change': [event: { originalEvent: Event; value: any }]
  'node-drag-start': [event: { originalEvent: DragEvent; node: TreeNode }]
  'node-drag-end': [event: { originalEvent: DragEvent; node: TreeNode }]
  'hover-change': [hoverInfo: {
    targetTreeId?: string
    dropPosition?: string
    dropNodeLabel?: string
    isCrossTree?: boolean
  } | null]
  'node-toggle': [event: any]
  'update:selectionKeys': [value: TreeSelectionKeys]
  'update:expandedKeys': [value: TreeExpandedKeys]
  'update:modelValue': [value: any]
}

// Tree 组件类型定义
declare const Tree: DefineComponent<TreeProps, TreeEmits, {}, {}, {}, {}, {}, TreeExpose>

export default Tree