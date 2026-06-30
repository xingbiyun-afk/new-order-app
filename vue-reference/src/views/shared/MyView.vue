<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const tabs = ['待办', '已办', '抄送我的', '已发起']
const activeTab = ref(0)
const cards = [
  { id: '1', type: '产品申请', status: '处理中', c: '#22BDB8', fields: [{l:'申请人',v:'张三'},{l:'申请类型',v:'新品申请'},{l:'申请理由',v:'季度新品推广活动，针对核心专卖店进行首批铺货支持'}], t: '06-26 10:17' },
  { id: '2', type: '产品申请', status: '已结束', c: '#4CAF50', fields: [{l:'申请人',v:'李四'},{l:'申请类型',v:'活动申请'},{l:'申请理由',v:'618促销活动产品支持'}], t: '06-25 14:30' },
  { id: '3', type: '产品申请', status: '已驳回', c: '#F44336', fields: [{l:'申请人',v:'王五'},{l:'申请类型',v:'补货申请'},{l:'申请理由',v:'常规季度补货'}], t: '06-24 09:15' },
  { id: '4', type: '产品申请', status: '处理中', c: '#22BDB8', fields: [{l:'申请人',v:'赵六'},{l:'申请类型',v:'新品申请'},{l:'申请理由',v:'国庆黄金周促销活动铺货'}], t: '06-23 16:45' },
]
</script>
<template>
  <div>
    <div style="background-color: #fff; padding-bottom: 8px;">
      <div style="padding: 12px 16px 8px;">
        <div style="display: flex; align-items: center; background-color: #EFEFEF; border-radius: 8px; padding: 10px 12px; gap: 8px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#999"><path d="M11.74 10.34a6.49 6.49 0 1 0-1.4 1.4l3.8 3.81a1 1 0 0 0 1.42-1.4l-3.82-3.81zM6.5 11a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z" /></svg>
          <span style="font-size: 14px; color: #999;">输入工单信息搜索</span>
        </div>
      </div>
      <div style="padding: 8px 16px; display: flex; gap: 8px;">
        <button v-for="(tab,i) in tabs" :key="tab" @click="activeTab=i"
          :style="{ padding:'6px 16px', borderRadius:'16px', border:'none', fontSize:'14px', cursor:'pointer',
            backgroundColor: i===activeTab?'#22BDB8':'transparent', color: i===activeTab?'#fff':'#666', fontWeight: i===activeTab?500:400 }">{{ tab }}</button>
      </div>
      <div style="padding: 8px 16px; display: flex; align-items: center; justify-content: space-between; font-size: 14px; color: #666;">
        <span style="display: flex; align-items: center; gap: 4px;">全部工单 <span style="font-size: 10px;">▼</span></span>
        <span style="display: flex; align-items: center; gap: 4px;">最新到达优先 <span style="font-size: 10px;">▼</span></span>
      </div>
    </div>
    <div style="padding: 8px 16px 16px;">
      <div v-for="card in cards" :key="card.id" class="card" style="padding: 14px 16px; margin-bottom: 12px; cursor: pointer;" @click="router.push(`/product-apply/detail/${card.id}`)">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0;">
          <span style="font-size: 16px; font-weight: 500; color: #333;">{{ card.type }}</span>
          <span style="font-size: 14px;" :style="{ color: card.c }">{{ card.status }}</span>
        </div>
        <div v-for="f in card.fields" :key="f.l" style="display: flex; gap: 8px; margin-bottom: 6px;">
          <span style="font-size: 14px; color: #999; white-space: nowrap;">{{ f.l }}：</span>
          <span style="font-size: 14px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ f.v }}</span>
        </div>
        <div style="text-align: right; font-size: 13px; color: #999; margin-top: 4px;">{{ card.t }}</div>
      </div>
    </div>
  </div>
</template>
