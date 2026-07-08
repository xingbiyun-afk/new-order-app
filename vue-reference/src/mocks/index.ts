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

// 待办：8条，覆盖不同审批节点、预算类型、申请类型、理由长度
export const mockTodoCards: WorkOrderCard[] = [
  // 发起节点（待一级审批）
  { id: 't1', workOrderType: '产品申请', displayStatus: '处理中', applicantName: '张三', applyType: '新品申请', applyReason: '新品推广', createTime: '06-30 09:00' },
  // 一级审批中
  { id: 't2', workOrderType: '产品申请', displayStatus: '处理中', applicantName: '李四', applyType: '活动申请', applyReason: '618促销活动产品支持，针对核心门店进行首批铺货', createTime: '06-30 14:30' },
  // 二级审批中（对应详情页场景2）
  { id: '2', workOrderType: '产品申请', displayStatus: '处理中', applicantName: '陈十六', applyType: '新品申请', applyReason: '秋季新品区域推广支持', createTime: '06-29 16:00' },
  // 长理由
  { id: 't3', workOrderType: '产品申请', displayStatus: '处理中', applicantName: '王五', applyType: '补货申请', applyReason: '季度常规补货，应对暑期销售高峰，确保核心专卖店库存充足，避免因缺货导致销售机会流失', createTime: '06-29 11:20' },
  // 不同预算类型（大额度预算）
  { id: 't4', workOrderType: '产品申请', displayStatus: '处理中', applicantName: '赵六', applyType: '新品申请', applyReason: '国庆黄金周促销活动铺货准备，提前备货确保假期销售', createTime: '06-28 16:45' },
  // 补货申请
  { id: 't5', workOrderType: '产品申请', displayStatus: '处理中', applicantName: '孙七', applyType: '补货申请', applyReason: '梅雨季节防潮产品专项补货', createTime: '06-27 10:30' },
  // 活动申请
  { id: 't6', workOrderType: '产品申请', displayStatus: '处理中', applicantName: '周八', applyType: '活动申请', applyReason: '双十一预售活动产品备货', createTime: '06-26 14:00' },
  // 跨天时间（对应详情页场景1）
  { id: '1', workOrderType: '产品申请', displayStatus: '处理中', applicantName: '吴九', applyType: '新品申请', applyReason: '春季新品上市推广活动', createTime: '06-25 08:45' },
];

// 已办：8条，覆盖已结束（部分成功/全部成功/归并）+ 已驳回（冻结期/已到期/非冻结期）
export const mockDoneCards: WorkOrderCard[] = [
  // 已结束 - 部分成功（对应详情页场景6）
  { id: '6', workOrderType: '产品申请', displayStatus: '已结束', applicantName: '孙七', applyType: '补货申请', applyReason: '暑期旺季补货', createTime: '06-27 10:00' },
  // 已结束 - 全部成功（对应详情页场景7）
  { id: '7', workOrderType: '产品申请', displayStatus: '已结束', applicantName: '孙十九', applyType: '活动申请', applyReason: '五一劳动节促销活动产品支持', createTime: '06-26 09:15' },
  // 已结束 - 归并生成（对应详情页场景8）
  { id: '8', workOrderType: '产品申请', displayStatus: '已结束', applicantName: '郑二十', applyType: '新品申请', applyReason: '归并生成正式订单示例', createTime: '06-25 14:30' },
  // 已结束 - 多次重试（对应详情页场景9）
  { id: '9', workOrderType: '产品申请', displayStatus: '已结束', applicantName: '黄二十二', applyType: '补货申请', applyReason: '多次重试订单生成，部分成功部分放弃', createTime: '06-24 11:00' },
  // 已结束 - 全部失败，业务放弃（对应详情页场景10）
  { id: '10', workOrderType: '产品申请', displayStatus: '已结束', applicantName: '魏二十三', applyType: '补货申请', applyReason: '所有订单生成失败，业务决定放弃重试', createTime: '06-23 10:00' },
  // 已结束 - 专卖店变更（对应详情页场景11）
  { id: '11', workOrderType: '产品申请', displayStatus: '已结束', applicantName: '冯二十四', applyType: '新品申请', applyReason: '原专卖店库存不足，订单由其他专卖店承接', createTime: '06-22 09:00' },
  // 已结束 - 产品变更（对应详情页场景12）CR-20260708-002
  { id: '12', workOrderType: '产品申请', displayStatus: '已结束', applicantName: '周二十五', applyType: '新品申请', applyReason: '订单生成时部分产品库存不足，产品信息已调整', createTime: '07-08 09:00' },
  // 已结束 - 专卖店+产品双重变更（对应详情页场景13）CR-20260708-002
  { id: '13', workOrderType: '产品申请', displayStatus: '已结束', applicantName: '吴二十六', applyType: '新品申请', applyReason: '专卖店和产品均根据实际情况调整', createTime: '07-09 09:00' },
  // 已驳回 - 冻结期（对应详情页场景3）
  { id: '3', workOrderType: '产品申请', displayStatus: '已驳回', applicantName: '周八', applyType: '活动申请', applyReason: '双十一预售活动产品备货，需提前一个月准备库存', createTime: '06-23 15:30' },
  // 已驳回 - 已到期（对应详情页场景4）
  { id: '4', workOrderType: '产品申请', displayStatus: '已驳回', applicantName: '郑十', applyType: '补货申请', applyReason: '年末库存补充', createTime: '06-22 13:10' },
  // 已驳回 - 非冻结期（对应详情页场景5）
  { id: '5', workOrderType: '产品申请', displayStatus: '已驳回', applicantName: '吴九', applyType: '新品申请', applyReason: '产品型号不符合当前推广政策', createTime: '06-21 10:45' },
  // 处理中（待审批）
  { id: '2', workOrderType: '产品申请', displayStatus: '处理中', applicantName: '陈十六', applyType: '新品申请', applyReason: '秋季新品区域推广支持，针对华东区域核心专卖店', createTime: '06-20 16:00' },
];

// 已发起：8条，三种状态均衡分布，覆盖不同业务场景
export const mockInitiatedCards: WorkOrderCard[] = [
  // 处理中 - 发起节点
  { id: 'i1', workOrderType: '产品申请', displayStatus: '处理中', applicantName: '钱十一', applyType: '新品申请', applyReason: '智能系列新品推广', createTime: '06-30 10:30' },
  // 处理中 - 二级审批中
  { id: '2', workOrderType: '产品申请', displayStatus: '处理中', applicantName: '陈十六', applyType: '新品申请', applyReason: '秋季新品区域推广支持', createTime: '06-29 16:00' },
  // 已结束 - 全部成功
  { id: '7', workOrderType: '产品申请', displayStatus: '已结束', applicantName: '孙十九', applyType: '活动申请', applyReason: '五一劳动节促销活动产品支持，针对全国核心门店', createTime: '06-28 09:15' },
  // 已结束 - 部分失败
  { id: '6', workOrderType: '产品申请', displayStatus: '已结束', applicantName: '孙七', applyType: '补货申请', applyReason: '暑期旺季补货，部分门店订单生成失败', createTime: '06-27 10:00' },
  // 已结束 - 归并生成
  { id: '8', workOrderType: '产品申请', displayStatus: '已结束', applicantName: '郑二十', applyType: '新品申请', applyReason: '多明细归并生成同一正式订单', createTime: '06-26 14:30' },
  // 已驳回 - 冻结期
  { id: '3', workOrderType: '产品申请', displayStatus: '已驳回', applicantName: '周八', applyType: '活动申请', applyReason: '双十一预售活动产品备货，预算处于冻结期', createTime: '06-25 15:30' },
  // 已驳回 - 非冻结期
  { id: '5', workOrderType: '产品申请', displayStatus: '已驳回', applicantName: '吴九', applyType: '补货申请', applyReason: '梅雨季节防潮产品专项补货，确保南方区域专卖店库存充足', createTime: '06-24 13:10' },
  // 已驳回 - 已到期
  { id: '4', workOrderType: '产品申请', displayStatus: '已驳回', applicantName: '郑十', applyType: '新品申请', applyReason: '原预算已到期，无法继续申请', createTime: '06-23 11:00' },
  // 已结束 - 专卖店变更（对应详情页场景11）
  { id: '11', workOrderType: '产品申请', displayStatus: '已结束', applicantName: '冯二十四', applyType: '新品申请', applyReason: '原专卖店库存不足，订单由其他专卖店承接', createTime: '06-22 09:00' },
  // 已结束 - 产品变更（对应详情页场景12）CR-20260708-002
  { id: '12', workOrderType: '产品申请', displayStatus: '已结束', applicantName: '周二十五', applyType: '新品申请', applyReason: '订单生成时部分产品库存不足，产品信息已调整', createTime: '07-08 09:00' },
  // 已结束 - 专卖店+产品双重变更（对应详情页场景13）CR-20260708-002
  { id: '13', workOrderType: '产品申请', displayStatus: '已结束', applicantName: '吴二十六', applyType: '新品申请', applyReason: '专卖店和产品均根据实际情况调整', createTime: '07-09 09:00' },
  // 已结束 - 全部失败，业务放弃（对应详情页场景10）
  { id: '10', workOrderType: '产品申请', displayStatus: '已结束', applicantName: '魏二十三', applyType: '补货申请', applyReason: '所有订单生成失败，业务决定放弃重试', createTime: '06-21 08:00' },
];

const mockApprovalNodes: ApprovalNode[] = [
  { id: 'node_start', nodeType: 'start', nodeName: '发起工单', handlerName: '张三', handlerTime: '2024-06-26 10:17:30', functionOrderNos: ['FO20240626001'] },
  { id: 'node_1', nodeType: 'approval', nodeName: '一级审批', handlerName: '李经理', handlerTime: '2024-06-26 11:30:00', result: '通过', remark: '同意，预算充足' },
  { id: 'node_2', nodeType: 'approval', nodeName: '二级审批', handlerName: '王总监', handlerTime: '2024-06-26 14:00:00', result: '通过', remark: '审批通过' },
];

const mockGroupResults: GroupResult[] = [
  { groupId: 'group_1', storeCode: '31692', storeName: '赵晋安 宋晓华', functionOrderNos: ['FO20240626001'], relatedOrders: [{ orderNo: 'O20240626001', orderType: '产品申请表订单', orderStatus: '已创建', storeCode: '31692', storeName: '赵晋安 宋晓华' }] },
  { groupId: 'group_2', storeCode: '31441', storeName: '赵晋杰', functionOrderNos: ['FO20240626002'], relatedOrders: [{ orderNo: 'O20240626002', orderType: '内部申请表订单', orderStatus: '草稿', storeCode: '31441', storeName: '赵晋杰' }], failReasons: ['产品库存不足，订单提交后自动回退到草稿'] },
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
};

// ============================================================
// CR-20260703-003 / CR-20260707-003: 详情页多场景 Mock 数据
// ============================================================
// 场景1：处理中（多明细 + 多附件 + 完整审批流 + 多节点 + 发起阶段多笔预占库存订单）
// 工单号 PA202407010001 — 用于验证：
//   ① 当前审批进度区展示 ② 审批流发起节点展示预占库存订单 ③ 无正式订单结果 ④ 无订单结果区
const mockProcessingNodes: ApprovalNode[] = [
  // CR-20260706-002: 发起阶段展示所有预占库存订单编号（4笔明细 → 4笔预占库存订单）
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
// 工单号 PA202406280003 — 用于验证：
//   ① 驳回信息区前置展示 ② 重新发起按钮可点击 ③ 提示"基于原单重新发起" ④ 不可切换预算号
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
// 工单号 PA202406150001 — 用于验证：
//   ① 驳回信息区展示 ② 已到期警告提示 ③ 重新发起按钮禁用 ④ 提示选择新预算
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
// 工单号 PA202406200001 — 用于验证：
//   ① 驳回信息区展示 ② 重新发起按钮可点击 ③ 提示"可按普通新建发起" ④ 可切换预算号
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
// CR-20260706-002: 最终审批通过节点不展示预占库存订单编号和产品申请订单
const mockCompletedNodes: ApprovalNode[] = [
  { id: 'c_start', nodeType: 'start', nodeName: '发起工单', handlerName: '钱十一', handlerTime: '2024-06-10 08:30:00', functionOrderNos: ['FO20240610001', 'FO20240610002'] },
  { id: 'c_n1', nodeType: 'approval', nodeName: '一级审批', handlerName: '孙经理', handlerTime: '2024-06-10 09:15:00', result: '通过', remark: '预算内，同意' },
  { id: 'c_n2', nodeType: 'approval', nodeName: '二级审批', handlerName: '李总监', handlerTime: '2024-06-10 11:00:00', result: '通过', remark: '审批通过，准予执行' },
];

// CR-20260706-002: 去除 RelatedOrder.remark，去除 GroupResult.failReason 单一字段改为 failReasons[]
// CR-20260707-002: 状态统一为"已创建/草稿"
// CR-20260708-003-fix: 补全 draftLinks
const mockCompletedGroupResults: GroupResult[] = [
  {
    groupId: 'g1', storeCode: '31692', storeName: '赵晋安 宋晓华', functionOrderNos: ['FO20240610001'],
    relatedOrders: [{ orderNo: 'O20240610001', orderType: '产品申请表订单', orderStatus: '已创建', storeCode: '31692', storeName: '赵晋安 宋晓华' }],
    draftLinks: [
      { draftId: 'draft-1', orderType: '产品申请表订单', isDeleted: false,
        attempts: [{ attemptAt: '2024-06-10 12:00:00', draftId: 'draft-1', orderNo: 'O20240610001', status: '已创建' }],
      },
    ],
  },
  {
    groupId: 'g2', storeCode: '31441', storeName: '赵晋杰', functionOrderNos: ['FO20240610002'],
    relatedOrders: [{ orderNo: 'O20240626002', orderType: '内部申请表订单', orderStatus: '草稿', storeCode: '31441', storeName: '赵晋杰' }],
    failReasons: ['专卖店下单标识关闭，订单自动提交失败回退到草稿'],
    draftLinks: [
      { draftId: 'draft-1', orderType: '内部申请表订单', isDeleted: false,
        attempts: [{ attemptAt: '2024-06-10 12:00:00', draftId: 'draft-1', status: '草稿', failReason: '专卖店下单标识关闭，订单自动提交失败回退到草稿' }],
      },
    ],
    currentResultDescription: '草稿提交失败',
    currentMainReason: '专卖店下单标识关闭，订单自动提交失败回退到草稿',
  },
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
// CR-20260706-002: 最终审批通过节点不展示预占库存订单和产品申请订单
const mockCompletedFullNodes: ApprovalNode[] = [
  { id: 'cf_start', nodeType: 'start', nodeName: '发起工单', handlerName: '孙十九', handlerTime: '2024-07-02 08:00:00', functionOrderNos: ['FO20240702001', 'FO20240702002'] },
  { id: 'cf_n1', nodeType: 'approval', nodeName: '一级审批', handlerName: '周经理', handlerTime: '2024-07-02 09:30:00', result: '通过', remark: '通过' },
  { id: 'cf_n2', nodeType: 'approval', nodeName: '二级审批', handlerName: '吴总监', handlerTime: '2024-07-02 11:00:00', result: '通过', remark: '审批通过' },
];

// CR-20260707-002: 状态统一为"已创建"
// CR-20260708-003-fix: 补全 draftLinks
const mockCompletedFullGroupResults: GroupResult[] = [
  {
    groupId: 'g1', storeCode: '31692', storeName: '赵晋安 宋晓华', functionOrderNos: ['FO20240702001'],
    relatedOrders: [{ orderNo: 'O20240702001', orderType: '产品申请表订单', orderStatus: '已创建', storeCode: '31692', storeName: '赵晋安 宋晓华' }],
    draftLinks: [
      { draftId: 'draft-1', orderType: '产品申请表订单', isDeleted: false,
        attempts: [{ attemptAt: '2024-07-02 12:00:00', draftId: 'draft-1', orderNo: 'O20240702001', status: '已创建' }],
      },
    ],
  },
  {
    groupId: 'g2', storeCode: '31375', storeName: '大连瑞轩商贸有限公司', functionOrderNos: ['FO20240702002'],
    relatedOrders: [{ orderNo: 'O20240702002', orderType: '内部申请表订单', orderStatus: '已创建', storeCode: '31375', storeName: '大连瑞轩商贸有限公司' }],
    draftLinks: [
      { draftId: 'draft-1', orderType: '内部申请表订单', isDeleted: false,
        attempts: [{ attemptAt: '2024-07-02 12:00:00', draftId: 'draft-1', orderNo: 'O20240702002', status: '已创建' }],
      },
    ],
  },
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

// CR-20260707-002: 状态统一为"已创建"
// CR-20260708-003-fix: 补全 draftLinks
const mockCompletedMergedGroupResults: GroupResult[] = [
  // 两笔明细归并到同一正式订单
  {
    groupId: 'g1', storeCode: '31692', storeName: '赵晋安 宋晓华', functionOrderNos: ['FO20240703001'],
    relatedOrders: [{ orderNo: 'O20240703001', orderType: '产品申请表订单', orderStatus: '已创建', storeCode: '31692', storeName: '赵晋安 宋晓华' }],
    draftLinks: [
      { draftId: 'draft-1', orderType: '产品申请表订单', isDeleted: false,
        attempts: [{ attemptAt: '2024-07-03 12:00:00', draftId: 'draft-1', orderNo: 'O20240703001', status: '已创建' }],
      },
    ],
  },
  {
    groupId: 'g2', storeCode: '31441', storeName: '赵晋杰', functionOrderNos: ['FO20240703002'],
    relatedOrders: [{ orderNo: 'O20240703001', orderType: '产品申请表订单', orderStatus: '已创建', storeCode: '31441', storeName: '赵晋杰' }],
    draftLinks: [
      { draftId: 'draft-1', orderType: '产品申请表订单', isDeleted: false,
        attempts: [{ attemptAt: '2024-07-03 12:00:00', draftId: 'draft-1', orderNo: 'O20240703001', status: '已创建' }],
      },
    ],
  },
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

// CR-20260706-002 / CR-20260708-001 场景8：已结束（多次重试最终成功）
// 工单号 PA202407050001 — 验证 §6.10.13 规则：
//   ① draft 记录无订单号（未生成订单的提交）② 驳回不产生新 retryHistory 条目
//   ③ 驳回理由展示在 retryHistory[orderNo] 的 failReason 中
//   ④ 删除原因走 outerRemark 通道，不入 retryHistory
// 5 组子场景：g1 无重试直接成功 / g2 继续编辑2次失败后成功
//   g3 失败→删除→新建草稿→成功 / g4 驳回→继续编辑→成功 / g5 驳回→删除→新建→成功
const mockCompletedRetryNodes: ApprovalNode[] = [
  { id: 'cr_start', nodeType: 'start', nodeName: '发起工单', handlerName: '黄二十二', handlerTime: '2024-07-05 09:00:00', functionOrderNos: ['FO20240705001', 'FO20240705002', 'FO20240705004', 'FO20240705005'] },
  { id: 'cr_n1', nodeType: 'approval', nodeName: '一级审批', handlerName: '陈经理', handlerTime: '2024-07-05 10:00:00', result: '通过', remark: '同意' },
  { id: 'cr_n2', nodeType: 'approval', nodeName: '二级审批', handlerName: '林总监', handlerTime: '2024-07-05 11:30:00', result: '通过', remark: '审批通过，业务根据实际情况可多次重试生成订单' },
];

  // CR-20260706-002: 多次失败重试历史（按订单号聚合）
  // CR-20260707-002: 状态统一为"已创建/草稿"；外层只承接最新结果摘要
  // CR-20260708-001: 子场景完整覆盖 6 类 —
  //   ① g2: 自动提交失败 → 原草稿继续编辑重试 → 成功
  //   ② g1(scene9): 自动提交失败 → 删除原草稿 → 业务放弃
  //   ③ g3: 自动提交失败 → 删除原草稿后新建草稿 → 成功
  //   ④ g4: 审核驳回回草稿 → 原草稿继续编辑重试 → 成功
  //   ⑤ g3(scene9): 审核驳回回草稿 → 删除原草稿 → 业务放弃
  //   ⑥ g5: 审核驳回回草稿 → 删除原草稿后新建草稿 → 成功
  // 业务说明：
  // - 31692(g1): 产品申请表订单，一次成功 → 子场景「无重试，直接成功」
  // - 31441(g2): 内部申请表订单，自动提交失败2次后第3次成功 → 子场景①「原草稿继续编辑重试，最终成功」
  // - 31375(g3): 内部申请表订单，自动提交失败1次→删除原草稿→新建草稿→成功 → 子场景③「删除原草稿后新建草稿，最终成功」
  // - 50002(g4): 产品申请表订单，审核驳回回草稿→原草稿继续编辑→成功 → 子场景④「审核驳回回草稿后继续编辑，最终成功」
  // - 50003(g5): 内部申请表订单，审核驳回回草稿→删除原草稿→新建草稿→成功 → 子场景⑥「审核驳回回草稿后删除并新建，最终成功」
  const mockCompletedRetryGroupResults: GroupResult[] = [
    // 子场景①: 原草稿继续编辑重试 → 成功（g1: 31692 赵晋安）
    // 第1次提交失败（无订单号）→ 继续编辑同一草稿 → 第2次提交成功
    {
      groupId: 'g1',
      storeCode: '31692',
      storeName: '赵晋安 宋晓华',
      functionOrderNos: ['FO20240705001'],
      relatedOrders: [
        { orderType: '产品申请表订单', orderStatus: '草稿', storeCode: '31692', storeName: '赵晋安 宋晓华' },
        { orderNo: 'O20240705001', orderType: '产品申请表订单', orderStatus: '已创建', storeCode: '31692', storeName: '赵晋安 宋晓华' },
      ],
      retryHistory: {
        'draft': [
          { attemptAt: '2024-07-05 10:00:00', draftId: 'draft-1', status: '草稿', failReason: '产品库存不足，订单自动提交失败回退到草稿' },
        ],
        'O20240705001': [
          { attemptAt: '2024-07-06 09:00:00', draftId: 'draft-1', orderNo: 'O20240705001', status: '已创建' },
        ],
      },
      // CR-20260708-002: 按 draftId 聚合的草稿链路
      draftLinks: [
        {
          draftId: 'draft-1', orderType: '产品申请表订单', isDeleted: false,
          attempts: [
            { attemptAt: '2024-07-05 10:00:00', draftId: 'draft-1', status: '草稿', failReason: '产品库存不足，订单自动提交失败回退到草稿' },
            { attemptAt: '2024-07-06 09:00:00', draftId: 'draft-1', orderNo: 'O20240705001', status: '已创建' },
          ],
        },
      ],
    },
    // 子场景①: 原草稿继续编辑重试2次 → 第3次成功（g2: 31441 赵晋杰）
    // 第1次提交失败（无订单号）→ 第2次提交失败（无订单号）→ 第3次提交成功
    {
      groupId: 'g2',
      storeCode: '31441',
      storeName: '赵晋杰',
      functionOrderNos: ['FO20240705002'],
      relatedOrders: [
        { orderType: '内部申请表订单', orderStatus: '草稿', storeCode: '31441', storeName: '赵晋杰' },
        { orderNo: 'O20240705002', orderType: '内部申请表订单', orderStatus: '已创建', storeCode: '31441', storeName: '赵晋杰' },
      ],
      retryHistory: {
        'draft': [
          { attemptAt: '2024-07-05 14:00:00', draftId: 'draft-1', status: '草稿', failReason: '产品库存不足，订单自动提交失败回退到草稿' },
          { attemptAt: '2024-07-05 16:30:00', draftId: 'draft-1', status: '草稿', failReason: '专卖店下单标识关闭，订单自动提交失败回退到草稿' },
        ],
        'O20240705002': [
          { attemptAt: '2024-07-06 09:15:00', draftId: 'draft-1', orderNo: 'O20240705002', status: '已创建' },
        ],
      },
      // CR-20260708-002: 按 draftId 聚合的草稿链路（同一 draftId 下多次失败最终成功）
      draftLinks: [
        {
          draftId: 'draft-1', orderType: '内部申请表订单', isDeleted: false,
          attempts: [
            { attemptAt: '2024-07-05 14:00:00', draftId: 'draft-1', status: '草稿', failReason: '产品库存不足，订单自动提交失败回退到草稿' },
            { attemptAt: '2024-07-05 16:30:00', draftId: 'draft-1', status: '草稿', failReason: '专卖店下单标识关闭，订单自动提交失败回退到草稿' },
            { attemptAt: '2024-07-06 09:15:00', draftId: 'draft-1', orderNo: 'O20240705002', status: '已创建' },
          ],
        },
      ],
    },
    // 子场景③: 删除原草稿后新建草稿 → 成功（g3: 31375 大连瑞轩）
    // 第1次提交失败（无订单号）→ 删除原草稿 → 新建草稿 → 第2次提交成功
    {
      groupId: 'g3',
      storeCode: '31375',
      storeName: '大连瑞轩商贸有限公司',
      functionOrderNos: ['FO20240705003'],
      relatedOrders: [
        { orderType: '内部申请表订单', orderStatus: '草稿', storeCode: '31375', storeName: '大连瑞轩商贸有限公司' },
        { orderNo: 'O20240705003', orderType: '内部申请表订单', orderStatus: '已创建', storeCode: '31375', storeName: '大连瑞轩商贸有限公司' },
      ],
      retryHistory: {
        'draft': [
          { attemptAt: '2024-07-05 14:30:00', draftId: 'draft-1', status: '草稿', failReason: '产品库存不足，订单自动提交失败回退到草稿' },
        ],
        'O20240705003': [
          { attemptAt: '2024-07-06 09:30:00', draftId: 'draft-2', orderNo: 'O20240705003', status: '已创建' },
        ],
      },
      // CR-20260708-002: 按 draftId 聚合（删除原草稿后新建草稿 = 2条草稿链路）
      draftLinks: [
        {
          draftId: 'draft-1', orderType: '内部申请表订单', isDeleted: true,
          deleteReason: '库存持续不足，删除后重新新建草稿申请',
          attempts: [
            { attemptAt: '2024-07-05 14:30:00', draftId: 'draft-1', status: '草稿', failReason: '产品库存不足，订单自动提交失败回退到草稿' },
          ],
        },
        {
          draftId: 'draft-2', orderType: '内部申请表订单', isDeleted: false,
          attempts: [
            { attemptAt: '2024-07-06 09:30:00', draftId: 'draft-2', orderNo: 'O20240705003', status: '已创建' },
          ],
        },
      ],
    },
    // 子场景④: 审核驳回回草稿 → 原草稿继续编辑重试 → 成功（g4: 50002 测试专卖店B）
    // 订单号A生成成功 → 财务审核驳回回草稿 → 原草稿继续编辑 → 重新提交生成新订单号B
    {
      groupId: 'g4',
      storeCode: '50002',
      storeName: '测试专卖店B',
      functionOrderNos: ['FO20240705004'],
      relatedOrders: [
        { orderNo: 'O20240705004', orderType: '产品申请表订单', orderStatus: '草稿', storeCode: '50002', storeName: '测试专卖店B' },
        { orderNo: 'O20240705005', orderType: '产品申请表订单', orderStatus: '已创建', storeCode: '50002', storeName: '测试专卖店B' },
      ],
      retryHistory: {
        'O20240705004': [
          { attemptAt: '2024-07-06 11:00:00', draftId: 'draft-1', orderNo: 'O20240705004', status: '草稿', failReason: '订单审核被驳回到草稿状态，请重新检查产品信息与专卖店资质' },
        ],
        'O20240705005': [
          { attemptAt: '2024-07-07 09:30:00', draftId: 'draft-1', orderNo: 'O20240705005', status: '已创建' },
        ],
      },
      // CR-20260708-002: 审核驳回回草稿后继续编辑（同一 draftId）
      draftLinks: [
        {
          draftId: 'draft-1', orderType: '产品申请表订单', isDeleted: false,
          attempts: [
            { attemptAt: '2024-07-06 11:00:00', draftId: 'draft-1', orderNo: 'O20240705004', status: '草稿', failReason: '订单审核被驳回到草稿状态，请重新检查产品信息与专卖店资质' },
            { attemptAt: '2024-07-07 09:30:00', draftId: 'draft-1', orderNo: 'O20240705005', status: '已创建' },
          ],
        },
      ],
    },
    // 子场景⑥: 审核驳回回草稿 → 删除原草稿后新建草稿 → 成功（g5: 50003 测试专卖店C）
    // 订单号A生成成功 → 财务审核驳回回草稿 → 删除原草稿 → 新建草稿 → 重新提交生成新订单号B
    {
      groupId: 'g5',
      storeCode: '50003',
      storeName: '测试专卖店C',
      functionOrderNos: ['FO20240705005'],
      relatedOrders: [
        { orderNo: 'O20240705005', orderType: '内部申请表订单', orderStatus: '草稿', storeCode: '50003', storeName: '测试专卖店C' },
        { orderNo: 'O20240705006', orderType: '内部申请表订单', orderStatus: '已创建', storeCode: '50003', storeName: '测试专卖店C' },
      ],
      retryHistory: {
        'O20240705005': [
          { attemptAt: '2024-07-06 10:30:00', draftId: 'draft-1', orderNo: 'O20240705005', status: '草稿', failReason: '订单审核被驳回到草稿状态，财务审核不通过' },
        ],
        'O20240705006': [
          { attemptAt: '2024-07-07 10:00:00', draftId: 'draft-2', orderNo: 'O20240705006', status: '已创建' },
        ],
      },
      // CR-20260708-002: 审核驳回回草稿后删除原草稿并新建（2条草稿链路）
      draftLinks: [
        {
          draftId: 'draft-1', orderType: '内部申请表订单', isDeleted: true,
          deleteReason: '财务审核不通过，删除后调整业务方案重新申请',
          attempts: [
            { attemptAt: '2024-07-06 10:30:00', draftId: 'draft-1', orderNo: 'O20240705005', status: '草稿', failReason: '订单审核被驳回到草稿状态，财务审核不通过' },
          ],
        },
        {
          draftId: 'draft-2', orderType: '内部申请表订单', isDeleted: false,
          attempts: [
            { attemptAt: '2024-07-07 10:00:00', draftId: 'draft-2', orderNo: 'O20240705006', status: '已创建' },
          ],
        },
      ],
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
    // CR-20260708-001: g4 审核驳回回草稿子场景④
    { id: 'g4', storeCode: '50002', storeName: '测试专卖店B', products: [
      { id: 'p4', productCode: 'SKU004', productName: '智能马桶盖B款', jdePrice: 1599.00, isDiscount: false, discount: 1, maxQuantity: 10, quantity: 2, amount: 3198.00 },
    ], groupAmount: 3198.00 },
    // CR-20260708-001: g5 审核驳回回草稿子场景⑥
    { id: 'g5', storeCode: '50003', storeName: '测试专卖店C', products: [
      { id: 'p5', productCode: 'SKU005', productName: '恒温花洒C款', jdePrice: 1099.00, isDiscount: true, discount: 0.7, maxQuantity: 15, quantity: 3, amount: 2307.90 },
    ], groupAmount: 2307.90 },
  ],
  totalAmount: 10801.40,
  attachments: [{ id: 'a1', name: '多次重试业务说明.pdf', url: '#', type: 'pdf', size: 1024 * 768 }],
  approvalNodes: mockCompletedRetryNodes,
  groupResults: mockCompletedRetryGroupResults,
};

// CR-20260707-003 / CR-20260708-001 场景9：已结束（全部失败，业务放弃）
// 工单号 PA202407060001 — 验证 §6.10.13 规则：
//   ① draft 记录无订单号 ② 删除原因走 outerRemark，不入 retryHistory
//   ③ 仅展示最新失败原因（规则7）④ 外层优先从 retryHistory 读取失败原因，与内层保持一致
// 3 组子场景：g1 失败→删除→放弃(outerRemark) / g2 失败→继续编辑→仍失败→放弃
//   g3 驳回→删除→放弃(outerRemark)
const mockCompletedAllFailedNodes: ApprovalNode[] = [
  { id: 'ca_start', nodeType: 'start', nodeName: '发起工单', handlerName: '魏二十三', handlerTime: '2024-07-06 09:00:00', functionOrderNos: ['FO20240706001', 'FO20240706002', 'FO20240706003'] },
  { id: 'ca_n1', nodeType: 'approval', nodeName: '一级审批', handlerName: '赵经理', handlerTime: '2024-07-06 10:00:00', result: '通过', remark: '同意' },
  { id: 'ca_n2', nodeType: 'approval', nodeName: '二级审批', handlerName: '钱总监', handlerTime: '2024-07-06 11:30:00', result: '通过', remark: '审批通过，订单生成根据实际情况处理' },
];

// CR-20260707-002: 状态统一为"草稿"，外层只展示最新失败备注
// CR-20260708-001: 场景② — g1 删除原草稿后业务放弃（自动提交失败）；g2 原草稿继续编辑重试一次后放弃；
//               子场景⑤ — g3 审核驳回回草稿后删除原草稿并业务放弃
const mockCompletedAllFailedGroupResults: GroupResult[] = [
  // 场景②: 删除原草稿，不再发起（自动提交失败）
  // 第1次失败(无订单号) → 业务主动删除原草稿 → 不再重试
  { groupId: 'g1', storeCode: '31375', storeName: '大连瑞轩商贸有限公司', functionOrderNos: ['FO20240706001'], relatedOrders: [{ orderType: '内部申请表订单', orderStatus: '草稿', storeCode: '31375', storeName: '大连瑞轩商贸有限公司' }],
    outerRemark: '库存持续不足且短期内无法补齐，经与财务沟通确认删除此草稿，调整到下一季度预算再申请',
    retryHistory: {
      'draft': [
        { attemptAt: '2024-07-06 14:00:00', draftId: 'draft-1', status: '草稿', failReason: '产品库存不足，订单自动提交失败回退到草稿' },
      ],
    },
    // CR-20260708-002: 删除原草稿后业务放弃（已删除草稿链路）
    draftLinks: [
      {
        draftId: 'draft-1', orderType: '内部申请表订单', isDeleted: true,
        deleteReason: '库存持续不足且短期内无法补齐，经与财务沟通确认删除此草稿，调整到下一季度预算再申请',
        attempts: [
          { attemptAt: '2024-07-06 14:00:00', draftId: 'draft-1', status: '草稿', failReason: '产品库存不足，订单自动提交失败回退到草稿' },
        ],
      },
    ],
    currentResultDescription: '草稿已删除',
    currentMainReason: '库存持续不足且短期内无法补齐，经与财务沟通确认删除此草稿，调整到下一季度预算再申请',
  },
  // 场景①: 原草稿继续编辑重试 → 仍失败 → 业务放弃
  // 规则7: 从未生成过订单，1条记录，无订单号，只显示最新失败原因
  { groupId: 'g2', storeCode: '50001', storeName: '层级5测试专卖店', functionOrderNos: ['FO20240706002'], relatedOrders: [{ orderType: '产品申请表订单', orderStatus: '草稿', storeCode: '50001', storeName: '层级5测试专卖店' }],
    outerRemark: '已重试1次仍失败，业务放弃',
    retryHistory: {
      'draft': [
        { attemptAt: '2024-07-07 10:00:00', draftId: 'draft-1', status: '草稿', failReason: '专卖店下单标识仍关闭，重新提交后自动回退到草稿' },
      ],
    },
    // CR-20260708-002: 原草稿继续编辑重试后仍失败（未删除，但业务放弃）
    draftLinks: [
      {
        draftId: 'draft-1', orderType: '产品申请表订单', isDeleted: false,
        attempts: [
          { attemptAt: '2024-07-07 10:00:00', draftId: 'draft-1', status: '草稿', failReason: '专卖店下单标识仍关闭，重新提交后自动回退到草稿' },
        ],
      },
    ],
    currentResultDescription: '草稿提交失败',
    currentMainReason: '专卖店下单标识仍关闭，重新提交后自动回退到草稿',
  },
  // 子场景⑤: 审核驳回回草稿 → 删除原草稿 → 业务放弃
  // 订单号A生成成功 → 财务审核驳回回草稿 → 业务删除原草稿 → 不再重试
  { groupId: 'g3', storeCode: '50004', storeName: '测试专卖店D', functionOrderNos: ['FO20240706003'], relatedOrders: [{ orderNo: 'O20240706003', orderType: '内部申请表订单', orderStatus: '草稿', storeCode: '50004', storeName: '测试专卖店D' }],
    outerRemark: '审核驳回后业务重新评估，经与财务沟通确认删除此草稿，调整业务方案后重新提报',
    retryHistory: {
      'O20240706003': [
        { attemptAt: '2024-07-07 14:00:00', draftId: 'draft-1', orderNo: 'O20240706003', status: '草稿', failReason: '订单审核被驳回到草稿状态，财务审核不通过' },
      ],
    },
    // CR-20260708-002: 审核驳回回草稿后删除原草稿并业务放弃
    draftLinks: [
      {
        draftId: 'draft-1', orderType: '内部申请表订单', isDeleted: true,
        deleteReason: '审核驳回后业务重新评估，经与财务沟通确认删除此草稿，调整业务方案后重新提报',
        attempts: [
          { attemptAt: '2024-07-07 14:00:00', draftId: 'draft-1', orderNo: 'O20240706003', status: '草稿', failReason: '订单审核被驳回到草稿状态，财务审核不通过' },
        ],
      },
    ],
    currentResultDescription: '草稿已删除',
    currentMainReason: '审核驳回后业务重新评估，经与财务沟通确认删除此草稿，调整业务方案后重新提报',
  },
];

export const mockWorkOrderCompletedAllFailed: ProductWorkOrder = {
  id: '10', workOrderNo: 'PA202407060001', displayStatus: '已结束', applicantName: '魏二十三', applicantOrg: '东北 / 辽宁', createTime: '2024-07-06 09:00:00',
  budget: mockBudgets[2], // B2024Q3003 - 零剩余额度预算
  storeGroups: [
    { id: 'g1', storeCode: '31375', storeName: '大连瑞轩商贸有限公司', products: [
      { id: 'p1', productCode: 'SKU002', productName: '恒温花洒B款', jdePrice: 899.00, isDiscount: false, discount: 1, maxQuantity: 15, quantity: 5, amount: 4495.00 },
    ], groupAmount: 4495.00 },
    { id: 'g2', storeCode: '50001', storeName: '层级5测试专卖店', products: [
      { id: 'p2', productCode: 'SKU001', productName: '智能马桶盖A款', jdePrice: 1299.00, isDiscount: true, discount: 0.5, maxQuantity: 20, quantity: 2, amount: 1299.00 },
    ], groupAmount: 1299.00 },
    // CR-20260708-001: g3 审核驳回回草稿子场景⑤
    { id: 'g3', storeCode: '50004', storeName: '测试专卖店D', products: [
      { id: 'p3', productCode: 'SKU003', productName: '浴室柜C款', jdePrice: 2599.00, isDiscount: true, discount: 0.5, maxQuantity: 10, quantity: 1, amount: 1299.50 },
    ], groupAmount: 1299.50 },
  ],
  totalAmount: 7093.50,
  attachments: [{ id: 'a1', name: '客户资质说明.pdf', url: '#', type: 'pdf', size: 1024 * 1024 }],
  approvalNodes: mockCompletedAllFailedNodes,
  groupResults: mockCompletedAllFailedGroupResults,
};

// CR-20260707-003 场景10：
// 已结束 — 专卖店变更（订单实际所属专卖店与工单明细专卖店不一致）
// 工单号 PA202407070001 — 用于验证：
//   ① 实际专卖店与工单明细不一致时展示橙色警告 ② 备注说明变更原因 ③ 原始专卖店保留在卡片头
// 业务背景：工单通过时记录的专卖店是 A（31692 赵晋安 宋晓华），
// 但 A 库存不足无法生成订单，最终由 B 专卖店（31441 赵晋杰）承接此笔订单
const mockStoreChangeNodes: ApprovalNode[] = [
  { id: 'sc_start', nodeType: 'start', nodeName: '发起工单', handlerName: '冯二十四', handlerTime: '2024-07-07 09:00:00', functionOrderNos: ['FO20240707001'] },
  { id: 'sc_n1', nodeType: 'approval', nodeName: '一级审批', handlerName: '周经理', handlerTime: '2024-07-07 10:00:00', result: '通过', remark: '同意' },
  { id: 'sc_n2', nodeType: 'approval', nodeName: '二级审批', handlerName: '吴总监', handlerTime: '2024-07-07 11:30:00', result: '通过', remark: '审批通过，订单生成时由原专卖店 A 调整为专卖店 B（库存不足）' },
];

// CR-20260707-002: 状态统一为"已创建"
const mockStoreChangeGroupResults: GroupResult[] = [
  {
    groupId: 'g1',
    storeCode: '31692',         // 工单明细原始专卖店 A
    storeName: '赵晋安 宋晓华',
    functionOrderNos: ['FO20240707001'],
    relatedOrders: [{
      orderNo: 'O20240707001',
      orderType: '产品申请表订单',
      orderStatus: '已创建',    // CR-20260707-002: 统一为"已创建"
      storeCode: '31441',      // 实际承接专卖店 B（与原始不一致）
      storeName: '赵晋杰',
      remark: '原专卖店库存不足，无法生成对应订单，经业务确认更换专卖店承接此笔订单',
    }],
    // CR-20260708-002: 专卖店变更场景 — 当前结果说明 + 主原因
    currentResultDescription: '订单已创建（信息变更）',
    actualStoreCode: '31441',
    actualStoreName: '赵晋杰',
    // CR-20260708-003-fix: 补全草稿链路历史
    // 业务过程：先提交到原专卖店31692因库存不足失败 → 退回草稿后修改专卖店为31441 → 重新提交成功
    draftLinks: [
      {
        draftId: 'draft-1', orderType: '产品申请表订单', isDeleted: false,
        attempts: [
          { attemptAt: '2024-07-07 12:00:00', draftId: 'draft-1', status: '草稿', failReason: '原专卖店（31692 赵晋安 宋晓华）库存不足，订单自动提交失败回退到草稿' },
          { attemptAt: '2024-07-07 14:30:00', draftId: 'draft-1', orderNo: 'O20240707001', status: '已创建' },
        ],
      },
    ],
  },
];

export const mockWorkOrderStoreChange: ProductWorkOrder = {
  id: '11', workOrderNo: 'PA202407070001', displayStatus: '已结束', applicantName: '冯二十四', applicantOrg: '华南 / 广东', createTime: '2024-07-07 09:00:00',
  budget: mockBudgets[0],
  storeGroups: [
    { id: 'g1', storeCode: '31692', storeName: '赵晋安 宋晓华', products: [
      { id: 'p1', productCode: 'SKU001', productName: '智能马桶盖A款', jdePrice: 1299.00, isDiscount: true, discount: 0.5, maxQuantity: 20, quantity: 5, amount: 3247.50 },
    ], groupAmount: 3247.50 },
  ],
  totalAmount: 3247.50,
  attachments: [{ id: 'a1', name: '专卖店变更说明.pdf', url: '#', type: 'pdf', size: 1024 * 1024 }],
  approvalNodes: mockStoreChangeNodes,
  groupResults: mockStoreChangeGroupResults,
};



// CR-20260708-002 场景12：已结束 — 产品变更（订单产品与原申请不一致）
// 工单号 PA202407080001 — 验证：
//   ① 产品SKU或数量与原申请不一致 ② 展示"订单已创建（信息变更）" ③ 产品变更摘要
const mockProductChangeNodes: ApprovalNode[] = [
  { id: 'pc_start', nodeType: 'start', nodeName: '发起工单', handlerName: '周二十五', handlerTime: '2024-07-08 09:00:00', functionOrderNos: ['FO20240708001'] },
  { id: 'pc_n1', nodeType: 'approval', nodeName: '一级审批', handlerName: '郑经理', handlerTime: '2024-07-08 10:00:00', result: '通过', remark: '同意' },
  { id: 'pc_n2', nodeType: 'approval', nodeName: '二级审批', handlerName: '王总监', handlerTime: '2024-07-08 11:30:00', result: '通过', remark: '审批通过，订单生成时部分产品库存不足已调整' },
];

const mockProductChangeGroupResults: GroupResult[] = [
  {
    groupId: 'g1', storeCode: '31692', storeName: '赵晋安 宋晓华',
    functionOrderNos: ['FO20240708001'],
    relatedOrders: [{
      orderNo: 'O20240708001', orderType: '产品申请表订单', orderStatus: '已创建',
      storeCode: '31692', storeName: '赵晋安 宋晓华',
    }],
    // CR-20260708-002: 产品变更场景
    currentResultDescription: '订单已创建（信息变更）',
    productChangeSummary: { changedSkuCount: 2, totalQuantityDiff: 5 },
    // CR-20260708-003-fix: 补全草稿链路历史
    // 业务过程：先提交成功但因部分产品库存不足导致产品信息自动调整 → 订单已创建但产品变更
    draftLinks: [
      {
        draftId: 'draft-1', orderType: '产品申请表订单', isDeleted: false,
        attempts: [
          { attemptAt: '2024-07-08 12:00:00', draftId: 'draft-1', status: '草稿', failReason: '部分产品库存不足，订单自动提交失败回退到草稿' },
          { attemptAt: '2024-07-08 14:00:00', draftId: 'draft-1', orderNo: 'O20240708001', status: '已创建' },
        ],
      },
    ],
  },
];

export const mockWorkOrderProductChange: ProductWorkOrder = {
  id: '12', workOrderNo: 'PA202407080001', displayStatus: '已结束', applicantName: '周二十五', applicantOrg: '华南 / 广东', createTime: '2024-07-08 09:00:00',
  budget: mockBudgets[0],
  storeGroups: [
    { id: 'g1', storeCode: '31692', storeName: '赵晋安 宋晓华', products: [
      { id: 'p1', productCode: 'SKU001', productName: '智能马桶盖A款', jdePrice: 1299.00, isDiscount: true, discount: 0.5, maxQuantity: 20, quantity: 5, amount: 3247.50 },
      { id: 'p2', productCode: 'SKU002', productName: '恒温花洒B款', jdePrice: 899.00, isDiscount: false, discount: 1, maxQuantity: 15, quantity: 3, amount: 2697.00 },
    ], groupAmount: 5944.50 },
  ],
  totalAmount: 5944.50,
  attachments: [{ id: 'a1', name: '产品变更说明.pdf', url: '#', type: 'pdf', size: 1024 * 1024 }],
  approvalNodes: mockProductChangeNodes,
  groupResults: mockProductChangeGroupResults,
};

// CR-20260708-002 场景13：已结束 — 专卖店+产品双重变更
// 工单号 PA202407090001 — 验证：
//   ① 专卖店和产品同时变更 ② 展示"订单已创建（信息变更）" ③ 双重变更摘要
const mockStoreAndProductChangeNodes: ApprovalNode[] = [
  { id: 'spc_start', nodeType: 'start', nodeName: '发起工单', handlerName: '吴二十六', handlerTime: '2024-07-09 09:00:00', functionOrderNos: ['FO20240709001'] },
  { id: 'spc_n1', nodeType: 'approval', nodeName: '一级审批', handlerName: '冯经理', handlerTime: '2024-07-09 10:00:00', result: '通过', remark: '同意' },
  { id: 'spc_n2', nodeType: 'approval', nodeName: '二级审批', handlerName: '陈总监', handlerTime: '2024-07-09 11:30:00', result: '通过', remark: '审批通过，专卖店和产品均根据实际情况调整' },
];

const mockStoreAndProductChangeGroupResults: GroupResult[] = [
  {
    groupId: 'g1', storeCode: '31692', storeName: '赵晋安 宋晓华',
    functionOrderNos: ['FO20240709001'],
    relatedOrders: [{
      orderNo: 'O20240709001', orderType: '产品申请表订单', orderStatus: '已创建',
      storeCode: '31441', storeName: '赵晋杰',
    }],
    // CR-20260708-002: 双重变更场景
    currentResultDescription: '订单已创建（信息变更）',
    actualStoreCode: '31441',
    actualStoreName: '赵晋杰',
    productChangeSummary: { changedSkuCount: 1, totalQuantityDiff: 2 },
    // CR-20260708-003-fix: 补全草稿链路历史
    // 业务过程：先提交到原专卖店31692因库存不足失败 → 退回草稿后同时更换专卖店为31441并调整产品 → 重新提交成功
    draftLinks: [
      {
        draftId: 'draft-1', orderType: '产品申请表订单', isDeleted: false,
        attempts: [
          { attemptAt: '2024-07-09 12:00:00', draftId: 'draft-1', status: '草稿', failReason: '原专卖店（31692 赵晋安 宋晓华）库存不足，订单自动提交失败回退到草稿' },
          { attemptAt: '2024-07-09 14:30:00', draftId: 'draft-1', orderNo: 'O20240709001', status: '已创建' },
        ],
      },
    ],
  },
];

export const mockWorkOrderStoreAndProductChange: ProductWorkOrder = {
  id: '13', workOrderNo: 'PA202407090001', displayStatus: '已结束', applicantName: '吴二十六', applicantOrg: '华东 / 浙江', createTime: '2024-07-09 09:00:00',
  budget: mockBudgets[0],
  storeGroups: [
    { id: 'g1', storeCode: '31692', storeName: '赵晋安 宋晓华', products: [
      { id: 'p1', productCode: 'SKU001', productName: '智能马桶盖A款', jdePrice: 1299.00, isDiscount: true, discount: 0.5, maxQuantity: 20, quantity: 5, amount: 3247.50 },
    ], groupAmount: 3247.50 },
  ],
  totalAmount: 3247.50,
  attachments: [{ id: 'a1', name: '专卖店与产品双重变更说明.pdf', url: '#', type: 'pdf', size: 1024 * 1024 }],
  approvalNodes: mockStoreAndProductChangeNodes,
  groupResults: mockStoreAndProductChangeGroupResults,
};

// ============================================================
// CR-20260707-003: 详情页场景映射总表
// ============================================================
// 本表集中维护 scene key ↔ id ↔ 工单号 ↔ 主状态 的映射关系，
// 用于支撑详情页场景验收、测试走查、AI 自检快速定位。
//
// | 场景序号 | scene key                  | id  | 工单号         | 主状态   | CR-20260708-001 子场景 | CR-20260708-002 验证点        |
// |---------|----------------------------|-----|---------------|---------|------------------------|-------------------------------|
// | 1       | processing                 | 2   | PA202407010001 | 处理中   | —                      | —                             |
// | 2       | rejected-freeze            | 3   | PA202406280003 | 已驳回   | —                      | —                             |
// | 3       | rejected-expired           | 4   | PA202406150001 | 已驳回   | —                      | —                             |
// | 4       | rejected-nonfreeze         | 5   | PA202406200001 | 已驳回   | —                      | —                             |
// | 5       | completed                  | 6   | PA202406100001 | 已结束   | —                      | —                             |
// | 6       | completed-full             | 7   | PA202407020001 | 已结束   | —                      | —                             |
// | 7       | completed-merged           | 8   | PA202407030001 | 已结束   | —                      | —                             |
// | 8       | completed-retry            | 9   | PA202407050001 | 已结束   | ①②③④⑥（5个子场景）     | draftLinks 聚合               |
// | 9       | completed-all-failed       | 10  | PA202407060001 | 已结束   | ①②⑤（3个子场景）       | 当前结果说明 + 主原因          |
// | 10      | completed-store-change     | 11  | PA202407070001 | 已结束   | —                      | 专卖店变更 + 信息变更           |
// | 11      | completed-product-change   | 12  | PA202407080001 | 已结束   | —                      | 产品变更 + 信息变更             |
// | 12      | completed-store-product-change | 13 | PA202407090001 | 已结束 | —                      | 双重变更 + 信息变更             |
//
// 子场景索引（CR-20260708-001 6 类完整覆盖）：
//   ① 自动提交失败 → 原草稿继续编辑重试 → 成功             [sc8 g2]
//   ② 自动提交失败 → 删除原草稿并业务放弃                    [sc9 g1]
//   ③ 自动提交失败 → 删除原草稿后新建草稿并成功              [sc8 g3]
//   ④ 审核驳回回草稿 → 原草稿继续编辑重试 → 成功             [sc8 g4]
//   ⑤ 审核驳回回草稿 → 删除原草稿并业务放弃                   [sc9 g3]
//   ⑥ 审核驳回回草稿 → 删除原草稿后新建草稿并成功             [sc8 g5]
//
// 访问方式：
//   - ID 路由：/product-apply/detail/:id → 按上表 id 列映射
//   - Query Scene：?scene=xxx → 直接指定 scene key（优先级高于 id 路由）

/** 根据场景ID获取对应的 mock 详情数据 */
export function getMockWorkOrderDetail(scene?: string): ProductWorkOrder {
  switch (scene) {
    case 'processing': return mockWorkOrderProcessing;           // 场景1：处理中（多审批节点+预占库存订单）
    case 'rejected-freeze': return mockWorkOrderRejectedFreeze;   // 场景2：已驳回-冻结期原单重提
    case 'rejected-expired': return mockWorkOrderRejectedExpired; // 场景3：已驳回-原预算已到期
    case 'rejected-nonfreeze': return mockWorkOrderRejectedNonFreeze; // 场景4：已驳回-非冻结期普通新建
    case 'completed': return mockWorkOrderCompleted;              // 场景5：已结束-部分成功部分失败
    case 'completed-full': return mockWorkOrderCompletedFull;     // 场景6：已结束-全部成功
    case 'completed-merged': return mockWorkOrderCompletedMerged; // 场景7：已结束-多明细归并同一订单
    case 'completed-retry': return mockWorkOrderCompletedRetry;   // 场景8：已结束-多次重试（最终成功+业务放弃）
    case 'completed-all-failed': return mockWorkOrderCompletedAllFailed; // 场景9：已结束-全部失败业务放弃
    case 'completed-store-change': return mockWorkOrderStoreChange; // 场景10：已结束-专卖店变更（A→B）
    case 'completed-product-change': return mockWorkOrderProductChange; // 场景11：已结束-产品变更
    case 'completed-store-product-change': return mockWorkOrderStoreAndProductChange; // 场景12：已结束-专卖店+产品双重变更
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
