export declare class CreateSubscriberDto {
    name: string;
    phone?: string;
    email?: string;
    zaloUserId?: string;
    facebookPsid?: string;
    tags?: string[];
    isActive?: boolean;
    notes?: string;
}
export declare class UpdateSubscriberDto {
    name?: string;
    phone?: string;
    email?: string;
    zaloUserId?: string;
    facebookPsid?: string;
    tags?: string[];
    isActive?: boolean;
    notes?: string;
}
export declare class ImportSubscribersDto {
    subscribers: CreateSubscriberDto[];
}
