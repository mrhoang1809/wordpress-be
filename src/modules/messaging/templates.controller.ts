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
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { MessagePlatform } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/template.dto';

@ApiTags('messaging-templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('messaging/templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  @RequirePermissions('messages:list')
  @ApiQuery({ name: 'platform', enum: MessagePlatform, required: false })
  @ApiOperation({ summary: 'List message templates' })
  findAll(@Query('platform') platform?: MessagePlatform) {
    return this.templatesService.findAll(
      platform && Object.values(MessagePlatform).includes(platform)
        ? platform
        : undefined,
    );
  }

  @Get(':id')
  @RequirePermissions('messages:read')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Get template by ID' })
  findOne(@Param('id') id: string) {
    return this.templatesService.findById(id);
  }

  @Post()
  @RequirePermissions('messages:create')
  @ApiOperation({ summary: 'Create a message template' })
  create(@Body() dto: CreateTemplateDto) {
    return this.templatesService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('messages:update')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Update a template' })
  update(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    return this.templatesService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('messages:delete')
  @ApiParam({ name: 'id' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a template' })
  delete(@Param('id') id: string) {
    return this.templatesService.delete(id);
  }
}
