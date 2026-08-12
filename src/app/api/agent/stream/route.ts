import { HttpBusinessCode, HttpCode, HttpMessage } from '@/constants/http';
import { ensureAgent } from '@/lib/agent';
import { withAuth } from '@/lib/auth/with-auth';
import { processAttachmentsForAI } from '@/lib/minio/content';
import { MessageStreamDto } from '@/pojo/dto/agent/stream.dto';
import { ResultVO } from '@/pojo/vo/common/result.vo';
import { generateThreadId } from '@/utils/generate-thread-id';
import { HumanMessage } from '@langchain/core/messages';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

      if (!threadId) throw new Error('threadId is required');

      let messageContent: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;

      if (attachments && attachments.length > 0) {
        const attachmentContents = await processAttachmentsForAI(attachments);
        messageContent = [{ type: 'text', text: userContent }, ...attachmentContents];
      } else {
        messageContent = userContent;
      }

      const inputs = {
        messages: [new HumanMessage({ content: messageContent })],
      };

      const agent = await ensureAgent({ model, provider });

      const stream = await agent.stream(inputs, {
        encoding: 'text/event-stream',
        streamMode: ['updates', 'messages'],
        configurable: { thread_id: generateThreadId(userId, threadId) },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        },
      });
    });
  } catch (error) {
    // 处理错误
    console.log(error);
    return NextResponse.json<ResultVO<null>>(
      { code: HttpBusinessCode.FAIL, message: HttpMessage.INTERNAL_SERVER_ERROR, data: null },
      { status: HttpCode.INTERNAL_SERVER_ERROR },
    );
  }
}
