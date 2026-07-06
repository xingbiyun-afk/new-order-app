<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getMockWorkOrderDetail } from '../../mocks'
import { formatAmount } from '../../utils/format'
import type { ReapplyAvailability } from '../../types'

const route = useRoute()
const router = useRouter()

// CR-20260703-003: 支持通过 ?scene=xxx 切换 mock 场景，也支持通过 id 路由匹配场景
const idSceneMap: Record<string, string> = {
  '2': 'processing',
  '3': 'rejected-freeze',
  '4': 'rejected-expired',
  '5': 'rejected-nonfreeze',
  '6': 'completed',
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

function getOrderStatusColor(status: string) {
  switch (status) {
    case '已生成': return { bg: '#E8F5E9', color: '#4CAF50' }
    case '生成失败': return { bg: '#FFEBEE', color: '#F44336' }
    default: return { bg: '#FFF3E0', color: '#FF9800' }
  }
}

function getOrderBorderColor(status: string) {
  switch (status) {
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
      <span class="header-status" :style="getStatusColor(order.displayStatus)">
        {{ order.displayStatus }}
      </span>
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
            <div class="timeline-content">
              <div class="node-title">
                {{ n.nodeType === 'start' ? '发起工单' : `审批节点 ${i}` }}
                <span v-if="n.result" class="node-result" :style="getNodeResultColor(n.result)">{{ n.result }}</span>
              </div>
              <div class="node-meta">
                <span>{{ n.handlerName }}</span>
                <span v-if="n.handlerTime">{{ n.handlerTime }}</span>
                <span v-else class="pending-text">待处理</span>
              </div>
              <div v-if="n.remark" class="node-remark">{{ n.remark }}</div>
              <div v-if="n.functionOrderNo" class="node-function-order">
                功能订单：{{ n.functionOrderNo }}（{{ n.functionOrderStatus }}）
              </div>
              <div v-if="n.relatedOrders?.length" class="related-orders">
                <div v-for="o in n.relatedOrders" :key="o.orderNo" class="related-order-item" :style="{ borderLeftColor: getOrderBorderColor(o.orderStatus) }">
                  <div class="related-order-type">{{ o.orderType }}</div>
                  <div class="related-order-no">{{ o.orderNo }}</div>
                  <span class="related-order-status" :style="getOrderStatusColor(o.orderStatus)">{{ o.orderStatus }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 订单结果 -->
      <div v-if="order.groupResults?.length" class="card">
        <div class="section-title">订单结果</div>
        <div v-for="r in order.groupResults" :key="r.groupId" class="result-card">
          <div class="result-header">
            <span>{{ r.storeCode }} {{ r.storeName }}</span>
            <span class="result-count">{{ r.relatedOrders.length }} 个关联订单</span>
          </div>
          <div class="result-function-order">
            <span>功能订单：{{ r.functionOrderNo }}</span>
            <span>状态：{{ r.functionOrderStatus }}</span>
          </div>
          <div v-for="o in r.relatedOrders" :key="o.orderNo" class="result-order-item" :style="{ borderLeftColor: getOrderBorderColor(o.orderStatus) }">
            <div class="result-order-header">
              <span class="result-order-type">{{ o.orderType }}</span>
              <span class="result-order-status" :style="getOrderStatusColor(o.orderStatus)">{{ o.orderStatus }}</span>
            </div>
            <div class="result-order-detail">
              <span>订单编号：{{ o.orderNo }}</span>
              <span v-if="o.remark && o.remark !== '-'">备注：{{ o.remark }}</span>
            </div>
          </div>
          <!-- 失败原因 (§9 统一提示风格) -->
          <div v-if="r.failReason" class="tip-banner tip-error tip-inline">
            <div class="tip-icon">&#9888;</div>
            <div class="tip-content">
              <div class="tip-title">订单生成失败</div>
              <div class="tip-text">{{ r.failReason }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 已结束：订单结果 → 审批流程 (§5.3) -->
    <template v-else>
      <!-- 订单结果（提升层级） -->
      <div v-if="order.groupResults?.length" class="card result-card-elevated">
        <div class="section-title">订单结果</div>
        <div v-for="r in order.groupResults" :key="r.groupId" class="result-card">
          <div class="result-header">
            <span>{{ r.storeCode }} {{ r.storeName }}</span>
            <span class="result-count">{{ r.relatedOrders.length }} 个关联订单</span>
          </div>
          <div class="result-function-order">
            <span>功能订单：{{ r.functionOrderNo }}</span>
            <span>状态：{{ r.functionOrderStatus }}</span>
          </div>
          <div v-for="o in r.relatedOrders" :key="o.orderNo" class="result-order-item" :style="{ borderLeftColor: getOrderBorderColor(o.orderStatus) }">
            <div class="result-order-header">
              <span class="result-order-type">{{ o.orderType }}</span>
              <span class="result-order-status" :style="getOrderStatusColor(o.orderStatus)">{{ o.orderStatus }}</span>
            </div>
            <div class="result-order-detail">
              <span>订单编号：{{ o.orderNo }}</span>
              <span v-if="o.remark && o.remark !== '-'">备注：{{ o.remark }}</span>
            </div>
          </div>
          <!-- 失败原因 -->
          <div v-if="r.failReason" class="tip-banner tip-error tip-inline">
            <div class="tip-icon">&#9888;</div>
            <div class="tip-content">
              <div class="tip-title">订单生成失败</div>
              <div class="tip-text">{{ r.failReason }}</div>
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
                {{ n.nodeType === 'start' ? '发起工单' : `审批节点 ${i}` }}
                <span v-if="n.result" class="node-result" :style="getNodeResultColor(n.result)">{{ n.result }}</span>
              </div>
              <div class="node-meta">
                <span>{{ n.handlerName }}</span>
                <span v-if="n.handlerTime">{{ n.handlerTime }}</span>
              </div>
              <div v-if="n.remark" class="node-remark">{{ n.remark }}</div>
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
.header-status {
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 10px;
  font-weight: 500;
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

/* ========== 审批流程时间线 ========== */
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
.result-function-order {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
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
</style>
