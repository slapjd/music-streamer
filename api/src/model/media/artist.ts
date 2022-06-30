import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
} from "typeorm"
import { Track } from "./track"

@Entity()
export class Artist {
    @PrimaryGeneratedColumn()
    private _id!: number
    public get id(): number {
        return this._id
    }

    @Column("text")
    private _name!: string
    public get name(): string {
        return this._name
    }
    public set name(value: string) {
        this._name = value
    }

    @ManyToMany(_type => Track, (track) => track.artists)
    private _tracks!: Track[]
    public get tracks(): Track[] {
        return this._tracks
    }
    public set tracks(value: Track[]) {
        this._tracks = value
    }

    constructor(name: string) {
        this.name = name
    }

    //Fallback in case there's no display name for the artist on the track
    static artistArrayToDisplayString(artists: Artist[]) : string {
        if (artists.length < 1) throw new Error("No artists exist");
        if (artists.length == 1) return artists[0]!.name
        
        //Guaranteed more than 1 artist 
        let out: string = ""
        artists.forEach((artist, i) => {
            if (i > 0) out += ", "
            out += artist.name
        });
        out += " & " + artists[artists.length - 1]
        return out
    }
}