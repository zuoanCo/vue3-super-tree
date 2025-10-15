/**
 * PrimeVue Tree 组件类型定义
 * 完整复刻 PrimeVue Tree 的类型系统
 */

import type { Component, Ref, ComputedRef } from 'vue'

// 基础树节点接口
export interface TreeNode {
  /** 节点唯一标识符 */
  key: string | number;
  /** 节点显示标签 */
  label: string;
  /** 节点关联的数据 */
  data?: any;
  /** 节点图标 */
  icon?: string | Component;
  /** 展开状态图标 */
  expandedIcon?: string | Component;
  /** 折叠状态图标 */
  collapsedIcon?: string | Component;
  /** 子节点数组 */
  children?: TreeNode[];
  /** 是否为叶子节点 */
  leaf?: boolean;
  /** 是否展开 */
  expanded?: boolean;
  /** 节点类型 */
  type?: string;
  /** 是否可选择 */
  selectable?: boolean;
  /** 是否可作为拖拽目标 */
  droppable?: boolean;
  /** 是否可拖拽 */
  draggable?: boolean;
  /** 是否正在加载 */
  loading?: boolean;
  /** 是否懒加载 */
  lazy?: boolean;
  /** 节点样式类 */
  styleClass?: string;
  /** 节点样式 */
  style?: Record<string, any>;
}

// 复选框选择状态
export interface TreeCheckboxSelectionKeys {
  /** 是否选中 */
  checked?: boolean;
  /** 是否部分选中 */
  partialChecked?: boolean;
}

// 选择状态类型
export type TreeSelectionKeys = 
  | { [key: string]: boolean | TreeCheckboxSelectionKeys }
  | TreeNode[]
  | TreeNode
  | null;

// 展开状态类型
export type TreeExpandedKeys = {
  [key: string]: boolean;
};

// 选择模式
export type TreeSelectionMode = 'single' | 'multiple' | 'checkbox';

// 过滤模式
export type TreeFilterMode = 'lenient' | 'strict';

// 拖拽位置
export type TreeDropPosition = 'above' | 'below' | 'inside';

// 事件类型定义
export interface TreeNodeSelectEvent {
  /** 原始事件 */
  originalEvent: Event;
  /** 选中的节点 */
  node: TreeNode;
}

export interface TreeNodeFocusEvent {
  /** 原始事件 */
  originalEvent: Event;
  /** 获得焦点的节点 */
  node: TreeNode;
}

export interface TreeNodeBlurEvent {
  /** 原始事件 */
  originalEvent: Event;
  /** 失去焦点的节点 */
  node: TreeNode;
}

// 键盘处理结果类型
export type KeyboardHandleResult = 
  | { blurEvent: TreeNodeBlurEvent | null; focusEvent: TreeNodeFocusEvent | null }
  | { type: 'activate'; node: TreeNode; event: KeyboardEvent }
  | null

export interface TreeNodeClickEvent {
  /** 原始事件 */
  originalEvent: Event;
  /** 被点击的节点 */
  node: TreeNode;
}

export interface TreeNodeUnselectEvent {
  /** 原始事件 */
  originalEvent: Event;
  /** 取消选中的节点 */
  node: TreeNode;
}

export interface TreeNodeExpandEvent {
  /** 原始事件 */
  originalEvent: Event;
  /** 展开的节点 */
  node: TreeNode;
}

export interface TreeNodeCollapseEvent {
  /** 原始事件 */
  originalEvent: Event;
  /** 折叠的节点 */
  node: TreeNode;
}

export interface TreeNodeDropEvent {
  /** 原始事件 */
  originalEvent: DragEvent;
  /** 被拖拽的节点 */
  dragNode: TreeNode;
  /** 拖拽目标节点 */
  dropNode: TreeNode;
  /** 拖拽位置 */
  dropIndex: number;
  /** 拖拽位置类型 */
  dropPosition: TreeDropPosition;
  /** 源树ID（跨树拖拽时使用） */
  sourceTreeId?: string;
  /** 目标树ID（跨树拖拽时使用） */
  targetTreeId?: string;
  /** 是否为跨树拖拽 */
  isCrossTree?: boolean;
  /** 接受拖拽操作 */
  accept: () => void;
}

export interface TreeLazyLoadEvent {
  /** 原始事件 */
  originalEvent: Event;
  /** 需要加载的节点 */
  node: TreeNode;
}

// 组件状态管理
export interface TreeState {
  /** 选择状态 */
  selectionKeys: TreeSelectionKeys;
  /** 展开状态 */
  expandedKeys: TreeExpandedKeys;
  /** 当前焦点节点 */
  focusedNode: TreeNode | null;
  /** 过滤值 */
  filterValue: string;
  /** 过滤后的节点 */
  filteredNodes: TreeNode[];
  /** 是否正在加载 */
  loading: boolean;
}

// 拖拽状态管理
export interface DragDropState {
  /** 被拖拽的节点 */
  dragNode: TreeNode | null;
  /** 拖拽目标节点 */
  dropNode: TreeNode | null;
  /** 拖拽位置 */
  dropPosition: TreeDropPosition | null;
  /** 是否正在拖拽 */
  isDragging: boolean;
  /** 拖拽作用域 */
  dragScope?: string;
  /** 拖拽开始位置 */
  dragStartPosition?: { x: number; y: number };
  /** 源树ID（跨树拖拽时使用） */
  sourceTreeId?: string;
  /** 目标树ID（跨树拖拽时使用） */
  targetTreeId?: string;
}

// 过滤配置
export interface TreeFilterConfig {
  /** 过滤模式 */
  mode: TreeFilterMode;
  /** 过滤字段 */
  field: string;
  /** 是否区分大小写 */
  matchCase?: boolean;
}

// 组件属性接口
export interface TreeProps {
  /** 树形数据 */
  value: TreeNode[];
  /** 树的唯一标识符，用于跨树拖拽 */
  id?: string;
  /** v-model 绑定的选中值 */
  modelValue?: TreeSelectionKeys;
  /** 选择模式 */
  selectionMode?: TreeSelectionMode;
  /** 选择状态 */
  selectionKeys?: TreeSelectionKeys;
  /** 展开状态 */
  expandedKeys?: TreeExpandedKeys;
  /** 是否启用拖拽 */
  dragdropScope?: string;
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 加载文本 */
  loadingText?: string;
  /** 是否启用过滤 */
  filter?: boolean;
  /** 过滤模式 */
  filterMode?: TreeFilterMode;
  /** 过滤字段 */
  filterBy?: string;
  /** 过滤占位符 */
  filterPlaceholder?: string;
  /** 过滤区域设置 */
  filterLocale?: string;
  /** 是否启用懒加载 */
  lazy?: boolean;
  /** 是否显示根节点 */
  showRoot?: boolean;
  /** 节点缩进像素 */
  indent?: number;
  /** 空状态消息 */
  emptyMessage?: string;
  /** 无障碍标签 */
  ariaLabel?: string;
  /** 无障碍标签引用 */
  ariaLabelledBy?: string;
  /** 滚动高度 */
  scrollHeight?: string;
  /** 虚拟滚动选项 */
  virtualScrollerOptions?: any;
  /** 是否启用元键选择 */
  metaKeySelection?: boolean;
  /** 是否向上传播选择 */
  propagateSelectionUp?: boolean;
  /** 是否向下传播选择 */
  propagateSelectionDown?: boolean;
  /** 是否验证拖拽 */
  validateDrop?: boolean;
  /** 选中时的背景颜色 */
  selectedBackgroundColor?: string;
  /** 选中时的文字颜色 */
  selectedTextColor?: string;
  /** 获取焦点时的背景颜色 */
  focusBackgroundColor?: string;
  /** 获取焦点时的文字颜色 */
  focusTextColor?: string;
  /** 组件样式类 */
  class?: string;
  /** 组件样式 */
  style?: Record<string, any>;
}

// 组件事件接口
export interface TreeEmits {
  /** 节点选中事件 */
  'node-select': [event: TreeNodeSelectEvent];
  /** 节点取消选中事件 */
  'node-unselect': [event: TreeNodeUnselectEvent];
  /** 节点展开事件 */
  'node-expand': [event: TreeNodeExpandEvent];
  /** 节点折叠事件 */
  'node-collapse': [event: TreeNodeCollapseEvent];
  /** 节点获得焦点事件 */
  'node-focus': [event: TreeNodeFocusEvent];
  /** 节点失去焦点事件 */
  'node-blur': [event: TreeNodeBlurEvent];
  /** 节点点击事件 */
  'node-click': [event: TreeNodeClickEvent];
  /** 节点拖拽放置事件 */
  'node-drop': [event: TreeNodeDropEvent];
  /** 懒加载事件 */
  'node-load': [event: TreeLazyLoadEvent];
  /** 过滤事件 */
  'filter': [event: { originalEvent: Event; value: string }];
  /** 选择状态变化事件 */
  'selection-change': [event: { originalEvent: Event; value: TreeSelectionKeys }];
  /** 节点拖拽开始事件 */
  'node-drag-start': [event: { originalEvent: DragEvent; node: TreeNode }];
  /** 节点拖拽结束事件 */
  'node-drag-end': [event: { originalEvent: DragEvent; node: TreeNode }];
  /** 选择状态更新 */
  'update:selectionKeys': [value: TreeSelectionKeys];
  /** 展开状态更新 */
  'update:expandedKeys': [value: TreeExpandedKeys];
  /** v-model 支持 */
  'update:modelValue': [value: TreeSelectionKeys];
}

// 工具函数类型
export type TreeNodePredicate = (node: TreeNode) => boolean;
export type TreeNodeMapper<T> = (node: TreeNode) => T;
export type TreeNodeVisitor = (node: TreeNode, parent?: TreeNode, level?: number) => void;

// 示例数据类型
export interface SampleTreeData {
  basic: TreeNode[];
  withIcons: TreeNode[];
  withSelection: TreeNode[];
  withLazyLoad: TreeNode[];
  withCustomTypes: TreeNode[];
}

// Composables 返回类型定义
export interface UseTreeStateReturn {
  // 响应式状态
  selectionKeys: Ref<TreeSelectionKeys>;
  expandedKeys: Ref<TreeExpandedKeys>;
  loading: Ref<boolean>;
  
  // 计算属性
  selectedNodes: ComputedRef<any[]>;
  expandedNodes: ComputedRef<TreeNode[]>;
  hasSelection: ComputedRef<boolean>;
  hasExpanded: ComputedRef<boolean>;
  
  // 选择相关方法
  selectNode: (node: TreeNode, selected?: boolean) => void;
  toggleNodeSelection: (node: TreeNode) => void;
  clearSelection: () => void;
  selectAll: () => void;
  setSelectionKeys: (keys: TreeSelectionKeys) => void;
  
  // 展开相关方法
  expandNode: (node: TreeNode, expanded?: boolean) => void;
  toggleNodeExpansion: (node: TreeNode) => void;
  expandAllNodes: () => void;
  collapseAllNodes: () => void;
  setExpandedKeys: (keys: TreeExpandedKeys) => void;
  
  // 状态检查方法
  isSelected: (node: TreeNode) => boolean;
  isPartiallySelected: (node: TreeNode) => boolean;
  isExpanded: (node: TreeNode) => boolean;
  
  // 工具方法
  resetState: () => void;
}

export interface UseDragDropReturn {
  // 状态
  dragState: Ref<DragDropState>;
  isDragging: ComputedRef<boolean>;
  dragNode: ComputedRef<TreeNode | null>;
  dropNode: ComputedRef<TreeNode | null>;
  dropPosition: ComputedRef<TreeDropPosition | null>;
  
  // 拖拽事件处理
  onDragStart: (event: DragEvent, node: TreeNode) => void;
  onDragEnd: (event: DragEvent) => void;
  onDragEnter: (event: DragEvent, node: TreeNode) => void;
  onDragOver: (event: DragEvent, node: TreeNode, treeId?: string) => void;
  onDragLeave: (event: DragEvent) => void;
  onDrop: (event: DragEvent, node: TreeNode) => void;
  
  // 工具方法
  isDraggable: (node: TreeNode) => boolean;
  isDroppable: (node: TreeNode) => boolean;
  getDragIndicatorClass: (node: TreeNode) => string;
  resetDragState: () => void;
  setDragScope: (scope: string) => void;
}

export interface UseFocusReturn {
  // 状态
  focusedNode: Ref<TreeNode | null>;
  focusedNodeKey: Ref<string | number | null>;
  hasFocus: ComputedRef<boolean>;
  focusableNodes: ComputedRef<TreeNode[]>;
  currentFocusIndex: ComputedRef<number>;
  
  // 焦点方法
  focusNode: (node: TreeNode | null, event?: Event) => { blurEvent: TreeNodeBlurEvent | null; focusEvent: TreeNodeFocusEvent | null } | null;
  clearFocus: (event?: Event) => { blurEvent: TreeNodeBlurEvent | null; focusEvent: TreeNodeFocusEvent | null } | null;
  focusNodeByKey: (key: string | number, event?: Event) => { blurEvent: TreeNodeBlurEvent | null; focusEvent: TreeNodeFocusEvent | null } | null;
  isFocused: (node: TreeNode) => boolean;
  
  // 键盘导航
  focusNext: (event?: Event) => { blurEvent: TreeNodeBlurEvent | null; focusEvent: TreeNodeFocusEvent | null } | null;
  focusPrevious: (event?: Event) => { blurEvent: TreeNodeBlurEvent | null; focusEvent: TreeNodeFocusEvent | null } | null;
  focusFirst: (event?: Event) => { blurEvent: TreeNodeBlurEvent | null; focusEvent: TreeNodeFocusEvent | null } | null;
  focusLast: (event?: Event) => { blurEvent: TreeNodeBlurEvent | null; focusEvent: TreeNodeFocusEvent | null } | null;
  handleKeyDown: (event: KeyboardEvent) => KeyboardHandleResult | null;
  
  // DOM 操作
  focusElement: (element: HTMLElement | null) => Promise<void>;
  scrollIntoView: (element: HTMLElement | null) => Promise<void>;
}

export interface UseSelectionReturn {
  // 状态
  selectionKeys: Ref<TreeSelectionKeys>;
  selectedNodes: ComputedRef<any[]>;
  selectedCount: ComputedRef<number>;
  hasSelection: ComputedRef<boolean>;
  allSelected: ComputedRef<boolean>;
  partiallySelected: ComputedRef<boolean>;
  
  // 选择方法
  selectNode: (node: TreeNode, selected?: boolean, event?: Event) => any;
  toggleNodeSelection: (node: TreeNode, event?: Event) => any;
  selectMultipleNodes: (nodes: TreeNode[], event?: Event) => any;
  clearSelection: () => any;
  selectAll: () => any;
  updateCheckboxSelection: (node: TreeNode, checked: boolean, event?: Event) => any;
  
  // 状态检查
  isSelected: (node: TreeNode) => boolean;
  isPartiallySelected: (node: TreeNode) => boolean;
  getSelectionState: (node: TreeNode) => { selected: boolean; partiallySelected: boolean };
  
  // 工具方法
  setSelectionKeys: (keys: TreeSelectionKeys) => void;
  getSelectedNodeKeys: () => (string | number)[];
  findSelectedNode: (key: string | number) => TreeNode | null;
}

export interface UseFilterReturn {
  // 状态
  filterValue: Ref<string>;
  isFiltering: Ref<boolean>;
  config: Ref<TreeFilterConfig>;
  filteredNodes: ComputedRef<TreeNode[]>;
  hasFilter: ComputedRef<boolean>;
  hasResults: ComputedRef<boolean>;
  filteredCount: ComputedRef<number>;
  originalCount: ComputedRef<number>;
  
  // 基础过滤方法
  setFilter: (value: string) => void;
  clearFilter: () => void;
  setFilterMode: (mode: TreeFilterMode) => void;
  setFilterField: (field: string) => void;
  setMatchCase: (matchCase: boolean) => void;
  debouncedFilter: (value: string) => void;
  
  // 高级过滤方法
  filterByPredicate: (predicate: (node: TreeNode) => boolean) => TreeNode[];
  filterByMultipleFields: (value: string, fields: string[]) => TreeNode[];
  filterByType: (type: string) => TreeNode[];
  filterByCustom: (filterFn: (node: TreeNode, filterValue: string) => boolean) => TreeNode[];
  
  // 搜索方法
  searchNodes: (query: string, options?: { fuzzy?: boolean; threshold?: number }) => TreeNode[];
  highlightMatches: (text: string, query: string) => string;
  
  // 工具方法
  getFilterStats: () => { total: number; filtered: number; hidden: number };
  resetFilter: () => void;
}

export interface UseThemeReturn {
  theme: Ref<'light' | 'dark'>;
  toggleTheme: () => void;
  isDark: ComputedRef<boolean>;
}