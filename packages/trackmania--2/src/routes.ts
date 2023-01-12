import { createCheerioRouter } from 'crawlee';
import { pushData } from '@wng/common';

export const router = createCheerioRouter();

router.addDefaultHandler(async ({ enqueueLinks, log }) => {
  log.info(`enqueueing new URLs`);
  await enqueueLinks({
    selector: '.content h2[component="topic/header"] a[href]',
    globs: ['https://discussions.ubisoft.com/topic/**'],
    label: 'note',
  });
});

router.addHandler('note', async ({ request, $, log }) => {
  const { url } = request;

  const isPinned = $('.posts .title-container span[component="topic/pinned"]:not(.hidden)').length;

  if (isPinned) {
    return;
  }

  // Remove elements around the title
  $('.posts .title-container [component="topic/title"] .topic-state').remove();
  const title = $('.posts .title-container [component="topic/title"]').text().trim();
  const date = $('.posts .post-header .timeago').first().attr('title')!;
  // Remove images relative to base url root
  $('.posts [component="post/content"] img')
    .filter(function () {
      return ($(this).attr('src') ?? '').startsWith('/');
    })
    .remove();
  const content = $('.posts [component="post/content"]').first().html()?.trim();

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
    date: { date, format: 'isoDateTime' },
    title,
    content,
  });
});
