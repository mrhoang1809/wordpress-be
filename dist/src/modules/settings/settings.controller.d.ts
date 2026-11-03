import { SettingsService, UpdateSettingsDto } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
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
