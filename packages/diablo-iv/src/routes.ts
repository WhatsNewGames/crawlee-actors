import { createCheerioRouter } from 'crawlee';
import { htmlAll, pushData } from '@wng/common';
import { createHash } from 'crypto';

export const router = createCheerioRouter();

router.addDefaultHandler(async ({ request, $, log }) => {
  const allDetails = $('#article-detail .ArticleDetail-content details');

  const promises: Promise<unknown>[] = [];

  allDetails.each(function () {
    const titleAndDate = $('summary', this).text().trim();
    const title = titleAndDate.replace(/ - (.*?)$/, '');
    const date = titleAndDate.replace(/^.* - /, '');
    const url = request.url + '#' + createHash('sha256').update(title).digest('hex').substring(0, 12);
    $('summary', this).remove();
    const content = htmlAll($, $(this));

    if (!content || !date) {
      log.error('Page scraped but selector returned empty result', {
        date,
        url,
        title,
      });
      return;
    }

    log.info('Page scraped', { url, title, date });

    promises.push(
      pushData({
        url,
        date: { date, format: 'MMMM Do YYYY' },
        title,
        content,
      }),
    );
  });

  await Promise.all(promises);
  // currentPoint = currentPoint.nextAll('hr').first();
  // let stop = false;

  // while (!stop) {
  //   const $post = currentPoint.nextUntil('hr');

  //   const date = $post.first().text().trim();
  //   const title = $post.nextAll('h4').first().text().trim().replace(/^- /, '');
  //   const url = request.url + '#' + createHash('sha256').update(title).digest('hex').substring(0, 12);
  //   stop = title.includes('Build #42122');

  //   const contentRange = stop
  //     ? $post.nextAll('h4').first().nextUntil('p')
  //     : $post.nextAll('h4').first().nextUntil('hr');

  //   const content = htmlAll($, contentRange);

  // if (!content || !date) {
  //   log.error('Page scraped but selector returned empty result', {
  //     date,
  //     url,
  //     title,
  //   });
  //   return;
  // }

  // log.info('Page scraped', { url, title, date });

  // await pushData({
  //   url,
  //   date: { date, format: 'MMMM Do YYYY' },
  //   title,
  //   content,
  // });

  //   currentPoint = currentPoint.nextAll('hr').first();
  // }
});
