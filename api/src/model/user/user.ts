import { User_Entity } from "../../entities/user/user"
import { Track } from "../media/track"

export class User {
    protected entity!: User_Entity

    public get id(): number {
        return this.entity.id
    }

    public get username(): string {
        return this.entity.username
    }
    public set username(value: string) {
        this.entity.username = value
    }

    public set password_hash(value: string) {
        this.entity.password_hash = value
    }
    public compare_password_hash(password: string) {
        //TODO: use libsodium password compare
        return password === this.entity.password_hash
    }

    public get ownedTracks(): Track[] {
        return this.entity.ownedTracks.map(Track.fromEntity)
    }
    public set ownedTracks(value: Track[]) {
        this.entity.ownedTracks = value.map(t => t.toEntity())
    }
    public takeOwnership(value: Track) {
        this.entity.ownedTracks.push(value.toEntity())
    }

    public toEntity(): User_Entity {
        return this.entity
    }

    protected constructor() {}

    static fromEntity(entity: User_Entity): User {
        const output = new User()
        output.entity = entity
        return output
    }

    static fromData (
        username: string,
        password: string
    ): User {
        const output = new User()
        output.entity = new User_Entity()
        output.entity.username = username
        output.entity.password_hash = password //TODO: hash password with libsodium
        return output
    }
}

