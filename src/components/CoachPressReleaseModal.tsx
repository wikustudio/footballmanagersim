import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { t as tr } from '../data/translations';

interface CoachPressReleaseModalProps {
  action: 'hire' | 'fire';
  coachName: string;
  coachStyle?: string;
  clubName: string;
  lang: 'en' | 'de';
  onClose: () => void;
}

const HIRE_HEADLINES_EN = [
  "NEW ERA BEGINS AT {club}",
  "SHOCK APPOINTMENT: {club} HIRE {coach}",
  "TACTICAL MASTERMIND JOINS {club}",
  "BOARD UNVEILS NEW HEAD COACH"
];
const FIRE_HEADLINES_EN = [
  "CRISIS AT {club}: COACH SACKED!",
  "THE AXE FALLS ON {coach}",
  "{club} BOARD LOSES PATIENCE",
  "MUTUAL CONSENT? YEAH, RIGHT."
];

export const CoachPressReleaseModal: React.FC<CoachPressReleaseModalProps> = ({
  action,
  coachName,
  coachStyle,
  clubName,
  lang,
  onClose
}) => {
  const isDe = lang === 'de';
  const t = (en: string, de?: string) => tr(lang, en, de);
  const isHire = action === 'hire';

  useEffect(() => {
    if (isHire) {
      setTimeout(() => {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#34d399', '#ffffff']
        });
      }, 250);
    }
  }, [isHire]);

  const headlinesList = isHire ? HIRE_HEADLINES_EN : FIRE_HEADLINES_EN;
  const hash = (coachName || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  let headline = headlinesList[hash % headlinesList.length];
  headline = headline.replace('{club}', clubName.toUpperCase()).replace('{coach}', coachName.toUpperCase());

  const hireBodyEn = `In a highly anticipated press release today, the board of ${clubName} officially unveiled ${coachName} as the new Head Coach. Promising to implement a strict ${coachStyle || 'Total Football'} philosophy, the new tactical leader stated they are ready to elevate the squad.`;
  const fireBodyEn = `It's all over for ${coachName}. After crisis talks late last night, ${clubName} has officially terminated the coach's contract. "We needed a change in direction," a brief club statement read. The search for a successor begins immediately.`;

  const hireBodyDe = `In einer mit Spannung erwarteten Pressekonferenz hat der Vorstand von ${clubName} heute offiziell ${coachName} als neuen Cheftrainer vorgestellt. Mit dem Versprechen, eine klare ${coachStyle || 'Total Football'}-Philosophie zu etablieren, zeigte sich der Trainer hochmotiviert.`;
  const fireBodyDe = `Das Kapitel ${coachName} bei ${clubName} ist beendet. Nach Krisengesprächen am späten Abend hat der Klub den Vertrag des Trainers offiziell beendet. Die Suche nach einem Nachfolger beginnt unverzüglich.`;

  const bodyText = isDe ? (isHire ? hireBodyDe : fireBodyDe) : (isHire ? hireBodyEn : fireBodyEn);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
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
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 bg-[#18191F]/50 backdrop-blur-sm flex flex-col items-center justify-center p-2.5 sm:p-4 z-[70] text-left overflow-y-auto overscroll-contain cursor-pointer"
    >
      <motion.div 
        initial={{ scale: 0.98, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.98, opacity: 0 }} 
        transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg rounded-[28px] sm:rounded-[32px] shadow-[0_24px_64px_rgba(24,25,31,0.18)] relative overflow-hidden font-sans border border-[#E6E3DC] text-[#18191F] max-h-[92vh] sm:max-h-[88vh] flex flex-col min-h-0 my-auto shrink-0 cursor-default"
      >
        {/* Header Ribbon */}
        <div className="p-6 pb-4 border-b border-[#E6E3DC] bg-[#FAF9F6] flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 ${
              isHire 
                ? 'bg-sky-50 border-sky-200 text-sky-700' 
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}>
              <i className={`fa-solid ${isHire ? 'fa-handshake' : 'fa-door-open'} text-base`}></i>
            </div>
            <div>
              <div className={`text-[10px] font-semibold uppercase tracking-wider ${isHire ? 'text-sky-700' : 'text-rose-700'}`}>
                {t('Official Press Release', 'Offizielle Pressemitteilung')}
              </div>
              <div className="text-xs text-[#6B7280] font-medium">
                {clubName}
              </div>
            </div>
          </div>

          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] tabular-nums px-2.5 py-1 rounded-xl bg-white border border-[#E6E3DC]">
            {new Date().toLocaleDateString(isDe ? 'de-DE' : 'en-US')}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 relative z-10 space-y-4 flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar bg-white">
          <h2 className="text-xl sm:text-2xl font-bold uppercase leading-tight tracking-tight text-[#18191F]">
            {headline}
          </h2>
          
          <div className="bg-[#FAF9F6] rounded-2xl p-4 sm:p-5 border border-[#E6E3DC]">
            <p className="text-xs sm:text-sm font-normal leading-relaxed text-[#4B5563]">
              {bodyText}
            </p>
            
            {isHire && coachStyle && (
              <div className="mt-4 p-3.5 border-l-2 border-sky-600 bg-sky-50 rounded-r-xl text-xs font-medium text-sky-900">
                "{isDe ? `Wir werden kompromisslosen ${coachStyle}-Fußball spielen!` : `We will play uncompromising ${coachStyle} football!`}"
                <span className="text-sky-700 text-[11px] mt-1 block not-italic font-semibold">— {coachName}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="w-full sm:w-auto font-bold text-xs px-7 py-3 rounded-xl transition-all cursor-pointer bg-[#18191F] hover:bg-[#2A2C35] text-white flex items-center justify-center gap-2"
            >
              <span>{t('Acknowledge Statement', 'Mitteilung bestätigen')}</span>
              <i className="fa-solid fa-arrow-right text-xs"></i>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
