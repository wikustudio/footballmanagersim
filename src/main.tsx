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

createRoot(rootElem).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
