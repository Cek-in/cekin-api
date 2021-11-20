import { FirebaseAuthenticationService } from "@aginix/nestjs-firebase-admin";
import { Logger } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { InjectRepository } from "@nestjs/typeorm";
import { Users } from "src/db/entities/Users";
import { UserType } from "src/types/enums";
import { ICreateUser, IEditUser } from "src/types/types";
import { Repository } from "typeorm";

@Resolver("User")
export class UserResolver {
  private readonly logger = new Logger(UserResolver.name);

  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private firebaseAuth: FirebaseAuthenticationService,
  ) {}

  @Mutation("editUser")
  async editUser(
    @Args("user") user: Users,
    updated: IEditUser,
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

    return null;
  }

  @Mutation("createUser")
  async createUser(@Args("user") user: ICreateUser): Promise<Users> {
    try {
      const { firebaseId, firstName, lastName } = user;

      const fbUser = await this.firebaseAuth.getUser(firebaseId);

      if (!fbUser) {
        throw new Error("User not registered on firebase");
      }

      const userExists = await this.usersRepository.findOne({
        where: { firebaseId },
      });

      if (userExists) {
        throw new Error("User already registered");
      }

      const newUser = new Users();
      newUser.firebaseId = firebaseId;
      newUser.firstName = firstName;
      newUser.lastName = lastName;
      newUser.email = fbUser.email;
      newUser.userType = UserType.USER;

      const u = await this.usersRepository.save(newUser);
      return u;
    } catch (err) {
      this.logger.error(err);
      throw Error(err);
    }
  }
}
