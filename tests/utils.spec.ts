import { describe, it, expect } from 'vitest'
import {
  insertTreeNode,
  moveTreeNode,
  moveTreeNodes,
  moveCrossTreeNode,
  moveCrossTreeNodes,
  filterTreeNodes
} from '../src/lib/utils'
import type { TreeNode } from '../src/lib/types'

const tree = (): TreeNode[] => ([
  {
    key: 'a', label: 'A', children: [
      { key: 'a1', label: 'A1', children: [{ key: 'a1x', label: 'A1X' }] },
      { key: 'a2', label: 'A2' }
    ]
  },
  { key: 'b', label: 'B', children: [{ key: 'b1', label: 'B1' }] },
  { key: 'c', label: 'C' }
])

describe('insertTreeNode', () => {
  it('找不到目标节点时返回原数组引用（不克隆、不插入）', () => {
    const t = tree()
    const result = insertTreeNode(t, 'missing', { key: 'n', label: 'N' }, 'inside')
    expect(result).toBe(t)
  })

  it('root 位置插入追加到末尾', () => {
    const t = tree()
    const result = insertTreeNode(t, '__root__', { key: 'n', label: 'N' }, 'root')
    expect(result.map(n => n.key)).toEqual(['a', 'b', 'c', 'n'])
  })
})

describe('moveTreeNode', () => {
  it('目标不存在时回滚，节点不丢失', () => {
    const t = tree()
    const result = moveTreeNode(t, 'a2', 'missing', 'inside')
    expect(result).toBe(t)
    expect(result[0].children).toHaveLength(2)
  })

  it('inside 移动正常', () => {
    const result = moveTreeNode(tree(), 'a2', 'b1', 'inside')
    expect(result[1].children![0].children![0].key).toBe('a2')
    expect(result[0].children).toHaveLength(1)
  })

  it('above/below 顺序正确', () => {
    expect(moveTreeNode(tree(), 'c', 'a', 'above').map(n => n.key)).toEqual(['c', 'a', 'b'])
    expect(moveTreeNode(tree(), 'a', 'c', 'below').map(n => n.key)).toEqual(['b', 'c', 'a'])
  })

  it('拖拽节点不存在时返回原数组', () => {
    const t = tree()
    expect(moveTreeNode(t, 'missing', 'a', 'inside')).toBe(t)
  })
})

describe('moveTreeNodes（多节点块移动）', () => {
  it('inside 移动保持相对顺序', () => {
    const result = moveTreeNodes(tree(), ['a2', 'c'], 'b1', 'inside')
    expect(result[1].children![0].children!.map(n => n.key)).toEqual(['a2', 'c'])
  })

  it('below 移动保持相对顺序', () => {
    const result = moveTreeNodes(tree(), ['b', 'c'], 'a', 'below')
    expect(result.map(n => n.key)).toEqual(['a', 'b', 'c'])
  })

  it('key 全部失效时回滚', () => {
    const t = tree()
    expect(moveTreeNodes(t, ['x', 'y'], 'a', 'inside')).toBe(t)
  })

  it('目标在被拖集合中时不执行', () => {
    const t = tree()
    expect(moveTreeNodes(t, ['a', 'b'], 'a', 'inside')).toBe(t)
  })
})

describe('moveCrossTreeNode', () => {
  it('跨树拖到空树（root）成功', () => {
    const result = moveCrossTreeNode([{ key: 's1', label: 'S1' }], [], 's1', '__root__', 'root')
    expect(result.success).toBe(true)
    expect(result.targetNodes).toHaveLength(1)
    expect(result.sourceNodes).toHaveLength(0)
  })

  it('跨树拖到根级别追加到末尾', () => {
    const result = moveCrossTreeNode(
      [{ key: 's1', label: 'S1' }],
      [{ key: 't1', label: 'T1' }],
      's1', '__root__', 'root'
    )
    expect(result.success).toBe(true)
    expect(result.targetNodes.map(n => n.key)).toEqual(['t1', 's1'])
  })

  it('拖拽节点不存在时失败且数据不变', () => {
    const src = [{ key: 's1', label: 'S1' }]
    const tgt = [{ key: 't1', label: 'T1' }]
    const result = moveCrossTreeNode(src, tgt, 'missing', 't1', 'inside')
    expect(result.success).toBe(false)
    expect(result.sourceNodes).toBe(src)
    expect(result.targetNodes).toBe(tgt)
  })

  it('普通跨树 inside 移动成功', () => {
    const result = moveCrossTreeNode(
      [{ key: 's1', label: 'S1' }],
      [{ key: 't1', label: 'T1', children: [] }],
      's1', 't1', 'inside'
    )
    expect(result.success).toBe(true)
    expect(result.targetNodes[0].children).toHaveLength(1)
  })
})

describe('moveCrossTreeNodes（跨树多节点）', () => {
  it('below 移动保持相对顺序', () => {
    const result = moveCrossTreeNodes(
      [{ key: 'x1', label: 'X1' }, { key: 'x2', label: 'X2' }, { key: 'x3', label: 'X3' }],
      [{ key: 't1', label: 'T1' }],
      ['x1', 'x3'], 't1', 'below'
    )
    expect(result.success).toBe(true)
    expect(result.targetNodes.map(n => n.key)).toEqual(['t1', 'x1', 'x3'])
    expect(result.sourceNodes.map(n => n.key)).toEqual(['x2'])
  })

  it('空 key 列表直接失败', () => {
    const result = moveCrossTreeNodes([{ key: 'x1', label: 'X1' }], [], [], 't1', 'inside')
    expect(result.success).toBe(false)
  })
})

describe('filterTreeNodes', () => {
  it('strict：保留匹配节点及其祖先路径，隐藏未匹配兄弟/子节点', () => {
    const result = filterTreeNodes(tree(), 'A2', 'label', 'strict')
    expect(result).toHaveLength(1)
    expect(result[0].key).toBe('a')
    expect(result[0].children).toHaveLength(1)
    expect(result[0].children![0].key).toBe('a2')
    expect(result[0].children![0].children).toBeUndefined()
  })

  it('strict：多匹配时层级结构正确', () => {
    const result = filterTreeNodes(tree(), 'A', 'label', 'strict')
    expect(result).toHaveLength(1)
    const a = result[0]
    expect(a.children!.map(n => n.key)).toEqual(['a1', 'a2'])
    expect(a.children![0].children![0].key).toBe('a1x')
  })

  it('lenient：保留匹配路径与匹配节点的全部子节点', () => {
    const result = filterTreeNodes(tree(), 'A1', 'label', 'lenient')
    expect(result).toHaveLength(1)
    // 祖先路径只保留通向匹配的分支
    expect(result[0].children!.map(n => n.key)).toEqual(['a1'])
    // 匹配节点自身的子节点全部保留
    expect(result[0].children![0].children!.map(n => n.key)).toEqual(['a1x'])
  })

  it('空过滤词返回原数据', () => {
    const t = tree()
    expect(filterTreeNodes(t, '', 'label', 'strict')).toBe(t)
  })
})
