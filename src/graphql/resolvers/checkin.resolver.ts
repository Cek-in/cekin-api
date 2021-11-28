import { Logger, UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { InjectRepository } from "@nestjs/typeorm";
import { CheckIns } from "src/db/entities/CheckIn";
import { Places } from "src/db/entities/Places";
import { QrCodes } from "src/db/entities/QrCodes";
import { Users } from "src/db/entities/Users";
import { extractQRHash } from "src/types/qrcodes";
import { Repository } from "typeorm";
import { User } from "../decorators/user.decorator";
import { UserGuard } from "../guards/gql/user.guard";
import { QrCodeService } from "./qrcode.service";

@Resolver("CheckIn")
export class CheckInResolver {
  private readonly logger = new Logger(CheckInResolver.name);

  constructor(
    @InjectRepository(Places)
    private readonly placesRepository: Repository<Places>,
    @InjectRepository(QrCodes)
    private readonly qrCodesRepository: Repository<QrCodes>,
    @InjectRepository(CheckIns)
    private readonly checkInsRepository: Repository<CheckIns>,
    private readonly qrCodeService: QrCodeService,
  ) {}

  @UseGuards(UserGuard)
  @Mutation("checkIn")
  async checkIn(
    @Args("qrValue") qrValue: string,
    @User() user: Users,
  ): Promise<boolean> {
    this.logger.log("CheckIn");

    try {
      const qrHash = this.qrCodeService.extractQRHash(qrValue);

      const qrCode = await this.qrCodesRepository.findOne({
        where: { hash: qrHash },
      });

      if (!qrCode) {
        throw new Error("QR Code not found");
      }

      const place = await this.placesRepository.findOne({
        where: { id: qrCode.parentPlaceId },
      });

      if (!place) {
        throw new Error("Place not found");
      }

      const newCheckIn = new CheckIns();
      newCheckIn.userId = user.id;
      newCheckIn.placeId = place.id;
      newCheckIn.checkInTime = new Date();

      await this.checkInsRepository.save(newCheckIn);

      return true;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
