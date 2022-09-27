import { randomBytes } from "crypto"
import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm"
import { User } from "../user/user"

@Entity()
export class Session{
    @PrimaryGeneratedColumn()
    public id!: number

    @ManyToOne(_type => User, (user) => user.loginSessions)
    public user!: User

    //I've kept this as select=true because you will almost certainly need the secret loaded
    //whenever you use a session object. Take care to never send this to someone else
    @Column()
    private secret!: string

    public verify(secret: string): boolean {
        if (secret === this.secret) return true
        else return false
    }

    public static synthesize(user: User): Session {
        const output = new Session()
        output.user = user
        output.secret = randomBytes(1024).toString('base64')
        return output
    }
}

