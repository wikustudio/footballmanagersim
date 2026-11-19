import './utils/safeStoragePolyfill';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Recover once automatically if a lazy-loaded chunk fails due to a new deployment invalidating old hashes
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    try {
      const key = 'fms_chunk_reload_at';
      const last = Number(sessionStorage.getItem(key) || '0');
      if (Date.now() - last > 15000) {
        event.preventDefault();
        sessionStorage.setItem(key, String(Date.now()));
        window.location.reload();
      }
    } catch {
      // Ignore storage errors
    }
  });
}

try {
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    const isPreviewHost =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname.includes('ais-dev') ||
        window.location.hostname.includes('ais-pre') ||
        window.location.hostname.endsWith('.run.app') ||
        import.meta.env.DEV);

    if (isPreviewHost) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          for (const registration of registrations) {
            registration.unregister().catch(() => {});
          }
        })
        .catch(() => {});
      if (typeof window !== 'undefined' && 'caches' in window) {
        caches
          .keys()
          .then((keys) => {
            for (const key of keys) {
              caches.delete(key).catch(() => {});
            }
          })
          .catch(() => {});
      }
    } else {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          for (const registration of registrations) {
            registration.update().catch(() => {});
          }
        })
        .catch(() => {});
      const bootedAt = Date.now();
      const updateSW = registerSW({
        immediate: true,
        onNeedRefresh() {
          if (Date.now() - bootedAt < 4000) updateSW(true);
        },
      });
    }
  }
} catch {
  // Ignore sandboxed iframe ServiceWorker SecurityErrors
}

// Guard React DOM reconciliation against browser auto-translate (Safari/Chrome Translate)
// and third-party extensions that wrap or reparent text nodes, preventing
// NotFoundError: "The object can not be found here." / "Failed to execute 'removeChild' on 'Node'"
if (typeof Node === 'function' && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child && child.parentNode !== this) {
      return child;
    }
    return originalRemoveChild.apply(this, arguments as any) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      return this.appendChild(newNode);
    }
    return originalInsertBefore.apply(this, arguments as any) as T;
  };
}

const rootElem = document.getElementById('root')!;
const preboot = document.getElementById('fms-preboot-shell');
if (preboot) preboot.remove();

createRoot(rootElem).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
