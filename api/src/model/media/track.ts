import { Artist } from "./artist"
import { Album } from "./album"
import { User } from "../user/user"
import { Track_Entity } from "../../entities/media/track"

export class Track {
    protected entity!: Track_Entity

    public get id() {
        return this.entity.id
    }

    public get title() {
        return this.entity.title
    }
    public set title (value: string) {
        this.entity.title = value
    }

    public get displayArtist(): string | undefined {
        return this.entity.displayArtist
    }
    public set displayArtist(value: string | undefined) {
        this.entity.displayArtist = value
    }

    public get artists(): Artist[] {
        return this.entity.artists.map(Artist.fromEntity)
    }
    public set artists(value: Artist[]) {
        this.entity.artists = value.map(a => a.toEntity())
    }

    public get albums(): Album[] {
        return this.entity.albums.map(Album.fromEntity)
    }
    public set albums(value: Album[]) {
        this.entity.albums = value.map(a => a.toEntity())
    }

    public get owner(): User {
        return User.fromEntity(this.entity.owner)
    }
    public set owner(value: User) {
        this.entity.owner = value.toEntity()
    }

    public get filename(): string {
        return this.entity.filename
    }
    public set filename(value: string) {
        this.entity.filename = value
    }

    public toEntity(): Track_Entity {
        return this.entity
    }

    protected constructor() {}

    static fromEntity(entity: Track_Entity): Track {
        const output = new Track()
        output.entity = entity
        return output
    }

    static fromData(
        title: string,
        displayArtist: string | undefined,
        artists: Artist[], albums: Album[],
        filename: string
    ): Track {
        const output = new Track()
        output.entity = new Track_Entity()
        output.entity.title = title
        output.entity.displayArtist = displayArtist
        output.entity.artists = artists
        output.entity.albums = albums
        output.entity.filename = filename
        return output
    }
}