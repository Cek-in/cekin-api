import { Logger, UseGuards } from "@nestjs/common";
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { InjectRepository } from "@nestjs/typeorm";
import { CheckIns } from "src/db/entities/CheckIn";
import { Places } from "src/db/entities/Places";
import { QrCodes } from "src/db/entities/QrCodes";
import { Users } from "src/db/entities/Users";
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
  @Query("ownCheckIns")
  async ownCheckIns(@User() user: Users): Promise<CheckIns[]> {
    return await this.checkInsRepository.find({
      where: { userId: user.id },
      order: { checkInTime: "DESC" },
    });
  }

  @ResolveField("place")
  async place(@Parent() checkIn: CheckIns): Promise<Places> {
    return await this.placesRepository.findOne(checkIn.placeId);
  }

  @UseGuards(UserGuard)
  @Mutation("checkIn")
  async checkIn(
    @Args("qrValue") qrValue: string,
    @User() user: Users,
  ): Promise<boolean> {
    this.logger.log("CheckIn");

    // check whether user has chekced in last 5 minutes and throw an error
    const recentCheckIn = await this.checkInsRepository.findOne({
      where: {
        userId: user.id,
        checkInTime: {
          $gt: new Date(new Date().getTime() - 5 * 60 * 1000),
        },
      },
    });

    if (recentCheckIn) {
      throw new Error("Checking in too often");
    }

    // check wheter user has more than 20 checkins in last 24 hours and throw an error
    const checkInCount = await this.checkInsRepository.count({
      where: {
        userId: user.id,
        checkInTime: {
          $gt: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
        },
      },
    });

    if (checkInCount > 20) {
      throw new Error("Check in cap for today reached");
    }

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

      // Attempt close previous checkIn
      const previousUserCheckIn = await this.checkInsRepository.findOne({
        where: {
          userId: user.id,
          checkOutTime: null,
        },
        order: {
          checkInTime: "DESC",
        },
      });

      if (previousUserCheckIn && !previousUserCheckIn.checkOutTime) {
        previousUserCheckIn.checkOutTime = new Date();
        await this.checkInsRepository.save(previousUserCheckIn);
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
