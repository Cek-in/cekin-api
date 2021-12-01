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
}
