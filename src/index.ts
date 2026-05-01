import { setSignSecret } from "./chat.ts";
import {
  createCompletion,
  createCompletionStream,
  generateImages,
  generateVideos,
  getTokenLiveStatus,
} from "./chat.ts";
import {
  createClaudeCompletion,
  createGeminiCompletion,
} from "./adapters.ts";
import {
  defaultTo,
  isString,
  unixTimestamp,
} from "./utils.ts";
import { WELCOME_HTML } from "./welcome.ts";
import { getAdminPanelHTML } from "./admin-panel.ts";

export interface Env {
  SIGN_SECRET?: string;
  ADMIN_KEY?: string;
  GLM_TOKENS: KVNamespace;
}

const SUPPORTED_MODELS = [
  { id: "glm5", name: "GLM-5", object: "model", owned_by: "glm-free-api", description: "GLM-5 通用对话模型" },
];

const GEMINI_MODELS = [
  { name: "models/gemini-1.5-pro", displayName: "Gemini 1.5 Pro", description: "Most capable model for complex reasoning tasks", inputTokenLimit: 2097152, outputTokenLimit: 8192, supportedGenerationMethods: ["generateContent", "streamGenerateContent"] },
  { name: "models/gemini-1.5-flash", displayName: "Gemini 1.5 Flash", description: "Fast model for high throughput", inputTokenLimit: 1048576, outputTokenLimit: 8192, supportedGenerationMethods: ["generateContent", "streamGenerateContent"] },
  { name: "models/gemini-pro", displayName: "Gemini Pro", description: "Previous generation model", inputTokenLimit: 32768, outputTokenLimit: 2048, supportedGenerationMethods: ["generateContent", "streamGenerateContent"] },
  { name: "models/glm-5", displayName: "GLM-5", description: "GLM-5 chat model via adapter", inputTokenLimit: 32768, outputTokenLimit: 8192, supportedGenerationMethods: ["generateContent", "streamGenerateContent"] },
];

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "*",
  };
}

function extractAPIKeys(request: Request): string[] {
  let auth = request.headers.get("authorization") || request.headers.get("x-api-key") || "";
  if (!auth) return [];
  if (!auth.toLowerCase().startsWith("bearer ")) auth = "Bearer " + auth;
  return auth.slice(7).split(",").map((t) => t.trim()).filter(Boolean);
}

async function verifyAPIKey(kv: KVNamespace, apiKey: string): Promise<boolean> {
  const val = await kv.get(`ak:${apiKey}`);
  return val !== null;
}

async function getTokenPool(kv: KVNamespace): Promise<{ id: string; token: string }[]> {
  const list = await kv.list({ prefix: "rt:" });
  const tokens: { id: string; token: string }[] = [];
  for (const key of list.keys) {
    const token = await kv.get(key.name);
    if (token) tokens.push({ id: key.name.replace("rt:", ""), token });
  }
  return tokens;
}

let tokenRoundRobinIndex = 0;

function selectTokenFromPool(tokens: { id: string; token: string }[]): string | null {
  if (tokens.length === 0) return null;
  const idx = tokenRoundRobinIndex % tokens.length;
  tokenRoundRobinIndex++;
  return tokens[idx].token;
}

async function authenticate(request: Request, env: Env): Promise<string> {
  const apiKeys = extractAPIKeys(request);
  if (apiKeys.length === 0) throw new Error("Missing Authorization header");

  let validKey = false;
  for (const apiKey of apiKeys) {
    if (await verifyAPIKey(env.GLM_TOKENS, apiKey)) {
      validKey = true;
      break;
    }
  }
  if (!validKey) throw new Error("Invalid API key");

  const pool = await getTokenPool(env.GLM_TOKENS);
  if (pool.length === 0) throw new Error("No refresh tokens available in pool");

  const token = selectTokenFromPool(pool);
  if (!token) throw new Error("Failed to select token from pool");
  return token;
}

function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ code: -1, message, data: null }, status);
}

function sseResponse(stream: ReadableStream): Response {
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      ...corsHeaders(),
    },
  });
}

// ==================== Handlers ====================

async function handleChatCompletions(request: Request, env: Env): Promise<Response> {
  const refreshToken = await authenticate(request, env);
  const body = (await request.json()) as any;

  if (!Array.isArray(body.messages)) throw new Error("messages must be an array");

  const { model, conversation_id: convId, messages, stream, tools, tool_choice } = body;
  if (stream) {
    const glmStream = await createCompletionStream(messages, refreshToken, model, convId, 0, tools);
    return sseResponse(glmStream);
  } else {
    const result = await createCompletion(messages, refreshToken, model, convId, 0, tools);
    return jsonResponse(result);
  }
}

async function handleClaudeMessages(request: Request, env: Env): Promise<Response> {
  const refreshToken = await authenticate(request, env);
  const body = (await request.json()) as any;

  if (!Array.isArray(body.messages)) throw new Error("messages must be an array");

  const { model, messages, system, stream, conversation_id: convId, tools } = body;
  const result = await createClaudeCompletion(model, messages, system, refreshToken, stream, convId, tools);
  if (stream && result instanceof ReadableStream) {
    return sseResponse(result);
  }
  return jsonResponse(result);
}

async function handleGeminiModels(): Promise<Response> {
  return jsonResponse({ models: GEMINI_MODELS });
}

async function handleGeminiGenerateContent(request: Request, path: string, env: Env): Promise<Response> {
  const refreshToken = await authenticate(request, env);
  const body = (await request.json()) as any;

  const modelMatch = path.match(/^\/v1beta\/models\/(.+):generateContent$/);
  const model = modelMatch ? modelMatch[1] : "gemini-pro";
  const { contents, systemInstruction, conversation_id: convId } = body;
  const result = await createGeminiCompletion(model, contents, systemInstruction, refreshToken, false, convId);
  return jsonResponse(result);
}

async function handleGeminiStreamGenerateContent(request: Request, path: string, env: Env): Promise<Response> {
  const refreshToken = await authenticate(request, env);
  const body = (await request.json()) as any;

  const modelMatch = path.match(/^\/v1beta\/models\/(.+):streamGenerateContent$/);
  const model = modelMatch ? modelMatch[1] : "gemini-pro";
  const { contents, systemInstruction, conversation_id: convId } = body;
  const result = await createGeminiCompletion(model, contents, systemInstruction, refreshToken, true, convId);
  if (result instanceof ReadableStream) {
    return sseResponse(result);
  }
  return jsonResponse(result);
}

async function handleImageGenerations(request: Request, env: Env): Promise<Response> {
  const refreshToken = await authenticate(request, env);
  const body = (await request.json()) as any;

  if (!isString(body.prompt)) throw new Error("prompt must be a string");
  const prompt = body.prompt;
  const responseFormat = defaultTo(body.response_format, "url");
  const assistantId = /^[a-z0-9]{24,}$/.test(body.model) ? body.model : undefined;
  const imageUrls = await generateImages(assistantId, prompt, refreshToken);

  let data: any[];
  if (responseFormat == "b64_json") {
    data = (await Promise.all(imageUrls.map((url: string) => fetchBase64(url)))).map((b64) => ({ b64_json: b64 }));
  } else {
    data = imageUrls.map((url: string) => ({ url }));
  }
  return jsonResponse({ created: unixTimestamp(), data });
}

async function fetchBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function handleVideoGenerations(request: Request, env: Env): Promise<Response> {
  const refreshToken = await authenticate(request, env);
  const body = (await request.json()) as any;

  if (!isString(body.prompt)) throw new Error("prompt must be a string");
  const {
    model,
    conversation_id: convId,
    prompt,
    image_url: imageUrl,
    video_style: videoStyle = "",
    emotional_atmosphere: emotionalAtmosphere = "",
    mirror_mode: mirrorMode = "",
    audio_id: audioId,
  } = body;

  const validStyles = ["卡通3D", "黑白老照片", "油画", "电影感"];
  const validEmotions = ["温馨和谐", "生动活泼", "紧张刺激", "凄凉寂寞"];
  const validMirrors = ["水平", "垂直", "推近", "拉远"];
  if (videoStyle && !validStyles.includes(videoStyle)) throw new Error(`video_style must be one of ${validStyles.join("/")}`);
  if (emotionalAtmosphere && !validEmotions.includes(emotionalAtmosphere)) throw new Error(`emotional_atmosphere must be one of ${validEmotions.join("/")}`);
  if (mirrorMode && !validMirrors.includes(mirrorMode)) throw new Error(`mirror_mode must be one of ${validMirrors.join("/")}`);

  const data = await generateVideos(model, prompt, refreshToken, {
    imageUrl: imageUrl || "",
    videoStyle,
    emotionalAtmosphere,
    mirrorMode,
    audioId: audioId || "",
  }, convId);
  return jsonResponse({ created: unixTimestamp(), data });
}

async function handleModels(): Promise<Response> {
  return jsonResponse({ data: SUPPORTED_MODELS });
}

async function handleTokenCheck(request: Request, env: Env): Promise<Response> {
  const refreshToken = await authenticate(request, env);
  const live = await getTokenLiveStatus(refreshToken);
  return jsonResponse({ live });
}

// ==================== Admin Handlers ====================

async function handleAdminAPIKey(request: Request, env: Env): Promise<Response> {
  const adminKey = request.headers.get("X-Admin-Key") || "";
  if (env.ADMIN_KEY && adminKey !== env.ADMIN_KEY) {
    return errorResponse("Unauthorized: invalid admin key", 401);
  }

  if (request.method === "POST") {
    const body = (await request.json()) as any;
    const apiKey = body.api_key;
    if (!apiKey) return errorResponse("Missing api_key", 400);
    await env.GLM_TOKENS.put(`ak:${apiKey}`, "1");
    return jsonResponse({ success: true, message: "API key added successfully" });
  }

  if (request.method === "GET") {
    const list = await env.GLM_TOKENS.list({ prefix: "ak:" });
    const keys = list.keys.map((k) => ({
      api_key: k.name.replace("ak:", ""),
    }));
    return jsonResponse({ keys });
  }

  if (request.method === "DELETE") {
    const body = (await request.json()) as any;
    const apiKey = body.api_key;
    if (!apiKey) return errorResponse("Missing api_key", 400);
    await env.GLM_TOKENS.delete(`ak:${apiKey}`);
    return jsonResponse({ success: true, message: "API key deleted successfully" });
  }

  return errorResponse("Method not allowed", 405);
}

async function handleAdminToken(request: Request, env: Env): Promise<Response> {
  const adminKey = request.headers.get("X-Admin-Key") || "";
  if (env.ADMIN_KEY && adminKey !== env.ADMIN_KEY) {
    return errorResponse("Unauthorized: invalid admin key", 401);
  }

  if (request.method === "POST") {
    const body = (await request.json()) as any;
    const refreshToken = body.refresh_token;
    if (!refreshToken) return errorResponse("Missing refresh_token", 400);
    const id = body.id || `tk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await env.GLM_TOKENS.put(`rt:${id}`, refreshToken);
    return jsonResponse({ success: true, message: "Token added to pool", id });
  }

  if (request.method === "GET") {
    const pool = await getTokenPool(env.GLM_TOKENS);
    return jsonResponse({ tokens: pool.map((t) => ({ id: t.id, token_preview: t.token.slice(0, 8) + "****" + t.token.slice(-4) })) });
  }

  if (request.method === "DELETE") {
    const body = (await request.json()) as any;
    const id = body.id;
    if (!id) return errorResponse("Missing id", 400);
    await env.GLM_TOKENS.delete(`rt:${id}`);
    return jsonResponse({ success: true, message: "Token removed from pool" });
  }

  return errorResponse("Method not allowed", 405);
}

async function handleAdminTokenCheck(request: Request, env: Env): Promise<Response> {
  const adminKey = request.headers.get("X-Admin-Key") || "";
  if (env.ADMIN_KEY && adminKey !== env.ADMIN_KEY) {
    return errorResponse("Unauthorized: invalid admin key", 401);
  }

  const body = (await request.json()) as any;
  const id = body.id;
  if (!id) return errorResponse("Missing id", 400);

  const refreshToken = await env.GLM_TOKENS.get(`rt:${id}`);
  if (!refreshToken) return errorResponse("Token not found", 404);

  const live = await getTokenLiveStatus(refreshToken);
  return jsonResponse({ id, live });
}

// ==================== Main Export ====================

export default {
  async fetch(request: Request, env: Env, _ctx: any): Promise<Response> {
    if (env.SIGN_SECRET) setSignSecret(env.SIGN_SECRET);

    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    try {
      let response: Response;

      if (path === "/" && request.method === "GET") {
        response = new Response(WELCOME_HTML, {
          headers: { "Content-Type": "text/html", ...corsHeaders() },
        });
      } else if (path === "/admin" && request.method === "GET") {
        response = new Response(getAdminPanelHTML(), {
          headers: { "Content-Type": "text/html", ...corsHeaders() },
        });
      } else if (path === "/v1/chat/completions" && request.method === "POST") {
        response = await handleChatCompletions(request, env);
      } else if (path === "/v1/messages" && request.method === "POST") {
        response = await handleClaudeMessages(request, env);
      } else if (path === "/v1beta/models" && request.method === "GET") {
        response = await handleGeminiModels();
      } else if (path.match(/^\/v1beta\/models\/[^:]+:generateContent$/) && request.method === "POST") {
        response = await handleGeminiGenerateContent(request, path, env);
      } else if (path.match(/^\/v1beta\/models\/[^:]+:streamGenerateContent$/) && request.method === "POST") {
        response = await handleGeminiStreamGenerateContent(request, path, env);
      } else if (path === "/v1/images/generations" && request.method === "POST") {
        response = await handleImageGenerations(request, env);
      } else if (path === "/v1/videos/generations" && request.method === "POST") {
        response = await handleVideoGenerations(request, env);
      } else if (path === "/v1/models" && request.method === "GET") {
        response = await handleModels();
      } else if (path === "/ping" && request.method === "GET") {
        response = new Response("pong", { headers: corsHeaders() });
      } else if (path === "/token/check" && request.method === "POST") {
        response = await handleTokenCheck(request, env);
      } else if (path === "/admin/apikey") {
        response = await handleAdminAPIKey(request, env);
      } else if (path === "/admin/token") {
        response = await handleAdminToken(request, env);
      } else if (path === "/admin/token/check" && request.method === "POST") {
        response = await handleAdminTokenCheck(request, env);
      } else {
        const message = `[请求有误]: 正确请求为 POST -> /v1/chat/completions，当前请求为 ${request.method} -> ${path} 请纠正`;
        response = errorResponse(message, 404);
      }

      return response;
    } catch (err: any) {
      console.error(err);
      return errorResponse(err.message || "Internal error", 500);
    }
  },
};
