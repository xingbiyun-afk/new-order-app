# Mock 策略

## 原则

1. **不写复杂 Mock** — 仅保留最小化占位数据。
2. **不接 API** — 所有数据交互在本阶段使用静态数据或空实现。
3. **展示字段优先** — 如需状态展示，使用 `displayStatus`、`approvalStatusText`、`flowStatusText` 等字段。

## 实现方式

### 1. 静态占位数据
- 在 `mocks/` 目录下创建简单的静态数据文件。
- 数据仅用于验证组件渲染，不模拟完整业务流程。

### 2. 空函数占位
- `services/` 目录下的 API 函数返回 `Promise.resolve({})` 或简单占位数据。
- 不模拟网络延迟、错误处理等。

### 3. 类型定义
- `types/` 目录下定义数据结构的 TypeScript interface。
- 不定义正式状态枚举，使用字符串类型。

## 示例

```typescript
// types/work-order.ts
export interface WorkOrder {
  id: string;
  title: string;
  displayStatus: string;
  approvalStatusText: string;
  flowStatusText: string;
  createdAt: string;
}

// mocks/work-orders.ts
export const mockWorkOrders: WorkOrder[] = [
  {
    id: '1',
    title: '预算申请示例',
    displayStatus: '审批中',
    approvalStatusText: '待审批',
    flowStatusText: '流程进行中',
    createdAt: '2026-05-08',
  },
];
```

## 后续对接

当需要接入真实 API 时：
1. 在 `services/` 中实现真实 API 调用。
2. 移除或保留 `mocks/` 作为开发环境备用。
3. 保持 `types/` 中的类型定义不变或按需扩展。
