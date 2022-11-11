import { Router } from 'express'
import { validate } from 'express-validation'
import paramValidation from '../../config/param-validation.js'
import authController from '../controllers/auth.controller.js'

const router: Router = Router()

router.post("/", validate(paramValidation.auth.login), authController.login)
router.delete("/", authController.destroySession)

// router.get("/test", async function (req: Request, res: Response) {
//     if (req.sessionStore.all) {
//         req.sessionStore.all((_, data) => {
//             console.log(data)
//         })
//     }
        
//     return res.send(req.session.user)
// })

export default router