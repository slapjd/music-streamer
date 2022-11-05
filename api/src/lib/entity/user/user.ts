import libsodium from "libsodium-wrappers"
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    DeepPartial,
    OneToMany,
    Relation
} from "typeorm"
import { Session } from "../auth/session.js"
import { Track } from "../media/track.js"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    public id!: number

    @Column()
    public username!: string

    //DO NOT USE PLS UNLESS YOU KNOW WHAT UR DOING,
    //Needs to be public so i can retrieve it when required
    //Not selected by default to help prevent accidental usage
    @Column({select: false})
    public password_hash!: string

    @OneToMany(_type => Session, (session) => session.user, {
        cascade: ['remove']
    })
    public loginSessions!: Relation<Session>[]

    protected set password(value: string) {
        this.password_hash = libsodium.crypto_pwhash_str(value, libsodium.crypto_pwhash_OPSLIMIT_INTERACTIVE, libsodium.crypto_pwhash_MEMLIMIT_INTERACTIVE)
        //console.log("PASSWORD CHANGE WEEEEEEEE")
    }
    public compare_password_hash(password: string): boolean {
        return libsodium.crypto_pwhash_str_verify(this.password_hash, password)
    }

    @OneToMany(_type => Track, (track) => track.owner, {
        cascade: ['remove']
    })
    public ownedTracks!: Relation<Track[]>

    public merge(obj: DeepPartial<User>): User {
        //This *feels* stupid but i can't see any other way of preventing garbage
        delete (obj as any).password_hash //Prevents direct writing of password_hash
        return Object.assign(this, obj)
    }

    /**
     * Creates a new user (not loaded from database).
     * Used for e.g. handling registrations
     * @param username Username of new user
     * @param password Password of new user (will be hashed for you)
     * @returns New user object
     */
    public static synthesize(username: string, password: string): User {
        const output: User = new User()
        output.username = username,
        output.password = password
        return output
    }

    //Puts everything into a neat little regular JS object for transport
    //Also helps prevent password_hash being leaked all over the place
    public toJSON() {
        return {
            id: this.id,
            username: this.username,
            tracks: this.ownedTracks
        }
    }
}

