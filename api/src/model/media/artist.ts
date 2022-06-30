import { Artist_Entity } from "../../entities/media/artist"
import { Track } from "./track"

export class Artist {
    protected entity!: Artist_Entity

    public get id(): number {
        return this.entity.id
    }

    public get name(): string {
        return this.entity.name
    }
    public set name(value: string) {
        this.entity.name = value
    }

    public get tracks(): Track[] {
        return this.entity.tracks.map(Track.fromEntity)
    }
    public set tracks(value: Track[]) {
        this.entity.tracks = value.map(t => t.toEntity())
    }

    public toEntity(): Artist_Entity {
        return this.entity
    }

    protected constructor() {}

    static fromEntity(entity: Artist_Entity): Artist {
        const output = new Artist()
        output.entity = entity
        return output
    }

    static fromData(name: string): Artist {
        const output = new Artist()
        output.entity = new Artist_Entity()
        output.entity.name = name
        return output
    }

    //Fallback in case there's no display name for the artist on the track
    static artistArrayToDisplayString(artists: Artist[]) : string {
        if (artists.length < 1) throw new Error("No artists exist");
        if (artists.length == 1) return artists[0]!.name
        
        //Guaranteed more than 1 artist 
        let out: string = ""
        artists.forEach((artist, i) => {
            if (i > 0) out += ", "
            out += artist.name
        });
        out += " & " + artists[artists.length - 1]
        return out
    }
}