# new-order-app Vue 参考实现

本目录为 `new-order-app` 项目的 **Vue3 + TypeScript + Vite 参考实现**，初始迁移自 React 参考实现（`src/features/work-order-budget/`，CR-20260629-001），后续经多轮迭代优化（截至 CR-20260706-004）。

## 定位

- 供正式 App Vue 工程参考样式、交互、页面结构和状态管理方案
- 不作为正式 App 生产代码
- 独立工程，与父目录 React 代码无依赖关系

## 技术栈

- Vue 3.5 + TypeScript
- Vite 5.4（参考实现阶段因沙盒环境限制从 Vite 8 降级，生产环境可恢复）
- Vue Router 4（Hash 模式）
- Pinia（状态管理）
- 基础 CSS（`@tailwindcss/vite` 已在 CR-20260703-003 中移除，项目组件未使用 Tailwind utility class）

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
| `/product-apply/detail/:id` | 详情页 | 状态驱动首屏差异化（处理中/已驳回/已结束）；审批流节点字段化+视觉区分；预占订单仅在发起节点 chip 展示，订单结果区不承接预占订单；失败原因去重；折叠重试历史；区块顺序：状态→驳回/审批进度→基础→发起→预算→明细→附件→审批流/订单结果→操作；订单结果区展示实际专卖店（橙色警告）+ 订单备注（灰色斜体）；失败原因类型明确（产品库存不足/专卖店下单标识关闭/订单审核驳回草稿）；Mock 11 场景覆盖（id 1-11）；移除导航栏状态字；`scrollBehavior` 修复列表→详情不继承滚动位置；详情页规则以《产品申请工单详情页面规则明细.md》为直接执行依据 |

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
- 页面规则文档：`../docs/product/work-order-budget/产品申请工单创建页面规则明细.md`（创建页正式规则明细）、`../docs/product/work-order-budget/产品申请工单选择预算页面规则明细.md`（预算选择页正式规则明细）、`../docs/product/work-order-budget/产品申请工单详情页面规则明细.md`（详情页正式规则明细）
- 最新迭代：CR-20260707-001（详情页现行规则口径统一、协作文档收口），详见 `../docs/development-summary/2026-07-07/`
- 前序迭代：CR-20260706-004（订单结果区专卖店变更、失败原因类型、备注显示），详见 `../docs/development-summary/2026-07-06/`
