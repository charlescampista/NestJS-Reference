import { Document } from 'mongoose';
export interface IUser extends Document{
    readonly id: number;
    readonly email: string;
    readonly first_name: string;
    readonly last_name: string;
    readonly avatar: string;
}