import express from 'express';
import session from 'express-session'
import { RelationalStore } from './RelationalStore'
import { mainDataSource } from './database';
import usersRouter from './users';
import authRouter from './auth'
import { Session } from './entity/auth/session';
import type { User } from './entity/user/user';

//TODO: Figure out if this should be moved somewhere else
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

//This will be set by docker eventually
const port: Number = Number(process.env['PORT']) || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
})