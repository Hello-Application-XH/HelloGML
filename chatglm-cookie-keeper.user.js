// ==UserScript==
// @name         chatglm cookie keeper - glm2api 保活
// @namespace    glm2api.cookie.keeper
// @version      1.0.0
// @description  在 chatglm.cn 页面后台定期抓取最新的 ssxmod_itna / ssxmod_itna2 风控 cookie，推送到 glm2api Worker 的 /admin/cookie 端点，保持 token 池 cookie 保鲜。2026-10 新防护后，核心对话接口（backend-api/assistant/stream）必须携带这两个 cookie（时窗约 10-15 分钟，服务端无法自行生成）。
// @author       glm2api
// @match        https://chatglm.cn/*
// @match        https://chatglm.cn/*/*
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      *
// ==/UserScript==

(function () {
  "use strict";

  // ======== 配置区：改成你自己的 Worker 地址和管理密钥 ========
  const WORKER_URL = "https://your-worker.example.workers.dev"; // 你的 glm2api Worker 地址
  const ADMIN_KEY = "";                                          // 环境变量 ADMIN_KEY 的值；未设置可留空
  const PUSH_INTERVAL_MS = 8 * 60 * 1000;                        // 推送间隔：8 分钟（ssxmod 时窗约 10-15 分钟，留足余量）
  // ===========================================================

  const LOG_PREFIX = "[glm2api-keeper]";

  function log(...args) {
    console.log(LOG_PREFIX, ...args);
  }

  // 从 document.cookie 提取需要的 cookie（ssxmod 由页面 JS 写入，非 HttpOnly，可读取）
  function collectCookies() {
    const wanted = ["ssxmod_itna", "ssxmod_itna2"];
    const jar = {};
    document.cookie.split(";").forEach((pair) => {
      const eq = pair.indexOf("=");
      if (eq <= 0) return;
      const k = pair.slice(0, eq).trim();
      const v = pair.slice(eq + 1).trim();
      if (wanted.includes(k) && v) jar[k] = v;
    });
    return jar;
  }

  function pushCookie() {
    const jar = collectCookies();
    if (!jar.ssxmod_itna || !jar.ssxmod_itna2) {
      log("页面上尚未生成 ssxmod cookie，等待下次推送");
      return;
    }
    const cookieStr = Object.entries(jar).map(([k, v]) => `${k}=${v}`).join("; ");
    log("推送 cookie（长度 " + cookieStr.length + "）->", WORKER_URL + "/admin/cookie");

    GM_xmlhttpRequest({
      method: "POST",
      url: WORKER_URL.replace(/\/+$/, "") + "/admin/cookie",
      headers: {
        "Content-Type": "application/json",
        ...(ADMIN_KEY ? { "X-Admin-Key": ADMIN_KEY } : {}),
      },
      data: JSON.stringify({ cookie: cookieStr }),
      timeout: 15000,
      onload(res) {
        if (res.status === 200) {
          log("推送成功:", res.responseText);
          GM_setValue("lastPushAt", Date.now());
        } else {
          log("推送失败:", res.status, res.responseText);
        }
      },
      onerror(err) {
        log("推送出错:", err && err.statusText);
      },
      ontimeout() {
        log("推送超时");
      },
    });
  }

  // 页面加载后先推一次，然后定时推送
  setTimeout(pushCookie, 3000);
  setInterval(pushCookie, PUSH_INTERVAL_MS);

  log("已启动，目标:", WORKER_URL, "间隔:", PUSH_INTERVAL_MS / 60000, "分钟");
})();
