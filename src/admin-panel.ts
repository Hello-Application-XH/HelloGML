// @ts-nocheck
export function getAdminPanelHTML(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GLM-Free-API 管理面板</title>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Noto+Serif+SC:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --parchment: #f3ead6;
    --parchment-light: #faf5eb;
    --parchment-dark: #e8dcc4;
    --ink: #3d2b1f;
    --ink-light: #6b5344;
    --ink-faint: #9c8b7a;
    --gold: #c9a96e;
    --gold-light: #dcc092;
    --gold-dark: #a0824a;
    --sepia: #8b6914;
    --crimson: #8b3a3a;
    --green: #5a7d4a;
    --border: #d4c5a9;
    --shadow: rgba(61, 43, 31, 0.12);
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Noto Serif SC', Georgia, serif;
    background-color: var(--parchment);
    color: var(--ink);
    min-height: 100vh;
    line-height: 1.7;
    background-image:
      url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E");
  }

  .container { max-width: 960px; margin: 0 auto; padding: 2rem 1.5rem; }

  /* Header */
  .header {
    text-align: center;
    padding: 3rem 1rem 2rem;
    position: relative;
  }
  .header::before, .header::after {
    content: '';
    display: block;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    margin: 1.2rem auto;
    max-width: 320px;
  }
  .header h1 {
    font-family: 'Cinzel', 'Noto Serif SC', serif;
    font-size: 1.9rem;
    font-weight: 600;
    color: var(--ink);
    letter-spacing: 0.12em;
  }
  .header .subtitle {
    font-size: 0.85rem;
    color: var(--ink-faint);
    margin-top: 0.4rem;
    font-style: italic;
  }

  /* Cards */
  .card {
    background: var(--parchment-light);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 1.8rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 24px var(--shadow);
    position: relative;
  }
  .card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--gold-dark), var(--gold), var(--gold-dark));
    opacity: 0.6;
  }
  .card-title {
    font-family: 'Cinzel', 'Noto Serif SC', serif;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--ink);
    margin-bottom: 1.2rem;
    padding-bottom: 0.6rem;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  /* Navigation */
  .nav {
    display: flex;
    gap: 0.4rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid var(--border);
    padding-bottom: 0;
  }
  .nav-item {
    padding: 0.7rem 1.4rem;
    cursor: pointer;
    border: none;
    background: none;
    font-family: 'Noto Serif SC', serif;
    font-size: 0.95rem;
    color: var(--ink-faint);
    position: relative;
    transition: color 0.3s;
  }
  .nav-item:hover { color: var(--ink-light); }
  .nav-item.active {
    color: var(--ink);
    font-weight: 600;
  }
  .nav-item.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0; right: 0;
    height: 2px;
    background: var(--gold);
  }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.2rem;
    margin-bottom: 2rem;
  }
  .stat-item {
    background: linear-gradient(160deg, var(--parchment-light) 0%, var(--parchment-dark) 100%);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 1.4rem 1.2rem;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .stat-item::after {
    content: '';
    position: absolute;
    top: -50%; right: -50%;
    width: 100%; height: 100%;
    background: radial-gradient(circle, var(--gold-light) 0%, transparent 70%);
    opacity: 0.08;
  }
  .stat-value {
    font-family: 'Cinzel', serif;
    font-size: 2rem;
    font-weight: 700;
    color: var(--sepia);
    line-height: 1;
  }
  .stat-label {
    font-size: 0.8rem;
    color: var(--ink-faint);
    margin-top: 0.4rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  /* Buttons */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 0.6rem 1.2rem;
    border-radius: 3px;
    border: 1px solid transparent;
    font-family: 'Noto Serif SC', serif;
    font-size: 0.88rem;
    cursor: pointer;
    transition: all 0.25s ease;
    text-decoration: none;
  }
  .btn-primary {
    background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%);
    color: #fff;
    border-color: var(--gold-dark);
    box-shadow: 0 2px 8px rgba(139, 105, 20, 0.25);
  }
  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(139, 105, 20, 0.35);
  }
  .btn-secondary {
    background: transparent;
    color: var(--ink-light);
    border-color: var(--border);
  }
  .btn-secondary:hover {
    background: var(--parchment-dark);
    border-color: var(--gold);
  }
  .btn-danger {
    background: transparent;
    color: var(--crimson);
    border-color: #c9a0a0;
  }
  .btn-danger:hover {
    background: rgba(139, 58, 58, 0.06);
  }
  .btn-sm { padding: 0.35rem 0.8rem; font-size: 0.8rem; }

  /* Table */
  .table-wrap { overflow-x: auto; }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }
  th, td {
    padding: 0.85rem 1rem;
    text-align: left;
    border-bottom: 1px solid var(--border);
  }
  th {
    font-weight: 600;
    color: var(--ink-light);
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    background: var(--parchment-dark);
  }
  tr:hover td { background: rgba(201, 169, 110, 0.06); }
  .key-mask {
    font-family: monospace;
    font-size: 0.85rem;
    color: var(--ink-faint);
    background: var(--parchment-dark);
    padding: 0.2rem 0.5rem;
    border-radius: 3px;
    border: 1px solid var(--border);
  }

  /* Form */
  .form-group { margin-bottom: 1.2rem; }
  .form-label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--ink-light);
    margin-bottom: 0.4rem;
  }
  .form-input, .form-textarea {
    width: 100%;
    padding: 0.7rem 0.9rem;
    border: 1px solid var(--border);
    border-radius: 3px;
    background: var(--parchment-light);
    color: var(--ink);
    font-family: 'Noto Serif SC', serif;
    font-size: 0.9rem;
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .form-input:focus, .form-textarea:focus {
    outline: none;
    border-color: var(--gold);
    box-shadow: 0 0 0 3px rgba(201, 169, 110, 0.15);
  }
  .form-textarea { min-height: 100px; resize: vertical; }

  /* Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(61, 43, 31, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
  }
  .modal-overlay.show { opacity: 1; pointer-events: auto; }
  .modal {
    background: var(--parchment-light);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 2rem;
    max-width: 440px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(61, 43, 31, 0.25);
    position: relative;
  }
  .modal::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--gold-dark), var(--gold), var(--gold-dark));
  }
  .modal-title {
    font-family: 'Cinzel', 'Noto Serif SC', serif;
    font-size: 1.2rem;
    margin-bottom: 1.2rem;
    text-align: center;
  }

  /* Toast */
  .toast-container {
    position: fixed;
    top: 1.5rem;
    right: 1.5rem;
    z-index: 200;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }
  .toast {
    padding: 0.8rem 1.2rem;
    border-radius: 4px;
    font-size: 0.9rem;
    box-shadow: 0 4px 16px var(--shadow);
    animation: slideIn 0.35s ease;
    border-left: 3px solid;
    max-width: 320px;
  }
  .toast.success { background: var(--parchment-light); border-color: var(--green); color: var(--green); }
  .toast.error { background: var(--parchment-light); border-color: var(--crimson); color: var(--crimson); }
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  /* Status badge */
  .badge {
    display: inline-block;
    padding: 0.2rem 0.6rem;
    border-radius: 2px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.04em;
  }
  .badge-online { background: rgba(90, 125, 74, 0.12); color: var(--green); border: 1px solid rgba(90, 125, 74, 0.25); }
  .badge-offline { background: rgba(139, 58, 58, 0.08); color: var(--crimson); border: 1px solid rgba(139, 58, 58, 0.2); }
  .badge-unknown { background: rgba(156, 139, 122, 0.12); color: var(--ink-faint); border: 1px solid rgba(156, 139, 122, 0.2); }

  /* Guide section */
  .code-block {
    background: #2d2419;
    color: #e8dcc4;
    padding: 1rem;
    border-radius: 4px;
    font-family: 'SF Mono', Monaco, monospace;
    font-size: 0.82rem;
    overflow-x: auto;
    line-height: 1.6;
    border: 1px solid #4a3f2f;
  }
  .code-block .comment { color: #8b7d6b; }
  .code-block .string { color: #c9a96e; }
  .code-block .keyword { color: #d4a5a5; }

  /* Loading spinner */
  .spinner {
    width: 16px; height: 16px;
    border: 2px solid var(--border);
    border-top-color: var(--gold);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .hidden { display: none !important; }
  .section { display: none; }
  .section.active { display: block; animation: fadeIn 0.4s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

  /* Responsive */
  @media (max-width: 640px) {
    .header h1 { font-size: 1.4rem; }
    .nav { overflow-x: auto; }
    .stats-grid { grid-template-columns: 1fr; }
    .card { padding: 1.2rem; }
  }
</style>
</head>
<body>

<!-- Toast Container -->
<div class="toast-container" id="toastContainer"></div>

<!-- Login Modal -->
<div class="modal-overlay" id="loginModal">
  <div class="modal">
    <div class="modal-title">管理面板登录</div>
    <p style="text-align:center;color:var(--ink-faint);font-size:0.85rem;margin-bottom:1.5rem;">请输入您的 Admin Key 以继续</p>
    <div class="form-group">
      <input type="password" class="form-input" id="adminKeyInput" placeholder="Admin Key" onkeydown="if(event.key==='Enter')doLogin()">
    </div>
    <button class="btn btn-primary" style="width:100%" onclick="doLogin()">进入面板</button>
    <p id="loginError" style="color:var(--crimson);text-align:center;font-size:0.85rem;margin-top:0.8rem;display:none;">认证失败，请检查 Admin Key</p>
  </div>
</div>

<div class="container">

  <!-- Header -->
  <div class="header">
    <h1>GLM-Free-API</h1>
    <div class="subtitle">管理控制台 &middot; Management Console</div>
  </div>

  <!-- Navigation -->
  <div class="nav">
    <button class="nav-item active" onclick="showSection('dashboard')">概览</button>
    <button class="nav-item" onclick="showSection('apikeys')">API Key</button>
    <button class="nav-item" onclick="showSection('guide')">使用指南</button>
  </div>

  <!-- Dashboard Section -->
  <div class="section active" id="section-dashboard">
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-value" id="statApiKeyCount">-</div>
        <div class="stat-label">API Key</div>
      </div>
      <div class="stat-item">
        <div class="stat-value" id="statTokenCount">-</div>
        <div class="stat-label">Token 池</div>
      </div>
      <div class="stat-item">
        <div class="stat-value" style="font-size:1.3rem;padding-top:0.4rem;" id="statStatus">检测中</div>
        <div class="stat-label">服务状态</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">服务信息</div>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:0.6rem 1.2rem;font-size:0.9rem;">
        <span style="color:var(--ink-faint)">Worker 地址</span>
        <span id="workerUrl" style="font-family:monospace;font-size:0.85rem;">-</span>
        <span style="color:var(--ink-faint)">调度策略</span>
        <span>轮询（Round Robin）</span>
        <span style="color:var(--ink-faint)">管理接口</span>
        <span><span class="badge badge-online">受保护</span> 需 X-Admin-Key</span>
        <span style="color:var(--ink-faint)">协议兼容</span>
        <span>OpenAI / Claude / Gemini</span>
      </div>
    </div>

    <div class="card">
      <div class="card-title">自动补池</div>
      <p style="color:var(--ink-faint);font-size:0.85rem;margin-bottom:1rem;">系统按固定周期检查<strong>可用 Token 数量</strong>；先自动删除失效 Token，再在可用数量低于目标值时调用 chatglm.cn 游客接口补齐。部署后无需任何手动维护。</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;">
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label">启用状态</label>
          <select class="form-input" id="autoFillEnabled">
            <option value="true">启用</option>
            <option value="false">关闭</option>
          </select>
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label">目标数量</label>
          <input type="number" min="0" class="form-input" id="autoFillTarget" placeholder="例如：5">
        </div>
      </div>
      <div style="display:flex;gap:0.6rem;flex-wrap:wrap;margin-top:1rem;">
        <button class="btn btn-primary" onclick="saveAutoFillConfig()">保存配置</button>
        <button class="btn btn-secondary" onclick="runAutoFillNow()">立即检测补齐</button>
        <button class="btn btn-secondary" onclick="loadAutoFillConfig()">刷新状态</button>
      </div>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:0.6rem 1rem;font-size:0.88rem;margin-top:1.2rem;">
        <span style="color:var(--ink-faint)">Cron 轮询</span>
        <span id="autoFillCronText">-</span>
        <span style="color:var(--ink-faint)">当前状态</span>
        <span id="autoFillSummary">-</span>
        <span style="color:var(--ink-faint)">上次执行</span>
        <span id="autoFillLastRun">-</span>
      </div>
    </div>
  </div>

  <!-- API Keys Section -->
  <div class="section" id="section-apikeys">
    <div class="card">
      <div class="card-title">添加 API Key</div>
      <p style="color:var(--ink-faint);font-size:0.85rem;margin-bottom:1rem;">API Key 仅用于身份验证，所有 Key 共享同一个 Token 池。任意有效的 Key 均可调用服务。</p>
      <div class="form-group">
        <label class="form-label">API Key</label>
        <input type="text" class="form-input" id="newApiKey" placeholder="例如：sk-mykey123">
      </div>
      <div style="display:flex;gap:0.6rem;">
        <button class="btn btn-primary" onclick="addApiKey()">添加</button>
        <button class="btn btn-secondary" onclick="clearApiKeyForm()">清空</button>
      </div>
    </div>

    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.2rem;">
        <div class="card-title" style="margin:0;border:none;padding:0;">已配置 API Key</div>
        <button class="btn btn-secondary btn-sm" onclick="loadApiKeys()">刷新列表</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>API Key</th>
              <th style="text-align:right">操作</th>
            </tr>
          </thead>
          <tbody id="apiKeysTableBody">
            <tr><td colspan="2" style="text-align:center;color:var(--ink-faint)">加载中...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Guide Section -->
  <div class="section" id="section-guide">
    <div class="card">
      <div class="card-title">架构说明</div>
      <p style="color:var(--ink-light);margin-bottom:1rem;">
        本系统采用<strong>认证与资源分离</strong>的架构：
      </p>
      <ul style="color:var(--ink-light);padding-left:1.2rem;margin-bottom:1rem;">
        <li><strong>API Key</strong>：仅用于身份认证，证明你有权使用服务</li>
        <li><strong>Token 池</strong>：所有 refresh_token 组成一个共享池，系统按轮询策略自动选择可用账号</li>
      </ul>
      <p style="color:var(--ink-faint);font-size:0.85rem;">
        这意味着你可以为不同客户端分配不同的 API Key，但它们背后共享同一组智谱账号资源。
      </p>
    </div>

    <div class="card">
      <div class="card-title">OpenAI SDK 调用示例</div>
      <div class="code-block">
<span class="keyword">from</span> openai <span class="keyword">import</span> OpenAI

client = OpenAI(
    api_key=<span class="string">"your-api-key"</span>,
    base_url=<span class="string">"<span id="guideBaseUrl">https://your-domain/v1</span>"</span>
)

response = client.chat.completions.create(
    model=<span class="string">"glm-4.7"</span>,
    messages=[{<span class="string">"role"</span>: <span class="string">"user"</span>, <span class="string">"content"</span>: <span class="string">"你好"</span>}],
    stream=<span class="keyword">True</span>
)
<span class="keyword">for</span> chunk <span class="keyword">in</span> response:
    <span class="keyword">print</span>(chunk.choices[<span class="string">0</span>].delta.content <span class="keyword">or</span> <span class="string">""</span>, end=<span class="string">""</span>)
      </div>
    </div>

    <div class="card">
      <div class="card-title">curl 直接调用</div>
      <div class="code-block">
curl -X POST <span class="string">"<span id="guideCurlUrl">https://your-domain/v1/chat/completions</span>"</span> \\
  -H <span class="string">"Content-Type: application/json"</span> \\
  -H <span class="string">"Authorization: Bearer your-api-key"</span> \\
  -d <span class="string">'{"model":"glm-4.7","messages":[{"role":"user","content":"你好"}]}'</span>
      </div>
    </div>

    <div class="card">
      <div class="card-title">管理接口示例</div>
      <div class="code-block">
<span class="comment"># --- API Key 管理 ---</span>

<span class="comment"># 添加 API Key</span>
curl -X POST <span class="string">"<span class="guideAdminUrl">https://your-domain/admin/apikey</span>"</span> \\
  -H <span class="string">"X-Admin-Key: your-admin-key"</span> \\
  -d <span class="string">'{"api_key":"sk-mykey"}'</span>

<span class="comment"># 列出所有 API Key</span>
curl -X GET <span class="string">"<span class="guideAdminUrl">https://your-domain/admin/apikey</span>"</span> \\
  -H <span class="string">"X-Admin-Key: your-admin-key"</span>

<span class="comment"># 删除 API Key</span>
curl -X DELETE <span class="string">"<span class="guideAdminUrl">https://your-domain/admin/apikey</span>"</span> \\
  -H <span class="string">"X-Admin-Key: your-admin-key"</span> \\
  -d <span class="string">'{"api_key":"sk-mykey"}'</span>

<span class="comment"># --- Token 池管理 ---</span>

<span class="comment"># 添加 Token 到池子</span>
curl -X POST <span class="string">"<span class="guideAdminUrl">https://your-domain/admin/token</span>"</span> \\
  -H <span class="string">"X-Admin-Key: your-admin-key"</span> \\
  -d <span class="string">'{"refresh_token":"eyJ..."}'</span>

<span class="comment"># 列出 Token 池</span>
curl -X GET <span class="string">"<span class="guideAdminUrl">https://your-domain/admin/token</span>"</span> \\
  -H <span class="string">"X-Admin-Key: your-admin-key"</span>

<span class="comment"># 从池子删除 Token</span>
curl -X DELETE <span class="string">"<span class="guideAdminUrl">https://your-domain/admin/token</span>"</span> \
  -H <span class="string">"X-Admin-Key: your-admin-key"</span> \
  -d <span class="string">'{"id":"tk_xxx"}'</span>

<span class="comment"># --- 自动补池 ---</span>

<span class="comment"># 查看当前自动补池配置</span>
curl -X GET <span class="string">"<span class="guideAutoFillUrl">https://your-domain/admin/auto-fill</span>"</span> \
  -H <span class="string">"X-Admin-Key: your-admin-key"</span>

<span class="comment"># 更新自动补池配置</span>
curl -X POST <span class="string">"<span class="guideAutoFillUrl">https://your-domain/admin/auto-fill</span>"</span> \
  -H <span class="string">"X-Admin-Key: your-admin-key"</span> \
  -d <span class="string">'{"enabled":true,"target_count":5}'</span>

<span class="comment"># 立即执行一次检测 + 删失效 + 补齐</span>
curl -X POST <span class="string">"<span class="guideAutoFillScanUrl">https://your-domain/admin/auto-fill/scan</span>"</span> \
  -H <span class="string">"X-Admin-Key: your-admin-key"</span>
      </div>
    </div>
  </div>

</div>

<!-- Footer -->
<div style="max-width:960px;margin:0 auto;padding:0 1.5rem 2rem;">
  <div style="border-top:1px solid var(--border);padding-top:1.2rem;text-align:center;font-size:0.8rem;color:var(--ink-faint);">
    <p style="margin-bottom:0.6rem;">
      <span style="font-family:'Cinzel',serif;letter-spacing:0.08em;">Friendly Links</span>
      <span style="margin:0 0.4rem;">&middot;</span>
      <span style="font-family:'Noto Serif SC',serif;">友链</span>
    </p>
    <a href="https://linux.do/" target="_blank" rel="noreferrer" style="color:var(--gold-dark);text-decoration:none;font-weight:600;transition:color 0.2s ease;" onmouseover="this.style.color='var(--sepia)'" onmouseout="this.style.color='var(--gold-dark)'">
      LinuxDO — 让我们在一起
    </a>
  </div>
</div>

<script>
(function() {
  const ADMIN_KEY_KEY = 'glm_admin_key';
  let adminKey = localStorage.getItem(ADMIN_KEY_KEY) || '';

  function getBaseUrl() {
    return location.origin;
  }

  function $(id) { return document.getElementById(id); }

  function showToast(message, type) {
    const container = $('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  async function api(path, opts) {
    const url = getBaseUrl() + path;
    const res = await fetch(url, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminKey,
        ...(opts.headers || {})
      }
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.message || '请求失败: ' + res.status);
    }
    return data;
  }

  window.showSection = function(name) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    $('section-' + name).classList.add('active');
    event.target.classList.add('active');
    if (name === 'apikeys') loadApiKeys();
    if (name === 'dashboard') loadDashboard();
  };
  
  window.doLogin = async function() {
    const input = $('adminKeyInput');
    const key = input.value.trim();
    if (!key) return;
    try {
      await api('/admin/apikey', { method: 'GET', headers: { 'X-Admin-Key': key } });
      adminKey = key;
      localStorage.setItem(ADMIN_KEY_KEY, adminKey);
      $('loginModal').classList.remove('show');
      showToast('登录成功', 'success');
      loadDashboard();
    } catch (e) {
      $('loginError').style.display = 'block';
      input.value = '';
    }
  };
  
  window.loadDashboard = async function() {
    $('workerUrl').textContent = getBaseUrl();
    try {
      const akData = await api('/admin/apikey', { method: 'GET' });
      const apiKeys = akData.keys || [];
      $('statApiKeyCount').textContent = apiKeys.length;

      const tkData = await api('/admin/token', { method: 'GET' });
      const tokens = tkData.tokens || [];
      $('statTokenCount').textContent = tokens.length;
      $('statStatus').innerHTML = '<span class="badge badge-online">运行中</span>';
    } catch (e) {
      $('statStatus').innerHTML = '<span class="badge badge-offline">异常</span>';
    }
    loadAutoFillConfig(true);
  };
  
  // ==================== API Key Management ====================
  
  window.loadApiKeys = async function() {
    const tbody = $('apiKeysTableBody');
    tbody.innerHTML = '<tr><td colspan="2" style="text-align:center;color:var(--ink-faint)">加载中...</td></tr>';
    try {
      const data = await api('/admin/apikey', { method: 'GET' });
      const keys = data.keys || [];
      if (keys.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" style="text-align:center;color:var(--ink-faint)">暂无配置 API Key</td></tr>';
        return;
      }
      tbody.innerHTML = keys.map(function(k) {
        return '<tr data-key="' + k.api_key + '">' +
          '<td><span class="key-mask">' + maskKey(k.api_key) + '</span></td>' +
          '<td style="text-align:right">' +
            '<button class="btn btn-danger btn-sm" onclick="deleteApiKey(\\'' + k.api_key + '\\')">删除</button>' +
          '</td>' +
        '</tr>';
      }).join('');
    } catch (e) {
      tbody.innerHTML = '<tr><td colspan="2" style="text-align:center;color:var(--crimson)">加载失败: ' + e.message + '</td></tr>';
    }
  };
  
  window.addApiKey = async function() {
    const apiKey = $('newApiKey').value.trim();
    if (!apiKey) {
      showToast('请填写 API Key', 'error');
      return;
    }
    try {
      await api('/admin/apikey', { method: 'POST', body: JSON.stringify({ api_key: apiKey }) });
      showToast('API Key 添加成功', 'success');
      clearApiKeyForm();
      loadApiKeys();
      loadDashboard();
    } catch (e) {
      showToast('添加失败: ' + e.message, 'error');
    }
  };
  
  window.deleteApiKey = async function(apiKey) {
    if (!confirm('确定要删除 API Key "' + apiKey + '" 吗？此操作不可恢复。')) return;
    try {
      await api('/admin/apikey', { method: 'DELETE', body: JSON.stringify({ api_key: apiKey }) });
      showToast('删除成功', 'success');
      loadApiKeys();
      loadDashboard();
    } catch (e) {
      showToast('删除失败: ' + e.message, 'error');
    }
  };
  
  window.clearApiKeyForm = function() {
    $('newApiKey').value = '';
  };
  
  function formatDateTime(value) {
    if (!value) return '-';
    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date.toLocaleString('zh-CN', { hour12: false });
  }

  function updateAutoFillView(data) {
    const config = data.config || {};
    const status = data.status || null;
    const poolCount = typeof data.pool_count === 'number' ? data.pool_count : 0;
    const liveCount = typeof data.live_count === 'number' ? data.live_count : poolCount;

    if ($('autoFillEnabled')) $('autoFillEnabled').value = String(!!config.enabled);
    if ($('autoFillTarget')) $('autoFillTarget').value = String(config.target_count || 0);
    if ($('autoFillCronText')) $('autoFillCronText').textContent = (data.schedule?.cron || '未配置') + ' (UTC)';

    if ($('autoFillSummary')) {
      if (config.enabled) {
        $('autoFillSummary').innerHTML = '<span class="badge badge-online">已启用</span> 目标可用 ' + (config.target_count || 0) + ' &middot; 当前可用 ' + liveCount + ' &middot; 池内总数 ' + poolCount;
      } else {
        $('autoFillSummary').innerHTML = '<span class="badge badge-unknown">已关闭</span> 目标可用 ' + (config.target_count || 0) + ' &middot; 当前可用 ' + liveCount + ' &middot; 池内总数 ' + poolCount;
      }
    }

    if ($('autoFillLastRun')) {
      if (!status) {
        $('autoFillLastRun').textContent = '尚无执行记录';
      } else {
        $('autoFillLastRun').textContent = formatDateTime(status.run_at) + ' &middot; ' + (status.message || '-');
      }
    }
  }

  window.loadAutoFillConfig = async function(silent) {
    try {
      const data = await api('/admin/auto-fill', { method: 'GET' });
      updateAutoFillView(data);
    } catch (e) {
      if ($('autoFillSummary')) $('autoFillSummary').innerHTML = '<span class="badge badge-offline">读取失败</span>';
      if ($('autoFillLastRun')) $('autoFillLastRun').textContent = e.message;
      if (!silent) showToast('读取自动补池配置失败: ' + e.message, 'error');
    }
  };

  window.saveAutoFillConfig = async function() {
    const enabled = $('autoFillEnabled').value === 'true';
    const targetCount = Number($('autoFillTarget').value || '0');
    if (!Number.isFinite(targetCount) || targetCount < 0) {
      showToast('目标数量必须是大于等于 0 的整数', 'error');
      return;
    }
    try {
      const data = await api('/admin/auto-fill', {
        method: 'POST',
        body: JSON.stringify({ enabled: enabled, target_count: Math.floor(targetCount) })
      });
      updateAutoFillView(data);
      showToast('自动补池配置已保存', 'success');
      loadDashboard();
    } catch (e) {
      showToast('保存失败: ' + e.message, 'error');
    }
  };

  window.runAutoFillNow = async function() {
    try {
      const data = await api('/admin/auto-fill/scan', { method: 'POST' });
      updateAutoFillView(data);
      showToast(data.message || '自动检测补齐执行完成', 'success');
      loadDashboard();
    } catch (e) {
      showToast('执行失败: ' + e.message, 'error');
    }
  };

  function maskKey(key) {
    if (key.length <= 8) return key;
    return key.slice(0, 6) + '****' + key.slice(-4);
  }

  function init() {
    // 更新指南中的URL
    const base = getBaseUrl();
    document.querySelectorAll('#guideBaseUrl').forEach(el => el.textContent = base + '/v1');
    document.querySelectorAll('#guideCurlUrl').forEach(el => el.textContent = base + '/v1/chat/completions');
    document.querySelectorAll('.guideAdminUrl').forEach(el => el.textContent = base + '/admin/token');
    document.querySelectorAll('.guideAutoFillUrl').forEach(el => el.textContent = base + '/admin/auto-fill');
    document.querySelectorAll('.guideAutoFillScanUrl').forEach(el => el.textContent = base + '/admin/auto-fill/scan');

    if (!adminKey) {
      $('loginModal').classList.add('show');
    } else {
      // 验证存储的key是否仍有效
      api('/admin/apikey', { method: 'GET' }).then(() => {
        loadDashboard();
        loadAutoFillConfig(true);
      }).catch(() => {
        localStorage.removeItem(ADMIN_KEY_KEY);
        adminKey = '';
        $('loginModal').classList.add('show');
      });
    }
  }

  init();
})();
</script>
</body>
</html>`;
}

export function getTokenPanelHTML(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Token 管理 - GLM-Free-API</title>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Noto+Serif+SC:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --parchment: #f3ead6;
    --parchment-light: #faf5eb;
    --parchment-dark: #e8dcc4;
    --ink: #3d2b1f;
    --ink-light: #6b5344;
    --ink-faint: #9c8b7a;
    --gold: #c9a96e;
    --gold-light: #dcc092;
    --gold-dark: #a0824a;
    --sepia: #8b6914;
    --crimson: #8b3a3a;
    --green: #5a7d4a;
    --border: #d4c5a9;
    --shadow: rgba(61, 43, 31, 0.12);
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Noto Serif SC', Georgia, serif;
    background-color: var(--parchment);
    color: var(--ink);
    min-height: 100vh;
    line-height: 1.7;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E");
  }
  .container { max-width: 960px; margin: 0 auto; padding: 2rem 1.5rem; }
  .header { text-align: center; padding: 2rem 1rem 1.5rem; }
  .header h1 { font-family: 'Cinzel', serif; font-size: 1.6rem; color: var(--ink); letter-spacing: 2px; margin-bottom: 0.3rem; }
  .header p { color: var(--ink-faint); font-size: 0.9rem; }
  .back-link { display: inline-block; margin-bottom: 1rem; color: var(--gold-dark); text-decoration: none; font-size: 0.9rem; }
  .back-link:hover { color: var(--sepia); }
  .card {
    background: var(--parchment-light);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 8px var(--shadow);
  }
  .card-title {
    font-family: 'Cinzel', serif;
    font-size: 1.1rem;
    color: var(--ink);
    margin-bottom: 1rem;
    padding-bottom: 0.6rem;
    border-bottom: 1px solid var(--border);
  }
  .form-group { margin-bottom: 1rem; }
  .form-label { display: block; font-size: 0.85rem; color: var(--ink-light); margin-bottom: 0.4rem; font-weight: 600; }
  .form-textarea {
    width: 100%;
    padding: 0.7rem 0.9rem;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--parchment);
    color: var(--ink);
    font-family: inherit;
    font-size: 0.9rem;
    resize: vertical;
    min-height: 80px;
  }
  .form-textarea:focus { outline: none; border-color: var(--gold); }
  .btn {
    padding: 0.55rem 1.2rem;
    border: none;
    border-radius: 6px;
    font-family: inherit;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-primary { background: var(--ink); color: var(--parchment-light); }
  .btn-primary:hover { background: var(--ink-light); }
  .btn-secondary { background: var(--parchment-dark); color: var(--ink); border: 1px solid var(--border); }
  .btn-secondary:hover { background: var(--border); }
  .btn-danger { background: var(--crimson); color: #fff; }
  .btn-danger:hover { background: #a03030; }
  .btn-sm { padding: 0.3rem 0.7rem; font-size: 0.8rem; }
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  th, td { padding: 0.7rem 0.6rem; text-align: left; border-bottom: 1px solid var(--border); }
  th { font-weight: 600; color: var(--ink-light); font-size: 0.85rem; }
  .key-mask { font-family: monospace; font-size: 0.85rem; color: var(--ink-light); }
  code { font-size: 0.8rem; background: var(--parchment-dark); padding: 2px 6px; border-radius: 3px; }
  .badge {
    display: inline-block;
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
  }
  .badge-online { background: rgba(90, 125, 74, 0.15); color: var(--green); }
  .badge-offline { background: rgba(139, 58, 58, 0.15); color: var(--crimson); }
  .badge-unknown { background: var(--parchment-dark); color: var(--ink-faint); }
  .login-overlay {
    position: fixed; inset: 0; background: rgba(61, 43, 31, 0.45);
    display: none; align-items: center; justify-content: center; z-index: 100;
    backdrop-filter: blur(4px);
  }
  .login-overlay.show { display: flex; }
  .login-box {
    background: var(--parchment-light); border: 1px solid var(--border);
    border-radius: 10px; padding: 2rem; width: 90%; max-width: 400px;
    box-shadow: 0 8px 32px rgba(61, 43, 31, 0.2);
  }
  .login-box h2 { font-family: 'Cinzel', serif; text-align: center; margin-bottom: 1.5rem; }
  .login-input {
    width: 100%; padding: 0.7rem 0.9rem; border: 1px solid var(--border);
    border-radius: 6px; background: var(--parchment); color: var(--ink);
    font-family: inherit; font-size: 0.9rem; margin-bottom: 1rem;
  }
  .login-input:focus { outline: none; border-color: var(--gold); }
  .login-btn { width: 100%; padding: 0.7rem; background: var(--ink); color: var(--parchment-light); border: none; border-radius: 6px; font-family: inherit; cursor: pointer; }
  .login-btn:hover { background: var(--ink-light); }
  .login-error { color: var(--crimson); font-size: 0.85rem; text-align: center; margin-top: 0.8rem; display: none; }
  .toast-container { position: fixed; top: 1rem; right: 1rem; z-index: 200; display: flex; flex-direction: column; gap: 0.5rem; }
  .toast {
    padding: 0.8rem 1.2rem; border-radius: 6px; font-size: 0.9rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideIn 0.3s ease;
    max-width: 320px; word-break: break-word;
  }
  .toast-success { background: var(--green); color: #fff; }
  .toast-error { background: var(--crimson); color: #fff; }
  @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  .spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
</head>
<body>
<div class="toast-container" id="toastContainer"></div>

<div class="login-overlay" id="loginModal">
  <div class="login-box">
    <h2>Token 管理</h2>
    <p style="text-align:center;color:var(--ink-faint);font-size:0.85rem;margin-bottom:1rem;">请输入 Admin Key 继续</p>
    <input type="password" class="login-input" id="adminKeyInput" placeholder="Admin Key">
    <button class="login-btn" onclick="doLogin()">进入</button>
    <div class="login-error" id="loginError">密钥无效，请重试</div>
  </div>
</div>

<div class="container">
  <a href="/admin" class="back-link">&larr; 返回管理面板</a>
  <div class="header">
    <h1>Token 管理</h1>
    <p>查看与管理 Refresh Token 池</p>
  </div>

  <div class="card">
    <div class="card-title">添加 Refresh Token</div>
    <p style="color:var(--ink-faint);font-size:0.85rem;margin-bottom:1rem;">所有添加的 Token 会组成一个公共池，系统按轮询策略自动调度。</p>
    <div class="form-group">
      <label class="form-label">Refresh Token</label>
      <textarea class="form-textarea" id="newRefreshToken" placeholder="粘贴智谱清言的 chatglm_refresh_token..."></textarea>
    </div>
    <div style="display:flex;gap:0.6rem;">
      <button class="btn btn-primary" onclick="addToken()">添加到池</button>
      <button class="btn btn-secondary" onclick="clearTokenForm()">清空</button>
    </div>
  </div>

  <div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.2rem;">
      <div class="card-title" style="margin:0;border:none;padding:0;">Token 池列表</div>
      <button class="btn btn-secondary btn-sm" onclick="loadTokens()">刷新列表</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Token 预览</th>
            <th>状态</th>
            <th style="text-align:right">操作</th>
          </tr>
        </thead>
        <tbody id="tokensTableBody">
          <tr><td colspan="4" style="text-align:center;color:var(--ink-faint)">加载中...</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

<script>
(function() {
  const ADMIN_KEY_KEY = 'glm_admin_key';
  let adminKey = localStorage.getItem(ADMIN_KEY_KEY) || '';

  function $(id) { return document.getElementById(id); }

  function showToast(message, type) {
    const container = $('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  async function api(path, opts) {
    const url = location.origin + path;
    const res = await fetch(url, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminKey,
        ...(opts.headers || {})
      }
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.message || '请求失败: ' + res.status);
    }
    return data;
  }

  window.doLogin = async function() {
    const key = $('adminKeyInput').value.trim();
    if (!key) return;
    try {
      await api('/admin/token', { method: 'GET', headers: { 'X-Admin-Key': key } });
      adminKey = key;
      localStorage.setItem(ADMIN_KEY_KEY, adminKey);
      $('loginModal').classList.remove('show');
      showToast('登录成功', 'success');
      loadTokens();
    } catch (e) {
      $('loginError').style.display = 'block';
      $('adminKeyInput').value = '';
    }
  };

  window.loadTokens = async function() {
    const tbody = $('tokensTableBody');
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--ink-faint)">加载中...</td></tr>';
    try {
      const data = await api('/admin/token', { method: 'GET' });
      const tokens = data.tokens || [];
      if (tokens.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--ink-faint)">Token 池为空</td></tr>';
        return;
      }
      tbody.innerHTML = tokens.map(function(t) {
        return '<tr data-id="' + t.id + '">' +
          '<td><code>' + t.id + '</code></td>' +
          '<td><span class="key-mask">' + t.token_preview + '</span></td>' +
          '<td><span class="badge badge-unknown token-status-badge">未检测</span></td>' +
          '<td style="text-align:right">' +
            '<button class="btn btn-secondary btn-sm" onclick="checkToken(\\'' + t.id + '\\', this)">检测</button>' +
            '<button class="btn btn-danger btn-sm" onclick="deleteToken(\\'' + t.id + '\\')">删除</button>' +
          '</td>' +
        '</tr>';
      }).join('');
    } catch (e) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--crimson)">加载失败: ' + e.message + '</td></tr>';
    }
  };

  window.checkToken = async function(id, btn) {
    const originalText = btn.textContent;
    btn.innerHTML = '<span class="spinner"></span>';
    btn.disabled = true;
    try {
      const data = await api('/admin/token/check', { method: 'POST', body: JSON.stringify({ id: id }) });
      const row = document.querySelector('tr[data-id="' + id + '"]');
      if (row) {
        const badge = row.querySelector('.token-status-badge');
        if (data.live) {
          badge.className = 'badge badge-online token-status-badge';
          badge.textContent = '在线';
        } else {
          badge.className = 'badge badge-offline token-status-badge';
          badge.textContent = '离线';
        }
      }
      showToast(data.live ? 'Token 有效' : 'Token 已失效', data.live ? 'success' : 'error');
    } catch (e) {
      showToast('检测失败: ' + e.message, 'error');
    }
    btn.textContent = originalText;
    btn.disabled = false;
  };

  window.addToken = async function() {
    const refreshToken = $('newRefreshToken').value.trim();
    if (!refreshToken) {
      showToast('请填写 Refresh Token', 'error');
      return;
    }
    try {
      await api('/admin/token', { method: 'POST', body: JSON.stringify({ refresh_token: refreshToken }) });
      showToast('Token 已添加到池', 'success');
      $('newRefreshToken').value = '';
      loadTokens();
    } catch (e) {
      showToast('添加失败: ' + e.message, 'error');
    }
  };

  window.deleteToken = async function(id) {
    if (!confirm('确定要删除 Token "' + id + '" 吗？此操作不可恢复。')) return;
    try {
      await api('/admin/token', { method: 'DELETE', body: JSON.stringify({ id: id }) });
      showToast('删除成功', 'success');
      loadTokens();
    } catch (e) {
      showToast('删除失败: ' + e.message, 'error');
    }
  };

  window.clearTokenForm = function() {
    $('newRefreshToken').value = '';
  };

  function init() {
    if (!adminKey) {
      $('loginModal').classList.add('show');
    } else {
      api('/admin/token', { method: 'GET' }).then(() => {
        loadTokens();
      }).catch(() => {
        localStorage.removeItem(ADMIN_KEY_KEY);
        adminKey = '';
        $('loginModal').classList.add('show');
      });
    }
  }

  init();
})();
</script>
</body>
</html>`;
}

export function getChatPanelHTML(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GLM Chat</title>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Noto+Serif+SC:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --parchment: #f3ead6;
    --parchment-light: #faf5eb;
    --parchment-dark: #e8dcc4;
    --ink: #3d2b1f;
    --ink-light: #6b5344;
    --ink-faint: #9c8b7a;
    --gold: #c9a96e;
    --gold-light: #dcc092;
    --gold-dark: #a0824a;
    --sepia: #8b6914;
    --crimson: #8b3a3a;
    --green: #5a7d4a;
    --border: #d4c5a9;
    --shadow: rgba(61, 43, 31, 0.12);
    --user-bg: #e8dcc4;
    --ai-bg: #faf5eb;
    --code-bg: #f0e8d4;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Noto Serif SC', Georgia, serif;
    background-color: var(--parchment);
    color: var(--ink);
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E");
  }

  .chat-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.8rem 1.2rem;
    border-bottom: 1px solid var(--border);
    background: var(--parchment-light);
    flex-shrink: 0;
  }
  .chat-header h1 {
    font-family: 'Cinzel', serif; font-size: 1.2rem; letter-spacing: 1px;
  }
  .header-controls {
    display: flex; align-items: center; gap: 0.6rem;
  }
  .select-styled {
    padding: 0.4rem 0.7rem;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--parchment);
    color: var(--ink);
    font-family: inherit;
    font-size: 0.85rem;
    cursor: pointer;
  }
  .btn-icon {
    padding: 0.4rem 0.7rem;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--parchment-dark);
    color: var(--ink);
    font-family: inherit;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-icon:hover { background: var(--border); }

  .messages-area {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }
  .message {
    display: flex;
    gap: 0.8rem;
    max-width: 85%;
    animation: fadeIn 0.3s ease;
  }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  .message.user { align-self: flex-end; flex-direction: row-reverse; }
  .message.ai { align-self: flex-start; }
  .avatar {
    width: 32px; height: 32px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.75rem; font-weight: 700;
    flex-shrink: 0;
  }
  .avatar.user { background: var(--ink); color: var(--parchment-light); }
  .avatar.ai { background: var(--gold); color: var(--parchment-light); }
  .bubble {
    padding: 0.8rem 1rem;
    border-radius: 12px;
    font-size: 0.92rem;
    line-height: 1.7;
    word-break: break-word;
    box-shadow: 0 1px 3px var(--shadow);
  }
  .bubble.user { background: var(--user-bg); border-bottom-right-radius: 2px; }
  .bubble.ai { background: var(--ai-bg); border-bottom-left-radius: 2px; border: 1px solid var(--border); }
  .bubble pre {
    background: var(--code-bg);
    padding: 0.8rem;
    border-radius: 6px;
    overflow-x: auto;
    margin: 0.5rem 0;
    font-family: 'Courier New', monospace;
    font-size: 0.85rem;
  }
  .bubble code {
    background: var(--code-bg);
    padding: 0.15rem 0.4rem;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
    font-size: 0.85rem;
  }
  .bubble p { margin-bottom: 0.5rem; }
  .bubble p:last-child { margin-bottom: 0; }
  .bubble strong { font-weight: 700; }
  .bubble em { font-style: italic; }

  .input-area {
    border-top: 1px solid var(--border);
    background: var(--parchment-light);
    padding: 0.8rem 1.2rem;
    flex-shrink: 0;
  }
  .input-row {
    display: flex; gap: 0.6rem; align-items: flex-end;
  }
  .input-box {
    flex: 1;
    padding: 0.7rem 1rem;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--parchment);
    color: var(--ink);
    font-family: inherit;
    font-size: 0.95rem;
    resize: none;
    max-height: 120px;
    line-height: 1.5;
  }
  .input-box:focus { outline: none; border-color: var(--gold); }
  .btn-send {
    padding: 0.7rem 1.4rem;
    border: none;
    border-radius: 10px;
    background: var(--ink);
    color: var(--parchment-light);
    font-family: inherit;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
    height: fit-content;
  }
  .btn-send:hover { background: var(--ink-light); }
  .btn-send:disabled { opacity: 0.5; cursor: not-allowed; }

  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(61, 43, 31, 0.45);
    display: none; align-items: center; justify-content: center;
    z-index: 100; backdrop-filter: blur(4px);
  }
  .modal-overlay.show { display: flex; }
  .modal-box {
    background: var(--parchment-light); border: 1px solid var(--border);
    border-radius: 10px; padding: 1.5rem; width: 90%; max-width: 420px;
    box-shadow: 0 8px 32px rgba(61, 43, 31, 0.2);
  }
  .modal-box h3 { font-family: 'Cinzel', serif; margin-bottom: 1rem; }
  .form-row { margin-bottom: 1rem; }
  .form-row label { display: block; font-size: 0.85rem; color: var(--ink-light); margin-bottom: 0.3rem; }
  .form-row input, .form-row textarea, .form-row select {
    width: 100%; padding: 0.5rem 0.7rem;
    border: 1px solid var(--border); border-radius: 6px;
    background: var(--parchment); color: var(--ink);
    font-family: inherit; font-size: 0.9rem;
  }
  .form-row input:focus, .form-row textarea:focus, .form-row select:focus { outline: none; border-color: var(--gold); }
  .modal-actions { display: flex; gap: 0.6rem; justify-content: flex-end; margin-top: 1rem; }

  .toast-container { position: fixed; top: 1rem; right: 1rem; z-index: 200; display: flex; flex-direction: column; gap: 0.5rem; }
  .toast {
    padding: 0.8rem 1.2rem; border-radius: 6px; font-size: 0.9rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideIn 0.3s ease;
    max-width: 320px; word-break: break-word;
  }
  .toast-success { background: var(--green); color: #fff; }
  .toast-error { background: var(--crimson); color: #fff; }
  @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

  .thinking { display: flex; gap: 0.3rem; align-items: center; padding: 0.5rem 0; }
  .thinking span {
    width: 6px; height: 6px; background: var(--ink-faint);
    border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both;
  }
  .thinking span:nth-child(1) { animation-delay: -0.32s; }
  .thinking span:nth-child(2) { animation-delay: -0.16s; }
  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }

  .empty-state { text-align: center; color: var(--ink-faint); padding: 3rem 1rem; }
  .empty-state h3 { font-family: 'Cinzel', serif; margin-bottom: 0.5rem; color: var(--ink-light); }
</style>
</head>
<body>
<div class="toast-container" id="toastContainer"></div>

<div class="modal-overlay" id="settingsModal">
  <div class="modal-box">
    <h3>对话设置</h3>
    <div class="form-row">
      <label>API Key</label>
      <input type="password" id="apiKeyInput" placeholder="输入你的 API Key">
      <p style="font-size:0.8rem;color:var(--ink-faint);margin-top:0.3rem;">支持任意已配置的 API Key 或 Token ID</p>
    </div>
    <div class="form-row">
      <label>系统提示词 (System Prompt)</label>
      <textarea id="systemPrompt" rows="3" placeholder="例如：你是一个乐于助人的助手"></textarea>
    </div>
    <div class="modal-actions">
      <button class="btn-icon" onclick="closeSettings()">取消</button>
      <button class="btn-send" onclick="saveSettings()">保存</button>
    </div>
  </div>
</div>

<div class="chat-header">
  <h1>GLM Chat</h1>
  <div class="header-controls">
    <select class="select-styled" id="modelSelect">
      <option value="glm-4-flash">GLM-4-Flash</option>
      <option value="glm-4.7">GLM-4.7</option>
      <option value="glm-4.6">GLM-4.6</option>
      <option value="glm-4.6v">GLM-4.6V</option>
      <option value="glm-4-think">GLM-4-Think</option>
      <option value="glm-4-zero">GLM-4-Zero</option>
      <option value="glm-4-deepresearch">GLM-4-DeepResearch</option>
    </select>
    <button class="btn-icon" onclick="openSettings()">设置</button>
    <button class="btn-icon" onclick="newChat()">新对话</button>
  </div>
</div>

<div class="messages-area" id="messagesArea">
  <div class="empty-state">
    <h3>开始对话</h3>
    <p>输入消息，与 GLM 模型交流</p>
  </div>
</div>

<div class="input-area">
  <div class="input-row">
    <textarea class="input-box" id="userInput" rows="1" placeholder="输入消息..." onkeydown="handleKeydown(event)"></textarea>
    <button class="btn-send" id="sendBtn" onclick="sendMessage()">发送</button>
  </div>
</div>

<script>
(function() {
  const API_KEY_KEY = 'glm_chat_api_key';
  const SYS_PROMPT_KEY = 'glm_chat_system';
  let apiKey = localStorage.getItem(API_KEY_KEY) || '';
  let systemPrompt = localStorage.getItem(SYS_PROMPT_KEY) || '';
  let messages = [];
  let isStreaming = false;
  let abortController = null;

  function $(id) { return document.getElementById(id); }

  function showToast(message, type) {
    const container = $('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function simpleMarkdown(text) {
    text = text.replace(new RegExp("\`\`\`([\\s\\S]*?)\`\`\`", "g"), '<pre><code>$1</code></pre>');
    text = text.replace(new RegExp("\`([^\`]+)\`", "g"), '<code>$1</code>');
    text = text.replace(new RegExp("\\*\\*(.+?)\\*\\*", "g"), '<strong>$1</strong>');
    text = text.replace(new RegExp("\\*(.+?)\\*", "g"), '<em>$1</em>');
    text = text.replace(new RegExp("\\n", "g"), '<br>');
    return text;
  }

  function getBaseUrl() {
    return location.origin;
  }

  function createMessageElement(role, content, isStreaming) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message ' + role;
    const avatar = document.createElement('div');
    avatar.className = 'avatar ' + role;
    avatar.textContent = role === 'user' ? 'U' : 'AI';
    const bubble = document.createElement('div');
    bubble.className = 'bubble ' + role;
    if (isStreaming && !content) {
      bubble.innerHTML = '<div class="thinking"><span></span><span></span><span></span></div>';
    } else {
      bubble.innerHTML = simpleMarkdown(escapeHtml(content));
    }
    msgDiv.appendChild(avatar);
    msgDiv.appendChild(bubble);
    return { msgDiv, bubble };
  }

  function scrollToBottom() {
    const area = $('messagesArea');
    area.scrollTop = area.scrollHeight;
  }

  window.handleKeydown = function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  window.openSettings = function() {
    $('apiKeyInput').value = apiKey;
    $('systemPrompt').value = systemPrompt;
    $('settingsModal').classList.add('show');
  };

  window.closeSettings = function() {
    $('settingsModal').classList.remove('show');
  };

  window.saveSettings = function() {
    apiKey = $('apiKeyInput').value.trim();
    systemPrompt = $('systemPrompt').value.trim();
    localStorage.setItem(API_KEY_KEY, apiKey);
    localStorage.setItem(SYS_PROMPT_KEY, systemPrompt);
    showToast('设置已保存', 'success');
    closeSettings();
  };

  window.newChat = function() {
    if (isStreaming && abortController) {
      abortController.abort();
    }
    messages = [];
    $('messagesArea').innerHTML =
      '<div class="empty-state"><h3>开始对话</h3><p>输入消息，与 GLM 模型交流</p></div>';
  };

  window.sendMessage = async function() {
    if (isStreaming) return;
    const input = $('userInput');
    const text = input.value.trim();
    if (!text) return;

    if (!apiKey) {
      showToast('请先点击「设置」输入 API Key', 'error');
      openSettings();
      return;
    }

    const area = $('messagesArea');
    if (area.querySelector('.empty-state')) {
      area.innerHTML = '';
    }

    messages.push({ role: 'user', content: text });
    const userEl = createMessageElement('user', text, false);
    area.appendChild(userEl.msgDiv);
    input.value = '';
    input.style.height = 'auto';
    scrollToBottom();

    const reqMessages = [];
    if (systemPrompt) {
      reqMessages.push({ role: 'system', content: systemPrompt });
    }
    reqMessages.push(...messages);

    const aiEl = createMessageElement('ai', '', true);
    area.appendChild(aiEl.msgDiv);
    scrollToBottom();

    isStreaming = true;
    $('sendBtn').disabled = true;
    abortController = new AbortController();

    let fullContent = '';

    try {
      const response = await fetch(getBaseUrl() + '/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
          model: $('modelSelect').value,
          messages: reqMessages,
          stream: true
        }),
        signal: abortController.signal
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || '请求失败: ' + response.status);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const data = trimmed.slice(5).trim();
          if (data === '[DONE]') continue;
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta;
            if (delta?.content) {
              fullContent += delta.content;
              aiEl.bubble.innerHTML = simpleMarkdown(escapeHtml(fullContent));
              scrollToBottom();
            }
          } catch (e) {
            // ignore malformed JSON
          }
        }
      }

      messages.push({ role: 'assistant', content: fullContent });
      showToast('回复完成', 'success');
    } catch (err) {
      if (err.name === 'AbortError') {
        aiEl.bubble.innerHTML = simpleMarkdown(escapeHtml(fullContent || '（已中断）'));
        if (fullContent) messages.push({ role: 'assistant', content: fullContent });
      } else {
        aiEl.bubble.innerHTML = '<span style="color:var(--crimson)">出错: ' + escapeHtml(err.message) + '</span>';
        showToast(err.message, 'error');
      }
    } finally {
      isStreaming = false;
      $('sendBtn').disabled = false;
      abortController = null;
    }
  };

  $('userInput').addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
  });

  $('settingsModal').addEventListener('click', function(e) {
    if (e.target === this) closeSettings();
  });
})();
</script>
</body>
</html>`;
}