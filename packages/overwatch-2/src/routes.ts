import { createCheerioRouter } from 'crawlee';
import { pushData } from '@wng/common';

export const router = createCheerioRouter();
const baseUrl = 'https://overwatch.blizzard.com/en-us/';

router.addDefaultHandler(async ({ enqueueLinks, request, $, log }) => {
  log.info(`enqueueing new URLs`);

  await enqueueLinks({
    globs: [`${baseUrl}news/patch-body/live/**`],
    selector: 'blz-button.PatchNotesPaginationLink--next[href]',
    transformRequestFunction: (request) => {
      request.url = request.url
        .replace('/patch-notes/', '/patch-body/')
        .replace('https://overwatch.blizzard.com/', baseUrl);
      return request;
    },
  });

  let { url } = request;
  url = request.loadedUrl ?? url;

  const promises: Promise<unknown>[] = [];

  $('.PatchNotes-patch').each(function () {
    const anchor = $('.anchor', this).first().attr('id');
    const title = $('.PatchNotes-patchTitle', this).text();
    const date = $('.PatchNotes-date', this).text();
    const content = $('.PatchNotes-section', this)
      .map(function () {
        return $(this).html();
      })
      .toArray()
      .join('');

    const innerUrl = url + '#' + anchor;

    if (!content) {
      log.error('Page scraped but selector returned empty result', {
        url: innerUrl,
        title,
      });
      return;
    }

    log.info('Page scraped', { url: innerUrl, title, date });

    promises.push(
      pushData({
        url: innerUrl,
        date: { date, format: 'MMMM Do YYYY' },
        title,
        content,
      }),
    );
  });

  await Promise.all(promises);
});
