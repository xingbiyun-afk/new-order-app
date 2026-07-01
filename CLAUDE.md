# CLAUDE.md — AI 协作指南

> ⚠️ **IMPORTANT / 当前主工程强提示**  
> 1. **当前正式开发方向是 Vue / Vue3，主实现目录为 `vue-reference/`。**  
> 2. **不得仅依据 `legacy/react-reference/` 下的 React 工程文件判定当前主技术栈为 React。**  
> 3. 根目录历史 React + TypeScript + Vite 工程**已归档至 `legacy/react-reference/`**，不是当前开发基线。  
> 4. 当前所有功能开发应在 `vue-reference/` 中进行。  
> 5. 根目录默认脚本 `npm run dev` / `npm run build` 已指向 Vue。  
> 6. 详见 [`CURRENT_TECH_STACK.md`](./CURRENT_TECH_STACK.md)。

> 必读：所有 AI 工具在执行需求前，必须先阅读 `docs/ai/项目协作基线.md`。  
> 如本文档与 `docs/ai/项目协作基线.md` 冲突，以项目协作基线为准。

## 当前最高优先级口径

请所有 AI 工具，包括 Kimi、Codex、Trae、ChatBox 等，优先遵守以下口径：

1. 当前正式业务对象为“产品申请工单 / 产品申请预算核销”。
2. 旧“预算申请工单”仅为历史口径，不作为后续正式需求命名。
3. App 端正式开发按 Vue 框架体系推进，具体版本以正式 App 工程为准。
4. Web 端正式开发按 Vue2 框架推进。
5. 当前 React + Vite 初始化内容仅作为移动端样式、交互和结构参考。
6. 不得继续基于 React/shadcn/ui 假设正式 App 实现。
7. 预算责任人、主责、备责、待调整、责任人异常影响预算核销等概念均已废弃。
8. 发起人与审批人规则来源于“产品申请审批流程管理”。
9. `applicationAvailable` 是预算核销可用标识。
10. `isAbnormal` 仅表示组织异常相关影响标识，不等于预算不可核销。

## 项目上下文

本仓库为工单 App 前端原型与文档沉淀仓。根目录历史 React + TypeScript + Vite 工程已归档至 `legacy/react-reference/`，仅作为早期移动端样式、交互和结构参考，不作为正式 App 生产实现基线。当前默认开发入口为 Vue（`vue-reference/`）。

### 跨端复用背景

本系统工单存在 **App 端**和 **Web 端**两端：
- **App 端**：移动端 H5，现有工单样式的主要参考来源。
- **Web 端**：除"工单查询"页面使用 Web 管理后台查询表格样式外，"发起工单、待办、已办、抄送我的、已发起"等页面基本直接套用移动端工单样式和交互。

**因此，App 端移动样式将作为 Web 端非查询类工单页面的复用参考。** 组件和样式设计时需兼顾两端一致性。

## 核心约定

### 状态字段
- 不定义正式状态枚举（工单状态、审批状态等）。
- 原型中如需使用状态，仅使用展示字段：`displayStatus`、`approvalStatusText`、`flowStatusText` 等。
- 状态值直接使用字符串，不建 TypeScript enum。

### 样式约定
- 主色：`#22BDB8`（青绿色）。
- 页面背景：浅灰色。
- 卡片样式：白底圆角。
- 移动端优先，所有组件按 H5 场景设计。
- 基础变量定义在 `vue-reference/src/styles/variables.css`。
- 移动端适配基础在 `vue-reference/src/styles/mobile.css`。

### 组件约定
- 当前 Vue 参考实现（`vue-reference/`）使用自建组件体系。历史 React 原型中使用的 shadcn/ui 仅作为参考，正式 Vue 实现应以正式 Vue 工程选型为准，不直接照搬 React 组件库。
- 业务组件放在各自 feature 的 `components/` 下。
- 共享组件放在 `vue-reference/src/components/` 下。

### 页面路由（参考实现）
| 路由 | 页面 | 说明 |
|------|------|------|
| `/product-apply/create` | 发起页 | 预算信息/申请信息/产品申请订单明细/附件/提交 |
| `/product-apply/budget-select` | 预算选择页 | 搜索过滤+预算卡片+异常提示 |
| `/product-apply/store-select` | 专卖店搜索选择页 | 搜索+列表+回填 |
| `/product-apply/product-select` | 产品搜索选择页 | 搜索+卡片+回填（P1-01） |
| `/product-apply/detail/:id` | 详情页 | 基础信息/发起信息/审批流/订单结果/审批操作 |
| `/create` | 发起工单入口页 | 物流/客服/产品申请三个入口 |
| `/my` | 我的列表页 | 待办/已办/抄送我的/已发起+键值对卡片 |

> 以上路由为 React 仓参考实现路由，正式 Vue 工程需按实际路由规范重新配置。

### Mock 约定
- 不写复杂 Mock。
- Mock 数据仅用于构建验证和最小化展示。
- 不接 API，后续对接时统一在 `services/` 层处理。

### 代码规范
- 使用 TypeScript，为所有 props 和返回值定义类型。
- 使用路径别名 `@/` 引用项目文件。
- 功能模块按 feature 目录组织。
- 每个 feature 自包含：pages、components、services、hooks、mocks、types、utils。

## 文件组织

```
vue-reference/                 # 当前主实现目录（Vue3）
├── src/
│   ├── views/                 # 页面组件
│   ├── stores/                # Pinia Store
│   ├── router/                # Vue Router
│   ├── types/                 # TypeScript 类型
│   ├── mocks/                 # Mock 数据
│   └── components/            # 共享组件
├── vite.config.ts
└── package.json

legacy/react-reference/        # 历史 React 参考（归档，非当前主工程）
├── src/
│   ├── app/
│   │   ├── router/
│   │   └── layout/
│   ├── features/
│   │   ├── work-order-center/
│   │   └── work-order-budget/
│   │       ├── pages/
│   │       ├── types/
│   │       ├── mocks/
│   │       └── hooks/
│   ├── shared/
│   └── styles/
├── index.html
├── vite.config.ts
└── package.json
```

## 当前最新业务口径

根据 new-order-system 最新现行文档，当前口径已调整：

1. 旧“预算申请工单”口径调整为“产品申请工单 / 产品申请预算核销”。
2. 产品申请工单主要用于预算核销。
3. 预算责任人体系已下线，不再使用主责、备责、责任人异常等概念。
4. 发起人和审批人规则来源于“产品申请审批流程管理”。
5. 预算状态仅包含：草稿、已生效、已作废、已到期。
6. 不存在“待调整”状态。
7. `applicationAvailable` 是预算核销可用标识。
8. `isAbnormal` 仅表示组织异常相关影响标识，不等于预算不可核销。
9. 后续正式 App 开发按 Vue 框架体系推进。
10. 当前 React/Vite 初始化仅作为移动端样式与结构参考。

如本文档中历史内容与以上口径冲突，以上述口径为准。

## 产品申请工单 / 预算核销当前已确认规则

### 工单流转规则
1. 产品申请工单没有草稿状态，填写完成即提交。
2. 提交后主状态为"处理中"。
3. 中间多个处理/审批环节未驳回时，主状态仍统一显示"处理中"。
4. 最终通过后主状态为"已结束"。
5. 任一处理/审批环节驳回后，主状态为"已驳回"，并直接驳回到发起人。
6. 被驳回工单编号不能复用。
7. 发起人可基于被驳回工单信息重新填入新工单，或直接创建空白新工单；两种方式都会生成新的工单编号。
8. 发起人提交后，工单出现在"我的 - 已发起"。
9. 当前处理人可在"我的 - 待办"看到工单。
10. 未流转到的后续处理人/审批人不可见。
11. 处理人操作后，无论通过还是驳回，工单出现在"我的 - 已办"。
12. 本期产品申请工单不考虑"抄送我的"。
13. 列表卡片暂不展示当前节点摘要，当前节点进入详情查看。
14. 详情页展示具体流转节点。
15. 处理按钮文案暂定为"通过 / 驳回"。
16. 状态文案使用 `displayStatus` 等展示字段，不定义正式状态枚举。

### 预算核销规则
1. 提交产品申请工单进入审批流时，占用预算；
2. 审批中进入申请中金额；
3. 驳回后释放申请中金额；
4. 审批通过后申请中金额转为已用金额；
5. 审批通过即完成预算核销；
6. 后续订单失败不自动回滚预算核销；

### 功能订单预占规则
1. 提交后同时生成功能订单预占库存；
2. 审批通过或驳回后取消功能订单并释放库存；

### 订单生成规则
1. 审批通过后按客户层级生成产品申请表订单或内部申请表订单；
2. 客户层级 6 → 产品申请表订单；
3. 客户层级 0-4 → 内部申请表订单。


详细流程规则参考：`docs/product/work-order-budget/process-and-status-rules.md`

## 跨页面状态传递方案（参考实现）

### React 历史参考实现（legacy/react-reference/）

发起页 → 选择页 → 发起页的跳转中，使用以下方案：

1. **URL Search Params**：传递 `budgetId`、`storeCode`、`storeName`、`groupId`、`productCode`
   - 发起页通过 `useSearchParams` 读取参数并回填
   - 选择完成后通过 `navigate('/product-apply/create?budgetId=xxx')` 返回
2. **sessionStorage**：持久化 `storeGroups` 状态
   - 解决页面重新挂载时 `groupId` 不一致的问题
   - 使用 `useState(() => { sessionStorage.getItem(...) })` 初始化

### Vue 参考实现（vue-reference/）

1. **URL Search Params**：传递 `budgetId`、`storeCode`、`storeName`、`groupId`、`productCode`
   - 发起页通过 `watch(() => route.query, ...)` 监听参数变化并回填
   - 必须设置 `immediate: true` 确保组件挂载时立即检查 URL 参数
   - 回填完成后 `router.replace({ query: {} })` 清除参数
2. **Pinia Store + sessionStorage**：
   - `storeGroups` 存于 Pinia Store，变更时同步到 sessionStorage
   - 组件挂载时从 sessionStorage 恢复分组状态
   - `selectedBudget`、`collapsedGroups` 等状态统一管理于 Pinia Store
3. **确认弹窗交互**（CR-20260630-002 / CR-20260630-004）：
   - 切换预算前：若已填写分组或商品，弹出确认提示，确认后清空现有分组、商品明细**及折叠状态**（`store.clearCollapsed()`）
   - 清空专卖店前：弹出确认提示，确认后同步清空该分组下的商品明细
   - 已选专卖店支持重新选择：点击已选专卖店字段区域仍可进入搜索页改选（不限制未选状态）
4. **发起页命名口径**（CR-20260701-001）：
   - UI 中统一使用"产品申请订单明细"替代"专卖店申请分组"
   - "产品"替代"商品"（产品明细 / 添加产品 / 产品数量）
   - 申请信息区预算未选时压缩为仅显示申请人一行
   - 附件区使用 `(X/10)` 格式显示上传数量，始终可见
   - 附件区包含 PDF 合并建议提示："建议将照片和扫描件合并为一份 PDF 上传"
5. **提交校验**：
   - 提交前校验整单金额不超过预算可用金额
   - 超限时 Toast 提示拦截，不提交
6. **批量导入**（CR-20260701-002）：
   - 整单级"批量导入产品"按钮入口
   - 支持文本粘贴导入（逗号/空格/Tab 分隔）和 Excel/CSV 文件导入
   - 硬拦截校验全有或全无：产品编号/数量/专卖店编号任一无效则整次失败
   - 软警告：数量超限允许导入但提交时拦截
   - 按专卖店编号自动拆分明细
   - 已有数据时覆盖确认弹窗
   - CSV 模板下载（UTF-8 BOM，含表头 + 示例数据）

> 以上方案为参考实现中的具体做法。正式 Vue 工程应根据实际状态管理选型重新设计。

## 注意事项

- "组内"入口当前未开通，不纳入本期功能范围，只保留视觉说明。
- 产品申请工单除表单内容、预算核销信息、审批/流转规则不同外，展示风格和流程沿用现有工单样式。
- 当前仓库主要用于沉淀移动端样式、交互结构和产品申请预算核销需求文档，不在当前 React 仓中推进正式业务页面开发。
- 样式设计需考虑 Web 端复用，参考 `docs/technical/cross-end-work-order-ui-strategy.md`。
- 页面滚动需确保 `.page-content` 设置 `overflow-y: auto` 和 `-webkit-overflow-scrolling: touch`。
