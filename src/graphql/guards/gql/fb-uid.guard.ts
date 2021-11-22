import { FirebaseAuthenticationService } from "@aginix/nestjs-firebase-admin";
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

@Injectable()
export class FbUidGuard implements CanActivate {
  private readonly logger = new Logger(FbUidGuard.name);

  constructor(private firebaseAuth: FirebaseAuthenticationService) {}

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
          throw new UnauthorizedException("User not registered on Firebase");
        }

        ctx.getContext().firebaseToken = userAuth.uid;
        return true;
      }
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }
}
