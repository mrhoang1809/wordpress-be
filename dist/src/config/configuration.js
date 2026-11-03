"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationSchema = exports.configuration = void 0;
const Joi = require("joi");
const configuration = () => ({
    database: {
        url: process.env.DATABASE_URL,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    },
    app: {
        port: parseInt(process.env.PORT ?? '3001', 10),
        nodeEnv: process.env.NODE_ENV ?? 'development',
    },
    cors: {
        allowedOrigins: (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000').split(','),
    },
    revalidation: {
        secret: process.env.REVALIDATION_SECRET ?? '',
        url: process.env.REVALIDATION_URL ?? '',
    },
    media: {
        maxUploadSizeMb: parseInt(process.env.MAX_UPLOAD_SIZE_MB ?? '10', 10),
        uploadDest: process.env.UPLOAD_DEST ?? './uploads',
    },
    messaging: {
        zalo: {
            oaId: process.env.ZALO_OA_ID ?? '',
            oaSecret: process.env.ZALO_OA_SECRET ?? '',
            oaRefreshToken: process.env.ZALO_OA_REFRESH_TOKEN ?? '',
            apiUrl: process.env.ZALO_API_URL ?? 'https://openapi.zalo.me/v2.0',
        },
        facebook: {
            pageId: process.env.FACEBOOK_PAGE_ID ?? '',
            pageAccessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN ?? '',
            appSecret: process.env.FACEBOOK_APP_SECRET ?? '',
            graphApiVersion: process.env.FACEBOOK_GRAPH_API_VERSION ?? 'v21.0',
        },
        batchSize: parseInt(process.env.MESSAGING_BATCH_SIZE ?? '20', 10),
        rateLimitMs: parseInt(process.env.MESSAGING_RATE_LIMIT_MS ?? '200', 10),
    },
});
exports.configuration = configuration;
exports.validationSchema = Joi.object({
    DATABASE_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().min(32).required(),
    JWT_REFRESH_SECRET: Joi.string().min(32).required(),
    JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
    PORT: Joi.number().default(3001),
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    ALLOWED_ORIGINS: Joi.string().default('http://localhost:3000'),
    REVALIDATION_SECRET: Joi.string().default(''),
    REVALIDATION_URL: Joi.string().default(''),
    MAX_UPLOAD_SIZE_MB: Joi.number().default(10),
    UPLOAD_DEST: Joi.string().default('./uploads'),
    ZALO_OA_ID: Joi.string().allow('').default(''),
    ZALO_OA_SECRET: Joi.string().allow('').default(''),
    ZALO_OA_REFRESH_TOKEN: Joi.string().allow('').default(''),
    ZALO_API_URL: Joi.string().default('https://openapi.zalo.me/v2.0'),
    FACEBOOK_PAGE_ID: Joi.string().allow('').default(''),
    FACEBOOK_PAGE_ACCESS_TOKEN: Joi.string().allow('').default(''),
    FACEBOOK_APP_SECRET: Joi.string().allow('').default(''),
    FACEBOOK_GRAPH_API_VERSION: Joi.string().default('v21.0'),
    MESSAGING_BATCH_SIZE: Joi.number().default(20),
    MESSAGING_RATE_LIMIT_MS: Joi.number().default(200),
});
//# sourceMappingURL=configuration.js.map