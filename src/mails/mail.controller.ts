import { Controller, Get } from "@nestjs/common";
import { Users } from "src/db/entities/Users";
import { MailService } from "./mail.service";

@Controller("mail")
export class MailController {
  constructor(private readonly mailService: MailService) {}

  // @Get("send")
  // async sendMail() {
  //   await this.mailService.sendResetPasswordMail(
  //     "k.koudelka@protonmail.com",
  //     "en",
  //     "https://test.link",
  //   );
  //   // console.log(`${process.cwd()}/src/mails/templates`);

  //   return { status: "OK" };
  // }
}
