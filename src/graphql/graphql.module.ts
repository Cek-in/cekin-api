import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CheckIns } from "src/db/entities/CheckIn";
import { Places } from "src/db/entities/Places";
import { QrCodes } from "src/db/entities/QrCodes";
import { Users } from "src/db/entities/Users";
import { MailService } from "src/mails/mail.service";
import { CheckInSummaryResolver } from "./resolvers/checkin-summary.resolver";
import { CheckInResolver } from "./resolvers/checkin.resolver";
import { PlaceResolver } from "./resolvers/place.resolver";
import { QrCodeService } from "./resolvers/qrcode.service";
import { TestResolver } from "./resolvers/test.resolver";
import { UserResolver } from "./resolvers/user.resolver";
import { DateScalar } from "./scalars/date.scalar";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forFeature([Users, Places, CheckIns, QrCodes]),
  ],
  providers: [
    // Resolvers
    TestResolver,
    UserResolver,
    MailService,
    PlaceResolver,
    CheckInResolver,
    CheckInSummaryResolver,
    // Services
    QrCodeService,

    // Scalars
    DateScalar,
  ],
})
export class GQLModule {}
