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

@Entity("places")
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

  @Column("int", {
    name: "place_type_id",
  })
  placeTypeId: number;

  @Column("int", {
    name: "parent_id",
  })
  parentId: number;

  @Column("float", {
    name: "latitude",
  })
  latitude: number;

  @Column("float", {
    name: "longitude",
  })
  longitude: number;
}
