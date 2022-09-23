import { io } from "../../config/express.js"
import playbackIoController from "../controllers/playback.io.controller.js"

io.on("connection", playbackIoController.connect)