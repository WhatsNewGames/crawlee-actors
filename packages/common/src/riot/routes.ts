import { Actor } from 'apify';
import { createCheerioRouter, enqueueLinks } from 'crawlee';
import { pushData } from '../index.js';
import { JSONData } from './types.js';

const baseUrl = 'https://www.leagueoflegends.com/en-us/';

export const router = createCheerioRouter();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function jsonGuard(json: any): json is JSONData {
  return Boolean(json) && 'result' in json;
}

router.addDefaultHandler(async ({ log, json, crawler }) => {
  log.info(`enqueueing new URLs`);

  if (!jsonGuard(json)) {
    throw new Error('Invalid JSON');
  }

  const urls = json.result.data.articles.nodes
    // remove leading `/`
    .map((n) => n.url.url.replace(/^\//, ''))
    .map((u) => new URL(u, baseUrl).toString());
  const requestQueue = await crawler.getRequestQueue();

  await enqueueLinks({
    baseUrl,
    urls,
    label: 'note',
    requestQueue,
  });
});

router.addHandler('note', async ({ request, $, log }) => {
  const { url } = request;

  // Example
  const title = $('h1').first().text();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const date = $('time[datetime]').first().attr('datetime')!;

  // Apply Tailwind classes. Make sure that the added classes are whitelisted in `sanitize`.
  $('#patch-notes-container .context-designer').addClass('flex flex-row items-center gap-2 not-prose');
  $('#patch-notes-container .context-designer img').addClass('h-8 w-8');
  $('#patch-notes-container .default-2-col').addClass('grid grid-cols-2 gap-4');
  $('#patch-notes-container .content-border').addClass('hero mt-4 bg-base-100');
  $('#patch-notes-container .content-border > div').addClass('hero-content');
  $('#patch-notes-container .attribute-before').addClass('line-through');
  $('#patch-notes-container .attribute').addClass('font-bold');
  $('#patch-notes-container .attribute .new').addClass('badge badge-success');
  $('#patch-notes-container .attribute .removed').addClass('badge badge-error');
  $('#patch-notes-container .attribute .updated').addClass('badge badge-info');

  const content = $('#patch-notes-container').html();

  if (!content) {
    log.error('Page scraped but selector returned empty result', {
      url,
      title,
    });
    return;
  }

  // Use "log" object to print information to actor log.
  log.info('Page scraped', { url, title, date });

  await Actor.pushData({
    url,
    date,
    title,
    content,
  });

  await pushData({
    url,
    date: { date, format: 'isoDateTime' },
    title,
    content,
    sanitizeOptions: {
      exclusiveFilter(frame) {
        if (frame.tag === 'h2' && frame.attribs.id === 'patch-top') {
          return true;
        }
        return false;
      },
    },
  });
});
