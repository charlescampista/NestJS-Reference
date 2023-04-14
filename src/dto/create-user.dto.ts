import { IsNotEmpty, IsNumber, IsString } from "class-validator";
export class CreateUserDto {
    @IsNumber()
    @IsNotEmpty()
    readonly id: number;
    @IsString()
    @IsNotEmpty()
    readonly email: string;
    
    @IsString()
    @IsNotEmpty()
    readonly first_name: string;
    @IsString()
    @IsNotEmpty()
    readonly last_name: string;
    @IsString()
    @IsNotEmpty()
    readonly avatar: string;
}