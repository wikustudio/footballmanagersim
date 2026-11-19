import React, { useMemo } from 'react';
import { Club, SeasonHistory, StadiumPolicy } from '../types';
import { formatMoney, formatNum } from '../data/gameConstants';
import { getEffectiveStadiumName } from '../engine/liveSimVisualEngine';
import { ClubLogo } from './ClubLogo';

interface AttendanceAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  club: Club;
  history: SeasonHistory[];
  currentAvgAtt: number;
  annualMatchdayIncomeK: number;
  policy: StadiumPolicy;
  stadiumNamingDisplay?: string;
  isModActive?: boolean;
}

export const AttendanceAnalyticsModal: React.FC<AttendanceAnalyticsModalProps> = ({
  isOpen,
  onClose,
  club,
  history,
  currentAvgAtt,
  annualMatchdayIncomeK,
  policy,
  stadiumNamingDisplay,
  isModActive = false,
}) => {
  const venueName = stadiumNamingDisplay || getEffectiveStadiumName(club);
  const capacity = Math.max(1000, club.stadium || 10000);

  const trendRows = useMemo(() => {
    const past5 = (history || [])
      .filter((h) => (h.clubId && h.clubId === club.id) || h.clubName === club.name)
      .slice(-4)
      .map((h) => ({
        label: `${h.year}`,
        att: h.att && h.att > 0 ? h.att : currentAvgAtt,
        cap: Math.max(capacity, h.att || capacity),
      }));

    return [
      ...past5,
      {
        label: 'Current',
        att: currentAvgAtt,
        cap: capacity,
      },
    ];
  }, [history, club.id, club.name, capacity, currentAvgAtt]);

  if (!isOpen) return null;

  const utilPct = Math.min(100, Math.round((currentAvgAtt / capacity) * 100));
  const yieldPerFan = currentAvgAtt > 0 ? Math.round((annualMatchdayIncomeK * 1000) / (currentAvgAtt * 17)) : 28;
  const totalSupporters = club.fanBase || currentAvgAtt;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#18191F]/45 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label="5-Year Attendance Analytics"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-[28px] border border-[#E6E3DC] shadow-[0_24px_60px_rgba(24,25,31,0.18)] overflow-hidden flex flex-col max-h-[92dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-[#E6E3DC] bg-[#F6F5F1] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <ClubLogo club={club} size={36} isModActive={isModActive} className="w-9 h-9 rounded-xl shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                {venueName} · Supporter Demand
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#18191F] truncate">
                5-Year Attendance Analytics
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close analytics"
            className="w-8 h-8 rounded-full bg-white border border-[#E6E3DC] text-[#4B5563] hover:text-[#18191F] flex items-center justify-center cursor-pointer transition"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto overscroll-contain space-y-4">
          {/* 4 KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[#F6F5F1] border border-[#E6E3DC] rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-[#6B7280]">Avg Matchday Crowd</div>
              <div className="text-base font-black text-[#18191F] tabular-nums mt-0.5">
                {formatNum(currentAvgAtt)}
              </div>
            </div>
            <div className="bg-[#F6F5F1] border border-[#E6E3DC] rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-[#6B7280]">Bowl Utilization</div>
              <div className="text-base font-black text-emerald-700 tabular-nums mt-0.5">
                {utilPct}%
              </div>
            </div>
            <div className="bg-[#F6F5F1] border border-[#E6E3DC] rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-[#6B7280]">Est. Matchday Gate</div>
              <div className="text-base font-black text-[#18191F] tabular-nums mt-0.5">
                {formatMoney(annualMatchdayIncomeK)}
              </div>
            </div>
            <div className="bg-[#F6F5F1] border border-[#E6E3DC] rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-[#6B7280]">Avg Ticket Yield</div>
              <div className="text-base font-black text-[#18191F] tabular-nums mt-0.5">
                €{yieldPerFan} / seat
              </div>
            </div>
          </div>

          {/* 5-Season Bar Chart */}
          <div className="bg-[#F6F5F1] border border-[#E6E3DC] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-extrabold text-[#18191F]">
                Attendance Trajectory ({trendRows.length} Snapshots)
              </div>
              <span className="text-[11px] font-semibold text-[#6B7280] tabular-nums">
                Capacity Ceiling: {formatNum(capacity)} seats
              </span>
            </div>

            <div className="space-y-2.5">
              {trendRows.map((row) => {
                const pct = Math.min(100, Math.max(4, Math.round((row.att / row.cap) * 100)));
                return (
                  <div key={row.label} className="flex items-center gap-3 text-xs">
                    <div className="w-14 font-bold text-[#4B5563] tabular-nums shrink-0">
                      {row.label}
                    </div>
                    <div className="flex-1 h-6 bg-white border border-[#E6E3DC] rounded-xl overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-lg bg-[#18191F] transition-all duration-500 flex items-center justify-end pr-2"
                        style={{ width: `${pct}%` }}
                      >
                        <span className="text-[10px] font-bold text-white tabular-nums">
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div className="w-20 text-right font-extrabold text-[#18191F] tabular-nums shrink-0">
                      {formatNum(row.att)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Policy & Capacity Recommendation */}
          <div className="bg-white border border-[#E6E3DC] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-extrabold text-[#18191F]">
                Active Fan Strategy: <span className="uppercase text-sky-700">{policy.replace('_', ' ')}</span>
              </div>
              <p className="text-xs text-[#6B7280] mt-1">
                Regional &amp; Global Supporter Pool: {formatNum(totalSupporters)} ({utilPct}% matchday bowl utilization).{' '}
                {utilPct >= 92
                  ? 'Near-capacity sellouts every home match — expanding seating tiers will convert pent-up demand directly into gate revenue.'
                  : 'Plenty of stadium headroom — promotions, winning streaks, and Grassroots ticketing will steadily pack outer wings and upper decks.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#18191F] text-white text-xs font-bold hover:bg-[#2A2C35] transition cursor-pointer shrink-0"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
