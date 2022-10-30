import express, { Request, Response, } from 'express'
import { mainDataSource } from './entity/database'
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
    req.session.user = user

    return res.send({message: "Success!"})
})

router.get("/test", async function (req: Request, res: Response) {
    if (req.sessionStore.all !== undefined) {
        req.sessionStore.all((_, data) => {
            console.log(data)
        })
    }
        
    return res.send(req.session.user)
})

export default router