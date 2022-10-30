import express, { Request, Response } from 'express'
import { mainDataSource } from './entity/database'
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

//merge no make password go. need to figure that out
router.put("/:id", async function (req: Request, res: Response) {
    if (req.params['id'] === undefined) return res.status(500).send({message: "USER ID EMPTY BUT ROUTED TO GET /:id"})

    const user = await mainDataSource.getRepository(User).findOneBy({
        id: +req.params['id'],
    })
    if (user === null) {
        return res.status(404).send({ message: "User to modify does not exist" })
    }
    //mainDataSource.getRepository(User).merge(user, req.body)
    user.merge(req.body)
    const results = await mainDataSource.getRepository(User).save(user)
    return res.send(results)
})

//TODO: Authenticate with admin or make sure it's the same user
router.delete("/:id", async function (req: Request, res: Response) {
    if (req.params['id'] === undefined) return res.status(500).send({message: "USER ID EMPTY BUT ROUTED TO GET /:id"})

    const results = await mainDataSource.getRepository(User).delete(+req.params['id'])
    return res.send(results)
})

export default router