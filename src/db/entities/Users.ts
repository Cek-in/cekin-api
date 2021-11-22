import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CheckIns } from "./CheckIn";

@Entity("users")
export class Users {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", {
    name: "first_name",
    nullable: false,
    unique: false,
    length: 50,
  })
  firstName: string;

  @Column("varchar", {
    name: "last_name",
    nullable: false,
    unique: false,
    length: 50,
  })
  lastName: string;

  @Column("varchar", {
    name: "email",
    nullable: false,
  })
  email: string;

  @Column("varchar", {
    name: "phone",
    nullable: true,
    length: 15,
  })
  phone: string;

  @Column("varchar", {
    name: "firebase_id",
    nullable: false,
  })
  firebaseId: string;

  @Column("varchar", {
    name: "user_type",
    nullable: false,
  })
  userType: string;

  @OneToMany(() => CheckIns, (checkIn) => checkIn.userId)
  checkIns: CheckIns[];
}
