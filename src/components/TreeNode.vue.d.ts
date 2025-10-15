import { DefineComponent } from 'vue'
import type {
  TreeNode,
  TreeSelectionMode,
  TreeNodeSelectEvent,
  TreeNodeUnselectEvent,
  TreeNodeExpandEvent,
  TreeNodeCollapseEvent,
  TreeNodeDropEvent
} from '../lib/types'

// TreeNode 组件的 Props 接口
export interface TreeNodeProps {
  /**
   * 树节点数据
   */
  node: TreeNode
  
  /**
   * 节点层级
   * @default 0
   */
  level?: number
  
  /**
   * 缩进像素
   * @default 20
   */
  indent?: number
  
  /**
   * 选择模式
   * @default 'single'
   */
  selectionMode?: TreeSelectionMode
  
  /**
   * 是否选中
   * @default false
   */
  isSelected?: boolean
  
  /**
   * 是否部分选中
   * @default false
   */
  isPartiallySelected?: boolean
  
  /**
   * 是否展开
   * @default false
   */
  isExpanded?: boolean
  
  /**
   * 是否聚焦
   * @default false
   */
  isFocused?: boolean
  
  /**
   * 拖拽指示器样式类
   * @default ''
   */
  dragIndicatorClass?: string
  
  /**
   * 是否启用拖拽
   * @default false
   */
  draggableNodes?: boolean
  
  /**
   * 选中时的背景颜色
   * @default '#e3f2fd'
   */
  selectedBackgroundColor?: string
  
  /**
   * 选中时的文字颜色
   * @default '#1565c0'
   */
  selectedTextColor?: string
  
  /**
   * 聚焦时的背景颜色
   * @default '#1e40af'
   */
  focusBackgroundColor?: string
  
  /**
   * 聚焦时的文字颜色
   * @default 'white'
   */
  focusTextColor?: string
}

// TreeNode 组件的 Emits 接口
export interface TreeNodeEmits {
  'node-click': [event: { originalEvent: Event; node: TreeNode }]
  'node-double-click': [event: { originalEvent: Event; node: TreeNode }]
  'node-context-menu': [event: { originalEvent: Event; node: TreeNode }]
  'node-toggle': [event: TreeNodeExpandEvent | TreeNodeCollapseEvent]
  'node-select': [event: TreeNodeSelectEvent]
  'node-unselect': [event: TreeNodeUnselectEvent]
  'node-drag-start': [event: { originalEvent: DragEvent; node: TreeNode }]
  'node-drag-end': [event: { originalEvent: DragEvent; node: TreeNode }]
  'node-drop': [event: TreeNodeDropEvent]
}

// TreeNode 组件的 Slots 接口
export interface TreeNodeSlots {
  /**
   * 自定义节点内容
   */
  node?: (props: { node: TreeNode; level: number }) => any
}

// TreeNode 组件类型定义
declare const TreeNode: DefineComponent<
  TreeNodeProps,
  TreeNodeEmits,
  {},
  {},
  {},
  {},
  {},
  {},
  string,
  {},
  {},
  string,
  TreeNodeSlots
>

export default TreeNode