<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { mockProductOptions } from '../../mocks'
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
function select(p: typeof mockProductOptions[0]) {
  router.push(`/product-apply/create?productId=${pid}&productCode=${p.code}&groupId=${gid}`)
}
</script>
<template>
  <div>
    <div style="padding: 12px 16px; background-color: #22BDB8; display: flex; align-items: center; justify-content: center; position: relative;">
      <button @click="router.back()" style="position: absolute; left: 12px; background: none; border: none; color: #fff; font-size: 22px; cursor: pointer; padding: 4px 8px;">&#8249;</button>
      <span style="color: #fff; font-size: 17px; font-weight: 500;">选择产品</span>
    </div>
    <div style="padding: 12px 16px; background-color: #fff;">
      <div style="display: flex; align-items: center; background-color: #EFEFEF; border-radius: 8px; padding: 10px 12px; gap: 8px;">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="#999"><path d="M11.74 10.34a6.49 6.49 0 1 0-1.4 1.4l3.8 3.81a1 1 0 0 0 1.42-1.4l-3.82-3.81zM6.5 11a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z" /></svg>
        <input v-model="q" placeholder="输入产品编号或名称搜索" style="flex: 1; border: none; background: none; font-size: 14px; outline: none;">
        <button v-if="q" @click="q=''" style="background: none; border: none; color: #999; cursor: pointer;">&#10005;</button>
      </div>
    </div>
    <div style="padding: 8px 16px 16px;">
      <div v-for="p in list" :key="p.code" class="card" style="padding: 14px 16px; margin-bottom: 10px; cursor: pointer;" @click="select(p)">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <span style="font-size: 15px; font-weight: 500; color: #333;">{{ p.name }}</span>
              <span v-if="p.isDiscount" style="font-size: 11px; padding: 2px 6px; border-radius: 4px; background-color: #FFF3E0; color: #FF9800;">打折</span>
            </div>
            <div style="font-size: 13px; color: #666; line-height: 1.8;">
              <div>编号：{{ p.code }}</div>
              <div>JDE价格：¥{{ p.jdePrice.toFixed(2) }}</div>
              <div>可申请数量：{{ p.maxQuantity }}</div>
              <div v-if="p.isDiscount">折扣：{{ (p.discount*10).toFixed(1) }}折</div>
            </div>
          </div>
          <span style="color: #ccc; font-size: 18px;">&#8250;</span>
        </div>
      </div>
      <div v-if="list.length===0" style="text-align: center; padding: 48px; color: #999; font-size: 14px;">暂无匹配的产品</div>
    </div>
  </div>
</template>
