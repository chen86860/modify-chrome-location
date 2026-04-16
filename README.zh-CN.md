# 修改 Chrome 地区为美国（启用 Gemini）

> For English documentation, see [README.md](README.md)

一个 Node.js 脚本，用于将 Chrome 的 `Local State` 文件中的地区设置修改为**美国（US）**，从而解锁 Chrome 内置的 [Gemini](https://gemini.google.com/) AI 助手（也称为"Glic"）功能。

---

## 背景

Chrome 内置的 Gemini 侧边栏 AI 助手目前仅在美国地区开放。Chrome 通过读取用户数据目录中 `Local State` 文件里的地区字段来判断是否可用。本脚本强制将这些字段设置为 `"us"`，并将所有账号标记为 `is_glic_eligible: true`，让 Chrome 认为当前处于美国地区，从而解锁 Gemini 功能。

---

## 脚本做了什么

脚本修改 `Local State` 文件中的三个字段：

| 字段                                       | 修改前           | 修改后           |
| ------------------------------------------ | ---------------- | ---------------- |
| `is_glic_eligible`（所有出现位置）         | `false` / 不存在 | `true`           |
| `variations_country`                       | `"cn"` 或其他    | `"us"`           |
| `variations_permanent_consistency_country` | `[版本号, "cn"]` | `[版本号, "us"]` |

---

## 支持的平台

| 平台    | Chrome 渠道                           |
| ------- | ------------------------------------- |
| macOS   | Stable、Canary、Dev、Beta             |
| Windows | Stable、Canary、Dev、Beta             |
| Linux   | Stable、Canary（Unstable）、Dev、Beta |

脚本会自动检测已安装的 Chrome 渠道并全部修改。

---

## 环境要求

- [Node.js](https://nodejs.org/) v14 或更高版本

无需安装任何第三方依赖。

---

## 使用方法

### 第一步：完全退出 Chrome

> **重要：** Chrome 退出时会覆盖 `Local State` 文件。运行脚本前必须完全退出 Chrome，否则修改会被还原。

- **macOS / Linux：** 按 `Cmd+Q` 或从菜单选择「退出 Google Chrome」
- **Windows：** 右键点击托盘图标 → 「退出」

### 第二步：运行脚本

```bash
node main.js
```

脚本会输出每个修改的字段，并在退出前等待你按下 **Enter** 键。

**示例输出：**

```
Patching Chrome stable 130.0.6723.117 "/Users/jack/Library/Application Support/Google/Chrome"
Patched is_glic_eligible
Patched variations_country
Patched variations_permanent_consistency_country
Succeeded in patching Local State
Enter to continue...
```

### 第三步：重启 Chrome

脚本完成后重新打开 Chrome。Gemini 应该会出现在侧边栏中（工具栏上的 ✨ 按钮）。

---

## 重复运行

Chrome 在版本更新或重新登录账号后可能会重置地区字段。如果 Gemini 消失了，退出 Chrome 后重新运行脚本即可。

---

## 实现原理

```
Chrome User Data Directory
└── Local State          ← 存储浏览器级别偏好设置的 JSON 文件
    ├── variations_country                       → 设为 "us"
    ├── variations_permanent_consistency_country → 设为 [Chrome版本号, "us"]
    └── ...accounts[].is_glic_eligible           → 递归设为 true
```

脚本执行流程：

1. 检测当前操作系统，定位所有 Chrome 用户数据目录。
2. 读取 `Last Version` 文件获取 Chrome 版本号。
3. 将 `Local State` 解析为 JSON。
4. 递归地将所有 `is_glic_eligible` 字段设为 `true`。
5. 将 `variations_country` 和 `variations_permanent_consistency_country` 设为美国对应的值。
6. 将修改后的 JSON 写回 `Local State` 文件。

---

## 免责声明

本脚本仅修改本地浏览器配置文件，不与任何服务器通信，也不安装任何软件。使用风险自负。
