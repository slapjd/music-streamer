import { Album_Entity } from "../../entities/media/album"
import { Track } from "./track"

export class Album {
    protected entity!: Album_Entity

    public get id(): number {
        return this.entity.id
    }

    //Any mention of artists here exclusively means
    //*album* artists, not necessarily all the artists
    //within the album
    public get displayArtist(): string | undefined {
        return this.entity.displayArtist
    }
    public set displayArtist(value: string | undefined) {
        this.entity.displayArtist = value
    }

    public get title(): string {
        return this.entity.title
    }
    public set title(value: string) {
        this.entity.title = value
    }

    public get tracks(): Track[] {
        return this.entity.tracks.map(Track.fromEntity)
    }
    public set tracks(value: Track[]) {
        this.entity.tracks = value.map(t => t.toEntity())
    }

    public toEntity(): Album_Entity {
        return this.entity
    }

    public constructor() {}

    static fromEntity(entity: Album_Entity): Album {
        const output = new Album()
        output.entity = entity
        return output
    }

    static fromData(title: string, displayArtist: string | undefined): Album {
        const output = new Album()
        output.entity = new Album_Entity()
        output.entity.title = title
        output.entity.displayArtist = displayArtist
        return output
    }
}