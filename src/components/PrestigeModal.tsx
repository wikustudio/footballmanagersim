import React from 'react';
import { motion } from 'motion/react';
import { GameState } from '../types';
import { formatMoney, getLeagueScaledFans } from '../data/gameConstants';

interface PrestigeModalProps {
  state: GameState;
  onClose: () => void;
  onPrestigePurchase: (type: 'statue' | 'stadium' | 'feeder' | 'immortality') => void;
}

export const PrestigeModal: React.FC<PrestigeModalProps> = ({ state, onClose, onPrestigePurchase }) => {
  const isTier1 = state.club.tier === 1;
  const hasWealth = state.budget >= 250000;
  const country = state.club.country || 'GER';
  const stadiumFanGain = Math.max(5000, getLeagueScaledFans(state.club.tier, 5000, country, state.club.originalStartLeague || state.club.tier));
  const immortalityFanGain = Math.max(15000, getLeagueScaledFans(state.club.tier, 15000, country, state.club.originalStartLeague || state.club.tier));
  
  if (!isTier1 || !hasWealth) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#18191F]/45 backdrop-blur-sm overflow-y-auto overscroll-contain" onClick={onClose}>
        <div className="relative bg-white text-[#18191F] border border-[#E6E3DC] rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 w-full max-w-sm text-center shadow-[0_24px_64px_rgba(24,25,31,0.18)] max-h-[92dvh] overflow-y-auto my-auto" onClick={e => e.stopPropagation()}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FAF9F6] hover:bg-[#EFECE4] border border-[#E6E3DC] flex items-center justify-center text-[#6B7280] hover:text-[#18191F] transition cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-xs"></i>
          </button>
          <div className="w-12 h-12 rounded-2xl bg-[#FAF9F6] border border-[#E6E3DC] flex items-center justify-center mx-auto mb-4 text-[#6B7280]">
            <i className="fa-solid fa-lock text-xl"></i>
          </div>
          <h2 className="text-lg font-bold text-[#18191F] mb-2">VIP Access Denied</h2>
          <p className="text-xs text-[#6B7280] leading-relaxed">Reach Tier 1 and accumulate {formatMoney(250000, country)} to unlock Billionaire Prestige Investments.</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full py-2.5 px-4 rounded-xl bg-[#18191F] hover:bg-[#2A2C35] text-white text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const upgrades = state.prestigeUpgrades || {};

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#18191F]/45 backdrop-blur-sm overflow-y-auto overscroll-contain"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }} 
        animate={{ scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl bg-white text-[#18191F] border border-[#E6E3DC] rounded-[24px] sm:rounded-[32px] shadow-[0_24px_64px_rgba(24,25,31,0.18)] overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[88vh] min-h-0 my-auto shrink-0"
      >
        <div className="p-4 sm:p-6 border-b border-[#E6E3DC] flex justify-between items-center bg-[#FAF9F6] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 text-lg shrink-0">
              <i className="fa-solid fa-crown"></i>
            </div>
            <div>
              <div className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Billionaire Sinks</div>
              <h2 className="text-lg sm:text-xl font-bold text-[#18191F]">Legacy & Prestige</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-white hover:bg-[#EFECE4] border border-[#E6E3DC] flex items-center justify-center text-[#6B7280] hover:text-[#18191F] transition cursor-pointer shrink-0"
          >
            <i className="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 bg-white flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar">
          <p className="text-xs text-[#4B5563] mb-4">Cement your legacy with permanent vanity projects. These investments carry over across seasons.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Bronze Statue */}
            <button 
              onClick={() => onPrestigePurchase('statue')}
              disabled={Boolean(upgrades.statueBuilt) || state.budget < 100000}
              className={`p-5 rounded-2xl border text-left transition-all ${upgrades.statueBuilt ? 'bg-emerald-50 border-emerald-200' : 'bg-[#FAF9F6] border-[#E6E3DC] hover:border-amber-400 hover:bg-amber-50/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <i className="fa-solid fa-monument text-2xl text-amber-600"></i>
                <span className="text-[10px] font-mono tabular-nums font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">{formatMoney(100000, country)}</span>
              </div>
              <h3 className="font-bold text-[#18191F] text-sm">Bronze Statue</h3>
              <p className="text-[11px] text-[#6B7280] mt-1">+1 Permanent Immunity Shield</p>
              {upgrades.statueBuilt && <div className="mt-3 text-[10px] font-bold text-emerald-700"><i className="fa-solid fa-check"></i> Constructed</div>}
            </button>

            {/* Stadium Naming */}
            <button 
              onClick={() => onPrestigePurchase('stadium')}
              disabled={Boolean(upgrades.stadiumRenamed) || state.budget < 250000}
              className={`p-5 rounded-2xl border text-left transition-all ${upgrades.stadiumRenamed ? 'bg-emerald-50 border-emerald-200' : 'bg-[#FAF9F6] border-[#E6E3DC] hover:border-amber-400 hover:bg-amber-50/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <i className="fa-solid fa-signature text-2xl text-amber-600"></i>
                <span className="text-[10px] font-mono tabular-nums font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">{formatMoney(250000, country)}</span>
              </div>
              <h3 className="font-bold text-[#18191F] text-sm">Stadium Naming</h3>
              <p className="text-[11px] text-[#6B7280] mt-1">Rename after Director (+10 Trust, +{stadiumFanGain.toLocaleString('en-US')} Fans)</p>
              {upgrades.stadiumRenamed && <div className="mt-3 text-[10px] font-bold text-emerald-700"><i className="fa-solid fa-check"></i> Renamed</div>}
            </button>

            {/* Feeder Club */}
            <button 
              onClick={() => onPrestigePurchase('feeder')}
              disabled={Boolean(upgrades.feederClubPurchased) || state.budget < 500000 || (state.skillPoints || 0) < 20}
              className={`p-5 rounded-2xl border text-left transition-all ${upgrades.feederClubPurchased ? 'bg-emerald-50 border-emerald-200' : 'bg-[#FAF9F6] border-[#E6E3DC] hover:border-amber-400 hover:bg-amber-50/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <i className="fa-solid fa-sitemap text-2xl text-amber-600"></i>
                <span className="text-[10px] font-mono tabular-nums font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">{formatMoney(500000, country)} & 20 DP</span>
              </div>
              <h3 className="font-bold text-[#18191F] text-sm">Tier 5 Feeder Club</h3>
              <p className="text-[11px] text-[#6B7280] mt-1">+1 OVR to all future Youth Graduates</p>
              {upgrades.feederClubPurchased && <div className="mt-3 text-[10px] font-bold text-emerald-700"><i className="fa-solid fa-check"></i> Acquired</div>}
            </button>

            {/* Sovereign Immortality */}
            <button 
              onClick={() => onPrestigePurchase('immortality')}
              disabled={Boolean(upgrades.managerialImmortality) || state.budget < 500000 || (state.skillPoints || 0) < 100}
              className={`p-5 rounded-2xl border text-left transition-all ${upgrades.managerialImmortality ? 'bg-emerald-50 border-emerald-200' : 'bg-[#FAF9F6] border-[#E6E3DC] hover:border-amber-400 hover:bg-amber-50/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <i className="fa-solid fa-gem text-2xl text-amber-600 animate-pulse"></i>
                <span className="text-[10px] font-mono tabular-nums font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">{formatMoney(500000, country)} & 100 DP</span>
              </div>
              <h3 className="font-bold text-[#18191F] text-sm">Sovereign Immortality</h3>
              <p className="text-[11px] text-[#6B7280] mt-1">+3 Shields, +25 Trust & +{immortalityFanGain.toLocaleString('en-US')} Fans</p>
              {upgrades.managerialImmortality && <div className="mt-3 text-[10px] font-bold text-emerald-700"><i className="fa-solid fa-check"></i> Legend</div>}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
