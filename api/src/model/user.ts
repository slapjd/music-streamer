import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
} from "typeorm"
import { Track } from "./media/track"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number

    @Column("text")
    username!: string

    @Column("text")
    password_hash!: string

    @OneToMany(type => Track, (track) => track.owner)
    @Column()
    ownedTracks!: Track[]
}

