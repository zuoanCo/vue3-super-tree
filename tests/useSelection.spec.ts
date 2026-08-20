import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useSelection } from '../src/composables/useSelection'
import type { TreeNode, TreeCheckboxSelectionKeys } from '../src/lib/types'

const threeLevelTree = (): TreeNode[] => ([
  {
    key: 'p', label: 'P', children: [
      { key: 'c1', label: 'C1', children: [{ key: 'g1', label: 'G1' }, { key: 'g2', label: 'G2' }] },
      { key: 'c2', label: 'C2', children: [{ key: 'g3', label: 'G3' }] }
    ]
  }
])

type CheckboxKeys = Record<string, TreeCheckboxSelectionKeys>

describe('useSelection - checkbox 级联', () => {
  it('勾选深层叶子：父与祖父半选（后序遍历）', () => {
    const nodes = ref(threeLevelTree())
    const sel = useSelection(nodes, ref('checkbox'), {})

    sel.updateCheckboxSelection(nodes.value[0].children![0].children![0], true)
    const keys = sel.selectionKeys.value as CheckboxKeys

    expect(keys['g1'].checked).toBe(true)
    expect(keys['c1'].partialChecked).toBe(true)
    expect(keys['p'].partialChecked).toBe(true)
  })

  it('子节点全部勾选后父节点全选，祖父按兄弟状态半选/全选', () => {
    const nodes = ref(threeLevelTree())
    const sel = useSelection(nodes, ref('checkbox'), {})
    const [c1, c2] = nodes.value[0].children!

    sel.updateCheckboxSelection(c1.children![0], true)
    sel.updateCheckboxSelection(c1.children![1], true)
    let keys = sel.selectionKeys.value as CheckboxKeys
    expect(keys['c1'].checked).toBe(true)
    expect(keys['c1'].partialChecked).toBe(false)
    expect(keys['p'].partialChecked).toBe(true)

    sel.updateCheckboxSelection(c2.children![0], true)
    keys = sel.selectionKeys.value as CheckboxKeys
    expect(keys['c2'].checked).toBe(true)
    expect(keys['p'].checked).toBe(true)
  })

  it('取消勾选后父/祖父状态回退', () => {
    const nodes = ref(threeLevelTree())
    const sel = useSelection(nodes, ref('checkbox'), {})
    const c1 = nodes.value[0].children![0]

    sel.updateCheckboxSelection(c1.children![0], true)
    sel.updateCheckboxSelection(c1.children![1], true)
    sel.updateCheckboxSelection(c1.children![0], false)

    const keys = sel.selectionKeys.value as CheckboxKeys
    expect(keys['c1'].partialChecked).toBe(true)
    expect(keys['p'].partialChecked).toBe(true)
  })

  it('每次更新产生新的 keys 引用（v-model 可感知）', () => {
    const nodes = ref(threeLevelTree())
    const sel = useSelection(nodes, ref('checkbox'), {})
    const before = sel.selectionKeys.value

    sel.updateCheckboxSelection(nodes.value[0].children![0].children![0], true)
    expect(sel.selectionKeys.value).not.toBe(before)
  })
})

describe('useSelection - selectAll / clearSelection', () => {
  it('selectAll 后父节点也处于勾选状态', () => {
    const nodes = ref([{ key: 'p', label: 'P', children: [{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }] }])
    const sel = useSelection(nodes, ref('checkbox'), {})

    sel.selectAll()
    const keys = sel.selectionKeys.value as CheckboxKeys
    expect(keys['a'].checked).toBe(true)
    expect(keys['b'].checked).toBe(true)
    expect(keys['p'].checked).toBe(true)
  })

  it('clearSelection 返回所有被取消节点的事件', () => {
    const nodes = ref([{ key: 'p', label: 'P', children: [{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }] }])
    const sel = useSelection(nodes, ref('checkbox'), {})

    sel.selectAll()
    const events = sel.clearSelection()

    // a/b 与级联勾选的 p 均处于选中态
    expect(events).toHaveLength(3)
    expect(Object.keys(sel.selectionKeys.value as object)).toHaveLength(0)
  })
})

describe('useSelection - single / multiple', () => {
  it('single 模式选择叶子节点', () => {
    const nodes = ref([{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }])
    const sel = useSelection(nodes, ref('single'), null)

    const result = sel.selectNode(nodes.value[0], true)
    expect(result?.type).toBe('select')
    expect(sel.isSelected(nodes.value[0])).toBe(true)
  })

  it('文件夹节点不可被选中', () => {
    const nodes = ref([{ key: 'p', label: 'P', children: [{ key: 'a', label: 'A' }] }])
    const sel = useSelection(nodes, ref('single'), null)

    expect(sel.selectNode(nodes.value[0], true)).toBeNull()
    expect(sel.isSelected(nodes.value[0])).toBe(false)
  })

  it('multiple 模式累加选择', () => {
    const nodes = ref([{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }])
    const sel = useSelection(nodes, ref('multiple'), [])

    sel.selectNode(nodes.value[0], true)
    sel.selectNode(nodes.value[1], true)
    expect(sel.selectedCount.value).toBe(2)
  })
})
