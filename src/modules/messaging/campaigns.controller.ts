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
import { CampaignStatus, MessagePlatform } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/campaign.dto';

class CampaignQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: CampaignStatus })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @ApiPropertyOptional({ enum: MessagePlatform })
  @IsOptional()
  @IsEnum(MessagePlatform)
  platform?: MessagePlatform;
}

@ApiTags('messaging-campaigns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('messaging/campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  @RequirePermissions('messages:list')
  @ApiOperation({ summary: 'List message campaigns (paginated, filterable)' })
  findAll(@Query() query: CampaignQueryDto) {
    return this.campaignsService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('messages:read')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Get campaign by ID with delivery details' })
  findOne(@Param('id') id: string) {
    return this.campaignsService.findById(id);
  }

  @Get(':id/stats')
  @RequirePermissions('messages:read')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Get delivery statistics for a campaign' })
  getStats(@Param('id') id: string) {
    return this.campaignsService.getStats(id);
  }

  @Post()
  @RequirePermissions('messages:create')
  @ApiOperation({ summary: 'Create a message campaign (DRAFT or QUEUED if scheduled)' })
  create(@Body() dto: CreateCampaignDto, @CurrentUser() user: JwtPayload) {
    return this.campaignsService.create(dto, user);
  }

  @Patch(':id')
  @RequirePermissions('messages:update')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Update a campaign (only DRAFT or QUEUED)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCampaignDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.campaignsService.update(id, dto, user);
  }

  @Post(':id/send')
  @RequirePermissions('messages:send')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Start sending a campaign to matching subscribers' })
  send(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.campaignsService.send(id, user);
  }

  @Post(':id/cancel')
  @RequirePermissions('messages:send')
  @ApiParam({ name: 'id' })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a queued or sending campaign' })
  cancel(@Param('id') id: string) {
    return this.campaignsService.cancel(id);
  }

  @Delete(':id')
  @RequirePermissions('messages:delete')
  @ApiParam({ name: 'id' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a campaign' })
  delete(@Param('id') id: string) {
    return this.campaignsService.delete(id);
  }
}
