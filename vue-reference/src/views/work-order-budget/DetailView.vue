<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { mockWorkOrderDetail } from '../../mocks'
const router = useRouter()
const order = mockWorkOrderDetail
const remark = ref('')
const toast = ref('')
const isHandled = ref(false)
const isCurrentApprover = true
const canApprove = isCurrentApprover && !isHandled.value && order.displayStatus === '处理中'
function handleApprove() { isHandled.value = true; showToast('审批已通过') }
function handleReject() {
  if (!remark.value.trim()) { showToast('驳回时备注必填'); return }
  isHandled.value = true; showToast('审批已驳回')
}
function showToast(msg: string) { toast.value = msg; setTimeout(() => toast.value = '', 2500) }
function preview(name: string) { showToast(`预览附件：${name}`) }
function download(name: string) { showToast(`下载附件：${name}`) }
function getStatusColor(s: string) {
  switch (s) { case '处理中': return { bg: '#E6F8F8', color: '#22BDB8' }; case '已结束': return { bg: '#E8F5E9', color: '#4CAF50' }; case '已驳回': return { bg: '#FFEBEE', color: '#F44336' }; default: return { bg: '#F5F5F5', color: '#999' } }
}
const sc = getStatusColor(order.displayStatus)
</script>
<template>
  <div :style="{ paddingBottom: canApprove ? '160px' : '20px' }">
    <div style="padding: 12px 16px; background-color: #22BDB8; display: flex; align-items: center; position: relative;">
      <button @click="router.back()" style="position: absolute; left: 12px; background: none; border: none; color: #fff; font-size: 22px; cursor: pointer; padding: 4px 8px;">&#8249;</button>
      <span style="color: #fff; font-size: 17px; font-weight: 500; flex: 1; text-align: center;">产品申请工单</span>
      <span style="font-size: 12px; padding: 2px 10px; border-radius: 10px; font-weight: 500;" :style="{ backgroundColor: sc.bg, color: sc.color }">{{ order.displayStatus }}</span>
    </div>
    <!-- Basic Info -->
    <div class="card" style="margin: 12px 16px; padding: 14px 16px;">
      <div style="font-size: 15px; font-weight: 600; color: #333; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0;">基础信息</div>
      <div v-for="(v,k) in { '工单编号': order.workOrderNo, '工单类型': '产品申请', '工单状态': order.displayStatus }" :key="k" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f8f8f8;"><span style="font-size: 14px; color: #666;">{{ k }}</span><span style="font-size: 14px; color: #333;">{{ v }}</span></div>
    </div>
    <!-- Initiator -->
    <div class="card" style="margin: 12px 16px; padding: 14px 16px;">
      <div style="font-size: 15px; font-weight: 600; color: #333; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0;">发起信息</div>
      <div v-for="(v,k) in { '发起人': order.applicantName, '发起时间': order.createTime, '发起人组织': order.applicantOrg }" :key="k" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f8f8f8;"><span style="font-size: 14px; color: #666;">{{ k }}</span><span style="font-size: 14px; color: #333;">{{ v }}</span></div>
    </div>
    <!-- Budget -->
    <div class="card" style="margin: 12px 16px; padding: 14px 16px;">
      <div style="font-size: 15px; font-weight: 600; color: #333; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0;">预算与申请信息</div>
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f8f8f8;"><span style="font-size: 14px; color: #666;">预算号</span><span style="font-size: 14px; color: #333;">{{ order.budget.budgetNo }}</span></div>
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f8f8f8;"><span style="font-size: 14px; color: #666;">申请类型</span><span style="font-size: 14px; color: #333;">{{ order.budget.applyType }}</span></div>
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f8f8f8;"><span style="font-size: 14px; color: #666;">申请理由</span><span style="font-size: 14px; color: #333; text-align: right; word-break: break-all;">{{ order.budget.applyReason }}</span></div>
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;"><span style="font-size: 14px; color: #666;">金额合计</span><span style="font-size: 14px; color: #22BDB8; font-weight: 600;">¥{{ order.totalAmount.toFixed(2) }}</span></div>
    </div>
    <!-- Groups -->
    <div v-for="(g, gi) in order.storeGroups" :key="g.id" class="card" style="margin: 12px 16px; padding: 14px 16px;">
      <div style="font-size: 15px; font-weight: 600; color: #333; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0;">专卖店申请分组 {{ gi + 1 }}</div>
      <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f8f8f8;"><span style="font-size: 13px; color: #666;">客户编号</span><span style="font-size: 13px; color: #333;">{{ g.storeCode }}</span></div>
      <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f8f8f8;"><span style="font-size: 13px; color: #666;">客户名称</span><span style="font-size: 13px; color: #333;">{{ g.storeName }}</span></div>
      <div v-for="(p, pi) in g.products" :key="p.id" style="margin-top: 10px; padding: 10px 12px; background-color: #fafafa; border-radius: 8px;">
        <div style="font-size: 13px; font-weight: 500; color: #22BDB8; margin-bottom: 8px;">商品 {{ pi + 1 }}</div>
        <div style="display: flex; justify-content: space-between; padding: 4px 0;"><span style="font-size: 13px; color: #666;">产品编号</span><span style="font-size: 13px; color: #333;">{{ p.productCode }}</span></div>
        <div style="display: flex; justify-content: space-between; padding: 4px 0;"><span style="font-size: 13px; color: #666;">产品名称</span><span style="font-size: 13px; color: #333;">{{ p.productName }}</span></div>
        <div style="display: flex; justify-content: space-between; padding: 4px 0;"><span style="font-size: 13px; color: #666;">JDE价格</span><span style="font-size: 13px; color: #333;">¥{{ p.jdePrice.toFixed(2) }}</span></div>
        <div style="display: flex; justify-content: space-between; padding: 4px 0;"><span style="font-size: 13px; color: #666;">是否打折产品</span><span style="font-size: 13px; color: #333;">{{ p.isDiscount ? '是' : '否' }}</span></div>
        <div style="display: flex; justify-content: space-between; padding: 4px 0;"><span style="font-size: 13px; color: #666;">申请数量</span><span style="font-size: 13px; color: #333;">{{ p.quantity }}</span></div>
        <div style="display: flex; justify-content: space-between; padding: 4px 0;"><span style="font-size: 13px; color: #666;">金额（净额）</span><span style="font-size: 13px; color: #22BDB8; font-weight: 600;">¥{{ p.amount.toFixed(2) }}</span></div>
      </div>
      <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #f0f0f0; text-align: right; font-size: 14px; color: #666;">分组小计：<span style="color: #22BDB8; font-weight: 600;">¥{{ g.groupAmount.toFixed(2) }}</span></div>
    </div>
    <!-- Attachments -->
    <div v-if="order.attachments.length" class="card" style="margin: 12px 16px; padding: 14px 16px;">
      <div style="font-size: 15px; font-weight: 600; color: #333; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0;">附件</div>
      <div v-for="a in order.attachments" :key="a.id" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f5f5f5;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#22BDB8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#fff" stroke-width="2" fill="none" /></svg>
          <span style="font-size: 14px; color: #333;">{{ a.name }}</span>
        </div>
        <div style="display: flex; gap: 12px;">
          <button style="background: none; border: none; color: #22BDB8; font-size: 13px; cursor: pointer;" @click="preview(a.name)">预览</button>
          <button style="background: none; border: none; color: #22BDB8; font-size: 13px; cursor: pointer;" @click="download(a.name)">下载</button>
        </div>
      </div>
    </div>
    <!-- Approval Flow -->
    <div class="card" style="margin: 12px 16px; padding: 14px 16px;">
      <div style="font-size: 15px; font-weight: 600; color: #333; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0;">审批流程</div>
      <div style="position: relative; padding-left: 20px;">
        <div style="position: absolute; left: 5px; top: 8px; bottom: 8px; width: 2px; background-color: #e0e0e0;" />
        <div v-for="(n, i) in order.approvalNodes" :key="n.id" :style="{ position: 'relative', marginBottom: i < order.approvalNodes.length - 1 ? '20px' : '0' }">
          <div :style="{ position: 'absolute', left: '-20px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: n.nodeType==='start' ? '#22BDB8' : n.result==='通过' ? '#4CAF50' : n.result==='驳回' ? '#F44336' : '#FF9800', border: '2px solid #fff', boxShadow: '0 0 0 1px #e0e0e0', zIndex: 1 }" />
          <div style="font-size: 14px; font-weight: 500; color: #333; margin-bottom: 4px;">{{ n.nodeType === 'start' ? '发起工单' : `审批节点 ${i}` }}</div>
          <div style="font-size: 13px; color: #666; line-height: 1.6;">
            <div>{{ n.handlerName }} {{ n.handlerTime }}</div>
            <div v-if="n.functionOrderNo" style="color: #999; margin-top: 2px;">功能订单：{{ n.functionOrderNo }} {{ n.functionOrderStatus }}</div>
            <div v-if="n.result" style="display: inline-flex; align-items: center; gap: 6px; margin-top: 4px;">
              <span style="font-size: 12px; padding: 2px 8px; border-radius: 4px;" :style="{ backgroundColor: n.result==='通过' ? '#E8F5E9' : '#FFEBEE', color: n.result==='通过' ? '#4CAF50' : '#F44336' }">{{ n.result }}</span>
              <span v-if="n.remark" style="color: #666;">{{ n.remark }}</span>
            </div>
            <div v-if="n.relatedOrders?.length" style="margin-top: 6px;">
              <div v-for="o in n.relatedOrders" :key="o.orderNo" style="padding: 6px 10px; background-color: #f5f5f5; border-radius: 6px; margin-top: 4px; font-size: 12px;">
                <div>{{ o.orderType }} {{ o.orderNo }}</div>
                <div style="color: #999;">状态：{{ o.orderStatus }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Order Results -->
    <div v-if="order.groupResults?.length" class="card" style="margin: 12px 16px; padding: 14px 16px;">
      <div style="font-size: 15px; font-weight: 600; color: #333; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0;">订单结果</div>
      <div v-for="r in order.groupResults" :key="r.groupId" style="padding: 14px; background-color: #fafafa; border-radius: 12px; margin-bottom: 12px; border: 1px solid #f0f0f0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e0e0e0;">
          <span style="font-size: 14px; font-weight: 500; color: #333;">{{ r.storeCode }} {{ r.storeName }}</span>
          <span style="font-size: 12px; color: #999;">{{ r.relatedOrders.length }} 个关联订单</span>
        </div>
        <div style="margin-bottom: 10px; padding: 8px 10px; background-color: #fff; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; padding: 4px 0;"><span style="font-size: 13px; color: #666;">功能订单</span><span style="font-size: 13px; color: #333;">{{ r.functionOrderNo }}</span></div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0;"><span style="font-size: 13px; color: #666;">功能订单状态</span><span style="font-size: 13px; color: #333;">{{ r.functionOrderStatus }}</span></div>
        </div>
        <div v-for="o in r.relatedOrders" :key="o.orderNo" style="margin-top: 10px; padding: 12px; background-color: #fff; border-radius: 10px;" :style="{ borderLeft: `3px solid ${o.orderStatus==='已生成' ? '#4CAF50' : o.orderStatus==='生成失败' ? '#F44336' : '#FF9800'}` }">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 13px; font-weight: 500; color: #333;">{{ o.orderType }}</span>
            <span style="font-size: 12px; padding: 2px 8px; border-radius: 4px; font-weight: 500;" :style="{ backgroundColor: o.orderStatus==='已生成' ? '#E8F5E9' : o.orderStatus==='生成失败' ? '#FFEBEE' : '#FFF3E0', color: o.orderStatus==='已生成' ? '#4CAF50' : o.orderStatus==='生成失败' ? '#F44336' : '#FF9800' }">{{ o.orderStatus }}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0;"><span style="font-size: 13px; color: #666;">订单编号</span><span style="font-size: 13px; color: #333;">{{ o.orderNo }}</span></div>
          <div v-if="o.remark && o.remark !== '-'" style="display: flex; justify-content: space-between; padding: 4px 0;"><span style="font-size: 13px; color: #666;">备注</span><span style="font-size: 13px; color: #333;">{{ o.remark }}</span></div>
          <div v-if="o.orderStatus==='生成失败' && r.failReason" style="margin-top: 10px;">
            <div style="padding: 10px 12px; background-color: #FFEBEE; border-radius: 8px; border: 1px solid #FFCDD2;">
              <div style="font-size: 13px; font-weight: 500; color: #F44336; margin-bottom: 4px;">&#9888; 订单生成失败</div>
              <div style="font-size: 12px; color: #D32F2F; line-height: 1.5;">{{ r.failReason }}</div>
            </div>
            <button @click="showToast('重新处理功能待联调后开放')" style="width: 100%; margin-top: 8px; padding: 8px; border-radius: 8px; border: 1px solid #F44336; background-color: #fff; color: #F44336; font-size: 13px; cursor: pointer; font-weight: 500;">重新处理</button>
          </div>
        </div>
      </div>
    </div>
    <!-- Approval Actions -->
    <div v-if="canApprove" style="position: fixed; bottom: 0; left: 0; right: 0; padding: 16px; background-color: #fff; box-shadow: 0 -2px 12px rgba(0,0,0,0.1); z-index: 100;">
      <div style="margin-bottom: 12px;">
        <label style="font-size: 14px; color: #666; display: block; margin-bottom: 6px;">备注 <span v-if="!remark.trim()" style="color: #F44336; font-size: 12px;">（驳回时必填）</span></label>
        <textarea v-model="remark" placeholder="请输入备注" rows="2" style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #e0e0e0; font-size: 14px; resize: none; outline: none;" />
      </div>
      <div style="display: flex; gap: 12px;">
        <button @click="handleReject" style="flex: 1; padding: 12px; border-radius: 24px; border: 1px solid #F44336; background-color: #fff; color: #F44336; font-size: 15px; font-weight: 500; cursor: pointer;">驳回</button>
        <button @click="handleApprove" style="flex: 1; padding: 12px; border-radius: 24px; border: none; background-color: #22BDB8; color: #fff; font-size: 15px; font-weight: 500; cursor: pointer;">通过</button>
      </div>
    </div>
    <div v-if="toast" style="position: fixed; top: 40%; left: 50%; transform: translate(-50%, -50%); background-color: rgba(0,0,0,0.75); color: #fff; padding: 12px 24px; border-radius: 8px; font-size: 14px; z-index: 1000; white-space: nowrap;">{{ toast }}</div>
  </div>
</template>
