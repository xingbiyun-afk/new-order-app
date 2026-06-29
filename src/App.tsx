import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router'
import { useState } from 'react'

// 产品申请工单页面
import CreateProductPage from './features/work-order-budget/pages/create'
import BudgetSelectPage from './features/work-order-budget/pages/budget-select'
import StoreSelectPage from './features/work-order-budget/pages/store-select'
import ProductSelectPage from './features/work-order-budget/pages/product-select'
import DetailPage from './features/work-order-budget/pages/detail'

// 一级Tab页面列表
const TAB_ROOTS = ['/create', '/my', '/team']

function App() {
  const location = useLocation()
  const showTab = TAB_ROOTS.some((p) => location.pathname === p)
  // 一级页面显示全局header（截图2中"我的"页面有header）
  const showHeader = TAB_ROOTS.some((p) => location.pathname === p)

  return (
    <div className="page-container">
      {/* 全局顶部 Header（仅一级页面显示） */}
      {showHeader && (
        <header className="app-header">
          <span>工单处理中心</span>
        </header>
      )}

      {/* 页面内容 */}
      <main className="page-content" style={{ padding: showHeader ? '0' : undefined }}>
        <Routes>
          <Route path="/" element={<Navigate to="/create" replace />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/my" element={<MyPage />} />
          <Route path="/team" element={<TeamPage />} />

          {/* 产品申请工单路由（二级页面，不显示底部Tab和全局header） */}
          <Route path="/product-apply/create" element={<CreateProductPage />} />
          <Route path="/product-apply/budget-select" element={<BudgetSelectPage />} />
          <Route path="/product-apply/store-select" element={<StoreSelectPage />} />
          <Route path="/product-apply/product-select" element={<ProductSelectPage />} />
          <Route path="/product-apply/detail/:id" element={<DetailPage />} />
        </Routes>
      </main>

      {/* 底部 Tab（仅一级页面显示） */}
      {showTab && (
        <nav className="bottom-tab">
          <TabItem label="发起工单" path="/create" icon="create" />
          <TabItem label="我的" path="/my" icon="my" />
          <TabItem label="组内" path="/team" icon="team" disabled />
        </nav>
      )}
    </div>
  )
}

/* ==================== 发起工单页 ==================== */
function CreatePage() {
  const navigate = useNavigate()
  return (
    <div style={{ padding: '12px 16px' }}>
      {/* 物流工单入口 */}
      <div className="card" style={{ marginBottom: 12, padding: '16px' }}>
        <div className="entry-card" style={{ padding: 0 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#22BDB8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, flexShrink: 0, fontWeight: 500 }}>物流</div>
          <div style={{ flex: 1, marginLeft: 4 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#333' }}>物流工单</div>
            <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>发起物流相关工单</div>
          </div>
          <span style={{ color: '#ccc', fontSize: 20, fontWeight: 300 }}>&gt;</span>
        </div>
      </div>

      {/* 客服工单入口 */}
      <div className="card" style={{ marginBottom: 12, padding: '16px' }}>
        <div className="entry-card" style={{ padding: 0 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#22BDB8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, flexShrink: 0, fontWeight: 500 }}>客服</div>
          <div style={{ flex: 1, marginLeft: 4 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#333' }}>客服工单</div>
            <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>发起客服相关工单</div>
          </div>
          <span style={{ color: '#ccc', fontSize: 20, fontWeight: 300 }}>&gt;</span>
        </div>
      </div>

      {/* 产品申请工单入口 */}
      <div className="card" style={{ cursor: 'pointer', padding: '16px' }} onClick={() => navigate('/product-apply/create')}>
        <div className="entry-card" style={{ padding: 0 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#22BDB8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, flexShrink: 0, fontWeight: 500, textAlign: 'center', lineHeight: 1.2 }}>产品<br/>申请</div>
          <div style={{ flex: 1, marginLeft: 4 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#333' }}>产品申请工单</div>
            <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>发起产品申请工单并进行预算核销</div>
          </div>
          <span style={{ color: '#ccc', fontSize: 20, fontWeight: 300 }}>&gt;</span>
        </div>
      </div>
    </div>
  )
}

/* ==================== 我的页（1:1还原截图2） ==================== */
function MyPage() {
  const navigate = useNavigate()
  const tabs = ['待办', '已办', '抄送我的', '已发起']
  const [activeTab, setActiveTab] = useState(0)

  // Mock数据 - 产品申请工单（保持键值对布局样式）
  const workOrderCards = [
    { id: '1', type: '产品申请', status: '处理中', statusColor: '#22BDB8', fields: [{ label: '申请人', value: '张三' }, { label: '申请类型', value: '新品申请' }, { label: '申请理由', value: '季度新品推广活动，针对核心专卖店进行首批铺货支持' }], time: '06-26 10:17' },
    { id: '2', type: '产品申请', status: '已结束', statusColor: '#4CAF50', fields: [{ label: '申请人', value: '李四' }, { label: '申请类型', value: '活动申请' }, { label: '申请理由', value: '618促销活动产品支持' }], time: '06-25 14:30' },
    { id: '3', type: '产品申请', status: '已驳回', statusColor: '#F44336', fields: [{ label: '申请人', value: '王五' }, { label: '申请类型', value: '补货申请' }, { label: '申请理由', value: '常规季度补货' }], time: '06-24 09:15' },
    { id: '4', type: '产品申请', status: '处理中', statusColor: '#22BDB8', fields: [{ label: '申请人', value: '赵六' }, { label: '申请类型', value: '新品申请' }, { label: '申请理由', value: '国庆黄金周促销活动铺货' }], time: '06-23 16:45' },
    { id: '5', type: '产品申请', status: '已结束', statusColor: '#4CAF50', fields: [{ label: '申请人', value: '孙七' }, { label: '申请类型', value: '补货申请' }, { label: '申请理由', value: '暑期旺季补货，应对销售高峰' }], time: '06-22 11:20' },
    { id: '6', type: '产品申请', status: '处理中', statusColor: '#22BDB8', fields: [{ label: '申请人', value: '周八' }, { label: '申请类型', value: '活动申请' }, { label: '申请理由', value: '双十一预售活动产品备货' }], time: '06-21 09:30' },
    { id: '7', type: '产品申请', status: '已驳回', statusColor: '#F44336', fields: [{ label: '申请人', value: '吴九' }, { label: '申请类型', value: '新品申请' }, { label: '申请理由', value: '春季新品上市推广' }], time: '06-20 14:15' },
    { id: '8', type: '产品申请', status: '已结束', statusColor: '#4CAF50', fields: [{ label: '申请人', value: '郑十' }, { label: '申请类型', value: '补货申请' }, { label: '申请理由', value: '年末库存补充' }], time: '06-19 10:00' },
  ]

  return (
    <div>
      {/* 白底区域：搜索框 + Tab + 筛选栏 */}
      <div style={{ backgroundColor: '#fff', paddingBottom: 8 }}>
        {/* 搜索框 */}
        <div style={{ padding: '12px 16px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#EFEFEF', borderRadius: 8, padding: '10px 12px', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#999"><path d="M11.74 10.34a6.49 6.49 0 1 0-1.4 1.4l3.8 3.81a1 1 0 0 0 1.42-1.4l-3.82-3.81zM6.5 11a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z" /></svg>
            <span style={{ fontSize: 14, color: '#999' }}>输入工单信息搜索</span>
          </div>
        </div>

        {/* 状态Tab - pill圆角样式 */}
        <div style={{ padding: '8px 16px', display: 'flex', gap: 8 }}>
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              style={{
                padding: '6px 16px',
                borderRadius: 16,
                border: 'none',
                fontSize: 14,
                cursor: 'pointer',
                backgroundColor: i === activeTab ? '#22BDB8' : 'transparent',
                color: i === activeTab ? '#fff' : '#666',
                fontWeight: i === activeTab ? 500 : 400,
                transition: 'all 0.2s',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 筛选栏 - 左右对称双下拉 */}
        <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 14, color: '#666' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>全部工单 <span style={{ fontSize: 10 }}>▼</span></span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>最新到达优先 <span style={{ fontSize: 10 }}>▼</span></span>
        </div>
      </div>

      {/* 工单卡片列表 - 键值对布局 + 产品申请数据 */}
      <div style={{ padding: '8px 16px 16px' }}>
        {workOrderCards.map((card) => (
          <div
            key={card.id}
            className="card"
            style={{ padding: '14px 16px', marginBottom: 12, cursor: 'pointer' }}
            onClick={() => navigate(`/product-apply/detail/${card.id}`)}
          >
            {/* 标题行：类型 + 状态 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #f0f0f0' }}>
              <span style={{ fontSize: 16, fontWeight: 500, color: '#333' }}>{card.type}</span>
              <span style={{ fontSize: 14, color: card.statusColor }}>{card.status}</span>
            </div>

            {/* 键值对信息 */}
            {card.fields.map((field) => (
              <div key={field.label} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 14, color: '#999', whiteSpace: 'nowrap' }}>{field.label}：</span>
                <span style={{ fontSize: 14, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{field.value}</span>
              </div>
            ))}

            {/* 时间 */}
            <div style={{ textAlign: 'right', fontSize: 13, color: '#999', marginTop: 4 }}>{card.time}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ==================== 组内页 ==================== */
function TeamPage() {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '48px 24px', margin: '12px 16px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
      <div style={{ fontSize: 16, color: '#999' }}>组内功能暂未开通</div>
      <div style={{ fontSize: 14, color: '#bbb', marginTop: 8 }}>敬请期待</div>
    </div>
  )
}

/* ==================== Tab 项组件（带图标） ==================== */
function TabItem({ label, path, icon, disabled = false }: { label: string; path: string; icon: string; disabled?: boolean }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isActive = location.pathname === path

  // SVG图标 - 1:1还原截图2
  const renderIcon = () => {
    if (icon === 'create') {
      // 发起工单 - +号图标（灰色）
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect x="4" y="4" width="20" height="20" rx="4" fill={isActive ? '#22BDB8' : '#888'} />
          <path d="M14 9v10M9 14h10" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    }
    if (icon === 'my') {
      // 我的 - 文档勾选图标（青绿色）
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect x="5" y="3" width="18" height="22" rx="3" fill={isActive ? '#22BDB8' : '#888'} />
          <path d="M9 14l3 3 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 20h10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        </svg>
      )
    }
    // 组内 - 六边形图标（灰色）
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 3l10 5.5v11L14 25 4 19.5v-11L14 3z" fill={isActive ? '#22BDB8' : '#888'} />
        <circle cx="14" cy="14" r="3" fill="#fff" />
        <circle cx="9" cy="11" r="2" fill="#fff" opacity="0.6" />
        <circle cx="19" cy="11" r="2" fill="#fff" opacity="0.6" />
        <circle cx="9" cy="17" r="2" fill="#fff" opacity="0.6" />
        <circle cx="19" cy="17" r="2" fill="#fff" opacity="0.6" />
      </svg>
    )
  }

  return (
    <div
      className={`tab-item ${isActive ? 'active' : ''} ${disabled ? 'opacity-50' : ''}`}
      onClick={() => { if (!disabled) navigate(path) }}
      style={disabled ? { cursor: 'not-allowed' } : {}}
    >
      {renderIcon()}
      <span>{label}</span>
    </div>
  )
}

export default App
