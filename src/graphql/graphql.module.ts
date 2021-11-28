import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CheckIns } from "src/db/entities/CheckIn";
import { Places } from "src/db/entities/Places";
import { QrCodes } from "src/db/entities/QrCodes";
import { Users } from "src/db/entities/Users";
import { MailService } from "src/mails/mail.service";
import { PlaceResolver } from "./resolvers/place.resolver";
import { QrCodeService } from "./resolvers/qrcode.service";
import { TestResolver } from "./resolvers/test.resolver";
import { UserResolver } from "./resolvers/user.resolver";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forFeature([Users, Places, CheckIns, QrCodes]),
  ],
  providers: [
    TestResolver,
    UserResolver,
    MailService,
    PlaceResolver,
    QrCodeService,
  ],
})
export class GQLModule {}
