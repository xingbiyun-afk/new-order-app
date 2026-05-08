import { Routes, Route, Navigate } from 'react-router'

function App() {
  return (
    <div className="page-container">
      {/* 顶部 Header */}
      <header className="app-header">
        <span>工单处理中心</span>
      </header>

      {/* 页面内容 */}
      <main className="page-content">
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/create" replace />}
          />
          <Route
            path="/create"
            element={<CreatePage />}
          />
          <Route
            path="/my"
            element={<MyPage />}
          />
          <Route
            path="/team"
            element={<TeamPage />}
          />
        </Routes>
      </main>

      {/* 底部 Tab */}
      <nav className="bottom-tab">
        <TabItem label="发起工单" path="/create" activePaths={['/create']} />
        <TabItem label="我的" path="/my" activePaths={['/my']} />
        <TabItem label="组内" path="/team" activePaths={['/team']} disabled />
      </nav>
    </div>
  )
}

/* 发起工单页 */
function CreatePage() {
  return (
    <div>
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="entry-card">
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: '#22BDB8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            物流
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 500, color: '#333' }}>物流工单</div>
            <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>发起物流相关工单</div>
          </div>
          <span style={{ color: '#999', fontSize: 18 }}>&gt;</span>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="entry-card">
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: '#22BDB8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            客服
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 500, color: '#333' }}>客服工单</div>
            <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>发起客服相关工单</div>
          </div>
          <span style={{ color: '#999', fontSize: 18 }}>&gt;</span>
        </div>
      </div>

      <div className="card">
        <div className="entry-card">
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: '#22BDB8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 12,
              flexShrink: 0,
            }}
          >
            预算
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 500, color: '#333' }}>预算申请工单</div>
            <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>发起预算申请工单（本期新增）</div>
          </div>
          <span style={{ color: '#999', fontSize: 18 }}>&gt;</span>
        </div>
      </div>
    </div>
  )
}

/* 我的页 */
function MyPage() {
  const tabs = ['待办', '已办', '抄送我的', '已发起']

  return (
    <div>
      {/* 搜索框 */}
      <div className="search-box" style={{ marginBottom: 8 }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="#999">
          <path d="M11.7422 10.3439C12.5329 9.2673 12.9766 7.9382 12.9766 6.48828C12.9766 2.91016 10.0664 0 6.48828 0C2.91016 0 0 2.91016 0 6.48828C0 10.0664 2.91016 12.9766 6.48828 12.9766C7.9382 12.9766 9.2673 12.5329 10.3439 11.7422L14.1465 15.5449C14.3418 15.7402 14.6582 15.7402 14.8535 15.5449L15.5449 14.8535C15.7402 14.6582 15.7402 14.3418 15.5449 14.1465L11.7422 10.3439ZM6.48828 11.0742C3.96094 11.0742 1.90234 9.01562 1.90234 6.48828C1.90234 3.96094 3.96094 1.90234 6.48828 1.90234C9.01562 1.90234 11.0742 3.96094 11.0742 6.48828C11.0742 9.01562 9.01562 11.0742 6.48828 11.0742Z" />
        </svg>
        <span>搜索工单</span>
      </div>

      {/* 状态 Tab */}
      <div className="status-tabs">
        {tabs.map((tab, i) => (
          <div key={tab} className={`status-tab-item ${i === 0 ? 'active' : ''}`}>
            {tab}
          </div>
        ))}
      </div>

      {/* 筛选栏 */}
      <div className="filter-bar">
        <span>全部工单</span>
        <span style={{ color: '#999' }}>筛选 ▼</span>
      </div>

      {/* 工单卡片列表 */}
      <div className="work-order-card">
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 15, fontWeight: 500, color: '#333' }}>预算申请-2026-Q2</span>
            <span className="status-badge">审批中</span>
          </div>
          <div style={{ fontSize: 13, color: '#999', marginTop: 6 }}>
            编号: BG-20260508-001 · 2026-05-08
          </div>
        </div>
      </div>

      <div className="work-order-card">
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 15, fontWeight: 500, color: '#333' }}>物流运输申请</span>
            <span className="status-badge" style={{ backgroundColor: '#FFF3E0', color: '#FF9800' }}>待处理</span>
          </div>
          <div style={{ fontSize: 13, color: '#999', marginTop: 6 }}>
            编号: WL-20260508-002 · 2026-05-07
          </div>
        </div>
      </div>
    </div>
  )
}

/* 组内页（未开通） */
function TeamPage() {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
      <div style={{ fontSize: 16, color: '#999' }}>组内功能暂未开通</div>
      <div style={{ fontSize: 14, color: '#bbb', marginTop: 8 }}>敬请期待</div>
    </div>
  )
}

/* Tab 项组件 */
function TabItem({
  label,
  path,
  activePaths,
  disabled = false,
}: {
  label: string
  path: string
  activePaths: string[]
  disabled?: boolean
}) {
  const isActive = activePaths.some((p) => window.location.pathname === p)

  const handleClick = () => {
    if (!disabled) {
      window.location.href = path
    }
  }

  return (
    <div
      className={`tab-item ${isActive ? 'active' : ''} ${disabled ? 'opacity-50' : ''}`}
      onClick={handleClick}
      style={disabled ? { cursor: 'not-allowed' } : {}}
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          backgroundColor: isActive ? '#22BDB8' : disabled ? '#ddd' : '#ccc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#fff' }} />
      </div>
      <span>{label}</span>
    </div>
  )
}

export default App
