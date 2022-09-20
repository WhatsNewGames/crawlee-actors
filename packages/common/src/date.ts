import { parse } from 'fecha';

export function parseDate(format: string, date: string): number {
  return parse(date, format)?.getTime() ?? Date.now();
}
