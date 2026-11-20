import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  isStaleBundleOrProxyModuleError,
  resolveSafeNamedModule,
} from '../utils/bundleRecovery';

test('isStaleBundleOrProxyModuleError detects the exact MidSeasonDilemmaModal proxy crash and browser variants', () => {
  // Exact production crashes from CloudFront rewriting proxy (?$module=module&$io=...)
  assert.equal(
    isStaleBundleOrProxyModuleError(
      new TypeError("Cannot read properties of undefined (reading 'MidSeasonDilemmaModal')")
    ),
    true
  );
  assert.equal(
    isStaleBundleOrProxyModuleError(
      new TypeError("Cannot read properties of undefined (reading 'ClubIntroModal')")
    ),
    true
  );

  // Other modal / page variants across Chrome, Safari, and Firefox
  assert.equal(
    isStaleBundleOrProxyModuleError(
      new TypeError("Cannot read properties of undefined (reading 'SeasonFinishModal')")
    ),
    true
  );
  assert.equal(
    isStaleBundleOrProxyModuleError(
      new TypeError("undefined is not an object (evaluating 'm.CareerSummary')")
    ),
    true
  );
  assert.equal(
    isStaleBundleOrProxyModuleError(
      new TypeError('can\'t access property "LeaderboardPage", m is undefined')
    ),
    true
  );
  assert.equal(
    isStaleBundleOrProxyModuleError(
      new Error('Failed to fetch dynamically imported module: https://example.com/assets/foo.js')
    ),
    true
  );
  assert.equal(
    isStaleBundleOrProxyModuleError(
      new Error('Received a promise that resolves to: undefined')
    ),
    true
  );
  assert.equal(
    isStaleBundleOrProxyModuleError(
      new Error('Unable to preload CSS for /assets/index.css')
    ),
    true
  );

  // Must NOT misclassify ordinary runtime errors as chunk/proxy errors
  assert.equal(
    isStaleBundleOrProxyModuleError(
      new TypeError("Cannot read properties of undefined (reading 'length')")
    ),
    false
  );
  assert.equal(
    isStaleBundleOrProxyModuleError(
      new TypeError("Cannot read properties of undefined (reading 'budget')")
    ),
    false
  );
  assert.equal(isStaleBundleOrProxyModuleError(null), false);
});

test('resolveSafeNamedModule handles valid, default-wrapped, and proxy-corrupted undefined modules safely', () => {
  const FakeModal = () => null;

  // Standard named export
  assert.equal(
    resolveSafeNamedModule({ MidSeasonDilemmaModal: FakeModal }, 'MidSeasonDilemmaModal').default,
    FakeModal
  );

  // Default export fallback
  assert.equal(
    resolveSafeNamedModule({ default: FakeModal }, 'MidSeasonDilemmaModal').default,
    FakeModal
  );

  // Nested default export (CommonJS interop wrapper under proxy rewriter)
  assert.equal(
    resolveSafeNamedModule(
      { default: { MidSeasonDilemmaModal: FakeModal } },
      'MidSeasonDilemmaModal'
    ).default,
    FakeModal
  );

  // Corrupted undefined/empty module throws recoverable ChunkLoadError instead of raw TypeError
  for (const badMod of [undefined, null, {}, { other: 123 }]) {
    assert.throws(
      () => resolveSafeNamedModule(badMod, 'MidSeasonDilemmaModal'),
      (err: unknown) => {
        assert.ok(err instanceof Error);
        assert.equal(err.name, 'ChunkLoadError');
        assert.equal(isStaleBundleOrProxyModuleError(err), true);
        return true;
      }
    );
  }
});

test('App.tsx and Header.tsx contain zero fragile React.lazy or dynamic component imports', () => {
  const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');
  const headerSrc = fs.readFileSync('src/components/Header.tsx', 'utf-8');

  assert.ok(!appSrc.includes('React.lazy('), 'App.tsx must not use React.lazy for modals or pages');
  assert.ok(
    !/import\(['"]\.\/components\//.test(appSrc),
    'App.tsx must not dynamically import ./components/* modules'
  );
  assert.ok(
    !/import\(['"]\.\/LeaderboardPage['"]\)/.test(headerSrc),
    'Header.tsx must not dynamically prefetch LeaderboardPage'
  );

  const requiredStaticImports = [
    "import { ClubIntroModal } from './components/ClubIntroModal';",
    "import { MidSeasonDilemmaModal } from './components/MidSeasonDilemmaModal';",
    "import { ModModal } from './components/ModModal';",
    "import { FeedbackModal } from './components/FeedbackModal';",
    "import { CareerSummary } from './components/CareerSummary';",
    "import { AboutPage } from './components/AboutPage';",
    "import { LeaderboardPage } from './components/LeaderboardPage';",
    "import { SeasonFinishModal } from './components/SeasonFinishModal';",
  ];

  for (const stmt of requiredStaticImports) {
    assert.ok(appSrc.includes(stmt), `Expected static import in App.tsx: ${stmt}`);
  }

  // Verify no non-test component file anywhere in src/components introduces React.lazy
  for (const file of fs.readdirSync('src/components')) {
    if (!file.endsWith('.tsx') && !file.endsWith('.ts')) continue;
    if (file.includes('.test.')) continue;
    const content = fs.readFileSync(`src/components/${file}`, 'utf-8');
    assert.ok(
      !content.includes('React.lazy('),
      `src/components/${file} must not use React.lazy`
    );
  }
});

test('MidSeasonDilemmaModal fallback schema and one-shot guard prevent NaN state corruption and double resolution', () => {
  const modalSrc = fs.readFileSync('src/components/MidSeasonDilemmaModal.tsx', 'utf-8');
  const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');

  assert.ok(modalSrc.includes('hasResolvedRef'), 'MidSeasonDilemmaModal must guard against double clicks');
  assert.ok(modalSrc.includes('budgetDeltaK: 0'), 'Fallback dilemma must include numeric budgetDeltaK');
  assert.ok(modalSrc.includes('ovrDelta: 0'), 'Fallback dilemma must include numeric ovrDelta');
  assert.ok(modalSrc.includes('moraleDelta: 0'), 'Fallback dilemma must include numeric moraleDelta');
  assert.ok(!modalSrc.includes('subtext:'), 'Legacy invalid fallback schema must not remain');

  assert.ok(
    appSrc.includes('const safeOvrDelta = Number.isFinite(opt?.ovrDelta) ? opt.ovrDelta : 0;'),
    'handleResolveMidSeasonDilemma must guard ovrDelta with Number.isFinite'
  );
});
