# GLM-Free-API for Cloudflare Workers
About

智谱清言网页版的 Cloudflare Worker 2API层，提供 OpenAI / Claude / Gemini 三种协议兼容接口，支持流式对话、Tools调用、AI 绘图、视频生成与多账号 Token 轮询。

---

## 目录

- [项目概述](#项目概述)
- [核心特性](#核心特性)
- [架构设计](#架构设计)
- [快速开始](#快速开始)
- [部署指南](#部署指南)
- [Token 管理](#token-管理)
- [API 使用指南](#api-使用指南)
- [客户端接入](#客户端接入)
- [高级功能](#高级功能)
- [常见问题](#常见问题)

---

## 项目概述

本项目将智谱清言（chatglm.cn）网页端的私有流式 API 转换为标准的大语言模型服务接口，使任何支持 OpenAI、Claude 或 Gemini 协议的客户端都能直接调用 GLM 系列模型的能力。



---

## 核心特性

| 特性                | 说明                                                         |
| ------------------- | ------------------------------------------------------------ |
| **多协议兼容**      | 同时支持 OpenAI (`/v1/chat/completions`)、Claude (`/v1/messages`)、Gemini (`/v1beta/models/...`) 三种请求格式 |
| **流式响应**        | 完整的 SSE 流式输出，支持逐字显示与 reasoning_content（思考过程） |
| **动态 Token 管理** | 认证与资源分离：API Key 仅用于身份验证，所有 `refresh_token` 组成统一池子按轮询策略调度 |
| **多账号轮询**      | 支持在 Authorization Header 中以逗号分隔传入多个 api_key，自动选择可用账号 |
| **AI 绘图**         | 对接智谱清言绘图智能体，支持文生图与多轮图生图               |
| **视频生成**        | 支持文生视频、图生视频及风格参数控制                         |
| **工具调用**        | 完整支持 Function Calling，兼容 OpenAI / Claude 格式，适配 claude-code、open-code 等 IDE |
| **联网搜索**        | 模型自动触发联网搜索，搜索结果通过 `reasoning_content` 字段返回 |
| **长文档/图像解析** | 支持 BASE64 图像上传与长文本上下文                           |

---

## 架构设计

```
┌─────────────────┐     ┌──────────────────────────┐     ┌─────────────────┐
│   客户端应用     │────▶│  Cloudflare Worker (V8)  │────▶│  chatglm.cn     │
│ (NextChat/Lobe) │     │                          │     │  私有 API       │
└─────────────────┘     │  • KV: api_key 映射      │     └─────────────────┘
                        │  • Cache: access_token   │
                        │  • 签名算法              │
                        │  • 协议适配层            │
                        └──────────────────────────┘
```

**请求处理流程**

1. 客户端以 `Authorization: Bearer <api_key>` 发起请求
2. Worker 验证该 `api_key` 是否有效（检查 `ak:*` 记录）
3. 从 Token 池（所有 `rt:*` 记录）中按轮询策略选择一个 `refresh_token`
4. 若 `access_token` 未缓存或已过期，使用选中的 `refresh_token` 向智谱换取新的 `access_token`
5. 构造带签名的请求头，调用智谱流式接口
6. 将智谱 SSE 流实时转换为目标协议格式并返回给客户端

---

## 快速开始

### 前置要求

- [Node.js](https://nodejs.org/) 18+
- [Cloudflare 账号](https://dash.cloudflare.com/sign-up)（免费版即可）
- 智谱清言账号及 `chatglm_refresh_token`

### 获取 refresh_token

登录 [chatglm.cn](https://chatglm.cn) 后，打开浏览器开发者工具 → Application → Cookies，复制 `chatglm_refresh_token` 的值。

### 安装与本地开发

```bash
cd cf-worker
npm install

# 本地开发（自动模拟 KV 和 Cache）
npx wrangler dev --local
```

本地服务默认运行在 `http://localhost:8787`。

---

## 部署指南

### 第一步：创建 KV Namespace

```bash
npx wrangler kv:namespace create GLM_TOKENS
```

命令会输出如下内容，将 `id` 填入 `wrangler.toml`：

```toml
[[kv_namespaces]]
binding = "GLM_TOKENS"
id = "<你的-namespace-id>"
```

### 第二步：配置环境变量

编辑 [`wrangler.toml`](wrangler.toml)：

```toml
[vars]
# 智谱请求签名密钥（保持默认值即可，或自定义）
SIGN_SECRET = "8a1317a7468aa3ad86e997d08f3f31cb"

# 管理接口保护密钥，部署前务必修改为随机强密码
ADMIN_KEY = "your-random-strong-password"
```

> **安全提示**：`ADMIN_KEY` 用于保护 `/admin/token` 接口。若留空或未设置，任何人都能修改 Token 映射，生产环境务必设置强密码。

### 第三步：部署

```bash
npx wrangler deploy
```

部署成功后，终端会输出 Worker 的访问地址。由于 `.workers.dev` 域名在中国大陆可能被拦截，建议绑定自定义域名以获得最佳访问体验。

---

## Token 管理

本项目采用**认证与资源分离**的架构：

- **API Key**：仅用于身份认证，证明调用方有权使用服务。可配置多个，效果等价。
- **Token 池**：所有智谱 `refresh_token` 组成一个共享池，系统按**轮询（Round Robin）**策略自动调度。

这种设计让你可以为不同客户端分配不同的 API Key，但它们背后共享同一组智谱账号资源，实现真正的统一系统调控。

---

### API Key 管理

#### 添加 API Key

```bash
curl -X POST https://<your-worker-domain>/admin/apikey \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: <your-admin-key>" \
  -d '{ "api_key": "sk-my-personal-key" }'
```

响应：

```json
{ "success": true, "message": "API key added successfully" }
```

#### 查看已配置的 API Key

```bash
curl -X GET https://<your-worker-domain>/admin/apikey \
  -H "X-Admin-Key: <your-admin-key>"
```

响应：

```json
{
  "keys": [
    { "api_key": "sk-my-personal-key" },
    { "api_key": "sk-team-shared-key" }
  ]
}
```

#### 删除 API Key

```bash
curl -X DELETE https://<your-worker-domain>/admin/apikey \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: <your-admin-key>" \
  -d '{ "api_key": "sk-my-personal-key" }'
```

---

### Token 池管理

#### 添加 Refresh Token 到池子

```bash
curl -X POST https://<your-worker-domain>/admin/token \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: <your-admin-key>" \
  -d '{ "refresh_token": "eyJhbGciOiJIUzI1NiIs..." }'
```

响应：

```json
{ "success": true, "message": "Token added to pool", "id": "tk_1234567890_abc123" }
```

#### 查看 Token 池

```bash
curl -X GET https://<your-worker-domain>/admin/token \
  -H "X-Admin-Key: <your-admin-key>"
```

响应：

```json
{
  "tokens": [
    { "id": "tk_1234567890_abc123", "token_preview": "eyJhbG...****...xyz" },
    { "id": "tk_1234567891_def456", "token_preview": "eyJhbG...****...abc" }
  ]
}
```

#### 从池子删除 Token

```bash
curl -X DELETE https://<your-worker-domain>/admin/token \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: <your-admin-key>" \
  -d '{ "id": "tk_1234567890_abc123" }'
```

---

### 多 Token 轮询

系统会自动从 Token 池中按轮询策略选择可用账号。如需更高可用性，可在池子中添加多个 `refresh_token`。当某个 Token 失效时，只需在管理面板中更新池子即可，**无需修改任何客户端配置**。

同时，单次请求仍支持在 Authorization Header 中以逗号分隔传入多个 api_key（容错用途）：

```bash
curl -X POST https://<your-worker-domain>/v1/chat/completions \
  -H "Authorization: Bearer key-a,key-b,key-c" \
  ...
```

Worker 会依次尝试每个 key，使用第一个通过认证的账号发起请求。

---

## API 使用指南

### OpenAI 兼容接口

#### 非流式对话

```bash
curl -X POST https://<your-worker-domain>/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-api-key>" \
  -d '{
    "model": "glm-4.7",
    "messages": [
      { "role": "system", "content": "你是一个乐于助人的助手" },
      { "role": "user", "content": "请用一句话解释量子计算" }
    ],
    "stream": false
  }'
```

#### 流式对话

```bash
curl -X POST https://<your-worker-domain>/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-api-key>" \
  -d '{
    "model": "glm-4.7",
    "messages": [{ "role": "user", "content": "写一首关于春天的短诗" }],
    "stream": true
  }'
```

#### 携带上下文的多轮对话

```bash
curl -X POST https://<your-worker-domain>/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-api-key>" \
  -d '{
    "model": "glm-4.7",
    "conversation_id": "conv_abc123",
    "messages": [
      { "role": "user", "content": "我叫张三" },
      { "role": "assistant", "content": "你好张三，很高兴认识你。" },
      { "role": "user", "content": "我叫什么名字？" }
    ]
  }'
```

#### 工具调用（Function Calling）

支持 OpenAI 标准 `tools` / `tool_choice` 参数，可对接 claude-code、open-code、Dify Agent 等依赖工具调用的客户端。

**发起工具调用请求**

```bash
curl -X POST https://<your-worker-domain>/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-api-key>" \
  -d '{
    "model": "glm-4.7",
    "messages": [{ "role": "user", "content": "北京今天天气怎么样？" }],
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "get_weather",
          "description": "获取指定城市的当前天气",
          "parameters": {
            "type": "object",
            "properties": {
              "city": { "type": "string", "description": "城市名称" }
            },
            "required": ["city"]
          }
        }
      }
    ]
  }'
```

响应示例（模型决定调用工具时）：

```json
{
  "choices": [{
    "message": {
      "role": "assistant",
      "content": null,
      "tool_calls": [{
        "id": "call_xxx",
        "type": "function",
        "function": {
          "name": "get_weather",
          "arguments": "{\"city\":\"北京\"}"
        }
      }]
    }
  }]
}
```

**多轮对话中的工具结果反馈**

```bash
curl -X POST https://<your-worker-domain>/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-api-key>" \
  -d '{
    "model": "glm-4.7",
    "messages": [
      { "role": "user", "content": "北京今天天气怎么样？" },
      { "role": "assistant", "tool_calls": [{ "id": "call_xxx", "type": "function", "function": { "name": "get_weather", "arguments": "{\"city\":\"北京\"}" } }] },
      { "role": "tool", "tool_call_id": "call_xxx", "content": "晴朗，25°C，微风" },
      { "role": "user", "content": "上海呢？" }
    ],
    "tools": [...]
  }'
```

> **注意**：流式输出同样支持工具调用。在流式模式下，工具调用 JSON 会被智能缓冲，不会以普通文本形式泄露到 `content` 字段中。

### Claude 兼容接口

```bash
curl -X POST https://<your-worker-domain>/v1/messages \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-api-key>" \
  -d '{
    "model": "glm-4.7",
    "messages": [{ "role": "user", "content": "你好" }],
    "stream": true,
    "max_tokens": 4096
  }'
```

#### Claude 格式的工具调用

Claude 的 `tools` / `tool_choice` 参数会自动转换为 OpenAI 格式后处理，返回时也会转换回 Claude 的 `tool_use` / `tool_result` 格式：

```bash
curl -X POST https://<your-worker-domain>/v1/messages \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-api-key>" \
  -d '{
    "model": "glm-4.7",
    "messages": [{ "role": "user", "content": "查一下北京的天气" }],
    "tools": [
      {
        "name": "get_weather",
        "description": "获取指定城市的当前天气",
        "input_schema": {
          "type": "object",
          "properties": {
            "city": { "type": "string" }
          },
          "required": ["city"]
        }
      }
    ],
    "stream": false
  }'
```

### Gemini 兼容接口

```bash
curl -X POST "https://<your-worker-domain>/v1beta/models/gemini-1.5-pro:streamGenerateContent" \
  -H "Content-Type: application/json" \
  -H "x-goog-api-key: <your-api-key>" \
  -d '{
    "contents": [{ "role": "user", "parts": [{ "text": "你好" }] }]
  }'
```

### 图像生成

```bash
curl -X POST https://<your-worker-domain>/v1/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-api-key>" \
  -d '{
    "prompt": "一只穿着宇航服的猫咪在月球上散步",
    "model": "glm-4.7",
    "response_format": "url"
  }'
```

| 参数              | 类型   | 必填 | 说明                                                   |
| ----------------- | ------ | ---- | ------------------------------------------------------ |
| `prompt`          | string | 是   | 图像描述                                               |
| `model`           | string | 否   | 智能体 ID（24 位以上字母数字），留空使用默认绘图智能体 |
| `response_format` | string | 否   | `url` 或 `b64_json`，默认 `url`                        |

### 视频生成

```bash
curl -X POST https://<your-worker-domain>/v1/videos/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-api-key>" \
  -d '{
    "model": "glm-4.7",
    "prompt": "一只金毛犬在海边奔跑",
    "video_style": "电影感",
    "emotional_atmosphere": "温馨和谐",
    "mirror_mode": "推近"
  }'
```

| 参数                   | 类型   | 必填 | 可选值                                            |
| ---------------------- | ------ | ---- | ------------------------------------------------- |
| `video_style`          | string | 否   | `卡通3D` / `黑白老照片` / `油画` / `电影感`       |
| `emotional_atmosphere` | string | 否   | `温馨和谐` / `生动活泼` / `紧张刺激` / `凄凉寂寞` |
| `mirror_mode`          | string | 否   | `水平` / `垂直` / `推近` / `拉远`                 |
| `image_url`            | string | 否   | 图生视频时的参考图片 URL                          |
| `audio_id`             | string | 否   | 指定音频 ID                                       |

### Token 状态检查

```bash
curl -X POST https://<your-worker-domain>/token/check \
  -H "Authorization: Bearer <your-api-key>"
```

响应：

```json
{ "live": true }
```

---

## 客户端接入

### OpenAI SDK (Python)

```python
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://<your-worker-domain>/v1"
)

response = client.chat.completions.create(
    model="glm-4.7",
    messages=[{"role": "user", "content": "你好"}],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

### OpenAI SDK (Node.js)

```javascript
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "your-api-key",
  baseUrl: "https://<your-worker-domain>/v1",
});

const stream = await client.chat.completions.create({
  model: "glm-4.7",
  messages: [{ role: "user", content: "你好" }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || "");
}
```

### claude-code

```bash
claude config set apiKey your-api-key
export CLAUDE_API_BASE_URL=https://<your-worker-domain>
claude
```

### gemini-cli

```bash
export GEMINI_API_KEY=your-api-key
export GEMINI_BASE_URL=https://<your-worker-domain>/v1beta
gemini -m glm-4.7
```

### 第三方聊天客户端

| 客户端                          | 配置方式                                                     |
| ------------------------------- | ------------------------------------------------------------ |
| **NextChat (ChatGPT-Next-Web)** | 接口地址填 `https://<your-worker-domain>/v1`，API Key 填你的自定义 api_key |
| **LobeChat**                    | 添加自定义服务商，OpenAI 兼容模式，Base URL 同上             |
| **Dify**                        | 模型供应商选择 OpenAI API Compatible，填入 base_url 和 api_key |

---

## 高级功能

### 自定义域名绑定

`.workers.dev` 域名在中国大陆访问可能被重置，建议绑定自定义域名：

1. 在 Cloudflare Dashboard 进入你的域名 DNS 管理页
2. 添加一个 CNAME 记录，如 `api.yourdomain.com` → `glm-free-api-worker.your-subdomain.workers.dev`
3. 进入 Worker 设置 → Triggers → Custom Domains，添加 `api.yourdomain.com`

### 模型列表

支持通过标准接口查询可用模型：

```bash
curl https://<your-worker-domain>/v1/models \
  -H "Authorization: Bearer <your-api-key>"
```


### 响应中的 reasoning_content

当模型触发联网搜索或深度思考时，流式响应中会包含 `reasoning_content` 字段：

```json
{
  "choices": [{
    "delta": {
      "reasoning_content": "> 检索 量子计算最新进展 ..."
    }
  }]
}
```

客户端可将其渲染为灰色思考过程，与正式回答区分开。

### 工具调用实现机制

由于智谱清言网页版 API 暂不原生支持工具调用，本项目采用 **Prompt Engineering + 后处理解析** 的方案实现兼容：

1. **注入工具描述**：请求前将可用工具的名称、描述、参数结构以结构化英文指令形式注入到 `system` 消息中，并附带 Few-shot 示例，引导模型在需要时输出标准 JSON。

2. **智能流式缓冲**：在流式输出场景下，Worker 会检测输出内容是否以 `{` 开头。若是，则缓冲约 20 个字符后判断其是否为工具调用 JSON；确认后将其解析为 `tool_calls`，避免 JSON 文本泄露到普通 `content` 中。

3. **鲁棒解析**：`parseToolCalls` 函数支持标准 JSON、单引号 JSON 以及无引号 key 的宽松格式；若解析失败，会尝试常见修复策略（补全括号、替换单引号等）后再次解析。

4. **协议转换**：Claude 协议的 `tool_use` / `tool_result` 消息会在进入智谱前被转换为 OpenAI 的 `tool_calls` / `tool` 格式，返回时再转换回去，确保对上层客户端完全透明。

> **已知限制**：工具调用的可靠性取决于模型对 prompt 指令的遵循程度。过于复杂的嵌套参数或含糊的工具描述可能导致解析失败。建议为工具提供清晰、准确的 `description` 和 `parameters` 定义。

---


## 技术栈

- **运行时**：Cloudflare Workers (V8 Isolate)
- **语言**：TypeScript
- **存储**：Cloudflare KV（Token 映射）、Cache API（access_token 缓存）
- **流式处理**：Web Streams API + 手写 SSE 解析器

---

## 免责声明

本项目仅供学习研究交流使用，不提供任何担保。使用本服务产生的任何法律责任由使用者自行承担。请遵守智谱清言的用户协议及相关法律法规。

# 链接

Linux.do 社区，互联网上唯一的净土！
