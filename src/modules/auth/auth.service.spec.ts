import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../../database/prisma.service';

// Mock bcryptjs so tests don't require native bindings
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn().mockResolvedValue('$hashed$'),
}));

import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: jest.Mocked<PrismaService>;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'jwt') {
        return {
          secret: 'test-secret-at-least-32-chars-long-enough',
          refreshSecret: 'test-refresh-secret-at-least-32-chars-long',
          accessExpiresIn: '15m',
          refreshExpiresIn: '7d',
        };
      }
      if (key === 'app') return { nodeEnv: 'test', port: 3001 };
      return null;
    }),
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mock-access-token'),
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@test.com',
    passwordHash: '$hashed$',
    firstName: 'Test',
    lastName: 'User',
    status: 'ACTIVE' as const,
    avatarId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    userRoles: [
      {
        role: {
          name: 'ADMIN' as const,
          rolePermissions: [
            { permission: { action: 'pages:create' } },
            { permission: { action: 'pages:publish' } },
          ],
        },
      },
    ],
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const prismaMock = {
      user: {
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
      },
      refreshToken: {
        create: jest.fn().mockResolvedValue({}),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    } as unknown as jest.Mocked<PrismaService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
  });

  describe('login', () => {
    it('should throw UnauthorizedException for unknown email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      const res = { cookie: jest.fn() } as any;
      await expect(
        service.login({ email: 'bad@test.com', password: 'pass' }, res),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const res = { cookie: jest.fn() } as any;
      await expect(
        service.login({ email: 'test@test.com', password: 'WrongPass' }, res),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        status: 'INACTIVE',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const res = { cookie: jest.fn() } as any;
      await expect(
        service.login({ email: 'test@test.com', password: 'Admin@1234' }, res),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return accessToken and user profile for valid credentials', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const res = { cookie: jest.fn() } as any;

      const result = await service.login(
        { email: 'test@test.com', password: 'Admin@1234' },
        res,
      );

      expect(result.accessToken).toBe('mock-access-token');
      expect(result.user.email).toBe('test@test.com');
      expect(result.user.roles).toContain('ADMIN');
      expect(result.user.permissions).toContain('pages:create');
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      (prisma.user.findUniqueOrThrow as jest.Mock).mockResolvedValue(mockUser);
      const profile = await service.getProfile('user-1');
      expect(profile.id).toBe('user-1');
      expect(profile.email).toBe('test@test.com');
    });
  });

  describe('logout', () => {
    it('should revoke refresh token without throwing', async () => {
      const res = { clearCookie: jest.fn() } as any;
      await expect(service.logout('user-1', 'some-token', res)).resolves.not.toThrow();
    });
  });
});
