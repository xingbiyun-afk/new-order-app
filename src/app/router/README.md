# app/router — 路由配置

## 说明

本目录包含应用的路由配置。

## 路由规划

### Tab 路由
- `/create` — 发起工单
- `/my` — 我的
- `/team` — 组内（未开通）

### 产品申请工单路由
- `/product-apply/create` — 发起页（预算信息/申请信息/产品申请订单明细/附件/批量导入/提交）
- `/product-apply/budget-select` — 预算选择页（搜索过滤+预算卡片+异常提示）
- `/product-apply/store-select` — 专卖店搜索选择页（搜索+列表+回填）
- `/product-apply/product-select` — 产品搜索选择页（搜索+卡片+回填）
- `/product-apply/detail/:id` — 详情页（基础信息/发起信息/审批流/订单结果/审批操作）

## 注意事项

- 以上路由为 React 仓参考实现，正式 Vue 工程按实际路由规范重新配置。
- 产品申请工单 P0+P1 已完整实现，非占位状态。
- 使用 React Router DOM 实现。
