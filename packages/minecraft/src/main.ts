import { main } from '@wng/common';
import { router } from './routes.js';
import packageJson from '../package.json' assert { type: 'json' };

await main({
  packageJson,
  startUrls: ['https://feedback.minecraft.net/hc/en-us/sections/360001186971?page=1'],
  requestHandler: router,
});
