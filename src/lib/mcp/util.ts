import { DynamicStructuredTool } from '@langchain/core/tools';

/**
 * Google Gemini 函数调用 API 不支持的 JSON Schema 关键字。
 * 在将工具 schema 传给大模型之前，需要先移除这些字段。
 */
const UNSUPPORTED_SCHEMA_KEYWORDS = new Set([
  '$schema',
  '$id',
  '$ref',
  '$defs',
  'definitions',
  'exclusiveMinimum',
  'exclusiveMaximum',
  'multipleOf',
  'minLength',
  'maxLength',
  'pattern',
  'minItems',
  'maxItems',
  'uniqueItems',
  'minProperties',
  'maxProperties',
  'additionalProperties',
  'patternProperties',
  'allOf',
  'anyOf',
  'oneOf',
  'not',
  'if',
  'then',
  'else',
  'contentMediaType',
  'contentEncoding',
  'examples',
  'default',
  'const',
  'readOnly',
  'writeOnly',
  'deprecated',
  'title',
  'format',
]);

/**
 * 规范化 JSON Schema 的 type 字段。
 * Gemini 要求 type 必须是字符串，不能是数组。
 * 对于 ["string", "null"] 这类可空类型，这里会提取非 null 的类型。
 */
function normalizeType(type: unknown): string | undefined {
  if (typeof type === 'string') {
    return type;
  }

  if (Array.isArray(type)) {
    const nonNullTypes = type.filter((item): item is string => typeof item === 'string' && item !== 'null');
    if (nonNullTypes.length > 0) {
      return nonNullTypes[0];
    }

    return 'string';
  }

  return undefined;
}

/**
 * 递归清理 JSON Schema 对象，移除不受支持的关键字，
 * 并将值调整为兼容 Google Gemini 函数调用 API 的格式。
 */
function sanitizeSchema(schema: unknown): Record<string, unknown> | unknown {
  if (!schema || typeof schema !== 'object') {
    return schema;
  }

  if (Array.isArray(schema)) {
    return schema.map((item) => sanitizeSchema(item));
  }

  const schemaObj = schema as Record<string, unknown>;
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(schemaObj)) {
    if (UNSUPPORTED_SCHEMA_KEYWORDS.has(key)) {
      continue;
    }

    if (key === 'type') {
      const normalizedType = normalizeType(value);
      if (normalizedType) {
        sanitized[key] = normalizedType;
      }
      continue;
    }

    if (key === 'items' && Array.isArray(value)) {
      if (value.length > 0) {
        sanitized[key] = sanitizeSchema(value[0]);
      }
      continue;
    }

    if (key === 'properties' && value && typeof value === 'object' && !Array.isArray(value)) {
      const propsObj = value as Record<string, unknown>;
      const sanitizedProps: Record<string, unknown> = {};

      for (const [propName, propSchema] of Object.entries(propsObj)) {
        sanitizedProps[propName] = sanitizeSchema(propSchema);
      }

      sanitized[key] = sanitizedProps;
      continue;
    }

    if (key === 'required' && Array.isArray(value)) {
      const properties = schemaObj.properties;

      if (properties && typeof properties === 'object' && !Array.isArray(properties)) {
        const validProps = Object.keys(properties as Record<string, unknown>);
        const filtered = value.filter((prop): prop is string => typeof prop === 'string' && validProps.includes(prop));

        if (filtered.length > 0) {
          sanitized[key] = filtered;
        }
      } else {
        sanitized[key] = value;
      }

      continue;
    }

    if (value && typeof value === 'object') {
      sanitized[key] = sanitizeSchema(value);
    } else {
      sanitized[key] = value;
    }
  }

  if (
    'properties' in sanitized &&
    typeof sanitized.properties === 'object' &&
    sanitized.properties !== null &&
    Object.keys(sanitized.properties as Record<string, unknown>).length === 0
  ) {
    delete sanitized.properties;
    delete sanitized.required;
  }

  return sanitized;
}

/**
 * 清理 DynamicStructuredTool 的 schema，使其兼容 Google Gemini。
 * 这里会直接修改工具实例上的 schema，移除不支持的 JSON Schema 关键字。
 */
export function sanitizeTool(tool: DynamicStructuredTool): DynamicStructuredTool {
  const originalSchema = tool.schema as Record<string, unknown>;
  const sanitizedSchema = sanitizeSchema(originalSchema) as Record<string, unknown>;

  // 这里需要直接回写到工具实例，保留 any 断言是为了兼容 LangChain 的运行时结构

  tool.schema = sanitizedSchema;

  // LangChain 某些场景会从 lc_kwargs.schema 读取 schema，这里一并同步

  if (tool.lc_kwargs?.schema) {
    tool.lc_kwargs.schema = sanitizedSchema;
  }

  return tool;
}
