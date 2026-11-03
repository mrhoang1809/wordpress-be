"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const cookieParser = require("cookie-parser");
const express = require("express");
const path = require("path");
const app_module_1 = require("./app.module");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const permissions_guard_1 = require("./common/guards/permissions.guard");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get((config_1.ConfigService));
    const reflector = app.get(core_1.Reflector);
    app.setGlobalPrefix('api/v1');
    const allowedOrigins = configService.get('cors', { infer: true }).allowedOrigins;
    app.enableCors({
        origin: allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Authorization', 'Content-Type', 'x-revalidation-secret'],
    });
    app.use(cookieParser());
    const uploadDest = configService.get('media', { infer: true }).uploadDest;
    app.use('/api/v1/media/uploads', express.static(path.resolve(uploadDest)));
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor());
    app.useGlobalGuards(new jwt_auth_guard_1.JwtAuthGuard(reflector), new permissions_guard_1.PermissionsGuard(reflector));
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('CMS API')
        .setDescription('WordPress-like CMS with Block-Based Page Builder')
        .setVersion('1.0')
        .addBearerAuth()
        .addCookieAuth('refreshToken')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: { persistAuthorization: true },
    });
    const port = configService.get('app', { infer: true }).port;
    await app.listen(port);
    console.log(`🚀 CMS Backend running at http://localhost:${port}/api/v1`);
    console.log(`📚 Swagger UI at http://localhost:${port}/api/docs`);
}
bootstrap().catch((err) => {
    console.error('Failed to start application:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map