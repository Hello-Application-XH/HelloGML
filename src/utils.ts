/**
 * 通用工具函数（替代原项目的 util.ts + lodash 常用功能）
 */

export function uuid(separator = true): string {
  const id = crypto.randomUUID();
  return separator ? id : id.replace(/-/g, "");
}

export async function md5(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("MD5", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function unixTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

export function timestamp(): number {
  return Date.now();
}

export function encodeBASE64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decodeBASE64(str: string): string {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export async function fetchFileBASE64(url: string): Promise<string> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function isBASE64Data(value: string): boolean {
  return typeof value === "string" && /^data:/.test(value);
}

export function extractBASE64DataFormat(value: string): string | null {
  const match = value.trim().match(/^data:(.+);base64,/);
  return match ? match[1] : null;
}

export function removeBASE64DataHeader(value: string): string {
  return value.replace(/^data:(.+);base64,/, "");
}

export function buildDataBASE64(type: string, ext: string, buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:${type}/${ext.replace("jpg", "jpeg")};base64,${btoa(binary)}`;
}

const MIME_MAP: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  mp4: "video/mp4",
  webm: "video/webm",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  pdf: "application/pdf",
  txt: "text/plain",
  json: "application/json",
  html: "text/html",
};

export function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return MIME_MAP[ext] || "application/octet-stream";
}

export function getExtension(mimeType: string): string | null {
  for (const [ext, mime] of Object.entries(MIME_MAP)) {
    if (mime === mimeType) return ext;
  }
  return null;
}

export function basename(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    return pathname.split("/").pop() || "unknown";
  } catch {
    return "unknown";
  }
}

export function urlJoin(...values: string[]): string {
  let url = "";
  for (let i = 0; i < values.length; i++) {
    url += `${i > 0 ? "/" : ""}${values[i].replace(/^\/*/, "").replace(/\/*$/, "")}`;
  }
  return url;
}

export function isURL(value: any): boolean {
  return typeof value === "string" && /^(http|https)/.test(value);
}

export function randomChoice<T>(arr: T[]): T | undefined {
  if (!arr || arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 轻量类型判断（替代 lodash）
export function isString(value: any): boolean {
  return typeof value === "string";
}

export function isArray(value: any): boolean {
  return Array.isArray(value);
}

export function isObject(value: any): boolean {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function isUndefined(value: any): boolean {
  return value === undefined;
}

export function isNumber(value: any): boolean {
  return typeof value === "number" && !isNaN(value);
}

export function isFiniteNumber(value: any): boolean {
  return isNumber(value) && isFinite(value);
}

export function isFunction(value: any): boolean {
  return typeof value === "function";
}

export function defaultTo<T>(value: T | undefined | null, defaultValue: T): T {
  return value == null ? defaultValue : value;
}

export function get(obj: any, path: string): any {
  return path.split(".").reduce((o, k) => o?.[k], obj);
}

export function pickBy(obj: any, predicate: (value: any, key: string) => boolean): any {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (predicate(value, key)) result[key] = value;
  }
  return result;
}

export function attempt<T>(fn: () => T): T | Error {
  try {
    return fn();
  } catch (err) {
    return err instanceof Error ? err : new Error(String(err));
  }
}

export function isError(value: any): boolean {
  return value instanceof Error;
}
