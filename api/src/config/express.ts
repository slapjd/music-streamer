import express, { NextFunction, Request, Response } from 'express'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import session from 'express-session'
import { mainDataSource } from './database.js'
import { Session } from '../server/entities/session.js'
import type { User } from '../server/entities/user.js'
import { RelationalStore } from '../lib/RelationalStore.js'
import routes from '../server/routes/index.route.js'
import requiresLogin from '../server/middlewares/requires-login.middleware.js'

import config from './config.js'

declare module 'express-session' {
    interface SessionData {
        user: User | null
    }
}

declare module 'http' {
    //Gives socket.io access to session
    interface IncomingMessage {
        session: session.Session & Partial<session.SessionData>
    }
}

interface PlaybackSession {
    host: Socket
    remotes: Socket[]
}

export const app = express()
export const server = createServer(app)
export const io = new Server(server)

const playbackSessions: PlaybackSession[] = []

app.use(express.json())
const sessionMiddleware = session({
    resave: false,
    saveUninitialized: false,
    store: new RelationalStore(mainDataSource.getRepository(Session)),
    secret: config.credentials.session_secret,
})
app.use(sessionMiddleware)

// convert a connect middleware to a Socket.IO middleware
// fuck ur type checking (but a bit less)
//TODO: this but with proper typing maybe
type ExpressMiddleware = (req: Request, res: Response, next: NextFunction) => void
function wrap(middleware: ExpressMiddleware) {
    return (socket: any, next: any) => middleware(socket.request, {} as any, next) 
}
io.use(wrap(sessionMiddleware))
io.use((socket: Socket, next) => {
    const req = socket.request;
    req.session.reload((err) => {
        if (err) {
            socket.disconnect();
        } else {
            next();
        }
    });
})
io.use(wrap(requiresLogin)) //All websocket sessions require a login

io.on("connection", (socket: Socket) => {
    socket.request.session.user = socket.request.session.user!
    if (!playbackSessions[socket.request.session.user.id]) {
        playbackSessions[socket.request.session.user.id] = {
            host: socket,
            remotes: []
        }
    } else {
        playbackSessions[socket.request.session.user.id]!.remotes.push(socket)
    }

    socket.join(socket.request.session.id)
})

io.on("disconnect", (socket: Socket) => {
    //Lots of not-null assertions because typescript is dumb and we are smort
    const req = socket.request

    req.session.user = req.session.user!
    if (!playbackSessions[req.session.user.id]) return //We do nothing because the session is already gone
    
    const i = playbackSessions[req.session.user.id]!.remotes.findIndex(s => s == socket)

    if (i) {
        playbackSessions[req.session.user.id]!.remotes.splice(i, 1)
    } else if (playbackSessions[req.session.user.id]!.host == socket) {
        if (!playbackSessions[req.session.user.id]!.remotes[0]) {
            delete playbackSessions[req.session.user.id]
        } else {
            playbackSessions[req.session.user.id]!.host = playbackSessions[req.session.user.id]!.remotes[0]!
            playbackSessions[req.session.user.id]!.remotes.splice(0,1)
        }
    } else {
        //Socket has session but is not part of playbackSession.
        //dafuq?
        throw "PLAYBACK_SESSION_PREMATURELY_DELETED_SEND_HELP"
    }
})

app.use('/', routes)
