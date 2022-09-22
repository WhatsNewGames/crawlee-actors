import { main } from '@wng/common';
import { router } from './routes.js';
import packageJson from '../package.json' assert { type: 'json' };

await main({
  packageJson,
  startUrls: [
    'https://www.epicgames.com/fortnite/api/blog/getPosts?category=&postsPerPage=100&offset=0&locale=en-US&rootPageSlug=blog',
  ],
  requestHandler: router,
});
