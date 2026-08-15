-- RenameTable
ALTER TABLE "LLMModel" RENAME TO "Model";

-- RenameIndex
ALTER INDEX "LLMModel_model_key" RENAME TO "Model_model_key";

-- Rename the primary key constraint to match the new table name
ALTER TABLE "Model" RENAME CONSTRAINT "LLMModel_pkey" TO "Model_pkey";
