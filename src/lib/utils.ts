import type {
  TreeNode,
  TreeSelectionKeys,
  TreeExpandedKeys,
  TreeCheckboxSelectionKeys,
  TreeNodePredicate,
  TreeNodeMapper,
  TreeNodeVisitor,
  TreeDropPosition,
  TreeConfig,
  TreeI18nConfig,
  TreeStyleConfig,
  TextTemplateReplacer
} from './types'
import {
  DEFAULT_TREE_CONFIG,
  DEFAULT_I18N_CONFIG,
  DEFAULT_STYLE_CONFIG
} from './types'

// 轻量 className 合并（本组件类名均为 p-tree-* 自定义类，无需 tailwind 冲突合并，
// 因此不引入 clsx / tailwind-merge 依赖）
export type ClassValue = string | number | null | undefined | false | Record<string, boolean | null | undefined> | ClassValue[]

export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = []
  const append = (input: ClassValue) => {
    if (!input) return
    if (typeof input === 'string' || typeof input === 'number') {
      classes.push(String(input))
    } else if (Array.isArray(input)) {
      input.forEach(append)
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key)
      }
    }
  }
  inputs.forEach(append)
  return classes.join(' ')
}

/**
 * 配置合并工具函数
 */
export function mergeTreeConfig(userConfig?: Partial<TreeConfig>): TreeConfig {
  if (!userConfig) return DEFAULT_TREE_CONFIG
  
  return {
    ...DEFAULT_TREE_CONFIG,
    ...userConfig,
    i18n: {
      ...DEFAULT_I18N_CONFIG,
      ...userConfig.i18n
    },
    style: {
      ...DEFAULT_STYLE_CONFIG,
      ...userConfig.style
    }
  }
}

/**
 * 文本模板替换函数
 */
export function replaceTextTemplate(
  template: string, 
  variables: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key] !== undefined ? String(variables[key]) : match
  })
}

/**
 * 获取树ID前缀
 */
export function getTreeIdPrefix(treeId: string): string {
  return `${treeId}-`
}

/**
 * 从节点键中提取树ID
 */
export function extractTreeIdFromNodeKey(nodeKey: string | number): string | null {
  if (typeof nodeKey !== 'string') return null
  
  const match = nodeKey.match(/^(.+?)-/)
  return match ? match[1] : null
}

/**
 * 检查节点是否属于指定树
 */
export function isNodeFromTree(nodeKey: string | number, treeId: string): boolean {
  const extractedTreeId = extractTreeIdFromNodeKey(nodeKey)
  return extractedTreeId === treeId
}

/**
 * 生成带树ID前缀的节点键
 */
export function generateNodeKey(treeId: string, originalKey: string | number): string {
  return `${treeId}-${originalKey}`
}

/**
 * 树节点工具函数集合
 * 提供完整的树操作、查找、遍历等功能
 */

// 节点查找相关函数
export function findTreeNode(nodes: TreeNode[], key: string | number): TreeNode | null {
  for (const node of nodes) {
    if (node.key === key) {
      return node
    }
    if (node.children) {
      const found = findTreeNode(node.children, key)
      if (found) return found
    }
  }
  return null
}

export function findTreeNodeWithParent(
  nodes: TreeNode[], 
  key: string | number, 
  parent: TreeNode | null = null
): { node: TreeNode; parent: TreeNode | null } | null {
  for (const node of nodes) {
    if (node.key === key) {
      return { node, parent }
    }
    if (node.children) {
      const found = findTreeNodeWithParent(node.children, key, node)
      if (found) return found
    }
  }
  return null
}

export function findTreeNodePath(nodes: TreeNode[], key: string | number): TreeNode[] {
  function findPath(nodes: TreeNode[], path: TreeNode[]): TreeNode[] | null {
    for (const node of nodes) {
      const currentPath = [...path, node]
      if (node.key === key) {
        return currentPath
      }
      if (node.children) {
        const found = findPath(node.children, currentPath)
        if (found) return found
      }
    }
    return null
  }
  return findPath(nodes, []) || []
}

// 节点遍历相关函数
export function traverseTree(
  nodes: TreeNode[], 
  visitor: TreeNodeVisitor, 
  parent?: TreeNode, 
  level: number = 0
): void {
  for (const node of nodes) {
    visitor(node, parent, level)
    if (node.children) {
      traverseTree(node.children, visitor, node, level + 1)
    }
  }
}

export function mapTree<T>(nodes: TreeNode[], mapper: TreeNodeMapper<T>): T[] {
  return nodes.map(node => {
    const mapped = mapper(node)
    return mapped
  })
}

export function filterTree(nodes: TreeNode[], predicate: TreeNodePredicate): TreeNode[] {
  const filtered: TreeNode[] = []
  
  for (const node of nodes) {
    const nodeMatches = predicate(node)
    let childrenMatches: TreeNode[] = []
    
    if (node.children) {
      childrenMatches = filterTree(node.children, predicate)
    }
    
    if (nodeMatches || childrenMatches.length > 0) {
      filtered.push({
        ...node,
        children: childrenMatches.length > 0 ? childrenMatches : node.children
      })
    }
  }
  
  return filtered
}

// 节点操作相关函数
export function insertTreeNode(
  nodes: TreeNode[],
  targetKey: string | number,
  newNode: TreeNode,
  position: TreeDropPosition = 'inside'
): TreeNode[] {
  // 处理根级别插入的情况
  if (position === 'root' || targetKey === '__root__') {
    return [...nodes, newNode]
  }

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (node.key === targetKey) {
      const newNodes = [...nodes]
      switch (position) {
        case 'above':
          newNodes.splice(i, 0, newNode)
          return newNodes
        case 'below':
          newNodes.splice(i + 1, 0, newNode)
          return newNodes
        case 'inside':
          newNodes[i] = {
            ...node,
            children: [...(node.children || []), newNode]
          }
          return newNodes
      }
    }

    // 递归处理子节点；只有真正插入时才克隆当前层
    if (node.children) {
      const updatedChildren = insertTreeNode(node.children, targetKey, newNode, position)
      if (updatedChildren !== node.children) {
        const newNodes = [...nodes]
        newNodes[i] = { ...node, children: updatedChildren }
        return newNodes
      }
    }
  }

  // 未找到目标节点：返回原数组引用，调用方可据此判断插入失败
  return nodes
}

export function removeTreeNode(
  nodes: TreeNode[], 
  key: string | number
): { nodes: TreeNode[]; removedNode: TreeNode | null; parent: TreeNode | null } {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    
    if (node.key === key) {
      const newNodes = [...nodes]
      const removedNode = newNodes.splice(i, 1)[0]
      return { nodes: newNodes, removedNode, parent: null }
    }
    
    if (node.children) {
      const result = removeTreeNode(node.children, key)
      if (result.removedNode) {
        return {
          nodes: nodes.map(n => 
            n.key === node.key 
              ? { ...n, children: result.nodes }
              : n
          ),
          removedNode: result.removedNode,
          parent: node
        }
      }
    }
  }
  
  return { nodes, removedNode: null, parent: null }
}

export function updateTreeNode(
  nodes: TreeNode[], 
  key: string | number, 
  updates: Partial<TreeNode>
): TreeNode[] {
  return nodes.map(node => {
    if (node.key === key) {
      return { ...node, ...updates }
    }
    
    if (node.children) {
      const updatedChildren = updateTreeNode(node.children, key, updates)
      if (updatedChildren !== node.children) {
        return { ...node, children: updatedChildren }
      }
    }
    
    return node
  })
}

// 拖拽操作：移动节点到新位置
export function moveTreeNode(
  nodes: TreeNode[],
  dragNodeKey: string | number,
  dropNodeKey: string | number,
  position: TreeDropPosition
): TreeNode[] {
  // 首先移除拖拽节点
  const removeResult = removeTreeNode(nodes, dragNodeKey)
  if (!removeResult.removedNode) {
    return nodes // 如果没有找到要移除的节点，返回原数组
  }

  // 然后在目标位置插入节点
  const updatedNodes = insertTreeNode(
    removeResult.nodes,
    dropNodeKey,
    removeResult.removedNode,
    position
  )

  // 插入失败（目标不存在）时回滚，避免节点被静默删除
  if (updatedNodes === removeResult.nodes) {
    return nodes
  }

  return updatedNodes
}

// 拖拽操作：一次移动多个节点（保持相对顺序，作为一个块插入）
export function moveTreeNodes(
  nodes: TreeNode[],
  dragNodeKeys: Array<string | number>,
  dropNodeKey: string | number,
  position: TreeDropPosition
): TreeNode[] {
  if (dragNodeKeys.length === 0) return nodes
  if (dragNodeKeys.length === 1) {
    return moveTreeNode(nodes, dragNodeKeys[0], dropNodeKey, position)
  }

  // 目标本身在被拖节点中时不执行移动
  if (dragNodeKeys.some(key => key === dropNodeKey)) return nodes

  // 按树中的原始顺序逐个取出被拖节点
  const keySet = new Set(dragNodeKeys)
  const removedNodes: TreeNode[] = []
  let workingNodes = nodes
  const collectInOrder = (list: TreeNode[]) => {
    for (const node of list) {
      if (keySet.has(node.key)) {
        removedNodes.push(node)
      }
      if (node.children) {
        collectInOrder(node.children)
      }
    }
  }
  collectInOrder(nodes)

  if (removedNodes.length === 0) return nodes

  // 逐个移除
  for (const removed of removedNodes) {
    const result = removeTreeNode(workingNodes, removed.key)
    if (result.removedNode) {
      workingNodes = result.nodes
    }
  }

  // 作为一个块按顺序插入目标位置：第一个节点定位，其余节点紧随其后
  let updatedNodes = workingNodes
  for (let i = 0; i < removedNodes.length; i++) {
    const before = updatedNodes
    if (position === 'above' || position === 'below') {
      const anchorKey = i === 0 ? dropNodeKey : removedNodes[i - 1].key
      const anchorPosition = i === 0 ? position : 'below'
      updatedNodes = insertTreeNode(updatedNodes, anchorKey, removedNodes[i], anchorPosition)
    } else {
      updatedNodes = insertTreeNode(updatedNodes, dropNodeKey, removedNodes[i], position)
    }
    if (updatedNodes === before) {
      // 插入失败，回滚到原始数据
      return nodes
    }
  }

  return updatedNodes
}

// 选择状态相关函数
export function isNodeSelected(
  selectionKeys: TreeSelectionKeys, 
  node: TreeNode
): boolean {
  if (!selectionKeys) return false
  
  if (Array.isArray(selectionKeys)) {
    return selectionKeys.some(selected => selected.key === node.key)
  }
  
  if (typeof selectionKeys === 'object' && 'key' in selectionKeys) {
    return selectionKeys.key === node.key
  }
  
  if (typeof selectionKeys === 'object') {
    const selection = selectionKeys[node.key]
    if (typeof selection === 'boolean') {
      return selection
    }
    if (typeof selection === 'object') {
      return selection.checked === true
    }
  }
  
  return false
}

export function isNodePartiallySelected(
  selectionKeys: TreeSelectionKeys, 
  node: TreeNode
): boolean {
  if (!selectionKeys || typeof selectionKeys !== 'object' || Array.isArray(selectionKeys)) {
    return false
  }
  
  const selection = selectionKeys[node.key] as TreeCheckboxSelectionKeys
  return selection?.partialChecked === true
}

export function updateSelectionKeys(
  selectionKeys: TreeSelectionKeys,
  node: TreeNode,
  selected: boolean,
  mode: 'single' | 'multiple' | 'checkbox' = 'single'
): TreeSelectionKeys {
  switch (mode) {
    case 'single':
      return selected ? node : null
      
    case 'multiple':
      if (!selectionKeys) {
        return selected ? [node] : []
      }
      if (Array.isArray(selectionKeys)) {
        if (selected) {
          return selectionKeys.some(s => s.key === node.key) 
            ? selectionKeys 
            : [...selectionKeys, node]
        } else {
          return selectionKeys.filter(s => s.key !== node.key)
        }
      }
      return selected ? [node] : []
      
    case 'checkbox':
      const keys = (selectionKeys as Record<string, boolean | TreeCheckboxSelectionKeys>) || {}
      return {
        ...keys,
        [node.key]: { checked: selected, partialChecked: false }
      }
      
    default:
      return selectionKeys
  }
}

// 展开状态相关函数
export function isNodeExpanded(expandedKeys: TreeExpandedKeys, node: TreeNode): boolean {
  return expandedKeys[node.key] === true
}

export function updateExpandedKeys(
  expandedKeys: TreeExpandedKeys,
  node: TreeNode,
  expanded: boolean
): TreeExpandedKeys {
  const newKeys = { ...expandedKeys }
  if (expanded) {
    newKeys[node.key] = true
  } else {
    delete newKeys[node.key]
  }
  return newKeys
}

export function expandAll(nodes: TreeNode[]): TreeExpandedKeys {
  const expandedKeys: TreeExpandedKeys = {}
  
  traverseTree(nodes, (node) => {
    if (node.children && node.children.length > 0) {
      expandedKeys[node.key] = true
    }
  })
  
  return expandedKeys
}

export function collapseAll(): TreeExpandedKeys {
  return {}
}

// 过滤相关函数
export function filterTreeNodes(
  nodes: TreeNode[], 
  filterValue: string, 
  filterBy: string = 'label',
  mode: 'lenient' | 'strict' = 'lenient'
): TreeNode[] {
  if (!filterValue.trim()) return nodes
  
  const filterLower = filterValue.toLowerCase()
  
  function nodeMatches(node: TreeNode): boolean {
    const fieldValue = (node as any)[filterBy]
    if (typeof fieldValue === 'string') {
      return fieldValue.toLowerCase().includes(filterLower)
    }
    return false
  }
  
  function filterRecursive(nodes: TreeNode[]): TreeNode[] {
    const filtered: TreeNode[] = []
    
    for (const node of nodes) {
      const matches = nodeMatches(node)
      let filteredChildren: TreeNode[] = []
      
      if (node.children) {
        filteredChildren = filterRecursive(node.children)
      }
      
      if (mode === 'lenient') {
        // 宽松模式：节点匹配或有匹配的子节点
        if (matches || filteredChildren.length > 0) {
          filtered.push({
            ...node,
            children: filteredChildren.length > 0 ? filteredChildren : node.children
          })
        }
      } else {
        // 严格模式：保留匹配节点及其祖先路径，隐藏未匹配的兄弟/子节点
        if (matches || filteredChildren.length > 0) {
          filtered.push({
            ...node,
            children: filteredChildren.length > 0 ? filteredChildren : undefined
          })
        }
      }
    }

    return filtered
  }

  return filterRecursive(nodes)
}

// 拖拽相关函数
export function canDropNode(
  dragNode: TreeNode, 
  dropNode: TreeNode, 
  position: TreeDropPosition
): boolean {
  // 对于根级别拖拽，总是允许
  if (position === 'root') {
    return dragNode.draggable !== false
  }
  
  // 不能拖拽到自己
  if (dragNode.key === dropNode.key) return false
  
  // 不能拖拽到自己的子节点
  function isDescendant(parent: TreeNode, child: TreeNode): boolean {
    if (!parent.children) return false
    
    for (const node of parent.children) {
      if (node.key === child.key) return true
      if (isDescendant(node, child)) return true
    }
    return false
  }
  
  if (isDescendant(dragNode, dropNode)) return false
  
  // 检查节点的拖拽权限
  if (dragNode.draggable === false) return false
  if (position === 'inside' && dropNode.droppable === false) return false
  
  return true
}

// 示例数据生成
// 获取节点的位置信息
export function getNodePosition(
  nodes: TreeNode[], 
  nodeKey: string | number
): { parent: TreeNode | null; index: number; path: TreeNode[]; level: number } | null {
  const result = findTreeNodeWithParent(nodes, nodeKey)
  if (!result) return null
  
  const { node, parent } = result
  const path = findTreeNodePath(nodes, nodeKey)
  const level = path.length - 1
  
  // 找到节点在其父节点中的索引
  let index = -1
  if (parent && parent.children) {
    index = parent.children.findIndex(child => child.key === nodeKey)
  } else {
    // 如果是根节点，在根数组中查找索引
    index = nodes.findIndex(n => n.key === nodeKey)
  }
  
  return {
    parent,
    index,
    path,
    level
  }
}

// 获取节点的完整信息
export function getNodeInfo(node: TreeNode): {
  key: string | number
  label: string
  hasChildren: boolean
  childrenCount: number
  isLeaf: boolean
  data?: any
  [key: string]: any
} {
  return {
    key: node.key,
    label: node.label,
    hasChildren: !!(node.children && node.children.length > 0),
    childrenCount: node.children?.length || 0,
    isLeaf: !node.children || node.children.length === 0,
    data: node.data,
    ...node
  }
}

// 格式化拖拽信息
export function formatDragInfo(
  dragNode: TreeNode,
  dropNode: TreeNode,
  position: TreeDropPosition,
  beforePosition: { parent: TreeNode | null; index: number; path: TreeNode[]; level: number } | null,
  afterPosition: { parent: TreeNode | null; index: number; path: TreeNode[]; level: number } | null
): {
  dragNodeInfo: ReturnType<typeof getNodeInfo>
  dropNodeInfo: ReturnType<typeof getNodeInfo>
  position: TreeDropPosition
  before: {
    parentLabel: string
    parentKey: string | number | null
    index: number
    level: number
    path: string
  }
  after: {
    parentLabel: string
    parentKey: string | number | null
    index: number
    level: number
    path: string
  }
} {
  const dragNodeInfo = getNodeInfo(dragNode)
  const dropNodeInfo = getNodeInfo(dropNode)
  
  // 计算拖拽后的位置信息
  let afterParent: TreeNode | null = null
  let afterIndex = 0
  let afterLevel = 0
  
  if (position === 'inside') {
    afterParent = dropNode
    afterIndex = dropNode.children?.length || 0
    afterLevel = (afterPosition?.level || 0) + 1
  } else {
    afterParent = afterPosition?.parent || null
    if (position === 'above') {
      afterIndex = afterPosition?.index || 0
    } else { // below
      afterIndex = (afterPosition?.index || 0) + 1
    }
    afterLevel = afterPosition?.level || 0
  }
  
  return {
    dragNodeInfo,
    dropNodeInfo,
    position,
    before: {
      parentLabel: beforePosition?.parent?.label || '根目录',
      parentKey: beforePosition?.parent?.key || null,
      index: beforePosition?.index || 0,
      level: beforePosition?.level || 0,
      path: beforePosition?.path.map(n => n.label).join(' > ') || ''
    },
    after: {
      parentLabel: afterParent?.label || '根目录',
      parentKey: afterParent?.key || null,
      index: afterIndex,
      level: afterLevel,
      path: afterParent ? 
        [...(afterPosition?.path || []), afterParent].map(n => n.label).join(' > ') : 
        '根目录'
    }
  }
}

export function generateSampleData(count: number = 10): TreeNode[] {
  const data: TreeNode[] = []
  
  for (let i = 0; i < count; i++) {
    const node: TreeNode = {
      key: `node-${i}`,
      label: `节点 ${i + 1}`,
      data: `节点 ${i + 1} 的数据`,
      children: []
    }
    
    // 为部分节点添加子节点
    if (i % 3 === 0) {
      node.children = [
        {
          key: `node-${i}-0`,
          label: `子节点 ${i + 1}-1`,
          data: `子节点数据`
        },
        {
          key: `node-${i}-1`,
          label: `子节点 ${i + 1}-2`,
          data: `子节点数据`
        }
      ]
    }
    
    data.push(node)
  }
  
  return data
}

// 基础示例数据
export function getBasicSampleData(): TreeNode[] {
  return [
    {
      key: '0',
      label: 'Documents',
      data: 'Documents Folder',
      children: [
        {
          key: '0-0',
          label: 'Work',
          data: 'Work Folder',
          children: [
            { key: '0-0-0', label: 'Expenses.doc', data: 'Expenses Document' },
            { key: '0-0-1', label: 'Resume.doc', data: 'Resume Document' }
          ]
        },
        {
          key: '0-1',
          label: 'Home',
          data: 'Home Folder',
          children: [
            { key: '0-1-0', label: 'Invoices.txt', data: 'Invoices for this month' }
          ]
        }
      ]
    },
    {
      key: '1',
      label: 'Events',
      data: 'Events Folder',
      children: [
        { key: '1-0', label: 'Meeting.ics', data: 'Meeting' },
        { key: '1-1', label: 'Product Launch.ics', data: 'Product Launch' }
      ]
    }
  ]
}

// 跨树拖拽工具函数
export interface CrossTreeDragInfo {
  sourceTreeId: string
  targetTreeId: string
  dragNode: TreeNode
  dropNode: TreeNode
  position: TreeDropPosition
  beforePosition: { parent: TreeNode | null; index: number; path: TreeNode[]; level: number } | null
  afterPosition: { parent: TreeNode | null; index: number; path: TreeNode[]; level: number } | null
}

// 从源树中移除节点
export function removeNodeFromTree(
  nodes: TreeNode[],
  nodeKey: string | number
): { nodes: TreeNode[]; removedNode: TreeNode | null } {
  return removeTreeNode(nodes, nodeKey)
}

// 向目标树中添加节点
export function addNodeToTree(
  nodes: TreeNode[],
  targetKey: string | number,
  newNode: TreeNode,
  position: TreeDropPosition = 'inside'
): TreeNode[] {
  return insertTreeNode(nodes, targetKey, newNode, position)
}

// 更新节点的 key 以反映新的树归属
function updateNodeKeysForCrossTree(node: TreeNode, sourceTreeId: string, targetTreeId: string): TreeNode {
  const updatedNode = { ...node }

  // 直接以前缀比对（treeId 本身可能包含 '-'，不能从 key 反推树ID）
  const sourcePrefix = getTreeIdPrefix(sourceTreeId)
  const keyString = String(updatedNode.key)
  if (keyString.startsWith(sourcePrefix)) {
    const keySuffix = keyString.substring(sourcePrefix.length)
    updatedNode.key = generateNodeKey(targetTreeId, keySuffix)

  }
  
  // 递归更新子节点的 key
  if (updatedNode.children && updatedNode.children.length > 0) {
    updatedNode.children = updatedNode.children.map(child => 
      updateNodeKeysForCrossTree(child, sourceTreeId, targetTreeId)
    )
  }
  
  return updatedNode
}

// 执行跨树节点移动
export function moveCrossTreeNode(
  sourceNodes: TreeNode[],
  targetNodes: TreeNode[],
  dragNodeKey: string | number,
  dropNodeKey: string | number,
  position: TreeDropPosition
): { success: boolean; sourceNodes: TreeNode[]; targetNodes: TreeNode[]; insertedKey?: string | number } {
  // 添加空值检查
  if (!sourceNodes || !targetNodes) {
    console.error('❌ 源树或目标树数据为空:', { sourceNodes, targetNodes })
    return { success: false, sourceNodes: sourceNodes || [], targetNodes: targetNodes || [] }
  }
  
  
  try {
    // 从源树中移除节点
    const removeResult = removeTreeNode(sourceNodes, dragNodeKey)
    
    if (!removeResult.removedNode) {
      console.error('❌ 无法从源树中找到要移动的节点:', dragNodeKey)
      return { success: false, sourceNodes, targetNodes }
    }
    
    
    // 使用新的工具函数确定源树和目标树ID
    const sourceTreeId = extractTreeIdFromNodeKey(dragNodeKey)
    const targetTreeId = extractTreeIdFromNodeKey(dropNodeKey)
    
    
    // 如果是跨树移动，更新节点的 key
    let nodeToInsert = removeResult.removedNode
    if (sourceTreeId && targetTreeId && sourceTreeId !== targetTreeId) {
      nodeToInsert = updateNodeKeysForCrossTree(removeResult.removedNode, sourceTreeId, targetTreeId)
    }
    
    // 添加到目标树
    
    // 首先检查目标节点是否存在（根级别放置除外，虚拟根不在数据中）
    const isRootDrop = position === 'root' || dropNodeKey === '__root__'
    const targetNode = isRootDrop ? null : findTreeNode(targetNodes, dropNodeKey)
    if (!isRootDrop && !targetNode) {
      console.error('❌ 无法在目标树中找到目标节点:', dropNodeKey)
      return { success: false, sourceNodes, targetNodes }
    }
    
    if (targetNode) {
    }

    const updatedTargetNodes = addNodeToTree(targetNodes, dropNodeKey, nodeToInsert, position)
    
    // 验证插入结果
    const insertedNodeInfo = findTreeNodeWithParent(updatedTargetNodes, nodeToInsert.key)
    if (insertedNodeInfo) {
    }
    
    return {
      success: true,
      sourceNodes: removeResult.nodes,
      targetNodes: updatedTargetNodes,
      insertedKey: nodeToInsert.key
    }
  } catch (error) {
    console.error('❌ 跨树拖拽操作失败:', error)
    return { success: false, sourceNodes, targetNodes }
  }
}

// 执行跨树多节点移动（保持相对顺序，作为一个块插入）
export function moveCrossTreeNodes(
  sourceNodes: TreeNode[],
  targetNodes: TreeNode[],
  dragNodeKeys: Array<string | number>,
  dropNodeKey: string | number,
  position: TreeDropPosition
): { success: boolean; sourceNodes: TreeNode[]; targetNodes: TreeNode[] } {
  if (dragNodeKeys.length === 0) {
    return { success: false, sourceNodes, targetNodes }
  }
  if (dragNodeKeys.length === 1) {
    return moveCrossTreeNode(sourceNodes, targetNodes, dragNodeKeys[0], dropNodeKey, position)
  }

  let workingSource = sourceNodes
  let workingTarget = targetNodes
  let anchorKey = dropNodeKey
  let anchorPosition = position

  for (const key of dragNodeKeys) {
    const result = moveCrossTreeNode(workingSource, workingTarget, key, anchorKey, anchorPosition)
    if (!result.success) {
      return { success: false, sourceNodes, targetNodes }
    }
    workingSource = result.sourceNodes
    workingTarget = result.targetNodes
    // 后续节点插入到前一个节点之后，保持块顺序
    // 注意跨树移动可能重写节点 key，锚点必须使用插入后的新 key
    if (position === 'above' || position === 'below') {
      anchorKey = result.insertedKey ?? key
      anchorPosition = 'below'
    }
  }

  return { success: true, sourceNodes: workingSource, targetNodes: workingTarget }
}

// 检查是否可以进行跨树拖拽
export function canCrossTreeDrop(
  dragNode: TreeNode,
  dropNode: TreeNode,
  position: TreeDropPosition,
  sourceTreeId: string,
  targetTreeId: string
): boolean {
  // 基本验证：不能拖拽到自己身上
  if (dragNode.key === dropNode.key) {
    return false
  }

  // 如果是同一个树，使用原有的验证逻辑
  if (sourceTreeId === targetTreeId) {
    return canDropNode(dragNode, dropNode, position)
  }

  // 跨树拖拽的特殊验证
  // 可以添加更多的业务逻辑验证
  return true
}

// 格式化跨树拖拽信息
export function formatCrossTreeDragInfo(
  sourceTreeId: string,
  targetTreeId: string,
  dragNode: TreeNode,
  dropNode: TreeNode,
  position: TreeDropPosition,
  beforePosition: { parent: TreeNode | null; index: number; path: TreeNode[]; level: number } | null,
  afterPosition: { parent: TreeNode | null; index: number; path: TreeNode[]; level: number } | null
): CrossTreeDragInfo & {
  dragNodeInfo: ReturnType<typeof getNodeInfo>
  dropNodeInfo: ReturnType<typeof getNodeInfo>
  before: {
    parentLabel: string
    parentKey: string | number | null
    index: number
    level: number
    path: string
  }
  after: {
    parentLabel: string
    parentKey: string | number | null
    index: number
    level: number
    path: string
  }
  isCrossTree: boolean
} {
  const dragNodeInfo = getNodeInfo(dragNode)
  const dropNodeInfo = getNodeInfo(dropNode)
  
  // 计算拖拽后的位置信息
  let afterParent: TreeNode | null = null
  let afterIndex = 0
  let afterLevel = 0
  
  if (position === 'inside') {
    afterParent = dropNode
    afterIndex = dropNode.children?.length || 0
    afterLevel = (afterPosition?.level || 0) + 1
  } else {
    afterParent = afterPosition?.parent || null
    if (position === 'above') {
      afterIndex = afterPosition?.index || 0
    } else { // below
      afterIndex = (afterPosition?.index || 0) + 1
    }
    afterLevel = afterPosition?.level || 0
  }
  
  return {
    sourceTreeId,
    targetTreeId,
    dragNode,
    dropNode,
    position,
    beforePosition,
    afterPosition,
    dragNodeInfo,
    dropNodeInfo,
    isCrossTree: sourceTreeId !== targetTreeId,
    before: {
      parentLabel: beforePosition?.parent?.label || '根目录',
      parentKey: beforePosition?.parent?.key || null,
      index: beforePosition?.index || 0,
      level: beforePosition?.level || 0,
      path: beforePosition?.path.map(node => node.label).join(' > ') || '根目录'
    },
    after: {
      parentLabel: afterParent?.label || '根目录',
      parentKey: afterParent?.key || null,
      index: afterIndex,
      level: afterLevel,
      path: afterPosition?.path.map(node => node.label).join(' > ') || '根目录'
    }
  }
}

// 生成跨树演示数据
export function getCrossTreeSampleData(): { tree1: TreeNode[]; tree2: TreeNode[] } {
  return {
    tree1: [
      {
        key: 'tree1-0',
        label: '项目文档',
        data: 'Project Documents',
        draggable: true,
        droppable: true,
        children: [
          {
            key: 'tree1-0-0',
            label: '需求文档',
            data: 'Requirements',
            draggable: true,
            droppable: true,
            children: [
              { key: 'tree1-0-0-0', label: '功能需求.doc', data: 'Functional Requirements', draggable: true, droppable: true },
              { key: 'tree1-0-0-1', label: '非功能需求.doc', data: 'Non-functional Requirements', draggable: true, droppable: true }
            ]
          },
          {
            key: 'tree1-0-1',
            label: '设计文档',
            data: 'Design Documents',
            draggable: true,
            droppable: true,
            children: [
              { key: 'tree1-0-1-0', label: 'UI设计.psd', data: 'UI Design', draggable: true, droppable: true },
              { key: 'tree1-0-1-1', label: '架构设计.pdf', data: 'Architecture Design', draggable: true, droppable: true }
            ]
          }
        ]
      },
      {
        key: 'tree1-1',
        label: '代码文件',
        data: 'Code Files',
        draggable: true,
        droppable: true,
        children: [
          { key: 'tree1-1-0', label: 'main.js', data: 'Main JavaScript File', draggable: true, droppable: true },
          { key: 'tree1-1-1', label: 'utils.js', data: 'Utility Functions', draggable: true, droppable: true }
        ]
      }
    ],
    tree2: [
      {
        key: 'tree2-0',
        label: '资源文件',
        data: 'Resource Files',
        draggable: true,
        droppable: true,
        children: [
          {
            key: 'tree2-0-0',
            label: '图片',
            data: 'Images',
            draggable: true,
            droppable: true,
            children: [
              { key: 'tree2-0-0-0', label: 'logo.png', data: 'Logo Image', draggable: true, droppable: true },
              { key: 'tree2-0-0-1', label: 'banner.jpg', data: 'Banner Image', draggable: true, droppable: true }
            ]
          },
          {
            key: 'tree2-0-1',
            label: '样式',
            data: 'Styles',
            draggable: true,
            droppable: true,
            children: [
              { key: 'tree2-0-1-0', label: 'main.css', data: 'Main Stylesheet', draggable: true, droppable: true }
            ]
          }
        ]
      },
      {
        key: 'tree2-1',
        label: '配置文件',
        data: 'Configuration Files',
        draggable: true,
        droppable: true,
        children: [
          { key: 'tree2-1-0', label: 'package.json', data: 'Package Configuration', draggable: true, droppable: true },
          { key: 'tree2-1-1', label: 'vite.config.js', data: 'Vite Configuration', draggable: true, droppable: true }
        ]
      }
    ]
  }
}

/**
 * 获取节点详细信息（从 TreeDemo.vue 移植）
 * 包括索引、层级、路径、兄弟节点和父节点信息
 */
export function getNodeDetailedInfo(
  nodes: TreeNode[], 
  nodeKey: string | number, 
  treeId: string,
  config?: Partial<TreeConfig>
): {
  node: TreeNode | null;
  parentNode: TreeNode | null;
  parentLabel: string;
  parentKey: string | number | null;
  index: number;
  level: number;
  path: string;
  fullPath: string[];
  siblings: TreeNode[];
  sourceData: TreeNode[];
} | null {
  function findNodeRecursive(
    currentNodes: TreeNode[], 
    targetKey: string | number, 
    parent: TreeNode | null = null, 
    currentLevel: number = 0,
    currentPath: string[] = []
  ): any {
    // 添加空值检查
    if (!currentNodes || !Array.isArray(currentNodes)) {
      return null
    }
    
    for (let i = 0; i < currentNodes.length; i++) {
      const node = currentNodes[i]
      const nodePath = [...currentPath, node.label]
      
      if (node.key === targetKey) {
        const mergedConfig = mergeTreeConfig(config)
        return {
          node,
          parentNode: parent,
          parentLabel: parent?.label || mergedConfig.i18n.rootLabel,
          parentKey: parent?.key || null,
          index: i,
          level: currentLevel,
          path: nodePath.join(' > '),
          fullPath: nodePath,
          siblings: currentNodes,
          sourceData: nodes
        }
      }
      
      // 添加对 node.children 的空值检查
      if (node.children && Array.isArray(node.children)) {
        const found = findNodeRecursive(
          node.children, 
          targetKey, 
          node, 
          currentLevel + 1, 
          nodePath
        )
        if (found) return found
      }
    }
    return null
  }
  
  // 添加对输入参数的空值检查
  if (!nodes || !Array.isArray(nodes)) {
    return null
  }
  
  return findNodeRecursive(nodes, nodeKey)
}

/**
 * 根据路径查找节点（从 TreeDemo.vue 移植）
 */
export function findNodeByPath(nodes: TreeNode[], path: string[]): TreeNode | null {
  if (path.length === 0) return null
  
  let currentNodes = nodes
  let currentNode: TreeNode | null = null
  
  for (const label of path) {
    currentNode = currentNodes.find(node => node.label === label) || null
    if (!currentNode) return null
    
    if (currentNode.children) {
      currentNodes = currentNode.children
    }
  }
  
  return currentNode
}

/**
 * 计算拖拽后的位置信息（从 TreeDemo.vue 移植）
 */
export function calculateDropInfo(
  targetNodes: TreeNode[], 
  dropNode: TreeNode, 
  position: TreeDropPosition,
  treeId: string
): {
  targetTreeId: string;
  newParentNode: TreeNode | null;
  newParentLabel: string;
  newParentKey: string | number | null;
  newIndex: number;
  newLevel: number;
  newPath: string;
  newFullPath: string[];
  newSiblings: TreeNode[];
  targetData: TreeNode[];
} | null {
  // 获取目标节点的详细信息
  const dropNodeInfo = getNodeDetailedInfo(targetNodes, dropNode.key, treeId)
  if (!dropNodeInfo) return null
  
  let newParentNode: TreeNode | null = null
  let newIndex = 0
  let newLevel = 0
  let newPath = ''
  let newFullPath: string[] = []
  let newSiblings: TreeNode[] = []
  
  if (position === 'inside') {
    // 放置在节点内部
    newParentNode = dropNode
    newIndex = dropNode.children?.length || 0
    newLevel = dropNodeInfo.level + 1
    newFullPath = [...dropNodeInfo.fullPath]
    newPath = newFullPath.join(' > ')
    newSiblings = dropNode.children || []
  } else {
    // 放置在节点上方或下方
    newParentNode = dropNodeInfo.parentNode
    newLevel = dropNodeInfo.level
    newSiblings = dropNodeInfo.siblings
    
    if (position === 'above') {
      newIndex = dropNodeInfo.index
    } else { // below
      newIndex = dropNodeInfo.index + 1
    }
    
    if (newParentNode) {
      const parentInfo = getNodeDetailedInfo(targetNodes, newParentNode.key, treeId)
      newFullPath = parentInfo?.fullPath || []
    } else {
      newFullPath = []
    }
    newPath = newFullPath.join(' > ') || '根目录'
  }
  
  return {
    targetTreeId: treeId,
    newParentNode,
    newParentLabel: newParentNode?.label || '根目录',
    newParentKey: newParentNode?.key || null,
    newIndex,
    newLevel,
    newPath,
    newFullPath,
    newSiblings,
    targetData: targetNodes
  }
}
