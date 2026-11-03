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
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { PromotionsService } from './promotions.service';
import { CreatePromotionBannerDto, UpdatePromotionBannerDto } from './dto/promotion.dto';

// ── Admin controller ─────────────────────────────────────────────────────────

@ApiTags('promotions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly service: PromotionsService) {}

  @Get()
  @RequirePermissions('promotions:list')
  @ApiOperation({ summary: 'List all promotion banners (admin)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('promotions:read')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Get a promotion banner by ID (admin)' })
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @RequirePermissions('promotions:create')
  @ApiOperation({ summary: 'Create a promotion banner' })
  create(@Body() dto: CreatePromotionBannerDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('promotions:update')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Update a promotion banner' })
  update(@Param('id') id: string, @Body() dto: UpdatePromotionBannerDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('promotions:delete')
  @ApiParam({ name: 'id' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a promotion banner' })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Post(':id/activate')
  @RequirePermissions('promotions:update')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Activate a banner (deactivates all others)' })
  activate(@Param('id') id: string) {
    return this.service.activate(id);
  }

  @Post(':id/deactivate')
  @RequirePermissions('promotions:update')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Deactivate a banner' })
  deactivate(@Param('id') id: string) {
    return this.service.deactivate(id);
  }
}

// ── Public controller ─────────────────────────────────────────────────────────

@ApiTags('public')
@Controller('public/promotions')
export class PublicPromotionsController {
  constructor(private readonly service: PromotionsService) {}

  @Public()
  @Get('active')
  @ApiOperation({ summary: 'Get the currently active promotion banner (public)' })
  getActive() {
    return this.service.findActive();
  }
}
