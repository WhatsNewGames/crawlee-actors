import { main } from '@wng/common';
import { router } from './routes.js';
import packageJson from '../package.json' assert { type: 'json' };

await main({
  packageJson,
  startUrls: ['https://overwatch.blizzard.com/en-us/news/patch-body/live/2022/10/'],
  requestHandler: router,
});
