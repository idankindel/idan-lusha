// eslint-disable-next-line import/no-extraneous-dependencies
import { Options, defineConfig } from 'tsup';

export default defineConfig((options): Options => ({
  splitting: true,
  clean: true,
  sourcemap: true,
  minify: !options.watch,
  format: ['cjs'],
  entryPoints: ['src/server.ts'],
  outDir: 'dist',
}));
