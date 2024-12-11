import axios from 'axios';
import { JSDOM } from 'jsdom';
import { validators, ajv } from '../../models/validators';
import { TParseResults } from '../../models/types';
import { mongoDb } from '../../db/mongo';
import CONFIG from '../../../config';
import { queuesManager } from '../../utils/queue-manager';

const parseMock = require('lusha-mock-parser');

export namespace PraserBl {

  export const labels = {
    error: {
      internalServerError: 'Internal server error',
      invalidBody: 'Invalid request body: Please ensure all required fields are correctly provided',
      urlNotValid: 'The provided URL is not valid. Please check the URL format and try again',
      fetchOrParse: 'Failed to fetch or parse the URL',
    },
    successes: {
      alreadyExists: 'Main URL already exists in DB, skipping extraction of links',
      parse: 'URL parsed successfully',
    },
  } as const;

  export const validUrl = (parseBody: { url: string }): string | null => {
    try {
      const validSchema = validators.parseUrl(parseBody);

      if (!validSchema) {
        const errorMessage = ajv.errorsText(validators.parseUrl.errors);

        console.error(errorMessage);

        return labels.error.invalidBody;
      }

      new URL(parseBody.url);

      return null;
    } catch {
      return labels.error.urlNotValid;
    }
  };

  export const parseUrl = async (url: string, isApiCall = false): Promise<TParseResults | null> => {
    const _url = url.startsWith('//') ? `https:${url}` : url;

    try {
      // Check if the URL has already been parsed and stored in the DB
      // TODO: For this check we can use redis as well as a cache remote
      const parsedRow = await mongoDb.findOne<TParseResults>(CONFIG.MONGO.DB, CONFIG.MONGO.COLLECTION, { url: _url });

      if (parsedRow?.data?.url) {
        console.log(labels.successes.alreadyExists);
        return isApiCall ? parsedRow.data : null;
      }

      let headElement: JSDOM['window']['document']['head'];
      let links: string[] = [];

      if (process.env.NODE_ENV === 'development') {
        // Mock parsing (replace with real parsing logic when ready)
        const mockData = parseMock(url);

        const dom = new JSDOM(mockData.html);

        headElement = dom.window.document.head;
        links = mockData.links;
      } else {
        const response = await axios.get(_url);
        const html = response.data;
        const dom = new JSDOM(html);

        headElement = dom.window.document.head;
        links = await extractWebsiteLinksFromHead(headElement);
      }

      const parsedData: TParseResults = { url: _url, head: headElement.outerHTML, links };

      await mongoDb.insertOne(CONFIG.MONGO.DB, CONFIG.MONGO.COLLECTION, parsedData);

      console.log(`${labels.successes.parse}, URL: ${_url}`);

      for (const link of links) {
        await queuesManager.addToQueue({ link });
      }

      if (isApiCall) {
        return parsedData;
      }
    } catch (error) {
      console.error(labels.error.fetchOrParse, { error, url: _url });

      if (isApiCall) {
        throw new Error(labels.error.fetchOrParse);
      }
    }
  };

  const extractWebsiteLinksFromHead = async (headElement: JSDOM['window']['document']['head']): Promise<string[]> => {
    // TODO: Improve the query selector for reduce the code filter (the filter should come from the query), but I assume that you want me to focus on the rest of the assigment
    const linkElements = headElement.querySelectorAll<JSDOM['window']['document']['head']['link']>('link[href]');

    // TODO: Need to do more research to know which one of the link is "real" sub-url of "real" website
    const validLinks = Array.from<JSDOM['window']['document']['head']['link']>(linkElements)
      .filter((link) => {
        const href = link.getAttribute('href');
        const rel = link.getAttribute('rel');

        return isValidHref(href) && isValidRel(rel);
      })
      .map((link) => link.getAttribute('href'));

    return validLinks;
  };

  const isValidHref = (href: string): boolean => {
    const isProtocolRelative = href.startsWith('//');
    const isAbsolute = href.startsWith('http') || href.startsWith('www');
    // Exclude common font and image file types
    const isValidFileType = !/\.(ttf|svg|woff|woff2|png|jpg|jpeg|gif|bmp|ico)$/i.test(href);

    return (isProtocolRelative || isAbsolute) && isValidFileType;
  };

  const isValidRel = (rel: string | null): boolean => {
    const excludedRelTypes = ['stylesheet', 'icon', 'json', 'xml', 'manifest'];

    return !excludedRelTypes.includes(rel?.toLowerCase());
  };

}
