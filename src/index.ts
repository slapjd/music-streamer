import express from 'express';
import { mainDataSource } from './database';
import authRouter from './auth';

//Fuck singletons and shit just do what typeorm bloody recommends
mainDataSource
    .initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err)
    });

const app: express.Application = express()
app.use(express.json())
app.use('/users', authRouter)

//This will be set by docker eventually
const port: Number = Number(process.env['PORT']) || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
})