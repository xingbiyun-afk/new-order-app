<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useWorkOrderStore } from '../../stores/workOrder'
import { mockProductOptions, calculateAmount, createDefaultGroup } from '../../mocks'
import type { ProductItem } from '../../types'

const router = useRouter()
const route = useRoute()
const store = useWorkOrderStore()
const budgetId = computed(() => route.query.budgetId as string)
const currentUser = { name: '张三', org: '南大 / 福建' }
const toast = ref('')
function showToast(msg: string) { toast.value = msg; setTimeout(() => toast.value = '', 2500) }
const attachments = ref<{ id: string; name: string }[]>([])

// 确认弹窗状态（CR-20260630-002 3.6）
const showConfirm = ref(false)
const confirmMsg = ref('')
const onConfirm = ref<(() => void) | null>(null)

function openConfirm(msg: string, cb: () => void) {
  confirmMsg.value = msg
  onConfirm.value = cb
  showConfirm.value = true
}
function closeConfirm() {
  showConfirm.value = false
  onConfirm.value = null
}
function execConfirm() {
  onConfirm.value?.()
  closeConfirm()
}

// 金额格式化
function fmtMoney(v: number): string {
  return v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

onMounted(() => {
  store.initStoreGroups()
  if (budgetId.value) store.selectBudget(budgetId.value)
})
watch(() => store.storeGroups, () => store.persistStoreGroups(), { deep: true })

// URL backfill - watch route.query directly
watch(() => route.query, (q) => {
  const sid = q.storeCode as string
  const sname = q.storeName as string
  const gid = q.groupId as string
  const pid = q.productId as string
  const pcode = q.productCode as string

  // Backfill store selection
  if (sid && sname && gid) {
    store.updateStoreGroup(gid, sid, sname)
  }
  // Backfill product selection
  if (pid && pcode && gid) {
    const opt = mockProductOptions.find(p => p.code === pcode)
    if (opt) {
      const g = store.storeGroups.find(x => x.id === gid)
      const p = g?.products.find(x => x.id === pid)
      if (p) {
        Object.assign(p, { productCode: opt.code, productName: opt.name, jdePrice: opt.jdePrice, isDiscount: opt.isDiscount, discount: opt.discount, maxQuantity: opt.maxQuantity })
        p.amount = calculateAmount(p as ProductItem)
      }
    }
  }
  // Clear URL params after backfill
  if (sid || pcode) {
    router.replace({ query: {} })
  }
}, { immediate: true, deep: true })

function qtyChange(gid: string, pid: string, v: number) {
  const q = Math.max(1, v)
  const g = store.storeGroups.find(x => x.id === gid)
  const p = g?.products.find(x => x.id === pid)
  if (p) { p.quantity = q; p.amount = calculateAmount(p) }
}
function delAtt(id: string) { attachments.value = attachments.value.filter(a => a.id !== id) }
function addAtt() { attachments.value.push({ id: `att_${Date.now()}`, name: `附件_${attachments.value.length + 1}.pdf` }); showToast('附件已添加（模拟）') }
function submit() {
  if (!store.selectedBudget) { showToast('请选择预算号'); return }
  // 预算可用金额校验（CR-20260630-002 3.5）
  if (store.totalAmount > store.selectedBudget.availableAmount) {
    showToast(`整单金额 ¥${fmtMoney(store.totalAmount)} 超过预算可用金额 ¥${fmtMoney(store.selectedBudget.availableAmount)}`)
    return
  }
  for (const g of store.storeGroups) {
    if (!g.storeCode) { showToast('请选择订单归属专卖店'); return }
    for (const p of g.products) { if (!p.productCode) { showToast('请选择产品编号'); return } }
  }
  for (const [code, total] of store.skuTotalMap.entries()) {
    const p = store.storeGroups.flatMap(g => g.products).find(x => x.productCode === code)
    if (p && total > p.maxQuantity) { showToast(`产品 ${p.productName} 全单总数量 ${total} 超过可申请数量 ${p.maxQuantity}`); return }
  }
  if (attachments.value.length === 0) { showToast('请上传附件'); return }
  showToast('提交成功！'); setTimeout(() => router.push('/my'), 1500)
}
function isCol(gid: string) { return store.collapsedGroups.has(gid) }

// 检查是否已填写分组或商品
function hasGroupOrProduct(): boolean {
  return store.storeGroups.some(g => g.storeCode || g.products.some(p => p.productCode))
}

// 切换预算：带确认提示，确认后清空分组（CR-20260630-002 3.6）
function goBudgetSelect() {
  if (hasGroupOrProduct()) {
    openConfirm('切换预算后，当前已填写的专卖店申请分组和商品明细将被清空，是否继续？', () => {
      store.storeGroups = [createDefaultGroup()]
      store.clearCollapsed()  // CR-20260630-004 3.4
      router.push('/product-apply/budget-select')
    })
  } else {
    router.push('/product-apply/budget-select')
  }
}

// 清空专卖店 + 同步清空商品（CR-20260630-002 3.7）
function clearStore(groupId: string) {
  openConfirm('清空专卖店后，该分组下的商品明细也将被清空，是否继续？', () => {
    const g = store.storeGroups.find(x => x.id === groupId)
    if (g) {
      g.storeCode = ''
      g.storeName = ''
      g.products = [{ id: `prod_${Date.now()}`, productCode: '', productName: '', jdePrice: 0, isDiscount: false, discount: 0.5, maxQuantity: 0, quantity: 1, amount: 0 }]
    }
  })
}
</script>
<template>
  <div style="padding-bottom: 80px;">
    <div style="padding: 12px 16px; background-color: #22BDB8; display: flex; align-items: center; justify-content: center; position: relative;">
      <button @click="router.back()" style="position: absolute; left: 12px; background: none; border: none; color: #fff; font-size: 22px; cursor: pointer; padding: 4px 8px;">&#8249;</button>
      <span style="color: #fff; font-size: 17px; font-weight: 500;">产品申请工单</span>
    </div>
    <!-- Budget -->
    <div class="card" style="margin: 12px 16px; padding: 14px 16px;">
      <div style="font-size: 15px; font-weight: 600; color: #333; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0;">预算信息</div>
      <div @click="goBudgetSelect" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f5f5f5; cursor: pointer;">
        <span style="font-size: 14px; color: #666;">预算号<span style="color: #F44336;"> *</span></span>
        <span style="font-size: 14px;" :style="{ color: store.selectedBudget ? '#333' : '#bbb' }">{{ store.selectedBudget?.budgetNo || '选择预算' }}</span>
        <span style="color: #999; margin-left: 4px; font-size: 16px;">&#8250;</span>
      </div>
      <div v-if="store.selectedBudget?.isAbnormal" style="background-color: #FFF8E1; color: #FF8F00; font-size: 13px; padding: 8px 12px; border-radius: 8px; margin-top: 8px;">&#9888; {{ store.selectedBudget.abnormalMessage }}</div>
    </div>
    <!-- Apply Info -->
    <div class="card" style="margin: 12px 16px; padding: 14px 16px;">
      <div style="font-size: 15px; font-weight: 600; color: #333; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0;">申请信息</div>
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f5f5f5;"><span style="font-size: 14px; color: #666;">申请人</span><span style="font-size: 14px; color: #333;">{{ currentUser.name }}</span></div>
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f5f5f5;"><span style="font-size: 14px; color: #666;">申请类型</span><span style="font-size: 14px; color: #333;">{{ store.selectedBudget?.applyType || '-' }}</span></div>
      <div style="display: flex; align-items: flex-start; gap: 8px; padding: 10px 0;"><span style="font-size: 14px; color: #666; white-space: nowrap;">申请理由</span><span style="font-size: 14px; color: #333; line-height: 1.5; word-break: break-all; flex: 1;">{{ store.selectedBudget?.applyReason || '-' }}</span></div>
    </div>
    <!-- Store Groups -->
    <div v-for="(group, gi) in store.storeGroups" :key="group.id" class="card" style="margin: 12px 16px; padding: 14px 16px;">
      <div @click="store.toggleGroupCollapse(group.id)" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0; cursor: pointer;">
        <span style="font-size: 15px; font-weight: 600; color: #333;">专卖店申请分组 {{ gi + 1 }}{{ group.storeCode ? ` · ${group.storeCode}` : '' }}</span>
        <div style="display: flex; align-items: center; gap: 12px;">
          <button v-if="store.storeGroups.length > 1" @click.stop="store.deleteGroup(group.id)" style="background: none; border: none; color: #F44336; font-size: 13px; cursor: pointer;">删除</button>
          <span style="color: #999; font-size: 18px; transition: transform 0.2s;" :style="{ transform: isCol(group.id) ? 'rotate(-90deg)' : 'rotate(0deg)' }">&#9662;</span>
        </div>
      </div>
      <!-- Collapsed -->
      <div v-if="isCol(group.id)" style="padding: 8px 0; color: #999; font-size: 14px; display: flex; justify-content: space-between; align-items: center;">
        <span>订单归属专卖店：{{ group.storeCode ? `${group.storeCode} ${group.storeName}` : '未选择' }}</span>
        <span style="color: #22BDB8; font-weight: 500;">{{ group.products.length }} 件商品</span>
      </div>
      <!-- Expanded -->
      <div v-else>
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f5f5f5;">
          <span style="font-size: 14px; color: #666;">订单归属专卖店<span style="color: #F44336;"> *</span></span>
          <!-- CR-20260630-004 3.1: 已选专卖店也可点击进入搜索页改选；3.3: 占位文案改为请选择 -->
          <div style="display: flex; align-items: center; gap: 8px;" @click="router.push(`/product-apply/store-select?groupId=${group.id}`)">
            <span style="font-size: 14px; cursor: pointer;" :style="{ color: group.storeCode ? '#333' : '#bbb' }">{{ group.storeCode ? `${group.storeCode} ${group.storeName}` : '请选择订单归属专卖店' }}</span>
            <span style="color: #999; font-size: 16px; cursor: pointer;">&#8250;</span>
            <button v-if="group.storeCode" @click.stop="clearStore(group.id)" style="background: none; border: none; color: #F44336; font-size: 12px; cursor: pointer;">清空</button>
          </div>
        </div>
        <div v-for="(prod, pi) in group.products" :key="prod.id" :style="{ marginTop: pi > 0 ? '16px' : '12px', paddingTop: pi > 0 ? '16px' : '0', borderTop: pi > 0 ? '1px dashed #e0e0e0' : 'none' }">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 14px; font-weight: 500; color: #22BDB8;">商品 {{ pi + 1 }}</span>
            <button v-if="group.products.length > 1" @click="store.deleteProduct(group.id, prod.id)" style="background: none; border: none; color: #F44336; font-size: 12px; cursor: pointer;">删除</button>
          </div>
          <div @click="router.push(`/product-apply/product-select?groupId=${group.id}&productId=${prod.id}`)" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f5f5f5; cursor: pointer; margin-bottom: 10px;">
            <span style="font-size: 14px; color: #666;">产品编号<span style="color: #F44336;"> *</span></span>
            <span style="font-size: 14px;" :style="{ color: prod.productCode ? '#333' : '#bbb' }">{{ prod.productCode || '选择产品' }}</span>
            <span style="color: #999; margin-left: 4px; font-size: 16px;">&#8250;</span>
          </div>
          <div v-if="prod.productCode">
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f5f5f5;"><span style="font-size: 14px; color: #666;">产品名称</span><span style="font-size: 14px; color: #333;">{{ prod.productName }}</span></div>
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f5f5f5;"><span style="font-size: 14px; color: #666;">JDE价格</span><span style="font-size: 14px; color: #333;">¥{{ prod.jdePrice.toFixed(2) }}</span></div>
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f5f5f5;"><span style="font-size: 14px; color: #666;">是否打折产品</span><span style="font-size: 14px; color: #333;">{{ prod.isDiscount ? '是' : '否' }}</span></div>
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f5f5f5;"><span style="font-size: 14px; color: #666;">可申请数量</span><span style="font-size: 14px; color: #333;">{{ prod.maxQuantity }}</span></div>
            <div style="margin-top: 8px;">
              <label style="font-size: 14px; color: #666; display: block; margin-bottom: 4px;">数量 <span style="color: #F44336;">*</span></label>
              <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                <button @click="qtyChange(group.id, prod.id, prod.quantity - 1)" style="width: 36px; height: 36px; border-radius: 8px; border: 1px solid #e0e0e0; background-color: #f5f5f5; font-size: 18px; cursor: pointer;">-</button>
                <input type="number" :min="1" :max="prod.maxQuantity" :value="prod.quantity" @change="qtyChange(group.id, prod.id, parseInt(($event.target as HTMLInputElement).value) || 1)" style="flex: 1; height: 36px; text-align: center; border-radius: 8px; border: 1px solid #e0e0e0; font-size: 15px;">
                <button @click="qtyChange(group.id, prod.id, prod.quantity + 1)" style="width: 36px; height: 36px; border-radius: 8px; border: 1px solid #e0e0e0; background-color: #f5f5f5; font-size: 18px; cursor: pointer;">+</button>
              </div>
              <div style="margin-top: 4px; font-size: 12px; line-height: 1.5;">
                <span style="color: #999;">本组已申请 {{ prod.quantity }}，全单已申请 {{ store.skuTotalMap.get(prod.productCode) || 0 }} / {{ prod.maxQuantity }}</span>
                <span v-if="(store.skuTotalMap.get(prod.productCode) || 0) > prod.maxQuantity" style="color: #F44336; font-weight: 500;"> 全单总数量已超过可申请数量 {{ prod.maxQuantity }}，请调整</span>
                <span v-else-if="prod.maxQuantity - (store.skuTotalMap.get(prod.productCode) || 0) > 0" style="color: #4CAF50;"> 还可申请 {{ prod.maxQuantity - (store.skuTotalMap.get(prod.productCode) || 0) }}</span>
                <span v-else style="color: #FF9800;"> 已达到可申请上限</span>
              </div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0;"><span style="font-size: 14px; color: #666;">金额（净额）</span><span style="font-size: 14px; color: #22BDB8; font-weight: 600;">¥{{ prod.amount.toFixed(2) }}</span></div>
          </div>
        </div>
        <button @click="store.addProduct(group.id)" style="width: 100%; margin-top: 12px; padding: 10px; border-radius: 8px; border: 1px dashed #22BDB8; background-color: #F0FDFD; color: #22BDB8; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;"><span style="font-size: 18px;">+</span> 添加商品</button>
        <div v-if="group.products.some(p => p.amount > 0)" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #f0f0f0; text-align: right; font-size: 14px; color: #666;">
          分组小计：<span style="color: #22BDB8; font-weight: 600; font-size: 16px;">¥{{ group.products.reduce((s, p) => s + p.amount, 0).toFixed(2) }}</span>
        </div>
      </div>
    </div>
    <!-- Add Group -->
    <div style="padding: 0 16px; margin-bottom: 12px;">
      <button @click="store.addGroup" style="width: 100%; padding: 12px; border-radius: 12px; border: 1px dashed #22BDB8; background-color: #fff; color: #22BDB8; font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;"><span style="font-size: 20px;">+</span> 添加专卖店分组</button>
    </div>
    <!-- Total -->
    <div v-if="store.totalAmount > 0" style="padding: 14px 16px; background-color: #fff; margin: 0 16px 12px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: 15px; font-weight: 500; color: #333;">金额合计</span>
      <span style="font-size: 20px; font-weight: 600; color: #22BDB8;">¥{{ store.totalAmount.toFixed(2) }}</span>
    </div>
    <!-- Attachments -->
    <div class="card" style="margin: 12px 16px; padding: 14px 16px;">
      <div style="font-size: 15px; font-weight: 600; color: #333; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0;">附件上传</div>
      <div style="margin-top: 8px;">
        <div v-for="a in attachments" :key="a.id" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f5f5f5;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#22BDB8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#fff" stroke-width="2" fill="none" /></svg>
            <span style="font-size: 14px; color: #333;">{{ a.name }}</span>
          </div>
          <button @click="delAtt(a.id)" style="background: none; border: none; color: #F44336; font-size: 12px; cursor: pointer;">删除</button>
        </div>
        <button @click="addAtt" style="width: 80px; height: 80px; border-radius: 8px; border: 1px dashed #ccc; background-color: #fafafa; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; cursor: pointer; margin-top: 8px;">
          <span style="font-size: 24px; color: #999;">+</span><span style="font-size: 12px; color: #999;">上传附件</span>
        </button>
        <div style="font-size: 12px; color: #999; margin-top: 8px;">支持 JPG、PNG、PDF、Excel 等格式，单个文件不超过 20MB，最多 10 个</div>
      </div>
    </div>
    <!-- Submit -->
    <div style="position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 430px; padding: 12px 16px; background-color: #fff; box-shadow: 0 -2px 8px rgba(0,0,0,0.06); z-index: 100;">
      <button @click="submit" style="width: 100%; padding: 14px; border-radius: 24px; border: none; background-color: #22BDB8; color: #fff; font-size: 16px; font-weight: 500; cursor: pointer;">提交</button>
    </div>
    <!-- Confirm Dialog (CR-20260630-002 3.6) -->
    <div v-if="showConfirm" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.5); z-index: 2000; display: flex; align-items: center; justify-content: center;">
      <div style="background-color: #fff; border-radius: 12px; padding: 20px; margin: 0 32px; max-width: 320px; width: 100%;">
        <div style="font-size: 15px; color: #333; margin-bottom: 16px; line-height: 1.5;">{{ confirmMsg }}</div>
        <div style="display: flex; gap: 12px;">
          <button @click="closeConfirm" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid #e0e0e0; background-color: #fff; color: #666; font-size: 14px; cursor: pointer;">取消</button>
          <button @click="execConfirm" style="flex: 1; padding: 10px; border-radius: 8px; border: none; background-color: #22BDB8; color: #fff; font-size: 14px; cursor: pointer;">确定</button>
        </div>
      </div>
    </div>
    <!-- Toast -->
    <div v-if="toast" style="position: fixed; top: 40%; left: 50%; transform: translate(-50%, -50%); background-color: rgba(0,0,0,0.75); color: #fff; padding: 12px 24px; border-radius: 8px; font-size: 14px; z-index: 1000; white-space: nowrap;">{{ toast }}</div>
  </div>
</template>
