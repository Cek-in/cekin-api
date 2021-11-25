import { Injectable, Logger } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { Users } from "src/db/entities/Users";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendResetPasswordMail(user: Users, resetUrl: string) {
    try {
      this.logger.log(`Sending pwd reset mail to ${user.email}`);
      await this.mailerService.sendMail({
        to: user.email,
        from: "neodpovidejte@cekin.cz",
        subject: "Žádost o obnovu hesla",
        template: __dirname + `/../resources/mails/resetpwd.hbs`,
        // template: "reg",
        context: {
          link: resetUrl,
          fullName: user.fullName,
        },
      });
      this.logger.log(`Pwd reset mail sent to ${user.email}`);
    } catch (error) {
      this.logger.error(error);
    }
  }

  async sendConfirmationMail(user: Users, confirmationLink: string) {
    try {
      this.logger.log(`Sending confirmation mail to ${user.email}`);
      await this.mailerService.sendMail({
        to: user.email,
        from: "neodpovidejte@cekin.cz",
        subject: "Potvrzení registrace",
        template: __dirname + `/../resources/mails/reg.hbs`,
        // template: "reg",
        context: {
          link: confirmationLink,
          fullName: `${user.firstName} ${user.lastName}`,
        },
        // html: `<h1>Potvrzení registrace</h1>
        // <p>Děkujeme za registraci na našem webu. Pro dokončení registrace klikněte na následující odkaz:</p>
        // <a href="{{link}}">Potvrdit registraci</a>`,
      });
      this.logger.log(`Confirmation mail sent to ${user.email}`);
    } catch (error) {
      this.logger.error(error);
    }
  }

  sendMail() {
    return this.mailerService.sendMail({
      to: "k.koudelka@protonmail.com",
      from: "neodpovidejte@cekin.cz",
      template: `${process.cwd()}/src/mails/templates/reg`,
      subject: "Testovaci mail",
      context: {},
    });
    // try {
    //   await this.mailerService.sendMail({
    //     to: "k.koudelka@protonmail.com",
    //     from: "neodpovidejte@cekin.cz",
    //     template: `${process.cwd()}/src/mails/templates/reg`,
    //     subject: "Testovaci mail",
    //     context: {},
    //   });
    //   this.logger.log(`Mail sent`);
    // } catch (e) {
    //   this.logger.error(e);
    // }
  }
}
