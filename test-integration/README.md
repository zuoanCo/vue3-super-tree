# Vue3 Super Tree 集成测试

这个目录包含了完整的集成测试，用于验证 Vue3 Super Tree 插件在真实项目中的可靠性。

## 测试项目结构

```
test-integration/
├── vite-project/          # Vue 3 + Vite 项目测试
├── webpack-project/       # Vue 3 + Webpack 项目测试
├── typescript-project/    # TypeScript 项目测试
├── test-cases/           # 功能测试用例
├── docs/                 # 使用指南和故障排除
└── scripts/              # 自动化测试脚本
```

## 快速开始

1. 运行所有集成测试：
```bash
npm run test:integration
```

2. 测试特定项目类型：
```bash
npm run test:vite
npm run test:webpack
npm run test:typescript
```

3. 运行跨树拖拽专项测试：
```bash
npm run test:cross-tree-drag
```

## 测试覆盖范围

- ✅ 基础树形展示
- ✅ 选择模式（单选、多选、复选框）
- ✅ 同树拖拽功能
- ✅ 跨树拖拽功能（重点测试）
- ✅ 主题切换
- ✅ TypeScript 类型检查
- ✅ 构建产物验证
- ✅ npm 包导入测试