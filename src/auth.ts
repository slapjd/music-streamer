import express, { Request, Response, } from 'express'
import { mainDataSource } from './database'
import { User } from './entity/user/user'

const router: express.Router = express.Router()

router.get("/", async function (req: Request, res: Response) {
    if (req.body['username'] === undefined || req.body['password'] === undefined) { return res.status(400).send({message: "Username & password required"}) }

    //Because password_hash is protected we end up with this mess
    const user = await mainDataSource
    .getRepository(User)
    .createQueryBuilder()
    .addSelect('"User"."password_hash"', 'User_password_hash') //Magic line that makes password_hash appear
    .where("user.username = :username", { username: req.body['username'] })
    .getOne()

    if (user === null) return res.status(401).send({message: "Incorrect username or password"})
    if (!user.compare_password_hash(req.body['password'])) {
        return res.status(401).send({message: "Incorrect username or password"}) //401 in theory is missing or incorrect credentials
    }

    //Username and password should have been valid if we arrived at this point
    req.session.user_id = user.id //TODO: maybe try to abstract away the id and just store user objects but good luck with that quite frankly

    return res.send({message: "Success!"})
})

router.get("/test", async function (req: Request, res: Response) {
    if (req.session.user_id === undefined) {
        return res.status(400).send({message: "NO"})
    }

    const user = await mainDataSource.getRepository(User).findOneBy({
        id: req.session.user_id
    })

    return res.send(user)
})

export default router