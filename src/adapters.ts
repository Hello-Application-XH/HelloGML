import { uuid, isArray, isObject, isString } from "./utils.ts";
import { createParser } from "./sse.ts";
import {
  createCompletion,
  createCompletionStream,
} from "./chat.ts";

const MODEL_NAME = "glm";

// ==================== Claude Adapter ====================

export function convertClaudeToGLM(messages: any[], system?: string | any[]): any[] {
  const glmMessages: any[] = [];
  let systemText: string | undefined;
  if (system) {
    if (Array.isArray(system)) {
      systemText = system.filter((item: any) => item.type === "text").map((item: any) => item.text).join("\n");
    } else if (typeof system === "string") {
      systemText = system;
    }
  }
  let systemPrepended = false;
  for (const msg of messages) {
    if (msg.role === "user") {
      let content = msg.content ?? "";
      if (isArray(content)) {
        const texts: string[] = [];
        for (const item of content) {
          if (item.type === "text") texts.push(item.text);
          if (item.type === "tool_result") {
            texts.push(`工具调用结果 (${item.tool_use_id || ""}):\n${typeof item.content === "string" ? item.content : JSON.stringify(item.content)}`);
          }
        }
        content = texts.join("\n");
      }
      if (systemText && !systemPrepended) {
        content = `${systemText}\n\n${content}`;
        systemPrepended = true;
      }
      glmMessages.push({ role: "user", content });
    } else if (msg.role === "assistant") {
      let content = msg.content ?? "";
      if (isArray(content)) {
        const texts: string[] = [];
        for (const item of content) {
          if (item.type === "text") texts.push(item.text);
          if (item.type === "tool_use") {
            texts.push(`工具调用: ${item.name}\n参数: ${JSON.stringify(item.input || {})}`);
          }
        }
        content = texts.join("\n");
      }
      glmMessages.push({ role: "assistant", content });
    }
  }
  return glmMessages;
}

function convertClaudeToolsToOpenAI(tools: any[]): any[] {
  return tools.map((tool: any) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.input_schema || tool.parameters || {},
    },
  }));
}

export function convertGLMToClaude(glmResponse: any): any {
  const message = glmResponse.choices[0].message;
  const content: any[] = [];
  if (message.content) {
    content.push({ type: "text", text: message.content });
  }
  if (message.tool_calls) {
    for (const tc of message.tool_calls) {
      content.push({
        type: "tool_use",
        id: tc.id,
        name: tc.function.name,
        input: typeof tc.function.arguments === "string" ? JSON.parse(tc.function.arguments) : tc.function.arguments,
      });
    }
  }
  let stopReason = "end_turn";
  if (glmResponse.choices[0].finish_reason === "tool_calls") stopReason = "tool_use";
  else if (glmResponse.choices[0].finish_reason !== "stop") stopReason = "max_tokens";
  return {
    id: glmResponse.id || uuid(),
    type: "message",
    role: "assistant",
    content,
    model: MODEL_NAME,
    stop_reason: stopReason,
    stop_sequence: null,
    usage: {
      input_tokens: glmResponse.usage?.prompt_tokens || 0,
      output_tokens: glmResponse.usage?.completion_tokens || 0,
    },
  };
}

export function convertGLMStreamToClaude(glmStream: ReadableStream): ReadableStream {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      const reader = glmStream.getReader();
      const decoder = new TextDecoder();
      const messageId = uuid();
      let isFirstChunk = true;

      const parser = createParser((event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.choices && data.choices[0]) {
            const delta = data.choices[0].delta;
            if (isFirstChunk) {
              controller.enqueue(encoder.encode(`event: message_start\ndata: ${JSON.stringify({
                type: "message_start",
                message: {
                  id: messageId, type: "message", role: "assistant", content: [],
                  model: MODEL_NAME, stop_reason: null, stop_sequence: null,
                  usage: { input_tokens: 0, output_tokens: 0 },
                },
              })}\n\n`));
              controller.enqueue(encoder.encode(`event: content_block_start\ndata: ${JSON.stringify({
                type: "content_block_start", index: 0, content_block: { type: "text", text: "" },
              })}\n\n`));
              isFirstChunk = false;
            }
            if (delta.content) {
              controller.enqueue(encoder.encode(`event: content_block_delta\ndata: ${JSON.stringify({
                type: "content_block_delta", index: 0, delta: { type: "text_delta", text: delta.content },
              })}\n\n`));
            }
            if (data.choices[0].finish_reason) {
              controller.enqueue(encoder.encode(`event: content_block_stop\ndata: ${JSON.stringify({
                type: "content_block_stop", index: 0,
              })}\n\n`));
              controller.enqueue(encoder.encode(`event: message_delta\ndata: ${JSON.stringify({
                type: "message_delta",
                delta: { stop_reason: "end_turn", stop_sequence: null },
                usage: { output_tokens: 1 },
              })}\n\n`));
              controller.enqueue(encoder.encode(`event: message_stop\ndata: ${JSON.stringify({
                type: "message_stop",
              })}\n\n`));
              controller.close();
            }
          }
        } catch (err) {
          controller.error(err);
        }
      });

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            if (!isFirstChunk) {
              controller.enqueue(encoder.encode(`event: content_block_stop\ndata: ${JSON.stringify({ type: "content_block_stop", index: 0 })}\n\n`));
              controller.enqueue(encoder.encode(`event: message_delta\ndata: ${JSON.stringify({ type: "message_delta", delta: { stop_reason: "end_turn", stop_sequence: null }, usage: { output_tokens: 1 } })}\n\n`));
              controller.enqueue(encoder.encode(`event: message_stop\ndata: ${JSON.stringify({ type: "message_stop" })}\n\n`));
            }
            controller.close();
            break;
          }
          parser.feed(decoder.decode(value, { stream: true }));
        }
      } catch (err) {
        controller.error(err);
      } finally {
        reader.releaseLock();
      }
    },
  });
}

export async function createClaudeCompletion(
  model: string, messages: any[], system: string | any[] | undefined,
  refreshToken: string, stream = false, conversationId?: string, tools?: any[]
): Promise<any | ReadableStream> {
  const glmMessages = convertClaudeToGLM(messages, system);
  const openaiTools = tools && tools.length > 0 ? convertClaudeToolsToOpenAI(tools) : undefined;
  if (stream) {
    const glmStream = await createCompletionStream(glmMessages, refreshToken, model, conversationId, 0, openaiTools);
    return convertGLMStreamToClaude(glmStream);
  } else {
    const glmResponse = await createCompletion(glmMessages, refreshToken, model, conversationId, 0, openaiTools);
    return convertGLMToClaude(glmResponse);
  }
}

// ==================== Gemini Adapter ====================

export function convertGeminiToGLM(contents: any[], systemInstruction?: any): any[] {
  const glmMessages: any[] = [];
  let systemText = "";
  if (systemInstruction) {
    if (typeof systemInstruction === "string") {
      systemText = systemInstruction;
    } else if (systemInstruction.parts) {
      systemText = systemInstruction.parts.filter((part: any) => part.text).map((part: any) => part.text).join("\n");
    }
  }
  let systemPrepended = false;
  for (const content of contents) {
    const role = content.role === "model" ? "assistant" : "user";
    let text = "";
    if (content.parts && Array.isArray(content.parts)) {
      text = content.parts.filter((part: any) => part.text).map((part: any) => part.text).join("\n");
    }
    if (role === "user" && systemText && !systemPrepended) {
      text = `${systemText}\n\n${text}`;
      systemPrepended = true;
    }
    glmMessages.push({ role, content: text });
  }
  return glmMessages;
}

export function convertGLMToGemini(glmResponse: any): any {
  const content = glmResponse.choices[0].message.content;
  return {
    candidates: [{
      content: { parts: [{ text: content }], role: "model" },
      finishReason: glmResponse.choices[0].finish_reason === "stop" ? "STOP" : "MAX_TOKENS",
      index: 0,
      safetyRatings: [],
    }],
    usageMetadata: {
      promptTokenCount: glmResponse.usage?.prompt_tokens || 0,
      candidatesTokenCount: glmResponse.usage?.completion_tokens || 0,
      totalTokenCount: glmResponse.usage?.total_tokens || 0,
    },
  };
}

export function convertGLMStreamToGemini(glmStream: ReadableStream): ReadableStream {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      const reader = glmStream.getReader();
      const decoder = new TextDecoder();

      const parser = createParser((event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.choices && data.choices[0]) {
            const delta = data.choices[0].delta;
            if (delta.content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                candidates: [{ content: { parts: [{ text: delta.content }], role: "model" }, finishReason: null, index: 0, safetyRatings: [] }],
              })}\n\n`));
            }
            if (data.choices[0].finish_reason) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                candidates: [{ content: { parts: [{ text: "" }], role: "model" }, finishReason: "STOP", index: 0, safetyRatings: [] }],
                usageMetadata: { promptTokenCount: 1, candidatesTokenCount: 1, totalTokenCount: 2 },
              })}\n\n`));
              controller.close();
            }
          }
        } catch (err) {
          controller.error(err);
        }
      });

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) { controller.close(); break; }
          parser.feed(decoder.decode(value, { stream: true }));
        }
      } catch (err) {
        controller.error(err);
      } finally {
        reader.releaseLock();
      }
    },
  });
}

export async function createGeminiCompletion(
  model: string, contents: any[], systemInstruction: any,
  refreshToken: string, stream = false, conversationId?: string
): Promise<any | ReadableStream> {
  const glmMessages = convertGeminiToGLM(contents, systemInstruction);
  if (stream) {
    const glmStream = await createCompletionStream(glmMessages, refreshToken, model, conversationId);
    return convertGLMStreamToGemini(glmStream);
  } else {
    const glmResponse = await createCompletion(glmMessages, refreshToken, model, conversationId);
    return convertGLMToGemini(glmResponse);
  }
}
