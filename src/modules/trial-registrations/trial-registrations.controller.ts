import {
  Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength, Matches } from 'class-validator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { TrialRegistrationsService } from './trial-registrations.service';

class CreateTrialDto {
  @IsString() @IsNotEmpty() @MaxLength(200)
  name!: string;

  @IsString() @IsNotEmpty() @Matches(/^[0-9]{9,11}$/, { message: 'Số điện thoại không hợp lệ' })
  phone!: string;

  @IsOptional() @IsString()
  locationId?: string;

  @IsOptional() @IsString() @MaxLength(200)
  source?: string;
}

/** Public endpoint — anyone can submit a trial registration */
@ApiTags('trial-registrations')
@Controller('public/trial-registrations')
export class PublicTrialRegistrationsController {
  constructor(private readonly svc: TrialRegistrationsService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit a trial registration (public)' })
  create(@Body() dto: CreateTrialDto) {
    return this.svc.create(dto);
  }
}

/** Admin endpoint — list all registrations */
@ApiTags('trial-registrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('trial-registrations')
export class AdminTrialRegistrationsController {
  constructor(private readonly svc: TrialRegistrationsService) {}

  @Get()
  @RequirePermissions('settings:read')   // reuse existing permission
  @ApiOperation({ summary: 'List all trial registrations (admin)' })
  findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.svc.findAll({
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 50,
    });
  }
}
