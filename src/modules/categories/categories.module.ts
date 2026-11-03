import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController, PublicCategoriesController } from './categories.controller';

@Module({
  providers: [CategoriesService],
  controllers: [CategoriesController, PublicCategoriesController],
  exports: [CategoriesService],
})
export class CategoriesModule {}
