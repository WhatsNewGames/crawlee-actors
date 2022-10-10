import { main } from '@wng/common';
import { router } from './routes.js';
import packageJson from '../package.json' assert { type: 'json' };

await main({
  packageJson,
  startUrls: ['https://www.bungie.net/en/News/Index?tag=news-updates&page=0'],
  requestHandler: router,
});
