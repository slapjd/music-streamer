import express from 'express';
import http from 'http';
import socketio from 'socket.io';
import tracks from './tracks'

const app: express.Application = express();
const httpServer: http.Server = http.createServer(app); //Explicitly done for socket.io
const io: socketio.Server = new socketio.Server(httpServer)
const port: number = 9000;

//app.use(express.static('wwwroot'));

app.use('/tracks', tracks)

io.on("connection", (_) => {
    console.log("CONNECTION_ATTEMPT")
});

// app.get('/js', (_req, _res) => {
//     _res.send("TypeScript With Expresss");
// });



// Server setup
httpServer.listen(port, () => {
    console.log(`TypeScript with Express
         http://localhost:${port}/`);
});