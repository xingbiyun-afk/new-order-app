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
  orderNo: string; orderType: '产品申请表订单' | '内部申请表订单';
  orderStatus: string; remark?: string;
}
export interface ApprovalNode {
  id: string; nodeType: 'start' | 'approval';
  handlerName: string; handlerTime?: string;
  result?: '通过' | '驳回' | '待处理';
  remark?: string; functionOrderNo?: string;
  functionOrderStatus?: string; relatedOrders?: RelatedOrder[];
}
export interface GroupResult {
  groupId: string; storeCode: string; storeName: string;
  functionOrderNo: string; functionOrderStatus: string;
  relatedOrders: RelatedOrder[]; failReason?: string;
}
export interface Attachment {
  id: string; name: string; url: string; type: string; size: number;
}
export interface ProductWorkOrder {
  id: string; workOrderNo: string; displayStatus: string;
  applicantName: string; applicantOrg: string; createTime: string;
  budget: Budget; storeGroups: StoreGroup[]; totalAmount: number;
  attachments: Attachment[]; approvalNodes: ApprovalNode[];
  groupResults?: GroupResult[]; failReason?: string;
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
