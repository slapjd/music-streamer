import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Track } from "./track";

@Entity()
export class Album {
    @PrimaryGeneratedColumn()
    public id!: number

    @Column()
    public title!: string

    //Album artist is not necessarily stored
    @Column({
        nullable: true
    })
    public albumArtist?: string

    @OneToMany(_type => Track, (track) => track.album, {
        nullable: true
    })
    public tracks!: Track[]
}