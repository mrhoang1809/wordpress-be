import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController, PublicPostsController } from './posts.controller';

@Module({
  providers: [PostsService],
  controllers: [PostsController, PublicPostsController],
  exports: [PostsService],
})
export class PostsModule {}
