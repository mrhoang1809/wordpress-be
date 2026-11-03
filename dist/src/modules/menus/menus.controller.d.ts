import { MenuLocation } from '@prisma/client';
import { MenusService } from './menus.service';
import { CreateMenuDto, SyncMenuItemsDto } from './dto/create-menu.dto';
export declare class MenusController {
    private readonly menusService;
    constructor(menusService: MenusService);
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
    findOne(id: string): Promise<{
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
    update(id: string, dto: CreateMenuDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        location: import(".prisma/client").$Enums.MenuLocation;
        isActive: boolean;
    }>;
    delete(id: string): Promise<void>;
    syncItems(id: string, dto: SyncMenuItemsDto): Promise<{
        items: unknown[];
        id?: string | undefined;
        createdAt?: Date | undefined;
        name?: string | undefined;
        updatedAt?: Date | undefined;
        location?: import(".prisma/client").$Enums.MenuLocation | undefined;
        isActive?: boolean | undefined;
    }>;
}
export declare class PublicMenusController {
    private readonly menusService;
    constructor(menusService: MenusService);
    findPublic(location: MenuLocation): Promise<{
        items: unknown[];
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        location: import(".prisma/client").$Enums.MenuLocation;
        isActive: boolean;
    }>;
}
