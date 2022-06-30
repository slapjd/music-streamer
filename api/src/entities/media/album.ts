import {
    Entity,
    PrimaryGeneratedColumn,
    OneToMany,
    Column,
} from "typeorm"
import { Track_Entity } from "./track"

@Entity()
export class Album_Entity {
    @PrimaryGeneratedColumn()
    id!: number

    //Any mention of artists here exclusively means
    //*album* artists, not necessarily all the artists
    //within the album
    @Column({
        nullable: true
    })
    displayArtist: string | undefined

    @Column()
    title!: string

    @OneToMany(_type => Track_Entity, (track) => track.albums)
    tracks!: Track_Entity[]
}