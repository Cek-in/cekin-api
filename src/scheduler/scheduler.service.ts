import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { CheckIns } from "src/db/entities/CheckIn";
import { Repository } from "typeorm";

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectRepository(CheckIns)
    private readonly checkInsRepository: Repository<CheckIns>,
  ) {}

  // add hours to date
  private addHours(date: Date, hours: number) {
    return new Date(date.getTime() + hours * 60 * 60 * 1000);
  }

  // remove check in records older than 14 days
  @Cron("0 1 * * *")
  async removeOldCheckInRecords() {
    try {
      const checkInRecords = await this.checkInsRepository.find();
      const now = new Date();
      const oldRecords = checkInRecords.filter((checkIn) => {
        const checkInDate = new Date(checkIn.checkInTime);
        return now.getTime() - checkInDate.getTime() > 14 * 24 * 60 * 60 * 1000;
      });
      this.logger.log(`removing ${oldRecords.length} old check in records`);
      await this.checkInsRepository.remove(oldRecords);
    } catch (error) {
      this.logger.error(error);
    }
  }

  // close check in records
  @Cron("0 * * * *")
  async closeCheckInRecords() {
    try {
      const unclosedCheckins = await this.checkInsRepository.find({
        where: {
          checkOutTime: null,
        },
        relations: ["place", "place.placeType"],
      });

      const updated: CheckIns[] = [];

      const now = new Date();

      for (const checkIn of unclosedCheckins) {
        const checkInDate = new Date(checkIn.checkInTime);

        const checkOutDate = this.addHours(
          checkInDate,
          checkIn.place.placeType.autoCheckoutAfter,
        );

        // ignore if current time is before potential checkout
        if (checkOutDate < now) {
          continue;
        }

        checkIn.checkOutTime = checkOutDate;
        updated.push(checkIn);
      }
      await this.checkInsRepository.save(updated);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
