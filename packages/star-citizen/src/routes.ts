import { createCheerioRouter } from 'crawlee';
import { pushData } from '@wng/common';

export const router = createCheerioRouter();

router.addDefaultHandler(async ({ enqueueLinks, log }) => {
  log.info(`enqueueing new URLs`);
  await enqueueLinks({
    globs: ['https://robertsspaceindustries.com/comm-link/**'],
    label: 'note',
  });
});

router.addHandler('note', async ({ request, $, log }) => {
  const { url } = request;
  const title = $('#post > .title-section .title').text();
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

  await pushData({
    url,
    date: { date, format: 'MMMM Do YYYY' },
    title,
    content,
    sanitizeOptions: {
      transformTags: {
        span: (tagName, attribs) => {
          if (attribs.class?.split(' ')?.includes('caps')) {
            attribs.class = 'uppercase';
          }

          return {
            tagName,
            attribs,
          };
        },
      },
    },
  });
});
