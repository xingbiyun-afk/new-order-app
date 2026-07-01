// ============================================================
// 产品申请工单 - 类型定义
// ============================================================

/** 预算信息 */
export interface Budget {
  id: string
  budgetNo: string
  productCode: string
  status: '草稿' | '已生效' | '已作废' | '已到期'
  applicationAvailable: boolean
  isAbnormal: boolean
  abnormalMessage?: string
  applyType: string
  applyReason: string
  availableAmount: number
  usedAmount: number
  applyingAmount: number
}

/** 产品明细 */
export interface ProductItem {
  id: string
  productCode: string
  productName: string
  jdePrice: number
  isDiscount: boolean
  discount: number
  maxQuantity: number
  quantity: number
  amount: number
}

/** 专卖店申请分组 */
export interface StoreGroup {
  id: string
  storeCode: string
  storeName: string
  products: ProductItem[]
  groupAmount: number
}

/** 审批节点 */
export interface ApprovalNode {
  id: string
  nodeType: 'start' | 'approval'
  handlerName: string
  handlerTime?: string
  result?: '通过' | '驳回' | '待处理'
  remark?: string
  functionOrderNo?: string
  functionOrderStatus?: string
  relatedOrders?: RelatedOrder[]
}

/** 关联订单 */
export interface RelatedOrder {
  orderNo: string
  orderType: '产品申请表订单' | '内部申请表订单'
  orderStatus: string
  remark?: string
}

/** 分组结果 */
export interface GroupResult {
  groupId: string
  storeCode: string
  storeName: string
  functionOrderNo: string
  functionOrderStatus: string
  relatedOrders: RelatedOrder[]
  failReason?: string
}

/** 附件 */
export interface Attachment {
  id: string
  name: string
  url: string
  type: string
  size: number
}

/** 产品申请工单 */
export interface ProductWorkOrder {
  id: string
  workOrderNo: string
  displayStatus: string
  applicantName: string
  applicantOrg: string
  createTime: string
  budget: Budget
  storeGroups: StoreGroup[]
  totalAmount: number
  attachments: Attachment[]
  approvalNodes: ApprovalNode[]
  groupResults?: GroupResult[]
  failReason?: string
}

/** 列表卡片展示数据 */
export interface WorkOrderCard {
  id: string
  workOrderType: string
  displayStatus: string
  applicantName: string
  applyType: string
  applyReason: string
  createTime: string
}
