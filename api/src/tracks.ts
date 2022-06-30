import express from 'express'
import { Album } from './model/media/album'
import { Artist } from './model/media/artist'
import { Track } from './model/media/track'

let router: express.Router = express.Router()

const test_artist = new Artist()
test_artist.name = "TESTMAN"

const test_album = new Album()
test_album.displayArtist = "TESTMAN & FRIENDS"

const test_track = new Track()
test_track.albums
let tracks: Track[] = [
];