import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { AppConfig } from '../../config/configuration';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto, UserProfileDto } from './dto/auth-response.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService<AppConfig, true>);
    login(dto: LoginDto, res: Response): Promise<LoginResponseDto>;
    refresh(userId: string, rawRefreshToken: string, res: Response): Promise<{
        accessToken: string;
    }>;
    logout(userId: string, rawRefreshToken: string | undefined, res: Response): Promise<void>;
    getProfile(userId: string): Promise<UserProfileDto>;
    private static readonly REFRESH_COOKIE;
    private static readonly REFRESH_COOKIE_PATH;
    private cookieBase;
    private clearAuthCookies;
    private generateAccessToken;
    private generateRefreshToken;
    private setRefreshTokenCookie;
    private hashToken;
}
