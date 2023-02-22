/**
 * This template is a production ready boilerplate for developing with `CheerioCrawler`.
 * Use this to bootstrap your projects using the most up-to-date code.
 * If you're looking for examples or want to learn more, see README.
 */

// For more information, see https://sdk.apify.com
import { Actor } from 'apify';
// For more information, see https://crawlee.dev
import { CheerioCrawler, RequestHandler, Configuration } from 'crawlee';

export async function main(options: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  packageJson: any;
  startUrls: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requestHandler: RequestHandler<any>;
}) {
  if (!options.packageJson?.config?.slug) {
    throw new Error('Missing { "config": { "slug": "..." } } in package.json');
  }

  // Set the global configuration
  const config = Configuration.getGlobalConfig();
  if (config.get('defaultDatasetId') === 'default') {
    config.set('defaultDatasetId', options.packageJson.config.slug);
  }
  if (config.get('defaultRequestQueueId') === 'default') {
    config.set('defaultRequestQueueId', options.packageJson.config.slug);
  }

  // Initialize the Apify SDK
  await Actor.init();

  // Do not touch
  const datasetId = Actor.getEnv().defaultDatasetId;
  await Actor.setValue('DATASET_ID', datasetId);
  await Actor.setValue('SLUG', options.packageJson.config.slug);

  const crawler = new CheerioCrawler({
    requestHandler: options.requestHandler,
  });

  await crawler.run(
    options.startUrls.map((url) => ({
      url,
      uniqueKey: `${url}/${new Date().toISOString()}'`,
    })),
  );

  // Exit successfully
  await Actor.exit();
}
