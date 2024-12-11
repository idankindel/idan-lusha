import { Router } from 'express';
import { parserRouter } from './parser/parser.router';

const apiRouter = Router();

apiRouter.use('/parser', parserRouter);

export { apiRouter };
