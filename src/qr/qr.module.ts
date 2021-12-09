import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Places } from "src/db/entities/Places";
import { PlaceTypes } from "src/db/entities/PlaceTypes";
import { QrCodes } from "src/db/entities/QrCodes";
import { QrController } from "./qr.controller";
import { QrService } from "./qr.service";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forFeature([Places, QrCodes, PlaceTypes]),
  ],
  controllers: [QrController],
  providers: [QrService],
})
export class QrModule {}
