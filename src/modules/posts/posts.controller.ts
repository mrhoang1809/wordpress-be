import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ContentStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { SyncBlocksDto } from '../pages/dto/sync-blocks.dto';

class PostQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ContentStatus })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiPropertyOptional({ description: 'Filter by category slug' })
  @IsOptional()
  @IsString()
  categorySlug?: string;
}

class CreatePublicCommentDto {
  @ApiPropertyOptional({ example: 'Nguyễn An' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ example: 'Bài viết rất hữu ích.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  text!: string;
}

@ApiTags('posts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @RequirePermissions('posts:list')
  @ApiOperation({ summary: 'List posts' })
  findAll(@Query() query: PostQueryDto) {
    return this.postsService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('posts:read')
  @ApiParam({ name: 'id' })
  findOne(@Param('id') id: string) {
    return this.postsService.findById(id);
  }

  @Post()
  @RequirePermissions('posts:create')
  create(@Body() dto: CreatePostDto, @CurrentUser() user: JwtPayload) {
    return this.postsService.create(dto, user);
  }

  @Patch(':id')
  @RequirePermissions('posts:update')
  @ApiParam({ name: 'id' })
  update(@Param('id') id: string, @Body() dto: CreatePostDto, @CurrentUser() user: JwtPayload) {
    return this.postsService.update(id, dto, user);
  }

  @Delete(':id')
  @RequirePermissions('posts:delete')
  @ApiParam({ name: 'id' })
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.postsService.delete(id, user);
  }

  @Post(':id/publish')
  @RequirePermissions('posts:publish')
  @ApiParam({ name: 'id' })
  publish(@Param('id') id: string) {
    return this.postsService.publish(id);
  }

  @Post(':id/unpublish')
  @RequirePermissions('posts:publish')
  @ApiParam({ name: 'id' })
  unpublish(@Param('id') id: string) {
    return this.postsService.unpublish(id);
  }

  @Get(':id/blocks')
  @RequirePermissions('posts:read')
  @ApiParam({ name: 'id' })
  getBlocks(@Param('id') id: string) {
    return this.postsService.getBlocks(id);
  }

  @Put(':id/blocks')
  @RequirePermissions('posts:update')
  @ApiParam({ name: 'id' })
  syncBlocks(
    @Param('id') id: string,
    @Body() dto: SyncBlocksDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.postsService.syncBlocks(id, dto, user);
  }
}

@ApiTags('public')
@Controller('public/posts')
export class PublicPostsController {
  constructor(private readonly postsService: PostsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List published posts (public) — supports ?page, ?pageSize, ?categorySlug, ?search' })
  listPublic(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('categorySlug') categorySlug?: string,
    @Query('search') search?: string,
  ) {
    return this.postsService.listPublicPosts({
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 12,
      categorySlug: categorySlug || undefined,
      search: search || undefined,
    });
  }

  @Public()
  @Get(':slug/engagement')
  @ApiParam({ name: 'slug' })
  @ApiOperation({ summary: 'Get public post views, likes and comments' })
  getEngagement(@Param('slug') slug: string) {
    return this.postsService.getPublicEngagement(slug);
  }

  @Public()
  @Post(':slug/views')
  @ApiParam({ name: 'slug' })
  @ApiOperation({ summary: 'Record a public post view' })
  recordView(@Param('slug') slug: string) {
    return this.postsService.recordPublicView(slug);
  }

  @Public()
  @Post(':slug/likes')
  @ApiParam({ name: 'slug' })
  @ApiOperation({ summary: 'Record a public post like' })
  recordLike(@Param('slug') slug: string) {
    return this.postsService.recordPublicLike(slug);
  }

  @Public()
  @Post(':slug/comments')
  @ApiParam({ name: 'slug' })
  @ApiOperation({ summary: 'Add a public comment to a post' })
  createComment(
    @Param('slug') slug: string,
    @Body() dto: CreatePublicCommentDto,
  ) {
    return this.postsService.createPublicComment(slug, dto);
  }

  @Public()
  @Get(':slug')
  @ApiParam({ name: 'slug' })
  @ApiOperation({ summary: 'Get a published post by slug (public)' })
  findPublic(@Param('slug') slug: string) {
    return this.postsService.findPublicBySlug(slug);
  }
}
