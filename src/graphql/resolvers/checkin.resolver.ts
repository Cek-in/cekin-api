import { Logger } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";

@Resolver("place")
export class TestResolver {
  private readonly logger = new Logger(TestResolver.name);

  @Query("getHello")
  async getHello(): Promise<string> {
    return "Hello world";
  }
}
