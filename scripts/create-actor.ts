import { mkdir, readdir, readFile, writeFile, access } from 'fs/promises';
import inquirer, { type Answers, type DistinctQuestion } from 'inquirer';
import meow from 'meow';
import Mustache from 'mustache';
import { dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';
import { fetch } from 'undici';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __root = join(__dirname, '..');

const mapFlags = {
  slug: 'SLUG',
  game: 'NAME',
  folder: 'FOLDER',
  dataset: 'DATASET_ID',
  requestQueue: 'REQUEST_QUEUE_ID',
};

type Flags = Record<keyof typeof mapFlags, string>;

async function copyReplaceFile(src: string, dest: string, answers: Record<string, string>) {
  const data = await readFile(src, 'utf-8');

  const output = Mustache.render(data, answers);

  await writeFile(dest, output, 'utf-8');
}

async function copyDir(src: string, dest: string, answers: Record<string, string>) {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath, answers);
    } else {
      await copyReplaceFile(srcPath, destPath, answers);
    }
  }
}

const cli = meow(
  `
	Usage
	  $ pnpm run create-actor

	Options
    --slug, -s            Game slug
	  --game, -g            Game name
	  --folder, -d          Package folder
	  --dataset, -d         Dataset ID
	  --request-queue, -r   Request Queue ID
`,
  {
    importMeta: import.meta,
    flags: {
      slug: {
        type: 'string',
        alias: 's',
      },
      game: {
        type: 'string',
        alias: 'g',
      },
      folder: {
        type: 'string',
        alias: 'f',
      },
      dataset: {
        type: 'string',
        alias: 'd',
      },
      requestQueue: {
        type: 'string',
        alias: 'r',
      },
    },
  },
);

function getValue(key: keyof typeof mapFlags) {
  return (answers: Answers): string => {
    return cli.flags[key] || answers[key];
  };
}

function getValues(answers: Answers): Flags {
  return {
    ...cli.flags,
    ...answers,
  } as Flags;
}

function mapKeys(answers: Answers): Record<string, string> {
  return Object.fromEntries(Object.entries(answers).map(([k, v]) => [mapFlags[k as keyof typeof mapFlags], v]));
}

async function checkSlug(slug: string) {
  const res = await fetch(`https://www.igdb.com/games/${slug}`, {
    redirect: 'manual',
  });

  if (res.status >= 300 && res.status < 400) {
    return false;
  }
  return true;
}

async function exists(path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

if (cli.input[0] === 'help') {
  cli.showHelp();
} else {
  const questions: DistinctQuestion[] = [];
  let answers: Flags = cli.flags as Flags;

  if (!cli.flags.slug) {
    questions.push({
      type: 'input',
      name: 'slug',
      message: 'Game slug',
    });
  }

  if (!cli.flags.game) {
    questions.push({
      type: 'input',
      name: 'game',
      message: 'Game name',
    });
  }

  if (!cli.flags.folder) {
    questions.push({
      type: 'input',
      name: 'folder',
      message: 'Package folder (created under ./packages)',
      default: getValue('slug'),
    });
  }

  if (!cli.flags.dataset) {
    questions.push({
      type: 'input',
      name: 'dataset',
      message: 'Dataset ID',
      default: getValue('slug'),
    });
  }

  if (!cli.flags.requestQueue) {
    questions.push({
      type: 'input',
      name: 'requestQueue',
      message: 'Request Queue ID',
      default: getValue('slug'),
    });
  }

  if (questions.length) {
    const r = await inquirer.prompt(questions);
    answers = getValues(r);
  }

  const src = join(__root, 'packages/cheerio-template');
  const dest = join(__root, 'packages', answers.folder);

  if (await exists(dest)) {
    throw new Error(`"${dest}" already exists. Aborting.`);
  }

  if (!(await checkSlug(answers.slug))) {
    throw new Error(
      `"${answers.slug}" does not seem to exist on IGDB (https://www.igdb.com/games/${answers.slug}). Games not on IGDB are not supported. Aborting.`,
    );
  }

  await copyDir(src, dest, mapKeys(answers));

  console.log(`Successfully created "${relative(__root, dest)}"`);
}
