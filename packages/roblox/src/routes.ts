import { createCheerioRouter, enqueueLinks as enqueueLinksRaw } from 'crawlee';
import { getInput } from '@wng/common';
import { JSONData } from './types.js';
import { pushDataWhenFull } from './partial-push.js';

export const router = createCheerioRouter();

const startUrlForDates = 'https://devforum.roblox.com/c/updates/release-notes/62.json?page=0';

router.addDefaultHandler(async ({ enqueueLinks, log, crawler }) => {
  const input = await getInput();

  log.info(`INPUT: ${JSON.stringify(input)}`);
  log.info(`enqueueing new URLs`);

  const requestQueue = await crawler.getRequestQueue();

  await enqueueLinksRaw({
    requestQueue,
    urls: [startUrlForDates],
    label: 'date',
  });

  await enqueueLinks({
    globs: [
      'https://developer.roblox.com/en-us/resources/release-note/*',
      'https://developer.roblox.com/resources/release-note/*',
    ],
    label: 'note',
  });
});

router.addHandler('note', async ({ request, $, log }) => {
  const { url } = request;

  // Example
  const title = $('main h1').first().text();
  const content = $('main .page-elements').first().html();

  if (!content) {
    log.error('Page scraped but selector returned empty result', {
      url,
      title,
    });
    return;
  }

  await pushDataWhenFull(
    {
      url,
      title,
      content,
    },
    log,
  );
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function jsonGuard(json: any): json is JSONData {
  return Boolean(json) && 'topic_list' in json;
}

router.addHandler('date', async ({ crawler, json, log }) => {
  if (!jsonGuard(json)) {
    throw new Error('Invalid JSON');
  }

  const topics = json.topic_list.topics.filter((t) => !t.pinned);

  for (const topic of topics) {
    await pushDataWhenFull(
      {
        title: topic.title,
        date: { date: topic.created_at, format: 'isoDateTime' },
      },
      log,
    );
  }

  const input = await getInput();

  if (input?.scanAll && json.topic_list.more_topics_url) {
    log.info(`enqueueing new URL`);

    const requestQueue = await crawler.getRequestQueue();
    await enqueueLinksRaw({
      requestQueue,
      urls: [new URL(json.topic_list.more_topics_url.replace('/62?', '/62.json?'), startUrlForDates).toString()],
      label: 'date',
    });
  }
});
