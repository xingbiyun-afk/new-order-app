<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getMockWorkOrderDetail } from '../../mocks'
import { formatAmount } from '../../utils/format'
import type { ReapplyAvailability, GroupResult } from '../../types'

const route = useRoute()
const router = useRouter()

// CR-20260707-003: idSceneMap — 详情页场景映射表
//
// 本映射表维护「路由 id → scene key」的对应关系，与规则文档中的场景验收样本总表一一对应。
// 详情页支持两种场景切换方式：
//   1. Query Scene 优先：?scene=xxx 直接指定场景 key（最高优先级）
//   2. ID 映射兜底：无 query 时按本表映射，未命中则回退到默认场景
//
// 完整映射关系参见：docs/product/work-order-budget/产品申请工单详情页面规则明细.md §12 场景验收样本总表
// 也参见：vue-reference/src/mocks/index.ts 中的「详情页场景映射总表」
const idSceneMap: Record<string, string> = {
  '2': 'processing',           // 场景1：处理中 — PA202407010001
  '3': 'rejected-freeze',      // 场景2：已驳回-冻结期 — PA202406280003
  '4': 'rejected-expired',     // 场景3：已驳回-已到期 — PA202406150001
  '5': 'rejected-nonfreeze',   // 场景4：已驳回-非冻结期 — PA202406200001
  '6': 'completed',            // 场景5：已结束-部分成功 — PA202406100001
  '7': 'completed-full',       // 场景6：已结束-全部成功 — PA202407020001
  '8': 'completed-merged',     // 场景7：已结束-归并生成 — PA202407030001
  '9': 'completed-retry',      // 场景8：已结束-多次重试 — PA202407050001
  '10': 'completed-all-failed', // 场景9：已结束-全部失败 — PA202407060001
  '11': 'completed-store-change', // 场景10：已结束-专卖店变更 — PA202407070001
  '12': 'completed-product-change', // 场景11：已结束-产品变更 — PA202407080001
  '13': 'completed-store-product-change', // 场景12：已结束-专卖店+产品双重变更 — PA202407090001
}
const routeId = route.params.id as string
const scene = (route.query.scene as string | undefined) || idSceneMap[routeId] || undefined
const order = getMockWorkOrderDetail(scene)

const remark = ref('')
const toast = ref('')
const showReapplyConfirm = ref(false)

// ===== 状态判断 =====
const isRejected = computed(() => order.displayStatus === '已驳回')
const isProcessing = computed(() => order.displayStatus === '处理中')
const isCompleted = computed(() => order.displayStatus === '已结束')

// ===== 产品明细折叠状态 =====
const expandedGroups = ref<Set<string>>(new Set())
function isGroupExpanded(gid: string) { return expandedGroups.value.has(gid) }
function toggleGroup(gid: string) {
  const s = expandedGroups.value
  if (s.has(gid)) s.delete(gid)
  else s.add(gid)
}

// CR-20260706-002: 多次失败重试历史折叠状态（key: 订单号）
const expandedRetries = ref<Set<string>>(new Set())
function isRetryExpanded(orderNo: string) { return expandedRetries.value.has(orderNo) }
function toggleRetry(orderNo: string) {
  const s = expandedRetries.value
  if (s.has(orderNo)) s.delete(orderNo)
  else s.add(orderNo)
}

// CR-20260706-002: 失败原因去重
// CR-20260707-002: 注意：外层卡片只展示最新结果摘要，历史失败原因仅在折叠区展示
function dedupFailReasons(reasons?: string[]): string[] {
  if (!reasons || reasons.length === 0) return []
  return Array.from(new Set(reasons))
}

// CR-20260707-002: 获取订单最新状态（用于外层卡片摘要）
function getLatestOrderStatus(r: GroupResult): { status: string; isSuccess: boolean } {
  // 优先取 relatedOrders 最后一个订单的状态
  const lastOrder = r.relatedOrders[r.relatedOrders.length - 1]
  if (!lastOrder) return { status: '草稿', isSuccess: false }
  const status = lastOrder.orderStatus
  const isSuccess = status === '已创建' || status === '客服已审核' || status === '财务已审核'
  return { status, isSuccess }
}

// CR-20260708-001-fix: 在确认失败且最终为草稿的订单中，外层优先展示 retryHistory 最新失败原因，
// 与内层订单创建历史保持一致；无 retryHistory 时回退到 outerRemark
function getOuterFailRemark(r: GroupResult): string | null {
  // 优先从 retryHistory 读取最新失败原因，确保外层与内层一致
  if (r.retryHistory && Object.keys(r.retryHistory).length > 0) {
    const allAttempts: Array<import('../../types').OrderAttempt> = []
    for (const orderNo of Object.keys(r.retryHistory)) {
      allAttempts.push(...(r.retryHistory[orderNo] || []))
    }
    if (allAttempts.length > 0) {
      allAttempts.sort((a, b) => new Date(b.attemptAt).getTime() - new Date(a.attemptAt).getTime())
      const remark = getRetryRemark(allAttempts[0])
      if (remark) return remark
    }
  }
  // 无 retryHistory 时回退到 outerRemark（如删除原因等独立备注）
  return r.outerRemark || null
}

// CR-20260708-001: 订单创建历史备注承接优先级
// 删除理由 > 驳回回草稿说明 > 自动提交失败原因
function getRetryRemark(att: import('../../types').OrderAttempt): string | null {
  if (att.deleteReason) return att.deleteReason
  if (att.failReason) return att.failReason
  return null
}
function getRetryRemarkClass(att: import('../../types').OrderAttempt): string {
  if (att.deleteReason) return 'result-retry-reason result-retry-delete'
  return 'result-retry-reason'
}

// ============================================================
// CR-20260708-002: 订单结果区展示模型重构
// ============================================================

// 当前结果说明 5 类枚举（§9.1）
// 根据 GroupResult 状态自动计算当前结果说明
type ResultDescription = '草稿提交失败' | '审核驳回' | '草稿已删除' | '订单已创建' | '订单已创建（信息变更）';

function getCurrentResultDescription(r: GroupResult): ResultDescription {
  // 优先使用 mock 中预置的值（用于精确控制场景）
  if (r.currentResultDescription) return r.currentResultDescription as ResultDescription

  // 自动判断逻辑
  const latestStatus = getLatestOrderStatus(r)
  const hasInfoChange = hasStoreChange(r) || hasProductChange(r)

  // 1. 最终已创建且存在信息变更 → 订单已创建（信息变更）
  if (latestStatus.isSuccess && hasInfoChange) return '订单已创建（信息变更）'

  // 2. 最终已创建且无信息变更 → 订单已创建
  if (latestStatus.isSuccess) return '订单已创建'

  // 3. 当前最新状态为草稿 + 存在删除理由 → 草稿已删除
  if (latestStatus.status === '草稿' && r.outerRemark) return '草稿已删除'

  // 4. 当前最新状态为草稿 + 存在审核驳回历史 → 审核驳回
  if (latestStatus.status === '草稿' && hasRejectHistory(r)) return '审核驳回'

  // 5. 当前最新状态为草稿 + 提交失败 → 草稿提交失败
  if (latestStatus.status === '草稿') return '草稿提交失败'

  // 兜底
  return latestStatus.isSuccess ? '订单已创建' : '草稿提交失败'
}

// 当前主原因（§10）— 每个卡片首屏只展示一条主原因
function getCurrentMainReason(r: GroupResult): string | null {
  // 优先使用 mock 中预置的值
  if (r.currentMainReason) return r.currentMainReason

  const desc = getCurrentResultDescription(r)

  switch (desc) {
    case '草稿提交失败': {
      // 取最新失败原因
      const failReasons = dedupFailReasons(r.failReasons)
      if (failReasons.length > 0) return failReasons[failReasons.length - 1]
      // 从 retryHistory 取
      const latestAttempt = getLatestAttempt(r)
      if (latestAttempt?.failReason) return latestAttempt.failReason
      return '订单自动提交失败'
    }
    case '审核驳回': {
      const latestAttempt = getLatestAttempt(r)
      if (latestAttempt?.failReason) return latestAttempt.failReason
      return '订单审核被驳回'
    }
    case '草稿已删除': {
      return r.outerRemark || '草稿已被删除'
    }
    case '订单已创建（信息变更）': {
      const parts: string[] = []
      // 专卖店变更说明优先
      if (r.actualStoreCode && r.actualStoreName) {
        parts.push(`实际专卖店已变更为：${r.actualStoreCode} ${r.actualStoreName}`)
      }
      // 产品变更摘要
      if (r.productChangeSummary) {
        const { changedSkuCount, totalQuantityDiff } = r.productChangeSummary
        parts.push(`有 ${changedSkuCount} 款产品共 ${totalQuantityDiff} 个数量与申请工单内容不一致`)
      }
      return parts.length > 0 ? parts.join('\n') : '订单已创建，但信息与原申请存在差异'
    }
    case '订单已创建':
      // 订单已创建场景不展示主原因
      return null
    default:
      return null
  }
}

// 判断是否存在专卖店变更
function hasStoreChange(r: GroupResult): boolean {
  if (r.actualStoreCode && r.actualStoreCode !== r.storeCode) return true
  // 兼容旧数据：从 relatedOrders 中检查
  return r.relatedOrders.some(o => o.storeCode && o.storeCode !== r.storeCode)
}

// 判断是否存在产品变更
function hasProductChange(r: GroupResult): boolean {
  return !!r.productChangeSummary
}

// 判断是否存在审核驳回历史
function hasRejectHistory(r: GroupResult): boolean {
  // 从 retryHistory 中检查是否有审核驳回的失败原因
  if (r.retryHistory) {
    for (const attempts of Object.values(r.retryHistory)) {
      if (attempts.some(a => a.failReason?.includes('驳回'))) return true
    }
  }
  // 从 failReasons 中检查
  if (r.failReasons?.some(f => f.includes('驳回'))) return true
  return false
}

// 获取最新一次尝试记录
function getLatestAttempt(r: GroupResult): import('../../types').OrderAttempt | null {
  // 优先从 draftLinks 取
  if (r.draftLinks && r.draftLinks.length > 0) {
    const allAttempts: import('../../types').OrderAttempt[] = []
    for (const link of r.draftLinks) {
      allAttempts.push(...link.attempts)
    }
    if (allAttempts.length > 0) {
      allAttempts.sort((a, b) => new Date(b.attemptAt).getTime() - new Date(a.attemptAt).getTime())
      return allAttempts[0]
    }
  }
  // 兼容旧数据：从 retryHistory 取
  if (r.retryHistory) {
    const allAttempts: import('../../types').OrderAttempt[] = []
    for (const attempts of Object.values(r.retryHistory)) {
      allAttempts.push(...attempts)
    }
    if (allAttempts.length > 0) {
      allAttempts.sort((a, b) => new Date(b.attemptAt).getTime() - new Date(a.attemptAt).getTime())
      return allAttempts[0]
    }
  }
  return null
}

// 计算订单创建历史总次数（用于入口展示"N次"）
function getTotalAttemptCount(r: GroupResult): number {
  if (r.draftLinks) {
    return r.draftLinks.reduce((sum, link) => sum + link.attempts.length, 0)
  }
  if (r.retryHistory) {
    return Object.values(r.retryHistory).reduce((sum, arr) => sum + arr.length, 0)
  }
  return 0
}

// 草稿链路折叠状态（CR-20260708-002：按 draftId 管理）
// BUG FIX: 使用复合键 ${groupId}_${draftId} 避免不同卡片间 draftId 冲突
const expandedDrafts = ref<Set<string>>(new Set())
function makeDraftKey(groupId: string, draftId: string) { return `${groupId}_${draftId}` }
function isDraftExpanded(groupId: string, draftId: string) { return expandedDrafts.value.has(makeDraftKey(groupId, draftId)) }
function toggleDraft(groupId: string, draftId: string) {
  const key = makeDraftKey(groupId, draftId)
  const s = expandedDrafts.value
  if (s.has(key)) s.delete(key)
  else s.add(key)
}

// 兼容：订单创建历史整体折叠状态（卡片级统一入口）
const expandedHistoryCards = ref<Set<string>>(new Set())
function isHistoryCardExpanded(groupId: string) { return expandedHistoryCards.value.has(groupId) }
function toggleHistoryCard(groupId: string) {
  const s = expandedHistoryCards.value
  if (s.has(groupId)) s.delete(groupId)
  else s.add(groupId)
}

// CR-20260708-002: 兼容辅助 — 获取 retryHistory 的键列表
function getRetryHistoryKeys(r: GroupResult): string[] {
  if (!r.retryHistory) return []
  return Object.keys(r.retryHistory)
}
function getRetryHistoryAttempts(r: GroupResult, key: string): import('../../types').OrderAttempt[] {
  if (!r.retryHistory) return []
  return r.retryHistory[key] || []
}

// CR-20260708-002-fix: 获取最新的订单编号
// 只取 relatedOrders 中最后一个有 orderNo 的，如果没有则返回 null
function getLatestOrderNo(r: GroupResult): string | null {
  if (!r.relatedOrders || r.relatedOrders.length === 0) return null
  // 从后往前找第一个有 orderNo 的
  for (let i = r.relatedOrders.length - 1; i >= 0; i--) {
    if (r.relatedOrders[i].orderNo) {
      return r.relatedOrders[i].orderNo!
    }
  }
  return null
}

// ============================================================
// CR-20260708-003: 草稿链路摘要层辅助函数
// ============================================================

// 获取草稿链路的结果标签（用于摘要层展示）
function getDraftLinkResultLabel(link: import('../../types').DraftLink): string {
  if (link.isDeleted) return '草稿已删除'
  // 查找最后一条尝试记录的状态
  const lastAttempt = link.attempts[link.attempts.length - 1]
  if (!lastAttempt) return '草稿'
  if (lastAttempt.status === '已创建') return '订单已创建'
  if (lastAttempt.status === '草稿') {
    if (lastAttempt.failReason?.includes('驳回')) return '审核驳回'
    return '草稿提交失败'
  }
  return lastAttempt.status
}

// 获取草稿链路的最近一次时间
function getDraftLinkLatestTime(link: import('../../types').DraftLink): string {
  if (link.attempts.length === 0) return ''
  const lastAttempt = link.attempts[link.attempts.length - 1]
  return lastAttempt.attemptAt
}

// 判断是否为当前承接结果的草稿链路
// 当前链路 = 非删除状态且最后一条尝试为"已创建"的链路
function isCurrentDraftLink(link: import('../../types').DraftLink): boolean {
  if (link.isDeleted) return false
  const lastAttempt = link.attempts[link.attempts.length - 1]
  return lastAttempt?.status === '已创建'
}

// 排序草稿链路：当前链路优先，历史链路后置
function sortDraftLinks(links: import('../../types').DraftLink[]): import('../../types').DraftLink[] {
  return [...links].sort((a, b) => {
    const aIsCurrent = isCurrentDraftLink(a)
    const bIsCurrent = isCurrentDraftLink(b)
    if (aIsCurrent && !bIsCurrent) return -1
    if (!aIsCurrent && bIsCurrent) return 1
    // 同优先级时，按最近时间倒序
    const aTime = getDraftLinkLatestTime(a)
    const bTime = getDraftLinkLatestTime(b)
    return new Date(bTime).getTime() - new Date(aTime).getTime()
  })
}

// ===== 汇总计算 =====
// 款 = SKU 种类数 (products.length 合计)
// 件 = 数量合计 (products[].quantity 合计)
const summary = computed(() => {
  const groupCount = order.storeGroups.length
  const storeCount = new Set(order.storeGroups.map(g => g.storeCode)).size
  const skuCount = order.storeGroups.reduce((sum, g) => sum + g.products.length, 0)
  const itemCount = order.storeGroups.reduce(
    (sum, g) => sum + g.products.reduce((s, p) => s + p.quantity, 0), 0
  )
  return { groupCount, storeCount, skuCount, itemCount }
})

// 单个明细的款/件汇总
function groupSummary(g: { products: { quantity: number }[] }) {
  const skuCount = g.products.length
  const itemCount = g.products.reduce((s, p) => s + p.quantity, 0)
  return { skuCount, itemCount }
}

// 当前用户是否为处理人（mock固定为true）
const isCurrentApprover = true
const isHandled = ref(false)

// 审批操作区是否展示
const canApprove = computed(() =>
  isCurrentApprover && !isHandled.value && isProcessing.value
)

// ===== 重新发起五维度显式判断 (P0-1整改) =====
const reapplyCond = computed(() => order.reapplyCondition)

const canShowReapply = computed(() => {
  return isRejected.value && !!reapplyCond.value
})

const canClickReapply = computed(() => {
  if (!isRejected.value || !reapplyCond.value) return false
  const allowed: ReapplyAvailability[] = ['available', 'freeze_period_locked', 'non_freeze_new']
  return allowed.includes(reapplyCond.value.availability)
})

const isReapplyDisabled = computed(() => {
  if (!isRejected.value || !reapplyCond.value) return true
  return reapplyCond.value.availability === 'budget_expired'
})

const reapplyBtnText = computed(() => {
  const cond = reapplyCond.value
  if (!cond) return '重新发起'
  switch (cond.availability) {
    case 'freeze_period_locked': return '基于原单重新发起'
    case 'budget_expired': return '重新发起'
    case 'non_freeze_new': return '重新发起'
    case 'available': return '重新发起'
    default: return '重新发起'
  }
})

const reapplyHintText = computed(() => {
  const cond = reapplyCond.value
  if (!cond) return ''
  return cond.message
})

const canSwitchBudgetWhenReapply = computed(() => {
  return !!reapplyCond.value?.canSwitchBudget
})

// 当前审批进度（处理中状态）
const currentApprovalNode = computed(() => {
  if (!isProcessing.value) return null
  return order.approvalNodes.find(n => n.result === '待处理') || null
})

function getNodeClass(n: { nodeType: string; result?: string; id: string }): string {
  if (n.nodeType === 'start') return 'node-start'
  if (n.result === '驳回') return 'node-rejected'
  if (n.result === '待处理' && currentApprovalNode.value?.id === n.id) return 'node-current'
  if (n.result === '通过') return 'node-passed'
  return ''
}

const pendingNodeName = computed(() => {
  const node = currentApprovalNode.value
  if (!node) return ''
  // 找到节点序号
  const idx = order.approvalNodes.indexOf(node)
  return idx > 0 ? `审批节点 ${idx}` : '发起工单'
})

// ===== 状态颜色映射 =====
function getStatusColor(s: string) {
  switch (s) {
    case '处理中': return { bg: '#E6F8F8', color: '#22BDB8' }
    case '已结束': return { bg: '#E8F5E9', color: '#4CAF50' }
    case '已驳回': return { bg: '#FFEBEE', color: '#F44336' }
    default: return { bg: '#F5F5F5', color: '#999' }
  }
}

function getNodeResultColor(result?: string) {
  switch (result) {
    case '通过': return { bg: '#E8F5E9', color: '#4CAF50' }
    case '驳回': return { bg: '#FFEBEE', color: '#F44336' }
    case '待处理': return { bg: '#FFF3E0', color: '#FF9800' }
    default: return { bg: '#F5F5F5', color: '#999' }
  }
}

function getNodeDotColor(n: { nodeType: string; result?: string }) {
  if (n.nodeType === 'start') return '#22BDB8'
  switch (n.result) {
    case '通过': return '#4CAF50'
    case '驳回': return '#F44336'
    case '待处理': return '#FF9800'
    default: return '#999'
  }
}

// CR-20260707-002: 订单结果状态统一为"已创建/客服已审核/财务已审核/草稿"四种
function getOrderStatusColor(status: string) {
  switch (status) {
    case '已创建': return { bg: '#E8F5E9', color: '#4CAF50' }
    case '客服已审核': return { bg: '#E3F2FD', color: '#2196F3' }
    case '财务已审核': return { bg: '#E8F5E9', color: '#2E7D32' }
    case '草稿': return { bg: '#FFEBEE', color: '#F44336' }
    // 兼容旧数据
    case '已生成': return { bg: '#E8F5E9', color: '#4CAF50' }
    case '生成失败': return { bg: '#FFEBEE', color: '#F44336' }
    default: return { bg: '#FFF3E0', color: '#FF9800' }
  }
}

function getOrderBorderColor(status: string) {
  switch (status) {
    case '已创建': return '#4CAF50'
    case '客服已审核': return '#2196F3'
    case '财务已审核': return '#2E7D32'
    case '草稿': return '#F44336'
    // 兼容旧数据
    case '已生成': return '#4CAF50'
    case '生成失败': return '#F44336'
    default: return '#FF9800'
  }
}

// Toast
function showToast(msg: string) {
  toast.value = msg
  setTimeout(() => toast.value = '', 2500)
}

// 附件操作
function preview(name: string) { showToast(`预览附件：${name}`) }
function download(name: string) { showToast(`下载附件：${name}`) }

// 审批操作
function handleApprove() {
  isHandled.value = true
  showToast('审批已通过')
}
function handleReject() {
  if (!remark.value.trim()) {
    showToast('驳回时备注必填')
    return
  }
  isHandled.value = true
  showToast('审批已驳回')
}

// 重新发起
function handleReapply() {
  if (!canClickReapply.value) return
  showReapplyConfirm.value = true
}

function confirmReapply() {
  showReapplyConfirm.value = false
  if (!canSwitchBudgetWhenReapply.value && reapplyCond.value?.originalBudgetNo) {
    router.push({
      path: '/product-apply/create',
      query: { rejectedFrom: order.workOrderNo, budgetId: order.budget.id }
    })
  } else {
    router.push({ path: '/product-apply/create' })
  }
}

function cancelReapply() {
  showReapplyConfirm.value = false
}

function getReapplyConfirmText(): string {
  const cond = reapplyCond.value
  if (!cond) return '确定要重新发起此工单吗？'
  if (!canSwitchBudgetWhenReapply.value) {
    return `原预算号「${cond.originalBudgetNo || order.budget.budgetNo}」将沿用，当前场景下不允许重新选择预算号，提交时按剩余额度校验。确定继续？`
  }
  return '将按普通新建发起，当前场景下可自行选择预算号。确定继续？'
}

// 附件图标颜色
function getAttachmentIconColor(type: string): string {
  switch (type) {
    case 'pdf': return '#F44336'
    case 'excel': return '#4CAF50'
    case 'word': return '#2196F3'
    case 'zip': return '#FF9800'
    default: return '#22BDB8'
  }
}

// 产品标签文案
function getProductLabelText(pi: number): string {
  return `产品 ${pi + 1}`
}
</script>

<template>
  <div class="detail-page" :style="{ paddingBottom: (canApprove || canShowReapply) ? '160px' : '20px' }">
    <!-- ==================== Header ==================== -->
    <div class="detail-header">
      <button class="header-back" @click="router.back()">&#8249;</button>
      <span class="header-title">产品申请工单</span>
    </div>

    <!-- ==================== 驳回信息区 (§4.2 首屏优先) ==================== -->
    <div v-if="isRejected && order.rejectionInfo" class="tip-banner tip-error">
      <div class="tip-icon">&#9888;</div>
      <div class="tip-content">
        <div class="tip-title">工单已被驳回</div>
        <div class="tip-reason">{{ order.rejectionInfo.rejectReason }}</div>
        <div class="tip-meta">
          <span>驳回人：{{ order.rejectionInfo.rejectedBy }}</span>
          <span>{{ order.rejectionInfo.rejectedAt }}</span>
        </div>
        <div v-if="order.rejectionInfo.rejectRemark" class="tip-remark">
          {{ order.rejectionInfo.rejectRemark }}
        </div>
      </div>
    </div>

    <!-- 已到期不可重提提示 (§9 统一提示风格) -->
    <div v-if="isRejected && reapplyCond?.availability === 'budget_expired'" class="tip-banner tip-warning">
      <div class="tip-icon">&#128683;</div>
      <div class="tip-text">{{ reapplyCond.message }}</div>
    </div>

    <!-- ==================== 处理中：当前审批进度 (§5.1) ==================== -->
    <div v-if="isProcessing && currentApprovalNode" class="card approval-progress-card">
      <div class="section-title">当前审批进度</div>
      <div class="progress-content">
        <div class="progress-node">
          <span class="progress-dot pending"></span>
          <span class="progress-name">{{ pendingNodeName }}</span>
        </div>
        <div class="progress-handler">待处理人：{{ currentApprovalNode.handlerName }}</div>
      </div>
    </div>

    <!-- ==================== 基础信息 (§6.1 字段层级) ==================== -->
    <div class="card">
      <div class="section-title">基础信息</div>
      <div class="kv-row">
        <span class="kv-label">工单号</span>
        <span class="kv-value">{{ order.workOrderNo }}</span>
      </div>
      <div class="kv-row">
        <span class="kv-label">当前状态</span>
        <span class="kv-value" :style="{ color: getStatusColor(order.displayStatus).color, fontWeight: 500 }">
          {{ order.displayStatus }}
        </span>
      </div>
      <div class="kv-row">
        <span class="kv-label">申请人</span>
        <span class="kv-value">{{ order.applicantName }}</span>
      </div>
      <div class="kv-row">
        <span class="kv-label">申请组织</span>
        <span class="kv-value">{{ order.applicantOrg }}</span>
      </div>
      <div class="kv-row">
        <span class="kv-label">创建时间</span>
        <span class="kv-value">{{ order.createTime }}</span>
      </div>
    </div>

    <!-- ==================== 发起信息 (§6.2 字段层级) ==================== -->
    <div class="card">
      <div class="section-title">发起信息</div>
      <div class="kv-row">
        <span class="kv-label">申请类型</span>
        <span class="kv-value">{{ order.budget.applyType }}</span>
      </div>
      <div class="kv-row">
        <span class="kv-label">申请理由</span>
        <span class="kv-value kv-multiline">{{ order.budget.applyReason }}</span>
      </div>
    </div>

    <!-- ==================== 预算与申请信息 (§6.3 字段层级) ==================== -->
    <div class="card">
      <div class="section-title">预算与申请信息</div>
      <div class="kv-row">
        <span class="kv-label">预算号</span>
        <span class="kv-value">{{ order.budget.budgetNo }}</span>
      </div>
      <div class="kv-row">
        <span class="kv-label">预算归属组织</span>
        <span class="kv-value">{{ order.budget.budgetOrg }}</span>
      </div>
      <div class="kv-row">
        <span class="kv-label">预算使用范围</span>
        <span class="kv-value">{{ order.budget.budgetScope }}</span>
      </div>
      <!-- 预算总额弱化，本次申请额度主色突出 (§6.5) -->
      <div class="kv-row">
        <span class="kv-label" style="color:#999;">预算总额（净额）</span>
        <span class="kv-value" style="color:#999; font-weight:400;">¥{{ formatAmount(order.budget.budgetTotalAmount) }}</span>
      </div>
      <div class="kv-row budget-amount-row">
        <span class="kv-label">本次申请额度（净额）</span>
        <span class="kv-value amount">¥{{ formatAmount(order.totalAmount) }}</span>
      </div>
    </div>

    <!-- ==================== 产品申请订单明细 (§7) ==================== -->
    <div class="card">
      <!-- 汇总行 (§7.2 四列网格，数字独立成列应对位数膨胀) -->
      <div class="summary-bar">
        <div class="summary-cell">
          <div class="summary-num">{{ summary.groupCount }}</div>
          <div class="summary-label">笔订单</div>
        </div>
        <div class="summary-cell">
          <div class="summary-num">{{ summary.storeCount }}</div>
          <div class="summary-label">专卖店</div>
        </div>
        <div class="summary-cell">
          <div class="summary-num">{{ summary.skuCount }}</div>
          <div class="summary-label">款</div>
        </div>
        <div class="summary-cell">
          <div class="summary-num">{{ summary.itemCount }}</div>
          <div class="summary-label">件</div>
        </div>
      </div>

      <!-- 每个明细卡片 (§7.3 卡片头增强) -->
      <div v-for="(g, gi) in order.storeGroups" :key="g.id" class="group-fold-card">
        <!-- 标题行：可点击展开/折叠 (§7.3 两行布局：上行标题+编号+箭头；下行产品数+金额) -->
        <div class="group-fold-header" @click="toggleGroup(g.id)">
          <div class="group-fold-row1">
            <span class="group-fold-title">产品申请订单明细</span>
            <span class="capsule-num">{{ gi + 1 }}</span>
            <span class="fold-arrow" :class="{ expanded: isGroupExpanded(g.id) }">&#9662;</span>
          </div>
          <div class="group-fold-row2">
            <span class="group-badge">{{ groupSummary(g).skuCount }} 款 · {{ groupSummary(g).itemCount }} 件</span>
            <!-- §7.3 新增：分组金额显示在卡片头 -->
            <span class="group-amount-badge">¥{{ formatAmount(g.groupAmount) }}</span>
          </div>
        </div>

        <!-- 展开内容 (§7.4) -->
        <div v-show="isGroupExpanded(g.id)" class="group-fold-body">
          <div class="kv-row">
            <span class="kv-label">订单归属专卖店</span>
            <span class="kv-value">{{ g.storeCode }} {{ g.storeName }}</span>
          </div>

          <!-- 产品明细卡片 -->
          <div v-for="(p, pi) in g.products" :key="p.id" class="product-card">
            <div class="product-header">
              <span class="product-label">{{ getProductLabelText(pi) }}</span>
              <span v-if="p.isDiscount" class="discount-tag">打折 {{ (p.discount * 100).toFixed(0) }}%</span>
            </div>
            <div class="kv-row compact">
              <span class="kv-label">产品编号</span>
              <span class="kv-value">{{ p.productCode }}</span>
            </div>
            <div class="kv-row compact">
              <span class="kv-label">产品名称</span>
              <span class="kv-value product-name">{{ p.productName }}</span>
            </div>
            <div class="kv-row compact">
              <span class="kv-label">JDE价格</span>
              <span class="kv-value">¥{{ formatAmount(p.jdePrice) }}</span>
            </div>
            <div class="kv-row compact">
              <span class="kv-label">申请数量</span>
              <span class="kv-value">{{ p.quantity }}</span>
            </div>
            <div class="kv-row compact">
              <span class="kv-label">金额（净额）</span>
              <span class="kv-value amount">¥{{ formatAmount(p.amount) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 附件区 (§10) ==================== -->
    <div v-if="order.attachments.length" class="card">
      <div class="section-title">附件 ({{ order.attachments.length }})</div>
      <div v-for="a in order.attachments" :key="a.id" class="attachment-item">
        <div class="attachment-left">
          <svg class="attachment-icon" width="20" height="20" viewBox="0 0 24 24" :fill="getAttachmentIconColor(a.type)">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#fff" stroke-width="2" fill="none" />
          </svg>
          <div class="attachment-info">
            <span class="attachment-name" :title="a.name">{{ a.name }}</span>
            <span class="attachment-size">{{ (a.size / 1024).toFixed(0) }} KB · {{ a.type.toUpperCase() }}</span>
          </div>
        </div>
        <div class="attachment-actions">
          <button class="action-link" @click="preview(a.name)">预览</button>
          <button class="action-link" @click="download(a.name)">下载</button>
        </div>
      </div>
    </div>

    <!-- ==================== 审批流程 / 订单结果 (§5 状态驱动顺序) ==================== -->
    <!-- 处理中 / 已驳回：审批流 → 订单结果 -->
    <template v-if="!isCompleted">
      <!-- 审批流程 -->
      <div class="card">
        <div class="section-title">审批流程</div>
        <div class="timeline">
          <div class="timeline-line" />
          <div v-for="(n, i) in order.approvalNodes" :key="n.id" class="timeline-node" :style="{ marginBottom: i < order.approvalNodes.length - 1 ? '20px' : '0' }">
            <div class="timeline-dot" :style="{ backgroundColor: getNodeDotColor(n) }" />
            <div class="timeline-content" :class="getNodeClass(n)">
              <div class="node-title">
                {{ n.nodeName || (n.nodeType === 'start' ? '发起工单' : `审批节点 ${i}`) }}
                <span v-if="n.result" class="node-result" :style="getNodeResultColor(n.result)">{{ n.result }}</span>
              </div>
              <div class="node-meta">
                <span>{{ n.handlerName }}</span>
                <span v-if="n.handlerTime">{{ n.handlerTime }}</span>
                <span v-else class="pending-text">待处理</span>
              </div>
              <div v-if="n.remark" class="node-remark">{{ n.remark }}</div>
              <!-- CR-20260706-002: 预占库存订单仅在审批流发起节点展示，订单结果区不承接预占库存订单 -->
              <div v-if="n.nodeType === 'start' && n.functionOrderNos?.length" class="node-function-order">
                <div class="node-function-order-label">预占库存订单（{{ n.functionOrderNos.length }}）</div>
                <div class="node-function-order-list">
                  <span v-for="fo in n.functionOrderNos" :key="fo" class="fo-chip">{{ fo }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 订单结果 — CR-20260708-002: 按专卖店订单申请结果单元展示 -->
      <div v-if="order.groupResults?.length" class="card">
        <div class="section-title">订单结果</div>
        <div v-for="r in order.groupResults" :key="r.groupId" class="result-unit-card">
          <!-- 卡片头：专卖店信息 + 当前结果说明 -->
          <div class="result-unit-header">
            <div class="result-unit-store">
              <span class="result-unit-store-code">{{ r.storeCode }}</span>
              <span class="result-unit-store-name">{{ r.storeName }}</span>
            </div>
            <span class="result-unit-description" :class="'desc-' + (getCurrentResultDescription(r).includes('信息变更') ? 'changed' : getCurrentResultDescription(r).includes('草稿') || getCurrentResultDescription(r).includes('驳回') || getCurrentResultDescription(r).includes('删除') ? 'draft' : 'created')">
              {{ getCurrentResultDescription(r) }}
            </span>
          </div>

          <!-- 当前结果摘要区 -->
          <div class="result-unit-summary">
            <!-- 订单类型（统一展示一次） -->
            <div v-if="r.relatedOrders.length > 0" class="result-unit-order-type">
              {{ r.relatedOrders[0].orderType }}
            </div>
            <!-- 最新有效订单号（只显示最新一条） -->
            <div class="result-unit-order-no">
              <span v-if="getLatestOrderNo(r)">订单编号：{{ getLatestOrderNo(r) }}</span>
              <span v-else class="result-unit-draft">草稿</span>
            </div>
            <!-- 当前主原因（仅一条） -->
            <div v-if="getCurrentMainReason(r)" class="result-unit-main-reason" :class="{ 'reason-fail': getCurrentResultDescription(r) === '草稿提交失败' || getCurrentResultDescription(r) === '审核驳回' || getCurrentResultDescription(r) === '草稿已删除', 'reason-change': getCurrentResultDescription(r) === '订单已创建（信息变更）' }">
              {{ getCurrentMainReason(r) }}
            </div>
          </div>

          <!-- 订单创建历史 — 卡片级统一入口（CR-20260708-002 §12） -->
          <div v-if="(r.draftLinks && r.draftLinks.length > 0) || (r.retryHistory && Object.keys(r.retryHistory).length > 0)" class="result-history-section">
            <div class="result-history-toggle" @click="toggleHistoryCard(r.groupId)">
              <span class="result-history-toggle-text">
                订单创建历史（{{ getTotalAttemptCount(r) }} 次）
              </span>
              <span class="fold-arrow-mini" :class="{ expanded: isHistoryCardExpanded(r.groupId) }">&#9662;</span>
            </div>
            <div v-show="isHistoryCardExpanded(r.groupId)" class="result-history-body">
              <!-- 新结构：按 draftId 聚合展示草稿链路 -->
              <template v-if="r.draftLinks && r.draftLinks.length > 0">
                <div v-for="link in sortDraftLinks(r.draftLinks)" :key="link.draftId"
                     class="draft-link-block"
                     :class="{ 'draft-link-old': !isCurrentDraftLink(link) }">
                  <!-- 摘要层：默认展示，点击展开详情 -->
                  <div class="draft-link-header" @click="toggleDraft(r.groupId, link.draftId)">
                    <div class="draft-link-summary">
                      <span class="draft-link-label">草稿ID：{{ link.draftId }}</span>
                      <span class="draft-link-result" :class="'link-result-' + getDraftLinkResultLabel(link).replace(/[（）]/g, '')">
                        {{ getDraftLinkResultLabel(link) }}
                      </span>
                      <span v-if="link.isDeleted" class="draft-link-deleted">已删除</span>
                    </div>
                    <span class="fold-arrow-mini" :class="{ expanded: isDraftExpanded(r.groupId, link.draftId) }">&#9662;</span>
                  </div>
                  <!-- CR-20260708-003-fix: 时间放到第二行，避免与标签重叠 -->
                  <div class="draft-link-sub">
                    <span class="draft-link-time">{{ getDraftLinkLatestTime(link) }}</span>
                  </div>
                  <!-- 详情层：需二次点击展开 -->
                  <div v-show="isDraftExpanded(r.groupId, link.draftId)" class="draft-link-body">
                    <div v-for="(att, ai) in link.attempts" :key="ai" class="result-retry-item" :class="{ 'is-fail': att.status === '草稿', 'is-success': att.status === '已创建' }">
                      <div class="result-retry-row1">
                        <span class="result-retry-time">{{ att.attemptAt }}</span>
                        <span v-if="att.orderNo" class="result-retry-orderno">{{ att.orderNo }}</span>
                        <span class="result-retry-status" :style="getOrderStatusColor(att.status)">{{ att.status }}</span>
                      </div>
                      <div v-if="getRetryRemark(att)" :class="getRetryRemarkClass(att)">{{ getRetryRemark(att) }}</div>
                    </div>
                    <div v-if="link.isDeleted && link.deleteReason" class="draft-link-delete-reason">
                      删除原因：{{ link.deleteReason }}
                    </div>
                  </div>
                </div>
              </template>
              <!-- 兼容旧结构：按 retryHistory 展示 -->
              <template v-else-if="getRetryHistoryKeys(r).length > 0">
                <div v-for="key in getRetryHistoryKeys(r)" :key="key"
                     class="draft-link-block draft-link-old">
                  <div class="draft-link-header" @click="toggleDraft(r.groupId, key)">
                    <div class="draft-link-summary">
                      <span class="draft-link-label">{{ key === 'draft' ? '草稿提交' : key }}</span>
                    </div>
                    <span class="fold-arrow-mini" :class="{ expanded: isDraftExpanded(r.groupId, key) }">&#9662;</span>
                  </div>
                  <div v-show="isDraftExpanded(r.groupId, key)" class="draft-link-body">
                    <div v-for="(att, ai) in getRetryHistoryAttempts(r, key)" :key="ai" class="result-retry-item" :class="{ 'is-fail': att.status === '草稿', 'is-success': att.status === '已创建' }">
                      <div class="result-retry-row1">
                        <span class="result-retry-time">{{ att.attemptAt }}</span>
                        <span v-if="att.orderNo" class="result-retry-orderno">{{ att.orderNo }}</span>
                        <span class="result-retry-status" :style="getOrderStatusColor(att.status)">{{ att.status }}</span>
                      </div>
                      <div v-if="getRetryRemark(att)" :class="getRetryRemarkClass(att)">{{ getRetryRemark(att) }}</div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 已结束：订单结果 → 审批流程 (§5.3) -->
    <template v-else>
    <!-- 订单结果 — CR-20260708-002: 按专卖店订单申请结果单元展示（已结束场景） -->
      <div v-if="order.groupResults?.length" class="card result-card-elevated">
        <div class="section-title">订单结果</div>
        <div v-for="r in order.groupResults" :key="r.groupId" class="result-unit-card">
          <!-- 卡片头：专卖店信息 + 当前结果说明 -->
          <div class="result-unit-header">
            <div class="result-unit-store">
              <span class="result-unit-store-code">{{ r.storeCode }}</span>
              <span class="result-unit-store-name">{{ r.storeName }}</span>
            </div>
            <span class="result-unit-description" :class="'desc-' + (getCurrentResultDescription(r).includes('信息变更') ? 'changed' : getCurrentResultDescription(r).includes('草稿') || getCurrentResultDescription(r).includes('驳回') || getCurrentResultDescription(r).includes('删除') ? 'draft' : 'created')">
              {{ getCurrentResultDescription(r) }}
            </span>
          </div>

          <!-- 当前结果摘要区 -->
          <div class="result-unit-summary">
            <!-- 订单类型（统一展示一次） -->
            <div v-if="r.relatedOrders.length > 0" class="result-unit-order-type">
              {{ r.relatedOrders[0].orderType }}
            </div>
            <!-- 最新有效订单号（只显示最新一条） -->
            <div class="result-unit-order-no">
              <span v-if="getLatestOrderNo(r)">订单编号：{{ getLatestOrderNo(r) }}</span>
              <span v-else class="result-unit-draft">草稿</span>
            </div>
            <!-- 当前主原因（仅一条） -->
            <div v-if="getCurrentMainReason(r)" class="result-unit-main-reason" :class="{ 'reason-fail': getCurrentResultDescription(r) === '草稿提交失败' || getCurrentResultDescription(r) === '审核驳回' || getCurrentResultDescription(r) === '草稿已删除', 'reason-change': getCurrentResultDescription(r) === '订单已创建（信息变更）' }">
              {{ getCurrentMainReason(r) }}
            </div>
          </div>

          <!-- 订单创建历史 — 卡片级统一入口（CR-20260708-002 §12） -->
          <div v-if="(r.draftLinks && r.draftLinks.length > 0) || (r.retryHistory && Object.keys(r.retryHistory).length > 0)" class="result-history-section">
            <div class="result-history-toggle" @click="toggleHistoryCard(r.groupId)">
              <span class="result-history-toggle-text">
                订单创建历史（{{ getTotalAttemptCount(r) }} 次）
              </span>
              <span class="fold-arrow-mini" :class="{ expanded: isHistoryCardExpanded(r.groupId) }">&#9662;</span>
            </div>
            <div v-show="isHistoryCardExpanded(r.groupId)" class="result-history-body">
              <!-- 新结构：按 draftId 聚合展示草稿链路 -->
              <template v-if="r.draftLinks && r.draftLinks.length > 0">
                <div v-for="link in sortDraftLinks(r.draftLinks)" :key="link.draftId"
                     class="draft-link-block"
                     :class="{ 'draft-link-old': !isCurrentDraftLink(link) }">
                  <!-- 摘要层：默认展示，点击展开详情 -->
                  <div class="draft-link-header" @click="toggleDraft(r.groupId, link.draftId)">
                    <div class="draft-link-summary">
                      <span class="draft-link-label">草稿ID：{{ link.draftId }}</span>
                      <span class="draft-link-result" :class="'link-result-' + getDraftLinkResultLabel(link).replace(/[（）]/g, '')">
                        {{ getDraftLinkResultLabel(link) }}
                      </span>
                      <span v-if="link.isDeleted" class="draft-link-deleted">已删除</span>
                    </div>
                    <span class="fold-arrow-mini" :class="{ expanded: isDraftExpanded(r.groupId, link.draftId) }">&#9662;</span>
                  </div>
                  <!-- CR-20260708-003-fix: 时间放到第二行，避免与标签重叠 -->
                  <div class="draft-link-sub">
                    <span class="draft-link-time">{{ getDraftLinkLatestTime(link) }}</span>
                  </div>
                  <!-- 详情层：需二次点击展开 -->
                  <div v-show="isDraftExpanded(r.groupId, link.draftId)" class="draft-link-body">
                    <div v-for="(att, ai) in link.attempts" :key="ai" class="result-retry-item" :class="{ 'is-fail': att.status === '草稿', 'is-success': att.status === '已创建' }">
                      <div class="result-retry-row1">
                        <span class="result-retry-time">{{ att.attemptAt }}</span>
                        <span v-if="att.orderNo" class="result-retry-orderno">{{ att.orderNo }}</span>
                        <span class="result-retry-status" :style="getOrderStatusColor(att.status)">{{ att.status }}</span>
                      </div>
                      <div v-if="getRetryRemark(att)" :class="getRetryRemarkClass(att)">{{ getRetryRemark(att) }}</div>
                    </div>
                    <div v-if="link.isDeleted && link.deleteReason" class="draft-link-delete-reason">
                      删除原因：{{ link.deleteReason }}
                    </div>
                  </div>
                </div>
              </template>
              <!-- 兼容旧结构：按 retryHistory 展示 -->
              <template v-else-if="getRetryHistoryKeys(r).length > 0">
                <div v-for="key in getRetryHistoryKeys(r)" :key="key"
                     class="draft-link-block draft-link-old">
                  <div class="draft-link-header" @click="toggleDraft(r.groupId, key)">
                    <div class="draft-link-summary">
                      <span class="draft-link-label">{{ key === 'draft' ? '草稿提交' : key }}</span>
                    </div>
                    <span class="fold-arrow-mini" :class="{ expanded: isDraftExpanded(r.groupId, key) }">&#9662;</span>
                  </div>
                  <div v-show="isDraftExpanded(r.groupId, key)" class="draft-link-body">
                    <div v-for="(att, ai) in getRetryHistoryAttempts(r, key)" :key="ai" class="result-retry-item" :class="{ 'is-fail': att.status === '草稿', 'is-success': att.status === '已创建' }">
                      <div class="result-retry-row1">
                        <span class="result-retry-time">{{ att.attemptAt }}</span>
                        <span v-if="att.orderNo" class="result-retry-orderno">{{ att.orderNo }}</span>
                        <span class="result-retry-status" :style="getOrderStatusColor(att.status)">{{ att.status }}</span>
                      </div>
                      <div v-if="getRetryRemark(att)" :class="getRetryRemarkClass(att)">{{ getRetryRemark(att) }}</div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
      <!-- 审批流程（已结束场景层级降低） -->
      <div class="card">
        <div class="section-title">审批流程</div>
        <div class="timeline">
          <div class="timeline-line" />
          <div v-for="(n, i) in order.approvalNodes" :key="n.id" class="timeline-node" :style="{ marginBottom: i < order.approvalNodes.length - 1 ? '20px' : '0' }">
            <div class="timeline-dot" :style="{ backgroundColor: getNodeDotColor(n) }" />
            <div class="timeline-content">
              <div class="node-title">
                {{ n.nodeName || (n.nodeType === 'start' ? '发起工单' : `审批节点 ${i}`) }}
                <span v-if="n.result" class="node-result" :style="getNodeResultColor(n.result)">{{ n.result }}</span>
              </div>
              <div class="node-meta">
                <span>{{ n.handlerName }}</span>
                <span v-if="n.handlerTime">{{ n.handlerTime }}</span>
              </div>
              <div v-if="n.remark" class="node-remark">{{ n.remark }}</div>
              <!-- CR-20260706-002: 预占库存订单仅在审批流发起节点展示，订单结果区不承接预占库存订单 -->
              <div v-if="n.nodeType === 'start' && n.functionOrderNos?.length" class="node-function-order">
                <div class="node-function-order-label">预占库存订单（{{ n.functionOrderNos.length }}）</div>
                <div class="node-function-order-list">
                  <span v-for="fo in n.functionOrderNos" :key="fo" class="fo-chip">{{ fo }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ==================== 审批操作区 (处理中状态) ==================== -->
    <div v-if="canApprove" class="approval-actions">
      <div class="approval-input">
        <label class="approval-label">
          备注 <span v-if="!remark.trim()" class="required-mark">（驳回时必填）</span>
        </label>
        <textarea v-model="remark" placeholder="请输入备注" rows="2" class="approval-textarea" />
      </div>
      <div class="approval-buttons">
        <button class="btn-reject" @click="handleReject">驳回</button>
        <button class="btn-approve" @click="handleApprove">通过</button>
      </div>
    </div>

    <!-- ==================== 重新发起操作区 (已驳回状态) ==================== -->
    <div v-if="canShowReapply" class="reapply-actions">
      <button
        class="btn-reapply"
        :class="{ disabled: isReapplyDisabled }"
        :disabled="isReapplyDisabled"
        @click="handleReapply"
      >
        {{ reapplyBtnText }}
      </button>
      <div v-if="reapplyHintText" class="reapply-hint">
        {{ reapplyHintText }}
      </div>
    </div>

    <!-- ==================== 重新发起确认弹窗 ==================== -->
    <div v-if="showReapplyConfirm" class="modal-overlay" @click="cancelReapply">
      <div class="modal-content" @click.stop>
        <div class="modal-title">重新发起确认</div>
        <div class="modal-body">{{ getReapplyConfirmText() }}</div>
        <div class="modal-buttons">
          <button class="modal-cancel" @click="cancelReapply">取消</button>
          <button class="modal-confirm" @click="confirmReapply">确定</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<style scoped>
/* ========== 页面基础 ========== */
.detail-page {
  min-height: 100vh;
  background-color: #F5F5F5;
}

/* ========== Header ========== */
.detail-header {
  padding: 12px 16px;
  background-color: #22BDB8;
  display: flex;
  align-items: center;
  position: relative;
}
.header-back {
  position: absolute;
  left: 12px;
  background: none;
  border: none;
  color: #fff;
  font-size: 22px;
  cursor: pointer;
  padding: 4px 8px;
  line-height: 1;
}
.header-title {
  color: #fff;
  font-size: 17px;
  font-weight: 500;
  flex: 1;
  text-align: center;
}

/* ========== Card ========== */
.card {
  margin: 12px 16px;
  padding: 14px 16px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}
.group-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.group-badge {
  font-size: 12px;
  font-weight: 400;
  color: #999;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 8px;
}
/* §7.3 新增：分组金额标签 */
.group-amount-badge {
  font-size: 12px;
  font-weight: 500;
  color: #22BDB8;
  background: #E0F7F6;
  padding: 2px 8px;
  border-radius: 8px;
  margin-left: 4px;
  white-space: nowrap;
  max-width: 50%;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ========== Key-Value Row ========== */
.kv-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f8f8f8;
}
.kv-row:last-child {
  border-bottom: none;
}
.kv-label {
  font-size: 14px;
  color: #666;
  flex-shrink: 0;
}
.kv-value {
  font-size: 14px;
  color: #333;
  text-align: right;
  word-break: break-all;
  margin-left: 12px;
}
.kv-multiline {
  max-width: 60%;
  line-height: 1.5;
}
.kv-row.compact {
  padding: 4px 0;
}
.kv-row.compact .kv-label,
.kv-row.compact .kv-value {
  font-size: 13px;
}

/* ========== 金额样式 ========== */
.amount {
  color: #22BDB8;
  font-weight: 600;
}
.amount-warning {
  color: #F44336;
}
.budget-amount-row {
  background-color: #FAFAFA;
  margin: 4px -8px;
  padding: 8px;
  border-radius: 8px;
}

/* ========== 统一提示风格 (§9) ========== */
.tip-banner {
  margin: 12px 16px;
  padding: 14px 16px;
  border-radius: 12px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.tip-error {
  background: linear-gradient(135deg, #FFEBEE 0%, #FFF3E0 100%);
  border: 1px solid #FFCDD2;
}
.tip-warning {
  background: #FFF3E0;
  border: 1px solid #FFE0B2;
}
.tip-info {
  background: #E6F8F8;
  border: 1px solid #B2DFDB;
}
.tip-inline {
  margin: 12px 0 0;
  padding: 12px;
}
.tip-icon {
  font-size: 20px;
  line-height: 1;
  flex-shrink: 0;
}
.tip-content {
  flex: 1;
}
.tip-title {
  font-size: 14px;
  font-weight: 600;
  color: #D32F2F;
  margin-bottom: 6px;
}
.tip-reason {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin-bottom: 8px;
  line-height: 1.5;
}
.tip-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
  margin-bottom: 6px;
  align-items: center;
  line-height: 1.5;
}
.tip-remark {
  font-size: 13px;
  color: #666;
  background: rgba(255, 255, 255, 0.7);
  padding: 8px 10px;
  border-radius: 8px;
  margin-top: 6px;
  line-height: 1.5;
}
.tip-text {
  font-size: 14px;
  color: #E65100;
  font-weight: 500;
  line-height: 1.5;
}

/* ========== 处理中：当前审批进度 (§5.1) ========== */
.approval-progress-card {
  border-left: 3px solid #FF9800;
}
.progress-content {
  padding: 8px 0;
}
.progress-node {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.progress-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.progress-dot.pending {
  background: #FF9800;
  box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.2);
}
.progress-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}
.progress-handler {
  font-size: 13px;
  color: #666;
  padding-left: 18px;
}

/* ========== 产品卡片 ========== */
.product-card {
  margin-top: 10px;
  padding: 12px;
  background-color: #FAFAFA;
  border-radius: 10px;
}
.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}
.product-label {
  font-size: 13px;
  font-weight: 600;
  color: #22BDB8;
}
.discount-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  background: #E0F7F6;
  color: #22BDB8;
  font-weight: 500;
}
.product-name {
  font-weight: 500;
}

/* ========== 汇总行 ========== */
.summary-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 12px 0;
  margin-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
  text-align: center;
}
.summary-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 0;
}
.summary-num {
  color: #22BDB8;
  font-weight: 600;
  font-size: 18px;
  line-height: 1.2;
  white-space: nowrap;
}
.summary-label {
  color: #999;
  font-size: 12px;
  line-height: 1.2;
  white-space: nowrap;
}

/* ========== 折叠卡片 ========== */
.group-fold-card {
  margin-top: 10px;
  padding: 12px;
  background-color: #FAFAFA;
  border-radius: 10px;
}
.group-fold-card + .group-fold-card {
  margin-top: 8px;
}
.group-fold-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
  user-select: none;
  padding: 4px 0;
}
.group-fold-row1 {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.group-fold-row1 .fold-arrow {
  margin-left: auto;
}
.group-fold-row2 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}
.group-fold-row2 .group-amount-badge {
  margin-left: auto;
  white-space: nowrap;
}
.group-fold-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  line-height: 24px;
  white-space: nowrap;
}
.group-fold-body {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

/* ========== 胶囊编号 ========== */
.capsule-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  border-radius: 12px;
  background-color: #E0F7F6;
  color: #22BDB8;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  flex-shrink: 0;
}

/* ========== 折叠箭头 ========== */
.fold-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: #999;
  font-size: 18px;
  line-height: 1;
  transition: transform 0.2s;
  flex-shrink: 0;
}
.fold-arrow.expanded {
  transform: rotate(-180deg);
}

/* ========== 分组小计 ========== */
.group-subtotal {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #666;
}
.group-subtotal .amount {
  font-size: 15px;
}

/* ========== 附件区 (§10) ========== */
.attachment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}
.attachment-item:last-child {
  border-bottom: none;
}
.attachment-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}
.attachment-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.attachment-name {
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.attachment-size {
  font-size: 12px;
  color: #999;
}
.attachment-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}
.action-link {
  background: none;
  border: none;
  color: #22BDB8;
  font-size: 13px;
  cursor: pointer;
  padding: 2px 4px;
}
.action-link:hover {
  text-decoration: underline;
}

/* ========== 审批节点类型视觉区分 (§4) ========== */
.node-start .node-title { color: #22BDB8; font-weight: 600; }
.node-passed .node-title { color: #333; }
.node-current { background: #FFF8E1; border-radius: 8px; padding: 8px; margin: -8px -4px; }
.node-current .node-title { color: #FF9800; font-weight: 600; }
.node-current .pending-text { font-weight: 600; }
.node-rejected { background: #FFEBEE; border-radius: 8px; padding: 8px; margin: -8px -4px; }
.node-rejected .node-title { color: #F44336; font-weight: 600; }
.node-rejected .node-remark { background: rgba(244, 67, 54, 0.08); border-left: 3px solid #F44336; }
/* 审批意见贴近节点 */
.node-remark { margin-top: 6px; padding: 8px 10px; background: #FAFAFA; border-radius: 8px; font-size: 13px; color: #666; line-height: 1.5; }

/* ========== 预占库存订单仅在审批流发起节点展示 (§6) ========== */
.node-function-order { margin-top: 8px; padding: 6px 0; }
.node-function-order-label { font-size: 12px; color: #999; margin-bottom: 6px; }
.node-function-order-list { display: flex; flex-wrap: wrap; gap: 6px; }
.fo-chip {
  display: inline-block;
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  padding: 3px 10px;
  border-radius: 10px;
  font-family: 'SF Mono', 'Monaco', monospace;
  letter-spacing: 0.3px;
}

.timeline {
  position: relative;
  padding-left: 20px;
}
.timeline-line {
  position: absolute;
  left: 5px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background-color: #e0e0e0;
}
.timeline-node {
  position: relative;
}
.timeline-dot {
  position: absolute;
  left: -20px;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px #e0e0e0;
  z-index: 1;
}
.timeline-content {
  padding-left: 4px;
}
.node-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.node-result {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}
.node-meta {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.pending-text {
  color: #FF9800;
  font-weight: 500;
}
.node-remark {
  margin-top: 6px;
  padding: 8px 10px;
  background: #FAFAFA;
  border-radius: 8px;
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}
.node-function-order {
  margin-top: 6px;
  font-size: 12px;
  color: #999;
}

/* ========== 关联订单 ========== */
.related-orders {
  margin-top: 8px;
}
.related-order-item {
  padding: 10px 12px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-top: 6px;
  border-left: 3px solid;
}
.related-order-type {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}
.related-order-no {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}
.related-order-status {
  display: inline-block;
  margin-top: 4px;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

/* ========== CR-20260706-002 / CR-20260707-002: 多次失败重试（折叠收起 + 长文本排版优化） ========== */
.result-retry-section {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #e0e0e0;
}
.result-retry-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  cursor: pointer;
  user-select: none;
}
.result-retry-toggle-text {
  font-size: 12px;
  color: #22BDB8;
  font-weight: 500;
}
.fold-arrow-mini {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: #999;
  font-size: 12px;
  transition: transform 0.2s;
}
.fold-arrow-mini.expanded {
  transform: rotate(-180deg);
}
.result-retry-list {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.result-retry-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.5;
}
.result-retry-item.is-fail { background: #FFEBEE; }
.result-retry-item.is-success { background: #E8F5E9; }
/* CR-20260707-002: 重试历史展开区长文本排版优化 - 时间/订单号+状态/失败原因分行 */
.result-retry-row1 {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}
.result-retry-time {
  color: #666;
  font-family: 'SF Mono', 'Monaco', monospace;
}
.result-retry-status {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 3px;
  font-weight: 500;
  flex-shrink: 0;
}
.result-retry-orderno {
  font-family: 'SF Mono', 'Monaco', monospace;
  font-size: 12px;
  color: #333;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 3px;
  padding: 1px 4px;
  flex-shrink: 0;
}
/* CR-20260707-002: 失败原因/备注独立换行，避免挤压在最右窄列 */
.result-retry-reason {
  color: #666;
  font-size: 12px;
  line-height: 1.5;
  padding-top: 2px;
  border-top: 1px dashed rgba(0,0,0,0.06);
}
/* ========== 订单结果 ========== */
.result-card {
  padding: 14px;
  background: #FAFAFA;
  border-radius: 12px;
  margin-bottom: 12px;
  border: 1px solid #f0f0f0;
}
/* §5.3 已结束状态订单结果层级提升 */
.result-card-elevated .result-card {
  border-left: 3px solid #4CAF50;
}
.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}
.result-count {
  font-size: 12px;
  color: #999;
  font-weight: 400;
}
.result-order-item {
  margin-top: 10px;
  padding: 12px;
  background: #fff;
  border-radius: 10px;
  border-left: 3px solid;
}
.result-order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.result-order-type {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}
.result-order-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}
.result-order-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: #666;
}
/* CR-20260706-004: 订单实际所属专卖店（与工单明细不一致时展示） */
.result-order-store {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #E6A23C;
  background: #FFF8E6;
  padding: 4px 8px;
  border-radius: 4px;
  margin-top: 4px;
}
.result-order-store::before {
  content: '\2192';
  font-size: 10px;
  color: #E6A23C;
}
/* CR-20260706-004: 订单备注（多次重试说明、更换专卖店说明） */
.result-order-remark {
  font-size: 12px;
  color: #909399;
  font-style: italic;
}

/* ========== 审批操作区 ========== */
.approval-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: #fff;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
}
.approval-input {
  margin-bottom: 12px;
}
.approval-label {
  font-size: 14px;
  color: #666;
  display: block;
  margin-bottom: 6px;
}
.required-mark {
  color: #F44336;
  font-size: 12px;
}
.approval-textarea {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  font-size: 14px;
  resize: none;
  outline: none;
  font-family: inherit;
}
.approval-textarea:focus {
  border-color: #22BDB8;
}
.approval-buttons {
  display: flex;
  gap: 12px;
}
.btn-reject {
  flex: 1;
  padding: 12px;
  border-radius: 24px;
  border: 1px solid #F44336;
  background: #fff;
  color: #F44336;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}
.btn-approve {
  flex: 1;
  padding: 12px;
  border-radius: 24px;
  border: none;
  background: #22BDB8;
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}

/* ========== 重新发起操作区 ========== */
.reapply-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: #fff;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.btn-reapply {
  width: 100%;
  padding: 14px;
  border-radius: 24px;
  border: none;
  background: #22BDB8;
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}
.btn-reapply.disabled {
  background: #ccc;
  cursor: not-allowed;
}
.reapply-hint {
  font-size: 12px;
  color: #999;
  text-align: center;
  line-height: 1.5;
}

/* ========== 弹窗 ========== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  width: 80%;
  max-width: 320px;
}
.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  text-align: center;
}
.modal-body {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}
.modal-buttons {
  display: flex;
  gap: 12px;
}
.modal-cancel {
  flex: 1;
  padding: 10px;
  border-radius: 20px;
  border: 1px solid #e0e0e0;
  background: #fff;
  color: #666;
  font-size: 14px;
  cursor: pointer;
}
.modal-confirm {
  flex: 1;
  padding: 10px;
  border-radius: 20px;
  border: none;
  background: #22BDB8;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

/* ========== Toast ========== */
.toast {
  position: fixed;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 1000;
  white-space: nowrap;
}

/* ========== CR-20260708-002: 订单结果区 — 专卖店订单申请结果单元 ========== */

/* 结果单元卡片 */
.result-unit-card {
  margin-bottom: 16px;
  padding: 14px;
  background: #FAFAFA;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
}
.result-unit-card:last-child {
  margin-bottom: 0;
}

/* 卡片头：专卖店 + 结果说明 */
.result-unit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}
.result-unit-store {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}
.result-unit-store-code {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  flex-shrink: 0;
}
.result-unit-store-name {
  font-size: 13px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 当前结果说明标签 */
.result-unit-description {
  font-size: 12px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 10px;
  flex-shrink: 0;
  margin-left: 8px;
}
/* 草稿/驳回/删除 — 红色系 */
.desc-draft {
  background: #FFEBEE;
  color: #D32F2F;
  border: 1px solid #FFCDD2;
}
/* 已创建 — 绿色系 */
.desc-created {
  background: #E8F5E9;
  color: #2E7D32;
  border: 1px solid #C8E6C9;
}
/* 信息变更 — 橙色系 */
.desc-changed {
  background: #FFF3E0;
  color: #E65100;
  border: 1px solid #FFE0B2;
}

/* 当前结果摘要区 */
.result-unit-summary {
  margin-bottom: 10px;
}
.result-unit-order-type {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}
.result-unit-order-no {
  font-size: 13px;
  color: #333;
  margin-bottom: 4px;
}
.result-unit-order-no span {
  font-family: monospace;
}
.result-unit-draft {
  color: #999;
  font-style: italic;
}

/* 当前主原因 */
.result-unit-main-reason {
  font-size: 13px;
  line-height: 1.6;
  padding: 8px 12px;
  border-radius: 8px;
  margin-top: 8px;
  white-space: pre-line;
}
.reason-fail {
  background: #FFEBEE;
  color: #D32F2F;
  border-left: 3px solid #EF5350;
}
.reason-change {
  background: #FFF8E1;
  color: #E65100;
  border-left: 3px solid #FFA726;
}

/* 订单创建历史 — 卡片级统一入口 */
.result-history-section {
  margin-top: 10px;
  border-top: 1px dashed #e0e0e0;
  padding-top: 10px;
}
.result-history-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  cursor: pointer;
}
.result-history-toggle-text {
  font-size: 13px;
  color: #22BDB8;
  font-weight: 500;
}

/* ========== CR-20260708-003: 草稿链路块（摘要层 + 详情层） ========== */

/* 草稿链路块 */
.draft-link-block {
  margin-bottom: 8px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  overflow: hidden;
}
.draft-link-block:last-child {
  margin-bottom: 0;
}

/* 旧链路弱化样式（§12.4） */
.draft-link-old {
  border-color: #f5f5f5;
  background: #fafafa;
}
.draft-link-old .draft-link-header {
  background: #f5f5f5;
}
.draft-link-old .draft-link-label {
  color: #aaa;
}
.draft-link-old .draft-link-result {
  opacity: 0.6;
}

/* 摘要层头部 */
.draft-link-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;                    /* fix: 摘要区和元数据区之间加间距 */
  padding: 10px 12px;
  cursor: pointer;
  background: #f9f9f9;
}

/* 摘要区左部（ID + 结果标签） */
.draft-link-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 1 auto;               /* fix: 不强制占据所有空间，避免与meta重叠 */
  min-width: 0;
}
.draft-link-label {
  font-size: 12px;
  color: #666;
  flex-shrink: 0;
}

/* 链路结果标签 */
.draft-link-result {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 500;
  flex-shrink: 0;
  margin-right: 4px;            /* fix: 标签和时间之间加间距 */
}
/* 订单已创建 - 绿色 */
.link-result-订单已创建 {
  background: #E8F5E9;
  color: #2E7D32;
}
/* 草稿提交失败 - 浅红（历史区弱化） */
.link-result-草稿提交失败 {
  background: #FFEBEE;
  color: #D32F2F;
  opacity: 0.7;
}
/* 审核驳回 - 浅红（历史区弱化） */
.link-result-审核驳回 {
  background: #FFEBEE;
  color: #D32F2F;
  opacity: 0.7;
}
/* 草稿已删除 - 灰色（中性说明） */
.link-result-草稿已删除 {
  background: #EEEEEE;
  color: #999;
}

/* 第二行：时间（CR-20260708-003-fix: 从同行移到独立行） */
.draft-link-sub {
  display: flex;
  align-items: center;
  padding: 4px 12px 6px;
  background: #f9f9f9;
  border-top: 1px solid #f0f0f0;
}
.draft-link-old .draft-link-sub {
  background: #f5f5f5;
  border-top-color: #eee;
}
.draft-link-time {
  font-size: 11px;
  color: #bbb;
  font-family: 'SF Mono', 'Monaco', monospace;
}

.draft-link-deleted {
  font-size: 11px;
  color: #999;
  background: #EEEEEE;
  padding: 2px 8px;
  border-radius: 6px;
  flex-shrink: 0;
}

/* 详情层 */
.draft-link-body {
  padding: 10px 12px;
}

/* 删除原因 - 中性说明样式（§12.3） */
.draft-link-delete-reason {
  font-size: 12px;
  color: #999;
  font-style: italic;
  padding: 8px 0 4px;
  border-top: 1px dashed #e0e0e0;
  margin-top: 6px;
}

/* ========== CR-20260708-003: 历史区视觉减负 ========== */

/* 历史区中的失败项：弱化错误样式（§12.2）
   从强红底 #FFEBEE 改为浅灰底 + 红字 */
.result-retry-item.is-fail {
  background: #f8f8f8;
  border-left: 2px solid #EF9A9A;
}

/* 历史区中的删除理由：中性说明样式（§12.3）
   不再是强红块 */
.result-retry-delete {
  color: #999;
  background: transparent;
  padding: 4px 0;
  border-radius: 0;
  border-top: 1px dashed #e0e0e0;
  font-style: italic;
}
</style>
