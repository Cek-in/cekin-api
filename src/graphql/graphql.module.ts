import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Users } from "src/db/entities/Users";
import { MailService } from "src/mails/mail.service";
import { TestResolver } from "./resolvers/test.resolver";
import { UserResolver } from "./resolvers/user.resolver";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forFeature([Users]),
  ],
  providers: [TestResolver, UserResolver, MailService],
})
export class GQLModule {}
