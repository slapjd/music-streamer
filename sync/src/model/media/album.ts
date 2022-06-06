import {
    Entity,
    PrimaryGeneratedColumn,
    OneToMany,
} from "typeorm"
import { Track } from "./track"

@Entity()
export class Album {
    @PrimaryGeneratedColumn()
    id!: number

    @OneToMany(type => Track, (track) => track.albums)
    tracks!: Track[]
}