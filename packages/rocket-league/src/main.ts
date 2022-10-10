import { main } from '@wng/common';
import { router } from './routes.js';
import packageJson from '../package.json' assert { type: 'json' };

await main({
  packageJson,
  startUrls: ['https://www.rocketleague.com/ajax/articles-results/?cat=7-5aa1f33-rqfqqm'],
  requestHandler: router,
});
