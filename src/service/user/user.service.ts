import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { IUser } from 'src/interface/user.interface';

@Injectable()
export class UserService {

    constructor(@InjectModel('User') private userModel: Model<IUser>, private readonly httpService: HttpService) { }

    async createUser(createUserDto: CreateUserDto): Promise<IUser> {
        const newUser = await new this.userModel(createUserDto);
        return newUser.save();
    }

    async getUserById(userId: number): Promise<any> {
        const result = await this.httpService.get(`https://reqres.in/api/users/${userId}`).toPromise();
        return result.data.data;
    }


    async getAvatar(userId: number): Promise<boolean> {
        try {
            const user = await this.getUserById(userId);
            const saltOrRounds = 10;
            const hash = await bcrypt.hash(userId.toString(), saltOrRounds);
            //const writer = fs.createWriteStream(`./src/uploads/${hash}.jpg`); //Bcrypt generates forbidden charachters to name files in linux.
            const writer = fs.createWriteStream(`./src/uploads/${userId}.jpg`);
            const response = await this.httpService.axiosRef({
                url: user.avatar,
                method: 'GET',
                responseType: 'stream',
            });
            response.data.pipe(writer);

            return new Promise<boolean>((resolve, reject) => {
                writer.on('finish', () => {
                    console.log(`File ${userId}.jpg successfully saved!`);
                    resolve(true);
                });
                writer.on('error', (error) => {
                    console.error(`Error saving file ${userId}.jpg:`, error);
                    reject(false);
                });
            });

        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async removeAvatar(userId: number): Promise<boolean> {
        return new Promise((resolve, reject) => {
            fs.unlink(`./src/uploads/${userId}.jpg`, (error) => {
                if (error) {
                    console.error(error);
                    reject(false);
                } else {
                    console.log(`File deleted: ${userId}.jpg`);
                    resolve(true);
                }
            });
        });
    }

    async getImageBase64(userId: string): Promise<string> {
        try {
            const imagePath = `./src/uploads/${userId}.jpg`;
            const image = fs.readFileSync(imagePath);
            const base64Image = Buffer.from(image).toString('base64');
            return `data:image/png;base64,${base64Image}`;
        } catch (error) {
            console.error(error);
            throw new Error('Error converting image to base64');
        }
    }

    async decodeBase64Image(base64Image: string) {
        const matches = base64Image.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            throw new Error('Invalid input string');
        }
        const buffer = Buffer.from(matches[2], 'base64');
        return {
            type: matches[1],
            data: buffer
        };
    }


}
