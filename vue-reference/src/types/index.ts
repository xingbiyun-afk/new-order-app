export interface Budget {
  id: string; budgetNo: string; productCode: string;
  status: '草稿' | '已生效' | '已作废' | '已到期';
  applicationAvailable: boolean; isAbnormal: boolean;
  abnormalMessage?: string; applyType: string; applyReason: string;
  // CR-20260702-001: 卡片展示字段调整
  availableAmount: number;        // 剩余额度（净额）—— 第一优先级展示
  budgetTotalAmount: number;      // 预算总额（净额）—— 新增
  budgetOrg: string;              // 预算归属组织 —— 新增
  budgetScope: string;            // 预算使用范围 —— 新增
  budgetExpiryDate: string;       // 预算到期日 —— 用于标签计算与排序
  freezeStartDate: string;        // 冻结开始日期 —— 用于"申请冻结中"标签
  lastAppliedAt?: string;         // 最近申请时间 —— 用于"最近申请"标签
  // 历史字段保留（后端兼容），前端展示中已用/申请中金额不再显示
  usedAmount: number;
  applyingAmount: number;
}

// CR-20260702-001: 预算标签类型
export type BudgetTagType = 'recent' | 'expiring' | 'currentQuarter' | 'freezing';

export interface BudgetTag {
  type: BudgetTagType;
  label: string;
  priority: number; // 1=最高, 4=最低
}
export interface ProductItem {
  id: string; productCode: string; productName: string;
  jdePrice: number; isDiscount: boolean; discount: number;
  maxQuantity: number; quantity: number; amount: number;
}
export interface StoreGroup {
  id: string; storeCode: string; storeName: string;
  products: ProductItem[]; groupAmount: number;
}
export interface RelatedOrder {
  orderNo?: string; orderType: '产品申请表订单' | '内部申请表订单';
  orderStatus: string;
  // CR-20260706-004: 订单实际所属专卖店（可能与工单明细专卖店不一致）
  storeCode?: string;
  storeName?: string;
  // CR-20260706-004: 订单备注（多次重试说明、更换专卖店说明）
  remark?: string;
}

// CR-20260706-002: 单次订单尝试记录（用于多次失败重试时间线）
// CR-20260707-002: 状态统一为"已创建/客服已审核/财务已审核/草稿"四种
// CR-20260708-001: 新增 deleteReason，实现备注承接优先级（删除理由 > 驳回说明 > 失败原因）
// CR-20260708-002: 新增 draftId，用于按草稿链路聚合订单创建历史
export interface OrderAttempt {
  attemptAt: string;             // 尝试时间
  orderNo?: string;              // 本次尝试的订单编号（每次重试可能不同）
  draftId: string;               // CR-20260708-002: 草稿链路ID，同一draftId下的尝试属于同一条草稿链路
  status: '已创建' | '客服已审核' | '财务已审核' | '草稿';
  failReason?: string;           // 失败原因（自动提交失败 / 审核驳回回草稿说明）
  deleteReason?: string;         // CR-20260708-001: 删除理由（草稿已被业务主动删除时，优先级高于 failReason）
}

// CR-20260708-002: 草稿链路（按 draftId 聚合）
// 同一 draftId 下的所有尝试归并为一条草稿链路
export interface DraftLink {
  draftId: string;               // 草稿链路唯一标识
  orderType: '产品申请表订单' | '内部申请表订单';  // 该草稿链路的订单类型
  attempts: OrderAttempt[];      // 该草稿链路下的所有尝试记录
  isDeleted: boolean;            // 该草稿是否已被删除
  deleteReason?: string;         // 删除原因（isDeleted=true 时有值）
}

// CR-20260708-002: 当前结果说明枚举
export type CurrentResultDescription =
  | '草稿提交失败'
  | '审核驳回'
  | '草稿已删除'
  | '订单已创建'
  | '订单已创建（信息变更）';

// CR-20260708-002: 产品变更摘要
export interface ProductChangeSummary {
  changedSkuCount: number;       // 存在不一致的SKU种类数
  totalQuantityDiff: number;     // 数量差绝对值合计
}

export interface ApprovalNode {
  id: string; nodeType: 'start' | 'approval';
  nodeName?: string;             // 节点名称（如"一级审批""二级审批"）
  handlerName: string; handlerTime?: string;
  result?: '通过' | '驳回' | '待处理';
  remark?: string;
  // CR-20260706-002: 改为数组，发起阶段可能多笔预占库存订单
  functionOrderNos?: string[];
  relatedOrders?: RelatedOrder[];
}

export interface GroupResult {
  groupId: string; storeCode: string; storeName: string;
  // CR-20260706-002: 预占库存订单改为数组；UI 只展示编号，不展示状态
  functionOrderNos: string[];
  relatedOrders: RelatedOrder[];
  // CR-20260706-002: 失败原因列表（多条订单失败时按数组展示，去重避免单条 remark 重复）
  failReasons?: string[];
  // CR-20260708-001: 外层备注（删除/放弃理由，与 retryHistory 独立）
  outerRemark?: string;
  // CR-20260706-002: 多次失败重试历史（按订单号或 draft 标识聚合）
  // CR-20260708-002: 历史数据保留兼容，新数据优先使用 draftLinks
  retryHistory?: Record<string, OrderAttempt[]>;
  // CR-20260708-002: 按 draftId 聚合的草稿链路（新数据结构）
  draftLinks?: DraftLink[];
  // CR-20260708-002: 当前结果说明（固定枚举）
  currentResultDescription?: CurrentResultDescription;
  // CR-20260708-002: 当前主原因（首屏展示的一条主文本）
  currentMainReason?: string;
  // CR-20260708-002: 实际专卖店变更信息
  actualStoreCode?: string;
  actualStoreName?: string;
  // CR-20260708-002: 产品变更摘要
  productChangeSummary?: ProductChangeSummary;
}
export interface Attachment {
  id: string; name: string; url: string; type: string; size: number;
}
// CR-20260703-003: 驳回信息类型
export interface RejectionInfo {
  rejectedAt: string;           // 驳回时间
  rejectedBy: string;           // 驳回人
  rejectNodeName: string;       // 驳回节点名称
  rejectReason: string;         // 驳回原因
  rejectRemark?: string;        // 驳回备注
}

// CR-20260703-003: 重新发起条件判断结果
export type ReapplyAvailability = 'available' | 'budget_expired' | 'freeze_period_locked' | 'non_freeze_new';

export interface ReapplyCondition {
  availability: ReapplyAvailability;  // 是否允许重新发起
  message: string;                    // 提示信息
  originalBudgetNo?: string;          // 原预算号（冻结期场景沿用）
  canSwitchBudget: boolean;           // 是否允许切换预算号
}

export interface ProductWorkOrder {
  id: string; workOrderNo: string; displayStatus: string;
  applicantName: string; applicantOrg: string; createTime: string;
  budget: Budget; storeGroups: StoreGroup[]; totalAmount: number;
  attachments: Attachment[]; approvalNodes: ApprovalNode[];
  groupResults?: GroupResult[]; failReason?: string;
  // CR-20260703-003: 驳回信息（已驳回状态时有值）
  rejectionInfo?: RejectionInfo;
  // CR-20260703-003: 重新发起条件（已驳回状态时有值）
  reapplyCondition?: ReapplyCondition;
}
export interface WorkOrderCard {
  id: string; workOrderType: string; displayStatus: string;
  applicantName: string; applyType: string; applyReason: string;
  createTime: string;
}

// CR-20260701-002: 批量导入相关类型
export interface ImportRow {
  line: number; sku: string; quantity: number; storeCode: string;
}
export interface ImportError {
  line: number; field: string; message: string;
}
export interface ImportResult {
  success: boolean;
  errors: ImportError[]; warnings: ImportError[];
  rows: ImportRow[];
  groupMap: Map<string, ImportRow[]>;
}
