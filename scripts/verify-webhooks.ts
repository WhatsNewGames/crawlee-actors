import { ActorCollectionListItem, ApifyClient, Webhook } from 'apify-client';
import { readFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';
import inquirer from 'inquirer';
import { exit } from 'process';
import * as dotenv from 'dotenv';

dotenv.config({
  path: join(homedir(), 'workspace/whatsnew.games/.env'),
});

if (!process.env.API_SECRET_KEY) {
  throw new Error('Cannot read API_SECRET_KEY');
}

const requestUrl = 'https://whatsnew.games/api/apify/webhook';
const payloadTemplate = `{
  "authorization": "Bearer ${process.env.API_SECRET_KEY}",
  "userId": {{userId}},
  "createdAt": {{createdAt}},
  "eventType": {{eventType}},
  "eventData": {{eventData}},
  "resource": {{resource}}
}`;

interface WebhookCustom extends Webhook {
  isEnabled?: boolean;
}

const file = JSON.parse(await readFile(join(homedir(), '.apify/auth.json'), 'utf-8'));

const client = new ApifyClient({
  token: file.token,
});

const actors = await client.actors().list();
const actorsWithMissingWebhook: ActorCollectionListItem[] = [];

const webhooks = await client.webhooks().list();
const webhooksByActors = new Map<string, Omit<WebhookCustom, 'payloadTemplate'>>();

for (const webhook of webhooks.items as WebhookCustom[]) {
  if ('actorId' in webhook.condition && webhook.isEnabled && webhook.requestUrl === requestUrl) {
    webhooksByActors.set(webhook.condition.actorId, webhook);
  }
}

for (const actor of actors.items) {
  if (!webhooksByActors.has(actor.id)) {
    actorsWithMissingWebhook.push(actor);
  }
}

if (actorsWithMissingWebhook.length) {
  console.log('Webhook missing for the following actors:');
  actorsWithMissingWebhook.map((s) => '\t' + s.name).forEach((s) => console.log(s));

  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'next',
      message: 'Create the missing webhooks?',
      default: false,
    },
  ]);

  if (!answers.next) {
    exit(0);
  }

  for (const actor of actorsWithMissingWebhook) {
    await client.webhooks().create({
      requestUrl,
      condition: { actorId: actor.id },
      eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED'],
      payloadTemplate,
    });
  }
} else {
  console.log('All actors have an active webhook in production');
}
