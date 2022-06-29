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

    @Column()
    title!: string

    @Column({
        nullable: true
    })
    displayArtist: string | undefined

    @ManyToMany(() => Artist, (artist) => artist.tracks)
    @JoinTable()
    artists!: Artist[]

    @ManyToOne(() => Album, (album) => album.tracks)
    @JoinTable()
    albums!: Album[]

    @Column()
    filename!: string
}

