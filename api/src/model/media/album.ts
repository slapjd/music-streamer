import {
    Entity,
    PrimaryGeneratedColumn,
    OneToMany,
    Column,
} from "typeorm"
import { Track } from "./track"

@Entity()
export class Album {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({
        nullable: true
    })
    displayArtist: string | undefined

    @Column()
    title!: string

    @OneToMany(_type => Track, (track) => track.albums)
    tracks!: Track[]
}