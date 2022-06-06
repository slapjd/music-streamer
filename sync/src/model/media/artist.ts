import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToMany,
} from "typeorm"
import { Track } from "./track"

@Entity()
export class Artist {
    @PrimaryGeneratedColumn()
    id!: number

    @ManyToMany(() => Track, (track) => track.artists)
    tracks!: Track[]
}