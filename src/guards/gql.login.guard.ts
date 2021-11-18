import { FirebaseAuthenticationService } from "@aginix/nestjs-firebase-admin";
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { InjectRepository } from "@nestjs/typeorm";
import { Users } from "src/db/entities/Users";
import { Repository } from "typeorm";

@Injectable()
export class GqlLoginQuard implements CanActivate {
  private readonly logger = new Logger(GqlLoginQuard.name);

  constructor(
    private firebaseAuth: FirebaseAuthenticationService,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const headers = ctx.getContext().req.headers as Headers;

    if (
      !headers ||
      !headers["authorization"] ||
      headers["authorization"].length < 5
    ) {
      throw new UnauthorizedException("Invalid token");
    }

    const authHeader = headers["authorization"];
    if (!authHeader.includes("Bearer ")) {
      throw new UnauthorizedException("Invalid token");
    }

    const token = authHeader.replace("Bearer ", "");

    try {
      const decodedId = await this.firebaseAuth.verifyIdToken(token);
      if (decodedId) {
        const userAuth = await this.firebaseAuth.getUser(decodedId.uid);

        if (!userAuth) {
          throw new UnauthorizedException("User not registered");
        }

        const user = await this.usersRepository.findOne({
          where: { firebaseId: userAuth.uid },
        });

        if (!user) {
          throw new UnauthorizedException("User not found");
        }

        ctx.getContext().user = user;

        return true;
      }
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }
}
