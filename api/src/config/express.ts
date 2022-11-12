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
        user?: User
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

const playbackSessions: any = {}

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
io.use(wrap(requiresLogin)) //All websocket sessions require a login

io.on("connection", (socket) => {
    socket.request.session.user = socket.request.session.user as User
    if (playbackSessions[socket.request.session.user.id] === undefined) {
        
    }
})

app.use('/', routes)
