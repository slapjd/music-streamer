import { DataSource } from "typeorm"
import { Album } from "./media/album"
import { Artist } from "./media/artist"
import { Track } from "./media/track"
import { User } from "./user/user"

const dataSource = new DataSource({
    type: 'sqlite',
    database: ":memory:",
    synchronize: true,
    logging: false,
    entities: [Album,Artist,Track,User],
    migrations: [],
    subscribers: [],
})

export default dataSource