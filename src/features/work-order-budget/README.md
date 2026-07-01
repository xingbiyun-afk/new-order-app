# work-order-budget — 产品申请工单 / 产品申请预算核销

## 说明

产品申请工单是本期新增功能模块，用于用户发起产品申请（预算核销）、查看详情和审批。

> 历史说明：早期命名为"预算申请工单"，已按当前口径统一调整为"产品申请工单 / 产品申请预算核销"。

## 已实现功能（P0+P1）

### 发起页 (`create`)
- 申请信息区：预算未选时压缩，选定后展开（CR-20260701-001）
- 产品申请订单明细：按专卖店拆分，支持添加/折叠/展开/清空
- 产品选择：搜索 + 卡片列表 + 数量动态校验
- 附件上传区：网格布局 + (X/10) 数量格式 + PDF 合并提示
- **批量导入**（CR-20260701-002）：文本粘贴 / Excel/CSV 文件导入 / 模板下载
- 提交校验：金额不超预算可用金额

### 预算选择页 (`budget-select`)
- 搜索过滤 + 预算卡片 + 异常状态标识

### 专卖店搜索选择页 (`store-select`)
- 搜索 + 列表选择 + 回填发起页

### 产品搜索选择页 (`product-select`)
- 搜索 + 卡片列表 + 回填（P1-01）

### 详情页 (`detail`)
- 基础信息 / 发起信息 / 审批流 / 订单结果 / 审批操作

## 目录结构

```
work-order-budget/
├── README.md
├── pages/         # 页面组件（5 个页面完整实现）
├── components/    # 模块内组件
├── services/      # API 服务（预留）
├── hooks/         # 自定义 Hooks
├── mocks/         # Mock 数据（完整实现）
├── types/         # 类型定义（含批量导入接口）
└── utils/         # 工具函数
```

## 状态字段

- `displayStatus` — 展示状态文本
- `approvalStatusText` — 审批状态文本
- `flowStatusText` — 流程状态文本

## Vue 参考实现

Vue3 参考实现位于 `vue-reference/src/views/work-order-budget/`，技术栈包括：
- Vue 3.5 + TypeScript + Pinia + Vue Router 4
- 完整迁移 5 个页面 + Pinia Store 状态管理
- 批量导入功能（mocks + types + store + CreateView）

## 样式说明

除表单内容不同外，展示风格和流程沿用现有工单样式。
参考 `docs/technical/mobile-ui-baseline.md`。
