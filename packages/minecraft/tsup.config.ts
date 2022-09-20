import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/main.ts'],
  format: 'esm',
  clean: true,
  treeshake: true,
  target: 'node16',
  noExternal: [/@wng\/.*/],
});
