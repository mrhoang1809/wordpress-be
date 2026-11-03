export declare enum SortOrder {
    ASC = "asc",
    DESC = "desc"
}
export declare class PaginationQueryDto {
    page?: number;
    pageSize?: number;
    search?: string;
    sortOrder?: SortOrder;
}
export interface PaginationMeta {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}
export declare function paginate<T>(data: T[], total: number, page: number, pageSize: number): PaginatedResponse<T>;
