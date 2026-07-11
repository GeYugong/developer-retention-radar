import express from 'express';

const app = express();
app.use(express.json());
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

const port = Number(process.env.PORT ?? 3000);
if (process.env.NODE_ENV !== 'test') app.listen(port, () => console.log(`API listening on ${port}`));
export { app };
