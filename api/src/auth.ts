import express, { Request, Response, } from 'express'
import { mainDataSource } from './lib/dbinfo/database.js'
import { User } from './lib/entity/user/user.js'

const router: express.Router = express.Router()

router.post("/", async function (req: Request, res: Response) {
    if (req.session.user) { return res.status(400).send({message: "You are already logged in!"}) }
    if (!req.body['username'] || !req.body['password']) { return res.status(400).send({message: "Username & password required"}) }

    //Because password_hash is protected we end up with this mess
    const user = await mainDataSource.getRepository(User).findOne({
        select: {
            id: true,
            username: true,
            password_hash: true
        },
        where: {
            username: req.body['username']
        }
    })

    if (user === null) return res.status(401).send({message: "Incorrect username or password"})
    if (!user.compare_password_hash(req.body['password'])) {
        return res.status(401).send({message: "Incorrect username or password"}) //401 in theory is missing or incorrect credentials
    }

    //Username and password should have been valid if we arrived at this point
    req.session.user = user

    return res.send({message: "Success!"})
})

//Translates to logout basically
router.delete("/", (req: Request, res: Response) => {
    //I don't think this is possible but it's here just in case
    //(session is automatically created on any request that comes in so :shrug:)
    if (!req.session) res.status(400).send({message: "You don't have a session with us!"})
    else {
        req.session.destroy(_ => {
            res.send({message: "Success!"})
        })
    }
})

// router.get("/test", async function (req: Request, res: Response) {
//     if (req.sessionStore.all) {
//         req.sessionStore.all((_, data) => {
//             console.log(data)
//         })
//     }
        
//     return res.send(req.session.user)
// })

export default router