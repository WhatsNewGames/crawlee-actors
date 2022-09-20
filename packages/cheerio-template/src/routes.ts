import { Actor } from 'apify';
import { createCheerioRouter } from 'crawlee';

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
  const content = $('#post > .wrapper').first().html();
  const date = $('#post > .title-section .details > div:nth-child(3) > p').text();

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
