import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';

export function createPostgresMemory(): PostgresSaver {
  const connectionString = `${process.env.DATABASE_URL}`;
  return PostgresSaver.fromConnString(connectionString);
}

export const postgresCheckpointer = createPostgresMemory();
