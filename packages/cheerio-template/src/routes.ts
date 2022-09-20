import { Actor } from 'apify';
import { createCheerioRouter } from 'crawlee';
import { sanitize, parseDate } from '@wng/common';

export const router = createCheerioRouter();

router.addDefaultHandler(async ({ enqueueLinks, log }) => {
  log.info(`enqueueing new URLs`);
  await enqueueLinks({
    globs: ['https://.../**'],
    label: 'note',
  });
});

router.addHandler('note', async ({ request, $, log }) => {
  const { url } = request;

  // Example
  const title = $('#post > .title-section .title').text()?.trim();
  const date = parseDate('MMMM Do YYYY', $('#post > .title-section .details > div:nth-child(3) > p').text());
  const content = sanitize($('#post > .wrapper').first().html());

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
});
