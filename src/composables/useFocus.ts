import { computed, nextTick, type Ref } from 'vue'
import type { TreeNode, TreeExpandedKeys, KeyboardHandleResult } from '../lib/types'

/**
 * 简化的焦点管理 Composable
 * 只处理键盘导航，焦点样式完全依赖浏览器原生 :focus 伪类
 *
 * @param nodes 树数据
 * @param expandedKeys 展开状态（提供时只导航可见节点，折叠分支的子节点会被跳过）
 * @param treeId 树 ID（提供时 DOM 查询限定在本树内，避免多树同 key 冲突）
 */
export function useFocus(
  nodes: Ref<TreeNode[]>,
  expandedKeys?: Ref<TreeExpandedKeys>,
  treeId?: string
) {
  // 计算属性 - 只收集当前可见的节点（折叠分支中的节点不可聚焦）
  const focusableNodes = computed(() => {
    const focusable: TreeNode[] = []

    const visit = (nodeList: TreeNode[], ancestorsExpanded: boolean) => {
      for (const node of nodeList) {
        if (!ancestorsExpanded) {
          // 祖先被折叠，整棵子树不可见
          continue
        }
        if (node.selectable !== false) {
          focusable.push(node)
        }
        if (node.children && node.children.length > 0) {
          const isExpanded = expandedKeys ? expandedKeys.value[node.key] === true : true
          visit(node.children, isExpanded)
        }
      }
    }
    visit(nodes.value, true)
    return focusable
  })

  // DOM 操作辅助函数
  const getCurrentFocusedElement = (): HTMLElement | null => {
    return document.activeElement as HTMLElement
  }

  const getCurrentFocusedNodeKey = (): string | number | null => {
    const activeElement = getCurrentFocusedElement()
    if (activeElement) {
      // 从 DOM 元素获取节点 key
      const nodeKey = activeElement.closest('[data-node-key]')?.getAttribute('data-node-key')
      return nodeKey || null
    }
    return null
  }

  const getCurrentFocusIndex = (): number => {
    const currentKey = getCurrentFocusedNodeKey()
    if (!currentKey) return -1
    return focusableNodes.value.findIndex(node => String(node.key) === currentKey)
  }

  const focusElementByNodeKey = async (nodeKey: string | number) => {
    await nextTick()
    // data-node-key 在 <li> 上（无 tabindex），真正可聚焦的是内层 .p-tree-node-content
    const scope = treeId ? `[data-tree-id="${treeId}"] ` : ''
    const element = document.querySelector(
      `${scope}[data-node-key="${nodeKey}"] > .p-tree-node-content`
    ) as HTMLElement | null
    if (element) {
      element.focus()
    }
  }

  // 键盘导航方法 - 直接操作 DOM 焦点
  const focusNext = (event?: Event) => {
    const currentIndex = getCurrentFocusIndex()
    const focusableList = focusableNodes.value

    if (focusableList.length === 0) return null

    let nextIndex = currentIndex + 1
    if (nextIndex >= focusableList.length) {
      nextIndex = 0 // 循环到第一个
    }

    const nextNode = focusableList[nextIndex]
    focusElementByNodeKey(nextNode.key)
    return nextNode
  }

  const focusPrevious = (event?: Event) => {
    const currentIndex = getCurrentFocusIndex()
    const focusableList = focusableNodes.value

    if (focusableList.length === 0) return null

    let prevIndex = currentIndex - 1
    if (prevIndex < 0) {
      prevIndex = focusableList.length - 1 // 循环到最后一个
    }

    const prevNode = focusableList[prevIndex]
    focusElementByNodeKey(prevNode.key)
    return prevNode
  }

  const focusFirst = (event?: Event) => {
    const focusableList = focusableNodes.value
    if (focusableList.length > 0) {
      const firstNode = focusableList[0]
      focusElementByNodeKey(firstNode.key)
      return firstNode
    }
    return null
  }

  const focusLast = (event?: Event) => {
    const focusableList = focusableNodes.value
    if (focusableList.length > 0) {
      const lastNode = focusableList[focusableList.length - 1]
      focusElementByNodeKey(lastNode.key)
      return lastNode
    }
    return null
  }

  // 构造焦点事件，供 Tree 组件向外 emit node-focus / node-blur
  const buildFocusEvents = (event: KeyboardEvent, targetNode: TreeNode | null, currentNode: TreeNode | null) => {
    const focusEvent = targetNode ? { originalEvent: event, node: targetNode } : null
    const blurEvent = currentNode && currentNode !== targetNode ? { originalEvent: event, node: currentNode } : null
    return { focusEvent, blurEvent }
  }

  // 键盘事件处理
  const handleKeyDown = (event: KeyboardEvent): KeyboardHandleResult => {
    const currentKey = getCurrentFocusedNodeKey()
    if (!currentKey) return null

    const currentNode = focusableNodes.value.find(node => String(node.key) === currentKey)
    if (!currentNode) return null

    const hasChildren = !!(currentNode.children && currentNode.children.length > 0)
    const isExpanded = expandedKeys ? expandedKeys.value[currentNode.key] === true : false

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault()
        const target = focusNext(event)
        const { focusEvent, blurEvent } = buildFocusEvents(event, target, currentNode)
        return { type: 'navigate', event, focusEvent, blurEvent }
      }

      case 'ArrowUp': {
        event.preventDefault()
        const target = focusPrevious(event)
        const { focusEvent, blurEvent } = buildFocusEvents(event, target, currentNode)
        return { type: 'navigate', event, focusEvent, blurEvent }
      }

      case 'ArrowRight': {
        if (!hasChildren) return null
        event.preventDefault()
        if (!isExpanded) {
          // 折叠状态：展开
          return { type: 'expand', node: currentNode, event }
        }
        // 已展开：聚焦第一个子节点
        const firstChild = currentNode.children![0]
        focusElementByNodeKey(firstChild.key)
        const { focusEvent, blurEvent } = buildFocusEvents(event, firstChild, currentNode)
        return { type: 'navigate', event, focusEvent, blurEvent }
      }

      case 'ArrowLeft': {
        event.preventDefault()
        if (hasChildren && isExpanded) {
          // 已展开：折叠
          return { type: 'collapse', node: currentNode, event }
        }
        // 否则：聚焦父节点
        const parent = findParentNode(nodes.value, currentNode)
        if (parent) {
          focusElementByNodeKey(parent.key)
          const { focusEvent, blurEvent } = buildFocusEvents(event, parent, currentNode)
          return { type: 'navigate', event, focusEvent, blurEvent }
        }
        return null
      }

      case 'Home': {
        event.preventDefault()
        const target = focusFirst(event)
        const { focusEvent, blurEvent } = buildFocusEvents(event, target, currentNode)
        return { type: 'navigate', event, focusEvent, blurEvent }
      }

      case 'End': {
        event.preventDefault()
        const target = focusLast(event)
        const { focusEvent, blurEvent } = buildFocusEvents(event, target, currentNode)
        return { type: 'navigate', event, focusEvent, blurEvent }
      }

      case 'Enter':
      case ' ':
        event.preventDefault()
        // 返回当前焦点节点，让父组件处理选择逻辑
        return {
          type: 'activate',
          node: currentNode,
          event
        }

      default:
        return null
    }
  }

  return {
    // 计算属性
    focusableNodes,

    // 键盘导航
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    handleKeyDown,

    // DOM 操作
    focusElementByNodeKey,
    getCurrentFocusedElement,
    getCurrentFocusedNodeKey
  }
}

// 查找父节点（本模块内部使用）
function findParentNode(nodes: TreeNode[], target: TreeNode): TreeNode | null {
  for (const node of nodes) {
    if (node.children) {
      if (node.children.some(child => child.key === target.key)) {
        return node
      }
      const parent = findParentNode(node.children, target)
      if (parent) return parent
    }
  }
  return null
}
