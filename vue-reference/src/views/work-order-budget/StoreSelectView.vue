<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { mockStores } from '../../mocks'
import { formatAmount } from '../../utils/format'

// ============================================================
// CR-20260703-001 §1: 专卖店选择页样式与体验回归 App 现有页面
// 视觉规范与 BudgetSelectView（CR-20260702-001）保持一致
// ============================================================

const router = useRouter()
const route = useRoute()
const q = ref('')
const gid = route.query.groupId as string

const list = computed(() => {
  if (!q.value) return mockStores
  const s = q.value.toLowerCase()
  return mockStores.filter(x => x.code.toLowerCase().includes(s) || x.name.toLowerCase().includes(s))
})

const emptyType = computed<'no-store' | 'no-search' | null>(() => {
  if (list.value.length > 0) return null
  if (q.value) return 'no-search'
  return 'no-store'
})

function select(s: typeof mockStores[0]) {
  router.push(`/product-apply/create?storeCode=${s.code}&storeName=${encodeURIComponent(s.name)}&groupId=${gid}`)
}
</script>
<template>
  <div class="page">
    <!-- 顶部导航栏 -->
    <div class="header">
      <button class="back-btn" @click="router.back()">&#8249;</button>
      <span class="header-title">选择专卖店</span>
    </div>
    <!-- 搜索栏 -->
    <div class="search-wrap">
      <div class="search-bar">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="#999">
          <path d="M11.74 10.34a6.49 6.49 0 1 0-1.4 1.4l3.8 3.81a1 1 0 0 0 1.42-1.4l-3.82-3.81zM6.5 11a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z" />
        </svg>
        <input v-model="q" placeholder="输入客户编号或名称搜索" class="search-input">
        <button v-if="q" class="clear-btn" @click="q = ''">&#10005;</button>
      </div>
    </div>
    <!-- 列表区 -->
    <div class="list-wrap">
      <div
        v-for="s in list"
        :key="s.code"
        class="store-card"
        @click="select(s)"
      >
        <div class="card-row-top">
          <span class="store-name">{{ s.name }}</span>
        </div>
        <div class="info-line">
          <span class="field-label">编号：</span>
          <span class="field-value">{{ s.code }}</span>
        </div>
      </div>
      <!-- 空态：搜索无结果 -->
      <div v-if="emptyType === 'no-search'" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <p class="empty-title">搜索无结果</p>
        <p class="empty-desc">未找到与 "{{ q }}" 匹配的专卖店</p>
      </div>
      <!-- 空态：无任何数据 -->
      <div v-if="emptyType === 'no-store'" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="3" x2="9" y2="21" />
        </svg>
        <p class="empty-title">暂无可选专卖店</p>
        <p class="empty-desc">您当前没有满足申请条件的专卖店，请联系相关人员处理</p>
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

/* ========== 专卖店卡片 ========== */
.store-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 12px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
.store-card:active {
  transform: scale(0.99);
  border-color: #22BDB8;
  background-color: #F0FDFC;
}
.card-row-top {
  margin-bottom: 6px;
}
.store-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}
.info-line {
  font-size: 13px;
  color: #999;
  line-height: 1.6;
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
