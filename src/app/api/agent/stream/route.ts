import { streamResponse } from '@/lib/agent/utils';
import { withAuth } from '@/lib/auth/with-auth';
import { MessageStreamDto } from '@/pojo/dto/agent/stream.dto';
import { MessageResponse } from '@/types/messages';
import { generateThreadId } from '@/utils/generate-thread-id';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * 聊天响应式
 */
export async function POST(req: NextRequest) {
  try {
    return await withAuth(req, async (_req, payload) => {
      const userId = payload.sub as string;
      const body = await _req.json();
      const {
        threadId,
        content: userContent,
        model,
        provider,
        attachments,
      } = body as MessageStreamDto & { threadId: string };

      const encoder = new TextEncoder();
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          const send = (data: MessageResponse) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          };

          // Initial comment to establish stream
          controller.enqueue(encoder.encode(': connected\n\n'));

          (async () => {
            try {
              const iterable = await streamResponse({
                threadId: generateThreadId(userId, threadId),
                userText: userContent,
                opts: {
                  model,
                  provider,
                  attachments,
                },
              });

              for await (const chunk of iterable) {
                // Only forward AI/tool chunks; ignore human/system

                if (chunk.type === 'ai' || chunk.type === 'tool') {
                  send(chunk);
                }
              }

              // Signal completion
              controller.enqueue(encoder.encode('event: done\n'));
              controller.enqueue(encoder.encode('data: {}\n\n'));
            } catch (err: unknown) {
              // Emit an error event (client onerror will capture general network; providing data for diagnostics)
              controller.enqueue(encoder.encode('event: error\n'));
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ message: (err as Error)?.message || 'Stream error', threadId })}\n\n`,
                ),
              );
            } finally {
              controller.close();
            }
          })();
        },
        cancel() {
          //
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      });
    });
  } catch (error) {
    console.log(error);
  }
}
