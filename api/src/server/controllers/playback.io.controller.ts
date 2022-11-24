import type { Socket } from "socket.io"

interface PlaybackSession {
    host: Socket
    remotes: Socket[]
}

const playbackSessions: PlaybackSession[] = []

function connect(socket: Socket) {
    socket.request.session.user = socket.request.session.user!
    if (!playbackSessions[socket.request.session.user.id]) {
        playbackSessions[socket.request.session.user.id] = {
            host: socket,
            remotes: []
        }
        socket.emit("becomeHost")
    } else {
        playbackSessions[socket.request.session.user.id]!.remotes.push(socket)
        socket.emit("becomeRemote")
    }

    socket.join(socket.request.session.id)
    socket.join("USER" + socket.request.session.user.id)
}

function disconnect(socket: Socket) {
    //Lots of not-null assertions because typescript is dumb and we are smort
    const req = socket.request

    req.session.user = req.session.user!
    if (!playbackSessions[req.session.user.id]) {
        console.warn("SOCKET_DISCONNECT_AFTER_SESSION_DELETE")
        return //We do nothing because the session is already gone
    }

    const i = playbackSessions[req.session.user.id]!.remotes.findIndex(s => s == socket)

    if (i) {
        playbackSessions[req.session.user.id]!.remotes.splice(i, 1)
    } else if (playbackSessions[req.session.user.id]!.host == socket) {
        if (!playbackSessions[req.session.user.id]!.remotes[0]) {
            delete playbackSessions[req.session.user.id]
        } else {
            playbackSessions[req.session.user.id]!.host = playbackSessions[req.session.user.id]!.remotes[0]!
            playbackSessions[req.session.user.id]!.remotes.splice(0,1)
        }
    } else {
        //Socket has session but is not part of playbackSession.
        //dafuq?
        throw "PLAYBACK_SESSION_PREMATURELY_DELETED_SEND_HELP"
    }
}

export default { connect, disconnect }