import { Injectable, NotFoundException } from '@nestjs/common';
import { MessagePlatform } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/template.dto';

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(platform?: MessagePlatform) {
    const where = platform ? { platform } : {};
    return this.prisma.messageTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const template = await this.prisma.messageTemplate.findUnique({ where: { id } });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async create(dto: CreateTemplateDto) {
    return this.prisma.messageTemplate.create({
      data: {
        name: dto.name,
        platform: dto.platform,
        messageType: dto.messageType ?? 'text',
        content: dto.content as object,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateTemplateDto) {
    const existing = await this.prisma.messageTemplate.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Template not found');

    return this.prisma.messageTemplate.update({
      where: { id },
      data: {
        name: dto.name,
        platform: dto.platform,
        messageType: dto.messageType,
        content: dto.content as object,
        isActive: dto.isActive,
      },
    });
  }

  async delete(id: string): Promise<void> {
    const existing = await this.prisma.messageTemplate.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Template not found');
    await this.prisma.messageTemplate.delete({ where: { id } });
  }
}
