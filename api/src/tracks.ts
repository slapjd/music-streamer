import express from 'express'
import dataSource from './entities/data_source'
import { Album } from './model/media/album'
import { Artist } from './model/media/artist'
import { Track } from './model/media/track'
import { User } from './model/user/user'

const router: express.Router = express.Router()

async function setupTestDb() {
    await dataSource.initialize()
    const test_artist = Artist.fromData("TESTMAN")

    const test_artist_2 = Artist.fromData("FRIENDS")

    const test_track = Track.fromData(
        "SICK BEATZ",
        "TESTMAN & FRIENDS",
        [test_artist, test_artist_2],
        "sick_beatz.flac"
    )

    const test_album = Album.fromData(
        "TESTMAN'S GREATEST HITS",
        "TESTMAN & FRIENDS"
    )
    test_album.acquireTrack(test_track)

    const test_user = User.fromData(
        "testboi",
        "password123"
    )
    test_user.takeOwnership(test_track)

    await dataSource.manager.save(test_artist.toEntity())
    await dataSource.manager.save(test_artist_2.toEntity())
    await dataSource.manager.save(test_track.toEntity())
    await dataSource.manager.save(test_album.toEntity())
    await dataSource.manager.save(test_user.toEntity())
}

setupTestDb()

router.get('/', async (_req, res) => {
    res.json(
        await Track.repo.find()
    )
})

export default router