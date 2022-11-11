import { Router } from 'express'
import paramValidation from '../../../config/param-validation.js'
import { validate } from 'express-validation'
import requiresLogin from '../../middlewares/requires-login.middleware.js'
import tracksController from '../../controllers/media/tracks.controller.js'

const router: Router = Router()

router.use(requiresLogin)

router.get("/", tracksController.search)
router.get("/:id", validate(paramValidation.getTrack) , tracksController.get)
router.get("/:id/file", validate(paramValidation.getTrack), tracksController.getFile)
router.get("/:id/art", validate(paramValidation.getTrack), tracksController.getArt)
//VERY DANGEROUS: DELETES ALL TRACKS OWNED BY USER
router.delete("/", tracksController.deleteAll)
router.delete("/:id", validate(paramValidation.deleteTrack), tracksController.deleteOne)
router.post("/", tracksController.doImport)

export default router