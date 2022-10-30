import express, { Request, Response } from 'express'
import { mainDataSource } from './dbinfo/database'
import { User } from './entity/user/user'

const router: express.Router = express.Router()

// register routes
// router.get("/", async function (_req: Request, res: Response) {
//     const users = await mainDataSource.getRepository(User).find()
//     res.json(users)
// })
//This works but is dangerous in prod

router.get("/:id", async function (req: Request, res: Response) {
    if (req.params['id'] === undefined) return res.status(500).send({message: "USER ID EMPTY BUT ROUTED TO GET /:id"})

    const results = await mainDataSource.getRepository(User).findOneBy({
        id: +req.params['id'],
    })
    return res.send(results)
})

//TODO: Require permissions to make a new user
router.post("/", async function (req: Request, res: Response) {
    if (req.body['username'] === undefined || req.body['password'] === undefined) {
        return res.status(400).send({ message: "Need username and password to register" })
    }
    const usernameCheckResults = await mainDataSource.getRepository(User).findOneBy({
        username: req.body['username']
    })
    if (usernameCheckResults !== null) {
        return res.status(400).send({ message: "Username taken" })
    }

    //Checks passed, we can make a new usery boi
    const user = User.synthesize(req.body['username'], req.body['password']) //Done manually to avoid accidental client-side hash creation
    await mainDataSource.getRepository(User).save(user)
    return res.send({message: "Success"})
})

router.put("/:id", async function (req: Request, res: Response) {
    if (req.params['id'] === undefined) return res.status(500).send({message: "USER ID EMPTY BUT ROUTED TO GET /:id"})

    const user = await mainDataSource.getRepository(User).findOneBy({
        id: +req.params['id'],
    })
    if (user === null) {
        return res.status(404).send({ message: "User to modify does not exist" })
    }
    //mainDataSource.getRepository(User).merge(user, req.body)
    //Add any properties that are allowed to be set on a user account settings change here
    const safeBody = {
        username: req.body['username'],
        password: req.body['password']
    }

    //TODO: merge setters (maybe?)
    user.merge(safeBody) //TODO: sanitize body if anything dangerous gets added to user
    const results = await mainDataSource.getRepository(User).save(user)
    return res.send(results)
})

router.delete("/:id", async function (req: Request, res: Response) {
    if (req.params['id'] === undefined) return res.status(500).send({message: "USER ID EMPTY BUT ROUTED TO GET /:id"})
    if (!req.session.user) return res.status(401).send({message: "Login required"})
    if (req.session.user.id != +req.params['id']) return res.status(403).send({message: "Not authorized to do this"}) //TODO: allow admins

    //Checks passed, go ahead with the deletion
    const results = await mainDataSource.getRepository(User).delete(+req.params['id'])
    return res.send(results)
})

export default router