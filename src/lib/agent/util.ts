import { DynamicStructuredTool } from '@langchain/core/tools';

/**
 * JSON Schema keywords that are not supported by Google Gemini's function calling API.
 * These need to be stripped from tool schemas before passing to the LLM.
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
 * Normalizes a JSON Schema type field.
 * Gemini requires type to be a string, not an array.
 * For nullable types like ["string", "null"], we extract the non-null type.
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
 * Recursively sanitizes a JSON Schema object by removing unsupported keywords
 * and normalizing values for Google Gemini's function calling API.
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
 * Sanitizes a DynamicStructuredTool's schema to be compatible with Google Gemini.
 * Modifies the tool's schema in place to remove unsupported JSON Schema keywords.
 */
export function sanitizeTool(tool: DynamicStructuredTool): DynamicStructuredTool {
  const originalSchema = tool.schema as Record<string, unknown>;
  const sanitizedSchema = sanitizeSchema(originalSchema) as Record<string, unknown>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (tool as any).schema = sanitizedSchema;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((tool as any).lc_kwargs?.schema) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (tool as any).lc_kwargs.schema = sanitizedSchema;
  }

  return tool;
}
