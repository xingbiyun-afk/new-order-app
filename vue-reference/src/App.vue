<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
const showTab = computed(() => route.meta.showTab === true)
const showHeader = computed(() => route.meta.showHeader === true)
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
    <main class="page-content" :style="{ padding: showHeader ? '0' : undefined }">
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
