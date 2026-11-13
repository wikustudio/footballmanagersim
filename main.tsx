import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

if ('serviceWorker' in navigator) {
  // If an older service worker is installed in the user's browser that intercepts /api/,
  // ensure any navigation or fetch to /api/ bypasses it cleanly
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (const registration of registrations) {
      registration.update();
    }
  });
  // Apply a new version only if it is detected right at launch; otherwise it waits for the next visit,
  // so a deploy can never reload the page in the middle of a season.
  const bootedAt = Date.now();
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      if (Date.now() - bootedAt < 4000) updateSW(true);
    },
  });
}



const rootElem = document.getElementById('root')!;
const preboot = document.getElementById('fms-preboot-shell');
if (preboot) preboot.remove();

// Guard against browser extensions and auto-translate (e.g. Chrome/Safari Translate)
// wrapping text nodes in <font> tags, which causes React reconciler to throw
// "NotFoundError: Failed to execute 'removeChild' on 'Node'" during modal transitions.
if (typeof Node === 'function' && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      return child;
    }
    return originalRemoveChild.apply(this, arguments as any) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      return newNode;
    }
    return originalInsertBefore.apply(this, arguments as any) as T;
  };
}

createRoot(rootElem).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
