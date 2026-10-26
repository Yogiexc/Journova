import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: [
      'apps/api/src/storage/**/*.spec.ts',
      'apps/api/src/doi/**/*.spec.ts',
      'apps/api/src/config/**/*.spec.ts',
    ],
  },
});
