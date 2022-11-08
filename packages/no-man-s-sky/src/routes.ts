import { createCheerioRouter } from 'crawlee';
import { pushData } from '@wng/common';

export const router = createCheerioRouter();

router.addDefaultHandler(async ({ enqueueLinks, log }) => {
  log.info(`enqueueing new URLs`);
  await enqueueLinks({
    regexps: [/https:\/\/www\.nomanssky\.com\/\d{4}\/\d{2}\/.*\//],
    label: 'note',
  });
});

router.addHandler('note', async ({ request, $, log }) => {
  const { url } = request;

  // Example
  const title = $('main h1').first().text().trim();
  const date = $('main span.date').first().text();

  // remove header+meta from content
  $('main h1').first().remove();
  $('main .post-meta').remove();
  const content = $('main').first().html();

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
    date: { date, format: 'MMMM Do YYYY' },
    title,
    content,
  });
});
