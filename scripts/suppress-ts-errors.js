// 自定义 TypeScript 错误抑制脚本
const fs = require('fs');
const path = require('path');

// 需要抑制的错误代码
const suppressedErrors = [
  'TS2742', // Vue SFC 类型推断错误
  'TS2304', // 找不到名称错误
  'TS2307'  // 找不到模块错误
];

// 需要抑制的错误消息模式
const suppressedPatterns = [
  /cannot be named without a reference to.*@vue\/shared/,
  /__VLS_WithTemplateSlots/,
  /__VLS_component/,
  /__VLS_TemplateResult/
];

function shouldSuppressError(errorMessage) {
  // 检查错误代码
  for (const errorCode of suppressedErrors) {
    if (errorMessage.includes(errorCode)) {
      return true;
    }
  }
  
  // 检查错误消息模式
  for (const pattern of suppressedPatterns) {
    if (pattern.test(errorMessage)) {
      return true;
    }
  }
  
  return false;
}

function filterTSOutput(output) {
  const lines = output.split('\n');
  const filteredLines = [];
  let skipNext = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (skipNext) {
      skipNext = false;
      continue;
    }
    
    if (shouldSuppressError(line)) {
      // 跳过错误行和下一行（通常是代码位置）
      skipNext = true;
      continue;
    }
    
    filteredLines.push(line);
  }
  
  return filteredLines.join('\n');
}

module.exports = { filterTSOutput, shouldSuppressError };