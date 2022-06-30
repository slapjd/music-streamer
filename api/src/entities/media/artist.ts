import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
} from "typeorm"
import { Track_Entity } from "./track"

@Entity()
export class Artist_Entity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column("text")
    name!: string

    @ManyToMany(_type => Track_Entity, (track) => track.artists)
    tracks!: Track_Entity[]
}