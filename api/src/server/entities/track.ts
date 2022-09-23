import { AfterInsert, BeforeRemove, Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, Relation } from "typeorm";
import { User } from "./user.js";
import { Album } from "./album.js";
import { Artist } from "./artist.js";
import fs from 'fs/promises'
//import { mainDataSource } from "../../dbinfo/database.js";

@Entity()
export class Track {
    @PrimaryGeneratedColumn()
    public id!: number

    //While tracks without a title are *extremely* bad practice
    //They are not *technically* required
    @Column({
        type: String,
        nullable: true
    })
    public title!: string | null

    @Column({
        type: String,
        nullable: true
    })
    private artistStringOverride!: string | null

    private generateArtistString(): string {
        if (!this.artists || this.artists.length < 1) return "Unknown Artist"
        
        var output = ""
        this.artists.forEach((artist, i) => {
            if (!this.artists) return //FUCKING PANIC ALL HELL HAS BROKEN LOOSE

            output += artist.friendlyName
            if (i < this.artists.length - 2) output += ", "//Beginning artists
            else if (i === this.artists.length - 2) output += " & "//Penultimate artist
        });

        return output
    }

    public get displayArtist(): string {
        if (!this.artistStringOverride) return this.generateArtistString()
        else return this.artistStringOverride
    }
    public set displayArtist(value: string | undefined) {
        if (this.generateArtistString() === value || value === undefined) this.artistStringOverride = null //No point storing it if we're just gonna generate it the same
        else this.artistStringOverride = value
    }

    @ManyToMany(_type => Artist, (artist) => artist.tracks, {
        nullable: true,
        eager: true //Because it's required for generateArtistString()
    })
    @JoinTable()
    public artists?: Relation<Artist[]>

    @ManyToOne(_type => Album, (album) => album.tracks, {
        nullable: true
    })
    public album!: Relation<Album | null>

    //All tracks need a user that uploaded them
    @ManyToOne(_type => User, (user) => user.ownedTracks, {})
    public owner!: Relation<User> //Original reason I made types Relations. Shit broke when I didn't

    //I sincerely hope noone ever has a temptation to make this optional
    @Column()
    public filepath!: string

    //If i run this before insert id doesn't exist but now if it fails the entry is still in the db
    //So don't misconfigure ur shit kids
    @AfterInsert()
    async createSymlinkForNginx() {
        var nginx_path = process.env['VIRTUAL_NGINX_FOLDER']
        if (!nginx_path) throw "VIRTUAL_NGINX_FOLDER UNSET SOMEHOW"
        nginx_path += 'media/'

        //I've set this to use junctions on windows but god help you if you try to run this on windows
        try {
            await fs.stat(nginx_path)
        } catch (error) {
            await fs.mkdir(nginx_path)
        }

        await fs.symlink(this.filepath, nginx_path + this.id.toString(), 'junction')
    }

    @BeforeRemove()
    async deleteSymlinkForNginx() {
        var nginx_path = process.env['VIRTUAL_NGINX_FOLDER']
        if (!nginx_path) throw "VIRTUAL_NGINX_FOLDER UNSET SOMEHOW"
        nginx_path += 'media/'

        try {
            await fs.rm(nginx_path + this.id.toString())
        } catch (e) {
            console.warn("COULD_NOT_REMOVE_FILE " + nginx_path + this.id.toString())
        }
    }

    //You can't depend on mainDataSource because mainDataSource depends on you so bad things happen mkay
    //TODO: Make this work without cyclic dependencies somehow?
    // @AfterRemove()
    // async deleteEmptyArtists() {
    //     await mainDataSource.getRepository(Artist).delete({
    //         tracks: IsNull()
    //     })
    // }

    //Puts everything into a neat little regular JS object for transport
    //I'm gonna just sorta hope that if i don't load things it doesn't pack them :shrug:
    public toJSON() {
        return {
            id: this.id,
            title: this.title,
            artist: this.displayArtist,
            album: this.album,
            owner: this.owner
        }
    }
}