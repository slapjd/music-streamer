import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, Relation } from "typeorm";
import { User } from "../user/user.js";
import { Album } from "./album.js";
import { Artist } from "./artist.js";

@Entity()
export class Track {
    @PrimaryGeneratedColumn()
    public id!: number

    //While tracks without a title are *extremely* bad practice
    //They are not *technically* required
    @Column({
        nullable: true
    })
    public title?: string

    @Column({
        nullable: true
    })
    private artistStringOverride?: string

    private generateArtistString(): string {
        if (this.artists === undefined || this.artists.length < 1) return "Unknown Artist"
        
        var output = ""
        this.artists.forEach((artist, i) => {
            if (this.artists === undefined) return //FUCKING PANIC ALL HELL HAS BROKEN LOOSE

            output += artist.friendlyName
            if (i < this.artists.length - 2) output += ", "//Beginning artists
            else if (i === this.artists.length - 2) output += " & "//Penultimate artist
        });

        return output
    }

    public get displayArtist(): string {
        if (this.artistStringOverride === undefined) return this.generateArtistString()
        else return this.artistStringOverride
    }
    public set displayArtist(value: string | undefined) {
        if (this.generateArtistString() === value) this.artistStringOverride === undefined //No point storing it if we're just gonna generate it the same
        else this.artistStringOverride === value
    }

    @ManyToMany(_type => Artist, (artist) => artist.tracks, {
        nullable: true,
        eager: true
    })
    @JoinTable()
    public artists?: Relation<Artist[]>

    @ManyToOne(_type => Album, (album) => album.tracks, {
        nullable: true
    })
    public album?: Relation<Album>

    //All tracks need a user that uploaded them
    @ManyToOne(_type => User, (user) => user.ownedTracks, {
        eager: true
    })
    public owner!: Relation<User> //Original reason I made types Relations. Shit broke when I didn't

    //I sincerely hope noone ever has a temptation to make this optional
    @Column()
    public filename!: string
}