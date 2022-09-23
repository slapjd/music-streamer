import { crypto_pwhash_MEMLIMIT_INTERACTIVE, crypto_pwhash_OPSLIMIT_INTERACTIVE, crypto_pwhash_str, crypto_pwhash_str_verify } from "libsodium-wrappers"
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
} from "typeorm"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    public id!: number

    @Column()
    public username!: string

    @Column()
    private password_hash!: string

    protected set password(value: string) {
        this.password_hash = crypto_pwhash_str(value, crypto_pwhash_OPSLIMIT_INTERACTIVE, crypto_pwhash_MEMLIMIT_INTERACTIVE)
    }
    public compare_password_hash(password: string): boolean {
        return crypto_pwhash_str_verify(this.password_hash, password)
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
}

