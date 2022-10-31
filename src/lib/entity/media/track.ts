import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user/user";
import { Album } from "./album";
import { Artist } from "./artist";

@Entity()
export class Track {
    @PrimaryGeneratedColumn()
    public id!: number

    //While tracks without a title are *extremely* bad practice
    //They are not *technically* required
    @Column({
        nullable: true
    })
    public title: string | null = null

    @Column({
        nullable: true
    })
    public displayArtist: string | null = null

    @ManyToMany(_type => Artist, (artist) => artist.tracks, {
        nullable: true
    })
    public artists: Artist[] = []

    @ManyToOne(_type => Album, (album) => album.tracks, {
        nullable: true
    })
    public album: Album | null = null

    //All tracks need a user that uploaded them
    @ManyToOne(_type => User, (user) => user.ownedTracks)
    public owner!: User

    //I sincerely hope noone ever has a temptation to make this optional
    @Column()
    public filename!: string
}