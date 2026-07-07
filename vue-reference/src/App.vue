<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
const showTab = computed(() => route.meta.showTab === true)
const showHeader = computed(() => route.meta.showHeader === true)

// CR-20260707-002-fix / CR-20260707-003: 页面容器滚动复位
//
// 问题背景：
//   .page-container 使用 flex column + 100vh 布局，.page-content（main 元素）才是真正的滚动容器。
//   router.scrollBehavior 只控制 window.scrollTop，对 .page-content 的滚动位置无效。
//   因此路由切换时（如 列表→详情、详情→列表、Tab 切换），.page-content 会继承上一页的滚动位置，
//   导致进入新页面时首屏位置不正确、出现双重滚动条、页面左右偏移等问题。
//
// 解决方案：
//   监听 route.path 变化，在每次路由切换后显式调用 .page-content.scrollTo(0,0)，
//   将实际滚动容器复位到顶部。使用可选链 ?. 避免容器不存在时报错。
//
// 适用边界：
//   - 列表 → 详情：详情页从顶部开始
//   - 详情 → 列表：列表页从顶部开始（列表自身应独立维护滚动状态）
//   - Tab 切换：各 Tab 页从顶部开始
//   - 常规页面切换：目标页面默认回到顶部
//
// 相关文档：
//   docs/product/work-order-budget/产品申请工单详情页面规则明细.md §14 页面容器与滚动承接说明
watch(() => route.path, () => {
  document.querySelector('.page-content')?.scrollTo(0, 0)
})
const tabs = [
  { label: '发起工单', path: '/create', icon: 'create' },
  { label: '我的', path: '/my', icon: 'my' },
  { label: '组内', path: '/team', icon: 'team' },
]
function active(p: string) { return route.path === p }
function iconColor(a: boolean) { return a ? '#22BDB8' : '#888' }
</script>
<template>
  <div class="page-container">
    <header v-if="showHeader" class="app-header"><span>工单处理中心</span></header>
    <!-- CR-20260707-002-fix: 去掉内联 padding 覆盖，让 .page-content 的 padding-bottom 
         始终生效，确保底部 tab 不会遮挡滚动内容 -->
    <main class="page-content">
      <router-view />
    </main>
    <nav v-if="showTab" class="bottom-tab">
      <div v-for="t in tabs" :key="t.path" class="tab-item" :class="{ active: active(t.path) }" @click="router.push(t.path)">
        <svg v-if="t.icon==='create'" width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect x="4" y="4" width="20" height="20" rx="4" :fill="iconColor(active(t.path))" />
          <path d="M14 9v10M9 14h10" stroke="#fff" stroke-width="2" stroke-linecap="round" />
        </svg>
        <svg v-else-if="t.icon==='my'" width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect x="5" y="3" width="18" height="22" rx="3" :fill="iconColor(active(t.path))" />
          <path d="M9 14l3 3 7-7" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M9 20h10" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity="0.5" />
        </svg>
        <svg v-else width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M14 3l10 5.5v11L14 25 4 19.5v-11L14 3z" :fill="iconColor(active(t.path))" />
          <circle cx="14" cy="14" r="3" fill="#fff" />
          <circle cx="9" cy="11" r="2" fill="#fff" opacity="0.6" />
          <circle cx="19" cy="11" r="2" fill="#fff" opacity="0.6" />
          <circle cx="9" cy="17" r="2" fill="#fff" opacity="0.6" />
          <circle cx="19" cy="17" r="2" fill="#fff" opacity="0.6" />
        </svg>
        <span>{{ t.label }}</span>
      </div>
    </nav>
  </div>
</template>
