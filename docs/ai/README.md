# AI 协作指南

## 当前最高优先级口径

1. 当前正式业务对象为“产品申请工单 / 产品申请预算核销”。
2. 旧“预算申请工单”仅作历史口径参考。
3. 当前 React/Vite 初始化仅作为移动端样式和结构参考。
4. App 端正式开发按 Vue 框架体系推进，具体版本以正式 App 工程为准。
5. Web 端正式开发按 Vue2 框架推进。
6. 不得恢复预算责任人、主责、备责、待调整等旧概念。
7. 不得自行定义正式状态枚举。
8. 开发承接 AI 可能包括 Kimi、Codex、Trae、ChatBox 等，所有 AI 均应遵循本文件和 CLAUDE.md 的最新口径。

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
- 不基于旧“预算申请工单”口径开发页面（本阶段）。
- 不开发审批页面（本阶段）。
- 不写复杂 Mock。
- 不接 API。
- 不直接推 main 分支。

## 必读文档

| 文档 | 说明 |
|---|---|
| `docs/ai/项目协作基线.md` | App 仓库项目级协作基线，所有 AI 工具执行任务前必须阅读 |
| `CLAUDE.md` | AI 快速入口 |
| `docs/technical/mobile-ui-baseline.md` | 移动端样式基线 |
| `docs/technical/cross-end-work-order-ui-strategy.md` | 跨端工单 UI 复用策略 |
| `docs/product/work-order-budget/README.md` | 产品申请工单 / 预算核销产品文档入口 |

如 README、CLAUDE、历史文档与《项目协作基线》冲突，以《项目协作基线》为准。
