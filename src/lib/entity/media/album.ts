import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Track } from "./track";

@Entity()
export class Album {
    @PrimaryGeneratedColumn()
    public id!: number

    //Albums without titles are the large bad but technically supportable so here we are
    @Column({
        nullable: true
    })
    public title: string | null = null

    //Album artist is not necessarily stored
    @Column({
        nullable: true
    })
    public albumArtist: string | null = null

    @OneToMany(_type => Track, (track) => track.album, {
        nullable: true
    })
    public tracks: Track[] = []

    public static fromData(title?: string, albumArtist?: string): Album {
        const output = new Album
        if (title !== undefined) output.title = title
        if (albumArtist !== undefined) output.albumArtist = albumArtist

        return output
    }
}