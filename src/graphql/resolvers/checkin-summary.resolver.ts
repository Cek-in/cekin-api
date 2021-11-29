import { Logger } from "@nestjs/common";
import { Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { Places } from "src/db/entities/Places";
import { ICheckInSummary } from "src/types/types";
import { EntityManager, Repository } from "typeorm";

const checkInSummaryQuery = `SELECT count(id) as "count", place_id as "placeId" FROM check_ins GROUP BY place_id;`;

@Resolver("CheckInSummary")
export class CheckInSummaryResolver {
  private readonly logger = new Logger(CheckInSummaryResolver.name);

  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @InjectRepository(Places)
    private readonly placesRepository: Repository<Places>,
  ) {}

  @ResolveField("place")
  async place(@Parent() checkInSummary: ICheckInSummary) {
    const placeId = checkInSummary.placeId;
    const place = await this.placesRepository.findOne(placeId);
    return place;
  }

  @Query("checkInSummary")
  async checkInSummary(): Promise<ICheckInSummary> {
    const checkins = await this.entityManager.query(checkInSummaryQuery);

    const c = checkins.map((checkin, i) => {
      return { ...checkin, id: i + 1 };
    });

    return c;
  }
}
