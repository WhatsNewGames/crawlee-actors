import packageJson from '../package.json' assert { type: 'json' };
import { main, pushData, riot } from '@wng/common';

const router = riot.getRouter('https://playvalorant.com/en-us/', { noteHandler: false });

function getCssSelector(startWith: string) {
  return `[class^='${startWith}'], [class*=' ${startWith}']`;
}

router.addHandler('note', async ({ request, $, log }) => {
  const { url } = request;

  const base = $(getCssSelector('NewsArticleContent-module--articleSectionWrapper-'));

  // Example
  const title = $(getCssSelector('NewsArticleContent-module--title-'), base).text().trim();
  const date = $(getCssSelector('NewsArticleContent-module--date-'), base).text().trim();
  const content = $(getCssSelector('NewsArticleContent-module--articleTextContent-'), base).html();

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
    date: { date, format: 'MM/DD/YY' },
    title,
    content,
  });
});

await main({
  packageJson,
  startUrls: ['https://playvalorant.com/page-data/en-us/news/tags/patch-notes/page-data.json'],
  requestHandler: router,
});
