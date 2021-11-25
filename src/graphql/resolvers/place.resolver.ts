import { Logger } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { InjectRepository } from "@nestjs/typeorm";
import { Places } from "src/db/entities/Places";
import { QrCodes } from "src/db/entities/QrCodes";
import { extractQRHash } from "src/types/qrcodes";
import { Repository } from "typeorm";

@Resolver("place")
export class PlaceResolver {
  private readonly logger = new Logger(PlaceResolver.name);

  constructor(
    @InjectRepository(Places)
    private readonly placesRepository: Repository<Places>,
    @InjectRepository(QrCodes)
    private readonly qrCodesRepository: Repository<QrCodes>,
  ) {}

  @Query("place")
  async getPlace(@Args("qrValue") qrValue: string): Promise<Places> {
    try {
      const placeHash = extractQRHash(qrValue);
      const qrCode = await this.qrCodesRepository.findOne({
        where: { hash: placeHash },
      });

      if (!qrCode) {
        throw new Error("QR Code not found");
      }

      const place = await this.placesRepository.findOne({
        where: { id: qrCode.parentPlaceId },
      });

      return place;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
