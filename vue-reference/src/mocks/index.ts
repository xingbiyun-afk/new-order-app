import type { Budget, ProductWorkOrder, WorkOrderCard, StoreGroup, ProductItem, ApprovalNode, GroupResult, ImportRow, ImportError } from '../types';

// ============================================================
// 预算选择页 Mock 数据（CR-20260702-001 更新）
// ============================================================
// 字段说明：
// - availableAmount: 剩余额度（净额）—— 卡片第一优先级展示
// - budgetTotalAmount: 预算总额（净额）—— 辅助申请人理解预算规模
// - budgetOrg: 预算归属组织 —— 帮助申请人理解预算归属主体
// - budgetScope: 预算使用范围 —— 纯组织架构口径（总部/区域/省办），不涉及店铺类型
// - budgetExpiryDate: 预算到期日 —— 用于"15天内即将到期"标签 + 排序
// - freezeStartDate: 冻结开始日期 —— 用于"申请冻结中"标签
// - lastAppliedAt: 最近成功提交时间 —— 仅用户最近一次成功提交预算显示"最近申请"标签

const today = '2026-07-02'

export const mockBudgets: Budget[] = [
  // ===== 标签：最近申请（仅1条：用户最近一次成功提交的预算）=====
  { id: '1', budgetNo: 'B2024Q3001', productCode: 'P001', status: '已生效', applicationAvailable: true, isAbnormal: false,
    applyType: '新品申请', applyReason: '季度新品推广活动，针对核心专卖店进行首批铺货支持',
    availableAmount: 50000, budgetTotalAmount: 70000, budgetOrg: '华南大区总部', budgetScope: '广东省、福建省、海南省',
    budgetExpiryDate: '2026-07-30', freezeStartDate: '2026-07-20', lastAppliedAt: today,
    usedAmount: 12000, applyingAmount: 8000 },

  // ===== 标签：15天内即将到期（到期日在15天内，且无lastAppliedAt）=====
  { id: '2', budgetNo: 'B2024Q3002', productCode: 'P002', status: '已生效', applicationAvailable: true, isAbnormal: true,
    abnormalMessage: '组织调整中，预算归属可能发生变更', applyType: '活动申请', applyReason: '618促销活动产品支持',
    availableAmount: 30000, budgetTotalAmount: 38000, budgetOrg: '华东大区-浙江分部', budgetScope: '浙江省全境',
    budgetExpiryDate: '2026-07-15', freezeStartDate: '2026-07-20',
    usedAmount: 5000, applyingAmount: 2000 },

  { id: '9', budgetNo: 'B2024Q3009', productCode: 'P009', status: '已生效', applicationAvailable: true, isAbnormal: false,
    applyType: '补货申请', applyReason: '紧急补货',
    availableAmount: 12000, budgetTotalAmount: 15000, budgetOrg: '东北大区', budgetScope: '辽宁省、吉林省、黑龙江省',
    budgetExpiryDate: '2026-07-10', freezeStartDate: '2026-07-20',
    usedAmount: 2000, applyingAmount: 1000 },

  // ===== 标签：本季度可申请（不在冻结期，无lastAppliedAt，到期日>15天）=====
  { id: '4', budgetNo: 'B2024Q3004', productCode: 'P004', status: '已生效', applicationAvailable: true, isAbnormal: false,
    applyType: '新品申请', applyReason: '智能系列产品区域推广',
    availableAmount: 85000, budgetTotalAmount: 100000, budgetOrg: '西南大区总部', budgetScope: '四川省、重庆市、云南省',
    budgetExpiryDate: '2026-09-30', freezeStartDate: '2026-08-15',
    usedAmount: 10000, applyingAmount: 5000 },

  // ===== 标签：申请冻结中（freezeStartDate <= today < budgetExpiryDate）=====
  { id: '5', budgetNo: 'B2024Q3005', productCode: 'P005', status: '已生效', applicationAvailable: true, isAbnormal: false,
    applyType: '活动申请', applyReason: '暑期促销活动专项预算',
    availableAmount: 15000, budgetTotalAmount: 25000, budgetOrg: '华中营销中心', budgetScope: '湖北省、湖南省、河南省',
    budgetExpiryDate: '2026-08-10', freezeStartDate: '2026-07-01',
    usedAmount: 8000, applyingAmount: 2000 },

  // ===== 零剩余额度 —— 展示但弱化后置，不可选 =====
  { id: '3', budgetNo: 'B2024Q3003', productCode: 'P003', status: '已生效', applicationAvailable: false, isAbnormal: false,
    applyType: '补货申请', applyReason: '常规季度补货',
    availableAmount: 0, budgetTotalAmount: 50000, budgetOrg: '华北营销中心', budgetScope: '北京市、天津市、河北省',
    budgetExpiryDate: '2026-07-30', freezeStartDate: '2026-07-20',
    usedAmount: 45000, applyingAmount: 5000 },

  // ===== 以下预算不应在选择页展示（仅用于过滤测试）=====
  // 草稿
  { id: '6', budgetNo: 'B2024Q3006-D', productCode: 'P006', status: '草稿', applicationAvailable: false, isAbnormal: false,
    applyType: '补货申请', applyReason: '草稿预算测试中',
    availableAmount: 20000, budgetTotalAmount: 20000, budgetOrg: '华东大区', budgetScope: '山东省全境',
    budgetExpiryDate: '2026-07-30', freezeStartDate: '2026-07-20',
    usedAmount: 0, applyingAmount: 0 },
  // 已作废
  { id: '7', budgetNo: 'B2024Q3007-V', productCode: 'P007', status: '已作废', applicationAvailable: false, isAbnormal: false,
    applyType: '活动申请', applyReason: '已作废预算',
    availableAmount: 0, budgetTotalAmount: 30000, budgetOrg: '华南大区', budgetScope: '广西省全境',
    budgetExpiryDate: '2026-06-01', freezeStartDate: '2026-05-15',
    usedAmount: 30000, applyingAmount: 0 },
  // 已到期
  { id: '8', budgetNo: 'B2024Q3008-E', productCode: 'P008', status: '已到期', applicationAvailable: false, isAbnormal: false,
    applyType: '新品申请', applyReason: '到期预算',
    availableAmount: 0, budgetTotalAmount: 40000, budgetOrg: '西北大区', budgetScope: '陕西省、甘肃省',
    budgetExpiryDate: '2026-06-15', freezeStartDate: '2026-05-30',
    usedAmount: 40000, applyingAmount: 0 },
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
  { code: '31692', name: '赵晋安 宋晓华', level: 4, orderAllowed: true },
  { code: '31441', name: '赵晋杰', level: 4, orderAllowed: true },
  { code: '31375', name: '大连瑞轩商贸有限公司', level: 3, orderAllowed: true },
  { code: '31371', name: '沈阳迎续商贸有限公司', level: 3, orderAllowed: true },
  { code: '37235', name: '游秋燕', level: 4, orderAllowed: true },
  { code: '34998', name: '福州晋安第五小学专卖店 林志高', level: 2, orderAllowed: true },
  // 边界测试数据
  { code: '50001', name: '层级5测试专卖店', level: 5, orderAllowed: true },
  { code: '50002', name: '禁止下单测试专卖店', level: 4, orderAllowed: false },
];

// ============================================================
// "我的"页 Mock 数据（CR-20260630-003）
// ============================================================

// 通用卡片数据（旧接口兼容）
export const mockWorkOrderCards: WorkOrderCard[] = [
  { id: '1', workOrderType: '产品申请', displayStatus: '处理中', applicantName: '张三', applyType: '新品申请', applyReason: '季度新品推广活动，针对核心专卖店进行首批铺货支持', createTime: '06-26 10:17' },
  { id: '2', workOrderType: '产品申请', displayStatus: '已结束', applicantName: '李四', applyType: '活动申请', applyReason: '618促销活动产品支持', createTime: '06-25 14:30' },
  { id: '3', workOrderType: '产品申请', displayStatus: '已驳回', applicantName: '王五', applyType: '补货申请', applyReason: '常规季度补货', createTime: '06-24 09:15' },
  { id: '4', workOrderType: '产品申请', displayStatus: '处理中', applicantName: '赵六', applyType: '新品申请', applyReason: '新品区域推广支持', createTime: '06-23 16:45' },
];

// 待办：4条，全部为"处理中"，覆盖短/中/长理由 + 同天/跨天时间
export const mockTodoCards: WorkOrderCard[] = [
  { id: 't1', workOrderType: '产品申请', displayStatus: '处理中', applicantName: '张三', applyType: '新品申请', applyReason: '新品推广', createTime: '06-30 09:00' },
  { id: 't2', workOrderType: '产品申请', displayStatus: '处理中', applicantName: '李四', applyType: '活动申请', applyReason: '618促销活动产品支持，针对核心门店进行首批铺货', createTime: '06-30 14:30' },
  { id: 't3', workOrderType: '产品申请', displayStatus: '处理中', applicantName: '王五', applyType: '补货申请', applyReason: '季度常规补货，应对暑期销售高峰，确保核心专卖店库存充足，避免因缺货导致销售机会流失', createTime: '06-29 11:20' },
  { id: 't4', workOrderType: '产品申请', displayStatus: '处理中', applicantName: '赵六', applyType: '新品申请', applyReason: '国庆黄金周促销活动铺货准备，提前备货确保假期销售', createTime: '06-28 16:45' },
];

// 已办：4条，已结束+已驳回，覆盖短/中/长理由 + 跨天时间
// CR-20260703-003: ID 与 DetailView 场景映射对齐（2=processing, 3=rejected-freeze, 4=rejected-expired, 5=rejected-nonfreeze, 6=completed）
export const mockDoneCards: WorkOrderCard[] = [
  { id: '6', workOrderType: '产品申请', displayStatus: '已结束', applicantName: '孙七', applyType: '补货申请', applyReason: '暑期旺季补货', createTime: '06-27 10:00' },
  { id: '3', workOrderType: '产品申请', displayStatus: '已驳回', applicantName: '周八', applyType: '活动申请', applyReason: '双十一预售活动产品备货，需提前一个月准备库存', createTime: '06-26 15:30' },
  { id: '2', workOrderType: '产品申请', displayStatus: '处理中', applicantName: '吴九', applyType: '新品申请', applyReason: '春季新品上市推广活动，针对华南区域核心专卖店进行首批铺货支持，确保新品上市首月销量达标', createTime: '06-25 08:45' },
  { id: '5', workOrderType: '产品申请', displayStatus: '已驳回', applicantName: '郑十', applyType: '补货申请', applyReason: '年末库存补充', createTime: '06-24 13:10' },
];

// 已发起：4条，三种状态混合，覆盖短/中/长理由
// CR-20260703-003: ID 与 DetailView 场景映射对齐
export const mockInitiatedCards: WorkOrderCard[] = [
  { id: 'i1', workOrderType: '产品申请', displayStatus: '处理中', applicantName: '钱十一', applyType: '新品申请', applyReason: '智能系列新品推广', createTime: '06-30 10:30' },
  { id: 'i2', workOrderType: '产品申请', displayStatus: '已结束', applicantName: '陈十二', applyType: '活动申请', applyReason: '五一劳动节促销活动产品支持，针对全国核心门店', createTime: '06-29 09:15' },
  { id: '4', workOrderType: '产品申请', displayStatus: '已驳回', applicantName: '刘十三', applyType: '补货申请', applyReason: '梅雨季节防潮产品专项补货，确保南方区域专卖店库存充足，应对季节性销售增长需求', createTime: '06-28 14:00' },
  { id: 'i4', workOrderType: '产品申请', displayStatus: '处理中', applicantName: '黄十四', applyType: '新品申请', applyReason: '冬季暖品系列上市铺货', createTime: '06-27 11:30' },
];

const mockApprovalNodes: ApprovalNode[] = [
  { id: 'node_start', nodeType: 'start', nodeName: '发起工单', handlerName: '张三', handlerTime: '2024-06-26 10:17:30', functionOrderNos: ['FO20240626001'] },
  { id: 'node_1', nodeType: 'approval', nodeName: '一级审批', handlerName: '李经理', handlerTime: '2024-06-26 11:30:00', result: '通过', remark: '同意，预算充足' },
  { id: 'node_2', nodeType: 'approval', nodeName: '二级审批', handlerName: '王总监', handlerTime: '2024-06-26 14:00:00', result: '通过', remark: '审批通过' },
];

const mockGroupResults: GroupResult[] = [
  { groupId: 'group_1', storeCode: '31692', storeName: '赵晋安 宋晓华', functionOrderNos: ['FO20240626001'], relatedOrders: [{ orderNo: 'O20240626001', orderType: '产品申请表订单', orderStatus: '已生成' }] },
  { groupId: 'group_2', storeCode: '31441', storeName: '赵晋杰', functionOrderNos: ['FO20240626002'], relatedOrders: [{ orderNo: 'O20240626002', orderType: '内部申请表订单', orderStatus: '生成失败' }], failReasons: ['客户信息不满足下单规则，请检查客户层级和资质'] },
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

// ============================================================
// CR-20260703-003: 详情页多场景 Mock 数据
// ============================================================

// 场景1：处理中（多明细 + 多附件 + 完整审批流 + 多节点 + 发起阶段多笔预占订单）
const mockProcessingNodes: ApprovalNode[] = [
  // CR-20260706-002: 发起阶段展示所有预占订单编号（4笔明细 → 4笔预占订单）
  { id: 'p1_start', nodeType: 'start', nodeName: '发起工单', handlerName: '陈十六', handlerTime: '2024-07-01 09:30:00', functionOrderNos: ['FO20240701001', 'FO20240701002', 'FO20240701003', 'FO20240701004'] },
  { id: 'p1_n1', nodeType: 'approval', nodeName: '一级审批', handlerName: '刘经理', handlerTime: '2024-07-01 10:15:00', result: '通过', remark: '预算充足，同意申请' },
  { id: 'p1_n2', nodeType: 'approval', nodeName: '二级审批', handlerName: '赵总监', handlerTime: '', result: '待处理', remark: '' },
];

export const mockWorkOrderProcessing: ProductWorkOrder = {
  id: '2', workOrderNo: 'PA202407010001', displayStatus: '处理中', applicantName: '陈十六', applicantOrg: '华东 / 浙江', createTime: '2024-07-01 09:30:00',
  budget: mockBudgets[3], // B2024Q3004 大额度预算
  storeGroups: [
    { id: 'g1', storeCode: '31375', storeName: '大连瑞轩商贸有限公司', products: [
      { id: 'p1', productCode: 'SKU001', productName: '智能马桶盖A款', jdePrice: 1299.00, isDiscount: true, discount: 0.5, maxQuantity: 20, quantity: 5, amount: 3247.50 },
      { id: 'p2', productCode: 'SKU004', productName: '智能龙头D款', jdePrice: 699.00, isDiscount: false, discount: 1, maxQuantity: 30, quantity: 10, amount: 6990.00 },
    ], groupAmount: 10237.50 },
    { id: 'g2', storeCode: '34998', storeName: '福州晋安第五小学专卖店 林志高', products: [
      { id: 'p3', productCode: 'SKU002', productName: '恒温花洒B款', jdePrice: 899.00, isDiscount: false, discount: 1, maxQuantity: 15, quantity: 3, amount: 2697.00 },
    ], groupAmount: 2697.00 },
    { id: 'g3', storeCode: '37235', storeName: '游秋燕', products: [
      { id: 'p4', productCode: 'SKU005', productName: '淋浴房E款', jdePrice: 3299.00, isDiscount: true, discount: 0.5, maxQuantity: 8, quantity: 2, amount: 3299.00 },
    ], groupAmount: 3299.00 },
    // CR-20260706-001 补强：多款多件明细（验证款/件拆分的卡片头与汇总）
    { id: 'g4', storeCode: '40001', storeName: '北京朝阳旗舰店', products: [
      { id: 'q1', productCode: 'SKU010', productName: '智能马桶盖C款', jdePrice: 1899.00, isDiscount: false, discount: 1, maxQuantity: 50, quantity: 12, amount: 22788.00 },
      { id: 'q2', productCode: 'SKU011', productName: '智能马桶F款', jdePrice: 4599.00, isDiscount: true, discount: 0.6, maxQuantity: 30, quantity: 8, amount: 22075.20 },
      { id: 'q3', productCode: 'SKU012', productName: '智能花洒G款', jdePrice: 799.00, isDiscount: false, discount: 1, maxQuantity: 100, quantity: 30, amount: 23970.00 },
      { id: 'q4', productCode: 'SKU013', productName: '智能浴霸H款', jdePrice: 1599.00, isDiscount: true, discount: 0.7, maxQuantity: 40, quantity: 6, amount: 6715.80 },
      { id: 'q5', productCode: 'SKU014', productName: '智能镜柜I款', jdePrice: 2299.00, isDiscount: false, discount: 1, maxQuantity: 25, quantity: 4, amount: 9196.00 },
      { id: 'q6', productCode: 'SKU015', productName: '智能门锁J款', jdePrice: 1299.00, isDiscount: false, discount: 1, maxQuantity: 60, quantity: 15, amount: 19485.00 },
      { id: 'q7', productCode: 'SKU016', productName: '智能窗帘电机K款', jdePrice: 899.00, isDiscount: true, discount: 0.8, maxQuantity: 50, quantity: 10, amount: 7192.00 },
      { id: 'q8', productCode: 'SKU017', productName: '智能晾衣架L款', jdePrice: 1099.00, isDiscount: false, discount: 1, maxQuantity: 35, quantity: 5, amount: 5495.00 },
      { id: 'q9', productCode: 'SKU018', productName: '智能开关面板M款', jdePrice: 199.00, isDiscount: false, discount: 1, maxQuantity: 200, quantity: 80, amount: 15920.00 },
      { id: 'q10', productCode: 'SKU019', productName: '智能插座N款', jdePrice: 89.00, isDiscount: false, discount: 1, maxQuantity: 500, quantity: 200, amount: 17800.00 },
    ], groupAmount: 150637.00 },
  ],
  totalAmount: 166870.50,
  attachments: [
    { id: 'a1', name: '促销活动方案.pdf', url: '#', type: 'pdf', size: 1024 * 1024 * 3 },
    { id: 'a2', name: '专卖店资质证明.pdf', url: '#', type: 'pdf', size: 1024 * 1024 * 1.5 },
    { id: 'a3', name: '产品需求清单.xlsx', url: '#', type: 'excel', size: 1024 * 256 },
    { id: 'a4', name: '预算使用说明.docx', url: '#', type: 'word', size: 1024 * 128 },
  ],
  approvalNodes: mockProcessingNodes,
};

// 场景2：已驳回 — 冻结期原单重提（预算号沿用，不可切换）
const mockRejectedFreezeNodes: ApprovalNode[] = [
  { id: 'rf_start', nodeType: 'start', nodeName: '发起工单', handlerName: '王五', handlerTime: '2024-06-28 14:20:00', functionOrderNos: ['FO20240628003'] },
  { id: 'rf_n1', nodeType: 'approval', nodeName: '一级审批', handlerName: '李经理', handlerTime: '2024-06-28 15:00:00', result: '通过', remark: '初审通过' },
  { id: 'rf_n2', nodeType: 'approval', nodeName: '二级审批', handlerName: '张总监', handlerTime: '2024-06-28 16:30:00', result: '驳回', remark: '申请数量超出该专卖店历史采购上限，请核实后调整数量重新提交' },
];

export const mockWorkOrderRejectedFreeze: ProductWorkOrder = {
  id: '3', workOrderNo: 'PA202406280003', displayStatus: '已驳回', applicantName: '王五', applicantOrg: '华南 / 广东', createTime: '2024-06-28 14:20:00',
  budget: mockBudgets[4], // B2024Q3005 - 冻结期预算（freezeStartDate: 2026-07-01）
  storeGroups: [
    { id: 'g1', storeCode: '31692', storeName: '赵晋安 宋晓华', products: [
      { id: 'p1', productCode: 'SKU001', productName: '智能马桶盖A款', jdePrice: 1299.00, isDiscount: true, discount: 0.5, maxQuantity: 20, quantity: 15, amount: 9742.50 },
    ], groupAmount: 9742.50 },
  ],
  totalAmount: 9742.50,
  attachments: [{ id: 'a1', name: '补货申请表.pdf', url: '#', type: 'pdf', size: 1024 * 512 }],
  approvalNodes: mockRejectedFreezeNodes,
  rejectionInfo: {
    rejectedAt: '2024-06-28 16:30:00',
    rejectedBy: '张总监',
    rejectNodeName: '二级审批',
    rejectReason: '申请数量超出该专卖店历史采购上限',
    rejectRemark: '请核实后调整数量重新提交',
  },
  reapplyCondition: {
    availability: 'freeze_period_locked',
    message: '当前预算处于冻结期，原预算号将沿用，提交时按剩余额度校验',
    originalBudgetNo: 'B2024Q3005',
    canSwitchBudget: false,
  },
};

// 场景3：已驳回 — 原预算已到期，不可继续基于原单重提
const mockRejectedExpiredNodes: ApprovalNode[] = [
  { id: 're_start', nodeType: 'start', nodeName: '发起工单', handlerName: '周八', handlerTime: '2024-06-15 10:00:00', functionOrderNos: ['FO20240615001'] },
  { id: 're_n1', nodeType: 'approval', nodeName: '一级审批', handlerName: '吴经理', handlerTime: '2024-06-15 11:30:00', result: '驳回', remark: '该预算已到期，无法继续申请' },
];

export const mockWorkOrderRejectedExpired: ProductWorkOrder = {
  id: '4', workOrderNo: 'PA202406150001', displayStatus: '已驳回', applicantName: '周八', applicantOrg: '华东 / 浙江', createTime: '2024-06-15 10:00:00',
  budget: { ...mockBudgets[4], budgetExpiryDate: '2024-06-20', status: '已到期', applicationAvailable: false },
  storeGroups: [
    { id: 'g1', storeCode: '31441', storeName: '赵晋杰', products: [
      { id: 'p1', productCode: 'SKU002', productName: '恒温花洒B款', jdePrice: 899.00, isDiscount: false, discount: 1, maxQuantity: 15, quantity: 5, amount: 4495.00 },
    ], groupAmount: 4495.00 },
  ],
  totalAmount: 4495.00,
  attachments: [{ id: 'a1', name: '活动申请附件.pdf', url: '#', type: 'pdf', size: 1024 * 1024 }],
  approvalNodes: mockRejectedExpiredNodes,
  rejectionInfo: {
    rejectedAt: '2024-06-15 11:30:00',
    rejectedBy: '吴经理',
    rejectNodeName: '一级审批',
    rejectReason: '原预算已到期，无法继续申请',
    rejectRemark: '请选择新的有效预算后重新发起',
  },
  reapplyCondition: {
    availability: 'budget_expired',
    message: '原预算已到期，不可继续基于原单重提，请选择新的有效预算',
    canSwitchBudget: true,
  },
};

// 场景4：已驳回 — 非冻结期，按普通新建重新发起
const mockRejectedNonFreezeNodes: ApprovalNode[] = [
  { id: 'rn_start', nodeType: 'start', nodeName: '发起工单', handlerName: '郑十', handlerTime: '2024-06-20 09:00:00', functionOrderNos: ['FO20240620001'] },
  { id: 'rn_n1', nodeType: 'approval', nodeName: '一级审批', handlerName: '孙经理', handlerTime: '2024-06-20 10:30:00', result: '通过', remark: '资料齐全' },
  { id: 'rn_n2', nodeType: 'approval', nodeName: '二级审批', handlerName: '钱总监', handlerTime: '2024-06-20 14:00:00', result: '驳回', remark: '产品型号不符合当前推广政策' },
];

export const mockWorkOrderRejectedNonFreeze: ProductWorkOrder = {
  id: '5', workOrderNo: 'PA202406200001', displayStatus: '已驳回', applicantName: '郑十', applicantOrg: '华中 / 湖北', createTime: '2024-06-20 09:00:00',
  budget: mockBudgets[3], // B2024Q3004 - 非冻结期
  storeGroups: [
    { id: 'g1', storeCode: '31371', storeName: '沈阳迎续商贸有限公司', products: [
      { id: 'p1', productCode: 'SKU003', productName: '浴室柜C款', jdePrice: 2599.00, isDiscount: true, discount: 0.5, maxQuantity: 10, quantity: 3, amount: 3898.50 },
      { id: 'p2', productCode: 'SKU004', productName: '智能龙头D款', jdePrice: 699.00, isDiscount: false, discount: 1, maxQuantity: 30, quantity: 5, amount: 3495.00 },
    ], groupAmount: 7393.50 },
  ],
  totalAmount: 7393.50,
  attachments: [{ id: 'a1', name: '新品推广申请.pdf', url: '#', type: 'pdf', size: 1024 * 768 }],
  approvalNodes: mockRejectedNonFreezeNodes,
  rejectionInfo: {
    rejectedAt: '2024-06-20 14:00:00',
    rejectedBy: '钱总监',
    rejectNodeName: '二级审批',
    rejectReason: '产品型号不符合当前推广政策',
    rejectRemark: '请更换符合推广政策的产品后重新发起',
  },
  reapplyCondition: {
    availability: 'non_freeze_new',
    message: '可按普通新建发起，自行选择预算号',
    canSwitchBudget: true,
  },
};

// 场景5：已结束 — 审批通过，部分订单成功部分失败
// CR-20260706-002: 最终审批通过节点不展示预占订单编号和产品申请订单
const mockCompletedNodes: ApprovalNode[] = [
  { id: 'c_start', nodeType: 'start', nodeName: '发起工单', handlerName: '钱十一', handlerTime: '2024-06-10 08:30:00', functionOrderNos: ['FO20240610001', 'FO20240610002'] },
  { id: 'c_n1', nodeType: 'approval', nodeName: '一级审批', handlerName: '孙经理', handlerTime: '2024-06-10 09:15:00', result: '通过', remark: '预算内，同意' },
  { id: 'c_n2', nodeType: 'approval', nodeName: '二级审批', handlerName: '李总监', handlerTime: '2024-06-10 11:00:00', result: '通过', remark: '审批通过，准予执行' },
];

// CR-20260706-002: 去除 RelatedOrder.remark，去除 GroupResult.failReason 单一字段改为 failReasons[]
const mockCompletedGroupResults: GroupResult[] = [
  { groupId: 'g1', storeCode: '31692', storeName: '赵晋安 宋晓华', functionOrderNos: ['FO20240610001'], relatedOrders: [{ orderNo: 'O20240610001', orderType: '产品申请表订单', orderStatus: '已生成' }] },
  { groupId: 'g2', storeCode: '31441', storeName: '赵晋杰', functionOrderNos: ['FO20240610002'], relatedOrders: [{ orderNo: 'O20240626002', orderType: '内部申请表订单', orderStatus: '生成失败' }], failReasons: ['客户层级为4，不满足内部申请表订单生成条件'] },
];

export const mockWorkOrderCompleted: ProductWorkOrder = {
  id: '6', workOrderNo: 'PA202406100001', displayStatus: '已结束', applicantName: '钱十一', applicantOrg: '华南 / 福建', createTime: '2024-06-10 08:30:00',
  budget: mockBudgets[0],
  storeGroups: [
    { id: 'g1', storeCode: '31692', storeName: '赵晋安 宋晓华', products: [
      { id: 'p1', productCode: 'SKU001', productName: '智能马桶盖A款', jdePrice: 1299.00, isDiscount: true, discount: 0.5, maxQuantity: 20, quantity: 2, amount: 1299.00 },
    ], groupAmount: 1299.00 },
    { id: 'g2', storeCode: '31441', storeName: '赵晋杰', products: [
      { id: 'p2', productCode: 'SKU002', productName: '恒温花洒B款', jdePrice: 899.00, isDiscount: false, discount: 1, maxQuantity: 15, quantity: 3, amount: 2697.00 },
    ], groupAmount: 2697.00 },
  ],
  totalAmount: 3996.00,
  attachments: [
    { id: 'a1', name: '审批附件1.pdf', url: '#', type: 'pdf', size: 1024 * 512 },
    { id: 'a2', name: '产品照片.zip', url: '#', type: 'zip', size: 1024 * 1024 * 5 },
  ],
  approvalNodes: mockCompletedNodes,
  groupResults: mockCompletedGroupResults,
};

// 场景6：已结束 — 全部成功（两种订单类型均覆盖）
// CR-20260706-002: 最终审批通过节点不展示预占订单和产品申请订单
const mockCompletedFullNodes: ApprovalNode[] = [
  { id: 'cf_start', nodeType: 'start', nodeName: '发起工单', handlerName: '孙十九', handlerTime: '2024-07-02 08:00:00', functionOrderNos: ['FO20240702001', 'FO20240702002'] },
  { id: 'cf_n1', nodeType: 'approval', nodeName: '一级审批', handlerName: '周经理', handlerTime: '2024-07-02 09:30:00', result: '通过', remark: '通过' },
  { id: 'cf_n2', nodeType: 'approval', nodeName: '二级审批', handlerName: '吴总监', handlerTime: '2024-07-02 11:00:00', result: '通过', remark: '审批通过' },
];

const mockCompletedFullGroupResults: GroupResult[] = [
  { groupId: 'g1', storeCode: '31692', storeName: '赵晋安 宋晓华', functionOrderNos: ['FO20240702001'], relatedOrders: [{ orderNo: 'O20240702001', orderType: '产品申请表订单', orderStatus: '已生成' }] },
  { groupId: 'g2', storeCode: '31375', storeName: '大连瑞轩商贸有限公司', functionOrderNos: ['FO20240702002'], relatedOrders: [{ orderNo: 'O20240702002', orderType: '内部申请表订单', orderStatus: '已生成' }] },
];

export const mockWorkOrderCompletedFull: ProductWorkOrder = {
  id: '7', workOrderNo: 'PA202407020001', displayStatus: '已结束', applicantName: '孙十九', applicantOrg: '华南 / 广东', createTime: '2024-07-02 08:00:00',
  budget: mockBudgets[0],
  storeGroups: [
    { id: 'g1', storeCode: '31692', storeName: '赵晋安 宋晓华', products: [
      { id: 'p1', productCode: 'SKU001', productName: '智能马桶盖A款', jdePrice: 1299.00, isDiscount: true, discount: 0.5, maxQuantity: 20, quantity: 3, amount: 1948.50 },
    ], groupAmount: 1948.50 },
    { id: 'g2', storeCode: '31375', storeName: '大连瑞轩商贸有限公司', products: [
      { id: 'p2', productCode: 'SKU002', productName: '恒温花洒B款', jdePrice: 899.00, isDiscount: false, discount: 1, maxQuantity: 15, quantity: 5, amount: 4495.00 },
    ], groupAmount: 4495.00 },
  ],
  totalAmount: 6443.50,
  attachments: [{ id: 'a1', name: '全部成功示例.pdf', url: '#', type: 'pdf', size: 1024 * 1024 }],
  approvalNodes: mockCompletedFullNodes,
  groupResults: mockCompletedFullGroupResults,
};

// 场景7：已结束 — 多明细归并生成同一正式订单
const mockCompletedMergedNodes: ApprovalNode[] = [
  { id: 'cm_start', nodeType: 'start', nodeName: '发起工单', handlerName: '郑二十', handlerTime: '2024-07-03 09:00:00', functionOrderNos: ['FO20240703001', 'FO20240703002'] },
  { id: 'cm_n1', nodeType: 'approval', nodeName: '一级审批', handlerName: '王经理', handlerTime: '2024-07-03 10:00:00', result: '通过', remark: '同意' },
  { id: 'cm_n2', nodeType: 'approval', nodeName: '二级审批', handlerName: '李总监', handlerTime: '2024-07-03 11:30:00', result: '通过', remark: '审批通过，归并生成正式订单' },
];

const mockCompletedMergedGroupResults: GroupResult[] = [
  // 两笔明细归并到同一正式订单
  { groupId: 'g1', storeCode: '31692', storeName: '赵晋安 宋晓华', functionOrderNos: ['FO20240703001'], relatedOrders: [{ orderNo: 'O20240703001', orderType: '产品申请表订单', orderStatus: '已生成' }] },
  { groupId: 'g2', storeCode: '31441', storeName: '赵晋杰', functionOrderNos: ['FO20240703002'], relatedOrders: [{ orderNo: 'O20240703001', orderType: '产品申请表订单', orderStatus: '已生成' }] },
];

export const mockWorkOrderCompletedMerged: ProductWorkOrder = {
  id: '8', workOrderNo: 'PA202407030001', displayStatus: '已结束', applicantName: '郑二十', applicantOrg: '华东 / 浙江', createTime: '2024-07-03 09:00:00',
  budget: mockBudgets[3],
  storeGroups: [
    { id: 'g1', storeCode: '31692', storeName: '赵晋安 宋晓华', products: [
      { id: 'p1', productCode: 'SKU001', productName: '智能马桶盖A款', jdePrice: 1299.00, isDiscount: true, discount: 0.5, maxQuantity: 20, quantity: 2, amount: 1299.00 },
    ], groupAmount: 1299.00 },
    { id: 'g2', storeCode: '31441', storeName: '赵晋杰', products: [
      { id: 'p2', productCode: 'SKU002', productName: '恒温花洒B款', jdePrice: 899.00, isDiscount: false, discount: 1, maxQuantity: 15, quantity: 3, amount: 2697.00 },
    ], groupAmount: 2697.00 },
  ],
  totalAmount: 3996.00,
  attachments: [{ id: 'a1', name: '归并生成示例.pdf', url: '#', type: 'pdf', size: 1024 * 512 }],
  approvalNodes: mockCompletedMergedNodes,
  groupResults: mockCompletedMergedGroupResults,
};

// CR-20260706-002: 场景8 — 已结束（多次失败重试，最终成功 + 放弃案例）
// 业务背景：业务同事根据实际情况多次重试订单生成，部分最终成功，部分放弃
const mockCompletedRetryNodes: ApprovalNode[] = [
  { id: 'cr_start', nodeType: 'start', nodeName: '发起工单', handlerName: '黄二十二', handlerTime: '2024-07-05 09:00:00', functionOrderNos: ['FO20240705001', 'FO20240705002'] },
  { id: 'cr_n1', nodeType: 'approval', nodeName: '一级审批', handlerName: '陈经理', handlerTime: '2024-07-05 10:00:00', result: '通过', remark: '同意' },
  { id: 'cr_n2', nodeType: 'approval', nodeName: '二级审批', handlerName: '林总监', handlerTime: '2024-07-05 11:30:00', result: '通过', remark: '审批通过，业务根据实际情况可多次重试生成订单' },
];

// CR-20260706-002: 多次失败重试 + 折叠收起
// 业务说明：
// - 31441: 内部申请表订单失败2次，第3次成功（最终态：已生成）
// - 31375: 内部申请表订单失败1次，业务放弃（最终态：生成失败，保留失败记录）
const mockCompletedRetryGroupResults: GroupResult[] = [
  {
    groupId: 'g1',
    storeCode: '31692',
    storeName: '赵晋安 宋晓华',
    functionOrderNos: ['FO20240705001'],
    relatedOrders: [{ orderNo: 'O20240705001', orderType: '产品申请表订单', orderStatus: '已生成' }],
  },
  {
    groupId: 'g2',
    storeCode: '31441',
    storeName: '赵晋杰',
    functionOrderNos: ['FO20240705002'],
    relatedOrders: [{ orderNo: 'O20240705002', orderType: '内部申请表订单', orderStatus: '已生成' }],
    failReasons: ['客户资质信息缺失，第三次重试前已完成补录'],
    // CR-20260706-002: 多次失败重试历史（按订单号聚合）
    retryHistory: {
      'O20240705002': [
        { attemptAt: '2024-07-05 14:00:00', status: '生成失败', failReason: '客户资质信息缺失' },
        { attemptAt: '2024-07-05 16:30:00', status: '生成失败', failReason: '客户资质审核未通过' },
        { attemptAt: '2024-07-06 09:15:00', status: '已生成' },
      ],
    },
  },
  {
    groupId: 'g3',
    storeCode: '31375',
    storeName: '大连瑞轩商贸有限公司',
    functionOrderNos: ['FO20240705003'],
    relatedOrders: [{ orderNo: 'O20240705003', orderType: '内部申请表订单', orderStatus: '生成失败' }],
    failReasons: ['客户层级为3，不满足内部申请表订单生成条件', '业务同事与财务沟通后决定调整到下一季度，本工单不再重试'],
    retryHistory: {
      'O20240705003': [
        { attemptAt: '2024-07-05 14:30:00', status: '生成失败', failReason: '客户层级不满足条件' },
        { attemptAt: '2024-07-05 17:00:00', status: '生成失败', failReason: '客户层级不满足条件' },
      ],
    },
  },
];

export const mockWorkOrderCompletedRetry: ProductWorkOrder = {
  id: '9', workOrderNo: 'PA202407050001', displayStatus: '已结束', applicantName: '黄二十二', applicantOrg: '华南 / 福建', createTime: '2024-07-05 09:00:00',
  budget: mockBudgets[0],
  storeGroups: [
    { id: 'g1', storeCode: '31692', storeName: '赵晋安 宋晓华', products: [
      { id: 'p1', productCode: 'SKU001', productName: '智能马桶盖A款', jdePrice: 1299.00, isDiscount: true, discount: 0.5, maxQuantity: 20, quantity: 2, amount: 1299.00 },
    ], groupAmount: 1299.00 },
    { id: 'g2', storeCode: '31441', storeName: '赵晋杰', products: [
      { id: 'p2', productCode: 'SKU002', productName: '恒温花洒B款', jdePrice: 899.00, isDiscount: false, discount: 1, maxQuantity: 15, quantity: 3, amount: 2697.00 },
    ], groupAmount: 2697.00 },
    { id: 'g3', storeCode: '31375', storeName: '大连瑞轩商贸有限公司', products: [
      { id: 'p3', productCode: 'SKU003', productName: '浴室柜C款', jdePrice: 2599.00, isDiscount: true, discount: 0.5, maxQuantity: 10, quantity: 1, amount: 1299.50 },
    ], groupAmount: 1299.50 },
  ],
  totalAmount: 5295.50,
  attachments: [{ id: 'a1', name: '多次重试业务说明.pdf', url: '#', type: 'pdf', size: 1024 * 768 }],
  approvalNodes: mockCompletedRetryNodes,
  groupResults: mockCompletedRetryGroupResults,
};

/** 根据场景ID获取对应的 mock 详情数据 */
export function getMockWorkOrderDetail(scene?: string): ProductWorkOrder {
  switch (scene) {
    case 'processing': return mockWorkOrderProcessing;
    case 'rejected-freeze': return mockWorkOrderRejectedFreeze;
    case 'rejected-expired': return mockWorkOrderRejectedExpired;
    case 'rejected-nonfreeze': return mockWorkOrderRejectedNonFreeze;
    case 'completed': return mockWorkOrderCompleted;
    case 'completed-full': return mockWorkOrderCompletedFull;
    case 'completed-merged': return mockWorkOrderCompletedMerged;
    case 'completed-retry': return mockWorkOrderCompletedRetry;
    default: return mockWorkOrderDetail;
  }
}

export function calculateAmount(product: ProductItem): number {
  if (product.isDiscount) return Number((product.jdePrice * product.quantity * product.discount).toFixed(2));
  return Number((product.jdePrice * product.quantity).toFixed(2));
}

// ============================================================
// CR-20260703-001 §2: 驳回后重新发起 — 工单号 → 原预算 映射（Mock）
// ============================================================

/** 演示用：根据工单号查原预算。
 *  真实环境替换为接口请求。 */
const workOrderBudgetMap: Record<string, string> = {
  // PA202406260001 关联一个冻结期预算（id='5'，freezeStartDate=2026-07-01）
  // 用于验证"驳回后重提 → 冻结期"承接逻辑
  'PA202406260001': '5',
}

export function findBudgetByWorkOrderNo(workOrderNo: string): Budget | null {
  const budgetId = workOrderBudgetMap[workOrderNo]
  if (!budgetId) return null
  return mockBudgets.find(b => b.id === budgetId) || null
}

// ============================================================
// CR-20260701-002: 批量导入校验与解析
// ============================================================

/** 校验产品编号是否在允许申请核销范围内 */
export function validateProduct(sku: string): { valid: boolean; product?: typeof mockProductOptions[0] } {
  const p = mockProductOptions.find(x => x.code === sku)
  return p ? { valid: true, product: p } : { valid: false }
}

/** 校验数量：必填、正整数 */
export function validateQuantity(v: string): { valid: boolean; value: number; error?: string } {
  if (!v || v.trim() === '') return { valid: false, value: 0, error: '数量不能为空' }
  const n = Number(v)
  if (!Number.isInteger(n) || n <= 0) return { valid: false, value: 0, error: '数量不是正整数' }
  return { valid: true, value: n }
}

/** 校验专卖店编号是否在当前用户可选范围内 */
export function validateStore(code: string): { valid: boolean; store?: typeof mockStores[0]; error?: string } {
  if (!code || code.trim() === '') return { valid: false, error: '专卖店编号不能为空' }
  const s = mockStores.find(x => x.code === code)
  if (!s) return { valid: false, error: '专卖店编号不存在或无效' }
  if (s.level === 5) return { valid: false, error: '专卖店编号对应客户层级为 5，不允许下单' }
  if (s.orderAllowed === false) return { valid: false, error: '专卖店编号已被设置为不允许下单' }
  return { valid: true, store: s }
}

/** 解析导入文本，支持逗号、空格、制表符分隔，字段顺序：产品编号,数量,专卖店编号 */
export function parseImportText(text: string): { rows: ImportRow[]; errors: ImportError[] } {
  const rows: ImportRow[] = []
  const errors: ImportError[] = []
  const lines = text.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim()
    if (!raw) continue // 跳过空行

    const lineNum = i + 1
    // 按逗号、空格、Tab 分割
    const parts = raw.split(/[, \t]+/).filter(x => x !== '')
    if (parts.length < 3) {
      errors.push({ line: lineNum, field: '格式', message: `数据格式不正确（需要 产品编号,数量,专卖店编号）` })
      continue
    }

    const sku = parts[0]
    const qtyResult = validateQuantity(parts[1])
    const storeCode = parts[2]

    if (!qtyResult.valid) {
      errors.push({ line: lineNum, field: '数量', message: qtyResult.error! })
      continue
    }
    if (!sku) {
      errors.push({ line: lineNum, field: '产品编号', message: '产品编号 不能为空' })
      continue
    }
    if (!storeCode) {
      errors.push({ line: lineNum, field: '专卖店编号', message: '专卖店编号不能为空' })
      continue
    }

    rows.push({ line: lineNum, sku, quantity: qtyResult.value, storeCode })
  }

  return { rows, errors }
}

/** 全量校验已解析的行数据（产品存在性 + 专卖店有效性） */
export function validateImportRows(rows: ImportRow[]): { errors: ImportError[]; warnings: ImportError[] } {
  const errors: ImportError[] = []
  const warnings: ImportError[] = []

  for (const row of rows) {
    // 产品校验（硬拦截）
    const prodResult = validateProduct(row.sku)
    if (!prodResult.valid) {
      errors.push({ line: row.line, field: '产品编号', message: `产品 ${row.sku} 不在允许申请核销范围内` })
    } else if (row.quantity > prodResult.product!.maxQuantity) {
      // 数量超出可申请数量（软警告）
      warnings.push({ line: row.line, field: '数量', message: `产品 ${row.sku} 超出可申请数量（申请 ${row.quantity}，可申请 ${prodResult.product!.maxQuantity}）` })
    }

    // 专卖店校验（硬拦截）
    const storeResult = validateStore(row.storeCode)
    if (!storeResult.valid) {
      errors.push({ line: row.line, field: '专卖店编号', message: storeResult.error! })
    }
  }

  return { errors, warnings }
}

// ============================================================
// CR-20260701-002: 文件导入解析（Excel / CSV）
// ============================================================

/** 解析上传的 Excel 或 CSV 文件，跳过表头行，返回文本行数组（与粘贴导入格式一致） */
export async function parseFileImport(file: File): Promise<{ rows: string[]; error: string | null }> {
  const name = file.name.toLowerCase()

  if (name.endsWith('.csv')) {
    try {
      const text = await file.text()
      // CR-20260703-001: 模板无首行表头，第 1 行即为数据
      const lines = text.split('\n').map(l => l.trim()).filter(l => l)
      if (lines.length === 0) return { rows: [], error: '文件无有效数据行' }
      return { rows: lines, error: null }
    } catch {
      return { rows: [], error: 'CSV 文件读取失败，请检查文件编码' }
    }
  }

  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    try {
      // CR-20260703-001 §7: exceljs 按需加载，减小首屏主包体积
      const ExcelJS = (await import('exceljs')).default
      const buf = await file.arrayBuffer()
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.load(buf)
      const sheetName = workbook.worksheets[0]?.name
      if (!sheetName) return { rows: [], error: 'Excel 文件不包含任何工作表' }
      const sheet = workbook.getWorksheet(sheetName)
      if (!sheet) return { rows: [], error: 'Excel 文件不包含任何工作表' }
      // CR-20260703-001: 模板无首行表头，第 1 行即为数据
      const data: string[][] = []
      sheet.eachRow({ includeEmpty: false }, (row) => {
        const cells: string[] = []
        row.eachCell({ includeEmpty: true }, (cell) => {
          const v = cell.value
          cells.push(v == null ? '' : String(v).trim())
        })
        if (cells.some(c => c !== '')) data.push(cells.slice(0, 3))
      })
      if (data.length === 0) return { rows: [], error: '文件无有效数据行' }
      const rows = data.map(cells => cells.join(','))
      return { rows, error: null }
    } catch {
      return { rows: [], error: 'Excel 文件解析失败，请检查文件是否损坏' }
    }
  }

  return { rows: [], error: '不支持的文件格式，请上传 .xlsx、.xls 或 .csv 文件' }
}

/** 下载导入模板（UTF-8 CSV 格式，无表头，按"产品编号,数量,专卖店编号"顺序纯数据） */
export function downloadImportTemplate(event?: Event) {
  event?.preventDefault()
  event?.stopPropagation()

  // CSV with UTF-8 BOM for proper Chinese character display in Excel/WPS
  const BOM = '\uFEFF'
  // CR-20260703-001: 模板无首行表头，直接为 2 行示例数据
  const csv = BOM
    + 'SKU001,5,31692\n'
    + 'SKU002,3,31441\n'
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '批量导入模板.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
