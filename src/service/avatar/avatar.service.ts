import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAvatarDto } from 'src/dto/create-avatar.dto';
import { IAvatar } from 'src/interface/avatar.interface';

@Injectable()
export class AvatarService {

    constructor(@InjectModel('Avatar') private avatarModel: Model<IAvatar>) { }
    async createAvatar(createAvatarDto: CreateAvatarDto): Promise<IAvatar> {
        const newAvatar = await new this.avatarModel(createAvatarDto);
        return newAvatar.save();
    }
    
    async getAvatarByUserId(userId: number): Promise<IAvatar> {
         return await this.avatarModel.findOne({userId});
    }
    
    async removeAvatarByUserId(userId: number): Promise<IAvatar> {
         return await this.avatarModel.findOneAndRemove({userId});
    }

}
