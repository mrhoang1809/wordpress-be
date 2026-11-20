import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AppConfig } from '../../../config/configuration';
import { JwtPayload } from '../../../common/types/jwt-payload.type';
declare const JwtRefreshStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtRefreshStrategy extends JwtRefreshStrategy_base {
    constructor(configService: ConfigService<AppConfig, true>);
    validate(req: Request, payload: JwtPayload): JwtPayload & {
        refreshToken: string;
    };
}
export {};
