import type { AnyNode, Cheerio, CheerioAPI } from 'cheerio';

export function htmlAll<T extends AnyNode>($: CheerioAPI, el: Cheerio<T>) {
  return el
    .map(function () {
      // outerHTML
      return $.html(this);
    })
    .get()
    .join('');
}
