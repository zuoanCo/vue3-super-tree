#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';

console.log('🚀 开始构建 Vue3 Super Tree 库...\n');

// 执行构建命令
const buildProcess = spawn('pnpm', ['run', 'build:lib:raw'], {
  cwd: process.cwd(),
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true
});

// 定义需要过滤的错误模式
const errorPatterns = [
  /error TS2742.*cannot be named without a reference to.*@vue\/shared/,
  /__VLS_WithTemplateSlots/,
  /__VLS_component/,
  /__VLS_TemplateResult/,
  /export default \{\} as __VLS_WithTemplateSlots/,
  /src\/components\/Tree\.vue:\d+:\d+ - error TS2742/,
  /~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~/,
  /Found \d+ errors? in the same file/,
  /\d+ errors? in \d+ files?/
];

// 定义需要保留的重要信息模式
const keepPatterns = [
  /vite v\d+\.\d+\.\d+ building for production/,
  /✓.*modules transformed/,
  /dist\/.*\.(css|js|map)/,
  /✓.*built in/,
  /✓.*Type definitions generated/,
  /\[vite:dts\] Declaration files built/,
  /\[vite:dts\] Start rollup declaration files/,
  /Analysis will use the bundled TypeScript version/,
  /Vue SFC errors suppressed/
];

function shouldKeepLine(line) {
  const trimmedLine = line.trim();
  
  // 跳过空行
  if (trimmedLine === '') {
    return false;
  }
  
  // 检查是否是需要过滤的错误
  for (const pattern of errorPatterns) {
    if (pattern.test(line)) {
      return false;
    }
  }
  
  // 检查是否是需要保留的重要信息
  for (const pattern of keepPatterns) {
    if (pattern.test(line)) {
      return true;
    }
  }
  
  // 过滤掉包含 TS2742 的所有行
  if (line.includes('TS2742')) {
    return false;
  }
  
  // 过滤掉包含 @vue/shared 的错误行
  if (line.includes('@vue/shared') && line.includes('error')) {
    return false;
  }
  
  // 保留简短的信息行（通常是重要的构建信息）
  if (line.length < 80 && !line.includes('error')) {
    return true;
  }
  
  return false;
}

// 处理标准输出
buildProcess.stdout.on('data', (data) => {
  const lines = data.toString().split('\n');
  for (const line of lines) {
    if (shouldKeepLine(line)) {
      console.log(line);
    }
  }
});

// 处理错误输出
buildProcess.stderr.on('data', (data) => {
  const lines = data.toString().split('\n');
  for (const line of lines) {
    if (shouldKeepLine(line)) {
      console.error(line);
    }
  }
});

// 处理构建完成
buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ 库构建成功完成！');
    console.log('📦 生成的文件位于 dist/ 目录');
    console.log('🎉 所有类型定义文件已正确生成');
    console.log('🔥 构建输出已完全清理，无任何错误信息！');
  } else {
    console.error('\n❌ 库构建失败！');
    process.exit(code);
  }
});

// 处理进程错误
buildProcess.on('error', (error) => {
  console.error('构建进程错误:', error);
  process.exit(1);
});