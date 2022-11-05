//import { randomBytes } from "crypto"
import type { Cookie } from "express-session";
import {
    AfterLoad,
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    ManyToOne,
    PrimaryColumn,
    Relation,
} from "typeorm"
import type { ISession } from "../../RelationalStore"
import { User } from "../user/user.js"

@Entity()
export class Session implements ISession {
    @PrimaryColumn("varchar", { length: 255 })
    public id!: string

    @ManyToOne(_type => User, (user) => user.loginSessions, {nullable: true})
    public user: Relation<User | undefined>

    @Column("text")
    private cookie_json = "";
    
    //I had a very long and hard battle with expressjs and I lost
    //TLDR: express *needs* this to be a variable, NOT a getter/setter
    //because it's written in js, not ts. Dem's da rulez
    public cookie!: Cookie

    @BeforeInsert()
    @BeforeUpdate()
    cookie2JSON() {
        this.cookie_json = JSON.stringify(this.cookie)
    }

    @AfterLoad()
    JSON2Cookie() {
        this.cookie = JSON.parse(this.cookie_json)
        //Prevents fuckery by juh-sean
        this.cookie.expires = typeof this.cookie.expires === 'string'
            ? new Date(this.cookie.expires)
            : this.cookie.expires
    }
    
    
}

