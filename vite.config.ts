import { defineConfig } from 'vitest/config';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Builds one self-contained dist/index.html, so the page can be published as a single file.
export default defineConfig({
  plugins: [viteSingleFile()],
  build: {
    target: 'es2020',
    // The planner is one large script on purpose; don't warn about its size.
    chunkSizeWarningLimit: 4000,
  },
  test: {
    include: ['test/**/*.test.ts'],
  },
});
