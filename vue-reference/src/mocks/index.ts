import type { Budget, ProductWorkOrder, WorkOrderCard, StoreGroup, ProductItem, ApprovalNode, GroupResult } from '../types';

export const mockBudgets: Budget[] = [
  { id: '1', budgetNo: 'B2024Q3001', productCode: 'P001', status: '已生效', applicationAvailable: true, isAbnormal: false, applyType: '新品申请', applyReason: '季度新品推广活动，针对核心专卖店进行首批铺货支持', availableAmount: 50000, usedAmount: 12000, applyingAmount: 8000 },
  { id: '2', budgetNo: 'B2024Q3002', productCode: 'P002', status: '已生效', applicationAvailable: true, isAbnormal: true, abnormalMessage: '组织调整中，预算归属可能发生变更', applyType: '活动申请', applyReason: '618促销活动产品支持', availableAmount: 30000, usedAmount: 5000, applyingAmount: 2000 },
  { id: '3', budgetNo: 'B2024Q3003', productCode: 'P003', status: '已生效', applicationAvailable: false, isAbnormal: false, applyType: '补货申请', applyReason: '常规季度补货', availableAmount: 0, usedAmount: 45000, applyingAmount: 5000 },
];

export function createDefaultProduct(): ProductItem {
  return { id: `prod_${Date.now()}`, productCode: '', productName: '', jdePrice: 0, isDiscount: false, discount: 0.5, maxQuantity: 0, quantity: 1, amount: 0 };
}
export function createDefaultGroup(): StoreGroup {
  return { id: `group_${Date.now()}`, storeCode: '', storeName: '', products: [{ ...createDefaultProduct() }], groupAmount: 0 };
}

export const mockProductOptions = [
  { code: 'SKU001', name: '智能马桶盖A款', jdePrice: 1299.00, isDiscount: true, discount: 0.5, maxQuantity: 20 },
  { code: 'SKU002', name: '恒温花洒B款', jdePrice: 899.00, isDiscount: false, discount: 1, maxQuantity: 15 },
  { code: 'SKU003', name: '浴室柜C款', jdePrice: 2599.00, isDiscount: true, discount: 0.5, maxQuantity: 10 },
  { code: 'SKU004', name: '智能龙头D款', jdePrice: 699.00, isDiscount: false, discount: 1, maxQuantity: 30 },
  { code: 'SKU005', name: '淋浴房E款', jdePrice: 3299.00, isDiscount: true, discount: 0.5, maxQuantity: 8 },
];

export const mockStores = [
  { code: '31692', name: '赵晋安 宋晓华' }, { code: '31441', name: '赵晋杰' },
  { code: '31375', name: '大连瑞轩商贸有限公司' }, { code: '31371', name: '沈阳迎续商贸有限公司' },
  { code: '37235', name: '游秋燕' }, { code: '34998', name: '福州晋安第五小学专卖店 林志高' },
];

export const mockWorkOrderCards: WorkOrderCard[] = [
  { id: '1', workOrderType: '产品申请', displayStatus: '处理中', applicantName: '张三', applyType: '新品申请', applyReason: '季度新品推广活动，针对核心专卖店进行首批铺货支持', createTime: '06-26 10:17' },
  { id: '2', workOrderType: '产品申请', displayStatus: '已结束', applicantName: '李四', applyType: '活动申请', applyReason: '618促销活动产品支持', createTime: '06-25 14:30' },
  { id: '3', workOrderType: '产品申请', displayStatus: '已驳回', applicantName: '王五', applyType: '补货申请', applyReason: '常规季度补货', createTime: '06-24 09:15' },
  { id: '4', workOrderType: '产品申请', displayStatus: '处理中', applicantName: '赵六', applyType: '新品申请', applyReason: '新品区域推广支持', createTime: '06-23 16:45' },
];

const mockApprovalNodes: ApprovalNode[] = [
  { id: 'node_start', nodeType: 'start', handlerName: '张三', handlerTime: '2024-06-26 10:17:30', functionOrderNo: 'FO20240626001', functionOrderStatus: '已取消' },
  { id: 'node_1', nodeType: 'approval', handlerName: '李经理', handlerTime: '2024-06-26 11:30:00', result: '通过', remark: '同意，预算充足' },
  { id: 'node_2', nodeType: 'approval', handlerName: '王总监', handlerTime: '2024-06-26 14:00:00', result: '通过', remark: '审批通过', functionOrderNo: 'FO20240626001', functionOrderStatus: '已取消', relatedOrders: [{ orderNo: 'O20240626001', orderType: '产品申请表订单', orderStatus: '已生成' }] },
];

const mockGroupResults: GroupResult[] = [
  { groupId: 'group_1', storeCode: '31692', storeName: '赵晋安 宋晓华', functionOrderNo: 'FO20240626001', functionOrderStatus: '已取消', relatedOrders: [{ orderNo: 'O20240626001', orderType: '产品申请表订单', orderStatus: '已生成', remark: '-' }] },
  { groupId: 'group_2', storeCode: '31441', storeName: '赵晋杰', functionOrderNo: 'FO20240626002', functionOrderStatus: '已取消', relatedOrders: [{ orderNo: 'O20240626002', orderType: '内部申请表订单', orderStatus: '生成失败', remark: '客户信息不满足下单规则' }], failReason: '客户信息不满足下单规则，请检查客户层级和资质' },
];

export const mockWorkOrderDetail: ProductWorkOrder = {
  id: '1', workOrderNo: 'PA202406260001', displayStatus: '处理中', applicantName: '张三', applicantOrg: '南大 / 福建', createTime: '2024-06-26 10:17:30',
  budget: mockBudgets[0],
  storeGroups: [
    { id: 'group_1', storeCode: '31692', storeName: '赵晋安 宋晓华', products: [
      { id: 'prod_1', productCode: 'SKU001', productName: '智能马桶盖A款', jdePrice: 1299.00, isDiscount: true, discount: 0.5, maxQuantity: 20, quantity: 2, amount: 1299.00 },
      { id: 'prod_2', productCode: 'SKU002', productName: '恒温花洒B款', jdePrice: 899.00, isDiscount: false, discount: 1, maxQuantity: 15, quantity: 1, amount: 899.00 },
    ], groupAmount: 2198.00 },
    { id: 'group_2', storeCode: '31441', storeName: '赵晋杰', products: [
      { id: 'prod_3', productCode: 'SKU003', productName: '浴室柜C款', jdePrice: 2599.00, isDiscount: true, discount: 0.5, maxQuantity: 10, quantity: 1, amount: 1299.50 },
    ], groupAmount: 1299.50 },
  ],
  totalAmount: 3497.50,
  attachments: [{ id: 'att_1', name: '新品推广方案.pdf', url: '#', type: 'pdf', size: 1024 * 1024 * 2 }, { id: 'att_2', name: '专卖店清单.xlsx', url: '#', type: 'excel', size: 1024 * 512 }],
  approvalNodes: mockApprovalNodes,
  groupResults: mockGroupResults,
};

export function calculateAmount(product: ProductItem): number {
  if (product.isDiscount) return Number((product.jdePrice * product.quantity * product.discount).toFixed(2));
  return Number((product.jdePrice * product.quantity).toFixed(2));
}
