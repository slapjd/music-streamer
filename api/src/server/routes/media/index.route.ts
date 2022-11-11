import express from 'express'
import tracksRouter from './tracks.route.js'

const router: express.Router = express.Router()

router.use('/tracks', tracksRouter)

export default router