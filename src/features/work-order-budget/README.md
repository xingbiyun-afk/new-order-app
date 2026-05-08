# work-order-budget — 预算申请工单

## 说明

预算申请工单是本期新增功能模块，用于用户发起预算申请、查看详情和审批。

## 功能范围（本期）

### 包含
- 发起工单页新增"预算申请工单"入口
- 预算申请表单页（目录占位）
- 预算申请详情页（目录占位）
- 审批相关页面（目录占位）

### 不包含
- 具体业务页面实现（本阶段只初始化目录）
- 复杂 Mock 数据
- API 对接

## 目录结构

```
work-order-budget/
├── README.md
├── pages/         # 页面组件（表单、详情、审批）
├── components/    # 模块内组件
├── services/      # API 服务（预留）
├── hooks/         # 自定义 Hooks
├── mocks/         # Mock 数据（预留）
├── types/         # 类型定义
└── utils/         # 工具函数
```

## 状态字段

- `displayStatus` — 展示状态文本
- `approvalStatusText` — 审批状态文本
- `flowStatusText` — 流程状态文本

## 样式说明

除表单内容不同外，展示风格和流程沿用现有工单样式。
参考 `docs/technical/mobile-ui-baseline.md`。
