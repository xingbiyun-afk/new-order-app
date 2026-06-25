# BRANCH_GUIDE.md — 分支管理规范

## 分支命名规则

### 前缀规范

| 前缀 | 用途 | 示例 |
|------|------|------|
| `init/` | 工程初始化、目录结构 | `init/CR-20260508-app-structure` |
| `feature/` | 新功能开发 | `feature/CR-202605xx-product-application-writeoff` |
| `fix/` | Bug 修复 | `fix/CR-20260508-status-display` |
| `docs/` | 文档更新 | `docs/CR-20260508-api-spec` |

### 命名格式

```
{prefix}/CR-{YYYYMMDD}-{brief-description}
```

- `CR`：Change Request 缩写。
- `YYYYMMDD`：日期。
- `brief-description`：简短英文描述，连字符分隔。

## 当前分支

| 分支 | 说明 |
|------|------|
| `main` | 主分支，稳定版本 |
| `init/CR-20260508-app-structure` | 工程初始化分支（当前） |

## 工作流程

1. 从 `main` 创建功能分支。
2. 在功能分支上开发。
3. 完成后通过 PR/MR 合并回 `main`。
4. 合并后删除功能分支。

## 禁止

- 禁止直接向 `main` 推送代码。
- 禁止在 `main` 上直接开发。
