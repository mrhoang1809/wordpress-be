import { MessagePlatform } from '@prisma/client';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/template.dto';
export declare class TemplatesController {
    private readonly templatesService;
    constructor(templatesService: TemplatesService);
    findAll(platform?: MessagePlatform): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        isActive: boolean;
        content: import("@prisma/client/runtime/library").JsonValue;
        platform: import(".prisma/client").$Enums.MessagePlatform;
        messageType: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        isActive: boolean;
        content: import("@prisma/client/runtime/library").JsonValue;
        platform: import(".prisma/client").$Enums.MessagePlatform;
        messageType: string;
    }>;
    create(dto: CreateTemplateDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        isActive: boolean;
        content: import("@prisma/client/runtime/library").JsonValue;
        platform: import(".prisma/client").$Enums.MessagePlatform;
        messageType: string;
    }>;
    update(id: string, dto: UpdateTemplateDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        isActive: boolean;
        content: import("@prisma/client/runtime/library").JsonValue;
        platform: import(".prisma/client").$Enums.MessagePlatform;
        messageType: string;
    }>;
    delete(id: string): Promise<void>;
}
