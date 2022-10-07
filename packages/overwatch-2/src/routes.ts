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

  let { url, loadedUrl } = request;
  url = loadedUrl ?? url;

  const title = $('.PatchNotes-patchTitle').text();
  const date = $('.PatchNotes-date').text();
  const content = $('.PatchNotes-section')
    .map(function () {
      return $(this).html();
    })
    .toArray()
    .join('');

  if (!content) {
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
});
