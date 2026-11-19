import test from 'node:test';
import assert from 'node:assert/strict';
import { createMemoryStorage, ensureSafeBrowserStorage, isStorageAccessible } from './safeStoragePolyfill';

test('createMemoryStorage implements full Web Storage interface', () => {
  const mem = createMemoryStorage();
  assert.equal(mem.length, 0);
  assert.equal(mem.getItem('missing'), null);

  mem.setItem('club', 'Magdeburg');
  mem.setItem('year', '2026');
  assert.equal(mem.length, 2);
  assert.equal(mem.getItem('club'), 'Magdeburg');
  assert.equal(mem.key(0), 'club');
  assert.equal(mem.key(1), 'year');
  assert.equal(mem.key(2), null);

  mem.removeItem('club');
  assert.equal(mem.getItem('club'), null);
  assert.equal(mem.length, 1);

  mem.clear();
  assert.equal(mem.length, 0);
});

test('ensureSafeBrowserStorage replaces SecurityError-throwing storage getters without touching healthy storage', () => {
  const healthyLocal = createMemoryStorage();
  healthyLocal.setItem('existing_save', '{"year":2028}');

  const fakeWindow: any = {
    localStorage: healthyLocal,
  };
  Object.defineProperty(fakeWindow, 'sessionStorage', {
    configurable: true,
    get() {
      throw new Error('SecurityError: Failed to read the sessionStorage property from Window');
    },
  });

  assert.equal(isStorageAccessible(fakeWindow, 'localStorage'), true);
  assert.equal(isStorageAccessible(fakeWindow, 'sessionStorage'), false);

  ensureSafeBrowserStorage(fakeWindow);

  // Healthy localStorage is preserved untouched
  assert.equal(fakeWindow.localStorage.getItem('existing_save'), '{"year":2028}');
  // Blocked sessionStorage is replaced with working in-memory Storage
  assert.equal(isStorageAccessible(fakeWindow, 'sessionStorage'), true);
  fakeWindow.sessionStorage.setItem('fms_dismissed_boardroom_1', 'true');
  assert.equal(fakeWindow.sessionStorage.getItem('fms_dismissed_boardroom_1'), 'true');
});
