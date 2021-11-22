import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Places } from "./Places";
import { Users } from "./Users";

@Entity("check_ins")
export class CheckIns {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", {
    name: "user_id",
  })
  userId: number;

  @ManyToOne(() => Users, (user) => user.checkIns, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: Users;

  @Column("int", {
    name: "place_id",
  })
  placeId: number;

  @ManyToOne(() => Places, (place) => place.checkIns, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "place_id", referencedColumnName: "id" }])
  place: Places;

  @Column("date", {
    name: "check_out_time",
  })
  checkOutTime: Date;

  @Column("date", {
    name: "check_in_time",
  })
  checkInTime: Date;
}
