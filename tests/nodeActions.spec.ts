import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Tree from '../src/components/Tree.vue'
import type { TreeNode } from '../src/lib/types'

const sample = (): TreeNode[] => ([
  { key: '1', label: '文件夹', children: [{ key: '1-1', label: '子节点' }] },
  { key: '2', label: '叶子' }
])

describe('Tree - 节点操作按钮 (nodeActions / #actions)', () => {
  it('渲染声明式操作按钮', () => {
    const wrapper = mount(Tree, {
      props: {
        value: sample(),
        nodeActions: [{ key: 'del', label: '删除', onClick: () => {} }]
      }
    })
    expect(wrapper.find('.p-tree-node-actions').exists()).toBe(true)
    expect(wrapper.findAll('.p-tree-node-action').length).toBeGreaterThan(0)
  })

  it('点击按钮调用 onClick 且不触发节点选中', async () => {
    const onClick = vi.fn()
    const wrapper = mount(Tree, {
      props: {
        value: sample(),
        selectionMode: 'single',
        nodeActions: [{ key: 'del', label: '删除', onClick }]
      }
    })

    await wrapper.find('.p-tree-node-action').trigger('click')

    expect(onClick).toHaveBeenCalledTimes(1)
    expect((onClick.mock.calls[0][0] as TreeNode).key).toBe('1')
    expect(wrapper.emitted('node-select')).toBeFalsy()
  })

  it('visible 函数控制按钮按节点显示', () => {
    const wrapper = mount(Tree, {
      props: {
        value: sample(),
        expandedKeys: { '1': true },
        nodeActions: [{
          key: 'append',
          label: '添加',
          visible: (node: TreeNode) => !!node.children,
          onClick: () => {}
        }]
      }
    })

    // expandedKeys 受控传入后，子节点可见；按钮只应出现在有 children 的节点上
    const buttons = wrapper.findAll('.p-tree-node-action')
    expect(buttons.length).toBe(1)
    expect(buttons[0].element.closest('.p-tree-node-content')?.textContent).toContain('文件夹')
  })

  it('disabled 按钮不触发 onClick', async () => {
    const onClick = vi.fn()
    const wrapper = mount(Tree, {
      props: {
        value: sample(),
        nodeActions: [{ key: 'del', label: '删除', disabled: true, onClick }]
      }
    })

    await wrapper.find('.p-tree-node-action').trigger('click')
    expect(onClick).not.toHaveBeenCalled()
  })

  it('#actions 插槽完全自定义操作区域', () => {
    const wrapper = mount(Tree, {
      props: { value: sample() },
      slots: {
        actions: `<template #actions="{ node }"><button class="custom-action">{{ node.label }}-操作</button></template>`
      }
    })
    expect(wrapper.find('.custom-action').exists()).toBe(true)
  })

  it('点击节点本身仍然触发选中（操作按钮不影响原有交互）', async () => {
    const wrapper = mount(Tree, {
      props: {
        value: [{ key: '1', label: '叶子' }],
        selectionMode: 'single',
        nodeActions: [{ key: 'del', label: '删除', onClick: () => {} }]
      }
    })

    await wrapper.find('.p-tree-node-content').trigger('click')
    expect(wrapper.emitted('update:selectionKeys')).toBeTruthy()
  })
})
