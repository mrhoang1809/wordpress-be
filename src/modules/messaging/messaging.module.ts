import { Module } from '@nestjs/common';
import { SubscribersService } from './subscribers.service';
import { CampaignsService } from './campaigns.service';
import { TemplatesService } from './templates.service';
import { SubscribersController } from './subscribers.controller';
import { CampaignsController } from './campaigns.controller';
import { TemplatesController } from './templates.controller';
import { ZaloProvider } from './providers/zalo.provider';
import { FacebookProvider } from './providers/facebook.provider';

@Module({
  providers: [
    SubscribersService,
    CampaignsService,
    TemplatesService,
    ZaloProvider,
    FacebookProvider,
  ],
  controllers: [SubscribersController, CampaignsController, TemplatesController],
  exports: [SubscribersService, CampaignsService, TemplatesService],
})
export class MessagingModule {}
