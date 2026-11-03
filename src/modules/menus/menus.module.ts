import { Module } from '@nestjs/common';
import { MenusService } from './menus.service';
import { MenusController, PublicMenusController } from './menus.controller';

@Module({
  providers: [MenusService],
  controllers: [MenusController, PublicMenusController],
  exports: [MenusService],
})
export class MenusModule {}
