import React, { useMemo, useState } from 'react';
import { Club, StadiumNamingRightsDeal } from '../types';
import { formatMoney, isReserveClub } from '../data/gameConstants';
import {
  getEffectiveStadiumName,
  getNamingRightsOffers,
  NamingRightsOffer,
} from '../engine/liveSimVisualEngine';
import { evaluateNamingRightsSignGuard } from '../engine/actionGuards';
import { ClubLogo } from './ClubLogo';

interface StadiumNamingModalProps {
  isOpen: boolean;
  onClose: () => void;
  club: Club;
  reputation: number;
  currentYear: number;
  namingRightsSignedYear?: number;
  currentDeal?: StadiumNamingRightsDeal | null;
  onSignDeal: (offer: NamingRightsOffer) => void;
  onTerminateDeal?: () => void;
  isModActive?: boolean;
}

type NamingTierFilter = 'all' | 'regional' | 'national' | 'global';

export const StadiumNamingModal: React.FC<StadiumNamingModalProps> = ({
  isOpen,
  onClose,
  club,
  reputation,
  currentYear,
  namingRightsSignedYear,
  currentDeal,
  onSignDeal,
  onTerminateDeal,
  isModActive = false,
}) => {
  const [tierFilter, setTierFilter] = useState<NamingTierFilter>('all');
  const [confirmEndDeal, setConfirmEndDeal] = useState(false);

  const offers = useMemo(
    () => getNamingRightsOffers(club, reputation, club.stadium || 15000),
    [club, reputation]
  );

  const filteredOffers = useMemo(
    () => (tierFilter === 'all' ? offers : offers.filter((o) => o.tier === tierFilter)),
    [offers, tierFilter]
  );

  if (!isOpen) return null;

  const isRes = Boolean(club.isReserve) || isReserveClub(club.name);
  const hasActiveDeal = Boolean(currentDeal && (currentDeal.yearsLeft ?? 0) > 0);
  const signedThisSeason = namingRightsSignedYear === currentYear;
  const effectiveName = getEffectiveStadiumName(club, currentDeal);
  const unlockedCount = offers.filter((o) => reputation >= o.repRequired).length;
  const tierCounts: Record<NamingTierFilter, number> = {
    all: offers.length,
    regional: offers.filter((o) => o.tier === 'regional').length,
    national: offers.filter((o) => o.tier === 'national').length,
    global: offers.filter((o) => o.tier === 'global').length,
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#18191F]/45 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label="Stadium Naming Rights"
      data-testid="stadium-naming-modal"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-[28px] border border-[#E6E3DC] shadow-[0_24px_60px_rgba(24,25,31,0.18)] overflow-hidden flex flex-col max-h-[92dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E6E3DC] bg-[#F6F5F1] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <ClubLogo club={club} size={36} isModActive={isModActive} className="w-9 h-9 rounded-xl shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                Commercial Infrastructure
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#18191F] truncate">
                Stadium Naming Rights
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-white border border-[#E6E3DC] text-[#4B5563] hover:text-[#18191F] flex items-center justify-center cursor-pointer transition"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto overscroll-contain space-y-4">
          {/* Active Venue Summary */}
          <div className="bg-[#F6F5F1] border border-[#E6E3DC] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold text-[#6B7280]">Current Official Venue Name</div>
              <div className="text-lg font-black text-[#18191F] mt-0.5">{effectiveName}</div>
              {hasActiveDeal && currentDeal ? (
                <div className="text-xs font-semibold text-emerald-700 mt-1 tabular-nums">
                  Partner: {currentDeal.partnerName} · +{formatMoney(currentDeal.annualPayoutK)}/yr ·{' '}
                  {currentDeal.yearsLeft} yr{currentDeal.yearsLeft === 1 ? '' : 's'} remaining
                </div>
              ) : (
                <div className="text-xs text-[#6B7280] mt-1">
                  Historic traditional venue name active. Commercialize naming rights to boost annual matchday revenue & update the 3D touchline stencil.
                </div>
              )}
            </div>
            {hasActiveDeal && onTerminateDeal && !isRes && (
              <div className="flex items-center gap-2 shrink-0">
                {confirmEndDeal ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmEndDeal(false);
                        onTerminateDeal();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer"
                    >
                      Confirm End
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmEndDeal(false)}
                      className="px-2.5 py-1.5 rounded-xl bg-white border border-[#E6E3DC] text-[#4B5563] hover:text-[#18191F] text-xs font-semibold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmEndDeal(true)}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100 transition cursor-pointer"
                  >
                    End Contract
                  </button>
                )}
              </div>
            )}
          </div>

          {!isRes && hasActiveDeal && currentDeal && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
              <i className="fa-solid fa-file-contract text-amber-700 mt-0.5 shrink-0" />
              <div>
                <strong className="font-bold text-amber-950">Active Naming Rights Contract:</strong>{' '}
                Your stadium is currently partnered with <strong>{currentDeal.partnerName}</strong>. End the existing contract before negotiating with another partner.
              </div>
            </div>
          )}

          {!isRes && !hasActiveDeal && signedThisSeason && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
              <i className="fa-solid fa-clock text-amber-700 mt-0.5 shrink-0" />
              <div>
                <strong className="font-bold text-amber-950">Seasonal Naming Rights Limit Reached:</strong>{' '}
                A naming rights deal was already executed this season. New commercial naming offers open next season.
              </div>
            </div>
          )}

          {isRes ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 font-medium">
              Reserve and Academy sides play at parent-club training grounds ({effectiveName}) and cannot sign independent corporate stadium naming rights.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280] whitespace-nowrap">
                    Corporate Partners
                  </span>
                  <span className="text-[11px] font-semibold text-[#6B7280] tabular-nums whitespace-nowrap">
                    {unlockedCount} of {offers.length} unlocked · Rep {reputation}
                  </span>
                </div>
                <div className="inline-flex items-center gap-1 bg-[#F6F5F1] border border-[#E6E3DC] rounded-xl p-1 self-start flex-wrap">
                  {(['all', 'regional', 'national', 'global'] as NamingTierFilter[]).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      data-testid={`naming-tier-${tier}`}
                      onClick={() => setTierFilter(tier)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold capitalize whitespace-nowrap transition cursor-pointer ${
                        tierFilter === tier
                          ? 'bg-[#18191F] text-white shadow-xs'
                          : 'text-[#6B7280] hover:text-[#18191F]'
                      }`}
                    >
                      {tier} ({tierCounts[tier]})
                    </button>
                  ))}
                </div>
              </div>

              {filteredOffers.map((offer) => {
                const locked = reputation < offer.repRequired;
                const isCurrent = hasActiveDeal && currentDeal?.partnerName === offer.partnerName;
                const guard = evaluateNamingRightsSignGuard(
                  {
                    club,
                    reputation,
                    stadiumNamingRights: currentDeal,
                    year: currentYear,
                    namingRightsSignedYear,
                  },
                  offer
                );
                const totalValue = offer.signingBonusK + offer.annualPayoutK * offer.totalYears;

                return (
                  <div
                    key={offer.id}
                    data-testid={`naming-offer-${offer.id}`}
                    className={`rounded-2xl border p-4 transition ${
                      isCurrent
                        ? 'bg-emerald-50/70 border-emerald-300'
                        : locked || !guard.allowed
                        ? 'bg-[#F6F5F1] border-[#E6E3DC] opacity-80'
                        : 'bg-white border-[#E6E3DC] hover:border-[#18191F]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider text-white"
                            style={{ backgroundColor: offer.accentColor }}
                          >
                            {offer.tier}
                          </span>
                          <span className="text-sm font-extrabold text-[#18191F]">
                            {offer.partnerName}
                          </span>
                          <span className="text-[11px] font-semibold text-[#6B7280]">
                            → “{offer.stadiumDisplayName}”
                          </span>
                        </div>
                        <p className="text-xs text-[#6B7280] mt-1">{offer.tagline}</p>

                        <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs tabular-nums">
                          <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                            +{formatMoney(offer.signingBonusK)} upfront
                          </span>
                          <span className="font-bold text-[#18191F] bg-[#F6F5F1] border border-[#E6E3DC] px-2 py-0.5 rounded-lg">
                            +{formatMoney(offer.annualPayoutK)}/yr × {offer.totalYears} yrs
                          </span>
                          <span className="text-[11px] font-semibold text-[#6B7280]">
                            Total value {formatMoney(totalValue)}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">
                            <i className="fa-solid fa-check" /> Active Deal
                          </span>
                        ) : locked ? (
                          <div className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl text-center">
                            Requires {offer.repRequired} Rep
                          </div>
                        ) : !guard.allowed ? (
                          <button
                            type="button"
                            disabled
                            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#EFECE4] text-[#9A9890] border border-[#E6E3DC] text-xs font-bold cursor-not-allowed"
                          >
                            {hasActiveDeal ? 'End Current Deal First' : 'Next Season'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onSignDeal(offer)}
                            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#18191F] hover:bg-[#2A2C35] text-white text-xs font-bold transition cursor-pointer"
                          >
                            Sign Naming Deal
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

