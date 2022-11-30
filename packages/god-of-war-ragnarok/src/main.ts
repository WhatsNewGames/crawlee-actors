import { main } from '@wng/common';
import { router } from './routes.js';
import packageJson from '../package.json' assert { type: 'json' };

await main({
  packageJson,
  startUrls: ['https://support.sms.playstation.com/hc/en-us/sections/10344846669325-Patch-Notes'],
  requestHandler: router,
});
