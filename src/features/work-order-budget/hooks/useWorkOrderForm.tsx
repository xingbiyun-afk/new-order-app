// ============================================================
// 产品申请工单 - 表单状态管理 Context
// 跨页面共享（发起页、预算选择页、专卖店搜索页）
// ============================================================

import { createContext, useContext, useState, useCallback } from 'react'
import type { Budget, StoreGroup } from '../types'
import { createDefaultGroup } from '../mocks'

interface WorkOrderFormState {
  selectedBudget: Budget | null
  storeGroups: StoreGroup[]
  attachments: { id: string; name: string }[]
  currentGroupId: string | null
}

interface WorkOrderFormContextType extends WorkOrderFormState {
  setSelectedBudget: (budget: Budget | null) => void
  setStoreGroups: (groups: StoreGroup[] | ((prev: StoreGroup[]) => StoreGroup[])) => void
  setAttachments: (atts: { id: string; name: string }[] | ((prev: { id: string; name: string }[]) => { id: string; name: string }[])) => void
  setCurrentGroupId: (id: string | null) => void
  addGroup: () => void
  deleteGroup: (groupId: string) => void
  addProduct: (groupId: string) => void
  deleteProduct: (groupId: string, productId: string) => void
  updateStore: (groupId: string, storeCode: string, storeName: string) => void
  resetForm: () => void
}

const WorkOrderFormContext = createContext<WorkOrderFormContextType | null>(null)

export function WorkOrderFormProvider({ children }: { children: React.ReactNode }) {
  const [selectedBudget, setSelectedBudgetState] = useState<Budget | null>(null)
  const [storeGroups, setStoreGroupsState] = useState<StoreGroup[]>([createDefaultGroup()])
  const [attachments, setAttachmentsState] = useState<{ id: string; name: string }[]>([])
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null)

  const setSelectedBudget = useCallback((budget: Budget | null) => {
    setSelectedBudgetState(budget)
  }, [])

  const setStoreGroups = useCallback((groups: StoreGroup[] | ((prev: StoreGroup[]) => StoreGroup[])) => {
    setStoreGroupsState(groups)
  }, [])

  const setAttachments = useCallback((atts: { id: string; name: string }[] | ((prev: { id: string; name: string }[]) => { id: string; name: string }[])) => {
    setAttachmentsState(atts)
  }, [])

  const addGroup = useCallback(() => {
    setStoreGroupsState((prev) => [...prev, createDefaultGroup()])
  }, [])

  const deleteGroup = useCallback((groupId: string) => {
    setStoreGroupsState((prev) => {
      if (prev.length <= 1) return prev
      return prev.filter((g) => g.id !== groupId)
    })
  }, [])

  const addProduct = useCallback((groupId: string) => {
    setStoreGroupsState((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g
        return {
          ...g,
          products: [...g.products, {
            id: `prod_${Date.now()}`,
            productCode: '',
            productName: '',
            jdePrice: 0,
            isDiscount: false,
            discount: 0.5,
            maxQuantity: 0,
            quantity: 1,
            amount: 0,
          }],
        }
      })
    )
  }, [])

  const deleteProduct = useCallback((groupId: string, productId: string) => {
    setStoreGroupsState((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g
        return { ...g, products: g.products.filter((p) => p.id !== productId) }
      })
    )
  }, [])

  const updateStore = useCallback((groupId: string, storeCode: string, storeName: string) => {
    setStoreGroupsState((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g
        return { ...g, storeCode, storeName }
      })
    )
  }, [])

  const resetForm = useCallback(() => {
    setSelectedBudgetState(null)
    setStoreGroupsState([createDefaultGroup()])
    setAttachmentsState([])
    setCurrentGroupId(null)
  }, [])

  return (
    <WorkOrderFormContext.Provider
      value={{
        selectedBudget,
        storeGroups,
        attachments,
        currentGroupId,
        setSelectedBudget,
        setStoreGroups,
        setAttachments,
        setCurrentGroupId,
        addGroup,
        deleteGroup,
        addProduct,
        deleteProduct,
        updateStore,
        resetForm,
      }}
    >
      {children}
    </WorkOrderFormContext.Provider>
  )
}

export function useWorkOrderForm() {
  const ctx = useContext(WorkOrderFormContext)
  if (!ctx) throw new Error('useWorkOrderForm must be used within WorkOrderFormProvider')
  return ctx
}
