import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToOne,
    ManyToOne,
    ManyToMany,
    JoinColumn,
    JoinTable,
} from "typeorm"
import { Artist } from "./artist"
import { Album } from "./album"
import { User } from "../user"

@Entity()
export class Track {
    @PrimaryGeneratedColumn()
    id!: number

    @Column("text")
    title!: string

    //Only for display purposes
    //Do not use for artist grouping, only use it in e.g. the now playing screen for the artist
    //if null, use the fallback with the artists array
    @Column({
        type: "text",
        nullable: true
    })
    displayArtist!: Artist | null

    @ManyToMany(type => Artist, (artist) => artist.tracks)
    @JoinTable()
    artists!: Artist[]

    @ManyToOne(type => Album, (album) => album.tracks)
    @JoinTable()
    albums!: Album[]

    @ManyToOne(type => User, (user) => user.ownedTracks)
    @Column()
    owner!: User

    @Column("text")
    filename!: string
}

