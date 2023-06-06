import { main } from '@wng/common';
import { router } from './routes.js';
import packageJson from '../package.json' assert { type: 'json' };

await main({
  packageJson,
  startUrls: ['https://news.blizzard.com/en-us/diablo4/23964909/diablo-iv-patch-notes'],
  requestHandler: router,
});
