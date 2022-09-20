import { Actor } from 'apify';
import { createCheerioRouter } from 'crawlee';
import { sanitize, parseDate } from '@wng/common';

export const router = createCheerioRouter();

const input = await Actor.getInput<Record<string, unknown>>();

router.addDefaultHandler(async ({ enqueueLinks, log }) => {
  log.info(`enqueueing new URLs`);

  if (input?.scanAll) {
    await enqueueLinks({
      globs: ['https://feedback.minecraft.net/hc/en-us/sections/360001186971-Release-Changelogs?page=*'],
    });
  }

  await enqueueLinks({
    globs: ['https://feedback.minecraft.net/hc/en-us/articles/*'],
    label: 'note',
  });
});

router.addHandler('note', async ({ request, $, log }) => {
  const { url } = request;

  // Example
  const title = $('#article-container h1').text()?.trim();
  const dateElement = $('#article-container .article-content > .article-body > p').first();
  const date = parseDate('MMMM Do YYYY', dateElement.contents().last().text().trim());

  // Do not include the date in the article itself
  dateElement.remove();
  const content = sanitize($('#article-container .article-content > .article-body').html());

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
