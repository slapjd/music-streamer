import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, Relation } from "typeorm";
import { User } from "../user/user.js";
import { Album } from "./album.js";
import { Artist } from "./artist.js";

@Entity()
export class Track {
    @PrimaryGeneratedColumn()
    public id!: number

    //While tracks without a title are *extremely* bad practice
    //They are not *technically* required
    @Column({
        nullable: true
    })
    public title?: string

    @Column({
        nullable: true
    })
    public displayArtist?: string

    @ManyToMany(_type => Artist, (artist) => artist.tracks, {
        nullable: true
    })
    @JoinTable()
    public artists?: Relation<Artist[]>

    @ManyToOne(_type => Album, (album) => album.tracks, {
        nullable: true
    })
    public album?: Relation<Album>

    //All tracks need a user that uploaded them
    @ManyToOne(_type => User, (user) => user.ownedTracks)
    public owner!: Relation<User> //Original reason I made types Relations. Shit broke when I didn't

    //I sincerely hope noone ever has a temptation to make this optional
    @Column()
    public filename!: string
}