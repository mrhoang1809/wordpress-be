import { MenuItemType, MenuLocation } from '@prisma/client';
export declare class CreateMenuDto {
    name: string;
    location: MenuLocation;
    isActive?: boolean;
}
export declare class MenuItemDto {
    id: string;
    label: string;
    type: MenuItemType;
    parentId?: string;
    order: number;
    pageId?: string;
    postId?: string;
    categoryId?: string;
    customUrl?: string;
    openInNewTab?: boolean;
    isActive?: boolean;
}
export declare class SyncMenuItemsDto {
    items: MenuItemDto[];
}
