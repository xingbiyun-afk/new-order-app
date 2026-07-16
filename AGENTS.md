# AGENTS.md

> `new-order-app` 仓库级 AI 协作入口。适用于 Codex 及其他会读取仓库指令文件的 AI 工具。

## 仓库定位

- App 参考与文档沉淀仓
- 当前主实现目录：`vue-reference/`
- 历史 React 归档目录：`legacy/react-reference/`

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

## 更新记录

| 日期 | 变更单 | 变更类型 | 变更摘要 |
|------|--------|----------|----------|
| 2026-07-16 | AI-20260716-001 | 新增 | 为 `new-order-app` 增加 GitNexus MCP 协作入口，明确 `vue-reference/` 为默认查询目标，历史 React 归档默认降权 |
