import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { LocationsService } from './locations.service';
import { CreateLocationDto, UpdateLocationDto } from './dto/location.dto';
export declare class LocationsController {
    private readonly service;
    constructor(service: LocationsService);
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
    findOne(id: string): Promise<import("./dto/location.dto").Location>;
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
export declare class PublicLocationsController {
    private readonly service;
    constructor(service: LocationsService);
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
}
