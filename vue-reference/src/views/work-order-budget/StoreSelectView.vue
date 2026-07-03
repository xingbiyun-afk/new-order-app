<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { mockStores } from '../../mocks'

// ============================================================
// CR-20260703-002 §7: 专卖店选择页按App现有页面1:1回归
// 视觉规范：沿用App现有页面，非BudgetSelectView卡片风格
// ============================================================

const router = useRouter()
const route = useRoute()
const q = ref('')
const gid = route.query.groupId as string

// ============================================================
// 搜索历史记录（App 原页面现有交互能力承接）
//
// 说明：
// 1. 搜索历史记录能力属于 App 原页面现有交互，不是本轮新增业务规则；
// 2. 当前 Vue 参考实现采用 sessionStorage 做轻量持久化占位，仅用于还原
//    App 现有页面体验；
// 3. 正式工程需结合真实客户端能力或统一历史记录机制，评估最终实现方式。
// ============================================================
const SEARCH_HISTORY_KEY = 'store_search_history'
const searchHistory = ref<string[]>([])

// 加载搜索历史
onMounted(() => {
  try {
    const raw = sessionStorage.getItem(SEARCH_HISTORY_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        // 去重，最多保留20条
        searchHistory.value = [...new Set(parsed)].slice(0, 20)
      }
    }
  } catch { /* ignore */ }
})

// 保存搜索历史
function saveSearchHistory(keyword: string) {
  if (!keyword || keyword.trim() === '') return
  const trimmed = keyword.trim()
  // 去重：将新搜索词放到最前面
  searchHistory.value = [trimmed, ...searchHistory.value.filter(h => h !== trimmed)].slice(0, 20)
  try {
    sessionStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory.value))
  } catch { /* ignore */ }
}

// 清除全部搜索历史
function clearSearchHistory() {
  searchHistory.value = []
  try {
    sessionStorage.removeItem(SEARCH_HISTORY_KEY)
  } catch { /* ignore */ }
}

// 是否已搜索（有搜索关键词）
const hasSearched = computed(() => q.value.trim().length > 0)

// 过滤后的列表（仅在已搜索时显示）
const list = computed(() => {
  if (!hasSearched.value) return []
  const s = q.value.toLowerCase().trim()
  return mockStores.filter(x => {
    // 排除层级5和不允许下单的
    if (x.level === 5 || !x.orderAllowed) return false
    return x.code.toLowerCase().includes(s) || x.name.toLowerCase().includes(s)
  })
})

// 空态判断（仅在已搜索时判断）
const emptyType = computed<'no-search' | null>(() => {
  if (!hasSearched.value) return null
  if (list.value.length === 0) return 'no-search'
  return null
})

function select(s: typeof mockStores[0]) {
  // 保存搜索词到历史
  if (hasSearched.value) {
    saveSearchHistory(q.value)
  }
  router.push(`/product-apply/create?storeCode=${s.code}&storeName=${encodeURIComponent(s.name)}&groupId=${gid}`)
}

function cancel() {
  router.back()
}

// 从历史记录搜索
function searchFromHistory(item: string) {
  q.value = item
}
</script>

<template>
  <div class="page">
    <!-- ====== 顶部搜索栏（App截图1:1） ====== -->
    <div class="header-bar">
      <div class="search-box">
        <span class="search-label">门店信息</span>
        <span class="search-divider">|</span>
        <svg class="search-icon" width="14" height="14" viewBox="0 0 16 16" fill="#bbb">
          <path d="M11.74 10.34a6.49 6.49 0 1 0-1.4 1.4l3.8 3.81a1 1 0 0 0 1.42-1.4l-3.82-3.81zM6.5 11a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z" />
        </svg>
        <input
          v-model="q"
          placeholder="输入门店名称/编号查询"
          class="search-input"
        >
        <button v-if="q" class="clear-btn" @click="q = ''">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </button>
      </div>
      <button class="cancel-btn" @click="cancel">取消</button>
    </div>

    <!-- ====== 搜索历史记录（未输入时展示） ====== -->
    <div v-if="!hasSearched" class="history-section">
      <div class="history-header">
        <span class="history-title">搜索历史记录</span>
        <button v-if="searchHistory.length > 0" class="clear-all-btn" @click="clearSearchHistory">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
      <div v-if="searchHistory.length === 0" class="history-empty">
        <span>暂无搜索历史</span>
      </div>
      <div v-else class="history-list">
        <div
          v-for="item in searchHistory"
          :key="item"
          class="history-item"
          @click="searchFromHistory(item)"
        >
          <span class="history-keyword">{{ item }}</span>
        </div>
      </div>
    </div>

    <!-- ====== 搜索结果列表（行式布局） ====== -->
    <div v-if="hasSearched" class="result-section">
      <!-- 有结果 -->
      <div v-if="list.length > 0" class="result-list">
        <div
          v-for="s in list"
          :key="s.code"
          class="result-row"
          @click="select(s)"
        >
          <span class="row-code">{{ s.code }}</span>
          <span class="row-name">{{ s.name }}</span>
        </div>
      </div>

      <!-- 空态：搜索无结果 -->
      <div v-if="emptyType === 'no-search'" class="empty-state">
        <p class="empty-title">暂无搜索结果</p>
        <p class="empty-desc">未找到与 "{{ q }}" 匹配的门店</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ========== 页面容器 ========== */
.page {
  min-height: 100vh;
  background-color: #F5F5F5;
}

/* ========== 顶部搜索栏（App截图1:1） ========== */
.header-bar {
  background-color: #22BDB8;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 20px;
  padding: 8px 12px;
  gap: 8px;
}

.search-label {
  font-size: 14px;
  color: #22BDB8;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.search-divider {
  font-size: 13px;
  color: #ddd;
  flex-shrink: 0;
}

.search-icon {
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: none;
  font-size: 14px;
  color: #333;
  outline: none;
}

.search-input::placeholder {
  color: #bbb;
}

.clear-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cancel-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 2px;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ========== 搜索历史记录 ========== */
.history-section {
  background-color: #fff;
  padding: 0 16px;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0 10px;
}

.history-title {
  font-size: 13px;
  color: #999;
}

.clear-all-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.history-empty {
  padding: 24px 0;
  text-align: center;
  font-size: 13px;
  color: #ccc;
}

.history-list {
  padding-bottom: 16px;
}

.history-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

.history-item:last-child {
  border-bottom: none;
}

.history-item:active {
  background-color: #F0FDFC;
}

.history-keyword {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ========== 搜索结果列表（行式布局） ========== */
.result-section {
  background-color: #fff;
}

.result-list {
  padding: 0 16px;
}

.result-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  font-size: 15px;
  line-height: 1.4;
}

.result-row:last-child {
  border-bottom: none;
}

.result-row:active {
  background-color: #F0FDFC;
}

.row-code {
  color: #333;
  font-weight: 500;
  min-width: 80px;
  flex-shrink: 0;
}

.row-name {
  color: #333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ========== 空态 ========== */
.empty-state {
  text-align: center;
  padding: 60px 16px;
  color: #999;
}

.empty-title {
  font-size: 15px;
  color: #666;
  margin: 0 0 8px;
}

.empty-desc {
  font-size: 13px;
  color: #bbb;
  margin: 0;
}
</style>
