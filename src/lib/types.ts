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
export type TreeDropPosition = 'above' | 'below' | 'inside' | 'root';

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
  | { type: 'navigate'; event: KeyboardEvent }
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
  /** 拒绝拖拽操作的回调 */
  reject: () => void;
}

// 跨树拖拽事件基础接口
export interface CrossTreeDragEvent {
  /** 原始拖拽事件 */
  originalEvent: DragEvent;
  /** 被拖拽的节点 */
  dragNode: TreeNode;
  /** 源树ID */
  sourceTreeId: string;
  /** 目标树ID（可选，某些事件可能没有目标树） */
  targetTreeId?: string;
  /** 放置目标节点（可选） */
  dropNode?: TreeNode;
  /** 放置位置（可选） */
  dropPosition?: TreeDropPosition;
  /** 是否跨树拖拽 */
  isCrossTree: boolean;
  /** 事件时间戳 */
  timestamp: number;
}

// 跨树拖拽开始事件
export interface CrossTreeDragStartEvent extends CrossTreeDragEvent {
  /** 拖拽开始位置 */
  startPosition: { x: number; y: number };
}

// 跨树拖拽进入事件
export interface CrossTreeDragEnterEvent extends CrossTreeDragEvent {
  /** 目标树ID */
  targetTreeId: string;
  /** 进入的目标节点 */
  dropNode: TreeNode;
}

// 跨树拖拽悬停事件
export interface CrossTreeDragOverEvent extends CrossTreeDragEvent {
  /** 目标树ID */
  targetTreeId: string;
  /** 悬停的目标节点 */
  dropNode: TreeNode;
  /** 悬停位置 */
  dropPosition: TreeDropPosition;
  /** 鼠标位置 */
  mousePosition: { x: number; y: number };
}

// 跨树拖拽离开事件
export interface CrossTreeDragLeaveEvent extends CrossTreeDragEvent {
  /** 离开的目标树ID */
  targetTreeId: string;
  /** 离开的目标节点 */
  dropNode?: TreeNode;
}

// 跨树拖拽放置事件
export interface CrossTreeDropEvent extends CrossTreeDragEvent {
  /** 目标树ID */
  targetTreeId: string;
  /** 放置目标节点 */
  dropNode: TreeNode;
  /** 放置位置 */
  dropPosition: TreeDropPosition;
  /** 放置索引 */
  dropIndex: number;
  /** 接受拖拽操作的回调 */
  accept: () => void;
  /** 拒绝拖拽操作的回调 */
  reject: () => void;
}

// 跨树拖拽结束事件
export interface CrossTreeDragEndEvent extends CrossTreeDragEvent {
  /** 是否成功放置 */
  success: boolean;
  /** 最终目标树ID（如果有） */
  targetTreeId?: string;
  /** 最终放置节点（如果有） */
  dropNode?: TreeNode;
  /** 错误信息（如果失败） */
  error?: string;
}

// 跨树拖拽取消事件
export interface CrossTreeDragCancelEvent extends CrossTreeDragEvent {
  /** 取消原因 */
  reason: 'escape' | 'invalid-drop' | 'user-cancel' | 'error';
  /** 目标树ID（可选） */
  targetTreeId?: string;
}

// 待确认操作接口
export interface PendingOperation {
  /** 操作唯一标识 */
  id: string;
  /** 操作描述 */
  description: string;
  /** 操作时间戳 */
  timestamp: number;
  /** 是否跨树拖拽 */
  isCrossTree: boolean;
  /** 被拖拽的节点 */
  dragNode: TreeNode;
  /** 拖拽目标节点 */
  dropNode: TreeNode;
  /** 拖拽位置 */
  dropPosition: string;
  /** 拖拽前的详细信息 */
  beforeDrag: {
    /** 源树ID */
    sourceTreeId: string;
    /** 节点信息 */
    node: TreeNode | null;
    /** 父节点 */
    parentNode: TreeNode | null;
    /** 父节点标签 */
    parentLabel: string;
    /** 父节点键值 */
    parentKey: string | number | null;
    /** 在兄弟节点中的索引 */
    index: number;
    /** 节点层级 */
    level: number;
    /** 节点路径 */
    path: string;
    /** 完整路径数组 */
    fullPath: string[];
    /** 兄弟节点列表 */
    siblings: TreeNode[];
    /** 源数据 */
    sourceData: TreeNode[];
  } | null;
  /** 拖拽后的详细信息 */
  afterDrop: {
    /** 目标树ID */
    targetTreeId: string;
    /** 新父节点 */
    newParentNode: TreeNode | null;
    /** 新父节点标签 */
    newParentLabel: string;
    /** 新父节点键值 */
    newParentKey: string | number | null;
    /** 新索引 */
    newIndex: number;
    /** 新层级 */
    newLevel: number;
    /** 新路径 */
    newPath: string;
    /** 新完整路径数组 */
    newFullPath: string[];
    /** 新兄弟节点列表 */
    newSiblings: TreeNode[];
    /** 目标数据 */
    targetData: TreeNode[];
  } | null;
  /** 操作信息 */
  operationInfo: {
    /** 是否跨树拖拽 */
    isCrossTree: boolean;
    /** 操作时间戳 */
    timestamp: number;
    /** 操作类型 */
    operationType: 'move' | 'copy';
    /** 操作描述 */
    description: string;
  };
  /** 接受操作回调 */
  accept: () => void;
  /** 拒绝操作回调 */
  reject: () => void;
}

// 节点详细信息接口
export interface NodeDetailedInfo {
  /** 父节点 */
  parentNode: TreeNode | null;
  /** 父节点标签 */
  parentLabel: string;
  /** 父节点键值 */
  parentKey: string | number | null;
  /** 在兄弟节点中的索引 */
  index: number;
  /** 节点层级 */
  level: number;
  /** 节点路径 */
  path: string;
  /** 完整路径数组 */
  fullPath: string[];
  /** 兄弟节点列表 */
  siblings: TreeNode[];
  /** 源数据 */
  sourceData: TreeNode[];
}

// 拖拽后位置信息接口
export interface DropPositionInfo {
  /** 目标树ID */
  targetTreeId: string;
  /** 新父节点 */
  newParentNode: TreeNode | null;
  /** 新父节点标签 */
  newParentLabel: string;
  /** 新父节点键值 */
  newParentKey: string | number | null;
  /** 新索引 */
  newIndex: number;
  /** 新层级 */
  newLevel: number;
  /** 新路径 */
  newPath: string;
  /** 新完整路径数组 */
  newFullPath: string[];
  /** 新兄弟节点列表 */
  newSiblings: TreeNode[];
  /** 目标数据 */
  targetData: TreeNode[];
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
  dragdrop?: boolean;
  /** 拖拽范围 */
  dragdropScope?: string;
  /** 是否自动更新数据（拖拽时自动处理数据更新） */
  autoUpdate?: boolean;
  /** 是否自动处理跨树拖拽数据更新 */
  crossTreeAutoUpdate?: boolean;
  /** 跨树数据提供者，用于在跨树拖拽自动更新模式下获取和更新其他树的数据 */
  crossTreeDataProvider?: CrossTreeDataProvider;
  /** 跨树拖拽组名，相同组名的树可以互相拖拽 */
  crossTreeGroup?: string;
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
  /** 树组件配置 */
  config?: Partial<TreeConfig>;
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
  
  // 跨树拖拽事件
  /** 跨树拖拽开始事件 */
  'cross-tree-drag-start': [event: CrossTreeDragStartEvent];
  /** 跨树拖拽进入事件 */
  'cross-tree-drag-enter': [event: CrossTreeDragEnterEvent];
  /** 跨树拖拽悬停事件 */
  'cross-tree-drag-over': [event: CrossTreeDragOverEvent];
  /** 跨树拖拽离开事件 */
  'cross-tree-drag-leave': [event: CrossTreeDragLeaveEvent];
  /** 跨树拖拽放置事件 */
  'cross-tree-drop': [event: CrossTreeDropEvent];
  /** 跨树拖拽结束事件 */
  'cross-tree-drag-end': [event: CrossTreeDragEndEvent];
  /** 跨树拖拽取消事件 */
  'cross-tree-drag-cancel': [event: CrossTreeDragCancelEvent];
  
  /** 简化的跨树拖拽移动事件 */
  'cross-tree-move': [event: {
    /** 被移动的节点 */
    dragNode: TreeNode;
    /** 目标节点 */
    dropNode: TreeNode;
    /** 放置位置 */
    dropPosition: TreeDropPosition;
    /** 源树ID */
    sourceTreeId: string;
    /** 目标树ID */
    targetTreeId: string;
    /** 源树数据（移动前） */
    sourceData: TreeNode[];
    /** 目标树数据（移动前） */
    targetData: TreeNode[];
    /** 更新后的源树数据 */
    newSourceData: TreeNode[];
    /** 更新后的目标树数据 */
    newTargetData: TreeNode[];
  }];
  
  /** 选择状态更新 */
  'update:selectionKeys': [value: TreeSelectionKeys];
  /** 展开状态更新 */
  'update:expandedKeys': [value: TreeExpandedKeys];
  /** v-model 支持 */
  'update:modelValue': [value: TreeSelectionKeys];
  /** 更新树数据（自动更新模式下使用） */
  'update:value': [value: TreeNode[]];
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
  globalDragState: Ref<DragDropState>;
  isDragging: ComputedRef<boolean>;
  dragNode: ComputedRef<TreeNode | null>;
  dropNode: ComputedRef<TreeNode | null>;
  dropPosition: ComputedRef<TreeDropPosition | null>;
  
  // 拖拽事件处理
  onDragStart: (event: DragEvent, node: TreeNode) => void;
  onDragEnd: (event: DragEvent) => void;
  onDragEnter: (event: DragEvent, node: TreeNode) => void;
  onDragOver: (event: DragEvent, node: TreeNode, treeId: string) => void;
  onDragLeave: (event: DragEvent) => void;
  onDrop: (event: DragEvent, node: TreeNode) => TreeNodeDropEvent | null;
  
  // 工具方法
  isDraggable: (node: TreeNode) => boolean;
  isDroppable: (node: TreeNode) => boolean;
  getDragIndicatorClass: (node: TreeNode) => string;
  resetDragState: () => void;
  setDragScope: (scope: string) => void;
  
  // 跨树拖拽状态管理
  crossTreeDragState: {
    isActive: ComputedRef<boolean>;
    isDragging: ComputedRef<boolean>;
    pendingOperations: ComputedRef<PendingOperation[]>;
    addPendingOperation: (operation: PendingOperation) => void;
    removePendingOperation: (operationId: string) => void;
    clearAllPendingOperations: () => void;
    getPendingOperationsForTree: (treeId: string) => PendingOperation[];
    getCurrentDragInfo: () => any;
    resetAllState: () => void;
  };
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

// 跨树数据提供者接口
export interface CrossTreeDataProvider {
  /**
   * 获取指定树的数据
   * @param treeId 树的ID
   * @returns 树的数据数组
   */
  getTreeData: (treeId: string) => TreeNode[]
  
  /**
   * 更新指定树的数据
   * @param treeId 树的ID
   * @param data 新的树数据
   */
  updateTreeData: (treeId: string, data: TreeNode[]) => void
}

/**
 * 跨树拖拽状态接口
 */
export interface CrossTreeDragState {
  // 当前拖拽信息
  dragNode: TreeNode | null
  sourceTreeId: string | null
  
  // 目标信息
  targetTreeId: string | null
  dropNode: TreeNode | null
  dropPosition: string | null
  
  // 状态标识
  isDragging: boolean
  isActive: boolean // 是否有活跃的跨树拖拽
  
  // 拖拽模式
  autoUpdate: boolean // 是否自动更新模式
  
  // 时间戳
  startTime: number
  lastUpdateTime: number
}

/**
 * useCrossTreeDragState 函数的返回类型
 */
export interface UseCrossTreeDragStateReturn {
  // 状态
  globalState: Ref<CrossTreeDragState>;
  isActive: ComputedRef<boolean>;
  isDragging: ComputedRef<boolean>;
  currentDragNode: ComputedRef<TreeNode | null>;
  sourceTreeId: ComputedRef<string | null>;
  targetTreeId: ComputedRef<string | null>;
  pendingOperations: ComputedRef<PendingOperation[]>;
  pendingCount: ComputedRef<number>;
  stats: {
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    pendingCount: number;
    averageProcessingTime: number;
  };

  // 方法
  startCrossTreeDrag: (
    dragNode: TreeNode,
    sourceTreeId: string,
    autoUpdate?: boolean
  ) => void;
  updateTarget: (
    targetTreeId: string,
    dropNode?: TreeNode,
    dropPosition?: string
  ) => void;
  endCrossTreeDrag: (success?: boolean) => void;
  addPendingOperation: (operation: PendingOperation) => void;
  removePendingOperation: (operationId: string) => void;
  clearAllPendingOperations: () => void;
  getPendingOperationsForTree: (treeId: string) => PendingOperation[];
  hasCrossTreeDragToTree: (treeId: string) => boolean;
  hasCrossTreeDragFromTree: (treeId: string) => boolean;
  getCurrentDragInfo: () => {
    dragNode: TreeNode | null;
    sourceTreeId: string | null;
    targetTreeId: string | null;
    dropNode: TreeNode | null;
    dropPosition: string | null;
    autoUpdate: boolean;
    duration: number;
  } | null;
  resetAllState: () => void;
}

/**
 * 国际化文本配置接口
 */
export interface TreeI18nConfig {
  // 基础文本
  loading?: string;
  search?: string;
  noDataFound?: string;
  expand?: string;
  collapse?: string;
  rootLabel?: string;
  unknownSourceTree?: string;
  unknownTargetTree?: string;
  filterPlaceholder?: string;
  loadingText?: string;
  dropToEmptyTree?: string;
  emptyMessage?: string;
  
  // 拖拽相关文本
  dragMessages?: {
    moveToAbove?: string; // "将 {dragLabel} 移动到 {dropLabel} 之前"
    moveToBelow?: string; // "将 {dragLabel} 移动到 {dropLabel} 之后"
    moveToInside?: string; // "将 {dragLabel} 移动到 {dropLabel} 内部"
    moveGeneric?: string; // "移动 {dragLabel}"
    crossTreeMove?: string; // "将 {dragLabel} 从 {sourceTreeId} 移动到 {targetTreeId}"
    crossTreeMoveToAbove?: string; // "将 {dragLabel} 从 {sourceTreeId} 移动到 {targetTreeId} 中 {dropLabel} 之前"
    crossTreeMoveToBelow?: string; // "将 {dragLabel} 从 {sourceTreeId} 移动到 {targetTreeId} 中 {dropLabel} 之后"
    crossTreeMoveToInside?: string; // "将 {dragLabel} 从 {sourceTreeId} 移动到 {targetTreeId} 中 {dropLabel} 内部"
    releaseToAddToEmptyTree?: string; // "释放以添加到空树"
  };
  
  // 直接拖拽文本属性（用于向后兼容）
  crossTreeMoveBefore?: string;
  crossTreeMoveAfter?: string;
  crossTreeMoveInside?: string;
  crossTreeMove?: string;
  moveBefore?: string;
  moveAfter?: string;
  moveInside?: string;
  move?: string;
  
  // 待确认操作相关文本
  pendingOperations?: {
    title?: string; // "待确认操作"
    clearAll?: string; // "清除所有待确认操作"
    accept?: string; // "接受此操作"
    reject?: string; // "拒绝此操作"
    crossTreeOperation?: string; // "跨树操作"
  };
  
  // 直接待确认操作属性（用于向后兼容）
  pendingOperationsTitle?: string;
  clearAllOperations?: string;
  acceptOperation?: string;
  accept?: string;
  rejectOperation?: string;
  reject?: string;
  crossTreeOperation?: string;
  
  // 可访问性文本
  accessibility?: {
    treeLabel?: string; // "Tree"
    nodeSelected?: string; // "节点已选中"
    nodeUnselected?: string; // "节点已取消选中"
    nodeExpanded?: string; // "节点已展开"
    nodeCollapsed?: string; // "节点已折叠"
  };
}

/**
 * 树组件样式配置接口
 */
export interface TreeStyleConfig {
  // 颜色配置
  colors?: {
    selectedBackground?: string;
    selectedText?: string;
    focusBackground?: string;
    focusText?: string;
    hoverBackground?: string;
    hoverText?: string;
    borderColor?: string;
    iconColor?: string;
    loadingColor?: string;
  };
  
  // 直接样式属性（用于向后兼容）
  focusBackgroundColor?: string;
  focusTextColor?: string;
  selectedBackgroundColor?: string;
  selectedTextColor?: string;
  
  // 尺寸配置
  dimensions?: {
    nodeHeight?: number;
    indent?: number;
    iconSize?: number;
    checkboxSize?: number;
    togglerSize?: number;
    borderRadius?: number;
    borderWidth?: number;
  };
  
  // 间距配置
  spacing?: {
    nodePadding?: string;
    nodeMargin?: string;
    iconMargin?: string;
    labelMargin?: string;
    childrenMargin?: string;
  };
  
  // 字体配置
  typography?: {
    fontSize?: string;
    fontWeight?: string;
    fontFamily?: string;
    lineHeight?: string;
  };
  
  // 动画配置
  animations?: {
    expandDuration?: string;
    collapseDuration?: string;
    hoverTransition?: string;
    focusTransition?: string;
  };
}

/**
 * 树组件配置接口
 */
export interface TreeConfig {
  // 国际化配置
  i18n?: TreeI18nConfig;
  
  // 样式配置
  style?: TreeStyleConfig;
  
  // 树ID前缀配置（用于替代硬编码的树ID前缀）
  treeIdConfig?: {
    // 自动检测树ID前缀的函数
    detectTreeId?: (nodeKey: string | number) => string | null;
    // 预定义的树ID映射
    treeIdMap?: Record<string, string>;
    // 默认树ID
    defaultTreeId?: string;
  };
  
  // 拖拽配置
  dragDrop?: {
    // 是否启用跨树拖拽
    enableCrossTree?: boolean;
    // 拖拽范围
    scope?: string;
    // 拖拽延迟（毫秒）
    dragDelay?: number;
    // 拖拽阈值（像素）
    dragThreshold?: number;
  };
  
  // 性能配置
  performance?: {
    // 虚拟滚动阈值
    virtualScrollThreshold?: number;
    // 延迟加载阈值
    lazyLoadThreshold?: number;
    // 防抖延迟（毫秒）
    debounceDelay?: number;
  };
}

/**
 * 默认国际化配置
 */
export const DEFAULT_I18N_CONFIG: Required<TreeI18nConfig> = {
  loading: 'Loading...',
  search: 'Search...',
  noDataFound: 'No data found',
  expand: 'Expand',
  collapse: 'Collapse',
  rootLabel: '根节点',
  unknownSourceTree: '未知源树',
  unknownTargetTree: '未知目标树',
  filterPlaceholder: '搜索...',
  loadingText: '加载中...',
  dropToEmptyTree: '拖拽到空树',
  emptyMessage: '暂无数据',
  dragMessages: {
    moveToAbove: '将 {dragLabel} 移动到 {dropLabel} 之前',
    moveToBelow: '将 {dragLabel} 移动到 {dropLabel} 之后',
    moveToInside: '将 {dragLabel} 移动到 {dropLabel} 内部',
    moveGeneric: '移动 {dragLabel}',
    crossTreeMove: '将 {dragLabel} 从 {sourceTreeId} 移动到 {targetTreeId}',
    crossTreeMoveToAbove: '将 {dragLabel} 从 {sourceTreeId} 移动到 {targetTreeId} 中 {dropLabel} 之前',
    crossTreeMoveToBelow: '将 {dragLabel} 从 {sourceTreeId} 移动到 {targetTreeId} 中 {dropLabel} 之后',
    crossTreeMoveToInside: '将 {dragLabel} 从 {sourceTreeId} 移动到 {targetTreeId} 中 {dropLabel} 内部',
    releaseToAddToEmptyTree: '释放以添加到空树',
  },
  crossTreeMoveBefore: '将 {dragLabel} 从 {sourceTreeId} 移动到 {targetTreeId} 中 {dropLabel} 之前',
  crossTreeMoveAfter: '将 {dragLabel} 从 {sourceTreeId} 移动到 {targetTreeId} 中 {dropLabel} 之后',
  crossTreeMoveInside: '将 {dragLabel} 从 {sourceTreeId} 移动到 {targetTreeId} 中 {dropLabel} 内部',
  crossTreeMove: '将 {dragLabel} 从 {sourceTreeId} 移动到 {targetTreeId}',
  moveBefore: '将 {dragLabel} 移动到 {dropLabel} 之前',
  moveAfter: '将 {dragLabel} 移动到 {dropLabel} 之后',
  moveInside: '将 {dragLabel} 移动到 {dropLabel} 内部',
  move: '移动 {dragLabel}',
  pendingOperations: {
    title: '待确认操作',
    clearAll: '清除所有待确认操作',
    accept: '接受此操作',
    reject: '拒绝此操作',
    crossTreeOperation: '跨树操作',
  },
  pendingOperationsTitle: '待确认操作',
  clearAllOperations: '清除所有待确认操作',
  acceptOperation: '接受此操作',
  accept: '接受',
  rejectOperation: '拒绝此操作',
  reject: '拒绝',
  crossTreeOperation: '跨树操作',
  accessibility: {
    treeLabel: 'Tree',
    nodeSelected: '节点已选中',
    nodeUnselected: '节点已取消选中',
    nodeExpanded: '节点已展开',
    nodeCollapsed: '节点已折叠',
  },
};

/**
 * 默认样式配置
 */
export const DEFAULT_STYLE_CONFIG: Required<TreeStyleConfig> = {
  colors: {
    selectedBackground: '#e3f2fd',
    selectedText: '#1565c0',
    focusBackground: '#1e40af',
    focusText: 'white',
    hoverBackground: '#f5f5f5',
    hoverText: 'inherit',
    borderColor: '#e0e0e0',
    iconColor: '#666666',
    loadingColor: '#1976d2',
  },
  focusBackgroundColor: '#1e40af',
  focusTextColor: 'white',
  selectedBackgroundColor: '#e3f2fd',
  selectedTextColor: '#1565c0',
  dimensions: {
    nodeHeight: 32,
    indent: 16,
    iconSize: 16,
    checkboxSize: 12,
    togglerSize: 16,
    borderRadius: 4,
    borderWidth: 1,
  },
  spacing: {
    nodePadding: '4px 8px',
    nodeMargin: '0',
    iconMargin: '0 4px 0 0',
    labelMargin: '0 0 0 4px',
    childrenMargin: '0 0 0 16px',
  },
  typography: {
    fontSize: '14px',
    fontWeight: 'normal',
    fontFamily: 'inherit',
    lineHeight: '1.5',
  },
  animations: {
    expandDuration: '200ms',
    collapseDuration: '200ms',
    hoverTransition: 'all 150ms ease',
    focusTransition: 'all 150ms ease',
  },
};

/**
 * 默认树配置
 */
export const DEFAULT_TREE_CONFIG: Required<TreeConfig> = {
  i18n: DEFAULT_I18N_CONFIG,
  style: DEFAULT_STYLE_CONFIG,
  treeIdConfig: {
    detectTreeId: (nodeKey: string | number) => {
      const keyStr = nodeKey.toString();
      // 默认检测逻辑：查找以 'tree' 开头后跟数字和连字符的模式
      const match = keyStr.match(/^(tree\d+)-/);
      return match ? match[1] : null;
    },
    treeIdMap: {},
    defaultTreeId: 'tree',
  },
  dragDrop: {
    enableCrossTree: true,
    scope: 'default',
    dragDelay: 0,
    dragThreshold: 5,
  },
  performance: {
    virtualScrollThreshold: 100,
    lazyLoadThreshold: 50,
    debounceDelay: 300,
  },
};

/**
 * 文本模板替换工具函数类型
 */
export type TextTemplateReplacer = (
  template: string,
  variables: Record<string, string | number> & {
    dragLabel?: string | number;
    dropLabel?: string | number;
    sourceTreeId?: string | number;
    targetTreeId?: string | number;
  }
) => string;