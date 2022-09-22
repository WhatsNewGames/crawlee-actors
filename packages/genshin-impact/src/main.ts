import { main } from '@wng/common';
import { router } from './routes.js';
import packageJson from '../package.json' assert { type: 'json' };

await main({
  packageJson,
  startUrls: [
    'https://content-static-sea.hoyoverse.com/content/yuanshen/getContentList?pageSize=100&pageNum=1&channelId=12',
  ],
  requestHandler: router,
});
