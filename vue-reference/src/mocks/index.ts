import * as XLSX from 'xlsx'
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
export const mockDoneCards: WorkOrderCard[] = [
  { id: 'd1', workOrderType: '产品申请', displayStatus: '已结束', applicantName: '孙七', applyType: '补货申请', applyReason: '暑期旺季补货', createTime: '06-27 10:00' },
  { id: 'd2', workOrderType: '产品申请', displayStatus: '已驳回', applicantName: '周八', applyType: '活动申请', applyReason: '双十一预售活动产品备货，需提前一个月准备库存', createTime: '06-26 15:30' },
  { id: 'd3', workOrderType: '产品申请', displayStatus: '已结束', applicantName: '吴九', applyType: '新品申请', applyReason: '春季新品上市推广活动，针对华南区域核心专卖店进行首批铺货支持，确保新品上市首月销量达标', createTime: '06-25 08:45' },
  { id: 'd4', workOrderType: '产品申请', displayStatus: '已驳回', applicantName: '郑十', applyType: '补货申请', applyReason: '年末库存补充', createTime: '06-24 13:10' },
];

// 已发起：4条，三种状态混合，覆盖短/中/长理由
export const mockInitiatedCards: WorkOrderCard[] = [
  { id: 'i1', workOrderType: '产品申请', displayStatus: '处理中', applicantName: '钱十一', applyType: '新品申请', applyReason: '智能系列新品推广', createTime: '06-30 10:30' },
  { id: 'i2', workOrderType: '产品申请', displayStatus: '已结束', applicantName: '陈十二', applyType: '活动申请', applyReason: '五一劳动节促销活动产品支持，针对全国核心门店', createTime: '06-29 09:15' },
  { id: 'i3', workOrderType: '产品申请', displayStatus: '已驳回', applicantName: '刘十三', applyType: '补货申请', applyReason: '梅雨季节防潮产品专项补货，确保南方区域专卖店库存充足，应对季节性销售增长需求', createTime: '06-28 14:00' },
  { id: 'i4', workOrderType: '产品申请', displayStatus: '处理中', applicantName: '黄十四', applyType: '新品申请', applyReason: '冬季暖品系列上市铺货', createTime: '06-27 11:30' },
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
      const lines = text.split('\n').map(l => l.trim()).filter(l => l)
      if (lines.length <= 1) return { rows: [], error: '文件仅包含表头，无有效数据行' }
      return { rows: lines.slice(1), error: null }
    } catch {
      return { rows: [], error: 'CSV 文件读取失败，请检查文件编码' }
    }
  }

  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    try {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array' })
      if (wb.SheetNames.length === 0) return { rows: [], error: 'Excel 文件不包含任何工作表' }
      const sheet = wb.Sheets[wb.SheetNames[0]]
      const data: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 })
      if (data.length <= 1) return { rows: [], error: '文件仅包含表头，无有效数据行' }
      const rows = data.slice(1)
        .filter((row: unknown[]) => row.some(c => c != null && String(c).trim() !== ''))
        .map((row: unknown[]) => row.slice(0, 3).map(c => String(c ?? '').trim()).join(','))
      if (rows.length === 0) return { rows: [], error: '文件仅包含表头，无有效数据行' }
      return { rows, error: null }
    } catch {
      return { rows: [], error: 'Excel 文件解析失败，请检查文件是否损坏' }
    }
  }

  return { rows: [], error: '不支持的文件格式，请上传 .xlsx、.xls 或 .csv 文件' }
}

/** 下载导入模板（UTF-8 CSV 格式，含表头 + 2 行示例数据） */
export function downloadImportTemplate(event?: Event) {
  event?.preventDefault()
  event?.stopPropagation()

  // CSV with UTF-8 BOM for proper Chinese character display in Excel/WPS
  const BOM = '\uFEFF'
  const csv = BOM
    + '产品编号,数量,专卖店编号\n'
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
