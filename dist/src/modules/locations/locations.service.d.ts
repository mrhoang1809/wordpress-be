import { PrismaService } from '../../database/prisma.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CreateLocationDto, Location, UpdateLocationDto } from './dto/location.dto';
export declare class LocationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: PaginationQueryDto): Promise<import("../../common/dto/pagination.dto").PaginatedResponse<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        email: string | null;
        isActive: boolean;
        slug: string;
        order: number;
        address: string;
        phone: string | null;
        latitude: number | null;
        longitude: number | null;
    }>>;
    findById(id: string): Promise<Location>;
    findActive(): Promise<{
        createdAt: string;
        updatedAt: string;
        id: string;
        name: string;
        email: string | null;
        isActive: boolean;
        slug: string;
        order: number;
        address: string;
        phone: string | null;
        latitude: number | null;
        longitude: number | null;
    }[]>;
    create(dto: CreateLocationDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        email: string | null;
        isActive: boolean;
        slug: string;
        order: number;
        address: string;
        phone: string | null;
        latitude: number | null;
        longitude: number | null;
    }>;
    update(id: string, dto: UpdateLocationDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        email: string | null;
        isActive: boolean;
        slug: string;
        order: number;
        address: string;
        phone: string | null;
        latitude: number | null;
        longitude: number | null;
    }>;
    delete(id: string): Promise<void>;
}
