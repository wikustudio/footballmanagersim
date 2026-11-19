import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/utils/**/*.test.ts'],
    exclude: ['src/utils/attendanceScalingAudit.test.ts', 'node_modules/**', 'dist/**'],
  },
});
