import { Injectable, Logger } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { Users } from "src/db/entities/Users";
import { LanguageType } from "src/types/types";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendResetPasswordMail(
    email: string,
    langCode: LanguageType,
    resetUrl: string,
  ) {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: "neodpovidejte@cekin.cz",
        subject: `[Čekin] ${
          langCode === "cs" ? "Žádost o obnovu hesla" : "Password reset"
        }`,
        template: __dirname + `/../resources/mails/resetpwd-${langCode}.hbs`,
        // template: "reg",
        context: {
          link: resetUrl,
        },
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  async sendConfirmationMail(
    email: string,
    langCode: LanguageType,
    confirmationLink: string,
  ) {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: "neodpovidejte@cekin.cz",
        subject: `[Čekin] ${
          langCode === "cs" ? "Potvrzení účtu" : "Verify your account"
        }`,
        template: __dirname + `/../resources/mails/reg-${langCode}.hbs`,
        // template: "reg",
        context: {
          link: confirmationLink,
        },
        // html: `<h1>Potvrzení registrace</h1>
        // <p>Děkujeme za registraci na našem webu. Pro dokončení registrace klikněte na následující odkaz:</p>
        // <a href="{{link}}">Potvrdit registraci</a>`,
      });
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
