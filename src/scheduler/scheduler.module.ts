import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CheckIns } from "src/db/entities/CheckIn";
import { Places } from "src/db/entities/Places";
import { PlaceTypes } from "src/db/entities/PlaceTypes";
import { QrCodes } from "src/db/entities/QrCodes";
import { Users } from "src/db/entities/Users";
import { SchedulerService } from "./scheduler.service";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forFeature([Users, Places, CheckIns, QrCodes, PlaceTypes]),
  ],
  providers: [SchedulerService],
})
export class SchedulerModule {}
