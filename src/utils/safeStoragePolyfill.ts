export function createMemoryStorage(): Storage {
  const store = new Map<string, string>();

  const storage: Storage = {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string): string | null {
      const k = String(key);
      return store.has(k) ? store.get(k)! : null;
    },
    key(index: number): string | null {
      if (index < 0 || index >= store.size) return null;
      let i = 0;
      for (const k of store.keys()) {
        if (i === index) return k;
        i++;
      }
      return null;
    },
    removeItem(key: string): void {
      store.delete(String(key));
    },
    setItem(key: string, value: string): void {
      store.set(String(key), String(value));
    },
  };

  return storage;
}

export function isStorageAccessible(target: any, prop: 'localStorage' | 'sessionStorage'): boolean {
  if (!target) return false;
  try {
    const storage = target[prop] as Storage | undefined;
    if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') {
      return false;
    }
    // Reading must never throw in an accessible Web Storage implementation
    storage.getItem('__fms_storage_probe__');
    return true;
  } catch {
    return false;
  }
}

export function ensureSafeBrowserStorage(target: any = typeof window !== 'undefined' ? window : undefined): void {
  if (!target) return;

  for (const prop of ['localStorage', 'sessionStorage'] as const) {
    if (!isStorageAccessible(target, prop)) {
      const fallback = createMemoryStorage();
      try {
        Object.defineProperty(target, prop, {
          value: fallback,
          configurable: true,
          writable: true,
        });
      } catch {
        try {
          target[prop] = fallback;
        } catch {
          // Ignore immutable host environment property
        }
      }
    }
  }
}

if (typeof window !== 'undefined') {
  ensureSafeBrowserStorage(window);
}
