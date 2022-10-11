/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createCheerioRouter } from 'crawlee';
import { pushData } from '@wng/common';
import { JSDOM } from 'jsdom';

export const router = createCheerioRouter();

const patchnotesWords = /out now|release notes|update|season \d+/i;

interface ContentItem {
  articleCopy?: {
    _type: 'Stardust - Article - Copy';
    copy: string;
    title?: string;
  };
  embeddedVideo?: {
    _type: 'Stardust - Element - Embedded Video';
    mediaOptions: (
      | {
          _type: 'Stardust - Element - BackgroundVideo - Video Options';
          youtubeVideo: {
            _type: 'Stardust - Element - Video Option - YoutubeVideo';
            contentId: 'AQvQfCnnhB4';
          };
        }
      | {
          _type: 'Stardust - Element - BackgroundVideo - Video Options';
          htmlVideo: {
            _type: 'Stardust - Element - BackgroundVideo - Video Options';
            content: [];
          };
        }
    )[];
  };
  articleImage?: {
    _type: 'Stardust - Article - Image';
    imageSrc: 'https://cdn2.unrealengine.com/fgss02-seasonpass-1upip3-1920x1080--1920x1080-a7581d289f8a.png';
  };
}

router.addDefaultHandler(async ({ enqueueLinks, log }) => {
  log.info(`enqueueing new URLs`);
  await enqueueLinks({
    globs: ['https://www.fallguys.com/news/**'],
    label: 'note',
  });
});

router.addHandler('note', async ({ request, $, log }) => {
  const { url } = request;

  const data = JSON.parse($('#__NEXT_DATA__').first().text());

  const title: string = data.props.pageProps.pageData.header.title;

  if (!patchnotesWords.test(title)) return;
  const contentJson = data.props.pageProps.pageData.content.items as ContentItem[];
  const date = data.props.pageProps.pageData._activeDate;

  const dom = new JSDOM('<body></body>');
  const body = dom.window.document.body;

  for (const c of contentJson) {
    const key = Object.keys(c)[0] as keyof ContentItem;
    switch (key) {
      case 'articleCopy':
        {
          if (c[key]!.title) {
            const h2 = dom.window.document.createElement('h2');
            h2.innerHTML = c[key]!.title!;
            body.appendChild(h2);
          }
          const p = dom.window.document.createElement('p');
          p.innerHTML = c[key]!.copy;
          body.appendChild(p);
        }

        break;
      case 'embeddedVideo':
        {
          const mo = c[key]?.mediaOptions[0];
          if (mo && 'youtubeVideo' in mo) {
            const yp = dom.window.document.createElement('youtube-privacy');
            yp.setAttribute('width', '640');
            yp.setAttribute('height', '360');
            yp.setAttribute('frameborder', '0');
            yp.setAttribute('src', 'https://www.youtube-nocookie.com/embed/' + mo.youtubeVideo.contentId);
            body.appendChild(yp);
          }
        }

        break;
      case 'articleImage':
        {
          const img = dom.window.document.createElement('img');
          img.setAttribute('src', c[key]!.imageSrc);
          body.appendChild(img);
        }
        break;

      default:
        throw new Error(`Unknown key ${key}`);
    }
  }

  const content = body.innerHTML;

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
