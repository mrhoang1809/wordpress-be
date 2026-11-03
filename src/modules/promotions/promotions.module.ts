import { Module } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { PromotionsController, PublicPromotionsController } from './promotions.controller';

@Module({
  providers: [PromotionsService],
  controllers: [PromotionsController, PublicPromotionsController],
  exports: [PromotionsService],
})
export class PromotionsModule {}
