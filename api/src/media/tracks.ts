import express, { Request, Response } from 'express'
import { FindOperator, ILike, IsNull } from 'typeorm'
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
                const nextDir = await fs.opendir(dir.path + entry.name)
                output = output.concat(await findFiles(nextDir))
                await nextDir.close()
            } else {
                output.push(dir.path + entry.name)
            }
        }
        
        entry = await dir.read()
    }

    return output
}

//Search endpoint
router.get("/", async function (req: Request, res: Response) {
    if (!req.session.user) return res.status(401).send({message: "You must be logged in to do that"})
    if (Object.keys(req.query).length < 1) return res.status(400).send({message: "You must have at least 1 search parameter"})
    let title = undefined
    if (req.query['title']?.toString()) title = ILike('%' + req.query['title']?.toString() + '%')
    const tracks = await trackRepo.find({
        relations: ['artists', 'album'],
        where: {
            owner: {
                id: req.session.user.id
            },
            title: title
        }
    })
    return res.send(tracks)
})

//Gets info on single track
router.get("/:id", async function (req: Request, res: Response) {
    if (!req.session.user) return res.status(401).send({message: "You must be logged in to do that"})
    if (!req.params['id']) return res.status(500).send({message: "PANIC"})
    const track = await trackRepo.findOne({
        relations: ['artists', 'album', 'owner'],
        where: {
            id: +req.params['id']
        }
    })
    if (!track) return res.status(404).send({message: "This track does not exist"})
    if (track.owner.id != req.session.user.id) return res.status(403).send({message: "You do not own this track"})
    delete (track as any).owner //Required for authentication but not relevant to user TODO: maybe remove this from json

    return res.send(track)
})

//TODO: maybe move this somewhere else
//Authenticates then returns track file via accelerated redirect
router.get("/:id/file", async function (req: Request, res:Response) {
    if (!req.session.user) return res.status(401).send({message: "You must be logged in to do that"})
    if (!req.params['id']) return res.status(500).send({message: "PANIC"})
    const track = await trackRepo.findOne({
        relations: ['owner'],
        where: {
            id: +req.params['id']
        }
    })

    if (!track) return res.status(404).send({message: "Track not found"})
    if (track.owner.id != req.session.user.id) return res.status(403).send({message: "This track is not owned by you"})

    return res.setHeader('X-Accel-Redirect', '/_media/' + req.params['id']).send()
})

router.get("/:id/art", async function (req: Request, res: Response) {
    if (!req.session.user) return res.status(401).send({message: "You must be logged in to do that"})
    if (!req.params['id']) return res.status(500).send({message: "PANIC"})

    var track = null
    try {
        track = await trackRepo.findOne({
            relations: ['owner'],
            where: {
                id: +req.params['id']
            }
        })
    } catch (error) {
        return res.status(400).send("Your art request sucks and you should feel bad")
    }
    
    if (!track) return res.status(404).send({message: "Track not found"})
    if (track.owner.id != req.session.user.id) return res.status(403).send({message: "This track is not owned by you"})

    const tag = await parseFile(track.filepath)
    if (!tag.common.picture || !tag.common.picture[0]) return res.status(404).send({message: "No art found"})
    return res.send(tag.common.picture[0].data)
})

//VERY DANGEROUS: DELETES ALL TRACKS OWNED BY USER
router.delete("/", async function (req: Request, res: Response) {
    const tracks = await trackRepo.findBy({
        owner: {
            id: req.session.user?.id
        }
    })
    const results = await trackRepo.remove(tracks)
    return res.send(results)
})

//Delete specific track
router.delete("/:id", async function (req: Request, res: Response) {
    if (!req.params['id']) return res.status(500).send({message: "PANIC"})
    const tracks = await trackRepo.findBy({
        id: +req.params['id'],
        owner: {
            id: req.session.user?.id
        }
    })
    const results = await trackRepo.remove(tracks)
    return res.send(results)
})

//OK here's where the bastard importing lives and where we get to be sad
//TODO: upload from client?
router.post("/", async function (req: Request, res: Response) {
    if (!req.session.user) return res.status(401).send({message: "You must be logged in to do this"})

    var path = process.env['VIRTUAL_MUSIC_FOLDER']
    if (!path) throw "VIRTUAL_MUSIC_FOLDER UNSET SOMEHOW"
    path += req.session.user.username + '/'
    
    const newTracks = []

    var stats: Stats
    //Find file
    try {
        stats = await fs.stat(path)
    } catch (error) {
        return res.status(500).send({message: "Media folder not mounted correctly!"})
    }
    
    var files: string[]
    if (stats.isDirectory()) {
        const dir = await fs.opendir(path)
        files = await findFiles(dir)
        await dir.close()
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
        if (!tag || !path) continue
        
        const existing = await trackRepo.findOneBy({
            filepath: path
        })
        if (existing !== null) continue //Track under same file path already added, no need to import it again.

        const newTrack = new Track()
        newTrack.owner = req.session.user
        newTrack.filepath = path
        newTrack.artists = []

        //console.log(tag.native)
        if (tag.native['vorbis']) {
            //TODO: similar logic for MP3 and other tag types
            const test = tag.native['vorbis'].filter((tag) => {
                return tag.id === 'ARTIST'
            })
            if (test.length !== 1) {
                //Multiple actual artist tags makes the artist string unreliable (usually only has the first artist).
                //No artist tag *also* makes the artist string unreliable (we'd rather generate it on the fly instead of storing it)
                delete tag.common.artist
                //console.log("MULTIPLE ARTISTS IN ARTIST TAG DETECTED! DELETING ARTIST STRING")
            }
        }
        newTrack.displayArtist = tag.common.artist

        //Process all artists
        if (tag.common.artists) {
            for (let j = 0; j < tag.common.artists.length; j++) {
                const artist_name = tag.common.artists[j];
                if (!artist_name) continue //should never happen i fucking hope?

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

        //Process album
        var albumName: string | FindOperator<any> = tag.common.album ?
            tag.common.album :
            IsNull()

        var albumArtist: string | FindOperator<any> = tag.common.albumartist ?
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
        newTracks.push(newTrack)
    }

    return res.send(newTracks)
})
export default router