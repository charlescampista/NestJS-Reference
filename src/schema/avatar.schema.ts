import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
@Schema()
export class Avatar {
   @Prop()
   userId: number;
   @Prop()
   base64Image: string;
}
export const AvatarSchema = SchemaFactory.createForClass(Avatar);