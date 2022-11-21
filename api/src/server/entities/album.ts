import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from "typeorm";
import { Track } from "./track.js";

@Entity()
export class Album {
    @PrimaryGeneratedColumn()
    public id!: number

    //Albums without titles are the large bad but technically supportable so here we are
    @Column({
        type: String,
        nullable: true
    })
    public title!: string | null

    //Album artist is not necessarily stored
    @Column({
        type: String,
        nullable: true
    })
    public albumArtist!: string | null //TODO: insert unknown artist

    @OneToMany(_type => Track, (track) => track.album, {
        nullable: true,
        cascade: ["remove"]
    })
    public tracks?: Relation<Track[]>

    public static fromData(title?: string, albumArtist?: string): Album {
        const output = new Album
        if (title) output.title = title
        if (albumArtist) output.albumArtist = albumArtist

        return output
    }

    public toJSON() {
        return {
            id: this.id,
            title: this.title,
            artist: this.albumArtist,
            tracks: this.tracks
        }
    }
}