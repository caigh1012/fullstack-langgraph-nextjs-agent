import 'server-only';
import prisma from '@/lib/database/prisma';
import { Model } from '@/types/entity/model.entity';

/**
 * 获取按 group 分组的模型列表
 * @returns 二维数组：外层每个元素代表一个分组，内层为该分组下的模型列表
 */
export async function getModelListGrouped(): Promise<Model[][]> {
  const models = await prisma.model.findMany({
    orderBy: [{ group: 'asc' }, { name: 'asc' }],
  });

  const grouped = new Map<string, Model[]>();
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
}
