import { BaseEntity } from './BaseEntity';

export interface Customer extends BaseEntity {
    extId?: string;
    userId?: number;
}

export interface CreateCustomerRequest {
    extId: string;
    userId?: number;
}
