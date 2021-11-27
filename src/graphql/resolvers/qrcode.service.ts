import { Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Places } from "src/db/entities/Places";
import { QrCodes } from "src/db/entities/QrCodes";
import { Repository } from "typeorm";

export class QrCodeService {
  private readonly logger = new Logger(QrCodeService.name);

  // 0     1      2          3          4              5             6
  //cekin:qr:<qr created>:<qr hash>:<place latitude>:<qr printed>:<place longitude>
  private readonly qrRegex =
    /(cekin):(qr:[0-9]{10}):([A-Za-z0-9]{30}):(\d+\.?\d*):([0-9]{10}):((-|)+\d+\.?\d*)\w/;

  constructor(
    @InjectRepository(Places)
    private readonly placesRepository: Repository<Places>,
    @InjectRepository(QrCodes)
    private readonly qrCodesRepository: Repository<QrCodes>,
  ) {}

  public validateQRValue = async (qrCode: string): Promise<boolean> => {
    const regexText = this.qrRegex.test(qrCode);

    if (!regexText) return false;

    const match = this.qrRegex.exec(qrCode);
    if (!match) return false;

    const qrHash = match[0].split(":")[3];

    if (qrHash.length !== 30) return false;

    const qrCodeEntity = await this.qrCodesRepository.findOne({
      where: { hash: qrHash[3] },
      relations: ["place"],
    });

    if (!qrCodeEntity) return false;

    const qrCreated = new Date(qrHash[2]);

    if (qrCreated != qrCodeEntity.created) return false;

    const qrPrinted = new Date(qrHash[5]);

    const today = new Date();

    if (qrPrinted > today) return false;

    return true;
  };

  // Determine whether given coordinates are within the czech republic
  public isInsideCzechia = (latitude: number, longitude: number): boolean => {
    return (
      latitude >= 49.8 &&
      latitude <= 51.1 &&
      longitude >= 14.4 &&
      longitude <= 18.2
    );
  };

  extractQRHash = (qrCode: string): string => {
    const match = this.qrRegex.exec(qrCode);
    if (match) {
      const qrValue = match[0];
      return qrValue.split(":")[3];
    }

    throw new Error("Invalid QR Code");
  };

  generateRandomString = (length = 30): string => {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  };
}
