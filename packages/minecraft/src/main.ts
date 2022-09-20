/**
 * This template is a production ready boilerplate for developing with `CheerioCrawler`.
 * Use this to bootstrap your projects using the most up-to-date code.
 * If you're looking for examples or want to learn more, see README.
 */

// For more information, see https://sdk.apify.com
import { Actor } from 'apify';
// For more information, see https://crawlee.dev
import { CheerioCrawler } from 'crawlee';
import { router } from './routes.js';
import packageJson from '../package.json' assert { type: 'json' };

// Initialize the Apify SDK
await Actor.init();

// Do not touch
const datasetId = Actor.getEnv().defaultDatasetId;
await Actor.setValue('DATASET_ID', datasetId);
await Actor.setValue('SLUG', packageJson.config.slug);

// TODO: support fullscan through INPUT (scan all pages)
const startUrls = ['https://feedback.minecraft.net/hc/en-us/sections/360001186971?page=1'];

const crawler = new CheerioCrawler({
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