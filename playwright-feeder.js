#!/usr/bin/env node
/**
 * ChatGLM Token Pool Feeder
 * 持续监控 token 池，自动从 chatglm.cn 采集新 token 补充，保持池中始终有 POOL_TARGET 个可用 token。
 *
 * 启动前先安装浏览器（只需一次）：
 *   npx playwright install chromium
 *
 * 运行：
 *   node playwright-feeder.js
 *
 * 后台常驻：
 *   nohup node playwright-feeder.js >> feeder.log 2>&1 &
 */

const { chromium } = require("playwright");

// ==================== 配置 ====================
const WORKER_URL = process.env.WORKER_URL || "https://glm-free-api-worker.wangyixuan2009.workers.dev";
const ADMIN_KEY  = process.env.ADMIN_KEY  || "sjfjjfifjlsoheohsoncobnoda00202022549984588";
const POOL_TARGET     = parseInt(process.env.POOL_TARGET || "10");
const CHECK_INTERVAL  = parseInt(process.env.CHECK_INTERVAL || "60000");   // ms，默认 1 分钟
const HARVEST_TIMEOUT = parseInt(process.env.HARVEST_TIMEOUT || "30000"); // 单次采集超时
// ===============================================

function log(...args) {
  console.log(`[${new Date().toISOString()}]`, ...args);
}

async function adminGet(path) {
  const res = await fetch(`${WORKER_URL}${path}`, {
    headers: { "X-Admin-Key": ADMIN_KEY },
  });
  if (!res.ok) throw new Error(`Admin GET ${path} failed: ${res.status}`);
  return res.json();
}

async function adminPost(path, body) {
  const res = await fetch(`${WORKER_URL}${path}`, {
    method: "POST",
    headers: { "X-Admin-Key": ADMIN_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Admin POST ${path} failed: ${res.status}`);
  return res.json();
}

async function getPoolSize() {
  const data = await adminGet("/admin/token");
  return (data.tokens || []).length;
}

async function addToken(refreshToken) {
  return adminPost("/admin/token", { refresh_token: refreshToken });
}

/**
 * 打开一个全新的浏览器上下文，访问 chatglm.cn，
 * 从 API 响应或 localStorage 中提取 refresh_token。
 */
async function harvestOneToken() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    // 全新上下文 = 新的匿名用户
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    ignoreHTTPSErrors: true,
    // 通过 Cloudflare WARP SOCKS5 代理，避免 VPS IP 被封
    proxy: { server: "socks5://127.0.0.1:40000" },
  });

  let capturedToken = null;

  // 优先：拦截认证端点的响应，从中取 refresh_token
  context.on("response", async (response) => {
    if (capturedToken) return;
    const url = response.url();
    if (!url.includes("chatglm.cn")) return;
    if (!url.includes("/user-api/") && !url.includes("/user/")) return;
    try {
      const data = await response.json().catch(() => null);
      if (!data) return;
      const token =
        data?.result?.refresh_token ||
        data?.data?.refresh_token   ||
        data?.refresh_token;
      if (token && token.length > 20) {
        capturedToken = token;
        log("  ✓ 从响应中捕获 refresh_token");
      }
    } catch (_) {}
  });

  // 次选：拦截发往认证端点的请求，从 Authorization 头取 refresh_token
  context.on("request", (request) => {
    if (capturedToken) return;
    const url = request.url();
    if (!url.includes("chatglm.cn")) return;
    if (!url.includes("/user/refresh") && !url.includes("/user-api/user/refresh")) return;
    const auth = request.headers()["authorization"] || "";
    if (auth.startsWith("Bearer ")) {
      const token = auth.slice(7);
      if (token.length > 20) {
        capturedToken = token;
        log("  ✓ 从请求头中捕获 refresh_token");
      }
    }
  });

  const page = await context.newPage();
  const timer = setTimeout(async () => {
    await browser.close().catch(() => {});
  }, HARVEST_TIMEOUT + 5000);

  try {
    await page.goto("https://chatglm.cn", {
      waitUntil: "networkidle",
      timeout: HARVEST_TIMEOUT,
    });

    // 等待页面初始化完成，触发 token 刷新
    await page.waitForTimeout(3000);

    // 兜底：扫描 localStorage
    if (!capturedToken) {
      capturedToken = await page.evaluate(() => {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!key) continue;
          const raw = localStorage.getItem(key);
          if (!raw) continue;
          const lk = key.toLowerCase();
          if (!lk.includes("token") && !lk.includes("auth") && !lk.includes("user")) continue;
          try {
            const obj = JSON.parse(raw);
            if (obj?.refresh_token) return obj.refresh_token;
            if (obj?.token && typeof obj.token === "string" && obj.token.length > 20)
              return obj.token;
          } catch {
            if (raw.length > 20 && raw.length < 512 && !raw.startsWith("{"))
              return raw;
          }
        }
        return null;
      });
      if (capturedToken) log("  ✓ 从 localStorage 中捕获 token");
    }
  } finally {
    clearTimeout(timer);
    await browser.close().catch(() => {});
  }

  return capturedToken;
}

async function runFeeder() {
  log(`Token Feeder 启动。目标池大小: ${POOL_TARGET}，检查间隔: ${CHECK_INTERVAL / 1000}s`);
  log(`Worker: ${WORKER_URL}`);

  while (true) {
    try {
      const size = await getPoolSize();
      log(`池大小: ${size} / ${POOL_TARGET}`);

      if (size < POOL_TARGET) {
        const needed = POOL_TARGET - size;
        log(`需要补充 ${needed} 个 token，开始采集...`);

        for (let i = 0; i < needed; i++) {
          log(`  采集第 ${i + 1}/${needed} 个...`);
          try {
            const token = await harvestOneToken();
            if (token) {
              const result = await addToken(token);
              log(`  ✓ 添加成功，id: ${result.id}`);
            } else {
              log(`  ✗ 未能捕获 token，跳过`);
            }
          } catch (err) {
            log(`  ✗ 采集出错: ${err.message}`);
          }
        }
      }
    } catch (err) {
      log(`主循环出错: ${err.message}`);
    }

    await new Promise((resolve) => setTimeout(resolve, CHECK_INTERVAL));
  }
}

runFeeder().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
