import React from 'react';
import { motion } from 'motion/react';
import { Language } from '../types';
import { t as tr } from '../data/translations';

interface ConfirmResetModalProps {
  lang: Language;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmResetModal: React.FC<ConfirmResetModalProps> = ({
  lang,
  onConfirm,
  onCancel,
}) => {
  const t = (en: string, de?: string, _ignoredEs?: string) => tr(lang, en, de);

  // Isolate Escape key so resetting confirmation closes cleanly
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        e.stopPropagation();
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onCancel]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1, ease: 'linear' }}
      onClick={onCancel}
      className="fixed inset-0 bg-[#18191F]/45 flex flex-col items-center justify-center z-[70] p-2.5 sm:p-4 backdrop-blur-sm cursor-pointer overflow-y-auto overscroll-contain"
    >
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-[28px] sm:rounded-[32px] p-5 sm:p-8 shadow-[0_24px_64px_rgba(24,25,31,0.18)] border border-[#E6E3DC] text-center relative overflow-hidden cursor-default max-h-[92vh] sm:max-h-[88vh] flex flex-col min-h-0 my-auto shrink-0"
      >
        {/* Warning Badge Icon */}
        <div className="relative z-10 w-16 h-16 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center text-2xl mx-auto mb-5 border border-rose-200">
          <i className="fas fa-rotate-right"></i>
        </div>

        {/* Title */}
        <h3 className="relative z-10 text-2xl font-extrabold text-[#18191F] tracking-tight mb-2">
          {t('Start New Career?', 'Karriere Neu Starten?')}
        </h3>

        {/* Description */}
        <p className="relative z-10 text-xs sm:text-sm text-[#6B7280] font-medium leading-relaxed mb-8 px-2">
          {t(
            'Are you sure you want to start over? All your current club progress, trophies, season history, and treasury funds will be reset.',
            'Moechtest du wirklich eine neue Karriere beginnen? Dein aktueller Vereinsfortschritt, Titel, Saisondaten und Kontostand werden zurueckgesetzt.'
          )}
        </p>

        {/* Action Buttons */}
        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-[#FAF9F6] hover:bg-[#EFECE4] text-[#18191F] font-bold py-3.5 px-4 rounded-2xl transition active:scale-95 text-xs sm:text-sm cursor-pointer border border-[#E6E3DC]"
          >
            {t('Keep Playing', 'Weiterbauen')}
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 px-4 rounded-2xl transition active:scale-95 text-xs sm:text-sm cursor-pointer shadow-sm flex items-center justify-center gap-2"
          >
            <i className="fas fa-arrows-rotate text-xs"></i>
            <span>{t('Reset Career', 'Neu Starten')}</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
