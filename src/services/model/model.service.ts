import 'server-only';
import prisma from '@/lib/database/prisma';
import { SelectLLMModel } from '@/types/select-model';

/**
 * 获取按 group 分组的模型列表
 * @returns 二维数组：外层每个元素代表一个分组，内层为该分组下的模型列表
 */
export async function getModelListGrouped(): Promise<SelectLLMModel[][]> {
  try {
    const models = await prisma.model.findMany({
      orderBy: [{ group: 'asc' }, { name: 'asc' }],
    });

    const grouped = new Map<string, SelectLLMModel[]>();
    for (const model of models) {
      const list = grouped.get(model.group) ?? [];
      list.push({
        id: model.id,
        name: model.name,
        group: model.group,
        model: model.model,
        provider: model.provider,
        isMultiModal: model.isMultiModal,
      });
      grouped.set(model.group, list);
    }

    return Array.from(grouped.values());
  } catch (error) {
    throw error;
  }
}
