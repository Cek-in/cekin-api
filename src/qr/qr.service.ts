import { Injectable, Logger } from "@nestjs/common";
import * as PDFDocument from "pdfkit";
import * as qrImage from "qr-image";
import { Places } from "src/db/entities/Places";
import * as path from "path";
import * as SVGtoPDF from "svg-to-pdfkit";
import { pdfSvg } from "./svg";
import { QrCodes } from "src/db/entities/QrCodes";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
const labelmake = require("labelmake");
import { Template } from "labelmake/dist/types/type";
import * as fs from "fs";
import template from "./templ";

@Injectable()
export class QrService {
  private readonly logger = new Logger(QrService.name);

  constructor(
    @InjectRepository(QrCodes)
    private readonly qrCodesRepository: Repository<QrCodes>,
  ) {}

  private readonly pdfTemplFile = path.join(
    __dirname,
    "/../resources/pdf/pdfTemp@4x.png",
  );

  private readonly pdfTemplateDesign2 = path.join(
    __dirname,
    "/../resources/pdf/design2.svg",
  );

  //   async getPdf(): Promise<Buffer> {
  //     this.logger.log("Generating QR code");

  //     const pdfBuffer: Buffer = await new Promise(async (resolve, reject) => {
  //       try {
  //         const doc = new PDFDocument({
  //           size: "A4",
  //           layout: "portrait",
  //         });

  //         doc.image(this.pdfTemplFile, 0, 0, {
  //           width: doc.page.width,
  //           height: doc.page.height,
  //         });

  //         // doc.text("Hello world!");
  //         //   doc.image()

  //         const qrBuffer = await this.generateQR();

  //         const innerContainer = 200;
  //         const margin = 50;

  //         doc.image(
  //           qrBuffer,
  //           doc.page.width / 2 - innerContainer / 2 + margin / 2,
  //           doc.page.height / 2 - innerContainer / 2 + margin / 2,
  //           {
  //             width: innerContainer - margin,
  //             height: innerContainer - margin,
  //           },
  //         );

  //         doc.end();

  //         const buffer = [];

  //         doc.on("data", (data) => buffer.push(data));
  //         doc.on("end", () => {
  //           resolve(Buffer.concat(buffer));
  //         });
  //       } catch (err) {
  //         reject(err);
  //       }
  //     });

  //     return pdfBuffer;
  //   }

  async genPDF(qr: QrCodes): Promise<Buffer> {
    this.logger.log("Generating QR code");
    try {
      const Nunito = fs.readFileSync(
        path.join(__dirname, "/../resources/pdf/Nunito-Regular.ttf"),
      );

      const font = { Nunito };

      const t: Template = {
        ...template,
        fontName: "Nunito",
      };

      const inputs = [{ qrscan: "aa", venueName: "aaaaaaaaaaaa" }];

      const pdf = await labelmake({
        template: t,
        inputs,
        font,
      });

      const ab = pdf.buffer as ArrayBuffer;
      const arr1 = [];

      return Buffer.concat(arr1);
    } catch (err) {
      this.logger.error(err);
      return null;
    }
  }

  async resolveQR(qrHash: string): Promise<Buffer> {
    const qr = await this.qrCodesRepository.findOne({
      where: {
        hash: qrHash,
      },
      relations: ["place"],
    });

    if (!qr) {
      return null;
    }

    const pdf = await this.genPDF(qr);
    return pdf;
  }

  async getPdfDesign2(qr: QrCodes): Promise<Buffer> {
    this.logger.log("Generating QR code");

    const pdfBuffer: Buffer = await new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: "A4",
          layout: "portrait",
        });

        doc.registerFont(
          "Nunito",
          path.join(__dirname, "/../resources/fonts/Nunito-Regular.ttf"),
        );

        // doc.image(this.pdfTemplateDesign2, 0, 0, {
        //   width: doc.page.width,
        //   height: doc.page.height,
        // });

        SVGtoPDF(doc, pdfSvg, 0, 0, {
          width: doc.page.width,
          height: doc.page.height,
        });

        // doc.text("Hello world!");
        //   doc.image()

        const qrBuffer = await this.generateQR(qr);

        const innerContainer = 340;
        const margin = 50;

        const xOffset = doc.page.width / 2 - innerContainer / 2 + margin / 2;
        const yOffset = 356.9553 + margin / 2;

        doc.image(qrBuffer, xOffset, yOffset, {
          width: innerContainer - margin,
          height: innerContainer - margin,
          align: "center",
        });

        const name = qr.place.name;

        const tOpts = {};

        const nWidth = doc.fontSize(22).widthOfString(name, tOpts);
        doc.text(
          name,
          doc.page.width / 2 - nWidth / 2,
          yOffset + innerContainer + 10,
          { ...tOpts },
        );
        doc.end();

        const buffer = [];

        doc.on("data", (data) => buffer.push(data));
        doc.on("end", () => {
          resolve(Buffer.concat(buffer));
        });
      } catch (err) {
        reject(err);
      }
    });

    return pdfBuffer;
  }

  private async generateQR(qr: QrCodes): Promise<Buffer> {
    const now = new Date();
    const unixTimestamp = now.getTime() / 1000;
    const qrCreated = new Date(qr.created);
    const unixTimestampCreated = qrCreated.getTime() / 1000;

    const qrBuffer: Buffer = await new Promise((resolve, reject) => {
      try {
        const qrPng = qrImage.image(
          `${process.env.LANDING_URL}/get/cekin:qr:${unixTimestampCreated}:${qr.hash}:${qr.place.latitude}:${unixTimestamp}:${qr.place.longitude}`,
          {
            ec_level: "H",
            type: "png",
            size: 500,
            margin: 0,
          },
        );

        const buffer = [];

        qrPng.on("data", (data) => buffer.push(data));
        qrPng.on("end", () => {
          resolve(Buffer.concat(buffer));
        });
      } catch (err) {
        reject(err);
      }
    });

    return qrBuffer;
  }
}
