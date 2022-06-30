import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    ManyToMany,
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

    @ManyToOne(_type => Album, (album) => album.tracks)
    @JoinTable()
    albums!: Album[]

    @ManyToOne(_type => User, (user) => user.ownedTracks)
    @Column()
    owner!: User

    @Column()
    filename!: string
}