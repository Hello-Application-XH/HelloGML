export const WELCOME_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>GLM Free API — 服务已启动</title>
  <style>
    :root{ --bg:#F7FAFF; --surface:#FFFFFF; --text:#111827; --muted:#4B5563; --subtle:#6B7280; --border:#D7E2F3; --primary:#667eea; --primary-2:#764ba2; --accent:#0EA5E9; --success:#10B981; --warning:#EF4444; --radius-lg:14px; --radius-md:10px; --radius-sm:8px; --shadow-1:0 2px 0 rgba(17,24,39,0.04); --shadow-2:0 6px 14px rgba(17,24,39,0.06); --grid:24px; }
    *,*::before,*::after{box-sizing:border-box}
    html,body{height:100%}
    body{ margin:0; font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Noto Sans SC",system-ui,sans-serif; color:var(--text); line-height:1.7; background: linear-gradient(180deg,var(--bg),#F5F8FF); }
    body::before{ content:""; position:fixed; inset:0; pointer-events:none; background-image: linear-gradient(rgba(17,24,39,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(17,24,39,0.015) 1px, transparent 1px); background-size:var(--grid) var(--grid), var(--grid) var(--grid); mix-blend-mode:multiply; }
    .shell{max-width:1120px;margin:0 auto;padding:0 24px}
    .nav{ position:sticky; top:0; z-index:50; background:rgba(247,250,255,0.88); backdrop-filter:saturate(1.05) blur(8px); border-bottom:1px solid var(--border); }
    .nav .shell{display:flex;align-items:center;justify-content:space-between;padding:12px 0}
    .brand{display:flex;align-items:center;gap:10px;font-weight:800}
    .logo{ width:26px;height:26px;border-radius:6px; background:linear-gradient(135deg,var(--primary),var(--primary-2)); }
    .nav-links{display:flex;gap:16px}
    .nav-links a{ color:var(--muted); text-decoration:none; font-weight:600; padding:8px 10px; border-radius:8px; transition:background-color .15s ease, color .15s ease; }
    .nav-links a:hover{color:var(--text); background:#EEF4FF}
    .cta{display:flex;gap:10px}
    .btn{ display:inline-flex; align-items:center; justify-content:center; height:36px; padding:0 14px; border-radius:10px; border:1px solid var(--border); background:var(--surface); color:var(--text); font-weight:700; box-shadow:var(--shadow-1); text-decoration:none; cursor:pointer; transition:transform .12s ease, box-shadow .12s ease, border-color .12s ease; }
    .btn:hover{transform:translateY(-1px); box-shadow:var(--shadow-2); border-color:#C9D8EE}
    .btn.primary{background:linear-gradient(90deg,var(--primary),var(--primary-2)); color:#fff; border:none}
    .hero{padding:36px 0 18px}
    .hero-inner{ display:grid; grid-template-columns:1fr; gap:18px; align-items:center; }
    .hero-title{margin:0 0 8px; font-size:clamp(28px,4.2vw,42px); font-weight:900; letter-spacing:.2px}
    .hero-desc{color:var(--muted); margin:0 0 16px}
    .hero-actions{display:flex;gap:10px;flex-wrap:wrap}
    .stats{display:flex;gap:18px;flex-wrap:wrap;margin-top:10px}
    .stat{ display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--border); border-radius:10px;background:#FAFCFF;font-weight:700;color:#1F2937; }
    .stat .dot{width:8px;height:8px;border-radius:50%;background:var(--accent)}
    .section{margin:24px 0}
    .hd{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:10px}
    .hd h2{margin:0; font-size:20px; font-weight:800; letter-spacing:.1px}
    .hd p{margin:0;color:var(--subtle)}
    .grid{display:grid; grid-template-columns:repeat(4,1fr); gap:12px}
    @media (max-width:1024px){ .grid{grid-template-columns:repeat(3,1fr)} }
    @media (max-width:768px){ .grid{grid-template-columns:repeat(2,1fr)} }
    @media (max-width:520px){ .grid{grid-template-columns:1fr} }
    .block{ border:1px solid var(--border); background:var(--surface); border-radius:var(--radius-md); padding:14px 16px; transition:border-color .12s ease, background-color .12s ease; }
    .block:hover{border-color:#C9D8EE; background:#FBFDFF}
    .block h3{margin:0 0 6px; font-size:16px; font-weight:800}
    .block p{margin:0; color:var(--muted); font-size:14px}
    .block .line{ width:100%; height:6px; border-radius:4px; margin-bottom:10px; background:linear-gradient(90deg,var(--primary),var(--primary-2)); }
    .timeline{ position:relative; padding-left:28px; border-left:2px solid var(--border); }
    .step{ margin:0 0 18px; position:relative; }
    .step::before{ content:""; position:absolute; left:-10px; top:2px; width:10px; height:10px; border-radius:50%; background:var(--primary); box-shadow:0 0 0 3px #E7F0FF; }
    .step h3{margin:0 0 6px; font-size:16px; font-weight:800}
    .step p{margin:0 0 8px; color:var(--muted)}
    .code{ font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,"Cascadia Code","Roboto Mono",Consolas,"Courier New"; font-size:13px; color:#0F172A; background:#F7FAFF; border:1px solid var(--border); border-radius:var(--radius-sm); padding:10px 12px; overflow:auto; }
    .api-grid{display:grid; grid-template-columns:repeat(3,1fr); gap:12px}
    @media (max-width:900px){ .api-grid{grid-template-columns:repeat(2,1fr)} }
    @media (max-width:640px){ .api-grid{grid-template-columns:1fr} }
    .api-item .path{font-family:ui-monospace,Menlo,Consolas; font-size:13px; color:#1F2937}
    .tag{ display:inline-flex; align-items:center; gap:6px; padding:4px 8px; border:1px solid var(--border); border-radius:999px; background:#F2F7FF; color:#1F2937; font-weight:700; font-size:12px; margin-top:8px; }
    .tag .dot{width:8px;height:8px;border-radius:50%;background:var(--accent)}
    .label{color:var(--subtle); font-weight:700; font-size:12px; margin-top:6px}
    .warn{ border:1px solid #FAD1D6; border-left:4px solid var(--warning); background:#FFF7F7; border-radius:var(--radius-md); padding:14px 16px; }
    .warn h3{margin:0 0 6px; color:#8B1C24}
    .warn p{margin:0; color:#6B1A20}
    .service-status{ display:flex; align-items:center; justify-content:center; gap:10px; background:#EAF7EF; border:1px solid #CDE9D6; border-left:4px solid #4CAF50; color:#1F5E2E; padding:14px 16px; font-weight:800; position:sticky; top:0; z-index:100; margin-top:12px; margin-bottom:0; border-radius:10px; box-shadow:0 6px 14px rgba(17,24,39,0.06); transform:translateY(-120%); opacity:0; transition:transform .36s cubic-bezier(0.22, 1, 0.36, 1), opacity .24s ease; }
    .service-status.visible{ transform:translateY(0); opacity:1; }
    .service-status:hover{ box-shadow:0 10px 22px rgba(17,24,39,0.08); }
    .service-status .status-dot{ width:10px; height:10px; background:#4CAF50; border-radius:50%; display:inline-block; margin-right:6px; animation:pulse 2s infinite; box-shadow:0 0 0 3px rgba(76,175,80,0.16); }
    .service-status .label{ font-weight:800; color:#1F5E2E; letter-spacing:0.2px; font-size:14px; line-height:1.3; }
    .service-status .close-btn{ position:absolute; right:12px; top:50%; transform:translateY(-50%); display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:8px; border:1px solid #CDE9D6; background:#F4FBF6; color:#2E7D32; cursor:pointer; font-weight:800; font-size:16px; line-height:1; transition:background-color .15s ease, border-color .15s ease, transform .12s ease; }
    .service-status .close-btn:hover{ background:#E6F6EC; border-color:#BEE3CA; transform:translateY(-50%) scale(1.02); }
    @keyframes pulse{ 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
    .token-display{ background:linear-gradient(135deg, #e6fffa 0%, #b2f5ea 100%); color:#234e52; padding:6px 10px; border-radius:6px; font-family:'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace; font-size:12px; border:1px solid #81e6d9; display:inline-block; margin:2px; box-shadow:0 2px 4px rgba(0, 0, 0, 0.05); }
    .method-step{ background:#FAFCFF; border:1px solid var(--border); border-radius:var(--radius-md); padding:16px; margin:12px 0; transition:all .12s ease; }
    .method-step:hover{ border-color:#C9D8EE; background:#FBFDFF; }
    .method-step h4{ margin:0 0 8px; font-size:15px; font-weight:800; color:var(--text); display:flex; align-items:center; gap:8px; }
    .method-number{ width:24px;height:24px;border-radius:6px; background:linear-gradient(135deg,var(--primary),var(--primary-2)); color:white;display:flex;align-items:center;justify-content:center; font-size:12px;font-weight:800; }
    .method-step ul{ margin:8px 0 0 0;padding-left:0;list-style:none; }
    .method-step li{ padding:6px 0;color:var(--muted);font-size:14px; position:relative;padding-left:16px; }
    .method-step li::before{ content:"•";position:absolute;left:0;color:var(--primary);font-weight:800; }
    .method-step img{ max-width:100%;height:auto;border-radius:8px;margin:12px 0; box-shadow:0 4px 12px rgba(0,0,0,0.1); }
  </style>
</head>
<body>
  <main class="shell">
    <div class="service-status" id="serviceStatus" role="status" aria-live="polite">
      <span class="status-dot" aria-hidden="true"></span>
      <span class="label">GLM-Free-API (Cloudflare Worker) 服务已启动</span>
      <button class="close-btn" id="serviceStatusClose" aria-label="关闭提示" title="关闭提示">×</button>
    </div>
    <section class="hero">
      <div class="hero-inner">
        <div>
          <h1 class="hero-title">面向开发者的 GLM API 代理</h1>
          <p class="hero-desc">兼容 OpenAI / Gemini / Claude 协议，基于 Cloudflare Worker 部署，零服务器成本。</p>
          <div class="hero-actions">
            <a class="btn primary" href="#guide">快速接入</a>
            <a class="btn" href="#apis">查看接口</a>
          </div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="warn">
        <h3>⚠️ 免责声明</h3>
        <p><strong>逆向 API 存在不稳定性。建议前往 <a href="https://open.bigmodel.cn/" target="_blank" rel="noreferrer">智谱开放平台</a> 付费使用，避免封禁风险。</strong></p>
        <p><strong>本项目仅用于研究学习，不接受任何资金往来。仅限自用，禁止商用或对外提供服务。</strong></p>
      </div>
    </section>
    <section id="features" class="section">
      <div class="hd"><h2>核心特性</h2></div>
      <div class="grid">
        <div class="block"><div class="line" aria-hidden="true"></div><h3>流式输出</h3><p>毫秒级首字节，边生成边传输，提升交互性能。</p></div>
        <div class="block"><div class="line" aria-hidden="true"></div><h3>多轮对话</h3><p>上下文记忆与压缩，保证长对话的稳定响应。</p></div>
        <div class="block"><div class="line" aria-hidden="true"></div><h3>联网检索</h3><p>实时信息聚合，提升回答的时效与准确性。</p></div>
        <div class="block"><div class="line" aria-hidden="true"></div><h3>多协议兼容</h3><p>同时支持 OpenAI、Gemini、Claude 三种 API 格式。</p></div>
      </div>
    </section>
    <section id="guide" class="section">
      <div class="hd"><h2>接入指南</h2></div>
      <div class="timeline">
        <div class="step">
          <h3>01 · 从智谱清言获取 Token</h3>
          <p>登录 <a href="https://chatglm.cn/main/alltoolsdetail" target="_blank" rel="noreferrer">智谱清言</a>，在 Cookies 中找到 chatglm_refresh_token。</p>
          <pre class="code">Authorization: Bearer YOUR_REFRESH_TOKEN</pre>
        </div>
        <div class="step">
          <h3>02 · 智能体接入（可选）</h3>
          <p>打开智能体聊天界面，地址栏的 ID 即 model 参数值。</p>
        </div>
        <div class="step">
          <h3>03 · 多账号轮询</h3>
          <p>将多个 Token 用逗号拼接，服务自动挑选一个执行。</p>
          <pre class="code">Authorization: Bearer TOKEN1,TOKEN2,TOKEN3</pre>
        </div>
        <div class="step">
          <h3>04 · 客户端接入</h3>
          <p>使用 OpenAI SDK、gemini-cli、claude-code 或 Dify 等工具接入。</p>
          <pre class="code">curl -X POST /v1/chat/completions \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{ "model":"glm-4", "messages":[{"role":"user","content":"Hello"}] }'</pre>
        </div>
      </div>
    </section>
    <section id="apis" class="section">
      <div class="hd"><h2>接口兼容性</h2></div>
      <div class="api-grid">
        <div class="block api-item"><h3>OpenAI 兼容</h3><div class="path">/v1/chat/completions</div><span class="tag"><span class="dot"></span> 推荐</span></div>
        <div class="block api-item"><h3>Google Gemini 兼容</h3><div class="path">/v1beta/models/:model:generateContent</div><span class="tag"><span class="dot"></span> gemini-cli</span></div>
        <div class="block api-item"><h3>Anthropic Claude 兼容</h3><div class="path">/v1/messages</div><span class="tag"><span class="dot"></span> claude-code</span></div>
      </div>
    </section>
    <section id="models" class="section">
      <div class="hd"><h2>支持模型</h2></div>
      <div class="grid">
        <div class="block"><div class="line" aria-hidden="true"></div><h3>GLM-4.7</h3><p>高智能旗舰 - 通用对话、推理与智能体能力全面升级。</p><div class="label">用途 · 高性能推理 / 编码 / 智能体</div></div>
        <div class="block"><div class="line" aria-hidden="true"></div><h3>GLM-4.6v</h3><p>超强性能 - 上下文提升至200K - 高级编码与工具调用。</p><div class="label">用途 · 高性能推理 / 编码 / 工具调用</div></div>
        <div class="block"><div class="line" aria-hidden="true"></div><h3>GLM-4.6</h3><p>超强性能 - 上下文提升至200K - 高级编码与工具调用。</p><div class="label">用途 · 高性能推理 / 编码 / 工具调用</div></div>
      </div>
    </section>
    <section id="ecosystem" class="section">
      <div class="hd"><h2>客户端生态</h2><p>覆盖聊天、命令行与应用开发场景。</p></div>
      <div class="grid">
        <div class="block"><h3>LobeChat</h3><p>现代化聊天界面。</p></div>
        <div class="block"><h3>NextChat</h3><p>简洁多平台客户端。</p></div>
        <div class="block"><h3>Dify</h3><p>AI 应用开发平台。</p></div>
        <div class="block"><h3>OpenAI SDK</h3><p>直接编程接入。</p></div>
        <div class="block"><h3>ChatBox</h3><p>桌面端聊天工具。</p></div>
        <div class="block"><h3>继续探索</h3><p>更多客户端持续适配中。</p></div>
      </div>
    </section>
    <section id="links" class="section">
      <div class="hd"><h2>友情链接</h2></div>
      <div class="grid">
        <a href="https://linux.do/" target="_blank" rel="noreferrer" class="block" style="text-decoration:none;color:inherit;">
          <h3>LinuxDO</h3>
          <p>让我们在一起 · 中文开发者社区</p>
        </a>
      </div>
    </section>
    <br></br>
  </main>
  <script>
    (function(){
      const bar = document.getElementById('serviceStatus');
      const closeBtn = document.getElementById('serviceStatusClose');
      if(!bar || !closeBtn) return;
      requestAnimationFrame(() => { bar.classList.add('visible'); });
      closeBtn.addEventListener('click', () => {
        bar.classList.remove('visible');
        const onEnd = () => { bar.style.display = 'none'; bar.removeEventListener('transitionend', onEnd); };
        bar.addEventListener('transitionend', onEnd);
      }, { passive: true });
    })();
  </script>
</body>
</html>`;
