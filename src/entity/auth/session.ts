//import { randomBytes } from "crypto"
import {
    Column,
    Entity,
    Index,
    ManyToOne,
    PrimaryColumn,
} from "typeorm"
import type { ISession } from "connect-typeorm"
import { User } from "../user/user"

@Entity()
export class Session implements ISession {
    @PrimaryColumn("varchar", { length: 255 })
    public id!: string

    @Index()
    @Column("bigint")
    public expiredAt = Date.now();

    @ManyToOne(_type => User, (user) => user.loginSessions)
    public user!: User

    @Column("text")
    public json = "";
}

