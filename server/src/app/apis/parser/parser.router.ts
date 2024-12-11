import { Router } from 'express';
import { ParserCtrl } from './parser.ctrl';

const parserRouter = Router();

parserRouter.route('/').post(ParserCtrl.parseUrl);

export { parserRouter };
