import express from 'express';
import session from 'express-session'
import { RelationalStore } from './lib/RelationalStore/index.js'
import { mainDataSource } from './lib/dbinfo/database.js';
import usersRouter from './users.js';
import authRouter from './auth.js'
import mediaRouter from './media/index.js'
import { Session } from './lib/entity/auth/session.js';
import type { User } from './lib/entity/user/user.js';

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
    store: new RelationalStore(mainDataSource.getRepository(Session)), //It complains unless i explicitly tell it this
    secret: "keyboard cat",
}))
app.use('/users', usersRouter)
app.use('/auth', authRouter)
app.use('/media', mediaRouter)

const port: Number = Number(process.env['PORT']) || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
})