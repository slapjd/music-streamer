import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
} from "typeorm"
import { Track } from "./media/track"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    private _id!: number
    public get id(): number {
        return this._id
    }

    @Column()
    private _username!: string
    public get username(): string {
        return this._username
    }
    public set username(value: string) {
        this._username = value
    }

    @Column()
    private _password_hash!: string
    public set password_hash(value: string) {
        this._password_hash = value
    }
    public compare_password_hash(password: string) {
        //TODO: use libsodium password compare
        return password === this._password_hash
    }

    @OneToMany(_type => Track, (track) => track.owner)
    @Column()
    private _ownedTracks!: Track[]
    public get ownedTracks(): Track[] {
        return this._ownedTracks
    }
    public set ownedTracks(value: Track[]) {
        this._ownedTracks = value
    }
    public takeOwnership(value: Track) {
        this._ownedTracks.push(value)
    }

    constructor (
        username: string,
        password: string
    ) {
        this._username = username
        this._password_hash = password //TODO: hash password with libsodium
    }
}

