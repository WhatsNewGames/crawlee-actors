import { main } from '@wng/common';
import { router } from './routes.js';
import packageJson from '../package.json' assert { type: 'json' };

await main({
  packageJson,
  startUrls: ['https://en-americas-support.nintendo.com/app/answers/detail/a_id/60277/p/989'],
  requestHandler: router,
});
