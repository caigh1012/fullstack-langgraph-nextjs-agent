-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "MCPServerType" AS ENUM ('stdio', 'http');

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "gender" "Gender" DEFAULT 'UNKNOWN',
    "avatarUrl" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Thread" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Thread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MCPServer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "MCPServerType" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "command" TEXT,
    "args" JSONB,
    "env" JSONB,
    "url" TEXT,
    "headers" JSONB,
    "requiresAuth" BOOLEAN DEFAULT false,
    "authTokens" JSONB,
    "clientInfo" JSONB,
    "codeVerifier" TEXT,
    "oauthStatus" TEXT DEFAULT 'UNKNOWN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MCPServer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MCPServer_name_key" ON "MCPServer"("name");
