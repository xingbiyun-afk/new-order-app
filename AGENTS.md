# AGENTS.md

> `new-order-app` 仓库级 AI 协作入口。适用于 Codex 及其他会读取仓库指令文件的 AI 工具。

## 仓库定位

- App 参考与文档沉淀仓
- 当前主实现目录：`vue-reference/`
- 历史 React 归档目录：`legacy/react-reference/`

## 新会话第一步

- 新会话进入本仓后，先阅读本文件
- 再阅读 `docs/ai/会话启动卡.md`
- 如任务涉及技术栈和承接边界，再继续进入 `CURRENT_TECH_STACK.md`、`CLAUDE.md` 和交接文档

## 工作区协同关系

- 兄弟仓库：`../new-order-system`
- `../new-order-system` 是正式 Web 承接仓
- 涉及 App 到 Web 的承接一致性时，不要只看本仓；默认要把 `vue-reference/` 和 `../new-order-system` 一起核对

## GitNexus MCP 默认规则

处理本仓任务时，以下动作默认先走 GitNexus：

- 查 `vue-reference/` 的页面、路由、类型、Pinia、Mock、规则落点
- 对照 `new-order-system` 的 Web 承接实现是否漏承接、误承接或口径漂移
- 评估发起页、预算选择页、列表页、详情页等规则改动影响

## 默认查询顺序

1. 优先查询 `vue-reference/`
2. 仅在明确要求回溯历史原型时再查看 `legacy/react-reference/`
3. 再阅读 `CURRENT_TECH_STACK.md`、`CLAUDE.md`、`docs/ai/项目协作基线.md`

## 目录优先级

### 高优先级

- `vue-reference/`
- `docs/product/`
- `docs/ai/`
- `CURRENT_TECH_STACK.md`
- `交付说明与承接清单.md`

### 默认降权

- `legacy/react-reference/`
- 仅保留历史背景作用的旧 React 代码与说明

## 多工具统一要求

- **Codex**：优先读取本文件，再结合 `CURRENT_TECH_STACK.md`、`CLAUDE.md` 与 `docs/ai/项目协作基线.md`
- **Kimi / Trae / Workbuddy / Qoder**：优先读取 `CLAUDE.md` 与 `docs/ai/项目协作基线.md`，并把本文件中的跨仓约束一并纳入
- 所有工具在输出方案、改代码、改文档前，都应先把 GitNexus 结论与现行文档口径交叉核对
- 如果任务涉及承接一致性、影响范围、共享规则落点，默认要同时检查：
  - `new-order-app/vue-reference/`
  - `new-order-system`

## 更新记录

| 日期 | 变更单 | 变更类型 | 变更摘要 |
|------|--------|----------|----------|
| 2026-07-16 | AI-20260716-001 | 新增 | 为 `new-order-app` 增加 GitNexus MCP 协作入口，明确 `vue-reference/` 为默认查询目标，历史 React 归档默认降权 |
| 2026-07-16 | AI-20260716-002 | 补充 | 同步工作区级 AGENTS 里的双仓协同关系与多工具统一要求，避免只打开本仓时丢失跨仓承接上下文 |
| 2026-07-16 | AI-20260716-003 | 补充 | 增加会话启动卡入口，减少新开 AI 会话时反复解释主实现目录、历史归档和双仓协同关系 |
