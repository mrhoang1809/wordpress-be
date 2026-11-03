import { MenuLocation } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateMenuDto, SyncMenuItemsDto } from './dto/create-menu.dto';
import { RevalidationService } from '../revalidation/revalidation.service';
export declare class MenusService {
    private readonly prisma;
    private readonly revalidation;
    constructor(prisma: PrismaService, revalidation: RevalidationService);
    findAll(): Promise<({
        _count: {
            items: number;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        location: import(".prisma/client").$Enums.MenuLocation;
        isActive: boolean;
    })[]>;
    findById(id: string): Promise<{
        items: unknown[];
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        location: import(".prisma/client").$Enums.MenuLocation;
        isActive: boolean;
    }>;
    findPublicByLocation(location: MenuLocation): Promise<{
        items: unknown[];
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        location: import(".prisma/client").$Enums.MenuLocation;
        isActive: boolean;
    }>;
    create(dto: CreateMenuDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        location: import(".prisma/client").$Enums.MenuLocation;
        isActive: boolean;
    }>;
    update(id: string, dto: Partial<CreateMenuDto>): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        location: import(".prisma/client").$Enums.MenuLocation;
        isActive: boolean;
    }>;
    delete(id: string): Promise<void>;
    syncItems(menuId: string, dto: SyncMenuItemsDto): Promise<{
        items: unknown[];
        id?: string | undefined;
        createdAt?: Date | undefined;
        name?: string | undefined;
        updatedAt?: Date | undefined;
        location?: import(".prisma/client").$Enums.MenuLocation | undefined;
        isActive?: boolean | undefined;
    }>;
    private detectCycles;
    private validateItemType;
    private buildItemTree;
}
