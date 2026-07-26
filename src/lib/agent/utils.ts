import { ensureAgent } from '@/lib/agent';
import { MessageOptions, MessageResponse } from '@/types/messages';
import { HumanMessage } from '@langchain/core/messages';

export async function streamResponse(params: { threadId: string; userText: string; opts?: MessageOptions }) {
  const { threadId, userText, opts } = params;

  if (!threadId) throw new Error('threadId is required');

  // Build multimodal message with attachments
  let messageContent: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;

  // eslint-disable-next-line prefer-const
  messageContent = userText;

  const inputs = {
    messages: [new HumanMessage({ content: messageContent })],
  };

  const agent = await ensureAgent(opts);

  const iterable = await agent.stream(inputs, {
    streamMode: ['messages', 'updates'],
    configurable: { thread_id: threadId },
  });

  return generator(iterable);
}

async function* generator(iterable: AsyncIterable<unknown>): AsyncGenerator<MessageResponse, void, unknown> {
  let currentAssistantId: string | null = null;
  let streamedAnyToken = false;

  for await (const chunk of iterable) {
    if (!chunk) continue; // 若 chunk 为空，则跳过此次循环

    // Handle tuple format: [type, data]
    if (Array.isArray(chunk) && chunk.length === 2) {
      const [chunkType, chunkData] = chunk;

      if (chunkType === 'messages' || chunkType === 'messages-tuple') {
        const { message, metadata } = normalizeMessageChunk(chunkData);
        if (!message) continue;

        const ctorName = message?.constructor?.name as string | undefined;
        const isAIMessageChunk = ctorName === 'AIMessageChunk';
        const isAIMessage = ctorName === 'AIMessage';
        if (!isAIMessageChunk && !isAIMessage) continue; // 若不是 AIMessageChunk 或 AIMessage 则跳过此次循环

        const metaRunId = (metadata as Record<string, unknown> | undefined)?.run_id;
        if (!currentAssistantId) {
          currentAssistantId =
            (typeof (message as Record<string, unknown>).id === 'string' &&
              ((message as Record<string, unknown>).id as string)) ||
            (typeof metaRunId === 'string' && metaRunId) ||
            `ai-${Date.now()}`;
        }

        const processedMessage = processAIMessage(message as Record<string, unknown>, currentAssistantId, {
          streamedAnyToken,
        });

        if (processedMessage) {
          if (
            isAIMessageChunk &&
            typeof (processedMessage.data as { content?: unknown }).content === 'string' &&
            (processedMessage.data as { content: string }).content.length > 0
          ) {
            streamedAnyToken = true;
          }
          yield processedMessage;
        }
        continue;
      }

      if (chunkType === 'updates' && chunkData && typeof chunkData === 'object' && !Array.isArray(chunkData)) {
        // Handle updates: ['updates', { agent: { messages: [Array] } }]
        if (
          'agent' in chunkData &&
          chunkData.agent &&
          typeof chunkData.agent === 'object' &&
          !Array.isArray(chunkData.agent) &&
          'messages' in chunkData.agent
        ) {
          const messages = Array.isArray(chunkData.agent.messages)
            ? chunkData.agent.messages
            : [chunkData.agent.messages];
          for (const message of messages) {
            if (!message) continue;

            const isAIMessage =
              message?.constructor?.name === 'AIMessageChunk' || message?.constructor?.name === 'AIMessage';

            if (!isAIMessage) continue;

            const messageWithTools = message as Record<string, unknown>;
            if (!currentAssistantId) {
              currentAssistantId =
                (typeof messageWithTools.id === 'string' && (messageWithTools.id as string)) || `ai-${Date.now()}`;
            }
            const processedMessage = processAIMessage(messageWithTools, currentAssistantId, { streamedAnyToken });
            if (processedMessage) {
              yield processedMessage;
            }
          }
        }
      }
    }
  }
}

function normalizeMessageChunk(chunkData: unknown): {
  message: unknown;
  metadata: Record<string, unknown> | undefined;
} {
  // [AIMessageChunk, metadata]处理 AIMessageChunk 和 AIMessage 类型的消息块
  if (Array.isArray(chunkData) && chunkData.length === 2) {
    const [message, metadata] = chunkData;
    return {
      message,
      metadata:
        metadata && typeof metadata === 'object' && !Array.isArray(metadata)
          ? (metadata as Record<string, unknown>)
          : undefined,
    };
  }
  return { message: chunkData, metadata: undefined };
}

// Helper function to process any AI message and return the appropriate MessageResponse
function processAIMessage(
  message: Record<string, unknown>,
  fallbackId: string,
  ctx: { streamedAnyToken: boolean },
): MessageResponse | null {
  const ctorName = message?.constructor?.name as string | undefined;
  if (ctorName === 'AIMessage' && ctx.streamedAnyToken) {
    return null; // 若是 AIMessage 类型且已流式输出，则返回 null
  }

  // Check if this is a tool call (content is array with functionCall)
  const hasToolCall =
    Array.isArray(message.content) &&
    message.content.some((item: unknown) => item && typeof item === 'object' && 'functionCall' in item);

  if (hasToolCall) {
    // Return full AIMessageData for tool calls to preserve all information
    return {
      type: 'ai',
      data: {
        id: (message.id as string) || fallbackId,
        content: typeof message.content === 'string' ? message.content : '',
        additional_kwargs: (message.additional_kwargs as Record<string, unknown>) || undefined,
        response_metadata: (message.response_metadata as Record<string, unknown>) || undefined,
      },
    };
  } else {
    // Handle regular text content - extract text from various content types
    let text = '';
    if (typeof message.content === 'string') {
      text = message.content;
    } else if (Array.isArray(message.content)) {
      text = message.content
        .map((c: string | { text?: string }) => (typeof c === 'string' ? c : c?.text || ''))
        .join('');
    } else {
      text = String(message.content ?? '');
    }

    // Only return message if we have actual text content
    if (text.length > 0) {
      return {
        type: 'ai',
        data: {
          id: (message.id as string) || fallbackId,
          content: text,
        },
      };
    }
  }
  return null;
}
