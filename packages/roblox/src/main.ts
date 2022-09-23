import { main } from '@wng/common';
import { router } from './routes.js';
import packageJson from '../package.json' assert { type: 'json' };

await main({
  packageJson,
  startUrls: ['https://developer.roblox.com/en-us/resources/release-note/index'],
  requestHandler: router,
});
