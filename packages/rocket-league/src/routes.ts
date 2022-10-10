import { createCheerioRouter } from 'crawlee';
import { pushData } from '@wng/common';

export const router = createCheerioRouter();

router.addDefaultHandler(async ({ enqueueLinks, log }) => {
  log.info(`enqueueing new URLs`);
  await enqueueLinks({
    globs: ['https://www.rocketleague.com/news/**'],
    label: 'note',
  });
});

router.addHandler('note', async ({ request, $, log }) => {
  const { url } = request;

  // Example
  const title = $('#page-title').text();
  const dateElt = $('#content .info > .fa-calendar').get(0)?.nextSibling;
  let date = '';
  if (dateElt?.type === 'text') {
    date = dateElt.nodeValue.trim();
  }
  const content = $('#content .page-content.article').html();

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
