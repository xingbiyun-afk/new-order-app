<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { mockTodoCards, mockDoneCards, mockInitiatedCards } from '../../mocks'

const router = useRouter()
const tabs = ['待办', '已办', '抄送我的', '已发起']
const activeTab = ref(0)

// 状态颜色映射
function statusColor(status: string): string {
  switch (status) {
    case '处理中': return '#22BDB8'
    case '已结束': return '#4CAF50'
    case '已驳回': return '#F44336'
    default: return '#999'
  }
}

// 按当前 Tab 返回对应数据（CR-20260630-003 4.4）
const currentCards = computed(() => {
  switch (activeTab.value) {
    case 0: return mockTodoCards      // 待办
    case 1: return mockDoneCards      // 已办
    case 2: return []                 // 抄送我的 → 空态
    case 3: return mockInitiatedCards // 已发起
    default: return []
  }
})

// 是否显示空态
const isEmpty = computed(() => currentCards.value.length === 0)

// 空态文案
const emptyText = computed(() => {
  return activeTab.value === 2 ? '暂无抄送工单' : '暂无工单'
})
</script>

<template>
  <div>
    <!-- 搜索区 -->
    <div style="background-color: #fff; padding-bottom: 8px;">
      <div style="padding: 12px 16px 8px;">
        <div style="display: flex; align-items: center; background-color: #EFEFEF; border-radius: 8px; padding: 10px 12px; gap: 8px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#999"><path d="M11.74 10.34a6.49 6.49 0 1 0-1.4 1.4l3.8 3.81a1 1 0 0 0 1.42-1.4l-3.82-3.81zM6.5 11a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z" /></svg>
          <span style="font-size: 14px; color: #999;">输入工单信息搜索</span>
        </div>
      </div>

      <!-- Tab 切换 -->
      <div style="padding: 8px 16px; display: flex; gap: 8px;">
        <button
          v-for="(tab, i) in tabs"
          :key="tab"
          @click="activeTab = i"
          :style="{
            padding: '6px 16px',
            borderRadius: '16px',
            border: 'none',
            fontSize: '14px',
            cursor: 'pointer',
            backgroundColor: i === activeTab ? '#22BDB8' : 'transparent',
            color: i === activeTab ? '#fff' : '#666',
            fontWeight: i === activeTab ? 500 : 400,
            transition: 'all 0.2s',
          }"
        >
          {{ tab }}
        </button>
      </div>

      <!-- 筛选栏 -->
      <div style="padding: 8px 16px; display: flex; align-items: center; justify-content: space-between; font-size: 14px; color: #666;">
        <span style="display: flex; align-items: center; gap: 4px;">全部工单 <span style="font-size: 10px;">▼</span></span>
        <span style="display: flex; align-items: center; gap: 4px;">最新到达优先 <span style="font-size: 10px;">▼</span></span>
      </div>
    </div>

    <!-- 卡片列表 -->
    <div style="padding: 8px 16px 100px;">
      <!-- 空态（CR-20260630-003 4.5/4.6） -->
      <div v-if="isEmpty" style="text-align: center; padding: 80px 24px;">
        <div style="font-size: 14px; color: #999;">{{ emptyText }}</div>
      </div>

      <!-- 卡片列表（CR-20260630-003 4.1/4.2） -->
      <div
        v-for="card in currentCards"
        :key="card.id"
        class="card"
        style="padding: 14px 16px; margin-bottom: 12px; cursor: pointer;"
        @click="router.push(`/product-apply/detail/${card.id}`)"
      >
        <!-- 标题行：类型 + 状态 -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0;">
          <span style="font-size: 16px; font-weight: 500; color: #333;">产品申请</span>
          <span style="font-size: 14px;" :style="{ color: statusColor(card.displayStatus) }">
            {{ card.displayStatus }}
          </span>
        </div>

        <!-- 正文三行：申请人 / 申请类型 / 申请理由 -->
        <div style="display: flex; gap: 8px; margin-bottom: 6px;">
          <span style="font-size: 14px; color: #999; white-space: nowrap;">申请人：</span>
          <span style="font-size: 14px; color: #333;">{{ card.applicantName }}</span>
        </div>
        <div style="display: flex; gap: 8px; margin-bottom: 6px;">
          <span style="font-size: 14px; color: #999; white-space: nowrap;">申请类型：</span>
          <span style="font-size: 14px; color: #333;">{{ card.applyType }}</span>
        </div>
        <!-- 申请理由单行截断（CR-20260630-003 4.2） -->
        <div style="display: flex; gap: 8px; margin-bottom: 6px;">
          <span style="font-size: 14px; color: #999; white-space: nowrap;">申请理由：</span>
          <span style="font-size: 14px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">
            {{ card.applyReason }}
          </span>
        </div>

        <!-- 发起时间右下角 -->
        <div style="text-align: right; font-size: 13px; color: #999; margin-top: 4px;">{{ card.createTime }}</div>
      </div>
    </div>
  </div>
</template>
