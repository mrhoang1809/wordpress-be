import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/configuration';
export declare class RevalidationService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService<AppConfig, true>);
    revalidate(type: string, slug: string): Promise<void>;
}
