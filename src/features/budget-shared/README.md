# budget-shared — 预算业务共享模块

## 说明

预算业务共享模块包含预算相关的共享组件和逻辑，如预算金额输入、预算科目选择等。

## 目录结构

```
budget-shared/
├── README.md
├── pages/         # 共享页面
├── components/    # 共享组件（预算金额输入、科目选择等）
├── services/      # API 服务（预留）
├── hooks/         # 自定义 Hooks
├── mocks/         # Mock 数据（预留）
├── types/         # 类型定义
└── utils/         # 工具函数
```

## 注意事项

- 本阶段只初始化目录，不实现共享组件。
- 后续由 `work-order-budget` 和其他预算相关模块共用。
