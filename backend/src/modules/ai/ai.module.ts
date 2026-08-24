import { Module } from "@nestjs/common";
import { AiController } from "./ai.controller";
import { AiProviderService } from "./ai-provider.service";
import { AiToolsService } from "./ai-tools.service";
import { AiChatService } from "./ai-chat.service";
import { AiSettingsService } from "./ai-settings.service";

@Module({
  controllers: [AiController],
  providers: [AiProviderService, AiToolsService, AiChatService, AiSettingsService],
})
export class AiModule {}
