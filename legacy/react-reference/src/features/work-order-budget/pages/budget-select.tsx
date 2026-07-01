// ============================================================
// 产品申请工单 - 预算选择页（P1-05增强版）
// 支持搜索实时过滤预算号
// ============================================================

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { mockBudgets } from '../mocks'

export default function BudgetSelectPage() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')

  // 实时过滤：支持按预算号搜索
  const filteredBudgets = useMemo(() => {
    if (!keyword.trim()) return mockBudgets
    const k = keyword.toLowerCase()
    return mockBudgets.filter((b) =>
      b.budgetNo.toLowerCase().includes(k)
    )
  }, [keyword])

  const handleSelect = (budgetId: string) => {
    // 通过 URL search params 传递 budgetId，确保发起页能读取到
    navigate(`/product-apply/create?budgetId=${budgetId}`)
  }

  const handleBack = () => {
    navigate('/product-apply/create')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>
      {/* 顶部搜索区 */}
      <div style={{ padding: '8px 16px', backgroundColor: '#22BDB8', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, padding: '6px 12px', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#999"><path d="M11.74 10.34a6.49 6.49 0 1 0-1.4 1.4l3.8 3.81a1 1 0 0 0 1.42-1.4l-3.82-3.81zM6.5 11a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z"/></svg>
          <input
            type="text"
            placeholder="搜索预算号"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ flex: 1, border: 'none', fontSize: 14, background: 'transparent', outline: 'none', color: '#333' }}
            autoFocus
          />
          {keyword && (
            <button onClick={() => setKeyword('')} style={{ background: 'none', border: 'none', color: '#999', fontSize: 14, cursor: 'pointer', padding: '0 4px' }}>
              &#10005;
            </button>
          )}
        </div>
        <button onClick={handleBack} style={{ color: '#fff', fontSize: 15, background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>取消</button>
      </div>

      {/* 结果统计 */}
      <div style={{ padding: '8px 16px', fontSize: 13, color: '#999', flexShrink: 0 }}>
        共 {filteredBudgets.length} 条预算
        {keyword && `（"${keyword}" 的搜索结果）`}
      </div>

      {/* 预算列表 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 12px' }}>
        {filteredBudgets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: '#999', fontSize: 14 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>&#128269;</div>
            未找到匹配的预算
          </div>
        ) : (
          filteredBudgets.map((budget) => {
            const disabled = !budget.applicationAvailable
            return (
              <div key={budget.id} onClick={() => !disabled && handleSelect(budget.id)} style={{
                backgroundColor: disabled ? '#f0f0f0' : '#fff', borderRadius: 12, padding: '14px 16px', marginBottom: 12,
                opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'pointer', position: 'relative',
              }}>
                {disabled && <div style={{ position: 'absolute', top: 12, right: 12, backgroundColor: '#FFEBEE', color: '#F44336', fontSize: 12, padding: '2px 8px', borderRadius: 4 }}>不可选</div>}
                {budget.isAbnormal && budget.applicationAvailable && (
                  <div style={{ backgroundColor: '#FFF8E1', color: '#FF8F00', fontSize: 12, padding: '4px 8px', borderRadius: 4, marginBottom: 8 }}>&#9888; {budget.abnormalMessage}</div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 500, color: '#333' }}>预算号：{budget.budgetNo}</span>
                  <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4, backgroundColor: budget.status === '已生效' ? '#E8F5E9' : '#FFEBEE', color: budget.status === '已生效' ? '#4CAF50' : '#F44336' }}>{budget.status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
                  <span style={{ fontSize: 13, color: '#666' }}>可用金额：<span style={{ color: '#22BDB8', fontWeight: 500 }}>¥{budget.availableAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</span></span>
                  <span style={{ fontSize: 13, color: '#999' }}>已用：¥{budget.usedAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
