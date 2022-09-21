import { parse } from 'fecha';

export function parseDate(format: string, date: string | null | undefined): number {
  if (typeof date !== 'string') return Date.now();
  return parse(date, format)?.getTime() ?? Date.now();
}
