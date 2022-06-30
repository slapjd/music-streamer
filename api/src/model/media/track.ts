import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    ManyToMany,
    JoinTable,
} from "typeorm"
import { Artist } from "./artist"
import { Album } from "./album"
import { User } from "../user"

@Entity()
export class Track {
    @PrimaryGeneratedColumn()
    private _id!: number
    public get id() {
        return this._id
    }

    @Column()
    private _title!: string
    public get title() {
        return this._title
    }
    public set title (value: string) {
        this._title = value
    }

    @Column({
        nullable: true
    })
    private _displayArtist: string | undefined
    public get displayArtist(): string | undefined {
        return this._displayArtist
    }
    public set displayArtist(value: string | undefined) {
        this._displayArtist = value
    }

    @ManyToMany(() => Artist, (artist) => artist.tracks)
    @JoinTable()
    private _artists!: Artist[]
    public get artists(): Artist[] {
        return this._artists
    }
    public set artists(value: Artist[]) {
        this._artists = value
    }

    @ManyToOne(_type => Album, (album) => album.tracks)
    @JoinTable()
    private _albums!: Album[]
    public get albums(): Album[] {
        return this._albums
    }
    public set albums(value: Album[]) {
        this._albums = value
    }

    @ManyToOne(_type => User, (user) => user.ownedTracks)
    @Column()
    private _owner!: User
    public get owner(): User {
        return this._owner
    }
    public set owner(value: User) {
        this._owner = value
    }

    @Column()
    private _filename!: string
    public get filename(): string {
        return this._filename
    }
    public set filename(value: string) {
        this._filename = value
    }

    constructor(
        title: string,
        displayArtist: string | undefined,
        artists: Artist[], albums: Album[],
        filename: string
    ) {
        this.title = title
        this.displayArtist = displayArtist
        this.artists = artists
        this.albums = albums
        this.filename = filename
    }
}