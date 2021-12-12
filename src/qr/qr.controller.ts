import {
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
  StreamableFile,
} from "@nestjs/common";
import { QrService } from "./qr.service";

@Controller("qr")
export class QrController {
  constructor(private readonly qrService: QrService) {}

  // @Get(":hash")
  // @Header("Content-Type", "application/pdf")
  // @Header("Content-Disposition", "inline;filename='CekinQr.pdf'")
  // //@Header("Cache-Control", "public, max-age=3600")
  // async getPdf(@Param("hash") hash: string) {
  //   try {
  //     const r = await this.qrService.resolveQR(hash);

  //     if (!r) {
  //       throw new NotFoundException();
  //     }

  //     return new StreamableFile(r);
  //   } catch (e) {
  //     return new NotFoundException(e);
  //   }
  // }

  @Get("value/:hash")
  async getQrValue(@Param("hash") hash: string) {
    const r = await this.qrService.resolveValue(hash);

    if (!r) {
      throw new NotFoundException();
    }

    return { value: r };
  }

  @Get("values")
  async getHashes() {
    return await this.qrService.getHashes();
  }
}
