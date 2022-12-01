import { createCheerioRouter } from 'crawlee';
import { pushData, htmlAll } from '@wng/common';

export const router = createCheerioRouter();

router.addDefaultHandler(async ({ request, $, log }) => {
  let currentPoint = $('.update-versions').children().first();

  while (currentPoint.html()) {
    const title = currentPoint.text().trim();
    const url = request.url + '#' + currentPoint.children('a[name]').first().attr('name');
    const date = title.match(/.*\(.*\s(\w+\s\d+,\s\d+)\)$/)?.[1];

    const content = htmlAll($, currentPoint.nextUntil('h3'));

    if (!content || !date) {
      log.error('Page scraped but selector returned empty result', {
        url,
        title,
      });
      return;
    }

    log.info('Page scraped', { url, title, date });

    await pushData({
      url,
      date: { date, format: 'MMMM Do YYYY' },
      title,
      content,
    });

    currentPoint = currentPoint.nextAll('h3').first();
  }
});
