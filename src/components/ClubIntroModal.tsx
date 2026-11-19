import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Club, Coach, Language, BoardVision } from '../types';
import { ClubLogo } from './ClubLogo';
import { formatMoney, getLeagueInfo, getClubHistoricContext, TACTICS } from '../data/gameConstants';
import { generateBoardVision } from '../engine/boardVisionEngine';
import { t as tr } from '../data/translations';

interface ClubIntroModalProps {
  club: Club;
  coach?: Coach;
  targetPos: number;
  budget: number;
  rivalName?: string;
  boardVision?: BoardVision;
  lang?: Language;
  isModActive?: boolean;
  onConfirm: () => void;
}

export const ClubIntroModal: React.FC<ClubIntroModalProps> = ({
  club,
  coach,
  targetPos,
  budget,
  rivalName,
  boardVision: boardVisionProp,
  lang = 'en' as Language,
  isModActive: isModActiveProp,
  onConfirm,
}) => {
  const isDe = lang === 'de';
  const t = (en: string, de?: string) => tr((lang || 'en') as Language, en, de);

  const country = club.country || 'GER';
  const leagueInfo = getLeagueInfo(club.tier, country);
  const isModActive = isModActiveProp !== undefined 
    ? isModActiveProp 
    : (typeof window !== 'undefined' && localStorage.getItem('fms_real_mod_active') === 'true');
    
  let narrative = isModActive ? (club.historicContext || club.narrative || getClubHistoricContext(club.name, club.tier, isDe, country)) : undefined;
  if (narrative && !isDe) {
    const hasGermanWords = /\b(ziel|ziele|zielen|saison|vorstand|traditionsverein|bundesligist|zweitligist|drittligist|rekordmeister|fuehrend|oberhaus)\b/i.test(narrative);
    if (hasGermanWords) {
      narrative = getClubHistoricContext(club.name, club.tier, false, country);
    }
  }

  // Resolve Board Vision for the appointed club
  const boardVision: BoardVision = useMemo(() => {
    if (boardVisionProp) return boardVisionProp;
    return generateBoardVision(club, 2026);
  }, [boardVisionProp, club]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1, ease: 'linear' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-2.5 sm:p-5 bg-[#18191F]/45 backdrop-blur-sm text-left overflow-y-auto overscroll-contain"
    >
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl bg-white rounded-[28px] sm:rounded-[32px] border border-[#E6E3DC] shadow-[0_24px_64px_rgba(24,25,31,0.18)] flex flex-col overflow-hidden max-h-[92vh] sm:max-h-[88vh] min-h-0 my-auto shrink-0 relative text-[#18191F]"
      >
        {/* Header Banner */}
        <div className="p-4 sm:p-6 border-b border-[#E6E3DC] bg-[#FAF9F6] flex items-center gap-3.5 sm:gap-4 shrink-0 relative z-10">
          <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-white border border-[#E6E3DC] flex items-center justify-center shrink-0 shadow-xs p-2">
            <ClubLogo
              name={club.name}
              color={club.color}
              logo={club.logo}
              fallbackLogo={club.fallbackLogo}
              isModActive={isModActive}
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              fallbackClassName="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-base"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-200">
                {t('New Appointment', 'Neue Ernennung')}
              </span>
              <span className="text-[#C7C4BC]">·</span>
              <span className="text-[10px] uppercase font-semibold text-[#6B7280] tracking-wider">
                {leagueInfo.name}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#18191F] break-words tracking-tight leading-tight">
              {club.name}
            </h2>
            <div className="text-xs text-[#6B7280] font-medium mt-0.5 flex items-center gap-1.5">
              <i className="fa-solid fa-briefcase text-[11px] text-sky-700"></i>
              <span>{t('Appointed Sporting Director', 'Als Sportdirektor ernannt')}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-4 custom-scrollbar relative z-10 bg-white">
          
          {/* Welcome to the Boardroom · Chairman Directive */}
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-white border border-sky-200 flex items-center justify-center text-sky-700 text-xs shrink-0">
                <i className="fa-solid fa-user-tie"></i>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800">
                {t('Welcome to the Boardroom · Club Chairman', 'Willkommen im Vorstandszimmer · Vereinspräsident')}
              </span>
            </div>
            <p className="text-sm sm:text-base font-medium text-[#18191F] leading-relaxed">
              "{t(
                `Welcome to the club. Here is your ${boardVision.durationYears || 3}-year mandate. We expect a Top ${targetPos} finish, and we've given you ${formatMoney(budget)}. Do not fail us.`,
                `Willkommen im Verein. Hier ist dein ${boardVision.durationYears || 3}-Jahres-Mandat. Wir erwarten eine Platzierung unter den Top ${targetPos}, und wir haben dir ein Budget von ${formatMoney(budget)} bereitgestellt. Enttäusche uns nicht.`
              )}"
            </p>
          </div>

          {/* Club Background & Lore */}
          {narrative && (
            <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4">
              <div className="text-[10px] uppercase font-semibold tracking-wider text-sky-700 mb-1.5 flex items-center gap-1.5">
                <i className="fa-solid fa-bookmark text-[10px]"></i>
                <span>{t('Club Background & Context', 'Vereinshintergrund & Historie')}</span>
              </div>
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed font-normal italic">
                "{narrative}"
              </p>
            </div>
          )}

          {/* BOARD STRATEGIC ROADMAP CARD */}
          <div className="bg-[#FAF9F6] border border-amber-200 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
            <div className="flex items-center justify-between gap-2 mb-3 relative z-10 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center text-xs">
                  <i className="fa-solid fa-compass"></i>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-800">
                    {t('Board Strategic Roadmap', 'Strategische Vorstandsvision')}
                  </div>
                  <h3 className="text-base font-bold text-[#18191F] tracking-tight">
                    {boardVision.title}
                  </h3>
                </div>
              </div>
              <span className="text-[10px] font-semibold uppercase px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 tabular-nums shrink-0">
                {boardVision.durationYears || 3} {t('Yr Vision', 'Jahre Vision')}
              </span>
            </div>

            {/* Strategic Milestones List */}
            <div className="space-y-2 mb-3 relative z-10">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] flex items-center gap-1.5">
                <i className="fa-solid fa-list-check text-amber-700 text-xs"></i>
                <span>{t('Required Milestones', 'Erforderliche Meilensteine')}</span>
              </div>
              <div className="flex flex-col gap-2">
                {boardVision.objectives.map((obj) => (
                  <div
                    key={obj.id}
                    className="p-3 rounded-xl bg-white border border-[#E6E3DC] flex items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-1.5"></span>
                      <span className="text-xs font-medium text-[#18191F] leading-snug">
                        {obj.desc}
                      </span>
                    </div>
                    <span className="text-[10px] tabular-nums font-semibold text-amber-800 shrink-0 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 whitespace-nowrap self-start sm:self-auto">
                      {t('Target:', 'Ziel:')} {obj.targetValue} {obj.unit || ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Success Rewards & Risk Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] relative z-10">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 flex items-start gap-2.5 text-emerald-800">
                <i className="fa-solid fa-gift text-emerald-700 text-xs shrink-0 mt-0.5"></i>
                <div className="leading-snug">
                  <strong className="text-emerald-950 font-semibold">{t('Reward:', 'Belohnung:')} </strong>
                  <span>{boardVision.reward.desc}</span>
                </div>
              </div>
              <div className="bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5 flex items-start gap-2.5 text-rose-800">
                <i className="fa-solid fa-triangle-exclamation text-rose-700 text-xs shrink-0 mt-0.5"></i>
                <div className="leading-snug">
                  <strong className="text-rose-950 font-semibold">{t('Risk:', 'Risiko:')} </strong>
                  <span>{boardVision.penalty.desc}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Incumbent Head Coach */}
          {coach && (
            <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4">
              <div className="text-[10px] uppercase font-semibold tracking-wider text-[#6B7280] mb-2.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <i className="fa-solid fa-clipboard-user text-sky-700"></i>
                  <span>{t('Incumbent Head Coach', 'Aktueller Cheftrainer')}</span>
                </span>
                <span className="text-[10px] font-semibold text-[#6B7280] tabular-nums">
                  {coach.contractYearsLeft} {t('Yr Contract', 'J. Vertrag')}
                </span>
              </div>
              <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-[#E6E3DC]">
                <div>
                  <div className="text-sm font-bold text-[#18191F]">{coach.name}</div>
                  <div className="text-xs text-[#6B7280] mt-0.5 flex items-center gap-2 flex-wrap">
                    <span className="text-[#18191F] font-medium">
                      <i className={`fas ${TACTICS[coach.style]?.icon || 'fa-chess-board'} mr-1 text-sky-700`}></i>
                      {coach.style}
                    </span>
                    {coach.strength && (
                      <span className="text-emerald-700 text-[11px] font-medium">
                        · {coach.strength}
                      </span>
                    )}
                    {coach.weakness && (
                      <span className="text-rose-700 text-[11px] flex items-center gap-0.5 font-medium">
                        · <i className="fa-solid fa-triangle-exclamation text-[9px]"></i> {coach.weakness}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-lg font-bold tabular-nums ${coach.ovrBoost >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {coach.ovrBoost >= 0 ? `+${coach.ovrBoost}` : coach.ovrBoost}
                  </div>
                  <div className="text-[9px] uppercase font-semibold text-[#6B7280]">OVR Boost</div>
                </div>
              </div>
            </div>
          )}

          {/* Club Key Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-xl p-3 text-center">
              <div className="text-[9px] uppercase font-semibold text-[#6B7280] tracking-wider mb-0.5">
                {t('Budget', 'Budget')}
              </div>
              <div className="text-xs sm:text-sm font-bold text-emerald-700 truncate tabular-nums">
                {formatMoney(budget)}
              </div>
            </div>
            <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-xl p-3 text-center">
              <div className="text-[9px] uppercase font-semibold text-[#6B7280] tracking-wider mb-0.5">
                {t('Squad OVR', 'Kader GES')}
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#18191F] tabular-nums">
                {club.baseOvr}
              </div>
            </div>
            <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-xl p-3 text-center">
              <div className="text-[9px] uppercase font-semibold text-[#6B7280] tracking-wider mb-0.5">
                {t('Stadium', 'Stadion')}
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#18191F] truncate tabular-nums">
                {(club.stadium || 15000).toLocaleString()}
              </div>
            </div>
            <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-xl p-3 text-center">
              <div className="text-[9px] uppercase font-semibold text-[#6B7280] tracking-wider mb-0.5">
                {t('Season Target', 'Saisonziel')}
              </div>
              <div className="text-xs sm:text-sm font-bold text-sky-700 truncate tabular-nums">
                Top {targetPos} · <span className="text-emerald-700 font-semibold">{t('1 Yr Immunity', '1 J. Schutz')}</span>
              </div>
            </div>
          </div>

          {/* Arch Rival Notice if any */}
          {rivalName && (
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
              <i className="fa-solid fa-fire text-rose-700 text-sm shrink-0"></i>
              <span>
                {t('Arch Rival:', 'Erzrivale:')} <strong className="text-rose-950 font-semibold">{rivalName}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-4 sm:p-5 border-t border-[#E6E3DC] bg-[#FAF9F6] shrink-0 relative z-10">
          <button
            onClick={onConfirm}
            className="w-full py-3.5 sm:py-4 px-6 rounded-2xl font-bold text-sm text-white bg-[#18191F] hover:bg-[#2A2C35] active:scale-[0.99] transition-all shadow-sm cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white text-xs">
                <i className="fa-solid fa-file-signature"></i>
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[10px] font-semibold text-[#C7C4BC] uppercase tracking-wider">
                  {t('Sign Official Contract', 'Offiziellen Vertrag unterzeichnen')}
                </span>
                <span className="text-sm sm:text-base font-bold text-white">
                  {t('Take Charge & Begin', 'Vereinsführung übernehmen')}
                </span>
              </div>
            </div>

            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white">
              <i className="fa-solid fa-arrow-right text-xs"></i>
            </div>
          </button>
        </div>

      </motion.div>
    </motion.div>
  );
};
