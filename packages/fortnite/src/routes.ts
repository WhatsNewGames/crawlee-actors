import { createCheerioRouter } from 'crawlee';
import { pushData } from '@wng/common';
import { JSONData } from './types.js';

export const router = createCheerioRouter();

const baseUrl = 'https://www.epicgames.com/fortnite/en-US/news/';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function jsonGuard(json: any): json is JSONData {
  return Boolean(json) && 'blogList' in json;
}

router.addDefaultHandler(async ({ log, json }) => {
  if (!jsonGuard(json)) {
    throw new Error('Invalid JSON');
  }

  const data = json.blogList
    .map((b) => ({
      url: new URL(b.slug, baseUrl).toString(),
      content: b.content,
      date: { date: b.date, format: 'isoDateTime' },
      title: b.title,
    }))
    // matches titles with versions, i.e. '... v20.20 ...'
    .filter((d) => d.title.match(/(\s|^)v\d+\.\d+(\s|$)/));

  data.forEach((d) => log.info('Page scraped', { date: d.date, url: d.url, title: d.title }));

  await pushData(data);
});
