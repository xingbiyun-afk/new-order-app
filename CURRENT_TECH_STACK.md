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
- **构建工具**：Vite 5.4 + @vitejs/plugin-vue（参考实现阶段因沙盒环境限制从 Vite 8 降级，生产环境可恢复）
- **样式**：基础 CSS（`@tailwindcss/vite` 已在 CR-20260703-003 中移除，项目组件未使用 Tailwind utility class）
- **构建产物**：已有 `dist/` 目录
- **页面**：8 个完整页面（列表、创建、预算选择、专卖店选择、产品选择、详情等）
- **批量导入依赖**（CR-20260703-001）：`exceljs@4.4.0`（原 `xlsx@0.18.5` 已替换，含 high severity 漏洞），按需动态加载（主包 509KB → 180KB）

### 当前运行命令

```bash
# 默认命令 → Vue（根目录直连）
npm run dev
npm run build
npm run preview

# 显式 Vue 命令（等效）
npm run dev:vue
npm run build:vue
npm run preview:vue

# 历史 React 参考（如需回溯）
npm run dev:react-legacy
npm run build:react-legacy
npm run preview:react-legacy
```

---

## 根目录 React 内容：已归档

根目录历史 React + TypeScript + Vite 工程**已归档至 `legacy/react-reference/`**，不再占据根目录主入口。

| 目录/文件 | 当前位置 | 定位 |
|-----------|----------|------|
| React src/ | `legacy/react-reference/src/` | 历史原型（**不用于当前开发**） |
| React package.json | `legacy/react-reference/package.json` | 历史依赖（**不反映当前主技术栈**） |
| React vite.config.ts | `legacy/react-reference/vite.config.ts` | 历史构建配置 |
| React index.html | `legacy/react-reference/index.html` | 历史入口 |
| React tsconfig*.json | `legacy/react-reference/` | 历史 TS 配置 |

**根目录不再保留 React 主工程文件。AI 任何时候都不应基于历史 React 归档内容假设当前项目技术栈为 React。**

当前根目录默认脚本 `npm run dev` / `npm run build` / `npm run preview` 已全部指向 Vue。

---

## AI 技术栈识别约束

1. **不得**仅依据 `legacy/react-reference/` 下的 `package.json` 中的 `react`/`react-dom` 依赖判定为 React 项目
2. **不得**仅依据 `legacy/react-reference/src/` 下的 `.tsx` 文件判定为 React 项目
3. **不得**仅依据 `legacy/react-reference/vite.config.ts` 中的 `@vitejs/plugin-react` 判定为 React 项目
4. **不得**仅依据 `legacy/react-reference/tsconfig.app.json` 中的 `"jsx": "react-jsx"` 判定为 React 项目
5. **必须**优先识别 `vue-reference/` 为当前主实现目录
6. **必须**扫描本文件（`CURRENT_TECH_STACK.md`）作为技术栈判定第一参考源
7. **注意**根目录 `package.json` 已无 React 依赖，`npm run dev` 默认指向 Vue

---

## 相关文档

- [`README.md`](./README.md) — 项目总体说明
- [`CLAUDE.md`](./CLAUDE.md) — AI 协作指南（含主工程强提示）
- [`WORKFLOW_GUIDE.md`](./WORKFLOW_GUIDE.md) — 工作流程指南
- [`docs/ai/项目协作基线.md`](./docs/ai/项目协作基线.md) — 项目级多 AI 协作基线
- [`vue-reference/README.md`](./vue-reference/README.md) — Vue 参考实现说明
