import React, { ErrorInfo, ReactNode } from 'react';
import { recordCrashReport, formatDiagnosticSummary, submitFeedbackReport } from '../utils/crashReporter';
import { removeFromIndexedDB } from '../utils/storageManager';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  isAutoRecovering: boolean;
}

const STALE_CHUNK_RELOAD_KEY = 'fms_stale_chunk_reload_at';
const STALE_CHUNK_COOLDOWN_MS = 15000;

const isStaleBundleOrReactMismatch = (error: Error): boolean => {
  const msg = `${error?.message || ''} ${error?.stack || ''}`;
  return (
    /reading ['"]use(Context|State|Ref|Effect|Memo|Callback)['"]/i.test(msg) ||
    /Invalid hook call/i.test(msg) ||
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg) ||
    /ChunkLoadError/i.test(msg) ||
    /Loading chunk \d+ failed/i.test(msg)
  );
};

export class ErrorBoundary extends React.Component<Props, State> {
  props: Props;
  state: State = {
    hasError: false,
    isAutoRecovering: false,
  };

  constructor(props: Props) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: Error): State {
    if (isStaleBundleOrReactMismatch(error)) {
      try {
        const lastReload = Number(sessionStorage.getItem(STALE_CHUNK_RELOAD_KEY) || '0');
        if (!Number.isFinite(lastReload) || Date.now() - lastReload > STALE_CHUNK_COOLDOWN_MS) {
          return { hasError: true, isAutoRecovering: true };
        }
      } catch {
        // Ignore sessionStorage restrictions
      }
    }
    return { hasError: true, isAutoRecovering: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in UI:', error, errorInfo);
    (window as any).RENDER_ERROR_DUMP = error.message + ' ' + error.stack;

    if (isStaleBundleOrReactMismatch(error)) {
      try {
        const lastReload = Number(sessionStorage.getItem(STALE_CHUNK_RELOAD_KEY) || '0');
        if (!Number.isFinite(lastReload) || Date.now() - lastReload > STALE_CHUNK_COOLDOWN_MS) {
          sessionStorage.setItem(STALE_CHUNK_RELOAD_KEY, String(Date.now()));
          window.location.reload();
          return;
        }
      } catch {
        // Fall through to recovery screen
      }
    }

    try {
      let savedGameState: any = null;
      try {
        const rawSave =
          localStorage.getItem('footy_manager_sim_state_v3') ||
          localStorage.getItem('footy_manager_sim_state_v2');
        if (rawSave) {
          savedGameState = JSON.parse(rawSave);
        }
      } catch {
        // Ignore parse error
      }
      const entry = recordCrashReport(error, savedGameState, 'React Render Crash');
      const diagnostics = formatDiagnosticSummary(savedGameState, entry);
      const isAutomatedOrLocal =
        (typeof navigator !== 'undefined' && Boolean(navigator.webdriver)) ||
        (typeof window !== 'undefined' &&
          (window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1'));

      if (!isAutomatedOrLocal) {
        submitFeedbackReport({
          type: 'bug',
          subject: `[FMS v3.0 Auto Crash Report] ${error.message.slice(0, 60)}`,
          title: error.message,
          description: `Automatic crash captured by ErrorBoundary.\nComponent Stack:\n${errorInfo?.componentStack || 'N/A'}`,
          diagnostics,
          crashReport: entry,
          timestamp: new Date().toISOString(),
        }).catch(() => {
          // Silently ignore network errors on crash boundary
        });
      }
    } catch {
      // Ignore secondary crash reporter errors
    }
  }

  handleReloadKeepSave = () => {
    window.location.reload();
  };

  handleReset = async () => {
    try {
      localStorage.removeItem('footy_manager_sim_state_v3');
      localStorage.removeItem('footy_manager_sim_state_v2');
      localStorage.removeItem('fms_dynamic_universe_clubs');
      await Promise.allSettled([
        removeFromIndexedDB('footy_manager_sim_state_v3'),
        removeFromIndexedDB('fms_dynamic_universe_clubs'),
      ]);
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.isAutoRecovering) {
      return (
        <div className="min-h-screen bg-[#F5F4F0] text-[#18191F] flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="bg-white border border-[#E6E3DC] rounded-[28px] p-8 max-w-sm w-full shadow-[0_24px_64px_rgba(24,25,31,0.10)]">
            <div className="w-12 h-12 bg-[#F6F5F1] border border-[#E6E3DC] rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-rotate fa-spin text-[#18191F] text-lg"></i>
            </div>
            <h1 className="text-base font-black mb-1 text-[#18191F]">
              Refreshing Game Session
            </h1>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Syncing the latest app bundle while keeping your saved career intact.
            </p>
          </div>
        </div>
      );
    }

    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F5F4F0] text-[#18191F] flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="bg-white border border-[#E6E3DC] rounded-[28px] p-8 max-w-md w-full shadow-[0_24px_64px_rgba(24,25,31,0.12)]">
            <div className="w-16 h-16 bg-rose-50 border border-rose-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-triangle-exclamation text-rose-700 text-2xl"></i>
            </div>
            <h1 className="text-xl font-black mb-2 text-rose-800">
              Session Recovered
            </h1>
            <p className="text-xs text-[#4B5563] mb-2 leading-relaxed">
              An unexpected error occurred during rendering.
            </p>
            <p className="text-[11px] text-emerald-700 mb-4 font-semibold">
              Crash diagnostics automatically sent to the developer.
            </p>
            <pre className="text-[10px] text-rose-800 text-left overflow-auto max-h-32 mb-4 bg-rose-50/70 p-3 rounded-xl border border-rose-200">
              {(window as any).RENDER_ERROR_DUMP}
            </pre>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={this.handleReloadKeepSave}
                className="w-full bg-[#18191F] hover:bg-[#2A2C35] text-white font-bold py-3 px-6 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <i className="fas fa-rotate"></i>
                Reload & Keep Save
              </button>
              <button
                onClick={this.handleReset}
                className="w-full bg-[#FAF9F6] hover:bg-rose-50 text-rose-700 hover:text-rose-800 font-bold py-2.5 px-6 rounded-xl border border-[#E6E3DC] hover:border-rose-200 transition cursor-pointer flex items-center justify-center gap-2 text-xs"
              >
                <i className="fas fa-trash-can"></i>
                Reset & Start Fresh
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
