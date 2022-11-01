import express, { Request, Response } from 'express'
import { FindOperator, IsNull } from 'typeorm'
import type { Repository } from 'typeorm'
import { mainDataSource } from '../lib/dbinfo/database.js'
import { Track } from '../lib/entity/media/track.js'
import fs from 'fs/promises'
import type { Dir, Stats } from 'fs'
import { parseFile } from 'music-metadata'
import { Artist } from '../lib/entity/media/artist.js'
import { Album } from '../lib/entity/media/album.js'

const router: express.Router = express.Router()

const trackRepo: Repository<Track> = mainDataSource.getRepository(Track)
const artistRepo: Repository<Artist> = mainDataSource.getRepository(Artist)
const albumRepo: Repository<Album> = mainDataSource.getRepository(Album)

async function findFiles(dir: Dir, allowSymlink: boolean = false): Promise<string[]> {
    var output: string[] = []
    var entry = await dir.read()
    while (entry) {
        if (!(entry.isSymbolicLink() && !allowSymlink)) {
            if (entry.isDirectory()) {
                output = output.concat(await findFiles(await fs.opendir(entry.name)))
            } else {
                output.push(entry.name)
            }
        }
        
        entry = await dir.read()
    }

    return output
}

router.get("/", async function (_req: Request, res: Response) {
    const tracks = await trackRepo.find()
    return res.send(tracks)
})

//OK here's where the bastard importing lives and where we get to be sad
router.post("/", async function (req: Request, res: Response) {
    if (req.body.path === undefined) return res.status(400).send({message: "Path to track required"})
    if (req.session.user === undefined) return res.status(401).send({message: "You must be logged in to do this"})
    

    var stats: Stats
    //Find file
    try {
        stats = await fs.stat(req.body.path)
    } catch (error) {
        return res.status(404).send({message: "File not found on server"})
    }
    
    var files: string[]
    if (stats.isDirectory()) {
        const dir = await fs.opendir(req.body.path)
        files = await findFiles(dir)
    } else {
        files = [req.body.path]
    }

    //We have a bunch of file handles, now we need to get all their juicy delicious tags
    const tags = await Promise.all(files.map(async (file) => {
        return {
            path: file,
            tag: await parseFile(file)
        }
    }))

    //We have their juicy delicious tags, now we must painstakingly insert them all into our
    //database only if necessary
    for (let i = 0; i < tags.length; i++) {
        const path = tags[i]?.path
        const tag = tags[i]?.tag
        if (tag === undefined || path === undefined) continue

        //TODO: Create symbolic link to a specified media folder that nginx can use to serve shit
        
        const existing = await trackRepo.findOneBy({
            filename: path
        })
        if (existing !== null) continue //Track under same file path already added, no need to import it again.

        const newTrack = new Track()
        newTrack.owner = req.session.user
        newTrack.filename = path
        newTrack.artists = []

        //Process all artists
        if (tag.common.artists !== undefined) {
            for (let j = 0; j < tag.common.artists.length; j++) {
                const artist_name = tag.common.artists[j];
                if (artist_name === undefined) continue //should never happen i fucking hope?
                var artist = await artistRepo.findOneBy({
                    name: artist_name
                })

                //I'm gonna assume while importing tracks that there should be no duplicate artist names
                if (artist === null) {
                    artist = Artist.fromName(artist_name)
                    await artistRepo.save(artist)
                }

                newTrack.artists.push(artist)
            }
        }

        if (tag.common.artist !== undefined) newTrack.displayArtist = tag.common.artist //TODO: verify what happens with multiple ARTIST tags

        //Process album
        var albumName: string | FindOperator<any> = tag.common.album !== undefined ?
            tag.common.album :
            IsNull()

        var albumArtist: string | FindOperator<any> = tag.common.albumartist !== undefined ?
            tag.common.albumartist :
            IsNull()

        //We check for album artist here because it's quite likely for duplicate albums to exist
        //as long as noone feeds us garbagio tier data (same album with different album artist string) we should be fine
        var album = await albumRepo.findOneBy({
            title: albumName,
            albumArtist: albumArtist
        })

        if (album === null) {
            album = Album.fromData(tag.common.album, tag.common.albumartist)
            await albumRepo.save(album)
        }

        newTrack.album = album

        var title: string | undefined = tag.common.title
        
        newTrack.title = title

        await trackRepo.save(newTrack)
    }

    return res.send({})
})
export default router