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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma_service_1 = require("../../database/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const USER_SELECT = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    userRoles: {
        select: {
            role: { select: { name: true } },
        },
    },
};
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 20;
        const skip = (page - 1) * pageSize;
        const where = query.search
            ? {
                OR: [
                    { email: { contains: query.search, mode: 'insensitive' } },
                    { firstName: { contains: query.search, mode: 'insensitive' } },
                    { lastName: { contains: query.search, mode: 'insensitive' } },
                ],
            }
            : {};
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({ where, skip, take: pageSize, select: USER_SELECT }),
            this.prisma.user.count({ where }),
        ]);
        return (0, pagination_dto_1.paginate)(users.map(this.mapUser), total, page, pageSize);
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({ where: { id }, select: USER_SELECT });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return this.mapUser(user);
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({ where: { email } });
    }
    async create(dto) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing)
            throw new common_1.ConflictException('Email already in use');
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const roles = dto.roles ?? [client_1.RoleName.AUTHOR];
        const roleRecords = await this.prisma.role.findMany({
            where: { name: { in: roles } },
        });
        if (roleRecords.length !== roles.length) {
            throw new common_1.BadRequestException('One or more roles not found');
        }
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                firstName: dto.firstName,
                lastName: dto.lastName,
                userRoles: {
                    create: roleRecords.map((r) => ({ roleId: r.id })),
                },
            },
            select: USER_SELECT,
        });
        return this.mapUser(user);
    }
    async update(id, dto) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const data = {};
        if (dto.firstName !== undefined)
            data.firstName = dto.firstName;
        if (dto.lastName !== undefined)
            data.lastName = dto.lastName;
        if (dto.status !== undefined)
            data.status = dto.status;
        if (dto.password !== undefined)
            data.passwordHash = await bcrypt.hash(dto.password, 12);
        const updated = await this.prisma.user.update({
            where: { id },
            data,
            select: USER_SELECT,
        });
        return this.mapUser(updated);
    }
    async delete(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        await this.prisma.user.delete({ where: { id } });
    }
    async assignRole(userId, roleName) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const role = await this.prisma.role.findUnique({ where: { name: roleName } });
        if (!role)
            throw new common_1.NotFoundException('Role not found');
        await this.prisma.userRole.upsert({
            where: { userId_roleId: { userId, roleId: role.id } },
            create: { userId, roleId: role.id },
            update: {},
        });
    }
    async removeRole(userId, roleName) {
        const role = await this.prisma.role.findUnique({ where: { name: roleName } });
        if (!role)
            throw new common_1.NotFoundException('Role not found');
        await this.prisma.userRole.deleteMany({
            where: { userId, roleId: role.id },
        });
    }
    mapUser(user) {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            status: user.status,
            roles: user.userRoles.map((ur) => ur.role.name),
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map