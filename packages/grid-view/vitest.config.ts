import { svelte } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST, preprocess: sveltePreprocess() })],
  test: {
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    globals: true,
    environment: 'jsdom',
  },
});
