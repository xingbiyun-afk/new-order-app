# approval-shared — 审批共享模块

## 说明

审批共享模块包含审批流程的共享组件和逻辑，如审批节点展示、审批意见输入等。

## 目录结构

```
approval-shared/
├── README.md
├── pages/         # 共享页面
├── components/    # 共享组件（审批节点、意见输入等）
├── services/      # API 服务（预留）
├── hooks/         # 自定义 Hooks
├── mocks/         # Mock 数据（预留）
├── types/         # 类型定义
└── utils/         # 工具函数
```

## 注意事项

- 本阶段只初始化目录，不实现共享组件。
- 后续由 `work-order-budget` 和其他需要审批的模块共用。
- 状态使用展示字段：`approvalStatusText`、`flowStatusText`。
