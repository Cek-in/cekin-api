import { FirebaseAuthenticationService } from "@aginix/nestjs-firebase-admin";
import { Logger, UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { InjectRepository } from "@nestjs/typeorm";
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
    private firebaseAuth: FirebaseAuthenticationService,
    private mailService: MailService,
  ) {}

  @UseGuards(UserGuard)
  @Query("user")
  async getUser(@User() user: Users): Promise<Users> {
    return user;
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

    const { firstName, lastName, email, phone } = updated;

    const usr = await this.usersRepository.findOne(user.id);

    if (usr) {
      usr.firstName = firstName;
      usr.lastName = lastName;
      usr.email = email;
      usr.phone = phone;

      await this.usersRepository.save(usr);
      return usr;
    }

    throw Error("User was not found");
  }

  @UseGuards(FbUidGuard)
  @Mutation("createUser")
  async createUser(
    @Args("user") user: ICreateUser,
    @FbUID() firebaseUid: string,
  ): Promise<Users> {
    try {
      const { firstName, lastName } = user;

      const fbUser = await this.firebaseAuth.getUser(firebaseUid);

      if (!fbUser) {
        throw new Error("User not registered on firebase");
      }

      const userExists = await this.usersRepository.findOne({
        where: { firebaseId: firebaseUid },
      });

      if (userExists) {
        throw new Error("User already registered");
      }

      const newUser = new Users();
      newUser.firebaseId = firebaseUid;
      newUser.firstName = firstName;
      newUser.lastName = lastName;
      newUser.email = fbUser.email;
      newUser.userType = UserType.USER;

      const u = await this.usersRepository.save(newUser);

      const confirmUrl = await this.firebaseAuth.generateEmailVerificationLink(
        fbUser.email,
      );

      await this.mailService.sendConfirmationMail(u, confirmUrl);
      return u;
    } catch (err) {
      this.logger.error(err);
      throw Error(err);
    }
  }
}
