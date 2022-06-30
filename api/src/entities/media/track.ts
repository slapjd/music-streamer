import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    ManyToMany,
    JoinTable,
} from "typeorm"
import { Artist_Entity } from "./artist"
import { Album_Entity } from "./album"
import { User_Entity } from "../user/user"

@Entity()
export class Track_Entity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    title!: string
    
    @Column({
        nullable: true
    })
    displayArtist: string | undefined

    @ManyToMany(_type => Artist_Entity, (artist) => artist.tracks)
    @JoinTable()
    artists!: Artist_Entity[]

    @ManyToOne(_type => Album_Entity, (album) => album.tracks)
    albums!: Album_Entity[]

    @ManyToOne(_type => User_Entity, (user) => user.ownedTracks)
    owner!: User_Entity

    @Column()
    filename!: string
}