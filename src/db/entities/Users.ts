import { LanguageType } from "src/types/types";
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

  @Column("varchar", {
    name: "language",
  })
  language: LanguageType;

  @Column("timestamptz", {
    name: "created",
  })
  created: Date;
}
