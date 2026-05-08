# CLAUDE.md — AI 协作指南

## 项目上下文

本仓库为工单 App 前端，基于 React + TypeScript + Vite 构建的移动端 H5 原型。

### 跨端复用背景

本系统工单存在 **App 端**和 **Web 端**两端：
- **App 端**：移动端 H5，现有工单样式的主要参考来源。
- **Web 端**：除"工单查询"页面使用 Web 管理后台查询表格样式外，"发起工单、待办、已办、抄送我的、已发起"等页面基本直接套用移动端工单样式和交互。

**因此，App 端移动样式将作为 Web 端非查询类工单页面的复用参考。** 组件和样式设计时需兼顾两端一致性。

## 核心约定

### 状态字段
- 不定义正式状态枚举（工单状态、审批状态等）。
- 原型中如需使用状态，仅使用展示字段：`displayStatus`、`approvalStatusText`、`flowStatusText` 等。
- 状态值直接使用字符串，不建 TypeScript enum。

### 样式约定
- 主色：`#22BDB8`（青绿色）。
- 页面背景：浅灰色。
- 卡片样式：白底圆角。
- 移动端优先，所有组件按 H5 场景设计。
- 基础变量定义在 `src/styles/variables.css`。
- 移动端适配基础在 `src/styles/mobile.css`。

### 组件约定
- 使用 shadcn/ui 组件库作为基础。
- 业务组件放在各自 feature 的 `components/` 下。
- 共享组件放在 `src/shared/components/` 下。
- 不开发正式业务页面，只保留目录结构和占位说明。

### Mock 约定
- 不写复杂 Mock。
- Mock 数据仅用于构建验证和最小化展示。
- 不接 API，后续对接时统一在 `services/` 层处理。

### 代码规范
- 使用 TypeScript，为所有 props 和返回值定义类型。
- 使用路径别名 `@/` 引用项目文件。
- 功能模块按 feature 目录组织。
- 每个 feature 自包含：pages、components、services、hooks、mocks、types、utils。

## 文件组织

```
src/
├── app/
│   ├── router/         # 路由定义，配置页面级路由
│   └── layout/         # 布局组件（含底部 Tab 等）
├── features/
│   ├── work-order-center/   # 工单处理中心（已有功能）
│   ├── work-order-budget/   # 预算申请工单（本期新增）
│   ├── budget-shared/       # 预算业务共享模块
│   └── approval-shared/     # 审批共享模块
├── shared/             # 跨模块共享的组件、hooks、工具
├── assets/             # 图片、图标等静态资源
└── styles/             # 全局样式文件
```

## 注意事项

- "组内"入口当前未开通，不纳入本期功能范围，只保留视觉说明。
- 预算申请工单除表单内容不同外，展示风格和流程沿用现有工单样式。
- 本阶段只初始化工程和目录，不开发具体业务页面。
- 样式设计需考虑 Web 端复用，参考 `docs/technical/cross-end-work-order-ui-strategy.md`。
