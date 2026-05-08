# 模块结构说明

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
│   ├── work-order-budget/    # 预算申请工单（本期新增）
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

## 模块说明

### work-order-center（工单中心）
已有功能模块，包含发起工单页、我的页等。

### work-order-budget（预算申请工单）
本期新增模块，包含预算申请表单、详情等页面。

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
