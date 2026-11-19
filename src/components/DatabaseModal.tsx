import React, { useState, useMemo } from 'react';
import { Club, Language } from '../types';
import { getLeagueInfo } from '../data/gameConstants';
import { ClubLogo } from './ClubLogo';
import { ALL_CLUBS } from '../data/clubsData';
import { normalizeAndValidateCustomDb } from '../engine/moddingEngine';
import { safeSaveClubsDb } from '../utils/storageManager';

interface DatabaseModalProps {
  clubs: Club[];
  lang: Language;
  onClose: () => void;
  onUpdateClubsDb?: (clubs: Club[], isModActive: boolean) => void;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({ 
  clubs: initialClubs, 
  lang, 
  onClose,
  onUpdateClubsDb 
}) => {
  const isDe = lang === 'de';
  const t = (en: string, de: string) => isDe ? de : en;

  // Local state for live editing
  const [clubsList, setClubsList] = useState<Club[]>(initialClubs && initialClubs.length > 0 ? initialClubs : ALL_CLUBS);
  const [selectedCountry, setSelectedCountry] = useState<string>('GER');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const mainScrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [selectedCountry, searchQuery]);

  // Editable fields for currently selected club
  const [editName, setEditName] = useState<string>('');
  const [editOvr, setEditOvr] = useState<number>(70);
  const [editStadium, setEditStadium] = useState<number>(25000);
  const [editBudget, setEditBudget] = useState<number>(5000000);
  const [editColor, setEditColor] = useState<string>('#ffffff');

  // Handle selecting a club for edit
  const handleSelectClubForEdit = (club: Club) => {
    setEditingClub(club);
    setEditName(club.name);
    setEditOvr(club.baseOvr || 70);
    setEditStadium(club.stadium || 25000);
    const rawBudget = club.currentBudget ? (club.currentBudget < 100000 ? club.currentBudget * 1000 : club.currentBudget) : 5000000;
    setEditBudget(rawBudget);
    setEditColor(club.color || '#3b82f6');
    setSaveSuccessMsg(null);
  };

  // Save changes to current club
  const handleSaveClub = () => {
    if (!editingClub) return;

    const updatedClubs = clubsList.map(c => {
      if (c.id === editingClub.id) {
        return {
          ...c,
          name: editName.trim() || c.name,
          baseOvr: Math.max(10, Math.min(99, Number(editOvr) || 70)),
          stadium: Math.max(1000, Number(editStadium) || 10000),
          currentBudget: Math.max(100000, Number(editBudget) || 1000000),
          color: editColor || c.color,
        };
      }
      return c;
    });

    setClubsList(updatedClubs);
    const updatedTarget = updatedClubs.find(c => c.id === editingClub.id) || null;
    setEditingClub(updatedTarget);

    // Persist to custom_db and activate custom mod
    try {
      safeSaveClubsDb('custom_db', updatedClubs);
      safeSaveClubsDb('fms_custom_mod_json', updatedClubs);
      localStorage.setItem('fms_real_mod_active', 'true');
      localStorage.setItem('fms_custom_mod_json', 'true');
      if (onUpdateClubsDb) {
        onUpdateClubsDb(updatedClubs, true);
      }
      setSaveSuccessMsg(isDe ? `"${editName}" erfolgreich gespeichert!` : `"${editName}" saved to custom database!`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (e: any) {
      console.error('Failed to save to localStorage', e);
    }
  };

  // Reset club to original ALL_CLUBS default
  const handleResetClub = () => {
    if (!editingClub) return;
    const original = ALL_CLUBS.find(c => c.id === editingClub.id);
    if (!original) return;

    handleSelectClubForEdit(original);
    const updatedClubs = clubsList.map(c => c.id === original.id ? { ...original } : c);
    setClubsList(updatedClubs);
    try {
      safeSaveClubsDb('custom_db', updatedClubs);
      safeSaveClubsDb('fms_custom_mod_json', updatedClubs);
      if (onUpdateClubsDb) onUpdateClubsDb(updatedClubs, true);
      setSaveSuccessMsg(isDe ? 'Verein auf Standard zurückgesetzt.' : 'Club reset to default.');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  // Export current database to JSON
  const handleExportJson = () => {
    try {
      const jsonStr = JSON.stringify(clubsList, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fms_edited_database.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      console.error('Export failed', e);
    }
  };

  // Import JSON file
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        const res = normalizeAndValidateCustomDb(data);
        if (res.valid && res.clubs && res.clubs.length > 0) {
          setClubsList(res.clubs);
          safeSaveClubsDb('custom_db', res.clubs);
          safeSaveClubsDb('fms_custom_mod_json', res.clubs);
          localStorage.setItem('fms_real_mod_active', 'true');
          localStorage.setItem('fms_custom_mod_json', 'true');
          if (onUpdateClubsDb) onUpdateClubsDb(res.clubs, true);
          setSaveSuccessMsg(isDe ? `${res.clubs.length} Vereine geladen!` : `${res.clubs.length} clubs imported!`);
          setTimeout(() => setSaveSuccessMsg(null), 3500);
        }
      } catch (err) {
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  const allCountries = useMemo(() => {
    return Array.from(new Set(clubsList.map(c => c.country || 'GER'))).sort();
  }, [clubsList]);

  const filteredClubs = useMemo(() => {
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      return clubsList.filter(c => 
        c.name.toLowerCase().includes(q) || 
        (c.country || '').toLowerCase().includes(q)
      );
    }
    return clubsList.filter(c => (c.country || 'GER') === selectedCountry);
  }, [clubsList, searchQuery, selectedCountry]);

  const maxTier = filteredClubs.length > 0 ? Math.max(...filteredClubs.map(c => c.tier)) : 1;
  const leagues = Array.from({ length: maxTier }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 bg-[#18191F]/45 flex flex-col items-center justify-center p-2 sm:p-4 z-50 backdrop-blur-sm animate-in fade-in duration-100 overflow-y-auto overscroll-contain">
      <div className="bg-white w-full max-w-5xl rounded-[28px] sm:rounded-[32px] flex flex-col max-h-[92vh] sm:max-h-[88vh] min-h-0 my-auto shadow-[0_24px_64px_rgba(24,25,31,0.18)] border border-[#E6E3DC] overflow-hidden text-[#18191F] animate-in zoom-in-98 duration-100 ease-out shrink-0">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 sm:p-5 border-b border-[#E6E3DC] bg-[#FAF9F6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center text-lg shrink-0">
              <i className="fa-solid fa-pen-to-square"></i>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
                {t('Database & Roster Editor', 'Datenbank & Roster-Editor')}
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-[#18191F] flex items-center gap-2">
                <span>{t('Roster & Club Editor', 'Roster- & Vereins-Editor')}</span>
                <span className="text-xs font-semibold text-[#4B5563] bg-white px-2.5 py-0.5 rounded-full border border-[#E6E3DC] tabular-nums">
                  {clubsList.length.toLocaleString()} {t('Clubs', 'Vereine')}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleExportJson}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              title="Export database as JSON"
            >
              <i className="fa-solid fa-download text-[11px]"></i>
              <span className="hidden sm:inline">{t('Export JSON', 'JSON exportieren')}</span>
            </button>

            <label className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#EFECE4] border border-[#E6E3DC] text-[#18191F] text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer">
              <i className="fa-solid fa-upload text-[11px] text-sky-700"></i>
              <span className="hidden sm:inline">{t('Import Patch', 'Patch importieren')}</span>
              <input type="file" accept=".json" className="hidden" onChange={handleImportJson} />
            </label>

            <button 
              aria-label="Close modal" 
              onClick={onClose} 
              className="w-8 h-8 rounded-full bg-white hover:bg-[#EFECE4] border border-[#E6E3DC] flex items-center justify-center transition cursor-pointer text-[#6B7280] hover:text-[#18191F] shrink-0 ml-1"
            >
              <i className="fas fa-times text-xs"></i>
            </button>
          </div>
        </div>

        {/* Search & Notification Bar */}
        <div className="px-4 sm:px-5 py-3 border-b border-[#E6E3DC] bg-[#F5F4F0] flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="relative w-full sm:w-80">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9890] text-xs"></i>
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('Search by club name or country...', 'Verein oder Land suchen...')}
              className="w-full bg-white border border-[#E6E3DC] rounded-xl pl-8 pr-7 py-1.5 text-xs text-[#18191F] placeholder-[#9A9890] focus:outline-none focus:border-[#18191F]"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                aria-label={t('Clear search', 'Suche leeren')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9A9890] hover:text-[#18191F] text-xs cursor-pointer"
              >
                <i className="fa-solid fa-circle-xmark"></i>
              </button>
            )}
          </div>

          {saveSuccessMsg ? (
            <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
              <i className="fa-solid fa-circle-check"></i>
              <span>{saveSuccessMsg}</span>
            </div>
          ) : (
            <div className="text-[11px] text-[#6B7280] font-medium">
              <i className="fa-solid fa-hand-pointer text-[10px] text-sky-700 mr-1.5"></i>
              <span>{t('Click any club to edit name, rating, stadium & budget', 'Klicke auf einen Verein zum Bearbeiten')}</span>
            </div>
          )}
        </div>

        {/* Content Body: Sidebar + Main Area + Optional Live Editor Drawer */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0">
          
          {/* Sidebar - Countries (hidden when actively searching) */}
          {!searchQuery && (
            <div className="md:w-56 border-b md:border-b-0 md:border-r border-[#E6E3DC] overflow-y-auto custom-scrollbar p-2 bg-[#FAF9F6] shrink-0 max-h-[22vh] md:max-h-full">
              <div className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest px-2 mb-2 mt-2">
                {t('Countries', 'Laender')} ({allCountries.length})
              </div>
              <div className="flex md:flex-col flex-row gap-1 overflow-x-auto md:overflow-visible">
                {allCountries.map(country => (
                  <button
                    key={country}
                    onClick={() => {
                      setSelectedCountry(country);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap md:whitespace-normal text-left cursor-pointer ${
                      selectedCountry === country 
                        ? 'bg-[#18191F] text-white shadow-xs' 
                        : 'text-[#4B5563] hover:bg-[#EFECE4] hover:text-[#18191F] border border-transparent'
                    }`}
                  >
                    <i className="fas fa-flag text-[10px] opacity-70"></i>
                    <span>{country}</span>
                    <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded tabular-nums ${
                      selectedCountry === country
                        ? 'bg-white/15 text-white'
                        : 'bg-white text-[#4B5563] border border-[#E6E3DC]'
                    }`}>
                      {clubsList.filter(c => (c.country || 'GER') === country).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main List Area */}
          <div ref={mainScrollRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar p-3 sm:p-5 bg-white">
            {searchQuery && (
              <div className="mb-4 text-xs text-[#6B7280]">
                {t('Found', 'Gefunden')}: <span className="font-bold text-[#18191F] tabular-nums">{filteredClubs.length}</span> {t('clubs for', 'Vereine für')} "{searchQuery}"
              </div>
            )}

            {filteredClubs.length === 0 ? (
              <div className="text-center py-16 text-[#6B7280]">
                <i className="fa-solid fa-database text-3xl mb-3 opacity-30"></i>
                <p className="text-sm font-medium">{t('No clubs found matching your search.', 'Keine Vereine gefunden.')}</p>
              </div>
            ) : searchQuery ? (
              /* Search results grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredClubs.map(club => (
                  <div 
                    key={club.id} 
                    onClick={() => handleSelectClubForEdit(club)}
                    className={`flex items-center justify-between p-2.5 rounded-xl transition cursor-pointer border ${
                      editingClub?.id === club.id
                        ? 'bg-sky-50 border-sky-300 shadow-xs'
                        : 'bg-[#FAF9F6] hover:bg-[#EFECE4] border-[#E6E3DC]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-white border border-[#E6E3DC] flex items-center justify-center p-1 shrink-0">
                        <ClubLogo
                          name={club.name}
                          color={club.color}
                          logo={club.logo}
                          fallbackLogo={club.fallbackLogo}
                          className="w-6 h-6 object-contain"
                        />
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-xs text-[#18191F] truncate">{club.name}</div>
                        <div className="text-[10px] text-[#6B7280] tabular-nums">{club.country || 'GER'} · Tier {club.tier}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-2 py-0.5 rounded-lg bg-white border border-[#E6E3DC] text-xs font-bold text-[#18191F] tabular-nums">
                        {club.baseOvr}
                      </span>
                      <i className="fa-solid fa-pen text-[10px] text-[#9A9890]"></i>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Tier / League Sections */
              leagues.map(tier => {
                const leagueInfo = getLeagueInfo(tier, selectedCountry);
                const tierClubs = filteredClubs.filter(c => c.tier === tier).sort((a, b) => b.baseOvr - a.baseOvr);
                if (tierClubs.length === 0) return null;

                return (
                  <div key={tier} className="mb-6 last:mb-0">
                    <div className={`flex items-center justify-between px-3.5 py-2.5 rounded-t-xl ${leagueInfo.css} border border-[#E6E3DC] border-b-0`}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-white/85 border border-[#E6E3DC] flex items-center justify-center shrink-0 shadow-2xs">
                          <i className="fas fa-trophy text-[#18191F] text-xs"></i>
                        </div>
                        <div>
                          <h3 className="font-extrabold text-xs sm:text-sm tracking-tight text-[#18191F]">{leagueInfo.name}</h3>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-[#4B5563] tabular-nums">
                            {tierClubs.length} {t('Clubs', 'Vereine')} &bull; Tier {tier}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-b-xl p-2.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {tierClubs.map(club => (
                        <div 
                          key={club.id} 
                          onClick={() => handleSelectClubForEdit(club)}
                          className={`flex items-center justify-between p-2 rounded-xl transition cursor-pointer border ${
                            editingClub?.id === club.id
                              ? 'bg-sky-50 border-sky-300 shadow-xs'
                              : 'bg-white hover:bg-[#EFECE4] border-[#E6E3DC]'
                          }`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <div className="w-7 h-7 rounded-lg bg-white border border-[#E6E3DC] flex items-center justify-center p-0.5 shrink-0">
                              <ClubLogo
                                name={club.name}
                                color={club.color}
                                logo={club.logo}
                                fallbackLogo={club.fallbackLogo}
                                className="w-5 h-5 object-contain"
                              />
                            </div>
                            <span className="font-semibold text-xs truncate text-[#18191F]">{club.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {club.isReserve && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 text-[8px] font-extrabold uppercase tracking-wider border border-amber-200">
                                Res
                              </span>
                            )}
                            <span className="px-1.5 py-0.5 rounded bg-[#FAF9F6] border border-[#E6E3DC] text-[11px] font-bold text-[#18191F] tabular-nums">
                              {club.baseOvr}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Editor Drawer for Selected Club */}
          {editingClub && (
            <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-[#E6E3DC] bg-[#FAF9F6] p-4 sm:p-5 flex flex-col justify-between shrink-0 overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E6E3DC]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white border border-[#E6E3DC] flex items-center justify-center p-1 shrink-0">
                      <ClubLogo
                        name={editingClub.name}
                        color={editColor}
                        logo={editingClub.logo}
                        fallbackLogo={editingClub.fallbackLogo}
                        className="w-7 h-7 object-contain"
                      />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
                        {t('Editing Club', 'Verein bearbeiten')}
                      </div>
                      <div className="text-xs font-bold text-[#18191F] truncate max-w-[160px]">
                        {editingClub.name}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingClub(null)}
                    aria-label={t('Close club editor', 'Editor schliessen')}
                    className="w-7 h-7 rounded-full bg-white hover:bg-[#EFECE4] border border-[#E6E3DC] flex items-center justify-center text-[#6B7280] hover:text-[#18191F] text-xs cursor-pointer"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>

                {/* Form fields */}
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
                      {t('Club Name', 'Vereinsname')}
                    </label>
                    <input 
                      type="text" 
                      value={editName} 
                      onChange={e => setEditName(e.target.value)} 
                      className="w-full bg-white border border-[#E6E3DC] rounded-xl px-3 py-2 text-[#18191F] font-semibold focus:outline-none focus:border-[#18191F]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                        {t('Base OVR Rating', 'Gesamtstärke (OVR)')}
                      </label>
                      <span className="font-extrabold text-[#18191F] text-xs tabular-nums">{editOvr}</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="99" 
                      value={editOvr} 
                      onChange={e => setEditOvr(Number(e.target.value))} 
                      className="w-full accent-[#18191F] cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
                      {t('Stadium Capacity', 'Stadionkapazität')}
                    </label>
                    <input 
                      type="number" 
                      step="500"
                      min="1000"
                      max="120000"
                      value={editStadium} 
                      onChange={e => setEditStadium(Number(e.target.value))} 
                      className="w-full bg-white border border-[#E6E3DC] rounded-xl px-3 py-2 text-[#18191F] font-semibold tabular-nums focus:outline-none focus:border-[#18191F]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
                      {t('Starting Budget (€)', 'Startbudget (€)')}
                    </label>
                    <input 
                      type="number" 
                      step="500000"
                      min="100000"
                      value={editBudget} 
                      onChange={e => setEditBudget(Number(e.target.value))} 
                      className="w-full bg-white border border-[#E6E3DC] rounded-xl px-3 py-2 text-[#18191F] font-semibold tabular-nums focus:outline-none focus:border-[#18191F]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
                      {t('Club Color', 'Vereinsfarbe')}
                    </label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={/^#[0-9A-Fa-f]{6}$/.test(editColor) ? editColor : '#3b82f6'} 
                        onChange={e => setEditColor(e.target.value)} 
                        className="w-8 h-8 rounded-lg border border-[#E6E3DC] bg-white cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={editColor} 
                        onChange={e => setEditColor(e.target.value)} 
                        className="flex-1 bg-white border border-[#E6E3DC] rounded-xl px-3 py-1.5 text-[#18191F] font-mono text-xs focus:outline-none focus:border-[#18191F]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#E6E3DC] space-y-2 mt-4">
                <button
                  onClick={handleSaveClub}
                  className="w-full py-2.5 px-4 bg-[#18191F] hover:bg-[#2A2C35] active:scale-95 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <i className="fa-solid fa-floppy-disk"></i>
                  <span>{t('Save Club to Custom DB', 'Änderungen speichern')}</span>
                </button>

                <button
                  onClick={handleResetClub}
                  className="w-full py-2 px-4 bg-white hover:bg-[#EFECE4] border border-[#E6E3DC] text-[#4B5563] hover:text-[#18191F] rounded-xl text-[11px] font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <i className="fa-solid fa-arrow-rotate-left text-[10px]"></i>
                  <span>{t('Reset to Original', 'Auf Standard zurücksetzen')}</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
