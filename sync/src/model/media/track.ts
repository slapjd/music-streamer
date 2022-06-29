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

    @Column()
    title!: string

    @Column({
        nullable: true
    })
    displayArtist: string | undefined

    @ManyToMany(() => Artist, (artist) => artist.tracks)
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

