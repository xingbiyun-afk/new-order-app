import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Budget, StoreGroup } from '../types'
import { mockBudgets, createDefaultGroup } from '../mocks'

export const useWorkOrderStore = defineStore('workOrder', () => {
  const selectedBudget = ref<Budget | null>(null)
  const storeGroups = ref<StoreGroup[]>([createDefaultGroup()])
  const collapsedGroups = ref<Set<string>>(new Set())

  const totalAmount = computed(() =>
    storeGroups.value.reduce((sum, g) => sum + g.products.reduce((s, p) => s + p.amount, 0), 0)
  )
  const skuTotalMap = computed(() => {
    const map = new Map<string, number>()
    storeGroups.value.forEach(g => g.products.forEach(p => {
      if (p.productCode) map.set(p.productCode, (map.get(p.productCode) || 0) + p.quantity)
    }))
    return map
  })

  function selectBudget(budgetId: string) {
    const b = mockBudgets.find(x => x.id === budgetId)
    if (b) selectedBudget.value = b
  }
  function toggleGroupCollapse(gid: string) {
    const n = new Set(collapsedGroups.value)
    n.has(gid) ? n.delete(gid) : n.add(gid)
    collapsedGroups.value = n
  }
  function addGroup() { storeGroups.value.push(createDefaultGroup()) }
  function deleteGroup(gid: string) {
    if (storeGroups.value.length <= 1) return
    storeGroups.value = storeGroups.value.filter(g => g.id !== gid)
    const n = new Set(collapsedGroups.value); n.delete(gid); collapsedGroups.value = n
  }
  function clearCollapsed() {
    collapsedGroups.value = new Set()
  }
  function updateStoreGroup(gid: string, code: string, name: string) {
    const g = storeGroups.value.find(x => x.id === gid)
    if (g) { g.storeCode = code; g.storeName = name }
  }
  function updateProduct(gid: string, pid: string, updates: Partial<StoreGroup['products'][0]>) {
    const g = storeGroups.value.find(x => x.id === gid)
    const p = g?.products.find(x => x.id === pid)
    if (p) Object.assign(p, updates)
  }
  function addProduct(gid: string) {
    const g = storeGroups.value.find(x => x.id === gid)
    if (g) g.products.push({ id: `prod_${Date.now()}`, productCode: '', productName: '', jdePrice: 0, isDiscount: false, discount: 0.5, maxQuantity: 0, quantity: 1, amount: 0 })
  }
  function deleteProduct(gid: string, pid: string) {
    const g = storeGroups.value.find(x => x.id === gid)
    if (g) g.products = g.products.filter(x => x.id !== pid)
  }
  function initStoreGroups() {
    const saved = sessionStorage.getItem('pa_storeGroups')
    if (saved) { try { storeGroups.value = JSON.parse(saved); return } catch {} }
    storeGroups.value = [createDefaultGroup()]
  }
  function persistStoreGroups() {
    sessionStorage.setItem('pa_storeGroups', JSON.stringify(storeGroups.value))
  }

  return { selectedBudget, storeGroups, collapsedGroups, totalAmount, skuTotalMap,
    selectBudget, toggleGroupCollapse, addGroup, deleteGroup, updateStoreGroup,
    updateProduct, addProduct, deleteProduct, initStoreGroups, persistStoreGroups,
    clearCollapsed }
})
