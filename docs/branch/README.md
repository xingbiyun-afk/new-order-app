# 分支管理规范

## 命名规则

```
{prefix}/CR-{YYYYMMDD}-{brief-description}
```

| 前缀 | 用途 |
|------|------|
| `init/` | 工程初始化 |
| `feature/` | 新功能开发 |
| `fix/` | Bug 修复 |
| `docs/` | 文档更新 |

## 当前分支

- `main`：主分支
- `init/CR-20260508-app-structure`：工程初始化（当前工作分支）

## 工作流

1. 从 `main` 切出新分支。
2. 开发完成后合并回 `main`。
3. 禁止直接向 `main` 推送。
