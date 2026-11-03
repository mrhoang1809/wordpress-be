import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
import { LocationsService } from './locations.service';
import { CreateLocationDto, UpdateLocationDto } from './dto/location.dto';

// ── Admin controller ─────────────────────────────────────────────────────────

@ApiTags('locations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('locations')
export class LocationsController {
  constructor(private readonly service: LocationsService) {}

  @Get()
  @RequirePermissions('locations:list')
  @ApiOperation({ summary: 'List all locations (admin)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('locations:read')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Get a location by ID (admin)' })
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @RequirePermissions('locations:create')
  @ApiOperation({ summary: 'Create a location' })
  create(@Body() dto: CreateLocationDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('locations:update')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Update a location' })
  update(@Param('id') id: string, @Body() dto: UpdateLocationDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('locations:delete')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Delete a location' })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}

// ── Public controller ─────────────────────────────────────────────────────────

@ApiTags('public')
@Controller('public/locations')
export class PublicLocationsController {
  constructor(private readonly service: LocationsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List active locations (public)' })
  findActive() {
    return this.service.findActive();
  }
}
