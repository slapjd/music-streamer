import { DataSource } from "typeorm";
import { Session } from "../entity/auth/session.js";
import { Album } from "../entity/media/album.js";
import { Artist } from "../entity/media/artist.js";
import { Track } from "../entity/media/track.js";
import { User } from "../entity/user/user.js";

export const mainDataSource = new DataSource({
    type: 'sqlite',
    database: ":memory:",
    synchronize: true,
    logging: false,
    entities: [Session, Album, Artist, Track, User]
})