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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ContentStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { PagesService } from './pages.service';
import { BlocksService } from './blocks/blocks.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { SyncBlocksDto } from './dto/sync-blocks.dto';

class PageQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ContentStatus })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiPropertyOptional({ example: 'updatedAt' })
  @IsOptional()
  sortBy?: string;
}

@ApiTags('pages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('pages')
export class PagesController {
  constructor(
    private readonly pagesService: PagesService,
    private readonly blocksService: BlocksService,
  ) {}

  @Get()
  @RequirePermissions('pages:list')
  @ApiOperation({ summary: 'List pages (admin)' })
  findAll(@Query() query: PageQueryDto) {
    return this.pagesService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('pages:read')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Get page by ID (admin)' })
  findOne(@Param('id') id: string) {
    return this.pagesService.findById(id);
  }

  @Post()
  @RequirePermissions('pages:create')
  @ApiOperation({ summary: 'Create a new page' })
  @ApiResponse({ status: 201 })
  create(@Body() dto: CreatePageDto, @CurrentUser() user: JwtPayload) {
    return this.pagesService.create(dto, user);
  }

  @Patch(':id')
  @RequirePermissions('pages:update')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Update page metadata' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePageDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.pagesService.update(id, dto, user);
  }

  @Delete(':id')
  @RequirePermissions('pages:delete')
  @ApiParam({ name: 'id' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a page' })
  delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.pagesService.delete(id, user);
  }

  @Post(':id/publish')
  @RequirePermissions('pages:publish')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Publish a page' })
  publish(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.pagesService.publish(id, user);
  }

  @Post(':id/unpublish')
  @RequirePermissions('pages:publish')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Unpublish a page (back to DRAFT)' })
  unpublish(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.pagesService.unpublish(id, user);
  }

  @Post(':id/duplicate')
  @RequirePermissions('pages:create')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Duplicate a page as DRAFT' })
  @ApiResponse({ status: 201 })
  duplicate(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.pagesService.duplicate(id, user);
  }

  // ─── Blocks ─────────────────────────────────────────────────────────────────

  @Get(':id/blocks')
  @RequirePermissions('pages:read')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Get all blocks for a page (admin)' })
  getBlocks(@Param('id') id: string) {
    return this.blocksService.getBlocks(id);
  }

  @Put(':id/blocks')
  @RequirePermissions('pages:update')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Bulk sync blocks for a page (transactional)' })
  syncBlocks(
    @Param('id') id: string,
    @Body() dto: SyncBlocksDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.blocksService.syncBlocks(id, dto, user);
  }
}

// ─── Public controller (no auth) ────────────────────────────────────────────

@ApiTags('public')
@Controller('public/pages')
export class PublicPagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Public()
  @Get(':slug')
  @ApiParam({ name: 'slug' })
  @ApiOperation({ summary: 'Get a published page by slug (public)' })
  findPublic(@Param('slug') slug: string) {
    return this.pagesService.findPublicBySlug(slug);
  }
}
