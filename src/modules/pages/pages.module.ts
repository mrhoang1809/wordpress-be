import { Module } from '@nestjs/common';
import { PagesService } from './pages.service';
import { PagesController, PublicPagesController } from './pages.controller';
import { BlocksService } from './blocks/blocks.service';

@Module({
  providers: [PagesService, BlocksService],
  controllers: [PagesController, PublicPagesController],
  exports: [PagesService],
})
export class PagesModule {}
