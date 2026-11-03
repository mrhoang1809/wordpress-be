import { RoleName } from '@prisma/client';
export declare class UserProfileDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: RoleName[];
    permissions: string[];
}
export declare class LoginResponseDto {
    accessToken: string;
    user: UserProfileDto;
}
