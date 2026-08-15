import { HttpBusinessCode, HttpCode, HttpMessage } from '@/constants/http';
import { withAuth } from '@/lib/auth/with-auth';
import { Result } from '@/types/common/result';
import { createMCPServer, deleteMCPServer, getMCPServerList, updateMCPServer } from '@/services/mcp/mcp.service';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * 获取当前用户的 MCP Server 列表
 */
export async function GET(req: NextRequest) {
  try {
    return withAuth(req, async (payload) => {
      const { sub } = payload;
      const list = await getMCPServerList(sub as string);
      return NextResponse.json(
        { data: list, code: HttpBusinessCode.SUCCESS, message: HttpMessage.REQUEST_SUCCESS },
        { status: HttpCode.SUCCESS },
      );
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json<Result<null>>(
      { code: HttpBusinessCode.FAIL, message: HttpMessage.INTERNAL_SERVER_ERROR, data: null },
      { status: HttpCode.INTERNAL_SERVER_ERROR },
    );
  }
}

const createMCPServerSchema = z.discriminatedUnion('type', [
  z.object({
    name: z.string().min(1, '名称不能为空'),
    type: z.literal('stdio'),
    enabled: z.boolean().optional(),
    command: z.string().min(1, 'stdio 类型必须指定 command'),
    args: z.array(z.string()).optional(),
    env: z.record(z.string(), z.string()).optional(),
  }),
  z.object({
    name: z.string().min(1, '名称不能为空'),
    type: z.literal('http'),
    enabled: z.boolean().optional(),
    url: z.string().url('http 类型必须指定合法的 url'),
    headers: z.record(z.string(), z.string()).optional(),
  }),
]);

/**
 * 创建 MCP Server
 */
export async function POST(req: NextRequest) {
  try {
    return withAuth(req, async (payload) => {
      const userId = payload.sub as string;
      const body = await req.json();

      const result = createMCPServerSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json<Result<null>>(
          { code: HttpBusinessCode.FAIL, message: HttpMessage.PARAM_VALIDATION_ERROR, data: null },
          { status: HttpCode.BAD_REQUEST },
        );
      }

      const server = await createMCPServer(userId, result.data);
      return NextResponse.json<Result<unknown>>(
        { data: server, code: HttpBusinessCode.SUCCESS, message: HttpMessage.REQUEST_SUCCESS },
        { status: HttpCode.SUCCESS },
      );
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json<Result<null>>(
      { code: HttpBusinessCode.FAIL, message: HttpMessage.INTERNAL_SERVER_ERROR, data: null },
      { status: HttpCode.INTERNAL_SERVER_ERROR },
    );
  }
}

const updateMCPServerSchema = z
  .object({
    id: z.string().min(1, 'id 不能为空'),
    name: z.string().min(1).optional(),
    type: z.enum(['stdio', 'http']).optional(),
    enabled: z.boolean().optional(),
    command: z.string().optional(),
    args: z.array(z.string()).optional(),
    env: z.record(z.string(), z.string()).optional(),
    url: z.string().url().optional(),
    headers: z.record(z.string(), z.string()).optional(),
  })
  .refine(
    (data) => {
      if (data.type === 'stdio') {
        return data.url === undefined && data.headers === undefined;
      }
      if (data.type === 'http') {
        return data.command === undefined && data.args === undefined && data.env === undefined;
      }
      return true;
    },
    { message: 'stdio 与 http 类型的字段不能混用' },
  );

/**
 * 更新 MCP Server
 */
export async function PATCH(req: NextRequest) {
  try {
    return withAuth(req, async (payload) => {
      const userId = payload.sub as string;
      const body = await req.json();

      const result = updateMCPServerSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json<Result<null>>(
          { code: HttpBusinessCode.FAIL, message: HttpMessage.PARAM_VALIDATION_ERROR, data: null },
          { status: HttpCode.BAD_REQUEST },
        );
      }

      const { id, ...data } = result.data;
      const server = await updateMCPServer(id, userId, data);
      return NextResponse.json<Result<unknown>>(
        { data: server, code: HttpBusinessCode.SUCCESS, message: HttpMessage.REQUEST_SUCCESS },
        { status: HttpCode.SUCCESS },
      );
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json<Result<null>>(
      { code: HttpBusinessCode.FAIL, message: HttpMessage.INTERNAL_SERVER_ERROR, data: null },
      { status: HttpCode.INTERNAL_SERVER_ERROR },
    );
  }
}

const deleteMCPServerSchema = z.object({
  id: z.string().min(1, 'id 不能为空'),
});

/**
 * 删除 MCP Server
 */
export async function DELETE(req: NextRequest) {
  try {
    return withAuth(req, async (payload) => {
      const userId = payload.sub as string;
      const body = await req.json();

      const result = deleteMCPServerSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json<Result<null>>(
          { code: HttpBusinessCode.FAIL, message: HttpMessage.PARAM_VALIDATION_ERROR, data: null },
          { status: HttpCode.BAD_REQUEST },
        );
      }

      await deleteMCPServer(result.data.id, userId);
      return NextResponse.json<Result<null>>(
        { data: null, code: HttpBusinessCode.SUCCESS, message: HttpMessage.REQUEST_SUCCESS },
        { status: HttpCode.SUCCESS },
      );
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json<Result<null>>(
      { code: HttpBusinessCode.FAIL, message: HttpMessage.INTERNAL_SERVER_ERROR, data: null },
      { status: HttpCode.INTERNAL_SERVER_ERROR },
    );
  }
}
