-- CreateTable
CREATE TABLE "AiConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New conversation',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "toolName" TEXT,
    "toolArgs" JSONB,
    "toolResult" JSONB,
    "status" TEXT,
    "tokenUsage" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiSetting" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "provider" TEXT NOT NULL DEFAULT 'openai-compatible',
    "baseUrl" TEXT,
    "apiKeyEncrypted" TEXT,
    "apiKeyLast4" TEXT,
    "model" TEXT NOT NULL DEFAULT 'openai/gpt-4o-mini',
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    "maxOutputTokens" INTEGER NOT NULL DEFAULT 1024,
    "requestTimeoutMs" INTEGER NOT NULL DEFAULT 60000,
    "monthlyTokenLimit" INTEGER NOT NULL DEFAULT 1000000,
    "perUserMonthlyTokenLimit" INTEGER NOT NULL DEFAULT 100000,
    "allowedRoles" TEXT NOT NULL DEFAULT 'SUPER_ADMIN,HR,MANAGER,FINANCE,RECRUITER,EMPLOYEE',
    "writeActionsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiConversation_userId_updatedAt_idx" ON "AiConversation"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "AiMessage_conversationId_createdAt_idx" ON "AiMessage"("conversationId", "createdAt");

-- AddForeignKey
ALTER TABLE "AiConversation" ADD CONSTRAINT "AiConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiMessage" ADD CONSTRAINT "AiMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AiConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
