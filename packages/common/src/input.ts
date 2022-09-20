import { Actor } from 'apify';

let input: Record<string, unknown> | null | undefined = undefined;
export async function getInput<T extends Record<string, unknown> = Record<string, unknown>>() {
  if (input === undefined) {
    input = await Actor.getInput<T>();
  }
  return input as T;
}
