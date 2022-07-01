import { DataSource } from "typeorm"
import { Album_Entity } from "./media/album"
import { Artist_Entity } from "./media/artist"
import { Track_Entity } from "./media/track"
import { User_Entity } from "./user/user"

const dataSource = new DataSource({
    type: 'sqlite',
    database: ":memory:",
    synchronize: true,
    logging: false,
    entities: [Album_Entity,Artist_Entity,Track_Entity,User_Entity],
    migrations: [],
    subscribers: [],
})

// export const artistRepository = dataSource.getRepository(Artist_Entity)
// export const albumRepository = dataSource.getRepository(Album_Entity)
// export const trackRepository = dataSource.getRepository(Track_Entity)
// export const userRepository = dataSource.getRepository(User_Entity)

export default dataSource