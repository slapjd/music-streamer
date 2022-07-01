import type { Repository } from "typeorm"
import dataSource from "../../entities/data_source"
import { Album_Entity } from "../../entities/media/album"
import { Track } from "./track"

export class Album {
    static repo: Repository<Album_Entity> = dataSource.getRepository(Album_Entity)

    protected entity!: Album_Entity

    public get id(): number {
        return this.entity.id
    }

    //Any mention of artists here exclusively means
    //*album* artists, not necessarily all the artists
    //within the album
    public get displayArtist(): string | null {
        return this.entity.displayArtist
    }
    public set displayArtist(value: string | null) {
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
    public acquireTrack(track: Track) {
        this.entity.tracks.push(track.toEntity())
    }

    public toEntity(): Album_Entity {
        return this.entity
    }

    public async save() {
        await Album.repo.save(this.entity)
    }

    public constructor() {}

    static fromEntity(entity: Album_Entity): Album {
        const output = new Album()
        output.entity = entity
        return output
    }

    static fromData(title: string, displayArtist: string | null): Album {
        const output = new Album()
        output.entity = new Album_Entity()
        output.entity.title = title
        output.entity.displayArtist = displayArtist
        output.entity.tracks = []
        return output
    }
}