import type { Socket } from "socket.io"
import { io } from "../../config/express.js"

function connect(socket: Socket) {
    const req = socket.request
    req.session.user = req.session.user!

    if (!io.sockets.adapter.rooms.get("USER" + req.session.user.id)) {
        socket.emit("becomeHost")
        socket.join("HOST") //Pretty much just used so we know when the host quits
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

        if (!socket.rooms.has("HOST")) {
            //Host has just disconnected, find a new host if possible.
            var newHost = (await socket.to("USER" + req.session.user.id).fetchSockets()).find(() => true)
            newHost?.join("HOST") //If no socket found, everyone has disconnected and host will be dealt with on next connection
            newHost?.emit("becomeHost")
        }
    })

    socket.onAny((event, ...args) => {
        //Socket has been redefined here (i'm like pretty sure anyway, at least according to typescript)
        const req = socket.request
        req.session.user = req.session.user!

        if (socket.rooms.has("HOST")) {
            //Socket is host, do not send events back because it manages its own state sometimes and might get confused
            socket.to("USER" + req.session.user.id).emit(event, args)
        } else {
            //Socket is remote and therefore stupid. It wants an event reply to tell it to *actually* do the requested action
            io.to("USER" + req.session.user.id).emit(event, args) //This will send the event back to the sender
        }
    })
}

export default { connect }