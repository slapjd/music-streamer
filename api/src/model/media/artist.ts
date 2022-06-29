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
    id!: number

    @Column("text")
    name!: string

    @ManyToMany(_type => Track, (track) => track.artists)
    tracks!: Track[]

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