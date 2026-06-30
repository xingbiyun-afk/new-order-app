<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>
<template>
  <div style="padding: 12px 16px;">
    <div class="card" style="margin-bottom: 12px; padding: 16px;">
      <div class="entry-card" style="padding: 0;">
        <div style="width: 48px; height: 48px; border-radius: 50%; background-color: #22BDB8; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 14px; flex-shrink: 0; font-weight: 500;">物流</div>
        <div style="flex: 1; margin-left: 4px;">
          <div style="font-size: 16px; font-weight: 600; color: #333;">物流工单</div>
          <div style="font-size: 13px; color: #999; margin-top: 4px;">发起物流相关工单</div>
        </div>
        <span style="color: #ccc; font-size: 20px; font-weight: 300;">&gt;</span>
      </div>
    </div>
    <div class="card" style="margin-bottom: 12px; padding: 16px;">
      <div class="entry-card" style="padding: 0;">
        <div style="width: 48px; height: 48px; border-radius: 50%; background-color: #22BDB8; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 14px; flex-shrink: 0; font-weight: 500;">客服</div>
        <div style="flex: 1; margin-left: 4px;">
          <div style="font-size: 16px; font-weight: 600; color: #333;">客服工单</div>
          <div style="font-size: 13px; color: #999; margin-top: 4px;">发起客服相关工单</div>
        </div>
        <span style="color: #ccc; font-size: 20px; font-weight: 300;">&gt;</span>
      </div>
    </div>
    <div class="card" style="cursor: pointer; padding: 16px;" @click="router.push('/product-apply/create')">
      <div class="entry-card" style="padding: 0;">
        <div style="width: 48px; height: 48px; border-radius: 50%; background-color: #22BDB8; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 11px; flex-shrink: 0; font-weight: 500; text-align: center; line-height: 1.2;">产品<br/>申请</div>
        <div style="flex: 1; margin-left: 4px;">
          <div style="font-size: 16px; font-weight: 600; color: #333;">产品申请工单</div>
          <div style="font-size: 13px; color: #999; margin-top: 4px;">发起产品申请工单并进行预算核销</div>
        </div>
        <span style="color: #ccc; font-size: 20px; font-weight: 300;">&gt;</span>
      </div>
    </div>
  </div>
</template>
