import { Body, Controller, Delete, Get, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles, Role } from "../../common/decorators/roles.decorator";
import { AiSettingsService } from "./ai-settings.service";
import { AiChatService } from "./ai-chat.service";
import { PrismaService } from "../../prisma/prisma.service";
import { NotFoundException } from "@nestjs/common";
import { ChatDto, TestConnectionDto, UpdateAiSettingsDto } from "./dto/ai.dto";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("ai")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("ai")
export class AiController {
  constructor(
    private settings: AiSettingsService,
    private chatService: AiChatService,
    private prisma: PrismaService
  ) {}

  @Get("settings")
  @Roles(Role.SUPER_ADMIN)
  getSettings() {
    return this.settings.get();
  }

  @Put("settings")
  @Roles(Role.SUPER_ADMIN)
  updateSettings(@Body() dto: UpdateAiSettingsDto) {
    return this.settings.update(dto);
  }

  @Delete("settings/api-key")
  @Roles(Role.SUPER_ADMIN)
  removeApiKey() {
    return this.settings.removeApiKey();
  }

  @Post("settings/test")
  @Roles(Role.SUPER_ADMIN)
  testConnection(@Body() dto: TestConnectionDto) {
    return this.settings.testConnection(dto);
  }

  @Post("chat")
  chat(@CurrentUser() user: { id: string; role: string }, @Body() dto: ChatDto) {
    return this.chatService.chat(user.id, user.role, dto);
  }

  @Get("conversations")
  async listConversations(@CurrentUser("id") userId: string) {
    const rows = await this.prisma.aiConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 50,
      select: { id: true, title: true, createdAt: true, updatedAt: true },
    });
    return rows;
  }

  @Get("conversations/:id/messages")
  async getMessages(@CurrentUser("id") userId: string, id: string) {
    const conversation = await this.prisma.aiConversation.findUnique({ where: { id } });
    if (!conversation || conversation.userId !== userId) {
      throw new NotFoundException("Conversation not found");
    }
    return this.prisma.aiMessage.findMany({
      where: { conversationId: id, role: { in: ["user", "assistant"] } },
      orderBy: { createdAt: "asc" },
      select: { id: true, role: true, content: true, createdAt: true },
    });
  }

  @Delete("conversations/:id")
  async deleteConversation(@CurrentUser("id") userId: string, id: string) {
    const conversation = await this.prisma.aiConversation.findUnique({ where: { id } });
    if (!conversation || conversation.userId !== userId) {
      throw new NotFoundException("Conversation not found");
    }
    await this.prisma.aiConversation.delete({ where: { id } });
    return { success: true };
  }
}
