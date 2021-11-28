import { FirebaseAuthenticationService } from "@aginix/nestjs-firebase-admin";
import { Logger, UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { InjectRepository } from "@nestjs/typeorm";
import { CheckIns } from "src/db/entities/CheckIn";
import { Places } from "src/db/entities/Places";
import { Users } from "src/db/entities/Users";
import { MailService } from "src/mails/mail.service";
import { UserType } from "src/types/enums";
import { ICreateUser, IEditUser } from "src/types/types";
import { Repository } from "typeorm";
import { FbUID, User } from "../decorators/user.decorator";
import { FbUidGuard } from "../guards/gql/fb-uid.guard";
import { UserGuard } from "../guards/gql/user.guard";

@Resolver("User")
export class UserResolver {
  private readonly logger = new Logger(UserResolver.name);

  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    @InjectRepository(CheckIns)
    private readonly checkInsRepository: Repository<CheckIns>,
    private firebaseAuth: FirebaseAuthenticationService,
    private mailService: MailService,
  ) {}

  @UseGuards(UserGuard)
  @Query("user")
  async getUser(@User() user: Users): Promise<Users> {
    return user;
  }

  @Mutation("resetPassword")
  async resetPassword(@Args("email") email: string) {
    try {
      const pwdResetLink = await this.firebaseAuth.generatePasswordResetLink(
        email,
      );

      if (!pwdResetLink) {
        throw new Error("Firebase generate pwd reset link failed");
      }

      const user = await this.usersRepository.findOne({
        where: { email },
      });

      if (!user) {
        throw new Error("User not found");
      }

      await this.mailService.sendResetPasswordMail(user, pwdResetLink);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  @UseGuards(FbUidGuard)
  @UseGuards(UserGuard)
  @Mutation("editUser")
  async editUser(
    @User() user: Users,
    @Args("user") updated: IEditUser,
  ): Promise<Users> {
    if (!user) {
      throw Error("User was not found");
    }

    const { firstName, email, phone } = updated;

    const usr = await this.usersRepository.findOne(user.id);

    if (usr) {
      usr.firstName = firstName;
      usr.email = email;
      usr.phone = phone;

      await this.usersRepository.save(usr);
      return usr;
    }

    throw Error("User was not found");
  }

  @ResolveField("checkIns")
  async checkIns(@User() user: Users): Promise<CheckIns[]> {
    const checkIns = await this.checkInsRepository.find({
      where: { userId: user.id },
    });

    return checkIns;
  }

  @UseGuards(FbUidGuard)
  @Mutation("createUser")
  async createUser(
    @Args("user") user: ICreateUser,
    @FbUID() firebaseUid: string,
  ): Promise<Users> {
    try {
      const { firstName, languageCode } = user;

      const fbUser = await this.firebaseAuth.getUser(firebaseUid);

      if (!fbUser) {
        throw new Error("User not registered on firebase");
      }

      const userExists = await this.usersRepository.findOne({
        where: { firebaseId: firebaseUid },
      });

      if (userExists) {
        throw new Error("User already exists");
      }

      const newUser = new Users();
      newUser.firebaseId = fbUser.uid;
      newUser.firstName = firstName;
      newUser.email = fbUser.email;
      newUser.userType = UserType.USER;
      newUser.language = languageCode;
      newUser.created = new Date();

      const u = await this.usersRepository.save(newUser);

      const confirmUrl = await this.firebaseAuth.generateEmailVerificationLink(
        fbUser.email,
      );

      await this.mailService.sendConfirmationMail(u, confirmUrl);
      return u;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  @UseGuards(FbUidGuard)
  @Mutation("resendVerificationEmail")
  async resendVerificationEmail(@FbUID() firebaseUid: string) {
    try {
      const fbUser = await this.firebaseAuth.getUser(firebaseUid);

      if (!fbUser) {
        throw new Error("User not registered on firebase");
      }

      if (fbUser.emailVerified) {
        throw new Error("User already verified");
      }

      const user = await this.usersRepository.findOne({
        where: { firebaseId: firebaseUid },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const confirmUrl = await this.firebaseAuth.generateEmailVerificationLink(
        fbUser.email,
      );

      await this.mailService.sendConfirmationMail(user, confirmUrl);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
