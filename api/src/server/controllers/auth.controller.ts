import type { Request, Response } from "express"
import { mainDataSource } from "../../config/database.js"
import { io } from "../../config/express.js"
import strings from "../../config/strings.js"
import { User } from "../entities/user.js"

async function login(req: Request, res: Response) {
    if (req.session.user) { return res.status(400).send({message: strings.auth.ALREADY_LOGGED_IN}) }

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

    if (user === null) return res.status(401).send({message: strings.auth.INCORRECT_CREDENTIALS})
    if (!user.compare_password_hash(req.body['password'])) {
        return res.status(401).send({message: strings.auth.INCORRECT_CREDENTIALS}) //401 in theory is missing or incorrect credentials
    }

    //Username and password should have been valid if we arrived at this point
    req.session.user = user

    return res.send({message: strings.SUCCESS})
}

function logout(req: Request, res: Response) {
    if (!req.session.user) return res.status(400).send({message: strings.auth.NOT_LOGGED_IN})

    io.to(req.session.id).disconnectSockets() //Done before user is logged out just in case
    req.session.user = null //Deletes when saved
    return res.send({message: strings.SUCCESS})
}

function destroySession(req: Request, res: Response) {
    if (!req.session) res.status(500).send({message: strings.auth.INVALID_SESSION})
    else {
        io.to(req.session.id).disconnectSockets()
        req.session.destroy(_ => {
            res.send({message: strings.SUCCESS})
        })
    }
}

export default { login, logout, destroySession }