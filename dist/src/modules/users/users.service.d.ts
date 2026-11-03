import { RoleName } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: PaginationQueryDto): Promise<import("../../common/dto/pagination.dto").PaginatedResponse<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        status: string;
        roles: import(".prisma/client").$Enums.RoleName[];
        createdAt: Date;
        updatedAt: Date;
    }>>;
    findById(id: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        status: string;
        roles: import(".prisma/client").$Enums.RoleName[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByEmail(email: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        passwordHash: string;
        firstName: string;
        lastName: string;
        status: import(".prisma/client").$Enums.UserStatus;
        avatarId: string | null;
    } | null>;
    create(dto: CreateUserDto): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        status: string;
        roles: import(".prisma/client").$Enums.RoleName[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateUserDto): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        status: string;
        roles: import(".prisma/client").$Enums.RoleName[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    delete(id: string): Promise<void>;
    assignRole(userId: string, roleName: RoleName): Promise<void>;
    removeRole(userId: string, roleName: RoleName): Promise<void>;
    private mapUser;
}
