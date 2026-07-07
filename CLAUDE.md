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
| `/product-apply/create` | 发起页 | 预算信息/申请信息/产品申请订单明细/附件/提交（CR-20260702-002 体验优化） |
| `/product-apply/budget-select` | 预算选择页 | 搜索过滤+预算卡片+标签机制+选中/不可选/空态（CR-20260702-001） |
| `/product-apply/store-select` | 专卖店搜索选择页 | 搜索栏+历史记录+行式列表+回填（CR-20260703-002 按App现有页面1:1回归） |
| `/product-apply/product-select` | 产品搜索选择页 | 搜索+卡片+回填 |
| `/product-apply/detail/:id` | 详情页 | 状态驱动首屏差异化：处理中(当前审批进度+基础+发起+预算+明细+附件+审批流+订单结果+操作) / 已驳回(驳回Banner+基础+发起+预算+明细+附件+审批流+重新发起) / 已结束(基础+发起+预算+明细+附件+订单结果+审批流) |
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
预算选择页详细规则参考：`docs/product/work-order-budget/产品申请工单选择预算页面规则明细.md`
创建页详细规则参考：`docs/product/work-order-budget/产品申请工单创建页面规则明细.md`

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

1. **URL Search Params**：传递 `budgetId`、`storeCode`、`storeName`、`groupId`、`productCode`、`rejectedFrom`
   - `rejectedFrom`：驳回后重提场景的原工单号，存在时不允许切换预算号
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
7. **发起页无草稿状态**（CR-20260702-002 §4）：
   - 发起页不支持草稿，填写完成即提交
   - 从非选择页进入且无驳回重提参数时，清空为空白态（不保留上次未提交内容）
   - 从选择页返回（budget-select/store-select/product-select）或 URL 含 `storeCode`/`productCode` 时，正常回填，不清空状态
8. **发起页信息区压缩与展开收起**（CR-20260702-002 §5）：
   - 预算信息区压缩高度（内边距/行间距缩减，归属+范围合并一行）
   - 申请信息区默认收起，仅显示申请人+申请类型摘要，点击展开查看完整信息
9. **滚动态轻量预算摘要条**（CR-20260702-002 §6）：
   - 页面滚动超过预算信息区可视范围后，顶部固定显示轻量摘要条
   - 仅展示"剩余额度"，不堆叠预算号/总额/归属等信息
10. **提交按钮前置禁用态**（CR-20260702-002 §13）：
    - 未选预算 / 未传附件 / 未填产品明细时，按钮禁用并显示对应提示文案
    - 仅当前页可直接判断的缺失项前置禁用，复杂校验仍保留在提交时
11. **明细区操作层级区分**（CR-20260702-002 §8）：
    - "添加产品申请订单"为主操作（常规新增空明细）
    - "批量导入产品"为辅助操作，视觉上降级，增加覆盖警示说明
12. **明细收起态增强**（CR-20260702-002 §9）：
    - 收起态新增分组小计金额，与专卖店名称、产品数量共同展示
13. **驳回后重新发起承接**（CR-20260703-001 §2）：
    - 冻结期原单重提：`?rejectedFrom=PAxxxxxx` 路由参数触发，`findBudgetByWorkOrderNo()` 找到原预算后 `store.selectBudget()` 带入且不允许切换预算号（`goBudgetSelect` 拦截不可切换）
    - 已到期：带入原预算，红色"已到期"提示，提交时拦截
    - 非冻结期：方案 B（按普通新建发起，不带入原预算号，用户自行选预算）
    - 完整按钮可见性 / 入口条件沉淀到详情页规则文档（本期未建）
14. **金额千分符工具**（CR-20260703-001 §6）：
    - 新增 `src/utils/format.ts::formatAmount(value)`：`toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })`
    - 替换 BudgetSelect / StoreSelect / ProductSelect / Create / Detail 共 5 个 view 的所有 `.toFixed(2)` 调用
15. **批量导入依赖替换**（CR-20260703-001 §7/§8）：
    - `xlsx@0.18.5` → `exceljs@4.4.0`（`npm audit` high → moderate，剩 2 个 `uuid<11.1.1` 传递依赖）
    - `parseFileImport()` 内部 `await import('exceljs')` 实现按需加载，主包 509KB → 180KB（gzip 170 → 58KB）
    - exceljs 独立 chunk ~930KB（gzip 256KB）按需加载
    - 模板文件无表头，第 1 行即为数据，固定字段顺序"产品编号 / 数量 / 专卖店编号"
16. **选择页视觉规范统一**（CR-20260703-001 §1/§3）：
    - 专卖店选择页（StoreSelectView）与产品选择页（ProductSelectView）样式回归 BudgetSelectView 风格
    - 卡片：圆角 12px、padding 14/16、margin-bottom 12px、box-shadow、点击 `scale(0.99)` 动画
    - 选中态：边框 2px `#22BDB8` + 背景 `#F0FDFC`
    - 折扣字段标签化：仅 `isDiscount: true` 产品显示"打折 N%"（PRD §14.3 + §9.8-4 依据）
    - 产品选择页去 `>`（避免"可进入下一级"误判）
17. **创建页产品返显与明细标题**（CR-20260703-001 §4）：
    - 已选产品编号 + 名称一体化展示（`{{ productCode }} {{ productName }}` + ellipsis + title）
    - 明细编号右上角胶囊：`min-width: 24px; height: 24px; border-radius: 12px; background: #E0F7F6; color: #22BDB8`
    - 明细头主行 32px 严格基线对齐（标题/数字胶囊/折叠 icon），副标题独立第二行
18. **详情页驳回态与重新发起**（CR-20260703-003 §4/§5，验收整改后）：
    - 已驳回状态首屏展示驳回 Banner（原因/驳回人/时间/备注）
    - **五维度显式判断**（禁止 `availability !== 'budget_expired'` 反向排除）：
      - `canShowReapply`：是否展示入口（`isRejected && !!reapplyCondition`）
      - `canClickReapply`：白名单 `['available','freeze_period_locked','non_freeze_new'].includes(...)`
      - `isReapplyDisabled`：`availability === 'budget_expired'` 时禁用
      - `reapplyBtnText`：switch 显式映射（冻结期→"基于原单重新发起"，其他→"重新发起"）
      - `reapplyHintText`：直接取 `cond.message`
    - **显式消费 `canSwitchBudget`**：`canSwitchBudgetWhenReapply = !!reapplyCond?.canSwitchBudget`
    - 弹窗文案通过 `canSwitchBudgetWhenReapply` 判断，不使用 availability 隐式推导
    - 冻结期：不允许切换预算号 → 带入原预算号路由参数 `rejectedFrom` + `budgetId`
    - 非冻结期/已到期：允许切换预算号 → 普通新建路由
19. **详情页产品明细汇总与折叠**（CR-20260703-003）：
    - 汇总行：四列网格（笔订单 / 专卖店 / 款 / 件），每列独立显示数字+标签
    - 明细卡片默认折叠，点击标题展开/收起（带旋转箭头）
    - 编号使用胶囊样式（#E0F7F6 + 12px圆角），与创建页一致
20. **详情页金额口径**（CR-20260703-003 §7）：
    - 预算总额（净额）：灰色弱化显示
    - 本次申请额度（净额）：主色 #22BDB8 突出显示
    - 不展示"剩余额度"和"金额合计"
21. **详情页区块顺序重排**（CR-20260706-001 §4）：
    - 区块顺序：顶部状态区 → 驳回信息区(条件性) → 当前审批进度(仅处理中) → 基础信息 → 发起信息 → 预算与申请信息 → 明细 → 附件 → 审批流/订单结果(状态驱动) → 操作区
    - 字段层级重整：基础信息(工单号/状态/申请人/申请组织/创建时间) / 发起信息(申请类型/申请理由) / 预算与申请信息(预算号/归属组织/使用范围/预算总额/本次申请额度)
    - 移除冗余"工单类型"字段（与申请类型重复）
22. **详情页产品明细卡片头优化**（CR-20260706-001 §7）：
    - 卡片头改为两行布局：上行(标题+编号+箭头) / 下行(款数+件数+金额)
    - 文案口径："X 款 · Y 件"（款=SKU种类数，件=数量合计）
    - 分组金额徽章显示在卡片头右侧（折叠态摘要完整）
23. **详情页统一提示风格**（CR-20260706-001 §9）：
    - 统一为 `.tip-banner` + 三种变体（`.tip-error`/`.tip-warning`/`.tip-info`）
    - 驳回提示、已到期提示、订单失败提示、异常提示统一颜色和层级
24. **详情页审批流节点字段化与视觉区分**（CR-20260706-002 §4）：
    - `ApprovalNode` 新增 `nodeName?: string`，模板优先展示 `nodeName` 兜底"审批节点 ${i}"
    - `getNodeClass()` 按节点类型/结果返回 CSS 类：`node-current`（橙色高亮）/`node-passed`/`node-rejected`（红色高亮）/`node-start`（青绿色标题）
    - 驳回节点 `.node-remark` 加左侧红色边框，紧贴展示
25. **详情页预占订单展示边界收口**（CR-20260706-002 §6）：
    - `ApprovalNode.functionOrderNo` (string) → `functionOrderNos` (string[])
    - 发起节点用 chip 胶囊平铺展示所有预占订单编号（wrap 换行）
    - 最终审批通过节点不展示预占订单和产品申请订单
    - 订单结果区预占订单只展示编号，不展示状态，字号 12px 降为辅助字段
26. **详情页失败原因去重**（CR-20260706-002 mock 修复）：
    - 删除 `RelatedOrder.remark`（与 `GroupResult.failReason` 内容重复）
    - `failReason` (string) → `failReasons` (string[])，`dedupFailReasons()` 去重后多个 tip-banner 展示
27. **详情页订单创建历史**（CR-20260706-002 mock 修复 / CR-20260707-002 文案统一）：
    - 新增 `OrderAttempt` 接口：`{ attemptTime, status, failReasons? }`
    - `GroupResult.retryHistory?: OrderAttempt[]`，默认折叠 + 外层只展示最新结果摘要
    - `expandedRetries` Set 管理展开状态，"订单创建历史（N次）"可点击展开时间线
    - 场景 9（`completed-retry`）：3 次重试成功 + 2 次重试业务放弃
    - **状态术语统一**（CR-20260707-002）：`OrderAttempt.status` 从"已生成/生成失败"更新为"已创建/客服已审核/财务已审核/草稿"
    - **外层摘要边界**（CR-20260707-002）：最终已创建时不显示失败主提示；业务放弃时只展示备注说明（灰色斜体），不展示"当前为草稿状态"警告标题
28. **详情页规则明细文档落地**（CR-20260706-003）：
    - 新增 `docs/product/work-order-budget/产品申请工单详情页面规则明细.md`（v0.2，14 个章节）
    - 覆盖三态展示规则、订单结果区规则、驳回 Banner 规则、重试历史规则
    - 三份产品文档同步回写更新日志（PRD/页面结构草图/AI 开发任务说明）
29. **详情页 Mock 数据纠偏**（CR-20260706-003）：
    - 处理中场景不含 `groupResults`（禁止提前展示正式订单结果）
    - 已结束场景 `failReasons: string[]` 去重后多个 tip-banner 展示
    - 列表页 mock 各 4→8 条（待办/已办/已发起全覆盖）
    - 新增场景 10（`completed-all-failed`）：已结束-全部失败业务放弃
    - 新增场景 11（`completed-store-change`）：专卖店变更（A→B，备注说明）
30. **订单结果区专卖店变更与备注**（CR-20260706-004）：
    - `RelatedOrder` 加 `storeCode?` `storeName?` `remark?`
    - 实际专卖店与工单明细不一致时展示"实际专卖店（订单）：XXX"（橙色 #E6A23C 警告）
    - 订单备注 `remark` 展示（灰色斜体）
    - 订单生成失败原因类型明确（3 类）：① 产品库存不足无法生成对应订单 ② 专卖店编号在系统的启用下单标识关闭 ③ 订单审核被驳回到草稿状态
31. **列表页→详情页滚动位置修复**（CR-20260706-003 / CR-20260707-002）：
    - `router/index.ts` 保留 `scrollBehavior: () => ({ top: 0 })`（仅控制 window 滚动）
    - **实际修复**（CR-20260707-002 flex 布局后）：`App.vue` 中 `watch(route.path)`，路由切换时调用 `document.querySelector('.page-content')?.scrollTo(0, 0)`
    - 根因：flex column 100vh 布局下 `.page-content` 是实际滚动容器，`scrollBehavior` 对其无效
32. **Mock 场景映射与失败原因修正**（CR-20260706-003/004 后续补丁）：
    - `idSceneMap` 补 `'10': 'completed-all-failed'` 和 `'11': 'completed-store-change'`
    - `mockDoneCards`/`mockInitiatedCards` 补 id 10/11 卡片（之前新场景在列表页和详情页不可见）
    - 所有 mock 失败原因从举例文字替换为 3 种正式类型：① 产品库存不足无法生成对应订单 ② 专卖店编号在系统的启用下单标识关闭 ③ 订单审核被驳回到草稿状态

> 以上方案为参考实现中的具体做法。正式 Vue 工程应根据实际状态管理选型重新设计。

## 注意事项

- "组内"入口当前未开通，不纳入本期功能范围，只保留视觉说明。
- 产品申请工单除表单内容、预算核销信息、审批/流转规则不同外，展示风格和流程沿用现有工单样式。
- 当前仓库主要用于沉淀移动端样式、交互结构和产品申请预算核销需求文档，不在当前 React 仓中推进正式业务页面开发。
- 样式设计需考虑 Web 端复用，参考 `docs/technical/cross-end-work-order-ui-strategy.md`。
- 页面滚动需确保 `.page-content` 设置 `overflow-y: auto` 和 `-webkit-overflow-scrolling: touch`。
- **详情页现行最终口径（CR-20260706-003 验收后，CR-20260707-002 订单状态术语统一后）**：
  - 处理中场景不得展示正式订单结果（不含 `groupResults`）
  - 预占订单仅在审批流**发起节点**展示，订单结果区不承接预占订单
  - 导航栏右上角独立状态字已移除
  - 订单结果状态只承接 4 种：**已创建 / 客服已审核 / 财务已审核 / 草稿**（不再使用"已生成/生成成功"）
  - 订单创建历史默认折叠，外层只展示最新结果摘要；业务放弃时只展示备注（灰色斜体），不展示"当前为草稿状态"警告标题
  - 详情页展示规则以 `docs/product/work-order-budget/产品申请工单详情页面规则明细.md`（v0.3 · CR-20260707-002）为当前直接执行依据
  - 如与历史阶段性描述不一致，以 CR-20260707-002 验收后口径及上述规则明细文档现行规则为准

## 已完成变更记录

### CR-20260707-002：订单结果区重试历史展示规则、订单状态术语统一与 Mock 一致性修正

**完成时间**：2026-07-07
**分支**：`feature/CR-20260707-002-order-retry-rules`（已合并 PR #36）

**主要变更**：
1. `types/index.ts`：`OrderAttempt.status` 更新为"已创建/客服已审核/财务已审核/草稿"，不再使用"已生成/生成失败"
2. `mocks/index.ts`：全局状态术语统一（16处）；场景8(PA202407050001)移除外层 failReasons；场景9(PA202407060001)改用 remark 承载业务放弃备注
3. `DetailView.vue`：新增 `getLatestOrderStatus()` 辅助函数；更新状态颜色映射；外层卡片只展示最新结果摘要（最终成功不显示失败提示、业务放弃只展示灰色斜体备注）；"生成尝试历史"→"订单创建历史"；重试历史展开区长文本排版优化
4. `产品申请工单详情页面规则明细.md`：v0.2→v0.3，新增状态固定口径、链路承接规则、重试历史规则、排版建议、错误示例6-8
5. `MyView.vue`：统一外层 padding 与 CreateView/TeamView 一致
6. `mobile.css` + `App.vue`：flex 布局修复双重滚动条 + 页面切换左移问题

**构建验证**：主包 211.32 kB（gzip 65.55 kB）

---

### CR-20260707-001：详情页现行规则口径统一、协作文档收口与说明性修正

**完成时间**：2026-07-07
**分支**：`feature/CR-20260707-001-doc-rectification`

**主要变更**：
1. `DetailView.vue` 注释修正：删除"预占订单已合并到订单结果"的误导性注释，统一为"预占订单仅在审批流发起节点展示，订单结果区不承接预占订单"
2. `CLAUDE.md` 补充详情页现行最终口径说明（注意事项区）
3. `README.md`（根目录）更新详情页能力边界与现行最终口径
4. `docs/product/work-order-budget/README.md` 更新详情页能力摘要与规则明细文档引用
5. `vue-reference/README.md` 同步详情页最终状态

**定位**：详情页现行最终规则的说明性收口补丁 —— 确保代码注释、协作文档、入口文档一致，历史描述与现行规则优先级清晰。

---

### CR-20260706-004：订单结果区专卖店变更、失败原因类型、备注显示

**完成时间**：2026-07-06
**分支**：`feature/CR-20260706-004-store-change-and-remark`
**提交**：已合并（PR #33）

**主要变更**：
1. `RelatedOrder` 接口扩展：`storeCode?` `storeName?` `remark?`
2. 所有 `RelatedOrder` 补全 `storeCode`/`storeName`
3. 新增场景 11（`completed-store-change`）：专卖店变更（A→B，备注说明原因）
4. 订单结果区展示实际专卖店（橙色 `#E6A23C` 警告）+ 订单备注（灰色斜体）
5. 规则明细文档更新：§6.10.5 失败原因类型、§6.10.6 专卖店变更规则、§6.10.7 备注显示规则

**构建验证**：主包 209.44 kB（gzip 65.28 kB）

---

### CR-20260706-003：详情页面规则明细建档、Mock 数据纠偏与轻量展示收口

**完成时间**：2026-07-06
**分支**：`feature/CR-20260706-003-rule-documentation-and-mock-fix`
**提交**：已合并（PR #33）

**主要变更**：
1. 规则明细文档建立：`docs/product/work-order-budget/产品申请工单详情页面规则明细.md`（v0.2，14 个章节）
2. Mock 数据修正：处理中场景不含 `groupResults`
3. 页面轻量优化：移除导航栏右上角状态字
4. 三份产品文档回写更新日志（PRD/页面结构草图/AI 开发任务说明）
5. 构建验证通过：主包 201.80 kB

---

### CR-20260706-002：详情页审批流、订单结果展示优化与白功能项收口

**完成时间**：2026-07-06
**分支**：`feature/CR-20260706-002-approval-result-display`
**提交**：`980df10`（初始开发）、`9991948`（文档变更）、`8db25b4`（mock 合理性修复）

**主要变更**：
1. 审批流区节点名称字段化（`nodeName`），节点类型视觉区分（当前/通过/驳回/发起）
2. 订单结果区预占库存订单只展示编号（不展示状态），降为辅助字段
3. 驳回节点红色高亮 + 审批意见紧贴展示
4. Mock 数据新增2个场景：全部成功（`completed-full`）、归并生成（`completed-merged`）
5. `GroupResult.functionOrderStatus` 改为可选字段（接口保留，UI不展示）

**Mock 合理性修复**（`8db25b4`，用户反馈后）：
1. 多笔预占订单支持：`functionOrderNo` (string) → `functionOrderNos` (string[])，发起节点 chip 胶囊平铺展示，最终通过节点不展示
2. 失败原因去重：删除 `RelatedOrder.remark`，`failReason` → `failReasons` (string[]) 数组去重
3. 多次失败重试：新增 `OrderAttempt` 类型 + `retryHistory` 字段，折叠收起+最终态展示，新增场景 9（`completed-retry`）
4. 已结束场景审批流模板补读 `nodeName`（修复"审批节点 1/2"回退）

**白功能项**：`uuid` moderate 风险复核结论已整理（不强制修复，不执行 `npm audit fix --force`）

