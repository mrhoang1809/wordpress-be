import * as Joi from 'joi';
export interface AppConfig {
    database: {
        url: string;
    };
    jwt: {
        secret: string;
        refreshSecret: string;
        accessExpiresIn: string;
        refreshExpiresIn: string;
    };
    app: {
        port: number;
        nodeEnv: string;
    };
    cors: {
        allowedOrigins: string[];
    };
    revalidation: {
        secret: string;
        url: string;
    };
    media: {
        maxUploadSizeMb: number;
        uploadDest: string;
    };
    messaging: {
        zalo: {
            oaId: string;
            oaSecret: string;
            oaRefreshToken: string;
            apiUrl: string;
        };
        facebook: {
            pageId: string;
            pageAccessToken: string;
            appSecret: string;
            graphApiVersion: string;
        };
        batchSize: number;
        rateLimitMs: number;
    };
}
export declare const configuration: () => AppConfig;
export declare const validationSchema: Joi.ObjectSchema<any>;
