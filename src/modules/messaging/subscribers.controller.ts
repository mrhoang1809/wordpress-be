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
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { SubscribersService } from './subscribers.service';
import {
  CreateSubscriberDto,
  UpdateSubscriberDto,
  ImportSubscribersDto,
} from './dto/subscriber.dto';

@ApiTags('messaging-subscribers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('messaging/subscribers')
export class SubscribersController {
  constructor(private readonly subscribersService: SubscribersService) {}

  @Get()
  @RequirePermissions('subscribers:list')
  @ApiOperation({ summary: 'List subscribers (paginated, filterable)' })
  findAll(
    @Query() query: PaginationQueryDto & { platform?: string; tag?: string },
  ) {
    return this.subscribersService.findAll(query);
  }

  @Get('tags')
  @RequirePermissions('subscribers:list')
  @ApiOperation({ summary: 'Get all unique subscriber tags' })
  getTags() {
    return this.subscribersService.getTags();
  }

  @Get(':id')
  @RequirePermissions('subscribers:read')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Get subscriber by ID' })
  findOne(@Param('id') id: string) {
    return this.subscribersService.findById(id);
  }

  @Post()
  @RequirePermissions('subscribers:create')
  @ApiOperation({ summary: 'Create a subscriber' })
  create(@Body() dto: CreateSubscriberDto) {
    return this.subscribersService.create(dto);
  }

  @Post('import')
  @RequirePermissions('subscribers:create')
  @ApiOperation({ summary: 'Bulk import subscribers (skips duplicates)' })
  bulkImport(@Body() dto: ImportSubscribersDto) {
    return this.subscribersService.bulkImport(dto.subscribers);
  }

  @Patch(':id')
  @RequirePermissions('subscribers:update')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Update a subscriber' })
  update(@Param('id') id: string, @Body() dto: UpdateSubscriberDto) {
    return this.subscribersService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('subscribers:delete')
  @ApiParam({ name: 'id' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a subscriber' })
  delete(@Param('id') id: string) {
    return this.subscribersService.delete(id);
  }
}
