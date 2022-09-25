import express, { Request, Response } from 'express'
import { mainDataSource } from './database'
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

    if (user === null) return res.status(404).send({message: "User does not exist!"})

    //TODO: create and return session
    return res.send({success: user.compare_password_hash(req.body['password'])})
    //return res.send("TEST")
})

export default router