import { TrialRegistrationsService } from './trial-registrations.service';
declare class CreateTrialDto {
    name: string;
    phone: string;
    locationId?: string;
    source?: string;
}
export declare class PublicTrialRegistrationsController {
    private readonly svc;
    constructor(svc: TrialRegistrationsService);
    create(dto: CreateTrialDto): Promise<{
        success: boolean;
        id: string;
    }>;
}
export declare class AdminTrialRegistrationsController {
    private readonly svc;
    constructor(svc: TrialRegistrationsService);
    findAll(page?: string, pageSize?: string): Promise<{
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
}
export {};
