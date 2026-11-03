import { UserStatus } from '@prisma/client';
export declare class UpdateUserDto {
    firstName?: string;
    lastName?: string;
    password?: string;
    status?: UserStatus;
}
