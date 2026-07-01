// ============================================================
// 产品申请工单 - 详情页（含审批操作区）
// ============================================================

import { useState } from 'react'
import { useNavigate } from 'react-router'
import { mockWorkOrderDetail } from '../mocks'

export default function DetailPage() {
  const navigate = useNavigate()
  const order = mockWorkOrderDetail

  // 审批相关状态
  const [remark, setRemark] = useState('')
  const [showToast, setShowToast] = useState('')
  const [isHandled, setIsHandled] = useState(false)

  // 模拟：当前用户是否是待处理审批人
  const isCurrentApprover = true // 实际应由后端判断
  const canApprove = isCurrentApprover && !isHandled && order.displayStatus === '处理中'

  const handleApprove = () => {
    setIsHandled(true)
    showToastMsg('审批已通过')
  }

  const handleReject = () => {
    if (!remark.trim()) {
      showToastMsg('驳回时备注必填')
      return
    }
    setIsHandled(true)
    showToastMsg('审批已驳回')
  }

  const showToastMsg = (msg: string) => {
    setShowToast(msg)
    setTimeout(() => setShowToast(''), 2500)
  }

  // P1-07: 附件预览/下载交互
  const handlePreviewAttachment = (attName: string) => {
    showToastMsg(`预览附件：${attName}`)
  }
  const handleDownloadAttachment = (attName: string) => {
    showToastMsg(`下载附件：${attName}`)
  }

  // 状态标签颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case '处理中': return { bg: '#E6F8F8', color: '#22BDB8' }
      case '已结束': return { bg: '#E8F5E9', color: '#4CAF50' }
      case '已驳回': return { bg: '#FFEBEE', color: '#F44336' }
      default: return { bg: '#F5F5F5', color: '#999' }
    }
  }

  const statusStyle = getStatusColor(order.displayStatus)

  return (
    <div style={{ paddingBottom: canApprove ? 160 : 20 }}>
      {/* 顶部标题区 */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#22BDB8',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
      }}>
        <button
          onClick={() => navigate(-1)}
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
          ‹
        </button>
        <span style={{ color: '#fff', fontSize: 17, fontWeight: 500, flex: 1, textAlign: 'center' }}>
          产品申请工单
        </span>
        <span style={{
          backgroundColor: statusStyle.bg,
          color: statusStyle.color,
          fontSize: 12,
          padding: '2px 10px',
          borderRadius: 10,
          fontWeight: 500,
        }}>
          {order.displayStatus}
        </span>
      </div>

      {/* 基础信息区 */}
      <SectionCard title="基础信息">
        <InfoRow label="工单编号" value={order.workOrderNo} />
        <InfoRow label="工单类型" value="产品申请" />
        <InfoRow label="工单状态" value={order.displayStatus} />
      </SectionCard>

      {/* 发起信息区 */}
      <SectionCard title="发起信息">
        <InfoRow label="发起人" value={order.applicantName} />
        <InfoRow label="发起时间" value={order.createTime} />
        <InfoRow label="发起人组织" value={order.applicantOrg} />
      </SectionCard>

      {/* 预算与申请信息区 */}
      <SectionCard title="预算与申请信息">
        <InfoRow label="预算号" value={order.budget.budgetNo} />
        <InfoRow label="申请类型" value={order.budget.applyType} />
        <InfoRow label="申请理由" value={order.budget.applyReason} />
        <InfoRow label="金额合计" value={`¥${order.totalAmount.toFixed(2)}`} highlight />
      </SectionCard>

      {/* 专卖店申请分组详情区 */}
      {order.storeGroups.map((group, groupIndex) => (
        <SectionCard key={group.id} title={`专卖店申请分组 ${groupIndex + 1}`}>
          <InfoRow label="客户编号" value={group.storeCode} />
          <InfoRow label="客户名称" value={group.storeName} />

          {/* 商品明细 */}
          {group.products.map((product, productIndex) => (
            <div
              key={product.id}
              style={{
                marginTop: 10,
                padding: '10px 12px',
                backgroundColor: '#fafafa',
                borderRadius: 8,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 500, color: '#22BDB8', marginBottom: 8 }}>
                商品 {productIndex + 1}
              </div>
              <InfoRow label="产品编号" value={product.productCode} compact />
              <InfoRow label="产品名称" value={product.productName} compact />
              <InfoRow label="JDE价格" value={`¥${product.jdePrice.toFixed(2)}`} compact />
              <InfoRow label="是否打折产品" value={product.isDiscount ? '是' : '否'} compact />
              <InfoRow label="申请数量" value={`${product.quantity}`} compact />
              <InfoRow label="金额（净额）" value={`¥${product.amount.toFixed(2)}`} highlight compact />
            </div>
          ))}

          {/* 分组小计 */}
          <div style={{
            marginTop: 12,
            paddingTop: 10,
            borderTop: '1px solid #f0f0f0',
            textAlign: 'right',
            fontSize: 14,
            color: '#666',
          }}>
            分组小计：
            <span style={{ color: '#22BDB8', fontWeight: 600 }}>
              ¥{group.groupAmount.toFixed(2)}
            </span>
          </div>
        </SectionCard>
      ))}

      {/* 附件区 */}
      {order.attachments.length > 0 && (
        <SectionCard title="附件">
          {order.attachments.map((att) => (
            <div
              key={att.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #f5f5f5',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#22BDB8">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#fff" strokeWidth="2" fill="none" />
                </svg>
                <span style={{ fontSize: 14, color: '#333' }}>{att.name}</span>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button style={linkButtonStyle} onClick={() => handlePreviewAttachment(att.name)}>预览</button>
                <button style={linkButtonStyle} onClick={() => handleDownloadAttachment(att.name)}>下载</button>
              </div>
            </div>
          ))}
        </SectionCard>
      )}

      {/* 审批流区 */}
      <SectionCard title="审批流程">
        <div style={{ position: 'relative', paddingLeft: 20 }}>
          {/* 时间线竖线 */}
          <div style={{
            position: 'absolute',
            left: 5,
            top: 8,
            bottom: 8,
            width: 2,
            backgroundColor: '#e0e0e0',
          }} />

          {order.approvalNodes.map((node, index) => (
            <div
              key={node.id}
              style={{
                position: 'relative',
                marginBottom: index < order.approvalNodes.length - 1 ? 20 : 0,
              }}
            >
              {/* 节点圆点 */}
              <div style={{
                position: 'absolute',
                left: -20,
                top: 4,
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: node.nodeType === 'start' ? '#22BDB8' : node.result === '通过' ? '#4CAF50' : node.result === '驳回' ? '#F44336' : '#FF9800',
                border: '2px solid #fff',
                boxShadow: '0 0 0 1px #e0e0e0',
                zIndex: 1,
              }} />

              {/* 节点内容 */}
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#333', marginBottom: 4 }}>
                  {node.nodeType === 'start' ? '发起工单' : `审批节点 ${index}`}
                </div>
                <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
                  <div>{node.handlerName} {node.handlerTime}</div>
                  {node.functionOrderNo && (
                    <div style={{ color: '#999', marginTop: 2 }}>
                      功能订单：{node.functionOrderNo} {node.functionOrderStatus}
                    </div>
                  )}
                  {node.result && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      marginTop: 4,
                    }}>
                      <span style={{
                        fontSize: 12,
                        padding: '2px 8px',
                        borderRadius: 4,
                        backgroundColor: node.result === '通过' ? '#E8F5E9' : '#FFEBEE',
                        color: node.result === '通过' ? '#4CAF50' : '#F44336',
                      }}>
                        {node.result}
                      </span>
                      {node.remark && <span style={{ color: '#666' }}>{node.remark}</span>}
                    </div>
                  )}
                  {node.relatedOrders && node.relatedOrders.length > 0 && (
                    <div style={{ marginTop: 6 }}>
                      {node.relatedOrders.map((o) => (
                        <div
                          key={o.orderNo}
                          style={{
                            padding: '6px 10px',
                            backgroundColor: '#f5f5f5',
                            borderRadius: 6,
                            marginTop: 4,
                            fontSize: 12,
                          }}
                        >
                          <div>{o.orderType} {o.orderNo}</div>
                          <div style={{ color: '#999' }}>状态：{o.orderStatus}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* P1-08: 功能订单与关联订单结果区 - 多条关联订单独立卡片 */}
      {order.groupResults && order.groupResults.length > 0 && (
        <SectionCard title="订单结果">
          {order.groupResults.map((result) => (
            <div
              key={result.groupId}
              style={{
                padding: '14px',
                backgroundColor: '#fafafa',
                borderRadius: 12,
                marginBottom: 12,
                border: '1px solid #f0f0f0',
              }}
            >
              {/* 分组头部 */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
                paddingBottom: 10,
                borderBottom: '1px solid #e0e0e0',
              }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>
                  {result.storeCode} {result.storeName}
                </span>
                <span style={{ fontSize: 12, color: '#999' }}>
                  {result.relatedOrders.length} 个关联订单
                </span>
              </div>

              {/* 功能订单信息 */}
              <div style={{ marginBottom: 10, padding: '8px 10px', backgroundColor: '#fff', borderRadius: 8 }}>
                <InfoRow label="功能订单" value={result.functionOrderNo} compact />
                <InfoRow label="功能订单状态" value={result.functionOrderStatus} compact />
              </div>

              {/* P1-08: 多条关联订单独立卡片 */}
              {result.relatedOrders.map((o) => (
                <div
                  key={o.orderNo}
                  style={{
                    marginTop: 10,
                    padding: '12px',
                    backgroundColor: '#fff',
                    borderRadius: 10,
                    borderLeft: `3px solid ${o.orderStatus === '已生成' ? '#4CAF50' : o.orderStatus === '生成失败' ? '#F44336' : '#FF9800'}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#333' }}>{o.orderType}</span>
                    <span style={{
                      fontSize: 12,
                      padding: '2px 8px',
                      borderRadius: 4,
                      backgroundColor: o.orderStatus === '已生成' ? '#E8F5E9' : o.orderStatus === '生成失败' ? '#FFEBEE' : '#FFF3E0',
                      color: o.orderStatus === '已生成' ? '#4CAF50' : o.orderStatus === '生成失败' ? '#F44336' : '#FF9800',
                      fontWeight: 500,
                    }}>
                      {o.orderStatus}
                    </span>
                  </div>
                  <InfoRow label="订单编号" value={o.orderNo} compact />
                  {o.remark && o.remark !== '-' && (
                    <InfoRow label="备注" value={o.remark} compact />
                  )}

                  {/* P1-09: 失败原因分层展示 + 重新处理入口 */}
                  {o.orderStatus === '生成失败' && result.failReason && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{
                        padding: '10px 12px',
                        backgroundColor: '#FFEBEE',
                        borderRadius: 8,
                        border: '1px solid #FFCDD2',
                      }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#F44336', marginBottom: 4 }}>
                          &#9888; 订单生成失败
                        </div>
                        <div style={{ fontSize: 12, color: '#D32F2F', lineHeight: 1.5 }}>
                          {result.failReason}
                        </div>
                      </div>
                      {/* 重新处理入口（占位） */}
                      <button
                        onClick={() => showToastMsg('重新处理功能待联调后开放')}
                        style={{
                          width: '100%',
                          marginTop: 8,
                          padding: '8px',
                          borderRadius: 8,
                          border: '1px solid #F44336',
                          backgroundColor: '#fff',
                          color: '#F44336',
                          fontSize: 13,
                          cursor: 'pointer',
                          fontWeight: 500,
                        }}
                      >
                        重新处理
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </SectionCard>
      )}

      {/* 审批操作区 */}
      {canApprove && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px',
          backgroundColor: '#fff',
          boxShadow: '0 -2px 12px rgba(0,0,0,0.1)',
          zIndex: 100,
        }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 14, color: '#666', display: 'block', marginBottom: 6 }}>
              备注 {!remark.trim() && <span style={{ color: '#F44336', fontSize: 12 }}>（驳回时必填）</span>}
            </label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="请输入备注"
              rows={2}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #e0e0e0',
                fontSize: 14,
                resize: 'none',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={handleReject}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 24,
                border: '1px solid #F44336',
                backgroundColor: '#fff',
                color: '#F44336',
                fontSize: 15,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              驳回
            </button>
            <button
              onClick={handleApprove}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 24,
                border: 'none',
                backgroundColor: '#22BDB8',
                color: '#fff',
                fontSize: 15,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              通过
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div style={{
          position: 'fixed',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0,0,0,0.75)',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: 8,
          fontSize: 14,
          zIndex: 1000,
          whiteSpace: 'nowrap',
        }}>
          {showToast}
        </div>
      )}
    </div>
  )
}

// ============================================================
// 子组件
// ============================================================

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: '#fff',
      margin: '12px 16px',
      borderRadius: 12,
      padding: '14px 16px',
    }}>
      <div style={{
        fontSize: 15,
        fontWeight: 600,
        color: '#333',
        marginBottom: 12,
        paddingBottom: 10,
        borderBottom: '1px solid #f0f0f0',
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function InfoRow({
  label,
  value,
  highlight,
  compact,
}: {
  label: string
  value: string
  highlight?: boolean
  compact?: boolean
}) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: compact ? '4px 0' : '8px 0',
      borderBottom: '1px solid #f8f8f8',
    }}>
      <span style={{ fontSize: compact ? 13 : 14, color: '#666', whiteSpace: 'nowrap', marginRight: 12 }}>
        {label}
      </span>
      <span style={{
        flex: 1,
        textAlign: 'right',
        fontSize: compact ? 13 : 14,
        color: highlight ? '#22BDB8' : '#333',
        fontWeight: highlight ? 600 : 400,
        wordBreak: 'break-all',
      }}>
        {value}
      </span>
    </div>
  )
}

const linkButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#22BDB8',
  fontSize: 13,
  cursor: 'pointer',
}
