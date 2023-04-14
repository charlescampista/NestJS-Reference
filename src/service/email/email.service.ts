import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
    constructor(private mailerService: MailerService) {}
    async sendEmail(destination: string, sender: string, subject: string, message: string) {
        await this.mailerService.sendMail({
          to: destination,
          from: sender,
          subject: subject,
          html: `<h3 style="color: blue">${message}</h3>`,
        });
      }
}
