import { createServer } from 'node:http';
import express from 'express';
import CONFIG from './config';
import { apiRouter } from './app/apis/api-router';
import { redisManager } from './app/db/redis';
import { queuesManager } from './app/utils/queue-manager';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiRouter);
const httpServer = createServer(app);

const runServer = async () => {
  // The order is matter
  await redisManager.initialize();
  await queuesManager.init();

  httpServer.listen(CONFIG.PORT, () => {
    console.info(`The server listening on port ${CONFIG.PORT}`);
  });
}

runServer();