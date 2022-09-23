import express from 'express';

const app: express.Application = express();

//configure application routes
//@GET - dummy api route
//@ts-ignore
app.get('/api', (req, res, next) => {
  res.status(200).json({
    hello: 'World!',
  });
});

const port: Number = Number(process.env['PORT']) || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});