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
import { Users } from "./Users";

@Entity("check_ins")
export class Places {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", {
    name: "name",
    nullable: false,
    unique: false,
    length: 50,
  })
  name: string;

  @OneToMany(() => CheckIns, (checkIn) => checkIn.placeId)
  checkIns: CheckIns[];
}
