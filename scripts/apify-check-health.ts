import { ActorCollectionListItem, ApifyClient, ScheduleActionRunActor, ScheduleActions, Webhook } from 'apify-client';
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
const scheduleName = 'daily-scans';
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

const schedules = await client.schedules().list();
const schedule = schedules.items.find((s) => s.name === scheduleName);

if (!schedule) {
  throw new Error(`Missing schedule ${scheduleName}`);
}

const actorsWithSchedule = new Set(
  schedule.actions.filter((a): a is ScheduleActionRunActor => 'actorId' in a).map((a) => a.actorId),
);
const actors = await client.actors().list();
const actorsWithMissingWebhook: ActorCollectionListItem[] = [];
const actorsWithMissingSchedule: ActorCollectionListItem[] = [];

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
  if (!actorsWithSchedule.has(actor.id)) {
    actorsWithMissingSchedule.push(actor);
  }
}

if (actorsWithMissingWebhook.length || actorsWithMissingSchedule.length) {
  console.log('Webhook/Schedules missing for the following actors:');
  actorsWithMissingWebhook.map((s) => '\twebhook: ' + s.name).forEach((s) => console.log(s));
  actorsWithMissingSchedule.map((s) => '\tschedule: ' + s.name).forEach((s) => console.log(s));

  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'next',
      message: 'Create the missing webhooks and schedules?',
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
  if (actorsWithMissingSchedule.length) {
    await client.schedule(schedule.id).update({
      actions: schedule.actions.concat(
        actorsWithMissingSchedule.map(
          (a) =>
            ({
              type: ScheduleActions.RunActor,
              actorId: a.id,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any),
        ),
      ),
    });
  }
} else {
  console.log('All actors have an active webhook and schedule in production');
}
