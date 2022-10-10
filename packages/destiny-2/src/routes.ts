import { createCheerioRouter } from 'crawlee';
import { pushData } from '@wng/common';

export const router = createCheerioRouter();

router.addDefaultHandler(async ({ enqueueLinks, log, request }) => {
  log.info(`enqueueing new URLs ${request.url}`);

  const res = await enqueueLinks({
    globs: ['https://www.bungie.net/en/Explore/Detail/News/**'],
    label: 'note',
  });

  if (res.processedRequests.length > 0) {
    await enqueueLinks({
      globs: ['https://www.bungie.net/en/News/Index?tag=news-updates&page=*'],
    });
  }
});

router.addHandler('note', async ({ request, $, log }) => {
  const { url } = request;

  // Example
  const title = $('#article-container h1.section-header').text().trim();
  const date = $('#article-container .metadata.section-subheader').text().split(' - ')[0];
  const content = $('#article-container .content.text-content').first().html();

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
    date: { date, format: 'MMM Do YYYY' },
    title,
    content,
  });
});
