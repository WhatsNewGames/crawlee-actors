import { main } from '@wng/common';
import { router } from './routes.js';
import packageJson from '../package.json' assert { type: 'json' };

await main({
  packageJson,
  startUrls: [
    'https://discussions.ubisoft.com/category/826/news-announcements?lang=en-US',
    'https://discussions.ubisoft.com/category/826/news-announcements?lang=en-US&page=2',
  ],
  requestHandler: router,
});
