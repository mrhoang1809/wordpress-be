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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { MediaService, UploadedFileInfo } from './media.service';

@ApiTags('media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @RequirePermissions('media:list')
  @ApiOperation({ summary: 'List all media (paginated)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.mediaService.findAll(query);
  }

  @Get('uploads/:filename')
  // Served as static files by express — this endpoint is not hit in practice
  // but documented for Swagger clarity
  @ApiOperation({ summary: 'Serve uploaded file (static)' })
  serveFile() {
    return null;
  }

  @Get(':id')
  @RequirePermissions('media:read')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Get media by ID' })
  findOne(@Param('id') id: string) {
    return this.mediaService.findById(id);
  }

  @Post()
  @RequirePermissions('media:upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const unique = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, unique);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB default
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
        }
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        altText: { type: 'string' },
        caption: { type: 'string' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload a media file' })
  upload(
    @UploadedFile() file: UploadedFileInfo,
    @CurrentUser() user: JwtPayload,
    @Body('altText') altText?: string,
    @Body('caption') caption?: string,
  ) {
    return this.mediaService.upload(file, user, altText, caption);
  }

  @Patch(':id')
  @RequirePermissions('media:update')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Update media alt text or caption' })
  update(
    @Param('id') id: string,
    @Body() dto: { altText?: string; caption?: string },
  ) {
    return this.mediaService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('media:delete')
  @ApiParam({ name: 'id' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete media file' })
  delete(@Param('id') id: string) {
    return this.mediaService.delete(id);
  }
}
