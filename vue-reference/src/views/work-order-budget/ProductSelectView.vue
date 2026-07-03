<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { mockProductOptions } from '../../mocks'
import { formatAmount } from '../../utils/format'

// ============================================================
// CR-20260703-001 §3: 产品选择页卡片样式与信息层级优化
// 视觉规范与 BudgetSelectView / StoreSelectView 保持一致
// ============================================================

const router = useRouter()
const route = useRoute()
const q = ref('')
const gid = route.query.groupId as string
const pid = route.query.productId as string

const list = computed(() => {
  if (!q.value) return mockProductOptions
  const s = q.value.toLowerCase()
  return mockProductOptions.filter(x => x.code.toLowerCase().includes(s) || x.name.toLowerCase().includes(s))
})

const emptyType = computed<'no-product' | 'no-search' | null>(() => {
  if (list.value.length > 0) return null
  if (q.value) return 'no-search'
  return 'no-product'
})

function select(p: typeof mockProductOptions[0]) {
  router.push(`/product-apply/create?productId=${pid}&productCode=${p.code}&groupId=${gid}`)
}
</script>
<template>
  <div class="page">
    <!-- 顶部导航栏 -->
    <div class="header">
      <button class="back-btn" @click="router.back()">&#8249;</button>
      <span class="header-title">选择产品</span>
    </div>
    <!-- 搜索栏 -->
    <div class="search-wrap">
      <div class="search-bar">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="#999">
          <path d="M11.74 10.34a6.49 6.49 0 1 0-1.4 1.4l3.8 3.81a1 1 0 0 0 1.42-1.4l-3.82-3.81zM6.5 11a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z" />
        </svg>
        <input v-model="q" placeholder="输入产品编号或名称搜索" class="search-input">
        <button v-if="q" class="clear-btn" @click="q = ''">&#10005;</button>
      </div>
    </div>
    <!-- 列表区 -->
    <div class="list-wrap">
      <div
        v-for="p in list"
        :key="p.code"
        class="product-card"
        @click="select(p)"
      >
        <!-- 第一行：产品名 + 折扣标签 -->
        <div class="card-row-top">
          <span class="product-name">{{ p.name }}</span>
          <!-- CR-20260703-001 §6.2: 折扣字段改为标签化展示（百分比口径） -->
          <span v-if="p.isDiscount" class="discount-tag">打折 {{ Math.round(p.discount * 100) }}%</span>
        </div>
        <!-- 第二行：价格（主信息 + 千分符） -->
        <div class="price-row">
          <span class="field-label">JDE价格</span>
          <span class="price-value">¥{{ formatAmount(p.jdePrice) }}</span>
        </div>
        <!-- 第三行：辅助信息（编号 + 可申请数量） -->
        <div class="info-row">
          <span class="field-label">编号：</span>
          <span class="field-value">{{ p.code }}</span>
        </div>
        <div class="info-row">
          <span class="field-label">可申请数量：</span>
          <span class="field-value">{{ p.maxQuantity }}</span>
        </div>
      </div>
      <!-- 空态：搜索无结果 -->
      <div v-if="emptyType === 'no-search'" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <p class="empty-title">搜索无结果</p>
        <p class="empty-desc">未找到与 "{{ q }}" 匹配的产品</p>
      </div>
      <!-- 空态：无任何数据 -->
      <div v-if="emptyType === 'no-product'" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="3" x2="9" y2="21" />
        </svg>
        <p class="empty-title">暂无可选产品</p>
        <p class="empty-desc">您当前没有满足申请条件的产品</p>
      </div>
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

/* ========== 产品卡片 ========== */
.product-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 12px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
.product-card:active {
  transform: scale(0.99);
  border-color: #22BDB8;
  background-color: #F0FDFC;
}
.card-row-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.product-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  flex: 1;
}
/* 折扣标签：与 BudgetSelectView 标签同色系 */
.discount-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  background-color: #FFF3E0;
  color: #FF9800;
  white-space: nowrap;
}
/* 价格行：突出主信息 */
.price-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 4px 0;
  border-bottom: 1px solid #f8f8f8;
}
.price-row .field-label {
  font-size: 13px;
  color: #666;
}
.price-value {
  font-size: 16px;
  font-weight: 600;
  color: #22BDB8;
}
/* 辅助信息行 */
.info-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 13px;
}
.field-label {
  color: #999;
}
.field-value {
  color: #666;
}

/* ========== 空态 ========== */
.empty-state {
  text-align: center;
  padding: 48px 16px;
  color: #999;
}
.empty-title {
  font-size: 15px;
  color: #666;
  margin: 12px 0 6px;
}
.empty-desc {
  font-size: 13px;
  color: #999;
}
</style>
