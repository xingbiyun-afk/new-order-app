// ============================================================
// 产品申请工单 - 发起页（P0+P1完整版）
// P1-01: 产品搜索选择页 | P1-02: 跨分组SKU校验 | P1-03: 数量动态提示
// P1-04: 分组折叠/展开 | P1-05: 预算搜索过滤
// ============================================================

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import type { Budget, StoreGroup, ProductItem } from '../types'
import { mockBudgets, mockProductOptions, createDefaultGroup, calculateAmount } from '../mocks'

export default function CreatePage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const budgetId = searchParams.get('budgetId')
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)

  useEffect(() => {
    if (budgetId) {
      const budget = mockBudgets.find((b) => b.id === budgetId)
      if (budget) setSelectedBudget(budget)
    }
  }, [budgetId])

  // 初始化专卖店分组：优先从sessionStorage恢复，确保页面重新挂载时groupId一致
  const [storeGroups, setStoreGroups] = useState<StoreGroup[]>(() => {
    const saved = sessionStorage.getItem('pa_storeGroups')
    if (saved) {
      try { return JSON.parse(saved) } catch { /* ignore */ }
    }
    return [createDefaultGroup()]
  })
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [attachments, setAttachments] = useState<{ id: string; name: string }[]>([])
  const [toast, setToast] = useState('')

  // 持久化storeGroups到sessionStorage
  useEffect(() => {
    sessionStorage.setItem('pa_storeGroups', JSON.stringify(storeGroups))
  }, [storeGroups])

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) next.delete(groupId)
      else next.add(groupId)
      return next
    })
  }

  const currentUser = { name: '张三', org: '南大 / 福建' }

  const totalAmount = useMemo(() =>
    storeGroups.reduce((sum, group) =>
      sum + group.products.reduce((s, p) => s + p.amount, 0), 0),
    [storeGroups]
  )

  // P1-02: 同一SKU跨分组总数量Map
  const skuTotalMap = useMemo(() => {
    const map = new Map<string, number>()
    storeGroups.forEach((group) => {
      group.products.forEach((product) => {
        if (product.productCode) {
          map.set(product.productCode, (map.get(product.productCode) || 0) + product.quantity)
        }
      })
    })
    return map
  }, [storeGroups])

  // 回填专卖店
  const storeCode = searchParams.get('storeCode')
  const storeName = searchParams.get('storeName')
  const groupIdFromUrl = searchParams.get('groupId')

  useEffect(() => {
    if (storeCode && storeName && groupIdFromUrl) {
      setStoreGroups((prev) =>
        prev.map((g) => g.id === groupIdFromUrl ? { ...g, storeCode, storeName } : g)
      )
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete('storeCode')
        next.delete('storeName')
        next.delete('groupId')
        return next
      })
    }
  }, [storeCode, storeName, groupIdFromUrl])

  // 回填产品
  const productIdFromUrl = searchParams.get('productId')
  const productCodeFromUrl = searchParams.get('productCode')

  useEffect(() => {
    if (productIdFromUrl && productCodeFromUrl && groupIdFromUrl) {
      const option = mockProductOptions.find((p) => p.code === productCodeFromUrl)
      if (option) {
        setStoreGroups((prev) =>
          prev.map((g) => {
            if (g.id !== groupIdFromUrl) return g
            return {
              ...g,
              products: g.products.map((p) =>
                p.id !== productIdFromUrl ? p : {
                  ...p, productCode: option.code, productName: option.name,
                  jdePrice: option.jdePrice, isDiscount: option.isDiscount,
                  discount: option.discount, maxQuantity: option.maxQuantity,
                  amount: calculateAmount({ ...p, jdePrice: option.jdePrice, isDiscount: option.isDiscount, discount: option.discount, quantity: p.quantity })
                }
              )
            }
          })
        )
      }
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete('productId')
        next.delete('productCode')
        next.delete('groupId')
        return next
      })
    }
  }, [productIdFromUrl, productCodeFromUrl])

  const handleQuantityChange = (groupId: string, productId: string, quantity: number) => {
    const q = Math.max(1, quantity)
    setStoreGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g
        return { ...g, products: g.products.map((p) => p.id !== productId ? p : { ...p, quantity: q, amount: calculateAmount({ ...p, quantity: q }) }) }
      })
    )
  }

  const addGroup = () => setStoreGroups((prev) => [...prev, createDefaultGroup()])
  const deleteGroup = (groupId: string) => {
    if (storeGroups.length <= 1) { showToast('至少保留一个分组'); return }
    setStoreGroups((prev) => prev.filter((g) => g.id !== groupId))
    setCollapsedGroups((prev) => { const next = new Set(prev); next.delete(groupId); return next })
  }
  const addProduct = (groupId: string) => {
    setStoreGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g
        const newProduct: ProductItem = { id: `prod_${Date.now()}`, productCode: '', productName: '', jdePrice: 0, isDiscount: false, discount: 0.5, maxQuantity: 0, quantity: 1, amount: 0 }
        return { ...g, products: [...g.products, newProduct] }
      })
    )
  }
  const deleteProduct = (groupId: string, productId: string) => {
    setStoreGroups((prev) =>
      prev.map((g) => g.id !== groupId ? g : { ...g, products: g.products.filter((p) => p.id !== productId) })
    )
  }

  const handleUploadAttachment = () => {
    setAttachments((prev) => [...prev, { id: `att_${Date.now()}`, name: `附件_${prev.length + 1}.pdf` }])
    showToast('附件已添加（模拟）')
  }
  const handleDeleteAttachment = (id: string) => setAttachments((prev) => prev.filter((a) => a.id !== id))

  const handleSubmit = () => {
    if (!selectedBudget) { showToast('请选择预算号'); return }
    for (const g of storeGroups) {
      if (!g.storeCode) { showToast('请选择订单归属专卖店'); return }
      for (const p of g.products) {
        if (!p.productCode) { showToast('请选择产品编号'); return }
      }
    }
    for (const [skuCode, totalQty] of skuTotalMap.entries()) {
      const product = storeGroups.flatMap((g) => g.products).find((p) => p.productCode === skuCode)
      if (product && totalQty > product.maxQuantity) {
        showToast(`产品 ${product.productName} 全单总数量 ${totalQty} 超过可申请数量 ${product.maxQuantity}`)
        return
      }
    }
    if (attachments.length === 0) { showToast('请上传附件'); return }
    showToast('提交成功！')
    setTimeout(() => navigate('/my'), 1500)
  }

  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500) }, [])

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* 页面标题 */}
      <div style={{ padding: '12px 16px', backgroundColor: '#22BDB8', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <button onClick={() => navigate(-1)} style={{ position: 'absolute', left: 12, background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', padding: '4px 8px' }}>&#8249;</button>
        <span style={{ color: '#fff', fontSize: 17, fontWeight: 500 }}>产品申请工单</span>
      </div>

      {/* 预算信息 */}
      <SectionCard title="预算信息">
        <FormRow label="预算号" required onClick={() => navigate('/product-apply/budget-select')} value={selectedBudget?.budgetNo} placeholder="选择预算" clickable />
        {selectedBudget?.isAbnormal && (
          <div style={{ backgroundColor: '#FFF8E1', color: '#FF8F00', fontSize: 13, padding: '8px 12px', borderRadius: 8, marginTop: 8 }}>&#9888; {selectedBudget.abnormalMessage}</div>
        )}
      </SectionCard>

      {/* 申请信息 */}
      <SectionCard title="申请信息">
        <FormRow label="申请人" value={currentUser.name} />
        <FormRow label="申请类型" value={selectedBudget?.applyType || '-'} />
        <FormRow label="申请理由" value={selectedBudget?.applyReason || '-'} multiline />
      </SectionCard>

      {/* 专卖店分组 */}
      {storeGroups.map((group, groupIndex) => {
        const isCollapsed = collapsedGroups.has(group.id)
        return (
          <SectionCard key={group.id}
            title={`专卖店申请分组 ${groupIndex + 1}${group.storeCode ? ` · ${group.storeCode}` : ''}`}
            onHeaderClick={() => toggleGroupCollapse(group.id)}
            rightAction={
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {storeGroups.length > 1 && <button onClick={(e) => { e.stopPropagation(); deleteGroup(group.id) }} style={{ background: 'none', border: 'none', color: '#F44336', fontSize: 13, cursor: 'pointer' }}>删除</button>}
                <span style={{ color: '#999', fontSize: 18, transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>&#9662;</span>
              </div>
            }>
            {isCollapsed ? (
              <div style={{ padding: '8px 0', color: '#999', fontSize: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>订单归属专卖店：{group.storeCode ? `${group.storeCode} ${group.storeName}` : '未选择'}</span>
                <span style={{ color: '#22BDB8', fontWeight: 500 }}>{group.products.length} 件商品</span>
              </div>
            ) : (
              <div>
                <FormRow label="订单归属专卖店" required value={group.storeCode ? `${group.storeCode} ${group.storeName}` : ''} placeholder="请输入专卖店编号" clickable onClick={() => navigate(`/product-apply/store-select?budgetId=${budgetId || ''}&groupId=${group.id}`)} />
                {group.products.map((product, productIndex) => (
                  <div key={product.id} style={{ marginTop: productIndex > 0 ? 16 : 12, paddingTop: productIndex > 0 ? 16 : 0, borderTop: productIndex > 0 ? '1px dashed #e0e0e0' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#22BDB8' }}>商品 {productIndex + 1}</span>
                      {group.products.length > 1 && <button onClick={() => deleteProduct(group.id, product.id)} style={{ background: 'none', border: 'none', color: '#F44336', fontSize: 12, cursor: 'pointer' }}>删除</button>}
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <FormRow label="产品编号" required value={product.productCode} placeholder="选择产品" clickable onClick={() => navigate(`/product-apply/product-select?budgetId=${budgetId || ''}&groupId=${group.id}&productId=${product.id}`)} />
                    </div>
                    {product.productCode && (
                      <div>
                        <FormRow label="产品名称" value={product.productName} compact />
                        <FormRow label="JDE价格" value={`¥${product.jdePrice.toFixed(2)}`} compact />
                        <FormRow label="是否打折产品" value={product.isDiscount ? '是' : '否'} compact />
                        {product.isDiscount && <FormRow label="折扣" value={`${(product.discount * 10).toFixed(1)}折`} compact />}
                        <FormRow label="可申请数量" value={`${product.maxQuantity}`} compact />
                        <div style={{ marginTop: 8 }}>
                          <label style={labelStyle}>数量 *</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                            <button onClick={() => handleQuantityChange(group.id, product.id, product.quantity - 1)} style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid #e0e0e0', backgroundColor: '#f5f5f5', fontSize: 18, cursor: 'pointer' }}>-</button>
                            <input type="number" min={1} max={product.maxQuantity} value={product.quantity} onChange={(e) => handleQuantityChange(group.id, product.id, parseInt(e.target.value) || 1)} style={{ flex: 1, height: 36, textAlign: 'center', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 15 }} />
                            <button onClick={() => handleQuantityChange(group.id, product.id, product.quantity + 1)} style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid #e0e0e0', backgroundColor: '#f5f5f5', fontSize: 18, cursor: 'pointer' }}>+</button>
                          </div>
                          {/* P1-02 & P1-03: 动态数量提示与跨分组校验 */}
                          {(() => {
                            const totalUsed = skuTotalMap.get(product.productCode) || 0
                            const remaining = product.maxQuantity - totalUsed + product.quantity
                            const isOverLimit = totalUsed > product.maxQuantity
                            return (
                              <div style={{ marginTop: 4, fontSize: 12, lineHeight: 1.5 }}>
                                <span style={{ color: '#999' }}>本组已申请 {product.quantity}，全单已申请 {totalUsed} / {product.maxQuantity}</span>
                                {isOverLimit ? (
                                  <div style={{ color: '#F44336', fontWeight: 500 }}>全单总数量已超过可申请数量 {product.maxQuantity}，请调整</div>
                                ) : remaining > 0 ? (
                                  <span style={{ color: '#4CAF50' }}> 还可申请 {remaining}</span>
                                ) : (
                                  <span style={{ color: '#FF9800' }}> 已达到可申请上限</span>
                                )}
                              </div>
                            )
                          })()}
                        </div>
                        <FormRow label="金额（净额）" value={`¥${product.amount.toFixed(2)}`} compact highlight />
                      </div>
                    )}
                  </div>
                ))}
                <button onClick={() => addProduct(group.id)} style={{ width: '100%', marginTop: 12, padding: '10px', borderRadius: 8, border: '1px dashed #22BDB8', backgroundColor: '#F0FDFD', color: '#22BDB8', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><span style={{ fontSize: 18 }}>+</span> 添加商品</button>
                {group.products.some((p) => p.amount > 0) && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0', textAlign: 'right', fontSize: 14, color: '#666' }}>
                    分组小计：<span style={{ color: '#22BDB8', fontWeight: 600, fontSize: 16 }}>¥{group.products.reduce((s, p) => s + p.amount, 0).toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
          </SectionCard>
        )
      })}

      {/* 添加分组 */}
      <div style={{ padding: '0 16px', marginBottom: 12 }}>
        <button onClick={addGroup} style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px dashed #22BDB8', backgroundColor: '#fff', color: '#22BDB8', fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><span style={{ fontSize: 20 }}>+</span> 添加专卖店分组</button>
      </div>

      {/* 金额合计 */}
      {totalAmount > 0 && (
        <div style={{ padding: '14px 16px', backgroundColor: '#fff', margin: '0 16px 12px', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 15, fontWeight: 500, color: '#333' }}>金额合计</span>
          <span style={{ fontSize: 20, fontWeight: 600, color: '#22BDB8' }}>¥{totalAmount.toFixed(2)}</span>
        </div>
      )}

      {/* 附件 */}
      <SectionCard title="附件上传">
        <div style={{ marginTop: 8 }}>
          {attachments.map((att) => (
            <div key={att.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#22BDB8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#fff" strokeWidth="2" fill="none" /></svg>
                <span style={{ fontSize: 14, color: '#333' }}>{att.name}</span>
              </div>
              <button onClick={() => handleDeleteAttachment(att.id)} style={{ background: 'none', border: 'none', color: '#F44336', fontSize: 12, cursor: 'pointer' }}>删除</button>
            </div>
          ))}
          <button onClick={handleUploadAttachment} style={{ width: 80, height: 80, borderRadius: 8, border: '1px dashed #ccc', backgroundColor: '#fafafa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer', marginTop: 8 }}>
            <span style={{ fontSize: 24, color: '#999' }}>+</span><span style={{ fontSize: 12, color: '#999' }}>上传附件</span>
          </button>
          <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>支持 JPG、PNG、PDF、Excel 等格式，单个文件不超过 20MB，最多 10 个</div>
        </div>
      </SectionCard>

      {/* 底部提交按钮 */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, padding: '12px 16px', backgroundColor: '#fff', boxShadow: '0 -2px 8px rgba(0,0,0,0.06)', zIndex: 100 }}>
        <button onClick={handleSubmit} style={{ width: '100%', padding: '14px', borderRadius: 24, border: 'none', backgroundColor: '#22BDB8', color: '#fff', fontSize: 16, fontWeight: 500, cursor: 'pointer' }}>提交</button>
      </div>

      {/* Toast */}
      {toast && <div style={{ position: 'fixed', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'rgba(0,0,0,0.75)', color: '#fff', padding: '12px 24px', borderRadius: 8, fontSize: 14, zIndex: 1000, whiteSpace: 'nowrap' }}>{toast}</div>}
    </div>
  )
}

// ===== 子组件 =====
function SectionCard({ title, children, rightAction, onHeaderClick }: { title: string, children: React.ReactNode, rightAction?: React.ReactNode, onHeaderClick?: () => void }) {
  return <div style={{ backgroundColor: '#fff', margin: '12px 16px', borderRadius: 12, padding: '14px 16px' }}>
    <div onClick={onHeaderClick} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid #f0f0f0', cursor: onHeaderClick ? 'pointer' : 'default' }}>
      <span style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>{title}</span>{rightAction}
    </div>{children}</div>
}

function FormRow({ label, value, placeholder, required, clickable, onClick, multiline, compact, highlight }: {
  label: string; value?: string; placeholder?: string; required?: boolean; clickable?: boolean; onClick?: () => void; multiline?: boolean; compact?: boolean; highlight?: boolean
}) {
  return <div onClick={onClick} style={{ display: 'flex', alignItems: multiline ? 'flex-start' : 'center', justifyContent: 'space-between', padding: compact ? '6px 0' : '10px 0', borderBottom: '1px solid #f5f5f5', cursor: clickable ? 'pointer' : 'default', minHeight: 36 }}>
    <span style={{ fontSize: 14, color: '#666', whiteSpace: 'nowrap', marginRight: 12 }}>{label}{required && <span style={{ color: '#F44336' }}> *</span>}</span>
    <span style={{ flex: 1, textAlign: 'right', fontSize: 14, color: highlight ? '#22BDB8' : value ? '#333' : '#bbb', fontWeight: highlight ? 600 : 400, lineHeight: multiline ? 1.5 : undefined, wordBreak: 'break-all' }}>{value || placeholder || '-'}</span>
    {clickable && <span style={{ color: '#999', marginLeft: 4, fontSize: 16 }}>&#8250;</span>}
  </div>
}

const labelStyle: React.CSSProperties = { fontSize: 14, color: '#666', display: 'block', marginBottom: 2 }
