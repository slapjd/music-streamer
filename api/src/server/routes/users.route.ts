import { Router } from 'express'
import { validate } from 'express-validation'
import paramValidation from '../../config/param-validation.js'
import usersController from '../controllers/users.controller.js'
import requiresLogin from '../middlewares/requires-login.middleware.js'

const router: Router = Router()

// register routes
// router.get("/", usersController.getAll)
//This works but is dangerous in prod

router.get("/:id", validate(paramValidation.users.getOne), usersController.getOne)
router.post("/", validate(paramValidation.users.create), usersController.create)
router.put("/", validate(paramValidation.users.update), requiresLogin, usersController.update)
router.delete("/", requiresLogin, usersController.deleteSelf)
// router.put("/:id", validate(paramValidation.users.update), requiresAdmin, usersController.adminUpdate) //TODO: admin middleware
// router.delete("/:id", validate(paramValidation.users.deleteOne), requiresAdmin, usersController.adminDelete) //TODO: admin middleware

export default router