import {
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { Response } from 'express';
import { AppConfig } from '../../config/configuration';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto, UserProfileDto } from './dto/auth-response.dto';
import { RoleName } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  async login(dto: LoginDto, res: Response): Promise<LoginResponseDto> {
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

    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.status !== 'ACTIVE') throw new UnauthorizedException('Account is not active');

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = [
      ...new Set(
        user.userRoles.flatMap((ur) =>
          ur.role.rolePermissions.map((rp) => rp.permission.action),
        ),
      ),
    ];

    const payload: JwtPayload = {
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

  async refresh(
    userId: string,
    rawRefreshToken: string,
    res: Response,
  ): Promise<{ accessToken: string }> {
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

    if (
      !storedToken ||
      storedToken.revokedAt ||
      storedToken.expiresAt < new Date() ||
      storedToken.userId !== userId
    ) {
      this.clearAuthCookies(res);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Revoke old token
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    const { user } = storedToken;
    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = [
      ...new Set(
        user.userRoles.flatMap((ur) =>
          ur.role.rolePermissions.map((rp) => rp.permission.action),
        ),
      ),
    ];

    const payload: JwtPayload = { sub: user.id, email: user.email, roles, permissions };
    const accessToken = await this.generateAccessToken(payload);
    await this.setRefreshTokenCookie(payload, res);

    return { accessToken };
  }

  async logout(userId: string, rawRefreshToken: string | undefined, res: Response): Promise<void> {
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

  async getProfile(userId: string): Promise<UserProfileDto> {
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

    const roles: RoleName[] = user.userRoles.map((ur) => ur.role.name);
    const permissions = [
      ...new Set(
        user.userRoles.flatMap((ur) =>
          ur.role.rolePermissions.map((rp) => rp.permission.action),
        ),
      ),
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

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private static readonly REFRESH_COOKIE = 'refreshToken';
  /** Path `/` so Next.js middleware on the frontend origin can see the cookie. */
  private static readonly REFRESH_COOKIE_PATH = '/';

  private cookieBase() {
    return {
      httpOnly: true as const,
      sameSite: 'lax' as const,
      path: AuthService.REFRESH_COOKIE_PATH,
      secure: this.configService.get('app', { infer: true }).nodeEnv === 'production',
    };
  }

  private clearAuthCookies(res: Response): void {
    res.clearCookie(AuthService.REFRESH_COOKIE, this.cookieBase());
    res.clearCookie(AuthService.REFRESH_COOKIE, { path: '/api/v1/auth/refresh' });
  }

  private async generateAccessToken(payload: JwtPayload): Promise<string> {
    const jwtConfig = this.configService.get('jwt', { infer: true });
    return this.jwtService.signAsync(payload, {
      secret: jwtConfig.secret,
      expiresIn: jwtConfig.accessExpiresIn,
    });
  }

  private async generateRefreshToken(payload: JwtPayload): Promise<string> {
    const jwtConfig = this.configService.get('jwt', { infer: true });
    return this.jwtService.signAsync(payload, {
      secret: jwtConfig.refreshSecret,
      expiresIn: jwtConfig.refreshExpiresIn,
    });
  }

  private async setRefreshTokenCookie(
    payload: JwtPayload,
    res: Response,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<void> {
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

    // Drop the previous path-scoped cookie if it still exists from older builds.
    res.clearCookie(AuthService.REFRESH_COOKIE, { path: '/api/v1/auth/refresh' });
    res.cookie(AuthService.REFRESH_COOKIE, rawToken, {
      ...this.cookieBase(),
      expires: expiresAt,
    });
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
