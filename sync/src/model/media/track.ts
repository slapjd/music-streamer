import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToMany,
    ManyToOne,
    JoinTable,
} from "typeorm"
import { Artist } from "./artist"
import { Album } from "./album"

@Entity()
export class Track {
    @PrimaryGeneratedColumn()
    id!: number

    @Column("text")
    title!: string

    @ManyToMany(() => Artist, (artist) => artist.tracks)
    @JoinTable()
    artists!: Artist[]

    @ManyToOne(() => Album, (album) => album.tracks)
    @JoinTable()
    albums!: Album[]

    @Column("text")
    filename!: string
}

