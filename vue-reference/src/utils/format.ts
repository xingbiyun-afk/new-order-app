// 金额格式化工具（CR-20260703-001 §6）
// 统一保留 2 位小数 + 千分符（zh-CN 区域）

export function formatAmount(value: number): string {
  if (value == null || Number.isNaN(value)) return '0.00'
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
