import { createCheerioRouter } from 'crawlee';
import { pushData } from '@wng/common';
import { JSONData } from './types.js';

export const router = createCheerioRouter();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function jsonGuard(json: any): json is JSONData {
  return Boolean(json) && Array.isArray(json) && (json.length === 0 || 'defaultUrl' in json[0]);
}

router.addDefaultHandler(async ({ log, json }) => {
  log.info(`enqueueing new URLs`);

  if (!jsonGuard(json)) {
    throw new Error('Invalid JSON');
  }

  const data = json.map((d) => ({
    title: d.title,
    content: d.content,
    date: d.publish,
    url: d.defaultUrl,
  }));

  data.forEach((d) => log.info('Page scraped', { date: d.date, url: d.url, title: d.title }));

  await pushData(data);
});
