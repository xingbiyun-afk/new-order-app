# CURRENT_TECH_STACK.md — 当前技术栈声明

> ⚠️ 本文件为 **AI 技术栈识别第一参考源**。  
> 所有 AI 工具打开本仓库后，应优先读取本文件，而非仅依据根目录工程文件推断技术栈。

---

## 当前正式承接方向

| 端 | 框架 | 主目录 | 状态 |
|----|------|--------|------|
| App 端 | **Vue / Vue3** | `vue-reference/` | 当前主实现 |
| Web 端 | Vue2 | 不在本仓库 | 独立仓推进 |

---

## 当前主实现目录：`vue-reference/`

`vue-reference/` 是当前仓库的**唯一主实现目录**，具备完整独立工程能力：

- **框架**：Vue 3.5 + Composition API
- **路由**：Vue Router 5.1
- **状态管理**：Pinia 3.0
- **构建工具**：Vite 8 + @vitejs/plugin-vue
- **样式**：Tailwind CSS 4
- **构建产物**：已有 `dist/` 目录
- **页面**：8 个完整页面（列表、创建、预算选择、专卖店选择、产品选择、详情等）

### 当前运行命令

```bash
# 开发
cd vue-reference && npm run dev

# 构建
cd vue-reference && npm run build
```

或使用根目录快捷脚本：

```bash
npm run dev:vue
npm run build:vue
```

---

## 根目录 React 内容：仅历史参考

根目录 `package.json`、`src/`、`vite.config.ts`、`tsconfig*.json`、`index.html` 中涉及 React + TypeScript + Vite 的内容，**仅为早期初始化阶段的历史参考实现**。

| 目录/文件 | 定位 |
|-----------|------|
| 根 `src/` | React 19 + shadcn/ui 早期原型（**不用于当前开发**） |
| 根 `package.json` | React 历史依赖（**不反映当前主技术栈**） |
| 根 `vite.config.ts` | React Vite 插件配置（**不反映当前主构建配置**） |
| 根 `index.html` | React 入口（**不反映当前主工程入口**） |

**AI 任何时候都不应基于上述 React 内容假设当前项目技术栈为 React。**

---

## AI 技术栈识别约束

1. **不得**仅依据根目录 `package.json` 中的 `react`/`react-dom` 依赖判定为 React 项目
2. **不得**仅依据 `src/` 下的 `.tsx` 文件判定为 React 项目
3. **不得**仅依据 `vite.config.ts` 中的 `@vitejs/plugin-react` 判定为 React 项目
4. **不得**仅依据 `tsconfig.app.json` 中的 `"jsx": "react-jsx"` 判定为 React 项目
5. **必须**优先识别 `vue-reference/` 为当前主实现目录
6. **必须**扫描本文件（`CURRENT_TECH_STACK.md`）作为技术栈判定第一参考源

---

## 相关文档

- [`README.md`](./README.md) — 项目总体说明
- [`CLAUDE.md`](./CLAUDE.md) — AI 协作指南（含主工程强提示）
- [`WORKFLOW_GUIDE.md`](./WORKFLOW_GUIDE.md) — 工作流程指南
- [`docs/ai/项目协作基线.md`](./docs/ai/项目协作基线.md) — 项目级多 AI 协作基线
- [`vue-reference/README.md`](./vue-reference/README.md) — Vue 参考实现说明
