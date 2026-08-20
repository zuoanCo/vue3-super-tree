// 移除源码中的 console.log(...) 调试语句（支持多行调用、字符串/模板字面量内的括号）
// 保留 console.error / console.warn（真实错误路径）
import fs from 'node:fs'
import path from 'node:path'

const targets = [
  'src/components/Tree.vue',
  'src/components/TreeNode.vue',
  'src/composables/useDragDrop.ts',
  'src/composables/useCrossTreeManager.ts',
  'src/composables/useCrossTreeDragState.ts',
  'src/composables/useTreeState.ts',
  'src/composables/useSelection.ts',
  'src/composables/useFilter.ts',
  'src/composables/useFocus.ts',
  'src/composables/useTheme.ts',
  'src/lib/utils.ts',
  'src/lib/themes.ts',
  'src/lib/index.ts'
]

function stripConsoleLog(src) {
  let out = ''
  let i = 0
  let removed = 0

  while (i < src.length) {
    const idx = src.indexOf('console.log(', i)
    if (idx === -1) {
      out += src.slice(i)
      break
    }

    // 丢弃该行 console.log 前的缩进（保留此前内容到行首）
    let prefixEnd = idx
    const lineStart = src.lastIndexOf('\n', idx) + 1
    if (src.slice(lineStart, idx).trim() === '') {
      prefixEnd = lineStart
    }
    out += src.slice(i, prefixEnd)

    // 扫描到与之匹配的右括号
    let j = idx + 'console.log('.length
    const stack = ['('] // '(' 深度栈，'${' 标记模板表达式
    let state = 'code' // code | single | double | template | linecomment | blockcomment

    while (j < src.length && stack.length > 0) {
      const c = src[j]
      const n = src[j + 1]

      if (state === 'code') {
        if (c === "'") state = 'single'
        else if (c === '"') state = 'double'
        else if (c === '`') state = 'template'
        else if (c === '/' && n === '/') state = 'linecomment'
        else if (c === '/' && n === '*') state = 'blockcomment'
        else if (c === '(') stack.push('(')
        else if (c === '{') stack.push('{')
        else if (c === ')') stack.pop()
        else if (c === '}') {
          const top = stack.pop()
          if (top === '${') state = 'template'
        }
      } else if (state === 'single') {
        if (c === '\\') j++
        else if (c === "'") state = 'code'
      } else if (state === 'double') {
        if (c === '\\') j++
        else if (c === '"') state = 'code'
      } else if (state === 'template') {
        if (c === '\\') j++
        else if (c === '`') state = 'code'
        else if (c === '$' && n === '{') {
          stack.push('${')
          state = 'code'
          j++
        }
      } else if (state === 'linecomment') {
        if (c === '\n') state = 'code'
      } else if (state === 'blockcomment') {
        if (c === '*' && n === '/') {
          state = 'code'
          j++
        }
      }
      j++
    }

    // 吃掉可选的分号与紧邻的一个换行
    while (j < src.length && (src[j] === ' ' || src[j] === '\t' || src[j] === ';')) j++
    if (src[j] === '\r') j++
    if (src[j] === '\n') j++

    removed++
    i = j
  }

  return { code: out, removed }
}

let total = 0
for (const rel of targets) {
  const file = path.resolve(rel)
  if (!fs.existsSync(file)) continue
  const src = fs.readFileSync(file, 'utf8')
  const { code, removed } = stripConsoleLog(src)
  if (removed > 0) {
    fs.writeFileSync(file, code)
    console.log(`${rel}: 移除 ${removed} 处 console.log`)
    total += removed
  }
}
console.log(`共移除 ${total} 处`)
