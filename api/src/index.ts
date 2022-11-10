import express from 'express';
import session from 'express-session'
import { RelationalStore } from './lib/RelationalStore/index.js'
import { mainDataSource } from './lib/dbinfo/database.js';
import usersRouter from './routes/users.js';
import authRouter from './routes/auth.js'
import mediaRouter from './routes/media/index.js'
import { Session } from './lib/entity/auth/session.js';
import type { User } from './lib/entity/user/user.js';

if (!process.env['VIRTUAL_MUSIC_FOLDER']) {
    console.warn("VIRTUAL MUSIC FOLDER NOT CONFIGURED! USING DEFAULT (/usr/share/musicstreamer/media/")
    process.env['VIRTUAL_MUSIC_FOLDER'] = '/usr/share/musicstreamer/media/'
} else if (!process.env['VIRTUAL_MUSIC_FOLDER'].endsWith('/') && !process.env['VIRTUAL_MUSIC_FOLDER'].endsWith('\\')) process.env['VIRTUAL_MUSIC_FOLDER'] += '/' //Windows nowadays does accept forward slashes in paths
if (!process.env['VIRTUAL_NGINX_FOLDER']) {
    console.warn("VIRTUAL NGINX FOLDER NOT CONFIGURED! USING DEFAULT (/usr/share/nginx/)")
    process.env['VIRTUAL_NGINX_FOLDER'] = '/usr/share/nginx/'
}

if (!process.env['SESSION_SECRET']) throw "SESSION_SECRET MUST BE SET"

declare module 'express-session' {
    interface SessionData {
        user: User | undefined
    }
}

//Fuck singletons and shit just do what typeorm bloody recommends
mainDataSource
    .initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err)
    });

const app: express.Application = express()
app.use(express.json())
app.use(session({
    resave: false,
    saveUninitialized: false,
    store: new RelationalStore(mainDataSource.getRepository(Session)),
    secret: process.env['SESSION_SECRET'],
}))
app.use('/users', usersRouter)
app.use('/auth', authRouter)
app.use('/media', mediaRouter)

const port: Number = Number(process.env['PORT']) || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
})