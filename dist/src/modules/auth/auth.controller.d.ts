import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto, UserProfileDto } from './dto/auth-response.dto';
import { JwtPayload } from '../../common/types/jwt-payload.type';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto, res: Response): Promise<LoginResponseDto>;
    refresh(user: JwtPayload & {
        refreshToken: string;
    }, res: Response): Promise<{
        accessToken: string;
    }>;
    logout(user: JwtPayload, req: Request, res: Response): Promise<void>;
    getProfile(user: JwtPayload): Promise<UserProfileDto>;
}
