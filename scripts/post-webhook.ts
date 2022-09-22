import { fetch } from 'undici';
import * as dotenv from 'dotenv';
import { dirname, join } from 'path';
import { homedir } from 'os';
import meow from 'meow';
import { fileURLToPath } from 'url';
import { access, readdir, readFile } from 'fs/promises';
import { exit } from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __root = join(__dirname, '..');

async function exists(path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

dotenv.config({
  path: join(homedir(), 'workspace/whatsnew.games/.env'),
});

if (!process.env.API_SECRET_KEY) {
  throw new Error('Cannot read API_SECRET_KEY');
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const cli = meow(
  `
	Usage
	  $ pnpm run post-webhook [slug]
`,
  {
    importMeta: import.meta,
  },
);

const slug = cli.input[0];

if (!slug) {
  cli.showHelp();
  exit(1);
}

const packagePath = join(__root, 'packages', slug);

if (!(await exists(packagePath))) {
  throw new Error(`${packagePath} does not exists`);
}

const defaultStoragePath = join(packagePath, 'storage/datasets/default');

if (!(await exists(defaultStoragePath))) {
  console.error(`Run the following command beforehand: cd ${packagePath} && pnpm run start`);
  exit(2);
}

const filesPath = await readdir(defaultStoragePath);

const files = await Promise.all(filesPath.map((f) => join(defaultStoragePath, f)).map((f) => readFile(f, 'utf-8')));

const result = await fetch('https://localhost:3000/api/apify/webhook', {
  method: 'POST',
  body: JSON.stringify({
    authorization: `Bearer ${process.env.API_SECRET_KEY}`,
    eventType: 'LOCALHOST',
    slug: 'fortnite',
    items: files.map((f) => JSON.parse(f)),
  }),
});

console.log(await result.json());

exit(0);
