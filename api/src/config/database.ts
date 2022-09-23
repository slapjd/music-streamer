import { DataSource } from "typeorm";
import { Session } from "../server/entities/session.js";
import { Album } from "../server/entities/album.js";
import { Artist } from "../server/entities/artist.js";
import { Track } from "../server/entities/track.js";
import { User } from "../server/entities/user.js";

export const mainDataSource = new DataSource({
    type: 'mariadb',
    host: 'mariadb',
    username: process.env['MARIADB_USER'],
    password: process.env['MARIADB_PASSWORD'],
    database: 'musicstreamer',
    synchronize: true,
    logging: false,
    entities: [Album, Artist, Track, User, Session]
})