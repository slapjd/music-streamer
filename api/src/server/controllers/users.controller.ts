import type { Request, Response } from "express"
import { mainDataSource } from "../../config/database.js"
import strings from "../../config/strings.js"
import { User } from "../entities/user.js"

const userRepo = mainDataSource.getRepository(User)

async function getAll(_req: Request, res: Response) {
    const users = await userRepo.find()
    res.send(users)
}

async function getOne(req: Request, res: Response) {
    req.params['id'] = req.params['id'] as string

    const results = await userRepo.findOneBy({
        id: +req.params['id'],
    })
    return res.send(results)
}

//TODO: Require permissions to make a new user
async function create(req: Request, res: Response) {
    const usernameCheckResults = await userRepo.findOneBy({
        username: req.body['username']
    })
    if (usernameCheckResults !== null) {
        return res.status(400).send({ message: strings.users.USERNAME_TAKEN })
    }

    //Checks passed, we can make a new usery boi
    const user = User.synthesize(req.body['username'], req.body['password']) //Done explicitly to avoid accidental client-side hash creation shenanigans
    await userRepo.save(user)
    return res.send({message: strings.SUCCESS})
}

async function update(req: Request, res: Response) {
    req.session.user = req.session.user as User

    //userRepo.merge(user, req.body)
    //Add any properties that are allowed to be set on a user account settings change here
    //Actually not really required because typeorm doesn't cascade saving but whatever
    //Also not allowed because we have Joi validation but many layers of anti-dev-fuckup gud
    const safeBody = {
        username: req.body['username'],
        password: req.body['password']
    }

    //TODO: check if password merging works?
    req.session.user.merge(safeBody)
    const results = await userRepo.save(req.session.user) //Does not happen on session save (cascade is false)
    return res.send(results)
}

async function deleteSelf(req: Request, res: Response) {
    req.session.user = req.session.user as User

    const results = await userRepo.remove(req.session.user)
    req.session.destroy(_ => {
        res.send(results)
    })
    return
}

//TODO: validate admin credentials here (or as middleware)
async function adminUpdate(req: Request, res: Response) {
    req.params['id'] = req.params['id'] as string

    const user = await userRepo.findOneBy({
        id: +req.params['id'],
    })
    if (user === null) {
        return res.status(404).send({ message: strings.users.NOT_FOUND })
    }
    //userRepo.merge(user, req.body)
    //Add any properties that are allowed to be set on a user account settings change here
    //Actually not really required because typeorm doesn't cascade saving but whatever
    //Also not allowed because we have Joi validation but many layers of anti-dev-fuckup gud
    const safeBody = {
        username: req.body['username'],
        password: req.body['password']
    }

    //TODO: check if password merging works?
    user.merge(safeBody)
    const results = await userRepo.save(user)
    return res.send(results)
}

//TODO: See above
async function adminDelete(req: Request, res: Response) {
    req.params['id'] = req.params['id'] as string

    const users = await mainDataSource.getRepository(User).findBy({
        id: +req.params['id']
    })

    const results = await mainDataSource.getRepository(User).remove(users)
    return res.send(results)
}

export default { getAll, getOne, create, update, deleteSelf, adminUpdate, adminDelete }