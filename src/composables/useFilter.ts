import { ref, computed, watch, type Ref } from 'vue'
import type { 
  TreeNode, 
  TreeFilterMode,
  TreeFilterConfig,
  UseFilterReturn
} from '../lib/types'
import { filterTreeNodes } from '../lib/utils'

/**
 * 过滤功能 Composable
 * 处理树节点的搜索和过滤逻辑
 */
export function useFilter(
  nodes: Ref<TreeNode[]>,
  filterConfig: Partial<TreeFilterConfig> = {}
): UseFilterReturn {
  // 过滤配置
  const config = ref<TreeFilterConfig>({
    mode: filterConfig.mode || 'lenient',
    field: filterConfig.field || 'label',
    matchCase: filterConfig.matchCase || false
  })

  // 过滤状态
  const filterValue = ref('')
  const isFiltering = ref(false)

  // 计算属性
  const filteredNodes = computed(() => {
    if (!filterValue.value.trim()) {
      return nodes.value
    }

    isFiltering.value = true
    
    try {
      const filtered = filterTreeNodes(
        nodes.value,
        filterValue.value,
        config.value.field,
        config.value.mode
      )
      
      return filtered
    } finally {
      isFiltering.value = false
    }
  })

  const hasFilter = computed(() => {
    return filterValue.value.trim().length > 0
  })

  const filteredCount = computed(() => {
    if (!hasFilter.value) return 0
    
    let count = 0
    const countNodes = (nodes: TreeNode[]) => {
      for (const node of nodes) {
        count++
        if (node.children) {
          countNodes(node.children)
        }
      }
    }
    
    countNodes(filteredNodes.value)
    return count
  })

  const originalCount = computed(() => {
    let count = 0
    const countNodes = (nodes: TreeNode[]) => {
      for (const node of nodes) {
        count++
        if (node.children) {
          countNodes(node.children)
        }
      }
    }
    
    countNodes(nodes.value)
    return count
  })

  const hasResults = computed(() => {
    return !hasFilter.value || filteredNodes.value.length > 0
  })

  // 过滤方法
  const setFilter = (value: string) => {
    filterValue.value = value
  }

  const clearFilter = () => {
    filterValue.value = ''
  }

  const setFilterMode = (mode: TreeFilterMode) => {
    config.value.mode = mode
  }

  const setFilterField = (field: string) => {
    config.value.field = field
  }

  const setMatchCase = (matchCase: boolean) => {
    config.value.matchCase = matchCase
  }

  // 高级过滤方法
  const filterByPredicate = (predicate: (node: TreeNode) => boolean): TreeNode[] => {
    const filtered: TreeNode[] = []
    
    const filterRecursive = (nodes: TreeNode[]): TreeNode[] => {
      const result: TreeNode[] = []
      
      for (const node of nodes) {
        const nodeMatches = predicate(node)
        let filteredChildren: TreeNode[] = []
        
        if (node.children) {
          filteredChildren = filterRecursive(node.children)
        }
        
        if (config.value.mode === 'lenient') {
          // 宽松模式：节点匹配或有匹配的子节点
          if (nodeMatches || filteredChildren.length > 0) {
            result.push({
              ...node,
              children: filteredChildren.length > 0 ? filteredChildren : node.children
            })
          }
        } else {
          // 严格模式：只显示匹配的节点
          if (nodeMatches) {
            result.push({
              ...node,
              children: node.children
            })
          }
        }
      }
      
      return result
    }
    
    return filterRecursive(nodes.value)
  }

  const filterByMultipleFields = (
    value: string, 
    fields: string[]
  ): TreeNode[] => {
    if (!value.trim()) return nodes.value
    
    const searchValue = config.value.matchCase ? value : value.toLowerCase()
    
    return filterByPredicate((node) => {
      return fields.some(field => {
        const fieldValue = (node as any)[field]
        if (typeof fieldValue === 'string') {
          const compareValue = config.value.matchCase ? fieldValue : fieldValue.toLowerCase()
          return compareValue.includes(searchValue)
        }
        return false
      })
    })
  }

  const filterByType = (type: string): TreeNode[] => {
    return filterByPredicate((node) => node.type === type)
  }

  const filterByCustom = (
    filterFn: (node: TreeNode, filterValue: string) => boolean
  ): TreeNode[] => {
    return filterByPredicate((node) => filterFn(node, filterValue.value))
  }

  // 搜索相关方法
  const searchNodes = (searchTerm: string): TreeNode[] => {
    const results: TreeNode[] = []
    const searchLower = searchTerm.toLowerCase()
    
    const searchRecursive = (nodes: TreeNode[], path: TreeNode[] = []) => {
      for (const node of nodes) {
        const currentPath = [...path, node]
        
        // 检查节点是否匹配
        const nodeText = (node as any)[config.value.field] || ''
        if (nodeText.toLowerCase().includes(searchLower)) {
          results.push({
            ...node,
            // 添加路径信息用于高亮显示
            searchPath: currentPath
          } as TreeNode & { searchPath: TreeNode[] })
        }
        
        if (node.children) {
          searchRecursive(node.children, currentPath)
        }
      }
    }
    
    searchRecursive(nodes.value)
    return results
  }

  const highlightMatches = (text: string, searchTerm: string): string => {
    if (!searchTerm.trim()) return text
    
    const regex = new RegExp(
      `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
      config.value.matchCase ? 'g' : 'gi'
    )
    
    return text.replace(regex, '<mark>$1</mark>')
  }

  // 过滤统计
  const getFilterStats = () => {
    return {
      total: originalCount.value,
      filtered: filteredCount.value,
      hidden: originalCount.value - filteredCount.value,
      hasFilter: hasFilter.value,
      hasResults: hasResults.value
    }
  }

  // 重置过滤器
  const resetFilter = () => {
    filterValue.value = ''
    config.value = {
      mode: 'lenient',
      field: 'label',
      matchCase: false
    }
  }

  // 监听器
  watch(
    () => config.value.mode,
    () => {
      // 模式变化时重新过滤
      if (hasFilter.value) {
        // 触发重新计算
        const currentValue = filterValue.value
        filterValue.value = ''
        filterValue.value = currentValue
      }
    }
  )

  // 防抖过滤
  let filterTimeout: number | null = null
  
  const debouncedFilter = (value: string, delay: number = 300) => {
    if (filterTimeout) {
      clearTimeout(filterTimeout)
    }
    
    filterTimeout = setTimeout(() => {
      setFilter(value)
    }, delay)
  }

  return {
    // 状态
    filterValue,
    isFiltering,
    config,
    
    // 计算属性
    filteredNodes,
    hasFilter,
    filteredCount,
    originalCount,
    hasResults,
    
    // 基础过滤方法
    setFilter,
    clearFilter,
    setFilterMode,
    setFilterField,
    setMatchCase,
    debouncedFilter,
    
    // 高级过滤方法
    filterByPredicate,
    filterByMultipleFields,
    filterByType,
    filterByCustom,
    
    // 搜索方法
    searchNodes,
    highlightMatches,
    
    // 工具方法
    getFilterStats,
    resetFilter
  }
}