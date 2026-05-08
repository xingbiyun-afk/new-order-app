# AI 协作指南

## 项目上下文

本仓库为工单 App 前端，基于 React + TypeScript + Vite 构建的移动端 H5 原型。

## AI 协作约定

### 代码生成
- 使用 TypeScript，严格类型定义。
- 使用函数组件和 React Hooks。
- 使用路径别名 `@/` 引用项目文件。
- 优先使用 shadcn/ui 组件。

### 状态处理
- 不定义正式状态枚举。
- 使用展示字段：`displayStatus`、`approvalStatusText`、`flowStatusText`。
- 状态值使用字符串类型。

### 样式规范
- 主色：`#22BDB8`。
- 页面背景浅灰，卡片白底圆角。
- 移动端优先设计。
- 参考 `docs/technical/mobile-ui-baseline.md` 获取完整 UI 规范。

### 模块边界
- 按 feature 目录组织代码。
- 每个 feature 自包含 pages、components、services、hooks、mocks、types、utils。
- 共享逻辑放在 `src/shared/` 下。

### 禁止事项
- 不开发预算申请业务页面（本阶段）。
- 不开发审批页面（本阶段）。
- 不写复杂 Mock。
- 不接 API。
- 不直接推 main 分支。
