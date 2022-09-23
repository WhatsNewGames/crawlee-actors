import { Data, pushData } from '@wng/common';
import { Log } from 'crawlee';

type TmpData = Partial<Pick<Data, 'url' | 'date' | 'content'>> & Pick<Data, 'title'>;

function extractVersion(title: string) {
  const match = title.match(/(\d+)$/);

  if (match) {
    return match[1];
  }

  return null;
}

const ctx = new Map<string, TmpData>();
export async function pushDataWhenFull(data: TmpData, log: Log) {
  const version = extractVersion(data.title);
  if (!version) {
    log.warning('Cannot extract version from title', { title: data.title });
    return;
  }

  if (ctx.has(version)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const obj = ctx.get(version)!;
    Object.assign(obj, data);
    ctx.delete(version);

    log.info('Page scraped', { date: obj.date, url: obj.url, title: obj.title });

    await pushData(obj as Data);
  } else {
    log.info('partially scraped', { date: data.date, url: data.url, title: data.title });

    ctx.set(version, data);
  }
}
