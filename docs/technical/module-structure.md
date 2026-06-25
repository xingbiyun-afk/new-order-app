# 模块结构说明

> 当前说明：
> 本文档记录的是 new-order-app 早期 React/Vite 原型目录结构。
> 根据最新项目口径，正式 App 开发按 Vue 框架体系推进。
> 因此本文档仅作为移动端模块拆分和职责边界参考，不作为正式 Vue 工程目录强约束。

## 目录结构

```
src/
├── app/                       # 应用层
│   ├── router/               # 路由配置
│   │   └── README.md
│   └── layout/               # 布局组件
│       └── README.md
├── features/                  # 功能模块
│   ├── work-order-center/    # 工单中心（已有）
│   │   ├── README.md
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── mocks/
│   │   ├── types/
│   │   └── utils/
│   ├── work-order-budget # 历史命名目录，现行对应产品申请工单 / 产品申请预算核销
│   │   ├── README.md
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── mocks/
│   │   ├── types/
│   │   └── utils/
│   ├── budget-shared/        # 预算业务共享模块
│   │   ├── README.md
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── mocks/
│   │   ├── types/
│   │   └── utils/
│   └── approval-shared/      # 审批共享模块
│       ├── README.md
│       ├── pages/
│       ├── components/
│       ├── services/
│       ├── hooks/
│       ├── mocks/
│       ├── types/
│       └── utils/
├── shared/                    # 共享资源
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   ├── types/
│   └── services/
├── assets/                    # 静态资源
└── styles/                    # 全局样式
    ├── variables.css
    ├── reset.css
    └── mobile.css
```

## 正式 Vue 工程建议模块映射

Web 端 Vue2 工程可根据既有工程规范映射为 views / components / api / store / utils。
App 端 Vue 工程以正式 App 工程目录规范为准。

| 当前原型目录 | 正式 Vue 工程建议模块 |
|---|---|
| work-order-center | 工单处理中心基础页面 |
| work-order-budget | 产品申请工单 / 产品申请预算核销 |
| budget-shared | 预算核销共享能力 |
| approval-shared | 审批流共享能力 |

## 模块说明

### work-order-center（工单中心）
已有功能模块，包含发起工单页、我的页等。

### work-order-budget（历史命名目录：产品申请工单 / 产品申请预算核销）
work-order-budget 为历史命名目录，承接早期预算申请工单原型。
当前阶段暂不新增独立 product-application-budget-writeoff 目录，仍在 work-order-budget 目录下承接产品申请工单 / 产品申请预算核销文档，并通过 README 明确历史命名关系。

### budget-shared（预算业务共享）
预算相关的共享组件和逻辑，如预算金额输入、预算科目选择等。

### approval-shared（审批共享）
审批流程的共享组件和逻辑，如审批节点、审批意见输入等。

## Feature 目录规范

每个 feature 目录包含以下子目录：

| 目录 | 用途 |
|------|------|
| `pages/` | 页面级组件 |
| `components/` | 模块内共享组件 |
| `services/` | API 服务（本期不接 API，预留） |
| `hooks/` | 自定义 Hooks |
| `mocks/` | Mock 数据（仅简单占位） |
| `types/` | TypeScript 类型定义 |
| `utils/` | 工具函数 |
