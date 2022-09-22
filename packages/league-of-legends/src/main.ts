import packageJson from '../package.json' assert { type: 'json' };
import { main, riot } from '@wng/common';

await main({
  packageJson,
  startUrls: ['https://www.leagueoflegends.com/page-data/en-us/news/tags/patch-notes/page-data.json'],
  requestHandler: riot.getRouter(),
});
