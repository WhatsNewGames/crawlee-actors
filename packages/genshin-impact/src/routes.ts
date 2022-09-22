import { createCheerioRouter, enqueueLinks } from 'crawlee';
import { pushData } from '@wng/common';
import { JSONData, JSONDataNote } from './types.js';

export const router = createCheerioRouter();

const baseUrl = 'https://content-static-sea.hoyoverse.com/content/yuanshen/getContent?around=1';

function getUrl(contentId: string): string {
  const url = new URL(baseUrl);
  url.searchParams.set('contentId', String(contentId));

  return url.toString();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function jsonGuard(json: any): json is JSONData {
  return Boolean(json) && 'data' in json;
}

router.addDefaultHandler(async ({ log, json, crawler }) => {
  log.info(`enqueueing new URLs`);

  if (!jsonGuard(json)) {
    throw new Error('Invalid JSON');
  }

  const requestQueue = await crawler.getRequestQueue();

  await enqueueLinks({
    requestQueue,
    urls: json.data.list.map((a) => getUrl(a.contentId)),
    label: 'note',
  });
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function jsonGuardArticle(json: any): json is JSONDataNote {
  return Boolean(json) && 'data' in json;
}

router.addHandler('note', async ({ request, json, log }) => {
  if (!jsonGuardArticle(json)) {
    throw new Error('Invalid JSON');
  }

  const { url } = request;

  // Example
  const title = json.data.title;
  const content = json.data.content;
  const date = json.data.start_time;

  if (!content) {
    log.error('Page scraped but selector returned empty result', {
      url,
      title,
    });
    return;
  }

  // Use "log" object to print information to actor log.
  log.info('Page scraped', { url, title, date });

  await pushData({
    url,
    date: { date, format: 'YYYY-MM-DD HH:mm:ss' },
    title,
    content,
  });
});
