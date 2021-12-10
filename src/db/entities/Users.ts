import { PotentialCovid } from "src/types/enums";
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

  @Column("timestamptz", {
    name: "covid_traced",
    nullable: true,
  })
  covidTraced: Date;

  get potentialCovid(): PotentialCovid {
    if (!this.covidTraced) return PotentialCovid.NONE;

    const cTraced = new Date(this.covidTraced).getTime();

    const now = Date.now();
    // if covidtraced within 2 days
    if (cTraced > now - 2 * 24 * 60 * 60 * 1000) {
      return PotentialCovid.SEVERE;
    }

    // if covidtraced within 7 days
    if (cTraced > now - 7 * 24 * 60 * 60 * 1000) {
      return PotentialCovid.MODERATE;
    }

    //if covidtraced within 14 days
    if (cTraced > now - 14 * 24 * 60 * 60 * 1000) {
      return PotentialCovid.LOW;
    }

    return PotentialCovid.NONE;
  }
}
