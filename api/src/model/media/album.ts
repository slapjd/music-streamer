import {
    Entity,
    PrimaryGeneratedColumn,
    OneToMany,
    Column,
} from "typeorm"
import { Track } from "./track"

@Entity()
export class Album {
    @PrimaryGeneratedColumn()
    private _id!: number
    public get id(): number {
        return this._id
    }

    //Any mention of artists here exclusively means
    //*album* artists, not necessarily all the artists
    //within the album
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

    @Column()
    private _title!: string
    public get title(): string {
        return this._title
    }
    public set title(value: string) {
        this._title = value
    }

    @OneToMany(_type => Track, (track) => track.albums)
    private _tracks!: Track[]
    public get tracks(): Track[] {
        return this._tracks
    }
    public set tracks(value: Track[]) {
        this._tracks = value
    }

    constructor(title: string, displayArtist: string | undefined) {
        this.title = title
        this.displayArtist = displayArtist
    }
}