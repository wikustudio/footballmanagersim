import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Club, GameState, Language } from '../types';
import { ClubLogo } from './ClubLogo';
import { getLeagueInfo, getOvrColor, formatMoney, getStartingBudget, formatNum } from '../data/gameConstants';
import { t as tr } from '../data/translations';
import { parseAndNormalizeModBudget } from '../engine/moddingEngine';

interface JobMarketModalProps {
  isOpen?: boolean;
  onClose: () => void;
  state: GameState;
  clubsDb: Club[];
  lang: Language;
  onAcceptOffer: (club: Club) => void;
  generateOffers: (state: GameState, currentClubsDb: Club[], count: number) => Club[];
  isModActive?: boolean;
}

export const JobMarketModal: React.FC<JobMarketModalProps> = ({
  isOpen = true,
  onClose,
  state,
  clubsDb,
  lang,
  onAcceptOffer,
  generateOffers,
  isModActive,
}) => {
  const [offers, setOffers] = useState<Club[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<'all' | 'domestic' | 'international' | 'fallen'>('all');
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const prevIsOpenRef = React.useRef(false);

  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      // 2 Domestic + 2 Intl Premium/Continental + 2 Fallen Giant Restoration opportunities = 6
      const generated = generateOffers(state, clubsDb, 6);
      setOffers(generated);
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
      }
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, state, clubsDb, generateOffers]);

  if (!isOpen) return null;
  const t = (en: string, de?: string, es?: string) => tr(lang, en, de, es);

  const userCountry = state.club.country || 'GER';
  const domesticOffers = offers.filter((c) => (c.country || 'GER') === userCountry);
  const intlOffers = offers.filter((c) => (c.country || 'GER') !== userCountry);
  const fallenOffers = offers.filter((c) => Boolean(c.isInsolventGiant));

  const displayedOffers = 
    selectedRegion === 'domestic'
      ? domesticOffers
      : selectedRegion === 'international'
      ? intlOffers
      : selectedRegion === 'fallen'
      ? fallenOffers
      : offers;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      transition={{ duration: 0.1, ease: 'linear' }}
      onClick={onClose}
      className="fixed inset-0 bg-[#18191F]/45 backdrop-blur-sm flex flex-col items-center justify-center p-2.5 sm:p-5 z-50 cursor-pointer overflow-y-auto overscroll-contain"
    >
      <motion.div 
        initial={{ scale: 0.98, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.98, opacity: 0 }} 
        transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white text-[#18191F] w-full max-w-4xl rounded-[28px] sm:rounded-[32px] shadow-[0_24px_64px_rgba(24,25,31,0.18)] border border-[#E6E3DC] relative cursor-default max-h-[92vh] sm:max-h-[88vh] min-h-0 my-auto flex flex-col overflow-hidden text-left shrink-0"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#E6E3DC] bg-[#FAF9F6] shrink-0 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-sky-50 border border-sky-200 rounded-2xl flex items-center justify-center text-sky-700 text-base shrink-0">
              <i className="fa-solid fa-briefcase"></i>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-sky-700 mb-0.5">
                {t('Career Inquiries · Headhunter Desk', 'Karriere-Anfragen · Headhunter-Desk')}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#18191F] tracking-tight leading-tight">
                {t('Director Job Market', 'Sportdirektor Arbeitsmarkt')}
              </h2>
            </div>
          </div>

          <button 
            aria-label="Close modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-[#EFECE4] text-[#6B7280] hover:text-[#18191F] flex items-center justify-center transition cursor-pointer border border-[#E6E3DC] shrink-0"
          >
            <i className="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>

        {/* Progressive Disclosure Filter Bar */}
        <div className="px-5 sm:px-6 pt-3.5 pb-3 shrink-0 border-b border-[#E6E3DC] bg-[#FAF9F6] flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
            <button
              type="button"
              onClick={() => {
                setSelectedRegion('all');
                scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                selectedRegion === 'all'
                  ? 'bg-[#18191F] text-white border border-[#18191F]'
                  : 'bg-white text-[#4B5563] hover:text-[#18191F] hover:bg-[#EFECE4] border border-[#E6E3DC]'
              }`}
            >
              <span>{t('All Opportunities', 'Alle Angebote')}</span>
              <span className="text-[10px] tabular-nums font-medium opacity-75">({offers.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRegion('domestic');
                scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                selectedRegion === 'domestic'
                  ? 'bg-[#18191F] text-white border border-[#18191F]'
                  : 'bg-white text-[#4B5563] hover:text-[#18191F] hover:bg-[#EFECE4] border border-[#E6E3DC]'
              }`}
            >
              <i className="fa-solid fa-house-chimney text-[10px]"></i>
              <span>{t('Domestic', 'Inland')}</span>
              <span className="text-[10px] tabular-nums font-medium opacity-75">({domesticOffers.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRegion('international');
                scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                selectedRegion === 'international'
                  ? 'bg-[#18191F] text-white border border-[#18191F]'
                  : 'bg-white text-[#4B5563] hover:text-[#18191F] hover:bg-[#EFECE4] border border-[#E6E3DC]'
              }`}
            >
              <i className="fa-solid fa-globe text-[10px]"></i>
              <span>{t('Continental', 'International')}</span>
              <span className="text-[10px] tabular-nums font-medium opacity-75">({intlOffers.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRegion('fallen');
                scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                selectedRegion === 'fallen'
                  ? 'bg-amber-600 text-white border border-amber-600'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <i className={`fa-solid fa-fire-flame-curved text-[10px] ${selectedRegion === 'fallen' ? 'text-white' : 'text-amber-600'}`}></i>
              <span>{t('Fallen Giants', 'Gefallene Giganten')}</span>
              <span className="text-[10px] tabular-nums font-medium opacity-80">({fallenOffers.length})</span>
            </button>
          </div>

          <div className="text-[11px] text-[#6B7280] font-normal hidden sm:block shrink-0">
            {t('Director Rep:', 'Direktor-Ansehen:')} <span className="font-bold text-[#18191F] tabular-nums">{state.reputation || 50}</span>
          </div>
        </div>

        {/* Content Body */}
        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-6 custom-scrollbar relative z-10 bg-white">
          {displayedOffers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedOffers.map((club) => {
                const isDomestic = (club.country || 'GER') === userCountry;
                return (
                  <OfferCard 
                    key={club.id} 
                    club={club} 
                    lang={lang} 
                    isDomestic={isDomestic}
                    onAccept={() => onAcceptOffer(club)} 
                    t={t} 
                    isModActive={isModActive} 
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-[#FAF9F6] border border-[#E6E3DC] rounded-3xl p-6 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#E6E3DC] flex items-center justify-center text-[#9A9890] mb-3">
                <i className="fa-solid fa-folder-open text-xl"></i>
              </div>
              <div className="text-[#18191F] font-bold text-sm mb-1">
                {t('No Inquiries in this Category', 'Keine Anfragen in dieser Kategorie')}
              </div>
              <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
                {t('Switch filters to view other club opportunities or continue with your current mandate.', 'Wähle einen anderen Filter oder führe deine aktuelle Amtszeit fort.')}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#E6E3DC] bg-[#FAF9F6] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 relative z-10">
          <div className="text-xs text-[#6B7280] text-center sm:text-left">
            <span className="text-amber-800 font-medium">
              <i className="fa-solid fa-triangle-exclamation mr-1.5 text-[10px] text-amber-600"></i>
              {t(
                'Accepting a proposal immediately terminates your current club contract.',
                'Die Annahme eines Angebots beendet deine aktuelle Amtszeit sofort.'
              )}
            </span>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-[#EFECE4] text-[#18191F] font-semibold text-xs transition border border-[#E6E3DC] cursor-pointer"
          >
            {t('Decline & Stay', 'Ablehnen & Verbleiben')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface OfferCardProps {
  club: Club;
  lang: Language;
  isDomestic: boolean;
  onAccept: () => void;
  t: (en: string, de?: string, es?: string) => string;
  isModActive?: boolean;
}

const OfferCard: React.FC<OfferCardProps> = ({ club, lang, isDomestic, onAccept, t, isModActive }) => {
  const league = getLeagueInfo(club.tier, club.country || 'GER');
  const startingBudget = typeof club.offerBudget === 'number' && Number.isFinite(club.offerBudget) && club.offerBudget > 0
    ? Math.round(club.offerBudget)
    : club.currentBudget != null
    ? parseAndNormalizeModBudget(club.currentBudget, club.tier, club.country || 'GER')
    : getStartingBudget(club.tier, club.country || 'GER');

  return (
    <div className="bg-[#FAF9F6] hover:bg-[#F5F4F0] border border-[#E6E3DC] hover:border-[#18191F]/30 rounded-2xl sm:rounded-3xl p-5 transition-all duration-200 flex flex-col justify-between relative group">
      <div>
        {/* Header row with club logo & metadata */}
        <div className="flex items-start gap-3.5 mb-3.5">
          <div className="w-12 h-12 bg-white border border-[#E6E3DC] rounded-2xl flex items-center justify-center p-2 shrink-0">
            <ClubLogo 
              name={club.name} 
              id={club.id} 
              color={club.color} 
              logo={club.logo} 
              fallbackLogo={club.fallbackLogo} 
              isModActive={isModActive} 
              className="w-full h-full object-contain drop-shadow-sm" 
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] uppercase font-semibold text-[#6B7280] tracking-wider mb-0.5">
              <span className="shrink-0">{isDomestic ? t('Domestic', 'Inland') : t('International', 'Ausland')}</span>
              <span className="text-[#C7C4BC]">·</span>
              <span className="text-sky-700 break-words">{league?.name}</span>
              {club.isInsolventGiant ? (
                <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[9px] font-bold tracking-wider inline-flex items-center gap-1">
                  <i className="fa-solid fa-fire-flame-curved text-[9px] text-amber-600"></i>
                  <span>{t('Fallen Giant · Recovery Mandate', 'Gefallener Gigant · Sanierungsmandat')}</span>
                </span>
              ) : (club.tier === 1 && club.baseOvr >= 83) ? (
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[9px] font-bold tracking-wider inline-flex items-center gap-1">
                  <i className="fa-solid fa-crown text-[9px] text-emerald-600"></i>
                  <span>{t('Premium Club · Executive Offer', 'Top-Klub · Direktoren-Angebot')}</span>
                </span>
              ) : null}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#18191F] break-words tracking-tight transition-colors">
              {club.name}
            </h3>
          </div>
        </div>

        {/* Narrative / Context if present */}
        {club.narrative && (
          <div className={`mb-3.5 text-xs italic leading-relaxed p-3 rounded-xl border-l-2 ${
            club.isInsolventGiant
              ? 'bg-amber-50/80 border-amber-500 text-amber-900'
              : 'bg-white border-sky-500 text-[#4B5563]'
          }`}>
            "{club.narrative}"
          </div>
        )}

        {/* Bento stats row */}
        <div className="grid grid-cols-2 gap-2.5 my-2">
          <div className="p-2.5 rounded-xl bg-white border border-[#E6E3DC]">
            <div className="text-[9px] uppercase font-semibold text-[#6B7280] tracking-wider">
              {t('Squad OVR', 'Kader-Stärke')}
            </div>
            <div className={`text-base font-bold tabular-nums mt-0.5 ${getOvrColor(club.baseOvr)}`}>
              {club.baseOvr} <span className="text-[10px] text-[#6B7280] font-normal">OVR</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-[#E6E3DC]">
            <div className="text-[9px] uppercase font-semibold text-[#6B7280] tracking-wider">
              {t('Transfer Budget', 'Transferbudget')}
            </div>
            <div className={`text-base font-bold tabular-nums mt-0.5 ${startingBudget < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
              {formatMoney(startingBudget)}
            </div>
          </div>
        </div>

        {club.stadium && (
          <div className="text-[11px] text-[#6B7280] mt-1 flex items-center justify-between px-1">
            <span>{t('Venue Capacity:', 'Stadionkapazität:')}</span>
            <span className="font-semibold text-[#18191F] tabular-nums">{formatNum(club.stadium)} seats</span>
          </div>
        )}
      </div>

      {/* Contract Action Button */}
      <div className="mt-4 pt-3 border-t border-[#E6E3DC]">
        <button
          onClick={onAccept}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wide transition cursor-pointer flex items-center justify-center gap-2 bg-[#18191F] hover:bg-[#2A2C35] active:scale-[0.98] text-white"
        >
          <i className="fa-solid fa-file-signature text-xs"></i>
          <span>{t('Sign Management Contract', 'Vertrag unterschreiben')}</span>
        </button>
      </div>
    </div>
  );
};
