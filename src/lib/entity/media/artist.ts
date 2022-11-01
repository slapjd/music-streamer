import { Column, Entity, ManyToMany, PrimaryGeneratedColumn, Relation } from "typeorm";
import { Track } from "./track.js";

@Entity()
export class Artist {
    @PrimaryGeneratedColumn()
    public id!: number

    //Unknown artist will be null
    @Column()
    public name?: string

    public get friendlyName() : string {
        if (!this.name) return "Unknown Artist"
        else return this.name
    }
    
    @ManyToMany(_type => Track, (track) => track.artists, {
        nullable: true
    })
    public tracks?: Relation<Track[]>

    public static fromName(name: string): Artist {
        const output = new Artist
        output.name = name
        return output
    }
}