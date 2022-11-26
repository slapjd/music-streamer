import type { RemoteSocket, Socket } from "socket.io"
import type { DefaultEventsMap } from "socket.io/dist/typed-events.js"
import { io } from "../../config/express.js"

function setHost(socket: Socket | RemoteSocket<DefaultEventsMap, any> | undefined, id: number) {
    if (!socket) return
    socket.emit("becomeHost")
    socket.join("HOST")
    socket.join("HOST" + id)
}

function connect(socket: Socket) {
    const req = socket.request
    req.session.user = req.session.user!

    if (!io.sockets.adapter.rooms.get("USER" + req.session.user.id)) {
        setHost(socket, req.session.user.id)
    } else {
        socket.emit("becomeRemote")
    }

    socket.join(req.session.id) //Helpful when logouts are processed
    socket.join("USER" + req.session.user.id) //Used for synchronizing playback

    socket.on("disconnect", async () => {
        //Lots of not-null assertions because typescript is dum and we are smort
        //This is called *after* the socket has left all its rooms
        const req = socket.request
        req.session.user = req.session.user!

        //TODO: fix this
        if (socket.rooms.has("HOST")) {
            //Host has just disconnected, find a new host if possible.
            var newHost = (await socket.to("USER" + req.session.user.id).fetchSockets()).find(() => true)
            setHost(newHost, req.session.user.id)
        }
    })

    socket.onAny((event, ...args) => {
        //Socket has been redefined here (i'm like pretty sure anyway, at least according to typescript)
        const req = socket.request
        req.session.user = req.session.user!

        if (socket.rooms.has("HOST")) {
            socket.to("USER" + req.session.user.id).emit(event, args)
        } else {
            socket.to("HOST" + req.session.user.id).emit(event, args)
        }
    })
}

export default { connect }