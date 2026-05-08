# app/router — 路由配置

## 说明

本目录包含应用的路由配置。

## 路由规划

### Tab 路由
- `/create` — 发起工单
- `/my` — 我的
- `/team` — 组内（未开通）

### 预算申请工单路由
- `/budget/create` — 预算申请表单
- `/budget/detail/:id` — 预算申请详情
- `/budget/approval/:id` — 预算申请审批

## 注意事项

- 本阶段只定义路由结构，不开发业务页面。
- 使用 React Router DOM 实现。
