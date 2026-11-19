import React from 'react';
import { motion } from 'motion/react';
import { Coach } from '../types';
import { formatMoney, TACTICS, isTacticalSynergy } from '../data/gameConstants';
import { 
  getCoachTraitInfo, 
  getCoachWeaknessInfo, 
  ensureCoachHiddenAttributes, 
  getCoachArchetypeConfig 
} from '../engine/coachEngine';

interface CoachDossierModalProps {
  coach: Coach;
  lang: 'en' | 'de';
  clubTactic?: string;
  isCurrentCoach?: boolean;
  coachTenure?: number;
  hasNewManagerBounce?: boolean;
  canHire?: boolean;
  hireDisabledReason?: string;
  onHire?: (coach: Coach) => void;
  onFire?: () => void;
  onRenew?: () => void;
  onSelectInOnboarding?: (coach: Coach) => void;
  onClose: () => void;
}

export const CoachDossierModal: React.FC<CoachDossierModalProps> = ({
  coach,
  lang,
  clubTactic,
  isCurrentCoach = false,
  coachTenure,
  hasNewManagerBounce,
  canHire = true,
  hireDisabledReason,
  onHire,
  onFire,
  onRenew,
  onSelectInOnboarding,
  onClose,
}) => {
  const isDe = lang === 'de';
  const hiddenAttrs = ensureCoachHiddenAttributes(coach);
  const archConfig = getCoachArchetypeConfig(coach.coachArchetype || coach.archetype);
  const traitInfo = getCoachTraitInfo(coach.strength);
  const weakInfo = getCoachWeaknessInfo(coach.weakness);
  const hasSynergy = clubTactic ? isTacticalSynergy(coach.style, clubTactic) : false;

  const getAttrTier = (val: number) => {
    if (val >= 18) return { label: isDe ? 'Weltklasse' : 'World Class', color: 'text-amber-700' };
    if (val >= 15) return { label: isDe ? 'Exzellent' : 'Exceptional', color: 'text-sky-700' };
    if (val >= 11) return { label: isDe ? 'Solide' : 'Proficient', color: 'text-[#4B5563]' };
    return { label: isDe ? 'Verletzlich' : 'Vulnerable', color: 'text-rose-700' };
  };

  const getAttrBarGradient = (val: number) => {
    if (val >= 18) return 'from-amber-500 to-amber-600';
    if (val >= 15) return 'from-sky-500 to-sky-600';
    if (val >= 11) return 'from-stone-500 to-stone-600';
    return 'from-rose-500 to-rose-600';
  };

  const attributesList = [
    {
      key: 'tacticalFlexibility',
      name: isDe ? 'Taktische Flexibilität' : 'Tactical Flexibility',
      val: hiddenAttrs.tacticalFlexibility,
      desc: isDe 
        ? 'In-Game Umstellungen, Anpassung an Systembrüche & Rückstand-Aufholjagden.' 
        : 'In-match adjustments, exploiting opposition traps & deficit comebacks.',
      icon: 'fa-chess-knight'
    },
    {
      key: 'manManagement',
      name: isDe ? 'Menschenführung & Kabine' : 'Man-Management',
      val: hiddenAttrs.manManagement,
      desc: isDe 
        ? 'Ego-Balance bei Stars, Verhinderung von Meutereien & Moralschutz in Krisen.' 
        : 'Ego management, locker room harmony & preventing dressing room mutinies.',
      icon: 'fa-handshake'
    },
    {
      key: 'motivationalDrive',
      name: isDe ? 'Motivationskraft & Mentalität' : 'Motivational Drive',
      val: hiddenAttrs.motivationalDrive,
      desc: isDe 
        ? 'Underdog-Feuer, Siegeswille in Pokalkrimis & Comeback-Dynamik.' 
        : 'Underdog intensity, big-match clutch mentality & late fightbacks.',
      icon: 'fa-fire'
    },
    {
      key: 'youthNurturing',
      name: isDe ? 'Nachwuchsförderung' : 'Youth Nurturing',
      val: hiddenAttrs.youthNurturing,
      desc: isDe 
        ? 'Entwicklung von Akademie-Talenten, Geduld mit Teenagern & Wonderkid-Schub.' 
        : 'Accelerating wonderkid development, academy integration & talent breakthrough.',
      icon: 'fa-seedling'
    },
    {
      key: 'discipline',
      name: isDe ? 'Disziplin & Kompaktheit' : 'Discipline & Structure',
      val: hiddenAttrs.discipline,
      desc: isDe 
        ? 'Defensive Grundordnung, Verhinderung von Konzentrationsfehlern & Zweikampfhärte.' 
        : 'Defensive organization, tactical shape adherence & avoiding card trouble.',
      icon: 'fa-shield-halved'
    },
    {
      key: 'boardAlignment',
      name: isDe ? 'Vorstandsharmonie' : 'Board Alignment',
      val: hiddenAttrs.boardAlignment,
      desc: isDe 
        ? 'Loyalität gegenüber der Sportdirektor-Strategie; keine Medien-Eskalationen.' 
        : 'Harmony with Sporting Director transfer strategy & zero press drama.',
      icon: 'fa-building-columns'
    }
  ];

  // Isolate Escape key so closing coach dossier does not close parent CoachMarketModal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1, ease: 'linear' }}
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center p-2.5 sm:p-5 overflow-y-auto overscroll-contain"
    >
      <div 
        className="fixed inset-0 bg-[#18191F]/50 backdrop-blur-sm" 
        onClick={onClose} 
      />

      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-2xl bg-white text-[#18191F] border border-[#E6E3DC] rounded-[28px] sm:rounded-[32px] shadow-[0_24px_64px_rgba(24,25,31,0.18)] overflow-hidden my-auto max-h-[92vh] sm:max-h-[88vh] flex flex-col min-h-0 shrink-0 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="relative px-6 pt-6 pb-4 border-b border-[#E6E3DC] bg-[#FAF9F6] flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 text-xl shrink-0">
              <i className={`fa-solid ${archConfig.icon}`}></i>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap text-xs text-[#6B7280]">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-sky-700">
                  {isDe ? 'Vertrauliches Trainer-Dossier' : 'Director Scouting Dossier'}
                </span>
                <span className="text-[#C7C4BC]">·</span>
                <span className="text-[#4B5563] font-medium flex items-center gap-1">
                  <i className={`fa-solid ${archConfig.icon} text-[10px] text-sky-600`}></i>
                  <span>{isDe ? archConfig.labelDe : archConfig.labelEn}</span>
                </span>
                {isCurrentCoach && (
                  <>
                    <span className="text-[#C7C4BC]">·</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <i className="fa-solid fa-check text-[10px]"></i>
                      <span>{isDe ? 'Amtsinhaber' : 'Current Coach'}</span>
                    </span>
                    <span className="text-[#C7C4BC]">·</span>
                    <span className="text-[#4B5563] font-medium tabular-nums">
                      {isDe ? `Jahre im Verein: ${coachTenure || 0}` : `Years at Club: ${coachTenure || 0}`}
                    </span>
                  </>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#18191F] tracking-tight flex items-center gap-2">
                {coach.name}
                {coach.nationality && (
                  <span className="text-xs font-normal text-[#6B7280]">
                    ({coach.nationality})
                  </span>
                )}
              </h2>

              {/* Stale Voice / Bounce Badges */}
              {isCurrentCoach && ((coachTenure || 0) >= 3 || hasNewManagerBounce) && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {(coachTenure || 0) >= 3 && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                      <i className="fa-solid fa-triangle-exclamation text-rose-600 text-xs"></i>
                      <span>{isDe ? 'Abnutzungseffekt: Die Mannschaft hört nicht mehr auf den Trainer.' : 'Stale Voice: Squad is tuning out the manager.'}</span>
                      {coach.strength === 'Continental Legend' ? (
                        <span className="ml-1 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                          {isDe ? 'Legende Immun' : 'Legend Immune'}
                        </span>
                      ) : (
                        <span className="ml-1 px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-wider">
                          -1 OVR
                        </span>
                      )}
                    </div>
                  )}

                  {hasNewManagerBounce && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                      <i className="fa-solid fa-sparkles text-emerald-600 text-xs"></i>
                      <span>{isDe ? 'Trainereffekt aktiv (+2 GES Flitterwochen)' : 'New Manager Bounce Active (+2 OVR Honeymoon)'}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-[#EFECE4] border border-[#E6E3DC] flex items-center justify-center text-[#6B7280] hover:text-[#18191F] transition active:scale-95 cursor-pointer shrink-0"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar bg-white">

          {/* Quick Metrics Capsule Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-3">
              <div className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider mb-1">
                {isDe ? 'Taktik-Stil' : 'Tactical Style'}
              </div>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#18191F] truncate">
                <i className={`fas ${TACTICS[coach.style]?.icon || 'fa-chess-board'} text-sky-600`}></i>
                <span className="truncate">{coach.style}</span>
              </div>
              {hasSynergy && (
                <div className="mt-1 text-[9px] text-sky-700 font-semibold flex items-center gap-1">
                  <i className="fa-solid fa-circle-check text-[8px]"></i>
                  {isDe ? 'Perfekte Synergie' : 'System Synergy'}
                </div>
              )}
            </div>

            <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-3">
              <div className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider mb-1">
                {isDe ? 'Taktik-Einfluss' : 'Tactical Impact'}
              </div>
              <div className={`text-sm sm:text-base font-bold tabular-nums ${coach.ovrBoost >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {coach.ovrBoost >= 0 ? `+${coach.ovrBoost}` : coach.ovrBoost} OVR
              </div>
              <div className="text-[9px] text-[#6B7280]">
                {isDe ? 'Direkter Team-Boost' : 'Squad rating modifier'}
              </div>
            </div>

            <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-3">
              <div className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider mb-1">
                {isDe ? 'Erfolgsquote' : 'Career Win Rate'}
              </div>
              <div className="text-sm sm:text-base font-bold text-[#18191F] flex items-center gap-1.5 tabular-nums">
                <i className="fa-solid fa-trophy text-amber-600 text-xs"></i>
                <span>{coach.winRate ?? 45}%</span>
              </div>
              <div className="text-[9px] text-[#6B7280] tabular-nums">
                {coach.trophyPedigree ? `${coach.trophyPedigree} ${isDe ? 'Titel errungen' : 'Honours won'}` : (isDe ? 'Solider Ligarekord' : 'Solid track record')}
              </div>
            </div>

            <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-3">
              <div className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider mb-1">
                {isDe ? 'Gehalt / Vertrag' : 'Annual Salary'}
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#18191F] tabular-nums">
                {formatMoney(coach.cost)} / {isDe ? 'Jahr' : 'yr'}
              </div>
              <div className="text-[9px] text-[#6B7280] tabular-nums">
                {coach.contractYearsLeft ?? coach.contractLength ?? 1} {isDe ? 'Jahre Vertrag' : 'Year Deal'}
              </div>
            </div>
          </div>

          {/* Manager Persona & Biography */}
          <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4">
            <div className="text-xs font-semibold text-[#18191F] uppercase tracking-wider mb-2 flex items-center gap-2">
              <i className="fa-solid fa-feather text-sky-600 text-xs"></i>
              <span>{isDe ? 'Trainer-Philosophie & Profil' : 'Managerial Philosophy & Bio'}</span>
            </div>
            <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed font-normal italic">
              "{coach.bio || archConfig.bioTemplatesEn[0]}"
            </p>
            {coach.preferredFormation && (
              <div className="mt-3 pt-3 border-t border-[#E6E3DC] flex items-center justify-between text-xs">
                <span className="text-[#6B7280]">{isDe ? 'Bevorzugtes System:' : 'Preferred System:'}</span>
                <span className="text-[#18191F] font-semibold bg-white px-2.5 py-0.5 rounded-full border border-[#E6E3DC] tabular-nums">
                  {coach.preferredFormation}
                </span>
              </div>
            )}
          </div>

          {/* Hidden Attributes Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#18191F] flex items-center gap-1.5">
                  <i className="fa-solid fa-fingerprint text-sky-600 text-xs"></i>
                  <span>{isDe ? 'Verborgene Trainer-Attribute (1-20)' : 'Hidden Managerial Attributes (1-20 Scale)'}</span>
                </h3>
                <p className="text-[11px] text-[#6B7280] mt-0.5">
                  {isDe 
                    ? 'Vertrauliche Beobachtungswerte der sportlichen Leitung über Charakter und Match-IQ.'
                    : 'Confidential board assessment measuring in-game composure, tactical IQ, and personality.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {attributesList.map((attr) => {
                const tier = getAttrTier(attr.val);
                const percent = Math.min(100, Math.max(5, (attr.val / 20) * 100));

                return (
                  <div 
                    key={attr.key}
                    className="bg-[#FAF9F6] hover:bg-[#F5F4F0] border border-[#E6E3DC] rounded-2xl p-3.5 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <i className={`fa-solid ${attr.icon} text-[#6B7280] text-xs`}></i>
                        <span className="text-xs font-semibold text-[#18191F]">{attr.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 tabular-nums">
                        <span className={`text-[11px] font-semibold ${tier.color}`}>
                          {tier.label}
                        </span>
                        <span className="text-[#C7C4BC] text-xs">·</span>
                        <span className="text-sm font-bold text-[#18191F] min-w-[20px] text-right">
                          {attr.val}
                        </span>
                        <span className="text-[10px] text-[#6B7280] font-normal">/20</span>
                      </div>
                    </div>

                    {/* Attribute Bar */}
                    <div className="w-full bg-[#EFECE4] h-2 rounded-full overflow-hidden p-0.5 border border-[#E6E3DC] mb-2">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${getAttrBarGradient(attr.val)} transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <p className="text-[10px] text-[#6B7280] leading-normal font-normal">
                      {attr.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Signature Trait & Weakness */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Trait */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5">
              <div className="text-[10px] uppercase font-semibold text-emerald-700 tracking-wider mb-1 flex items-center gap-1.5">
                <i className={`fa-solid ${traitInfo.icon || 'fa-star'}`}></i>
                <span>{isDe ? 'Charakter-Stärke' : 'Signature Trait'}</span>
              </div>
              <div className="text-sm font-bold text-emerald-900 mb-1">
                {traitInfo.name}
              </div>
              <p className="text-xs text-emerald-800/90 leading-relaxed font-normal">
                {traitInfo.desc}
              </p>
            </div>

            {/* Weakness */}
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5">
              <div className="text-[10px] uppercase font-semibold text-rose-700 tracking-wider mb-1 flex items-center gap-1.5">
                <i className={`fa-solid ${weakInfo.icon || 'fa-triangle-exclamation'}`}></i>
                <span>{isDe ? 'Bekannte Schwachstelle' : 'Known Risk Factor'}</span>
              </div>
              <div className="text-sm font-bold text-rose-900 mb-1">
                {weakInfo.name}
              </div>
              <p className="text-xs text-rose-800/90 leading-relaxed font-normal">
                {weakInfo.desc}
              </p>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#E6E3DC] bg-[#FAF9F6] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-[#EFECE4] text-[#18191F] text-xs font-semibold transition border border-[#E6E3DC] active:scale-95 cursor-pointer"
          >
            {isDe ? 'Schließen' : 'Close Dossier'}
          </button>

          {/* Onboarding Mode Action */}
          {onSelectInOnboarding && (
            <button
              type="button"
              onClick={() => {
                onSelectInOnboarding(coach);
                onClose();
              }}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#18191F] hover:bg-[#2A2C35] text-white font-semibold text-xs transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <i className="fa-solid fa-check text-xs"></i>
              <span>{isDe ? 'Diesen Trainer ernennen' : 'Appoint This Coach'}</span>
            </button>
          )}

          {/* Market Mode Action */}
          {onHire && !isCurrentCoach && (
            <div className="flex items-center gap-2">
              {!canHire && hireDisabledReason && (
                <span className="text-[11px] text-rose-700 font-medium">
                  {hireDisabledReason}
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  onHire(coach);
                  onClose();
                }}
                disabled={!canHire}
                className={`px-6 py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                  canHire
                    ? 'bg-[#18191F] hover:bg-[#2A2C35] text-white active:scale-95'
                    : 'bg-[#EFECE4] text-[#9A9890] border border-[#E6E3DC] cursor-not-allowed'
                }`}
              >
                <i className="fa-solid fa-user-plus text-xs"></i>
                <span>{isDe ? 'Cheftrainer verpflichten' : 'Hire Head Coach'}</span>
              </button>
            </div>
          )}

          {/* Current Coach Actions */}
          {isCurrentCoach && (
            <div className="flex items-center gap-2">
              {onRenew && (
                <button
                  type="button"
                  onClick={() => {
                    onRenew();
                    onClose();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-200 transition cursor-pointer"
                >
                  <i className="fa-solid fa-file-signature mr-1.5"></i>
                  {isDe ? 'Vertrag verlängern' : 'Extend Contract'}
                </button>
              )}
              {onFire && (
                <button
                  type="button"
                  onClick={() => {
                    onFire();
                    onClose();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-semibold text-xs border border-rose-200 transition cursor-pointer"
                >
                  <i className="fa-solid fa-user-xmark mr-1.5"></i>
                  {isDe ? 'Freistellen' : 'Sack Coach'}
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
