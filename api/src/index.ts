import express from 'express';
import http from 'http';
import socketio from 'socket.io';

const app: express.Application = express();
const httpServer: http.Server = http.createServer(app); //Explicitly done for socket.io
const io: socketio.Server = new socketio.Server(httpServer)
const port: number = 3000;

//app.use(express.static('wwwroot'));

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