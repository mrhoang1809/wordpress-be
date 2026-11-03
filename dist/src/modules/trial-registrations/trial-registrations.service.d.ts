import { PrismaService } from '../../database/prisma.service';
import { SettingsService } from '../settings/settings.service';
export interface CreateTrialRegistrationDto {
    name: string;
    phone: string;
    locationId?: string;
    source?: string;
}
export declare class TrialRegistrationsService {
    private readonly prisma;
    private readonly settingsService;
    private readonly logger;
    constructor(prisma: PrismaService, settingsService: SettingsService);
    create(dto: CreateTrialRegistrationDto): Promise<{
        success: boolean;
        id: string;
    }>;
    findAll(params?: {
        page?: number;
        pageSize?: number;
    }): Promise<{
        data: ({
            location: {
                name: string;
                address: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            name: string;
            phone: string;
            source: string | null;
            locationId: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
        };
    }>;
    private sendNotificationEmail;
}
