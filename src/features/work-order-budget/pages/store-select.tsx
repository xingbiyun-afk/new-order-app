// ============================================================
// 产品申请工单 - 订单归属专卖店搜索选择页
// 选择后通过 URL 参数传递 storeCode/storeName/groupId 返回发起页
// ============================================================

import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { mockStores } from '../mocks'

export default function StoreSelectPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const groupId = searchParams.get('groupId') || ''

  const [keyword, setKeyword] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>(['31692', '31441'])

  const filteredStores = useMemo(() => {
    if (!keyword.trim()) return []
    const k = keyword.trim().toLowerCase()
    return mockStores.filter((s) => s.code.includes(k) || s.name.toLowerCase().includes(k))
  }, [keyword])

  const handleSelect = (storeCode: string, storeName: string) => {
    // 通过 URL params 传递选中的专卖店信息
    navigate(`/product-apply/create?budgetId=${searchParams.get('budgetId') || ''}&groupId=${groupId}&storeCode=${encodeURIComponent(storeCode)}&storeName=${encodeURIComponent(storeName)}`)
  }

  const clearHistory = () => setSearchHistory([])

  const renderItem = (store: { code: string; name: string }) => (
    <div key={store.code} onClick={() => handleSelect(store.code, store.name)} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}>
      <span style={{ fontSize: 15, color: '#333', minWidth: 80, fontWeight: 500 }}>{store.code}</span>
      <span style={{ fontSize: 14, color: '#666', flex: 1 }}>{store.name}</span>
    </div>
  )

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 搜索Header */}
      <div style={{ padding: '8px 16px', backgroundColor: '#22BDB8', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, padding: '6px 12px', gap: 8 }}>
          <span style={{ color: '#22BDB8', fontSize: 14, whiteSpace: 'nowrap' }}>专卖店</span>
          <span style={{ color: '#ddd' }}>|</span>
          <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="输入客户编号/名称" style={{ flex: 1, border: 'none', fontSize: 14, background: 'transparent', outline: 'none' }} autoFocus />
        </div>
        <button onClick={() => navigate(-1)} style={{ color: '#fff', fontSize: 15, background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>取消</button>
      </div>

      {/* 列表 */}
      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#fff' }}>
        {keyword ? (
          filteredStores.length > 0 ? filteredStores.map(renderItem) : <div style={{ textAlign: 'center', padding: '48px 24px', color: '#999', fontSize: 14 }}>未找到匹配的专卖店</div>
        ) : (
          <>
            {searchHistory.length > 0 && (
              <div style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: '#999' }}>搜索历史记录</span>
                  <button onClick={clearHistory} style={{ background: 'none', border: 'none', color: '#999', fontSize: 13, cursor: 'pointer' }}>&#128465;</button>
                </div>
                {searchHistory.map((code) => {
                  const store = mockStores.find((s) => s.code === code)
                  return store ? renderItem(store) : null
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
