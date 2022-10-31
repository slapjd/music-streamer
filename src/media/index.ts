import express from 'express'
import tracksRouter from './tracks'

const router: express.Router = express.Router()

router.use('/tracks', tracksRouter)

export default router