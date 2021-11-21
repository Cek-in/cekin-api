import { Controller, Get } from "@nestjs/common";
import { Users } from "src/db/entities/Users";
import { MailService } from "./mail.service";

@Controller("mail")
export class MailController {
  constructor(private readonly mailService: MailService) {}

  //   @Get("send")
  //   async sendMail() {
  //     const user = new Users();
  //     user.email = "k.koudelka@protonmail.com";

  //     await this.mailService.sendConfirmationMail(user, "https://test.link");
  //     // console.log(`${process.cwd()}/src/mails/templates`);

  //     return { status: "OK" };
  //   }
}
