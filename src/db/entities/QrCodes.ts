import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Places } from "./Places";

@Entity("qr_codes")
export class QrCodes {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", {
    name: "hash",
    nullable: false,
    unique: true,
    length: 50,
  })
  hash: string;

  @OneToOne(() => Places)
  @JoinColumn({ name: "parent_place_id", referencedColumnName: "id" })
  place: Places;

  @Column("int", {
    name: "parent_place_id",
  })
  parentPlaceId: number;

  @Column("timestamptz", {
    name: "created",
  })
  created: Date;
}
