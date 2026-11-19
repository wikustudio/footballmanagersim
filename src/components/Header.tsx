import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameState, Language, ViewMode, WorkspaceTab } from '../types';
import { t } from '../data/translations';
import { ClubLogo } from './ClubLogo';
import { DashboardNotification } from '../engine/liveSimVisualEngine';
import { PWAInstallButton } from './PWAInstallButton';

export interface QuickActionItem {
  id: string;
  label: string;
  category: string;
  icon: string;
  onSelect: () => void;
}

interface HeaderProps {
  lang: Language;
  viewMode: ViewMode;
  onToggleLang?: (l: Language) => void;
  onToggleViewMode: (v: ViewMode) => void;
  onResetGame: () => void;
  hasActiveGame: boolean;
  onOpenModModal?: () => void;
  isModActive?: boolean;
  onOpenFeedbackModal?: () => void;
  unreadCrashCount?: number;
  // Workspace props
  gameState?: GameState | null;
  activeTab?: WorkspaceTab;
  onSelectTab?: (tab: WorkspaceTab) => void;
  notifications?: DashboardNotification[];
  onNotificationSelect?: (notification: DashboardNotification) => void;
  quickActions?: QuickActionItem[];
  onOpenManagerProfile?: () => void;
}

const WORKSPACE_TABS: Array<{ id: WorkspaceTab; label: string; shortLabel: string; icon: string }> = [
  { id: 'overview', label: 'Overview', shortLabel: 'Overview', icon: 'fa-table-columns' },
  { id: 'squad', label: 'Squad', shortLabel: 'Squad', icon: 'fa-users' },
  { id: 'commercial', label: 'Commercial', shortLabel: 'Commercial', icon: 'fa-briefcase' },
  { id: 'infrastructure', label: 'Infrastructure', shortLabel: 'Venue', icon: 'fa-landmark' },
  { id: 'board', label: 'Board & Manager', shortLabel: 'Board', icon: 'fa-user-tie' },
];

export const Header: React.FC<HeaderProps> = ({
  lang,
  viewMode,
  onToggleLang,
  onToggleViewMode,
  onResetGame,
  hasActiveGame,
  onOpenModModal,
  isModActive,
  onOpenFeedbackModal,
  unreadCrashCount = 0,
  gameState,
  activeTab = 'overview',
  onSelectTab,
  notifications = [],
  onNotificationSelect,
  quickActions = [],
  onOpenManagerProfile,
}) => {
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const moreMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMoreMenuOpen(false);
        setNotifOpen(false);
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    const prefetchTimer = setTimeout(() => {
      import('./LeaderboardPage').catch(() => {});
    }, 1200);

    return () => {
      clearTimeout(prefetchTimer);
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const filteredActions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return quickActions.slice(0, 8);
    return quickActions
      .filter(
        (a) =>
          a.label.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [quickActions, searchQuery]);

  const tr = (en: string, de: string) => t(lang, en, de);
  const managerDisplay = gameState?.managerName?.trim() || 'DIRECTOR';
  const difficultyDisplay =
    gameState?.difficulty === 'hardcore'
      ? 'Hardcore'
      : gameState?.difficulty === 'casual'
      ? 'Casual'
      : 'Standard';

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-[#F5F3EE]/95 backdrop-blur-xl border-b border-[#E6E3DC] transition-colors">
      <div className="max-w-[1440px] mx-auto w-full px-3 sm:px-6 py-2">
        {/* Main Single Row */}
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Left: Club Identity */}
          <button
            type="button"
            onClick={() => {
              if (viewMode !== 'game') {
                onToggleViewMode('game');
              } else if (hasActiveGame && onSelectTab) {
                onSelectTab('overview');
              } else {
                onResetGame();
              }
            }}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer hover:opacity-85 transition text-left shrink-0 min-w-0"
          >
            {hasActiveGame && gameState?.club ? (
              <ClubLogo
                club={gameState.club}
                size={32}
                isModActive={isModActive}
                className="w-8 h-8 rounded-xl shrink-0 shadow-sm"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl overflow-hidden shadow-sm shrink-0 border border-[#E6E3DC] bg-[#18191F]">
                <img src="/assets/a_footballsim_logo.jpg" alt="Football Manager Sim" className="w-full h-full object-cover" />
              </div>
            )}
            <span className="text-sm sm:text-[15px] font-extrabold tracking-tight text-[#18191F] truncate max-w-[130px] sm:max-w-[190px]">
              {hasActiveGame && gameState?.club ? gameState.club.name : 'Football Manager Sim'}
            </span>
          </button>

          {/* Center: 5 Workspace Tabs (Desktop) */}
          {hasActiveGame && viewMode === 'game' && onSelectTab && (
            <nav
              aria-label="Workspace navigation"
              className="hidden lg:flex items-center bg-white border border-[#E6E3DC] rounded-full p-1 shadow-[0_1px_2px_rgba(24,25,31,0.04)] shrink-0"
            >
              {WORKSPACE_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onSelectTab(tab.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      isActive
                        ? 'bg-[#18191F] text-white shadow-sm'
                        : 'text-[#4B5563] hover:text-[#18191F] hover:bg-[#F5F4F0]'
                    }`}
                  >
                    <i className={`fa-solid ${tab.icon} text-[11px]`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right: Install PWA / Search Actions / Notifications / Profile / More */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <PWAInstallButton variant="header" />
            {/* Quick Action Search (Desktop & Tablet) */}
            {hasActiveGame && viewMode === 'game' && quickActions.length > 0 && (
              <div ref={searchRef} className="relative hidden md:block">
                <div className="flex items-center gap-2 bg-white border border-[#E6E3DC] rounded-full px-3 py-1.5 shadow-[0_1px_2px_rgba(24,25,31,0.03)] w-44 xl:w-52">
                  <i className="fa-solid fa-magnifying-glass text-[11px] text-[#6B7280]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onFocus={() => setSearchOpen(true)}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchOpen(true);
                    }}
                    placeholder="Search actions..."
                    aria-label="Search actions"
                    className="w-full bg-transparent text-xs font-medium text-[#18191F] placeholder-[#6B7280] focus:outline-none"
                  />
                </div>
                <AnimatePresence>
                  {searchOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 top-full mt-2 w-72 bg-white border border-[#E6E3DC] rounded-2xl shadow-[0_20px_48px_rgba(24,25,31,0.14)] p-2 z-50"
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] px-2 py-1">
                        Quick Actions
                      </div>
                      {filteredActions.length === 0 ? (
                        <div className="px-2 py-3 text-xs text-[#6B7280] text-center">
                          No matching club actions
                        </div>
                      ) : (
                        <div className="space-y-0.5 max-h-64 overflow-y-auto">
                          {filteredActions.map((act) => (
                            <button
                              key={act.id}
                              type="button"
                              onClick={() => {
                                act.onSelect();
                                setSearchOpen(false);
                                setSearchQuery('');
                              }}
                              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-[#F6F5F1] text-left transition cursor-pointer"
                            >
                              <span className="flex items-center gap-2 text-xs font-bold text-[#18191F]">
                                <i className={`fa-solid ${act.icon} text-[11px] text-[#4B5563] w-4 text-center`} />
                                {act.label}
                              </span>
                              <span className="text-[10px] font-semibold text-[#6B7280]">
                                {act.category}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Return to Dugout button when viewing About or Leaderboard */}
            {viewMode !== 'game' && (
              <button
                type="button"
                onClick={() => onToggleViewMode('game')}
                className="px-3 py-1.5 rounded-full bg-[#18191F] text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
              >
                <i className="fa-solid fa-arrow-left text-[10px]" />
                <span>{hasActiveGame ? 'Workspace' : 'Play'}</span>
              </button>
            )}

            {/* Notifications Bell */}
            {hasActiveGame && (
              <div ref={notifRef} className="relative">
                <button
                  type="button"
                  onClick={() => setNotifOpen((p) => !p)}
                  aria-label="Club Notifications"
                  className="relative w-9 h-9 rounded-full bg-white border border-[#E6E3DC] text-[#18191F] hover:bg-[#F6F5F1] flex items-center justify-center cursor-pointer transition shadow-[0_1px_2px_rgba(24,25,31,0.03)]"
                >
                  <i className="fa-regular fa-bell text-sm" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#EA580C] text-white text-[10px] font-black flex items-center justify-center tabular-nums border-2 border-[#F5F3EE]">
                      {notifications.length}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-1.5rem)] bg-white border border-[#E6E3DC] rounded-2xl shadow-[0_20px_50px_rgba(24,25,31,0.16)] p-2.5 z-50"
                    >
                      <div className="flex items-center justify-between px-2 py-1.5 border-b border-[#E6E3DC] mb-1.5">
                        <span className="text-xs font-extrabold text-[#18191F]">
                          Boardroom & Club Alerts
                        </span>
                        <span className="text-[10px] font-bold text-[#6B7280] tabular-nums">
                          {notifications.length} active
                        </span>
                      </div>
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-[#6B7280]">
                          All club departments are operating smoothly.
                        </div>
                      ) : (
                        <div className="space-y-1.5 max-h-72 overflow-y-auto">
                          {notifications.map((n) => (
                            <button
                              key={n.id}
                              type="button"
                              onClick={() => {
                                if (onNotificationSelect) {
                                  onNotificationSelect(n);
                                } else if (n.actionTab && onSelectTab) {
                                  onToggleViewMode('game');
                                  onSelectTab(n.actionTab);
                                }
                                setNotifOpen(false);
                              }}
                              className="w-full text-left p-2.5 rounded-xl bg-[#F6F5F1] hover:bg-[#EAE7E0] border border-[#E6E3DC] transition cursor-pointer"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-extrabold text-[#18191F]">
                                  {n.title}
                                </span>
                                <span
                                  className={`w-2 h-2 rounded-full shrink-0 ${
                                    n.tone === 'rose'
                                      ? 'bg-rose-500'
                                      : n.tone === 'amber'
                                      ? 'bg-amber-500'
                                      : n.tone === 'emerald'
                                      ? 'bg-emerald-500'
                                      : 'bg-sky-500'
                                  }`}
                                />
                              </div>
                              <p className="text-[11px] text-[#6B7280] mt-0.5 leading-snug">
                                {n.detail}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Manager Profile Pill */}
            {hasActiveGame && (
              <button
                type="button"
                onClick={() => {
                  if (onOpenManagerProfile) onOpenManagerProfile();
                  else onSelectTab?.('board');
                }}
                className="hidden sm:flex items-center gap-2 bg-white border border-[#E6E3DC] hover:border-[#18191F] rounded-full pl-1.5 pr-3 py-1 transition cursor-pointer shadow-[0_1px_2px_rgba(24,25,31,0.03)]"
              >
                <span className="w-7 h-7 rounded-full bg-[#18191F] text-white text-xs font-black flex items-center justify-center">
                  {managerDisplay.charAt(0).toUpperCase()}
                </span>
                <div className="text-left leading-tight">
                  <div className="text-[11px] font-extrabold text-[#18191F] uppercase truncate max-w-[92px]">
                    {managerDisplay}
                  </div>
                  <div className="text-[9px] font-semibold text-[#6B7280]">
                    {difficultyDisplay}
                  </div>
                </div>
              </button>
            )}

            {/* Consolidated "More" Menu */}
            <div ref={moreMenuRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setMoreMenuOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full border transition text-xs font-bold cursor-pointer ${
                  moreMenuOpen
                    ? 'bg-[#18191F] text-white border-[#18191F]'
                    : 'bg-white text-[#18191F] border-[#E6E3DC] hover:bg-[#F6F5F1]'
                }`}
                title="More options & community"
              >
                <i className="fa-solid fa-bars text-xs" />
                <span>More</span>
                {unreadCrashCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              <AnimatePresence>
                {moreMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -4 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-1.5rem)] max-h-[calc(100svh-5rem)] overflow-y-auto overscroll-contain bg-white border border-[#E6E3DC] rounded-2xl shadow-[0_24px_56px_rgba(24,25,31,0.18)] p-2 z-50 text-left"
                  >
                    <div className="p-1 space-y-1">
                      {hasActiveGame && (
                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenManagerProfile) onOpenManagerProfile();
                            else onSelectTab?.('board');
                            setMoreMenuOpen(false);
                          }}
                          className="sm:hidden w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#F6F5F1] text-[#18191F] text-xs font-bold transition cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-lg bg-[#18191F] text-white flex items-center justify-center shrink-0 text-[10px] font-black">
                              {managerDisplay.charAt(0).toUpperCase()}
                            </div>
                            <span>Manager Profile</span>
                          </div>
                          <span className="text-[10px] font-semibold text-[#6B7280]">{difficultyDisplay}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          onToggleViewMode(viewMode === 'leaderboard' ? 'game' : 'leaderboard');
                          setMoreMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F6F5F1] text-[#18191F] text-xs font-bold transition cursor-pointer text-left"
                      >
                        <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                          <i className="fa-solid fa-trophy text-xs" />
                        </div>
                        <span>Leaderboard & Press Wall</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onToggleViewMode(viewMode === 'about' ? 'game' : 'about');
                          setMoreMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F6F5F1] text-[#18191F] text-xs font-bold transition cursor-pointer text-left"
                      >
                        <div className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                          <i className="fa-solid fa-circle-info text-xs" />
                        </div>
                        <span>{tr('About & Rules', 'About & Rules')}</span>
                      </button>

                      {onOpenFeedbackModal && (
                        <button
                          type="button"
                          onClick={() => {
                            onOpenFeedbackModal();
                            setMoreMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#F6F5F1] text-[#18191F] text-xs font-bold transition cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                              <i className="fa-solid fa-bug text-xs" />
                            </div>
                            <span>Report Bug / Feedback</span>
                          </div>
                          {unreadCrashCount > 0 && (
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                              {unreadCrashCount}
                            </span>
                          )}
                        </button>
                      )}

                      {onOpenModModal && (
                        <button
                          type="button"
                          onClick={() => {
                            onOpenModModal();
                            setMoreMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#F6F5F1] text-[#18191F] text-xs font-bold transition cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                              <i className="fa-solid fa-layer-group text-xs" />
                            </div>
                            <span>CR27 Database Mod</span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isModActive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-[#F6F5F1] text-[#6B7280]'
                            }`}
                          >
                            {isModActive ? 'Active' : 'Off'}
                          </span>
                        </button>
                      )}

                      <PWAInstallButton
                        variant="menu"
                        onActionComplete={() => setMoreMenuOpen(false)}
                      />

                      {hasActiveGame && (
                        <button
                          type="button"
                          onClick={() => {
                            setMoreMenuOpen(false);
                            onResetGame();
                          }}
                          className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-rose-50 text-rose-700 text-xs font-bold transition cursor-pointer text-left"
                        >
                          <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                            <i className="fa-solid fa-rotate-right text-xs" />
                          </div>
                          <span>Start Over</span>
                        </button>
                      )}
                    </div>

                    <div className="h-[1px] bg-[#E6E3DC] my-1.5" />

                    <div className="p-1 space-y-1">
                      <a
                        href="https://buymeacoffee.com/willykuhne"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMoreMenuOpen(false)}
                        className="flex items-center justify-between p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <i className="fa-solid fa-mug-hot text-amber-600 text-xs" />
                          <span>Buy Me a Coffee</span>
                        </div>
                        <i className="fa-solid fa-arrow-up-right-from-square text-[10px] opacity-60" />
                      </a>

                      <a
                        href="https://www.reddit.com/r/FootballManagerSim/"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMoreMenuOpen(false)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F6F5F1] text-[#18191F] text-xs font-semibold transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <i className="fa-brands fa-reddit text-[#FF4500] text-xs" />
                          <span>Reddit Community</span>
                        </div>
                        <span className="text-[10px] text-[#6B7280]">r/FootballManagerSim</span>
                      </a>
                    </div>

                    <div className="h-[1px] bg-[#E6E3DC] my-1.5" />

                    <div className="p-1 space-y-1">
                      <div className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider px-2">
                        Other Games
                      </div>
                      <a
                        href="https://basketballmanagersim.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMoreMenuOpen(false)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F6F5F1] text-[#18191F] text-xs font-semibold transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <i className="fa-solid fa-basketball text-orange-500 text-xs" />
                          <span>Basketball Manager Sim</span>
                        </div>
                        <i className="fa-solid fa-arrow-up-right-from-square text-[10px] opacity-40" />
                      </a>
                      <a
                        href="https://handballmanagersim.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMoreMenuOpen(false)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F6F5F1] text-[#18191F] text-xs font-semibold transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <i className="fa-solid fa-volleyball text-sky-600 text-xs" />
                          <span>Handball Manager Sim</span>
                        </div>
                        <i className="fa-solid fa-arrow-up-right-from-square text-[10px] opacity-40" />
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Compact 5-Tab Workspace Strip */}
        {hasActiveGame && viewMode === 'game' && onSelectTab && (
          <nav
            aria-label="Mobile workspace navigation"
            className="flex lg:hidden items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 pb-0.5 -mx-1 px-1"
          >
            {WORKSPACE_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectTab(tab.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 border ${
                    isActive
                      ? 'bg-[#18191F] text-white border-[#18191F] shadow-sm'
                      : 'bg-white text-[#4B5563] border-[#E6E3DC]'
                  }`}
                >
                  <i className={`fa-solid ${tab.icon} text-[10px]`} />
                  <span>{tab.shortLabel}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
};
