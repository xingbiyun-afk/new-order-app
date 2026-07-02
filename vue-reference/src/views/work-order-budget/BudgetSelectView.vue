<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { mockBudgets } from '../../mocks'
import type { Budget, BudgetTagType } from '../../types'

// ============================================================
// CR-20260702-001: 产品申请工单发起页预算选择页面样式与体验优化
// ============================================================

const router = useRouter()
const route = useRoute()

// 当前日期（Mock环境固定值，正式环境使用 new Date()）
const TODAY = new Date('2026-07-02T00:00:00')

// 金额格式化：千分位 + 两位小数
function fmtMoney(v: number): string {
  return v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 搜索关键词
const q = ref('')

// 已选预算ID
const selectedId = ref<string | null>(null)

// -------------------------------------------------------
// 1. 预算标签计算（CR-20260702-001 第五章）
// -------------------------------------------------------

// 标签配置：优先级数字越小越优先
const TAG_CONFIG: Record<BudgetTagType, { label: string; priority: number }> = {
  recent:        { label: '最近申请',       priority: 1 },
  expiring:      { label: '15天内即将到期', priority: 2 },
  currentQuarter:{ label: '本季度可申请',   priority: 3 },
  freezing:      { label: '申请冻结中',     priority: 4 },
}

/** 计算单个预算的标签类型 */
function calcBudgetTag(b: Budget): BudgetTagType | null {
  // 只给有剩余额度的预算打标签
  if (b.availableAmount <= 0) return null

  const daysToExpiry = Math.ceil(
    (new Date(b.budgetExpiryDate).getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24)
  )

  // 1) 最近申请：有成功提交记录 && 剩余额度>0
  if (b.lastAppliedAt) {
    // 取最近提交的预算（Mock简化：有 lastAppliedAt 即视为最近申请）
    // 正式环境需与历史工单对比找出真正最近的一条
    return 'recent'
  }

  // 2) 15天内即将到期：距离到期日<=15天 && 剩余额度>0
  if (daysToExpiry <= 15 && daysToExpiry > 0) {
    return 'expiring'
  }

  // 3) 本季度可申请：已进入可申请时间范围 && 剩余额度>0
  // Mock简化：剩余额度>0 且不在冻结期 且未命中更高优先级标签
  const isFreezing = TODAY >= new Date(b.freezeStartDate) && TODAY < new Date(b.budgetExpiryDate)
  if (!isFreezing && b.availableAmount > 0) {
    return 'currentQuarter'
  }

  // 4) 申请冻结中：已进入 freezeStartDate 但尚未到期
  if (isFreezing) {
    return 'freezing'
  }

  return null
}

/** 获取标签的展示配置 */
function getTagDisplay(tagType: BudgetTagType | null) {
  if (!tagType) return null
  const cfg = TAG_CONFIG[tagType]
  // 标签颜色映射
  const colorMap: Record<BudgetTagType, { bg: string; text: string }> = {
    recent:         { bg: '#E0F7FA', text: '#00838F' },
    expiring:       { bg: '#FFF3E0', text: '#E65100' },
    currentQuarter: { bg: '#E8F5E9', text: '#2E7D32' },
    freezing:       { bg: '#F3E5F5', text: '#7B1FA2' },
  }
  return { ...cfg, ...colorMap[tagType] }
}

// -------------------------------------------------------
// 2. 预算过滤（CR-20260702-001 第六章）
// -------------------------------------------------------

/** 隐藏草稿/已作废/已到期的预算 */
const VISIBLE_STATUSES = ['已生效']

/** 判断是否在选择页展示 */
function isVisible(b: Budget): boolean {
  return VISIBLE_STATUSES.includes(b.status)
}

// -------------------------------------------------------
// 3. 预算排序（CR-20260702-001 第七章）
// -------------------------------------------------------

interface EnrichedBudget extends Budget {
  tagType: BudgetTagType | null
  tagPriority: number
  daysToExpiry: number
}

/** 给预算附加标签信息 */
function enrich(b: Budget): EnrichedBudget {
  const tagType = calcBudgetTag(b)
  const tagPriority = tagType ? TAG_CONFIG[tagType].priority : 99
  const daysToExpiry = Math.ceil(
    (new Date(b.budgetExpiryDate).getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24)
  )
  return { ...b, tagType, tagPriority, daysToExpiry }
}

/** 排序比较函数 */
function sortBudgets(a: EnrichedBudget, b: EnrichedBudget): number {
  // 1) 零剩余额度后置
  const aZero = a.availableAmount <= 0 ? 1 : 0
  const bZero = b.availableAmount <= 0 ? 1 : 0
  if (aZero !== bZero) return aZero - bZero

  // 2) 一级排序：标签优先级（数字小在前）
  if (a.tagPriority !== b.tagPriority) return a.tagPriority - b.tagPriority

  // 3) 二级排序：距离到期日升序（近的先）
  if (a.daysToExpiry !== b.daysToExpiry) return a.daysToExpiry - b.daysToExpiry

  // 4) 兜底：剩余额度降序
  if (a.availableAmount !== b.availableAmount) return b.availableAmount - a.availableAmount

  // 5) 最终兜底：预算号升序
  return a.budgetNo.localeCompare(b.budgetNo)
}

// -------------------------------------------------------
// 4. 过滤 + 排序后的列表（含搜索）
// -------------------------------------------------------

const enrichedList = computed(() => {
  // 先过滤可见预算
  let list = mockBudgets.filter(isVisible).map(enrich)

  // 搜索过滤（仅支持预算号）
  if (q.value) {
    const s = q.value.toLowerCase()
    list = list.filter(b => b.budgetNo.toLowerCase().includes(s))
  }

  // 排序
  list.sort(sortBudgets)

  return list
})

// -------------------------------------------------------
// 5. 空态判断（CR-20260702-001 第九章 9.4）
// -------------------------------------------------------

const emptyType = computed<'no-budget' | 'no-search' | null>(() => {
  if (enrichedList.value.length > 0) return null
  // 有搜索词 → 搜索无结果
  if (q.value) return 'no-search'
  // 无搜索词 → 当前无可申请预算
  return 'no-budget'
})

// -------------------------------------------------------
// 6. 卡片交互（CR-20260702-001 第九章）
// -------------------------------------------------------

/** 判断预算是否可选（CR-20260702-001 整改：applicationAvailable 独立参与判断） */
function isSelectable(b: EnrichedBudget): boolean {
  // applicationAvailable=false 时直接不可选（与额度、冻结期独立判断）
  if (!b.applicationAvailable) return false
  // 零剩余额度不可选
  if (b.availableAmount <= 0) return false
  // 普通新发起场景：冻结期预算不可选
  const isFreezing = TODAY >= new Date(b.freezeStartDate) && TODAY < new Date(b.budgetExpiryDate)
  if (isFreezing) return false
  return true
}

/** 点击卡片 */
function handleClick(b: EnrichedBudget) {
  // 不可选时给出反馈（CR-20260702-001 整改：独立提示 applicationAvailable=false）
  if (!isSelectable(b)) {
    if (!b.applicationAvailable) {
      alert('当前预算不可用于申请')
    } else if (b.availableAmount <= 0) {
      alert('当前预算剩余额度不足，无法用于申请')
    } else {
      alert('当前预算已进入申请冻结期，不可用于新发起')
    }
    return
  }
  // 可选：选中/取消选中
  selectedId.value = selectedId.value === b.id ? null : b.id
}

/** 确认选择 — 用 replace 避免历史记录累积 */
function confirmSelect() {
  if (!selectedId.value) return
  const b = enrichedList.value.find(x => x.id === selectedId.value)
  if (!b) return
  router.replace({
    path: '/product-apply/create',
    query: { budgetId: b.id },
  })
}
</script>

<template>
  <div class="page">
    <!-- 顶部导航栏 -->
    <div class="header">
      <button class="back-btn" @click="router.back()">&#8249;</button>
      <span class="header-title">选择预算</span>
    </div>

    <!-- 搜索栏（仅支持预算号） -->
    <div class="search-wrap">
      <div class="search-bar">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="#999">
          <path d="M11.74 10.34a6.49 6.49 0 1 0-1.4 1.4l3.8 3.81a1 1 0 0 0 1.42-1.4l-3.82-3.81zM6.5 11a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z" />
        </svg>
        <input v-model="q" placeholder="搜索预算号" class="search-input">
        <button v-if="q" class="clear-btn" @click="q = ''">&#10005;</button>
      </div>
    </div>

    <!-- 预算卡片列表 -->
    <div class="list-wrap">
      <div
        v-for="b in enrichedList"
        :key="b.id"
        class="budget-card"
        :class="{
          'card-selected': selectedId === b.id,
          'card-disabled': !isSelectable(b),
        }"
        @click="handleClick(b)"
      >
        <!-- 第一行：标签 + 预算号（弱化） -->
        <div class="card-row-top">
          <div class="tag-wrap">
            <span v-if="b.tagType" class="tag" :style="{
              backgroundColor: getTagDisplay(b.tagType)?.bg,
              color: getTagDisplay(b.tagType)?.text,
            }">
              {{ getTagDisplay(b.tagType)?.label }}
            </span>
          </div>
          <span class="budget-no">{{ b.budgetNo }}</span>
        </div>

        <!-- 第二行：剩余额度（净额）—— 第一优先级 -->
        <div class="amount-row amount-primary">
          <span class="amount-label">剩余额度（净额）</span>
          <span class="amount-value">¥{{ fmtMoney(b.availableAmount) }}</span>
        </div>

        <!-- 第三行：预算总额 -->
        <div class="amount-row amount-secondary">
          <span class="amount-label-sub">预算总额（净额）</span>
          <span class="amount-value-sub">¥{{ fmtMoney(b.budgetTotalAmount) }}</span>
        </div>

        <!-- 第四行：归属组织 + 使用范围 -->
        <div class="org-scope">
          <div class="org-line">
            <span class="field-label">归属：</span>
            <span class="field-value truncate">{{ b.budgetOrg }}</span>
          </div>
          <div class="scope-line">
            <span class="field-label">范围：</span>
            <span class="field-value truncate">{{ b.budgetScope }}</span>
          </div>
        </div>

        <!-- 到期日信息 -->
        <div class="expiry-line">
          <span>到期日：{{ b.budgetExpiryDate }}</span>
          <span v-if="b.daysToExpiry > 0" class="days-left">（剩余 {{ b.daysToExpiry }} 天）</span>
        </div>

        <!-- 选中标识 -->
        <div v-if="selectedId === b.id" class="selected-badge">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22BDB8" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <!-- 不可选遮罩提示 -->
        <div v-if="!isSelectable(b)" class="disabled-overlay">
          <span v-if="b.availableAmount <= 0">剩余额度不足</span>
          <span v-else>已进入申请冻结期</span>
        </div>
      </div>

      <!-- 空态 -->
      <div v-if="emptyType === 'no-budget'" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="3" x2="9" y2="21" />
        </svg>
        <p class="empty-title">当前无可申请预算</p>
        <p class="empty-desc">您当前没有满足申请条件的预算，请联系相关人员处理</p>
      </div>

      <div v-if="emptyType === 'no-search'" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <p class="empty-title">搜索无结果</p>
        <p class="empty-desc">未找到与 "{{ q }}" 匹配的预算号</p>
      </div>
    </div>

    <!-- 底部确认按钮 -->
    <div v-if="selectedId" class="bottom-bar">
      <button class="confirm-btn" @click="confirmSelect">确认选择</button>
    </div>
  </div>
</template>

<style scoped>
/* ========== 页面容器 ========== */
.page {
  min-height: 100vh;
  background-color: #F5F5F5;
  padding-bottom: 80px;
}

/* ========== 顶部导航栏 ========== */
.header {
  padding: 12px 16px;
  background-color: #22BDB8;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.back-btn {
  position: absolute;
  left: 12px;
  background: none;
  border: none;
  color: #fff;
  font-size: 22px;
  cursor: pointer;
  padding: 4px 8px;
}
.header-title {
  color: #fff;
  font-size: 17px;
  font-weight: 500;
}

/* ========== 搜索栏 ========== */
.search-wrap {
  padding: 12px 16px;
  background-color: #fff;
}
.search-bar {
  display: flex;
  align-items: center;
  background-color: #EFEFEF;
  border-radius: 8px;
  padding: 10px 12px;
  gap: 8px;
}
.search-input {
  flex: 1;
  border: none;
  background: none;
  font-size: 14px;
  outline: none;
}
.clear-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 14px;
}

/* ========== 列表容器 ========== */
.list-wrap {
  padding: 8px 16px 16px;
}

/* ========== 预算卡片 ========== */
.budget-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 12px;
  position: relative;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
.budget-card:active {
  transform: scale(0.99);
}

/* 选中态 */
.card-selected {
  border-color: #22BDB8;
  background-color: #F0FDFC;
  box-shadow: 0 2px 8px rgba(34, 189, 184, 0.15);
}

/* 不可选态 */
.card-disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.card-disabled:active {
  transform: none;
}

/* ========== 卡片内容 ========== */

/* 顶部行：标签 + 弱化预算号 */
.card-row-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.tag-wrap {
  flex-shrink: 0;
}
.tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 4px;
  white-space: nowrap;
}
.budget-no {
  font-size: 12px;
  color: #999;
  font-weight: 400;
}

/* 金额行：统一左右对齐 */
.amount-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

/* 剩余额度（净额）—— 第一优先级 */
.amount-primary {
  margin-bottom: 2px;
}
.amount-label {
  font-size: 13px;
  color: #666;
  flex-shrink: 0;
}
.amount-value {
  font-size: 20px;
  font-weight: 600;
  color: #22BDB8;
  text-align: right;
}

/* 预算总额 */
.amount-secondary {
  margin-bottom: 10px;
}
.amount-label-sub {
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
}
.amount-value-sub {
  font-size: 12px;
  color: #999;
  text-align: right;
}

/* 归属组织 + 使用范围 */
.org-scope {
  background-color: #FAFAFA;
  border-radius: 8px;
  padding: 8px 10px;
  margin-bottom: 8px;
}
.org-line,
.scope-line {
  display: flex;
  align-items: center;
  font-size: 12px;
  line-height: 1.7;
}
.field-label {
  color: #999;
  flex-shrink: 0;
  width: 36px;
}
.field-value {
  color: #555;
  flex: 1;
}
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 到期日 */
.expiry-line {
  font-size: 11px;
  color: #bbb;
  display: flex;
  gap: 6px;
}
.days-left {
  color: #FF8F00;
}

/* 选中标识 */
.selected-badge {
  position: absolute;
  top: 10px;
  right: 12px;
  width: 22px;
  height: 22px;
  background-color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

/* 不可选遮罩 */
.disabled-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.35);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #F44336;
  font-weight: 500;
  pointer-events: none;
}

/* ========== 空态 ========== */
.empty-state {
  text-align: center;
  padding: 48px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.empty-title {
  font-size: 15px;
  color: #666;
  font-weight: 500;
  margin: 0;
}
.empty-desc {
  font-size: 13px;
  color: #bbb;
  margin: 0;
}

/* ========== 底部确认栏 ========== */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px 16px;
  background-color: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
  z-index: 100;
}
.confirm-btn {
  width: 100%;
  padding: 14px 0;
  background-color: #22BDB8;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}
.confirm-btn:active {
  opacity: 0.9;
}
</style>
