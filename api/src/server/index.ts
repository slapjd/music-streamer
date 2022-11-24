import { mainDataSource } from '../config/database.js';

import config from '../config/config.js'
import { server } from '../config/express.js'
import './routes/playback.io.route.js'

//Fuck singletons and shit just do what typeorm bloody recommends
mainDataSource
    .initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err)
    });

server.listen(config.server.port, () => {
  console.log(`Server running on port ${config.server.port}`);
})