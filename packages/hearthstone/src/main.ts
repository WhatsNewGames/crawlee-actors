import { main } from '@wng/common';
import { router } from './routes.js';
import packageJson from '../package.json' assert { type: 'json' };

await main({
  packageJson,
  startUrls: ['https://hearthstone.blizzard.com/en-us/api/blog/articleList/?page=1&pageSize=40&tagsList[]=patch'],
  requestHandler: router,
});
