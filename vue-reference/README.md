# new-order-app Vue 参考实现

本目录为 `new-order-app` 项目的 **Vue3 + TypeScript + Vite 参考实现**，初始迁移自 React 参考实现（`src/features/work-order-budget/`，CR-20260629-001），后续经多轮迭代优化（截至 CR-20260703-001）。

## 定位

- 供正式 App Vue 工程参考样式、交互、页面结构和状态管理方案
- 不作为正式 App 生产代码
- 独立工程，与父目录 React 代码无依赖关系

## 技术栈

- Vue 3.5 + TypeScript
- Vite 8
- Vue Router 4（Hash 模式）
- Pinia（状态管理）
- Tailwind CSS 4

## 页面清单

| 路由 | 页面 | 说明 |
|------|------|------|
| `/create` | 发起工单入口页 | 物流/客服/产品申请三个入口 + 底部 Tab |
| `/my` | 我的列表页 | 搜索+Tab+筛选+键值对卡片 |
| `/team` | 组内页 | 未开通占位 |
| `/product-apply/create` | 产品申请发起页 | 预算/申请信息/产品申请订单明细/附件/提交 |
| `/product-apply/budget-select` | 预算选择页 | 搜索过滤+预算卡片 |
| `/product-apply/store-select` | 专卖店搜索页 | 搜索+列表+回填 |
| `/product-apply/product-select` | 产品搜索页 | 搜索+卡片+回填 |
| `/product-apply/detail/:id` | 详情页 | 基础信息/审批流/订单结果/审批操作 |

## 开发命令

```bash
npm install      # 安装依赖
npm run dev      # 开发服务器
npm run build    # 生产构建
npm run preview  # 预览构建
```

## 关联文档

所有变更清单与开发总结位于父目录 `docs/` 下：

- 变更清单：`../docs/change-logs/`
- 开发总结：`../docs/development-summary/`
- 页面规则文档：`../docs/product/work-order-budget/产品申请工单创建页面规则明细.md`（创建页正式规则明细）、`../docs/product/work-order-budget/产品申请工单选择预算页面规则明细.md`（预算选择页正式规则明细）
- 最新迭代：CR-20260703-002（创建链路收尾 + 专卖店选择页1:1回归 + 文案口径统一）已完成，前置 CR-20260703-001（选择链路优化 + 驳回后重提 + xlsx→exceljs + 主包瘦身）也已合并，详见 `../docs/development-summary/2026-07-03/`
