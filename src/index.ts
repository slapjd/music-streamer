import express, { Request, Response } from 'express';
import { mainDataSource } from './database';
import { User } from './entity/user/user';

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

// register routes
app.get("/users", async function (_req: Request, res: Response) {
  const users = await mainDataSource.getRepository(User).find()
  res.json(users)
})

app.get("/users/:id", async function (req: Request, res: Response) {
  const results = await mainDataSource.getRepository(User).findOneBy({
      id: +!req.params['id'],
  })
  return res.send(results)
})

app.post("/users", async function (req: Request, res: Response) {
  //TODO: Middleware?
  if (req.body['username'] === undefined || req.body['password'] === undefined) {
    return res.status(400).send({message: "Need username and password to register"})
  }
  const usernameCheckResults = await mainDataSource.getRepository(User).findOneBy({
    username: req.body['username']
  })
  if (usernameCheckResults !== null) {
    return res.status(400).send({message: "Username taken"})
  }

  //Checks passed, we can make a new usery boi
  const user = User.synthesize(req.body['username'], req.body['password']) //Done manually to avoid accidental client-side hash creation
  const results = await mainDataSource.getRepository(User).save(user)
  return res.send(results)
})

app.put("/users/:id", async function (req: Request, res: Response) {
  const user = await mainDataSource.getRepository(User).findOneBy({
      id: +!req.params['id'],
  })
  if (user === null) {
    return res.status(404).send({message: "User to modify does not exist"})
  }
  mainDataSource.getRepository(User).merge(user, req.body)
  const results = await mainDataSource.getRepository(User).save(user)
  return res.send(results)
})

app.delete("/users/:id", async function (req: Request, res: Response) {
  const results = await mainDataSource.getRepository(User).delete(+!req.params['id'])
  return res.send(results)
})

//This will be set by docker eventually
const port: Number = Number(process.env['PORT']) || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
})