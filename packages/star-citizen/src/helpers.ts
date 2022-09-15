import { parse } from 'fecha';

export function parseStarCitizenDate(date: string) {
  return parse(date, 'MMMM Do YYYY')?.getTime() ?? Date.now();
}
