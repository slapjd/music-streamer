import express from 'express'
import usersRoute from './users.route.js'
import authRoute from './auth.route.js'
import mediaRoute from './media/index.route.js'

const router = express.Router()

router.use('/users', usersRoute)
router.use('/auth', authRoute)
router.use('/media', mediaRoute)

export default router