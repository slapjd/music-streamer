import express, { Request, Response } from 'express'
import { mainDataSource } from './database'
import { Session } from './entity/auth/session'
import { User } from './entity/user/user'

const router: express.Router = express.Router()

router.get("/", async function (req: Request, res: Response) {
    if (req.body['username'] === undefined || req.body['password'] === undefined) { return res.status(400).send({message: "Username & password required"}) }

    //Because password_hash is protected we end up with this mess
    const user = await mainDataSource
    .getRepository(User)
    .createQueryBuilder()
    .addSelect('"User"."password_hash"', 'User_password_hash') //Magic line that makes things work do not touch
    .where("user.username = :username", { username: req.body['username'] })
    .getOne()

    if (user === null) return res.status(401).send({message: "Incorrect username or password"})
    

    if (user.compare_password_hash(req.body['password'])) {
        const session = Session.synthesize(user)
        mainDataSource.getRepository(Session).save(session) //Save new session so it's valid
        return res.send({token: (session as any).secret}) //Should be the only time we need to access the secret property directly
    } else {
        //Probably comes under DRY but sod it it's like 1 if statement
        return res.status(401).send({message: "Incorrect username or password"}) //401 in theory is missing or incorrect credentials
    }
})

export default router