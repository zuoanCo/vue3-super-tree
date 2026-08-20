import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useFilter } from '../src/composables/useFilter'
import type { TreeNode } from '../src/lib/types'

const sample = (): TreeNode[] => ([
  {
    key: 'a', label: 'Alpha', children: [
      { key: 'a1', label: 'Beta' },
      { key: 'a2', label: 'Gamma' }
    ]
  },
  { key: 'b', label: 'Delta' }
])

describe('useFilter', () => {
  it('过滤结果保留层级结构（不拍平）', () => {
    const nodes = ref(sample())
    const filter = useFilter(nodes, { mode: 'lenient', field: 'label' })

    filter.setFilter('Beta')
    const result = filter.filteredNodes.value
    expect(result).toHaveLength(1)
    expect(result[0].key).toBe('a')
    expect(result[0].children!.some(n => n.key === 'a1')).toBe(true)
  })

  it('strict 模式隐藏未匹配子节点', () => {
    const nodes = ref(sample())
    const filter = useFilter(nodes, { mode: 'strict', field: 'label' })

    filter.setFilter('Beta')
    const result = filter.filteredNodes.value
    expect(result[0].children!.map(n => n.key)).toEqual(['a1'])
  })

  it('清空过滤后返回全部节点', () => {
    const nodes = ref(sample())
    const filter = useFilter(nodes)

    filter.setFilter('Beta')
    filter.clearFilter()
    expect(filter.filteredNodes.value).toBe(nodes.value)
    expect(filter.isFiltering.value).toBe(false)
  })

  it('resetFilter 保留初始配置而不是硬编码默认值', () => {
    const nodes = ref(sample())
    const filter = useFilter(nodes, { mode: 'strict', field: 'data' })

    filter.setFilterMode('lenient')
    filter.setFilterField('label')
    filter.resetFilter()

    expect(filter.config.value.mode).toBe('strict')
    expect(filter.config.value.field).toBe('data')
  })

  it('isFiltering 状态随 setFilter/clearFilter 更新', () => {
    const nodes = ref(sample())
    const filter = useFilter(nodes)

    filter.setFilter('Beta')
    expect(filter.isFiltering.value).toBe(true)
    filter.clearFilter()
    expect(filter.isFiltering.value).toBe(false)
  })
})
