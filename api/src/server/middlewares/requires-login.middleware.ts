import type { NextFunction, Request, Response } from "express"

export default function requiresLogin(req: Request, res: Response, next: NextFunction) {
    if (!req.session.user) return res.status(401).send({message: "You must be logged in to do that"})
    return next()
}