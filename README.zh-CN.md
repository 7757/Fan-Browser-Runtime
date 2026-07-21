# Fan Browser Runtime

[English](README.md) · **简体中文**

[![License](https://img.shields.io/github/license/7757/Fan-Browser-Runtime?color=111827)](LICENSE)

**Fan Agent 的浏览器运行时层。**

Fan Browser Runtime 是面向 AI Agent 的本地浏览器运行时：可见浏览器会话、稳定页面观察、基于
`snapshotId` 的安全动作，以及适合真实产品接入的策略层。

**在 [fandcode.com](https://fandcode.com) 了解和使用 Fan Agent。**

<p align="center">
  <img src="resource/8b63cf157f4bebafcd434572b9762382.png" alt="Fan Browser Runtime 可见浏览器会话" width="49%">
  <img src="resource/b3db213f65673adc9a268fc7585dbcaa.png" alt="Fan Agent 浏览器交互运行时" width="49%">
</p>

## 为什么做

很多浏览器自动化工具是为脚本设计的。Fan Browser Runtime 是为 Agent 设计的。

它关注生产环境里 Agent 真正需要的能力：

- 可见的浏览器会话
- 带 `snapshotId` 的稳定页面观察
- 页面变化后拒绝过期点击和输入
- 登录、验证码、支付、敏感操作的人类接管
- 导航、网络、下载、高风险动作的策略钩子
- 面向 CLI、SDK、MCP 和产品集成的协议优先设计

这个项目是 Fan 生态的一部分，用来让 Fan Agent 更容易被理解、扩展和采用。

## 当前状态

当前仓库提供开源项目骨架和可运行的 CLI MVP。Electron/CDP 真实浏览器运行时会在完成来源和许可证审计后再导入。

现在已有：

- 协议包
- Runtime 接口
- Memory runtime
- JSON-RPC handler
- Node client
- CLI MVP
- 测试、CI、许可证、NOTICE 和 provenance 文档

## 快速开始

```bash
npm install
npm run preflight
npm run example
```

CLI 验证：

```bash
npm run dev -- open https://example.com
npm run dev -- observe
npm run dev -- click 1 --snapshot <snapshotId>
npm run dev -- screenshot --out artifacts/shot.png
```

加 `--json` 可输出机器可读结果。

## 包结构

```text
packages/protocol      公开类型、JSON-RPC 方法、JSON Schema
packages/runtime       Runtime 接口、策略、memory runtime
packages/node-client   TypeScript JSON-RPC client
apps/cli               本地 CLI
```

## 示例

```ts
import { createMemoryBrowserRuntime } from "fan-browser-runtime";

const runtime = createMemoryBrowserRuntime();
const session = await runtime.createSession();
const observation = await runtime.navigate(session.sessionId, "https://example.com");

await runtime.click(session.sessionId, {
  index: 1,
  snapshotId: observation.snapshotId
});
```

## Roadmap

- Electron `WebContents` runtime
- CDP target management
- DOM 和 Accessibility 快照
- MCP server
- Python SDK
- 人类接管 demo
- Trace 和 replay 工具

## Fan

Fan Browser Runtime 是 Fan Agent 的一部分。

了解更多：[fandcode.com](https://fandcode.com)

## 许可证

Apache-2.0。见 [LICENSE](LICENSE) 和 [NOTICE](NOTICE)。
