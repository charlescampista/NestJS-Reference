import { Body, Controller, Get, HttpStatus, Inject, Param, Post, Res, Delete } from '@nestjs/common';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { UserService } from 'src/service/user/user.service';
import { AvatarService } from 'src/service/avatar/avatar.service';
import { ClientProxy } from '@nestjs/microservices';
import { EmailService } from 'src/service/email/email.service';

@Controller('api')
export class UserController {

    constructor(
        @Inject('RMQ_SERVICE') private readonly client: ClientProxy,
        private readonly userService: UserService,
        private readonly avatarService: AvatarService,
        private readonly emailService: EmailService
    ) { }


    @Get('user/:userId')
    async getUserById(@Res() response, @Param() { userId }) {

        try {
            const user = await this.userService.getUserById(userId);
            return response.status(HttpStatus.OK).json(user);

        } catch (error) {
            return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: error
            });
        }
    }

    @Get('user/:userId/avatar')
    async getUserAvatar(@Res() response, @Param() { userId }) {

        try {
            const avatar = await this.avatarService.getAvatarByUserId(userId);
            
            if(!avatar)  {
                const isCreated = await this.userService.getAvatar(userId);
                if (!isCreated) return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong" });
                const base64ImageString = await this.userService.getImageBase64(userId);
                if (!base64ImageString) return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong" });
                const newAvatar = await this.avatarService.createAvatar({ userId: userId, base64Image: base64ImageString });
                if (!newAvatar) return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong" });
                return response.status(HttpStatus.CREATED).json({ message: "The image has been created", base64: base64ImageString });
            } 
              
            const decodedImage = await this.userService.decodeBase64Image(avatar.base64Image);
            response.setHeader('Content-Disposition', `attachment; filename=${userId}.${decodedImage.type}`);
            response.setHeader('Content-Type', `image/${decodedImage.type}`);
            return response.send(decodedImage.data);

        } catch (error) {
            console.log(error);
            return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong" });
        }
    }

    @Post('users')
    async createUser(@Res() response, @Body() createUserDto: CreateUserDto) {
        try {
            const newUser = await this.userService.createUser(createUserDto);
            this.client.emit<any>('New register added', "The user was created successfully");
            this.emailService.sendEmail('charlescampista@gmail.com',"postmaster@sandbox07f6b7752e5442838c06de3e9267e66a.mailgun.org","Test Subject", "Message Subject");
            return response.status(HttpStatus.CREATED).json({
                message: 'User has been created successfully',
                newUser,
            });
        } catch (err) {
            return response.status(HttpStatus.BAD_REQUEST).json({
                statusCode: 400,
                message: 'Error: User not created!',
                error: 'Bad Request'
            });
        }
    }

    @Delete('user/:userId/avatar')
    async deleteUserAvatar(@Res() response, @Param() { userId }) {

        try {
            const avatar = await this.avatarService.getAvatarByUserId(userId);
            
            if(avatar)  {
                const isRemoved = await this.userService.removeAvatar(userId);
                if (!isRemoved) return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong" });
                //const base64ImageString = await this.userService.getImageBase64(userId);
                //if (!base64ImageString) return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong" });
                const isRemovedFromDb = await this.avatarService.removeAvatarByUserId(userId);
                if (!isRemovedFromDb) return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong" });
                return response.status(HttpStatus.OK).json({ message: "The image has been removed"});
            } 
            return response.status(HttpStatus.NOT_FOUND).json({ message: "This user doesn't exist" });


        } catch (error) {
            console.log(error);
            return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong" });
        }
    }
    

}
