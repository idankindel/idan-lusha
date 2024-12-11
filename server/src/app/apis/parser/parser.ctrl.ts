import { Request, Response } from 'express';
import { PraserBl } from './parser.bl';
import { queuesManager } from '../../utils/queue-manager';

export namespace ParserCtrl {

  export const parseUrl = async (req: Request, res: Response) => {
    try {
      const validationText = PraserBl.validUrl(req.body);

      if (validationText) {
        console.error('Validation failed', { validationText });
        res.status(422).send(validationText);
        return;
      }

      // Process the URL and get the results immediately
      const parseResults = await PraserBl.parseUrl(req.body.url, true);

      res.status(200).send(parseResults);

      // After sending the response, continue parsing the other links in the background
      queuesManager.processQueue();
    } catch (error) {
      res.status(500).send(error.message || PraserBl.labels.error.internalServerError);
    }
  };


}
