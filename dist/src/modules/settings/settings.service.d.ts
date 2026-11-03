import { PrismaService } from '../../database/prisma.service';
export interface UpdateSettingsDto {
    siteName?: string;
    siteDescription?: string;
    logoId?: string;
    faviconId?: string;
    defaultSeoTitle?: string;
    defaultSeoDescription?: string;
    defaultSeoImage?: string;
    socialLinks?: Record<string, string>;
    hotline?: string;
    zaloUrl?: string;
    facebookUrl?: string;
    trialNotifyEmail?: string;
}
export declare class SettingsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    get(): Promise<{
        id: string;
        updatedAt: Date;
        siteName: string;
        siteDescription: string | null;
        logoId: string | null;
        faviconId: string | null;
        defaultSeoTitle: string | null;
        defaultSeoDescription: string | null;
        defaultSeoImage: string | null;
        socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
        hotline: string | null;
        zaloUrl: string | null;
        facebookUrl: string | null;
        trialNotifyEmail: string | null;
    }>;
    update(dto: UpdateSettingsDto): Promise<{
        id: string;
        updatedAt: Date;
        siteName: string;
        siteDescription: string | null;
        logoId: string | null;
        faviconId: string | null;
        defaultSeoTitle: string | null;
        defaultSeoDescription: string | null;
        defaultSeoImage: string | null;
        socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
        hotline: string | null;
        zaloUrl: string | null;
        facebookUrl: string | null;
        trialNotifyEmail: string | null;
    }>;
}
