import { IsNotEmpty, IsNumber, IsString} from "class-validator";
export class CreateAvatarDto {
   
    @IsNumber()
    @IsNotEmpty()
    readonly userId: number;
    @IsString()
    @IsNotEmpty()
    readonly base64Image: string;
}