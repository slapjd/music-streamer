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

    @OneToMany(() => Track, (track) => track.albums)
    tracks!: Track[]
}