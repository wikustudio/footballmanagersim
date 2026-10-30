import { GameState } from '../types';

export interface CrashReportEntry {
  id: string;
  timestamp: string;
  context: string;
  message: string;
  stack?: string;
  clubName?: string;
  tier?: number;
  year?: number;
  seasonCount?: number;
  seasonPhase?: string;
  userAgent?: string;
  url?: string;
  read?: boolean;
}

const CRASH_STORAGE_KEY = 'fms_crash_reports_v1';
const MAX_CRASH_REPORTS = 10;

type CrashListener = (reports: CrashReportEntry[]) => void;
const listeners = new Set<CrashListener>();

export function getCrashReports(): CrashReportEntry[] {
  try {
    const raw = localStorage.getItem(CRASH_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCrashReports(reports: CrashReportEntry[]) {
  try {
    localStorage.setItem(CRASH_STORAGE_KEY, JSON.stringify(reports.slice(0, MAX_CRASH_REPORTS)));
  } catch {
    // Ignore storage quota issues
  }
  listeners.forEach((fn) => {
    try {
      fn(reports);
    } catch {
      // Ignore listener errors
    }
  });
}

export function subscribeCrashReports(listener: CrashListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function markAllCrashReportsRead(): void {
  const reports = getCrashReports().map((r) => ({ ...r, read: true }));
  saveCrashReports(reports);
}

export function clearCrashReports(): void {
  saveCrashReports([]);
}

export function recordCrashReport(
  err: unknown,
  gameState?: GameState | null,
  context = 'Runtime Error'
): CrashReportEntry {
  const message =
    err instanceof Error
      ? err.message
      : typeof err === 'string'
      ? err
      : JSON.stringify(err ?? 'Unknown error');
  const stack = err instanceof Error ? err.stack : undefined;

  const entry: CrashReportEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    context,
    message,
    stack: stack ? stack.split('\n').slice(0, 8).join('\n') : undefined,
    clubName: gameState?.club?.name,
    tier: gameState?.club?.tier,
    year: gameState?.year,
    seasonCount: gameState?.seasonCount,
    seasonPhase: gameState?.seasonPhase,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    read: false,
  };

  const existing = getCrashReports();
  // Deduplicate identical consecutive crash messages within 15 seconds
  const latest = existing[0];
  if (
    latest &&
    latest.message === entry.message &&
    latest.context === entry.context &&
    Date.now() - new Date(latest.timestamp).getTime() < 15000
  ) {
    return latest;
  }

  const updated = [entry, ...existing].slice(0, MAX_CRASH_REPORTS);
  saveCrashReports(updated);
  return entry;
}

export function formatDiagnosticSummary(
  gameState?: GameState | null,
  selectedCrash?: CrashReportEntry | null
): string {
  const lines: string[] = [];
  lines.push('=== GAME STATE DIAGNOSTICS ===');
  if (gameState?.club) {
    lines.push(`Club: ${gameState.club.name} (Tier ${gameState.club.tier}, OVR ${gameState.club.baseOvr ?? gameState.club.ovr})`);
    lines.push(`Season: ${gameState.year}/${String((gameState.year + 1) % 100).padStart(2, '0')} (#${gameState.seasonCount || 1})`);
    lines.push(`Phase: ${gameState.seasonPhase || 'start'}`);
    lines.push(`History Entries: ${Array.isArray(gameState.history) ? gameState.history.length : 0}`);
    lines.push(`Career Score: ${gameState.careerScore ?? 0} | Budget: €${((gameState.budget ?? 0) / 1000).toFixed(2)}M`);
    if (gameState.currentRival) {
      lines.push(`Rival: ${gameState.currentRival.name}`);
    }
  } else {
    lines.push('Active Save: None (Menu / Pre-game)');
  }
  lines.push(`Timestamp: ${new Date().toISOString()}`);

  const crashToInclude = selectedCrash || getCrashReports()[0];
  if (crashToInclude) {
    lines.push('');
    lines.push('=== AUTOMATIC CRASH REPORT ===');
    lines.push(`Time: ${crashToInclude.timestamp}`);
    lines.push(`Context: ${crashToInclude.context}`);
    lines.push(`Error: ${crashToInclude.message}`);
    if (crashToInclude.clubName) {
      lines.push(
        `Snapshot at Crash: ${crashToInclude.clubName} | Tier ${crashToInclude.tier} | Year ${crashToInclude.year} | Phase: ${crashToInclude.seasonPhase}`
      );
    }
    if (crashToInclude.stack) {
      lines.push(`Stack:\n${crashToInclude.stack}`);
    }
  }

  return lines.join('\n');
}
