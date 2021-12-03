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
import { Places } from "./Places";
import { Users } from "./Users";

@Entity("place_types")
export class PlaceTypes {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", {
    name: "name",
    nullable: false,
    unique: false,
    length: 50,
  })
  name: string;

  @OneToMany(() => Places, (place) => place.placeTypeId)
  places: Places[];

  @Column("float", {
    name: "auto_checkout_after",
  })
  autoCheckoutAfter: number;
}
