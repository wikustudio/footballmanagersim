import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    pool: 'forks',
    include: ['src/utils/**/*.test.ts', 'src/engine/pressureEngine.test.ts'],
    exclude: [
      'src/utils/attendanceScalingAudit.test.ts',
      'src/utils/launchAuditAndStadiumFill.test.ts',
      'src/utils/safeStoragePolyfill.test.ts',
      'src/utils/seasonSnapshotHelper.test.ts',
      'node_modules/**',
      'dist/**',
    ],
  },
});
