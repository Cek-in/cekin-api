import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { MailService } from "./mail.service";
import { MailController } from "./mail.controller";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MailerModule.forRoot({
      //   transport: `smtps://${process.env.EMAIL_NOREPLY_USERNAME}:${process.env.EMAIL_NOREPLY_PASSWORD}@${process.env.EMAIL_SMTP}`,
      defaults: {
        from: 'Neodpovídejte - ČekIn" <neodpovidejte@cekin.cz>',
      },
      transport: {
        host: process.env.EMAIL_SMTP,
        port: 465,
        ignoreTLS: true,
        secure: true,
        auth: {
          user: process.env.EMAIL_NOREPLY_USERNAME,
          pass: process.env.EMAIL_NOREPLY_PASSWORD,
        },
      },
      //   preview: true,
      template: {
        // dir: path.resolve("./resources/mail/"),
        dir: __dirname + "/../resources/mails/",
        adapter: new HandlebarsAdapter(undefined, {
          inlineCssEnabled: true,
          inlineCssOptions: {
            url: " ",
            preserveMediaQueries: true,
            applyStyleTags: true,
          },
        }),

        options: {
          strict: true,
        },
      },
    }),
  ],
  controllers: [MailController],
  providers: [MailService],
})
export class MailModule {}
