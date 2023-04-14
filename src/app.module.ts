import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserSchema } from './schema/user.schema';
import { AvatarSchema } from './schema/avatar.schema';
import { UserService } from './service/user/user.service';
import { UserController } from './controller/user/user.controller';
import { HttpModule } from '@nestjs/axios';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AvatarService } from './service/avatar/avatar.service';
import { EmailService } from './service/email/email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validate } from 'config/env.validation';

/*
* The project was implented the best way I could, I haven't used NestJS and RBTMQ Before please take it into account
* I've faced a hard time trying to make environment variables visible to the system, if it doesn't work it is
* Possible to test the project adding the string directly.
* all the endpoits required were implemented.
* I haven't written unit test due to lack of time.
* 
* Whatever is the result! THANKS FOR THE OPORTUNITY ALREADY!
*/


@Module({
  imports: [
  MongooseModule.forRoot(process.env.MONGO_CONNECTION,{dbName: process.env.MONGO_DATABASE}),
  MongooseModule.forFeature([{ name: 'User', schema: UserSchema },{ name: 'Avatar', schema: AvatarSchema }]),
  HttpModule,
  ClientsModule.register([
    {
      name: process.env.RMQ_NAME,
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RMQ_CONNECTION],
        queue: process.env.RMQ_QUEUE,
        queueOptions: {
          durable: true
        },
      },
    },
  ]),
  MailerModule.forRoot({
    transport: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      auth: { 
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      ignoreTLS: true,
    },
    defaults: { 
      from: '"',
    },
  }),
  ConfigModule.forRoot({
    validate,
    //isGlobal: true
  }),
  ],
  controllers: [AppController, UserController],
  providers: [AppService, UserService, AvatarService, EmailService, ConfigService],
})
export class AppModule {}
