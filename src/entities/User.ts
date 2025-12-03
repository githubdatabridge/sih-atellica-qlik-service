import { BaseEntity } from './BaseEntity';

export interface User extends BaseEntity {
    name?: string;
    isAdmin?: boolean;
    webhookSecret?: string;
}
