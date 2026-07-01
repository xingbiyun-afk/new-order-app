export interface Budget {
  id: string; budgetNo: string; productCode: string;
  status: '草稿' | '已生效' | '已作废' | '已到期';
  applicationAvailable: boolean; isAbnormal: boolean;
  abnormalMessage?: string; applyType: string; applyReason: string;
  availableAmount: number; usedAmount: number; applyingAmount: number;
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
