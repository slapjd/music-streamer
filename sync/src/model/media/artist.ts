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

    @ManyToMany(type => Track, (track) => track.artists)
    tracks!: Track[]

    //Fallback in case there's no display name for the artist on the track
    static artistArrayToDisplayString(artists: Artist[]) {
        if (artists.length == 1) return artists[0]
        
        let out = artists[0].name
        for (let i = 1; i < artists.length - 1; i++) {
              out += ", " + artists[i].name
        }
        out += " & " + artists[artists.length - 1]
        return out
    }
}