/**
 * Node.js / Linux 独立运行入口（无需 Cloudflare）
 *
 * 复用 src/index.ts 的全部路由与业务逻辑，仅做两层兼容：
 *   1. crypto.subtle.digest("MD5") —— CF Worker 支持 MD5，Node webcrypto 不支持，转接 node:crypto
 *   2. caches.default + KVNamespace —— 分别用内存 Cache 与文件持久化 KV 模拟
 *
 * 运行（Node 22.6+）：
 *   node --experimental-strip-types server.ts
 *
 * 环境变量：
 *   PORT          监听端口（默认 8000）
 *   SIGN_SECRET   请求签名密钥（默认与 CF Worker 相同）
 *   ADMIN_KEY     /admin/* 接口保护密钥（默认 changeme）
 *   GLM_KV_FILE   token 池持久化文件（默认 ./data/glm-tokens.json）
 */

import http from "node:http";
import { webcrypto } from "node:crypto";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ==================== 兼容层 1：MD5 ====================
// CF Workers 的 crypto.subtle 支持非标准 MD5，Node 不支持，这里转接到 node:crypto
const nodeSubtle = {
  async digest(algo: string | { name: string }, data: ArrayBuffer | Uint8Array): Promise<ArrayBuffer> {
    const name = typeof algo === "string" ? algo : algo?.name;
    if (String(name).toUpperCase() === "MD5") {
      const buf = data instanceof Uint8Array ? data : new Uint8Array(data);
      return createHash("md5").update(buf).digest();
    }
    return webcrypto.subtle.digest(algo as AlgorithmIdentifier, data as ArrayBuffer);
  },
  importKey: webcrypto.subtle.importKey.bind(webcrypto.subtle),
  exportKey: webcrypto.subtle.exportKey.bind(webcrypto.subtle),
  sign: webcrypto.subtle.sign.bind(webcrypto.subtle),
  verify: webcrypto.subtle.verify.bind(webcrypto.subtle),
  deriveBits: webcrypto.subtle.deriveBits.bind(webcrypto.subtle),
  deriveKey: webcrypto.subtle.deriveKey.bind(webcrypto.subtle),
  encrypt: webcrypto.subtle.encrypt.bind(webcrypto.subtle),
  decrypt: webcrypto.subtle.decrypt.bind(webcrypto.subtle),
  generateKey: webcrypto.subtle.generateKey.bind(webcrypto.subtle),
  wrapKey: webcrypto.subtle.wrapKey.bind(webcrypto.subtle),
  unwrapKey: webcrypto.subtle.unwrapKey.bind(webcrypto.subtle),
};

Object.defineProperty(globalThis.crypto, "subtle", { value: nodeSubtle, configurable: true });

// ==================== 兼容层 2：caches.default ====================
const cacheStore = new Map<string, Response>();
(globalThis as any).caches = {
  default: {
    async match(key: Request | string): Promise<Response | undefined> {
      const url = typeof key === "string" ? key : key.url;
      const hit = cacheStore.get(url);
      return hit ? hit.clone() : undefined;
    },
    async put(key: Request | string, value: Response): Promise<void> {
      const url = typeof key === "string" ? key : key.url;
      cacheStore.set(url, value.clone());
    },
    async delete(key: Request | string): Promise<boolean> {
      const url = typeof key === "string" ? key : key.url;
      return cacheStore.delete(url);
    },
  },
};

// ==================== 兼容层 3：内存 KV（文件持久化） ====================
const KV_FILE = process.env.GLM_KV_FILE || join(__dirname, "data", "glm-tokens.json");

function loadKV(): Record<string, string> {
  try {
    if (existsSync(KV_FILE)) return JSON.parse(readFileSync(KV_FILE, "utf8"));
  } catch {}
  return {};
}

class FileKV {
  private store: Map<string, string>;

  constructor() {
    this.store = new Map(Object.entries(loadKV()));
  }

  private save() {
    try {
      mkdirSync(dirname(KV_FILE), { recursive: true });
      writeFileSync(KV_FILE, JSON.stringify(Object.fromEntries(this.store), null, 2));
    } catch (err: any) {
      console.error("[kv] persist failed:", err.message);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.store.has(key) ? (this.store.get(key) as string) : null;
  }

  async put(key: string, value: string): Promise<void> {
    this.store.set(key, value);
    this.save();
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
    this.save();
  }

  async list(options: { prefix?: string } = {}): Promise<{ keys: { name: string }[] }> {
    const prefix = options.prefix ?? "";
    const keys = [...this.store.keys()].filter((k) => k.startsWith(prefix)).map((name) => ({ name }));
    return { keys };
  }
}

// ==================== Env ====================
const env = {
  SIGN_SECRET: process.env.SIGN_SECRET || "8a1317a7468aa3ad86e997d08f3f31cb",
  ADMIN_KEY: process.env.ADMIN_KEY || "changeme",
  GLM_TOKENS: new FileKV() as unknown as KVNamespace,
};

// ==================== HTTP Server ====================
const workerMod = await import("./src/index.ts");
const worker = workerMod.default as { fetch(request: Request, env: any, ctx: any): Promise<Response> };

const PORT = Number(process.env.PORT || 8000);

function readBody(req: http.IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const host = req.headers.host || `localhost:${PORT}`;
    const url = new URL(req.url || "/", `http://${host}`);
    const body = ["GET", "HEAD"].includes(req.method || "") ? undefined : await readBody(req);

    const request = new Request(url.toString(), {
      method: req.method,
      headers: req.headers as unknown as HeadersInit,
      body: body,
      // Node fetch 规范要求流式 body 显式声明 duplex；此处 body 为完整 Buffer，无需 duplex
    });

    const response = await worker.fetch(request, env, { waitUntil: () => {}, passThroughOnException: () => {} });

    const headers: Record<string, string | string[]> = {};
    response.headers.forEach((v, k) => {
      headers[k] = v;
    });

    res.writeHead(response.status, headers);

    if (!response.body) {
      res.end();
      return;
    }
    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
    res.end();
  } catch (err: any) {
    console.error("[server] request error:", err.stack || err.message);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "application/json" });
    }
    res.end(JSON.stringify({ code: -1, message: err.message || "Internal error", data: null }));
  }
});

server.listen(PORT, () => {
  console.log(`[glm-free-api-node] listening on http://0.0.0.0:${PORT}`);
  console.log(`[glm-free-api-node] token pool file: ${KV_FILE}`);
  console.log(`[glm-free-api-node] ADMIN_KEY: ${env.ADMIN_KEY === "changeme" ? "changeme (默认值，请修改!)" : "已设置"}`);
});
