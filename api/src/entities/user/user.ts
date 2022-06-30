import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
} from "typeorm"
import { Track_Entity } from "../media/track"

@Entity()
export class User_Entity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    username!: string

    @Column()
    password_hash!: string

    @OneToMany(_type => Track_Entity, (track) => track.owner)
    ownedTracks!: Track_Entity[]
}

