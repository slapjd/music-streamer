import express from 'express';
import session from 'express-session'
import { mainDataSource } from './database.js';
import { Session } from '../server/entities/session.js';
import type { User } from '../server/entities/user.js';
import { RelationalStore } from '../lib/RelationalStore.js';
import routes from '../server/routes/index.route.js'

import config from './config.js';

declare module 'express-session' {
    interface SessionData {
        user: User | undefined
    }
}

const app = express()

app.use(express.json())
app.use(session({
    resave: false,
    saveUninitialized: false,
    store: new RelationalStore(mainDataSource.getRepository(Session)),
    secret: config.credentials.session_secret,
}))

app.use('/', routes)

export default app
