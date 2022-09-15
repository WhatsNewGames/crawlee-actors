/**
 * This template is a production ready boilerplate for developing with `CheerioCrawler`.
 * Use this to bootstrap your projects using the most up-to-date code.
 * If you're looking for examples or want to learn more, see README.
 */

// For more information, see https://sdk.apify.com
import { Actor, RequestQueue } from 'apify';
// For more information, see https://crawlee.dev
import { CheerioCrawler } from 'crawlee';
import { router } from './routes.js';

// Initialize the Apify SDK
await Actor.init();

const startUrls = ['https://robertsspaceindustries.com/patch-notes'];
const requestQueue = await RequestQueue.open('star-citizen');

// const proxyConfiguration = await Actor.createProxyConfiguration();

const crawler = new CheerioCrawler({
  requestQueue,
  // proxyConfiguration,
  requestHandler: router,
});

await crawler.run(
  startUrls.map((url) => ({
    url,
    uniqueKey: `${url}/${new Date().toISOString()}'`,
  })),
);

// Exit successfully
await Actor.exit();