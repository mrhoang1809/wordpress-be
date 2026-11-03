import { RoleName } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: RoleName[];
  permissions: string[];
  iat?: number;
  exp?: number;
}
