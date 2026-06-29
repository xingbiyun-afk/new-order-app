// ============================================================
// 产品申请工单 - 产品搜索选择页（P1-01）
// 支持按产品编号/产品名称搜索，选中后返回发起页自动回填
// ============================================================

import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { mockProductOptions } from '../mocks'

export default function ProductSelectPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const groupId = searchParams.get('groupId') || ''
  const productId = searchParams.get('productId') || ''
  const budgetId = searchParams.get('budgetId') || ''

  const [keyword, setKeyword] = useState('')

  // 实时过滤：支持按产品编号或产品名称搜索
  const filteredProducts = useMemo(() => {
    if (!keyword.trim()) return mockProductOptions
    const k = keyword.toLowerCase()
    return mockProductOptions.filter(
      (p) =>
        p.code.toLowerCase().includes(k) ||
        p.name.toLowerCase().includes(k)
    )
  }, [keyword])

  const handleSelect = (productCode: string) => {
    // 返回发起页，通过URL params传递所有必要参数
    const params = new URLSearchParams()
    if (budgetId) params.set('budgetId', budgetId)
    params.set('groupId', groupId)
    params.set('productId', productId)
    params.set('productCode', productCode)
    navigate(`/product-apply/create?${params.toString()}`)
  }

  const handleBack = () => {
    // 返回发起页，不带产品选择参数
    const params = new URLSearchParams()
    if (budgetId) params.set('budgetId', budgetId)
    navigate(`/product-apply/create?${params.toString()}`)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* 顶部标题区 */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: '#22BDB8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <button
          onClick={handleBack}
          style={{
            position: 'absolute',
            left: 12,
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: 22,
            cursor: 'pointer',
            padding: '4px 8px',
          }}
        >
          &#8249;
        </button>
        <span style={{ color: '#fff', fontSize: 17, fontWeight: 500 }}>
          选择产品
        </span>
      </div>

      {/* 搜索区 */}
      <div style={{ padding: '12px 16px', backgroundColor: '#fff' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: 8,
            padding: '10px 12px',
            gap: 8,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="#999"
          >
            <path d="M11.74 10.34a6.49 6.49 0 1 0-1.4 1.4l3.8 3.81a1 1 0 0 0 1.42-1.4l-3.82-3.81zM6.5 11a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z" />
          </svg>
          <input
            type="text"
            placeholder="搜索产品编号或产品名称"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: 14,
              outline: 'none',
              color: '#333',
            }}
            autoFocus
          />
          {keyword && (
            <button
              onClick={() => setKeyword('')}
              style={{
                background: 'none',
                border: 'none',
                color: '#999',
                fontSize: 16,
                cursor: 'pointer',
                padding: '0 4px',
              }}
            >
              &#10005;
            </button>
          )}
        </div>
      </div>

      {/* 搜索结果统计 */}
      <div
        style={{
          padding: '8px 16px',
          fontSize: 13,
          color: '#999',
        }}
      >
        共 {filteredProducts.length} 条产品
        {keyword && `（"${keyword}" 的搜索结果）`}
      </div>

      {/* 产品列表 */}
      <div style={{ padding: '0 16px 16px' }}>
        {filteredProducts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px 24px',
              color: '#999',
              fontSize: 14,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>&#128269;</div>
            未找到匹配的产品
          </div>
        ) : (
          filteredProducts.map((product) => (
            <button
              key={product.code}
              onClick={() => handleSelect(product.code)}
              style={{
                width: '100%',
                backgroundColor: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '14px 16px',
                marginBottom: 10,
                textAlign: 'left',
                cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              {/* 产品编号+名称 */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 500,
                    color: '#333',
                  }}
                >
                  {product.code}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    padding: '2px 8px',
                    borderRadius: 10,
                    backgroundColor: product.isDiscount
                      ? '#FFF3E0'
                      : '#F5F5F5',
                    color: product.isDiscount ? '#FF9800' : '#999',
                    fontWeight: 500,
                  }}
                >
                  {product.isDiscount ? '打折产品' : '不打折'}
                </span>
              </div>

              {/* 产品名称 */}
              <div
                style={{
                  fontSize: 14,
                  color: '#666',
                  marginBottom: 10,
                }}
              >
                {product.name}
              </div>

              {/* 产品信息行 */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 10,
                  borderTop: '1px solid #f5f5f5',
                }}
              >
                <div style={{ fontSize: 13, color: '#999' }}>
                  JDE价格：
                  <span style={{ color: '#22BDB8', fontWeight: 500 }}>
                    ¥{product.jdePrice.toFixed(2)}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#999' }}>
                  可申请：
                  <span style={{ color: '#333', fontWeight: 500 }}>
                    {product.maxQuantity}
                  </span>
                </div>
              </div>

              {/* 折扣信息 */}
              {product.isDiscount && (
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 13,
                    color: '#FF9800',
                  }}
                >
                  折扣：{(product.discount * 10).toFixed(1)}折
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  )
}
