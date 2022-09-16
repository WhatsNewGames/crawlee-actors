import { Actor } from 'apify';
import { createCheerioRouter } from 'crawlee';
import { sanitize } from './common.js';
import { parseStarCitizenDate } from './helpers.js';

export const router = createCheerioRouter();
const dataset = await Actor.openDataset('star-citizen', {
  forceCloud: Boolean(process.env.CI || process.env.APIFY_ACTOR_ID),
});

router.addDefaultHandler(async ({ enqueueLinks, log }) => {
  log.info(`enqueueing new URLs`);
  await enqueueLinks({
    globs: ['https://robertsspaceindustries.com/comm-link/**'],
    label: 'note',
  });
});

router.addHandler('note', async ({ request, $, log }) => {
  const { url } = request;
  const title = $('#post > .title-section .title').text()?.trim();
  const content = sanitize($('#post > .wrapper').first().html() ?? '', {
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
  });
  const date = parseStarCitizenDate($('#post > .title-section .details > div:nth-child(3) > p').text());

  if (!content) {
    log.error('Page scraped but selector returned empty result', {
      url,
      title,
    });
    return;
  }

  // Use "log" object to print information to actor log.
  log.info('Page scraped', { url, title, date });

  await dataset.pushData({
    url,
    date,
    title,
    content,
  });
});
