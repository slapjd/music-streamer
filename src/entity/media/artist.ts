import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Track } from "./track";

@Entity()
export class Artist {
    @PrimaryGeneratedColumn()
    public id!: number

    @Column()
    public name!: string

    @ManyToMany(_type => Track, (track) => track.artists, {
        nullable: true
    })
    public tracks!: Track[]

    public static fromName(name: string): Artist {
        const output = new Artist
        output.name = name
        return output
    }
}