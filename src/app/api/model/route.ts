import { HttpBusinessCode, HttpCode, HttpMessage } from '@/constants/http';
import { withAuth } from '@/lib/auth/with-auth';
import { Result } from '@/types/common/result';
import { getModelListGrouped } from '@/services/model/model.service';
import { NextRequest, NextResponse } from 'next/server';
import { Model } from '@/types/entity/model.entity';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * 获取按 group 分组的模型列表
 * 返回结构：[[group1Models], [group2Models], ...]
 */
export async function GET(req: NextRequest) {
  try {
    return withAuth(req, async () => {
      const list = await getModelListGrouped();
      return NextResponse.json<Result<Model[][]>>(
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
