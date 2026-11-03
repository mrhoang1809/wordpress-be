import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { paginate, PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CreateLocationDto, Location, UpdateLocationDto } from './dto/location.dto';

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const searchVal = (query.search || '').toLowerCase();
    const where = searchVal
      ? {
          OR: [
            { name: { contains: searchVal, mode: 'insensitive' as const } },
            { address: { contains: searchVal, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.location.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { order: 'asc' },
      }),
      this.prisma.location.count({ where }),
    ]);

    return paginate(items, total, page, pageSize);
  }

  async findById(id: string): Promise<Location> {
    const location = await this.prisma.location.findUnique({ where: { id } });
    if (!location) throw new NotFoundException('Location not found');
    return {
      ...location,
      createdAt: location.createdAt.toISOString(),
      updatedAt: location.updatedAt.toISOString(),
    };
  }

  async findActive() {
    const locations = await this.prisma.location.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    return locations.map((l) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
    }));
  }

  async create(dto: CreateLocationDto) {
    return this.prisma.location.create({
      data: {
        ...dto,
        order: dto.order ?? 0,
        isActive: dto.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, dto: UpdateLocationDto) {
    const existing = await this.prisma.location.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Location not found');
    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.slug !== undefined) updateData.slug = dto.slug;
    if (dto.address !== undefined) updateData.address = dto.address;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.latitude !== undefined) updateData.latitude = dto.latitude;
    if (dto.longitude !== undefined) updateData.longitude = dto.longitude;
    if (dto.order !== undefined) updateData.order = dto.order;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    return this.prisma.location.update({
      where: { id },
      data: { ...updateData, updatedAt: new Date() },
    });
  }

  async delete(id: string): Promise<void> {
    const existing = await this.prisma.location.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Location not found');
    await this.prisma.location.delete({ where: { id } });
  }
}
