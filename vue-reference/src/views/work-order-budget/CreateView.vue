<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useWorkOrderStore } from '../../stores/workOrder'
import { mockProductOptions, mockStores, calculateAmount, createDefaultGroup, parseImportText, validateImportRows, parseFileImport, downloadImportTemplate } from '../../mocks'
import type { ProductItem, ImportError } from '../../types'

const router = useRouter()
const route = useRoute()
const store = useWorkOrderStore()
const budgetId = computed(() => route.query.budgetId as string)
const rejectedFrom = computed(() => route.query.rejectedFrom as string) // 驳回后重提场景：原工单号
const currentUser = { name: '张三', org: '南大 / 福建' }

// 判断是否为驳回后重提场景
const isRejectedRetrigger = computed(() => !!rejectedFrom.value)

// 当前日期（Mock环境，正式环境用 new Date()）
const TODAY = new Date('2026-07-02T00:00:00')
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
    openConfirm('切换预算后，当前已填写的产品申请订单明细将被清空，是否继续？', () => {
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
  openConfirm('清空专卖店后，该明细下的产品也将被清空，是否继续？', () => {
    const g = store.storeGroups.find(x => x.id === groupId)
    if (g) {
      g.storeCode = ''
      g.storeName = ''
      g.products = [{ id: `prod_${Date.now()}`, productCode: '', productName: '', jdePrice: 0, isDiscount: false, discount: 0.5, maxQuantity: 0, quantity: 1, amount: 0 }]
    }
  })
}

// CR-20260701-002: 批量导入对话框状态
const showImport = ref(false)
const importText = ref('')
const importErrors = ref<ImportError[]>([])
const importWarnings = ref<ImportError[]>([])
const importParsedRows = ref<{ line: number; sku: string; quantity: number; storeCode: string; storeName: string }[]>([])
const importChecked = ref(false)
const importFileName = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

// 文件导入处理
async function handleFileImport(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  importFileName.value = file.name
  importChecked.value = false

  const { rows, error } = await parseFileImport(file)
  if (error) {
    importErrors.value = [{ line: 0, field: '文件', message: error }]
    importText.value = ''
    return
  }

  importErrors.value = []
  importWarnings.value = []
  importText.value = rows.join('\n')
}

function openImport() {
  if (hasGroupOrProduct()) {
    openConfirm('批量导入后，将覆盖当前已填写的产品申请订单明细和产品信息，是否继续？', () => {
      showImport.value = true
      importText.value = ''
      importErrors.value = []
      importWarnings.value = []
      importParsedRows.value = []
      importChecked.value = false
    })
  } else {
    showImport.value = true
    importText.value = ''
    importErrors.value = []
    importWarnings.value = []
    importParsedRows.value = []
    importChecked.value = false
  }
}

function closeImport() {
  showImport.value = false
}

function doParseCheck() {
  importErrors.value = []
  importWarnings.value = []
  importParsedRows.value = []
  importChecked.value = false

  const { rows, errors: parseErrors } = parseImportText(importText.value)
  const rowErrors: ImportError[] = [...parseErrors]
  const rowWarnings: ImportError[] = []

  if (rows.length > 0) {
    const { errors, warnings } = validateImportRows(rows)
    rowErrors.push(...errors)
    rowWarnings.push(...warnings)
  }

  importErrors.value = rowErrors
  importWarnings.value = rowWarnings

  if (rowErrors.length > 0) return

  // 构建带专卖店名称的行数据
  importParsedRows.value = rows.map(r => ({
    ...r,
    storeName: mockStores.find(s => s.code === r.storeCode)?.name || '',
  }))
  importChecked.value = true
}

function doConfirmImport() {
  if (!importChecked.value) return
  const groups = new Map<string, { line: number; sku: string; quantity: number; storeCode: string; storeName: string }[]>()
  for (const r of importParsedRows.value) {
    if (!groups.has(r.storeCode)) groups.set(r.storeCode, [])
    groups.get(r.storeCode)!.push(r)
  }
  store.importWorkOrderData(importParsedRows.value.map(r => ({ line: r.line, sku: r.sku, quantity: r.quantity, storeCode: r.storeCode })))
  closeImport()
  showToast(`导入成功！按 ${groups.size} 个专卖店拆分为 ${groups.size} 个产品申请订单明细`)
}

function hasImportHardErrors() {
  return importErrors.value.length > 0
}

function hasImportWarnings() {
  return importWarnings.value.length > 0
}
</script>
<template>
  <div style="padding-bottom: 80px;">
    <div style="padding: 12px 16px; background-color: #22BDB8; display: flex; align-items: center; justify-content: center; position: relative;">
      <button @click="router.back()" style="position: absolute; left: 12px; background: none; border: none; color: #fff; font-size: 22px; cursor: pointer; padding: 4px 8px;">&#8249;</button>
      <span style="color: #fff; font-size: 17px; font-weight: 500;">产品申请工单</span>
    </div>
    <!-- Budget (CR-20260702-001 整改: 补齐预算摘要区 + 驳回后重提锁定) -->
    <div class="card" style="margin: 12px 16px; padding: 14px 16px;">
      <div style="font-size: 15px; font-weight: 600; color: #333; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0;">预算信息</div>

      <!-- 驳回后重提场景提示 -->
      <div v-if="isRejectedRetrigger" style="background-color: #E3F2FD; color: #1565C0; font-size: 13px; padding: 8px 12px; border-radius: 8px; margin-bottom: 10px;">
        原单重提：基于工单 {{ rejectedFrom }} 重新发起
      </div>

      <!-- 预算号：驳回重提时禁用选择入口 -->
      <div @click="!isRejectedRetrigger && goBudgetSelect()" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f5f5f5; cursor: pointer;" :style="{ opacity: isRejectedRetrigger ? 0.6 : 1 }">
        <span style="font-size: 14px; color: #666;">预算号<span style="color: #F44336;"> *</span></span>
        <span style="font-size: 14px;" :style="{ color: store.selectedBudget ? '#333' : '#bbb' }">{{ store.selectedBudget?.budgetNo || '选择预算' }}</span>
        <span v-if="!isRejectedRetrigger" style="color: #999; margin-left: 4px; font-size: 16px;">&#8250;</span>
        <span v-else style="font-size: 12px; color: #999; margin-left: 4px;">已锁定</span>
      </div>

      <!-- 预算摘要区（CR-20260702-001 整改新增） -->
      <template v-if="store.selectedBudget">
        <div style="display: flex; justify-content: space-between; align-items: baseline; padding: 8px 0; border-bottom: 1px solid #f5f5f5;">
          <span style="font-size: 13px; color: #666;">剩余额度（净额）</span>
          <span style="font-size: 16px; font-weight: 600; color: #22BDB8;">¥{{ fmtMoney(store.selectedBudget.availableAmount) }}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f5f5f5;">
          <span style="font-size: 12px; color: #999;">预算总额（净额）</span>
          <span style="font-size: 12px; color: #999;">¥{{ fmtMoney(store.selectedBudget.budgetTotalAmount) }}</span>
        </div>
        <div style="padding: 6px 0; border-bottom: 1px solid #f5f5f5;">
          <span style="font-size: 12px; color: #999;">归属：</span>
          <span style="font-size: 12px; color: #666;">{{ store.selectedBudget.budgetOrg }}</span>
        </div>
        <div style="padding: 6px 0;">
          <span style="font-size: 12px; color: #999;">范围：</span>
          <span style="font-size: 12px; color: #666;">{{ store.selectedBudget.budgetScope }}</span>
        </div>

        <!-- 驳回重提 + 冻结期提示 -->
        <div v-if="isRejectedRetrigger && store.selectedBudget.freezeStartDate && new Date(store.selectedBudget.freezeStartDate) <= TODAY && TODAY < new Date(store.selectedBudget.budgetExpiryDate)" style="background-color: #FFF3E0; color: #E65100; font-size: 12px; padding: 8px 12px; border-radius: 8px; margin-top: 8px;">
          当前预算已进入申请冻结期，仅允许沿用原预算重新发起，不可更换预算号
        </div>
        <div v-else-if="isRejectedRetrigger && TODAY >= new Date(store.selectedBudget.budgetExpiryDate)" style="background-color: #FFEBEE; color: #C62828; font-size: 12px; padding: 8px 12px; border-radius: 8px; margin-top: 8px;">
          原预算已到期，不可继续基于原单重提，请新建空白工单
        </div>
      </template>

      <!-- 异常提示保留 -->
      <div v-if="store.selectedBudget?.isAbnormal" style="background-color: #FFF8E1; color: #FF8F00; font-size: 13px; padding: 8px 12px; border-radius: 8px; margin-top: 8px;">&#9888; {{ store.selectedBudget.abnormalMessage }}</div>
    </div>
    <!-- Apply Info (CR-20260701-001 3.1: compress before budget selected) -->
    <div class="card" style="margin: 12px 16px; padding: 14px 16px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-size: 15px; font-weight: 600; color: #333;">申请信息</span>
        <span v-if="!store.selectedBudget" style="font-size: 12px; color: #999;">选择预算后展开</span>
      </div>
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f5f5f5;"><span style="font-size: 14px; color: #666;">申请人</span><span style="font-size: 14px; color: #333;">{{ currentUser.name }}</span></div>
      <template v-if="store.selectedBudget">
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f5f5f5;"><span style="font-size: 14px; color: #666;">申请类型</span><span style="font-size: 14px; color: #333;">{{ store.selectedBudget.applyType }}</span></div>
        <div style="display: flex; align-items: flex-start; gap: 8px; padding: 10px 0;"><span style="font-size: 14px; color: #666; white-space: nowrap;">申请理由</span><span style="font-size: 14px; color: #333; line-height: 1.5; word-break: break-all; flex: 1;">{{ store.selectedBudget.applyReason }}</span></div>
      </template>
    </div>
    <!-- Store Groups Header (CR-20260701-001 3.3) -->
    <div style="padding: 0 16px; margin: 18px 0 2px;">
      <div style="font-size: 13px; color: #888;">此处开始填写需要预算核销的产品和订单归属专卖店</div>
    </div>
    <!-- Store Groups -->
    <div v-for="(group, gi) in store.storeGroups" :key="group.id" class="card" style="margin: 12px 16px; padding: 14px 16px;">
      <div @click="store.toggleGroupCollapse(group.id)" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0; cursor: pointer;">
        <div>
          <span style="font-size: 15px; font-weight: 600; color: #333;">产品申请订单明细{{ gi + 1 }}{{ group.storeCode ? ` · ${group.storeCode}` : '' }}</span>
          <!-- Group Description (CR-20260701-001 3.3): 标题下方、分隔线上方 -->
          <div v-if="!isCol(group.id)" style="font-size: 12px; color: #aaa; margin-top: 4px; line-height: 1.5;">同一个店编的预算核销产品填写在一个明细</div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <button v-if="store.storeGroups.length > 1" @click.stop="store.deleteGroup(group.id)" style="background: none; border: none; color: #F44336; font-size: 13px; cursor: pointer;">删除</button>
          <span style="color: #999; font-size: 18px; transition: transform 0.2s;" :style="{ transform: isCol(group.id) ? 'rotate(-90deg)' : 'rotate(0deg)' }">&#9662;</span>
        </div>
      </div>
      <!-- Collapsed -->
      <div v-if="isCol(group.id)" style="padding: 8px 0; color: #999; font-size: 14px; display: flex; justify-content: space-between; align-items: center;">
        <span>订单归属专卖店：{{ group.storeCode ? `${group.storeCode} ${group.storeName}` : '未选择' }}</span>
        <span style="color: #22BDB8; font-weight: 500;">{{ group.products.length }} 件产品</span>
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
            <span style="font-size: 14px; font-weight: 500; color: #22BDB8;">产品 {{ pi + 1 }}</span>
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
        <button @click="store.addProduct(group.id)" style="width: 100%; margin-top: 12px; padding: 10px; border-radius: 8px; border: 1px dashed #22BDB8; background-color: #F0FDFD; color: #22BDB8; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;"><span style="font-size: 18px;">+</span> 添加产品</button>
        <div v-if="group.products.some(p => p.amount > 0)" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #f0f0f0; text-align: right; font-size: 14px; color: #666;">
          分组小计：<span style="color: #22BDB8; font-weight: 600; font-size: 16px;">¥{{ group.products.reduce((s, p) => s + p.amount, 0).toFixed(2) }}</span>
        </div>
      </div>
    </div>
    <!-- Add Group + Import -->
    <div style="padding: 0 16px; margin-bottom: 12px;">
      <button @click="store.addGroup" style="width: 100%; padding: 12px; border-radius: 12px; border: 1px dashed #22BDB8; background-color: #fff; color: #22BDB8; font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;"><span style="font-size: 20px;">+</span> 添加产品申请订单</button>
      <div style="margin-top: 10px;">
        <button @click="openImport" style="width: 100%; padding: 12px; border-radius: 12px; border: 1px dashed #FF9800; background-color: #FFF8E1; color: #E65100; font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;"><span style="font-size: 20px;">📋</span> 批量导入产品</button>
        <div style="font-size: 12px; color: #999; margin-top: 6px; text-align: center; line-height: 1.5;">导入数据需包含产品编号、数量、专卖店编号，系统将按专卖店编号自动拆分</div>
      </div>
    </div>
    <!-- Total -->
    <div v-if="store.totalAmount > 0" style="padding: 14px 16px; background-color: #fff; margin: 0 16px 12px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: 15px; font-weight: 500; color: #333;">金额合计</span>
      <span style="font-size: 20px; font-weight: 600; color: #22BDB8;">¥{{ store.totalAmount.toFixed(2) }}</span>
    </div>
    <!-- Attachments (CR-20260701-001 3.5/3.6: upgraded layout + PDF tip) -->
    <div class="card" style="margin: 12px 16px; padding: 14px 16px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0;">
        <span style="font-size: 15px; font-weight: 600; color: #333;">附件上传</span>
        <span v-if="attachments.length > 0 || true" style="font-size: 13px; color: #999;">({{ attachments.length }}/10)</span>
      </div>
      <!-- PDF merge tip (CR-20260701-001 3.6) -->
      <div style="font-size: 12px; color: #888; margin-bottom: 12px; padding: 8px 10px; background-color: #FFF8E1; border-radius: 6px; line-height: 1.5;">💡 建议将照片和扫描件合并为一份 PDF 上传</div>
      <!-- Upload area -->
      <div style="display: flex; flex-wrap: wrap; gap: 10px;">
        <!-- Uploaded files -->
        <div v-for="a in attachments" :key="a.id" style="position: relative; width: 80px; height: 80px; border-radius: 8px; border: 1px solid #e8e8e8; background-color: #fafafa; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; overflow: hidden;">
          <!-- Image icon for image files -->
          <svg v-if="a.name.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22BDB8" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
          <!-- Document icon for other files -->
          <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF9800" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8"/></svg>
          <span style="font-size: 10px; color: #666; max-width: 70px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ a.name }}</span>
          <!-- Delete button -->
          <button @click="delAtt(a.id)" style="position: absolute; top: 2px; right: 2px; width: 18px; height: 18px; border-radius: 50%; border: none; background-color: rgba(244,67,54,0.9); color: #fff; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1;">✕</button>
          <!-- Preview placeholder -->
          <div style="position: absolute; bottom: 2px; left: 2px; right: 2px; text-align: center; font-size: 9px; color: #bbb;">点击预览</div>
        </div>
        <!-- Add button -->
        <button @click="addAtt" style="width: 80px; height: 80px; border-radius: 8px; border: 1px dashed #22BDB8; background-color: #F0FDFD; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; cursor: pointer;">
          <span style="font-size: 24px; color: #22BDB8;">+</span><span style="font-size: 11px; color: #22BDB8;">上传附件</span>
        </button>
      </div>
      <div style="font-size: 11px; color: #bbb; margin-top: 10px;">支持 JPG、PNG、PDF、Excel 等格式，单个文件不超过 20MB，最多 10 个</div>
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
    <!-- Import Dialog (CR-20260701-002) -->
    <div v-if="showImport" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.5); z-index: 2000; display: flex; align-items: center; justify-content: center;">
      <div style="background-color: #fff; border-radius: 12px; padding: 20px; margin: 0 16px; width: 100%; max-width: 380px; max-height: 80vh; overflow-y: auto;">
        <div style="font-size: 16px; font-weight: 600; color: #333; margin-bottom: 12px;">批量导入产品</div>
        <!-- Format hint -->
        <div style="font-size: 12px; color: #555; margin-bottom: 12px; padding: 10px 12px; background-color: #FFF8E1; border: 1px solid #FFE082; border-radius: 8px; line-height: 1.8;">
          <div style="font-weight: 600; color: #FF8F00; margin-bottom: 6px;">字段顺序：产品编号，数量，专卖店编号</div>
          <div style="color: #666;">支持逗号、空格、Tab 分隔</div>
          <div style="color: #666;">示例：<code style="background:#fff; padding:2px 6px; border-radius:4px; font-size:11px; color:#333;">SKU001,10,31692</code></div>
        </div>
        <!-- Textarea -->
        <textarea v-model="importText" placeholder="粘贴数据到此处..." rows="8" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e0e0e0; font-size: 13px; resize: vertical; font-family: monospace; box-sizing: border-box; line-height: 1.6;" @input="importChecked = false"></textarea>
        <!-- File import -->
        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #f0f0f0;">
          <div style="font-size: 12px; color: #888; margin-bottom: 6px;">📁 或上传文件导入（.xlsx / .xls / .csv）— 第1行为表头，第2行起为数据</div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <input ref="fileInputRef" type="file" accept=".xlsx,.xls,.csv" @change="handleFileImport" style="display: none;" />
            <button @click="fileInputRef?.click()" style="padding: 6px 14px; border-radius: 6px; border: 1px solid #22BDB8; background-color: #F0FDFD; color: #22BDB8; font-size: 13px; cursor: pointer;">选择文件</button>
            <span style="font-size: 12px; color: #999; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ importFileName || '未选择文件' }}</span>
            <button type="button" @click="downloadImportTemplate($event)" style="font-size: 12px; color: #22BDB8; text-decoration: underline; background: none; border: none; padding: 0; cursor: pointer; margin-left: auto; white-space: nowrap;">下载模板</button>
          </div>
        </div>
        <!-- Action buttons -->
        <div style="display: flex; gap: 10px; margin-top: 12px;">
          <button @click="closeImport" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid #e0e0e0; background-color: #fff; color: #666; font-size: 14px; cursor: pointer;">取消</button>
          <button @click="doParseCheck" style="flex: 1; padding: 10px; border-radius: 8px; border: none; background-color: #FF9800; color: #fff; font-size: 14px; cursor: pointer;">识别检查</button>
        </div>
        <button v-if="importChecked" @click="doConfirmImport" style="width: 100%; margin-top: 10px; padding: 10px; border-radius: 8px; border: none; background-color: #22BDB8; color: #fff; font-size: 14px; font-weight: 500; cursor: pointer;">确认导入（{{ importParsedRows.length }} 条数据）</button>
        <!-- Errors -->
        <div v-if="hasImportHardErrors()" style="margin-top: 12px; padding: 10px 12px; background-color: #FFF0F0; border-radius: 8px; border: 1px solid #FFCDD2;">
          <div style="font-size: 13px; font-weight: 600; color: #D32F2F; margin-bottom: 8px;">存在 {{ importErrors.length }} 条硬拦截错误，请修正数据后重新检查：</div>
          <div v-for="(e, ei) in importErrors" :key="ei" style="font-size: 12px; color: #C62828; padding: 4px 0; border-bottom: 1px solid #FFCDD2;" :style="{ borderBottom: ei === importErrors.length - 1 ? 'none' : '1px solid #FFCDD2' }">第 {{ e.line }} 行 · {{ e.field }}：{{ e.message }}</div>
        </div>
        <!-- Warnings (over-limit) -->
        <div v-if="hasImportWarnings()" style="margin-top: 12px; padding: 10px 12px; background-color: #FFF8E1; border-radius: 8px; border: 1px solid #FFE082;">
          <div style="font-size: 13px; font-weight: 600; color: #FF8F00; margin-bottom: 8px;">⚠ 存在 {{ importWarnings.length }} 条超量警告（超量产品可导入但提交时将无法通过）：</div>
          <div v-for="(w, wi) in importWarnings" :key="wi" style="font-size: 12px; color: #E65100; padding: 4px 0; border-bottom: 1px solid #FFE082;" :style="{ borderBottom: wi === importWarnings.length - 1 ? 'none' : '1px solid #FFE082' }">第 {{ w.line }} 行 · {{ w.field }}：{{ w.message }}</div>
        </div>
        <!-- Success summary -->
        <div v-if="importChecked && !hasImportHardErrors()" style="margin-top: 12px; padding: 10px 12px; background-color: #E8F5E9; border-radius: 8px; border: 1px solid #C8E6C9;">
          <div style="font-size: 13px; color: #2E7D32;">✅ 数据识别成功</div>
          <div style="font-size: 12px; color: #388E3C; margin-top: 4px; line-height: 1.5;">共 {{ importParsedRows.length }} 条数据，将按专卖店编号拆分为 {{ new Set(importParsedRows.map(r => r.storeCode)).size }} 个产品申请订单明细</div>
        </div>
      </div>
    </div>
  </div>
</template>
