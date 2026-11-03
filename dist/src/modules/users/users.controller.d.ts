import { RoleName } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
declare class AssignRoleDto {
    role: RoleName;
}
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
    findOne(id: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        status: string;
        roles: import(".prisma/client").$Enums.RoleName[];
        createdAt: Date;
        updatedAt: Date;
    }>;
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
    assignRole(id: string, dto: AssignRoleDto): Promise<void>;
    removeRole(id: string, role: RoleName): Promise<void>;
}
export {};
