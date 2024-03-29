import { Actor } from 'apify';
import { log } from 'crawlee';
import type { IOptions } from 'sanitize-html';
import { parseDate } from './date.js';
import { sanitize } from './sanitize.js';

export interface Data {
  url: string;
  date: number | Date | { format: string; date: string };
  title: string;
  content: string;
  sanitizeOptions?: IOptions;
}

function cleanURL(url: string): string {
  return new URL(url).toString();
}

function isYearMeaningful(date: Date) {
  const year = new Date(date).getFullYear();
  const yearNow = new Date().getFullYear();

  return year > 1970 && year < yearNow + 10;
}

function cleanDate(date: number | Date | { format: string; date: string }): number {
  if (typeof date === 'number') {
    if (!isYearMeaningful(new Date(date))) {
      throw new Error(`Invalid date ${date}. Must be in milliseconds`);
    }

    return date;
  } else if (date instanceof Date) {
    if (!isYearMeaningful(date)) {
      throw new Error(`Invalid date ${date}`);
    }
    return date.getTime();
  } else if (typeof date === 'object' && date !== null) {
    return parseDate(date.format, date.date);
  }

  throw new Error(`Invalid date ${date}`);
}

function cleanTitle(title: string) {
  return title.trim();
}

function cleanData({ url, date, title, content, sanitizeOptions }: Data): Data {
  return {
    url: cleanURL(url),
    date: cleanDate(date),
    title: cleanTitle(title),
    content: sanitize(content, sanitizeOptions),
  };
}

export async function pushData(data: Data | Data[]): Promise<void> {
  let cleaned: Data[] = Array.isArray(data) ? data.map(cleanData) : [cleanData(data)];

  // Make sure that data does not exists yet for current URLs, because request queue entries are only kept 7 days
  const dataset = await Actor.openDataset();

  const existingUrls = new Set(
    (
      await dataset.getData({
        clean: true,
        fields: ['url'],
      })
    ).items.map((d) => d.url as string),
  );

  cleaned = cleaned.filter((d) => !existingUrls.has(d.url));
  if (cleaned.length === 0) {
    log.info('Pushing no data.');
    return;
  }

  // TODO: apify-client is not yet up-to-date:
  //   ERROR Request batch insert failed
  //   ApifyApiError: Invalid value provided in requests: requests.0.handledAt must be of type Date(details: type=schema-validation)
  //     clientMethod: RequestQueueClient.batchAddRequests
  //     statusCode: 400
  //     type: schema-validation
  //     attempt: 1
  //     httpMethod: post
  //     path: /v2/request-queues/BMM7W3VSBmYUgGprd/requests/batch
  //     stack:
  //       at makeRequest (/usr/src/app/packages/hearthstone/node_modules/.pnpm/apify-client@2.6.3/node_modules/apify-client/dist/http_client.js:183:30)
  //       at processTicksAndRejections (node:internal/process/task_queues:96:5)
  //       at async RequestQueueClient._batchAddRequests (/usr/src/app/packages/hearthstone/node_modules/.pnpm/apify-client@2.6.3/node_modules/apify-client/dist/resource_clients/request_queue.js:136:26)
  //       at async RequestQueueClient._batchAddRequestsWithRetries (/usr/src/app/packages/hearthstone/node_modules/.pnpm/apify-client@2.6.3/node_modules/apify-client/dist/resource_clients/request_queue.js:159:34)

  // const requestQueue = await Actor.openRequestQueue();
  // const nowISO = new Date().toISOString();

  // // Then, make sure that each patchnote URL on pages with multiple ones (like heartstone) are added in request queue
  // await requestQueue.addRequests(
  //   cleaned.map((d) => ({
  //     method: 'GET',
  //     uniqueKey: d.url,
  //     url: d.url,
  //     handledAt: nowISO,
  //     state: RequestState.DONE,
  //   })),
  // );

  log.info('Pushing data.', { size: cleaned.length });

  await Actor.pushData(cleaned);
}
