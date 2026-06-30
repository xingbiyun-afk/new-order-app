<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { mockBudgets } from '../../mocks'
const router = useRouter()
const q = ref('')
const list = computed(() => {
  if (!q.value) return mockBudgets
  const s = q.value.toLowerCase()
  return mockBudgets.filter(b => b.budgetNo.toLowerCase().includes(s) || b.productCode.toLowerCase().includes(s))
})
function select(b: typeof mockBudgets[0]) {
  if (!b.applicationAvailable) return
  router.push(`/product-apply/create?budgetId=${b.id}`)
}
</script>
<template>
  <div>
    <div style="padding: 12px 16px; background-color: #22BDB8; display: flex; align-items: center; justify-content: center; position: relative;">
      <button @click="router.back()" style="position: absolute; left: 12px; background: none; border: none; color: #fff; font-size: 22px; cursor: pointer; padding: 4px 8px;">&#8249;</button>
      <span style="color: #fff; font-size: 17px; font-weight: 500;">选择预算</span>
    </div>
    <div style="padding: 12px 16px; background-color: #fff;">
      <div style="display: flex; align-items: center; background-color: #EFEFEF; border-radius: 8px; padding: 10px 12px; gap: 8px;">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="#999"><path d="M11.74 10.34a6.49 6.49 0 1 0-1.4 1.4l3.8 3.81a1 1 0 0 0 1.42-1.4l-3.82-3.81zM6.5 11a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z" /></svg>
        <input v-model="q" placeholder="搜索预算号" style="flex: 1; border: none; background: none; font-size: 14px; outline: none;">
        <button v-if="q" @click="q=''" style="background: none; border: none; color: #999; cursor: pointer;">&#10005;</button>
      </div>
    </div>
    <div style="padding: 8px 16px 16px;">
      <div v-for="b in list" :key="b.id" class="card" style="padding: 14px 16px; margin-bottom: 12px;"
        :style="{ opacity: b.applicationAvailable?1:0.5, cursor: b.applicationAvailable?'pointer':'not-allowed' }" @click="select(b)">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <span style="font-size: 16px; font-weight: 500; color: #333;">{{ b.budgetNo }}</span>
          <span style="font-size: 12px; padding: 2px 8px; border-radius: 4px;" :style="{ backgroundColor: b.status==='已生效'?'#E8F5E9':'#F5F5F5', color: b.status==='已生效'?'#4CAF50':'#999' }">{{ b.status }}</span>
        </div>
        <div style="font-size: 13px; color: #666; line-height: 1.8;">
          <div>可用金额：<span style="color: #22BDB8; font-weight: 500;">¥{{ b.availableAmount.toLocaleString() }}</span></div>
          <div>已用金额：¥{{ b.usedAmount.toLocaleString() }}</div>
          <div>申请中金额：¥{{ b.applyingAmount.toLocaleString() }}</div>
        </div>
        <div v-if="b.isAbnormal" style="margin-top: 8px; background-color: #FFF8E1; color: #FF8F00; font-size: 12px; padding: 6px 10px; border-radius: 6px;">&#9888; {{ b.abnormalMessage }}</div>
        <div v-if="!b.applicationAvailable" style="margin-top: 8px; background-color: #FFEBEE; color: #F44336; font-size: 12px; padding: 6px 10px; border-radius: 6px;">该预算暂不可申请</div>
      </div>
      <div v-if="list.length===0" style="text-align: center; padding: 48px; color: #999; font-size: 14px;">暂无匹配的预算</div>
    </div>
  </div>
</template>
