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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { MenuLocation } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { MenusService } from './menus.service';
import { CreateMenuDto, SyncMenuItemsDto } from './dto/create-menu.dto';

@ApiTags('menus')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Get()
  @RequirePermissions('menus:list')
  @ApiOperation({ summary: 'List all menus' })
  findAll() {
    return this.menusService.findAll();
  }

  @Get(':id')
  @RequirePermissions('menus:read')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Get menu with nested items' })
  findOne(@Param('id') id: string) {
    return this.menusService.findById(id);
  }

  @Post()
  @RequirePermissions('menus:create')
  @ApiOperation({ summary: 'Create a new menu' })
  create(@Body() dto: CreateMenuDto) {
    return this.menusService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('menus:update')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Update menu metadata' })
  update(@Param('id') id: string, @Body() dto: CreateMenuDto) {
    return this.menusService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('menus:delete')
  @ApiParam({ name: 'id' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a menu' })
  delete(@Param('id') id: string) {
    return this.menusService.delete(id);
  }

  @Put(':id/items')
  @RequirePermissions('menus:update')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Bulk sync menu items (transactional)' })
  syncItems(@Param('id') id: string, @Body() dto: SyncMenuItemsDto) {
    return this.menusService.syncItems(id, dto);
  }
}

@ApiTags('public')
@Controller('public/menus')
export class PublicMenusController {
  constructor(private readonly menusService: MenusService) {}

  @Public()
  @Get(':location')
  @ApiParam({ name: 'location', enum: MenuLocation })
  @ApiOperation({ summary: 'Get menu by location (public)' })
  findPublic(@Param('location') location: MenuLocation) {
    return this.menusService.findPublicByLocation(location);
  }
}
