# new-order-app

工单 App 前端仓库 —— 预算申请工单模块

## 项目定位

本仓库是工单 App 前端仓库，当前用于在现有"工单处理中心"移动端样式基础上新增"预算申请工单"入口、表单、详情和审批原型。

> **跨端说明**：本系统工单存在 App 和 Web 两端。App 端移动样式将作为 Web 端非查询类工单页面（发起工单、待办、已办、抄送我的、已发起等）的复用参考。Web 端"工单查询"页面使用独立的管理后台表格样式。

## 重要背景

1. 当前 App 已有"工单处理中心"移动端样式。
2. 发起工单页已有"物流工单""客服工单"，本期新增"预算申请工单"。
3. 我的页已有搜索框、待办/已办/抄送我的/已发起 Tab、全部工单筛选、工单卡片列表。
4. "组内"入口未开通，不纳入本期功能范围，只保留视觉说明。
5. 预算申请工单除表单内容不同外，展示风格和流程应尽量沿用现有工单样式。
6. 本阶段只初始化工程和目录，不开发具体业务页面。
7. 不定义正式工单状态、审批状态、功能订单状态、产品申请订单状态。
8. 原型中后续如需状态，只使用 displayStatus、approvalStatusText、flowStatusText 等展示字段。

## 技术栈

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 3.4
- shadcn/ui
- React Router DOM（后续路由扩展）

## 项目结构

```
├── docs/                    # 项目文档
│   ├── ai/                  # AI 协作指南
│   ├── branch/              # 分支管理规范
│   ├── workflow/            # 工作流程指南
│   ├── product/             # 产品文档
│   └── technical/           # 技术文档
├── src/
│   ├── app/                 # 应用层
│   │   ├── router/          # 路由配置
│   │   └── layout/          # 布局组件
│   ├── features/            # 功能模块
│   │   ├── work-order-center/   # 工单中心（已有）
│   │   ├── work-order-budget/   # 预算申请工单（本期新增）
│   │   ├── budget-shared/       # 预算业务共享模块
│   │   └── approval-shared/     # 审批共享模块
│   ├── shared/              # 共享资源
│   ├── assets/              # 静态资源
│   └── styles/              # 样式文件
└── index.html
```

## 开发命令

```bash
npm run dev        # 开发服务器
npm run build      # 生产构建
npm run preview    # 预览构建
```

## 当前阶段

**第一阶段：工程初始化**

- 已完成：React + TypeScript + Vite 工程搭建
- 已完成：目录结构初始化
- 已完成：移动端样式基线定义
- 进行中：业务页面开发（后续阶段）
