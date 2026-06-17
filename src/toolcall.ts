export interface ToolPromptParts {
  prompt: string;
  promptWithoutDescriptions: string;
  toolsText: string;
  toolNames: string[];
}

export interface ToolChoicePolicy {
  mode: "auto" | "none" | "required" | "forced";
  forcedName?: string;
}

export interface ParsedToolCalls {
  tool_calls: any[] | null;
  text: string;
}

const DSML_TOOL_OPEN = "<|DSML|tool_calls>";
const DSML_TOOL_CLOSE = "</|DSML|tool_calls>";
const DSML_INVOKE_OPEN = "<|DSML|invoke";
const DSML_INVOKE_CLOSE = "</|DSML|invoke>";
const DSML_PARAMETER_OPEN = "<|DSML|parameter";
const DSML_PARAMETER_CLOSE = "</|DSML|parameter>";

export function buildToolPromptParts(tools: any[] = [], toolChoice?: any): ToolPromptParts {
  const policy = normalizeToolChoice(toolChoice);
  if (policy.mode === "none") {
    return { prompt: "", promptWithoutDescriptions: "", toolsText: "", toolNames: [] };
  }
  const metas = selectToolsForChoice(tools, policy).map(extractToolMeta).filter((tool) => tool.name);
  const toolNames = metas.map((tool) => tool.name);
  const descriptions = metas.map((tool) => {
    const schema = JSON.stringify(tool.parameters || {});
    return `Tool: ${tool.name}\nDescription: ${tool.description || "No description available"}\nParameters: ${schema}`;
  }).join("\n\n");

  if (!descriptions) {
    return { prompt: "", promptWithoutDescriptions: "", toolsText: "", toolNames };
  }

  const instructions = buildToolInstructions(toolNames, policy);
  const prompt = `You have access to these tools:\n\n${descriptions}\n\n${instructions}`;
  const promptWithoutDescriptions = `Available tool descriptions and parameter schemas are attached in HelloGML_TOOLS.txt. Treat that file as the authoritative list of callable tools and parameters.\n\n${instructions}`;
  const toolsText = `# HelloGML_TOOLS.txt\nAvailable tool descriptions and parameter schemas for this request.\n\n${descriptions}\n`;
  return { prompt, promptWithoutDescriptions, toolsText, toolNames };
}

export function selectToolsForChoice(tools: any[] = [], toolChoice?: any): any[] {
  const policy = normalizeToolChoice(toolChoice);
  if (policy.mode === "none") return [];
  if (policy.mode !== "forced" || !policy.forcedName) return tools;
  return tools.filter((tool) => extractToolMeta(tool).name === policy.forcedName);
}

export function formatToolCallsForPrompt(raw: any): string {
  const calls = Array.isArray(raw) ? raw : [];
  const blocks: string[] = [];
  for (const call of calls) {
    const fn = call?.function || call;
    const name = String(fn?.name || call?.name || "").trim();
    if (!name) continue;
    const args = normalizeArguments(fn?.arguments ?? call?.arguments ?? call?.input ?? {});
    blocks.push(`  ${DSML_INVOKE_OPEN} name="${escapeAttr(name)}">\n${formatParameters(args, "    ")}\n  ${DSML_INVOKE_CLOSE}`);
  }
  if (blocks.length === 0) return "";
  return `${DSML_TOOL_OPEN}\n${blocks.join("\n")}\n${DSML_TOOL_CLOSE}`;
}

export function parseToolCalls(content: string): ParsedToolCalls {
  const xmlParsed = parseXMLToolCalls(content);
  if (xmlParsed.tool_calls) return xmlParsed;
  return parseJSONToolCalls(content);
}

export function isToolCallStartOrPrefix(text: string): boolean {
  const trimmed = text.trimStart();
  if (!trimmed) return true;
  const starts = [DSML_TOOL_OPEN, "<tool_calls>"];
  return starts.some((marker) => marker.startsWith(trimmed) || trimmed.startsWith(marker));
}

export function isDefiniteToolCallStart(text: string): boolean {
  const trimmed = text.trimStart();
  return trimmed.startsWith(DSML_TOOL_OPEN) || trimmed.startsWith("<tool_calls>");
}

function buildToolInstructions(toolNames: string[], policy: ToolChoicePolicy): string {
  const examples = buildExamples(toolNames);
  const choiceRule = toolChoiceRule(policy);
  return `TOOL CALL FORMAT - FOLLOW EXACTLY:

${DSML_TOOL_OPEN}
  ${DSML_INVOKE_OPEN} name="TOOL_NAME_HERE">
    ${DSML_PARAMETER_OPEN} name="PARAMETER_NAME"><![CDATA[PARAMETER_VALUE]]>${DSML_PARAMETER_CLOSE}
  ${DSML_INVOKE_CLOSE}
${DSML_TOOL_CLOSE}

RULES:
1. Use the ${DSML_TOOL_OPEN} wrapper when calling tools.
2. Put the tool name in the invoke name attribute.
3. Put every top-level argument in a ${DSML_PARAMETER_OPEN} name="ARG_NAME"> node.
4. Wrap string values in <![CDATA[...]]>, especially code, file content, paths, prompts, and shell commands.
5. Objects use nested XML elements. Arrays repeat <item> children.
6. Numbers, booleans, and null stay plain text.
7. Use only tool names and parameter names from the current tool schema.
8. Do not output placeholder, empty, or whitespace-only required parameters.
9. If a required value is unknown, ask the user or answer normally instead of emitting an empty tool call.
10. Do not wrap the XML in markdown fences. Do not add explanations before or after a tool call.
11. If you call a tool, the first non-whitespace characters of the response must be exactly ${DSML_TOOL_OPEN}.
${choiceRule}

Compatibility note: the runtime also accepts legacy <tool_calls>/<invoke>/<parameter>, but prefer the DSML form above.
${examples}`;
}

function normalizeToolChoice(toolChoice: any): ToolChoicePolicy {
  if (!toolChoice || toolChoice === "auto") return { mode: "auto" };
  if (toolChoice === "none") return { mode: "none" };
  if (toolChoice === "required" || toolChoice === "any") return { mode: "required" };
  const type = String(toolChoice.type || "").toLowerCase();
  if (type === "none") return { mode: "none" };
  if (type === "required" || type === "any") return { mode: "required" };
  const forcedName = toolChoice.function?.name || toolChoice.name;
  if ((type === "function" || type === "tool") && forcedName) {
    return { mode: "forced", forcedName: String(forcedName).trim() };
  }
  return { mode: "auto" };
}

function toolChoiceRule(policy: ToolChoicePolicy): string {
  if (policy.mode === "required") {
    return "12. For this response, you MUST call at least one available tool.";
  }
  if (policy.mode === "forced" && policy.forcedName) {
    return `12. For this response, you MUST call exactly this tool: ${policy.forcedName}. Do not call any other tool.`;
  }
  return "";
}

function buildExamples(toolNames: string[]): string {
  const name = firstKnownExampleName(toolNames);
  if (!name) return "";
  const params = exampleParams(name);
  return `
CORRECT EXAMPLE:
${DSML_TOOL_OPEN}
  ${DSML_INVOKE_OPEN} name="${name}">
${params}
  ${DSML_INVOKE_CLOSE}
${DSML_TOOL_CLOSE}
`;
}

function firstKnownExampleName(toolNames: string[]): string {
  return toolNames.find((name) => !!exampleParams(name)) || toolNames[0] || "";
}

function exampleParams(name: string): string {
  switch (name) {
    case "Bash":
    case "execute_command":
      return `    ${DSML_PARAMETER_OPEN} name="command"><![CDATA[pwd]]>${DSML_PARAMETER_CLOSE}`;
    case "exec_command":
      return `    ${DSML_PARAMETER_OPEN} name="cmd"><![CDATA[pwd]]>${DSML_PARAMETER_CLOSE}`;
    case "Read":
      return `    ${DSML_PARAMETER_OPEN} name="file_path"><![CDATA[README.md]]>${DSML_PARAMETER_CLOSE}`;
    case "read_file":
      return `    ${DSML_PARAMETER_OPEN} name="path"><![CDATA[README.md]]>${DSML_PARAMETER_CLOSE}`;
    case "Write":
      return `    ${DSML_PARAMETER_OPEN} name="file_path"><![CDATA[notes.txt]]>${DSML_PARAMETER_CLOSE}\n    ${DSML_PARAMETER_OPEN} name="content"><![CDATA[Hello world]]>${DSML_PARAMETER_CLOSE}`;
    case "write_to_file":
      return `    ${DSML_PARAMETER_OPEN} name="path"><![CDATA[notes.txt]]>${DSML_PARAMETER_CLOSE}\n    ${DSML_PARAMETER_OPEN} name="content"><![CDATA[Hello world]]>${DSML_PARAMETER_CLOSE}`;
    default:
      return `    ${DSML_PARAMETER_OPEN} name="input"><![CDATA[value]]>${DSML_PARAMETER_CLOSE}`;
  }
}

function extractToolMeta(tool: any): { name: string; description: string; parameters: any } {
  const fn = tool?.function || tool || {};
  return {
    name: String(fn.name || "").trim(),
    description: String(fn.description || ""),
    parameters: fn.parameters || fn.input_schema || fn.inputSchema || fn.schema || {},
  };
}

function normalizeArguments(raw: any): any {
  if (typeof raw !== "string") return raw || {};
  const trimmed = raw.trim();
  if (!trimmed) return {};
  try {
    return JSON.parse(trimmed);
  } catch {
    return { content: raw };
  }
}

function formatParameters(value: any, indent: string): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return `${indent}${DSML_PARAMETER_OPEN} name="value">${formatValue(value)}${DSML_PARAMETER_CLOSE}`;
  }
  return Object.keys(value).sort().map((key) => {
    return `${indent}${DSML_PARAMETER_OPEN} name="${escapeAttr(key)}">${formatValue(value[key])}${DSML_PARAMETER_CLOSE}`;
  }).join("\n");
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map((item) => `<item>${formatNestedValue(item)}</item>`).join("");
  if (typeof value === "object") return Object.keys(value).sort().map((key) => `<${safeXMLName(key)}>${formatNestedValue(value[key])}</${safeXMLName(key)}>`).join("");
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return cdata(String(value));
}

function formatNestedValue(value: any): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map((item) => `<item>${formatNestedValue(item)}</item>`).join("");
  if (typeof value === "object") return Object.keys(value).sort().map((key) => `<${safeXMLName(key)}>${formatNestedValue(value[key])}</${safeXMLName(key)}>`).join("");
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return cdata(String(value));
}

function safeXMLName(name: string): string {
  const trimmed = String(name || "").trim();
  return /^[A-Za-z_][A-Za-z0-9_.:-]*$/.test(trimmed) ? trimmed : "field";
}

function cdata(text: string): string {
  return `<![CDATA[${text.replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;
}

function escapeAttr(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function parseXMLToolCalls(content: string): ParsedToolCalls {
  const stripped = stripFencedCodeBlocks(content || "");
  const normalized = normalizeToolMarkup(stripped);
  const block = extractFirstTagBlock(normalized, "tool_calls");
  if (!block) return { tool_calls: null, text: content };

  const toolCalls: any[] = [];
  let rest = block.inner;
  while (true) {
    const invoke = extractFirstTagBlock(rest, "invoke");
    if (!invoke) break;
    const name = getAttr(invoke.openTag, "name");
    if (name) {
      const args: Record<string, any> = {};
      let params = invoke.inner;
      while (true) {
        const param = extractFirstTagBlock(params, "parameter");
        if (!param) break;
        const paramName = getAttr(param.openTag, "name");
        if (paramName) args[paramName] = parseParameterValue(param.inner);
        params = params.slice(param.end);
      }
      toolCalls.push(toOpenAIToolCall(name, args, toolCalls.length));
    }
    rest = rest.slice(invoke.end);
  }

  if (toolCalls.length === 0) return { tool_calls: null, text: content };
  const text = normalized.slice(0, block.start) + normalized.slice(block.end);
  return { tool_calls: toolCalls, text: text.trim() };
}

function normalizeToolMarkup(text: string): string {
  return text
    .replaceAll("<|DSML|tool_calls>", "<tool_calls>")
    .replaceAll("</|DSML|tool_calls>", "</tool_calls>")
    .replaceAll("<|DSML|invoke", "<invoke")
    .replaceAll("</|DSML|invoke>", "</invoke>")
    .replaceAll("<|DSML|parameter", "<parameter")
    .replaceAll("</|DSML|parameter>", "</parameter>");
}

function extractFirstTagBlock(text: string, tag: string): { start: number; end: number; openTag: string; inner: string } | null {
  const openRe = new RegExp(`<${tag}\\b[^>]*>`, "i");
  const openMatch = openRe.exec(text);
  if (!openMatch || openMatch.index === undefined) return null;
  const start = openMatch.index;
  const openTag = openMatch[0];
  const innerStart = start + openTag.length;
  const close = findCloseTagOutsideCDATA(text, tag, innerStart);
  if (!close) return null;
  const end = close.index + close.length;
  return { start, end, openTag, inner: text.slice(innerStart, close.index) };
}

function findCloseTagOutsideCDATA(text: string, tag: string, from: number): { index: number; length: number } | null {
  const closeRe = new RegExp(`</${tag}>`, "ig");
  closeRe.lastIndex = from;
  while (true) {
    const match = closeRe.exec(text);
    if (!match || match.index === undefined) return null;
    if (!isInsideCDATA(text, match.index)) return { index: match.index, length: match[0].length };
  }
}

function isInsideCDATA(text: string, index: number): boolean {
  const open = text.lastIndexOf("<![CDATA[", index);
  if (open < 0) return false;
  const close = text.lastIndexOf("]]>", index);
  return close < open;
}

function getAttr(tag: string, name: string): string {
  const re = new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");
  const match = tag.match(re);
  return decodeEntities(match?.[2] || match?.[3] || match?.[4] || "").trim();
}

function parseParameterValue(raw: string): any {
  const value = unwrapCDATA(raw.trim());
  if (value === "") return "";
  if (/<item[\s>]/i.test(value)) {
    const items: any[] = [];
    let rest = value;
    while (true) {
      const item = extractFirstTagBlock(rest, "item");
      if (!item) break;
      items.push(parseParameterValue(item.inner));
      rest = rest.slice(item.end);
    }
    if (items.length > 0) return items;
  }
  if (/^[-]?\d+(\.\d+)?$/.test(value)) return Number(value);
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  try {
    return JSON.parse(value);
  } catch {
    return decodeEntities(value);
  }
}

function unwrapCDATA(text: string): string {
  const match = text.match(/^<!\[CDATA\[([\s\S]*)\]\]>$/);
  return match ? match[1] : text;
}

function toOpenAIToolCall(name: string, args: Record<string, any>, idx: number): any {
  return {
    id: `call_${Math.random().toString(36).slice(2, 11)}_${idx}`,
    type: "function",
    function: { name, arguments: JSON.stringify(args) },
  };
}

function stripFencedCodeBlocks(text: string): string {
  return text.replace(/```[\s\S]*?```/g, "").replace(/~~~[\s\S]*?~~~/g, "");
}

function parseJSONToolCalls(content: string): ParsedToolCalls {
  if (!content || !content.trim()) return { tool_calls: null, text: content };
  let working = content.trim();
  const codeBlockMatch = working.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) working = codeBlockMatch[1].trim();

  const braceMatch = extractJsonObject(working, "tool_calls");
  if (braceMatch) {
    try {
      const parsed = JSON.parse(braceMatch);
      const calls = normalizeJSONToolCalls(parsed.tool_calls);
      if (calls) {
        let text = content.replace(braceMatch, "").trim();
        if (codeBlockMatch) text = content.replace(codeBlockMatch[0], "").trim();
        return { tool_calls: calls, text };
      }
    } catch {}
  }

  try {
    const fixed = working
      .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":')
      .replace(/:\s*'([^']*)'/g, ':"$1"');
    const parsed = JSON.parse(fixed);
    const calls = normalizeJSONToolCalls(parsed.tool_calls);
    if (calls) {
      let text = content.replace(working, "").trim();
      if (codeBlockMatch) text = content.replace(codeBlockMatch[0], "").trim();
      return { tool_calls: calls, text };
    }
  } catch {}

  return { tool_calls: null, text: content };
}

function normalizeJSONToolCalls(raw: any): any[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  return raw.map((tc: any, idx: number) => ({
    id: tc.id || `call_${Math.random().toString(36).slice(2, 11)}_${idx}`,
    type: "function",
    function: {
      name: tc.name || tc.function?.name || "",
      arguments: typeof tc.arguments === "string"
        ? tc.arguments
        : typeof tc.function?.arguments === "string"
          ? tc.function.arguments
          : JSON.stringify(tc.arguments || tc.function?.arguments || {}),
    },
  })).filter((tc: any) => tc.function.name);
}

function extractJsonObject(str: string, key: string): string | null {
  const idx = str.indexOf(`"${key}"`);
  if (idx === -1) return null;
  let start = idx;
  while (start > 0 && str[start] !== "{") start--;
  if (str[start] !== "{") return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < str.length; i++) {
    const ch = str[i];
    if (escape) { escape = false; continue; }
    if (ch === "\\") { escape = true; continue; }
    if (ch === '"' && !escape) { inString = !inString; continue; }
    if (inString) continue;
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return str.slice(start, i + 1);
    }
  }
  return null;
}

function decodeEntities(text: string): string {
  return text
    .replaceAll("&quot;", '"')
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
}
