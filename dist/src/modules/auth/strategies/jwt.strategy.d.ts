import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { AppConfig } from '../../../config/configuration';
import { JwtPayload } from '../../../common/types/jwt-payload.type';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor(configService: ConfigService<AppConfig, true>);
    validate(payload: JwtPayload): JwtPayload;
}
export {};
