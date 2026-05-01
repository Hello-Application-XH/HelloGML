/**
 * 轻量 SSE 解析器（替代 eventsource-parser）
 */

export interface SSEEvent {
  type: string;
  data: string;
}

export function createParser(onEvent: (event: SSEEvent) => void) {
  let buffer = "";
  let eventType = "";
  let eventData = "";

  function dispatch() {
    if (eventData !== "" || eventType !== "") {
      onEvent({
        type: eventType || "message",
        data: eventData,
      });
      eventType = "";
      eventData = "";
    }
  }

  return {
    feed(chunk: string) {
      buffer += chunk;
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.endsWith("\r") ? line.slice(0, -1) : line;

        if (trimmed === "") {
          dispatch();
        } else if (trimmed.startsWith("data: ")) {
          eventData += (eventData ? "\n" : "") + trimmed.slice(6);
        } else if (trimmed.startsWith("event: ")) {
          eventType = trimmed.slice(7);
        } else if (trimmed.startsWith("id: ")) {
          // ignore id
        } else if (trimmed.startsWith("retry: ")) {
          // ignore retry
        } else if (trimmed.startsWith(":")) {
          // comment, ignore
        }
      }
    },
  };
}

/**
 * 读取 ReadableStream 并逐块喂给 SSE 解析器，最后 resolve
 */
export async function parseSSEStream<T>(
  readableStream: ReadableStream,
  onEvent: (event: SSEEvent) => void
): Promise<void> {
  const reader = readableStream.getReader();
  const decoder = new TextDecoder();
  const parser = createParser(onEvent);

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      parser.feed(decoder.decode(value, { stream: true }));
    }
  } finally {
    reader.releaseLock();
  }
}
