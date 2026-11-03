"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const prisma_service_1 = require("../../database/prisma.service");
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async login(dto, res) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: {
                userRoles: {
                    include: {
                        role: {
                            include: {
                                rolePermissions: {
                                    include: { permission: true },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        if (user.status !== 'ACTIVE')
            throw new common_1.UnauthorizedException('Account is not active');
        const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordValid)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const roles = user.userRoles.map((ur) => ur.role.name);
        const permissions = [
            ...new Set(user.userRoles.flatMap((ur) => ur.role.rolePermissions.map((rp) => rp.permission.action))),
        ];
        const payload = {
            sub: user.id,
            email: user.email,
            roles,
            permissions,
        };
        const accessToken = await this.generateAccessToken(payload);
        await this.setRefreshTokenCookie(payload, res);
        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                roles,
                permissions,
            },
        };
    }
    async refresh(userId, rawRefreshToken, res) {
        const tokenHash = this.hashToken(rawRefreshToken);
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { token: tokenHash },
            include: {
                user: {
                    include: {
                        userRoles: {
                            include: {
                                role: {
                                    include: {
                                        rolePermissions: { include: { permission: true } },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!storedToken ||
            storedToken.revokedAt ||
            storedToken.expiresAt < new Date() ||
            storedToken.userId !== userId) {
            this.clearAuthCookies(res);
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        await this.prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: { revokedAt: new Date() },
        });
        const { user } = storedToken;
        const roles = user.userRoles.map((ur) => ur.role.name);
        const permissions = [
            ...new Set(user.userRoles.flatMap((ur) => ur.role.rolePermissions.map((rp) => rp.permission.action))),
        ];
        const payload = { sub: user.id, email: user.email, roles, permissions };
        const accessToken = await this.generateAccessToken(payload);
        await this.setRefreshTokenCookie(payload, res);
        return { accessToken };
    }
    async logout(userId, rawRefreshToken, res) {
        if (rawRefreshToken) {
            const tokenHash = this.hashToken(rawRefreshToken);
            await this.prisma.refreshToken
                .updateMany({
                where: { token: tokenHash, userId },
                data: { revokedAt: new Date() },
            })
                .catch(() => null);
        }
        this.clearAuthCookies(res);
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUniqueOrThrow({
            where: { id: userId },
            include: {
                userRoles: {
                    include: {
                        role: {
                            include: {
                                rolePermissions: { include: { permission: true } },
                            },
                        },
                    },
                },
            },
        });
        const roles = user.userRoles.map((ur) => ur.role.name);
        const permissions = [
            ...new Set(user.userRoles.flatMap((ur) => ur.role.rolePermissions.map((rp) => rp.permission.action))),
        ];
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            roles,
            permissions,
        };
    }
    cookieBase() {
        return {
            httpOnly: true,
            sameSite: 'lax',
            path: AuthService_1.REFRESH_COOKIE_PATH,
            secure: this.configService.get('app', { infer: true }).nodeEnv === 'production',
        };
    }
    clearAuthCookies(res) {
        res.clearCookie(AuthService_1.REFRESH_COOKIE, this.cookieBase());
        res.clearCookie(AuthService_1.REFRESH_COOKIE, { path: '/api/v1/auth/refresh' });
    }
    async generateAccessToken(payload) {
        const jwtConfig = this.configService.get('jwt', { infer: true });
        return this.jwtService.signAsync(payload, {
            secret: jwtConfig.secret,
            expiresIn: jwtConfig.accessExpiresIn,
        });
    }
    async generateRefreshToken(payload) {
        const jwtConfig = this.configService.get('jwt', { infer: true });
        return this.jwtService.signAsync(payload, {
            secret: jwtConfig.refreshSecret,
            expiresIn: jwtConfig.refreshExpiresIn,
        });
    }
    async setRefreshTokenCookie(payload, res, userAgent, ipAddress) {
        const rawToken = await this.generateRefreshToken(payload);
        const tokenHash = this.hashToken(rawToken);
        const expiresMs = 7 * 24 * 60 * 60 * 1000;
        const expiresAt = new Date(Date.now() + expiresMs);
        await this.prisma.refreshToken.create({
            data: {
                token: tokenHash,
                userId: payload.sub,
                expiresAt,
                userAgent,
                ipAddress,
            },
        });
        res.clearCookie(AuthService_1.REFRESH_COOKIE, { path: '/api/v1/auth/refresh' });
        res.cookie(AuthService_1.REFRESH_COOKIE, rawToken, {
            ...this.cookieBase(),
            expires: expiresAt,
        });
    }
    hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
};
exports.AuthService = AuthService;
AuthService.REFRESH_COOKIE = 'refreshToken';
AuthService.REFRESH_COOKIE_PATH = '/';
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map