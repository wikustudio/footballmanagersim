import { GameState, GameEvent } from '../types';
import { getLeagueScaledVal, getLeagueScaledFans, getLeagueInfo, getDomesticCupInfo, formatMoney } from '../data/gameConstants';
import { getContinentalCupNames } from '../utils/regionHelpers';

export const generateMidSeasonEvent = (state: GameState): GameEvent | null => {
  const tier = state.club.tier;
  const clubCountry = state.club.country || 'GER';
  const avgOvr = getLeagueInfo(tier, clubCountry).avgOvr;
  const isRelegationBattle = state.club.baseOvr < avgOvr - 2;

  if (isRelegationBattle && Math.random() < 0.6) {
    const rRel = Math.random();
    if (rRel < 0.5) {
      return {
        id: 'event_' + Date.now(),
        type: 'relegation_fans',
        title: { en: 'HARDCORE FANS PROTEST', de: 'ULTRAS BLOCKIEREN TRAINING' },
        desc: { 
          en: 'Furious hardcore fans have blockaded the training ground demanding answers for the miserable first half of the season!', 
          de: 'Wütende Ultras haben das Trainingsgelände blockiert und fordern Erklärungen für die miserable Hinrunde!' 
        },
        opt1: {
          title: { en: 'Face them directly', de: 'Sich ihnen stellen' },
          goodPct: 50,
          goodTxt: { en: 'Fans pacified (+2 Morale)', de: 'Fans beruhigt (+2 Moral)' },
          badPct: 50,
          badTxt: { en: 'It escalates (-5 Morale, -1 OVR)', de: 'Es eskaliert (-5 Moral, -1 GES)' }
        },
        opt2: {
          title: { en: 'Call security', de: 'Sicherheitsdienst rufen' },
          goodPct: 100,
          goodTxt: { en: 'Training secured, but fans angry (-500 Fans)', de: 'Training gesichert, aber Fans wütend (-500 Fans)' },
        },
        extraData: {
          opt1Good: { morale: 2 },
          opt1Bad: { morale: -5, ovr: -1 },
          opt2Good: { fans: -500 }
        },
        isForced: true
      };
    } else {
      const prCost = getLeagueScaledVal(tier, 5000, clubCountry);
      const budgetPenalty = getLeagueScaledVal(tier, 25000, clubCountry);
      return {
        id: 'event_' + Date.now(),
        type: 'relegation_sponsors',
        title: { en: 'SPONSOR ULTIMATUM', de: 'SPONSOREN-ULTIMATUM' },
        desc: { 
          en: 'Your main sponsor is threatening to pull funding next season if performances do not drastically improve!', 
          de: 'Dein Hauptsponsor droht, die Gelder für nächste Saison zu streichen, wenn sich die Leistung nicht drastisch verbessert!' 
        },
        opt1: {
          title: { en: 'Reassure them (PR Cost)', de: 'Beruhigen (PR-Kosten)' },
          goodPct: 100,
          goodTxt: { 
            en: `Sponsor secured (-${formatMoney(prCost)})`, 
            de: `Sponsor gesichert (-${formatMoney(prCost)})` 
          },
        },
        opt2: {
          title: { en: 'Ignore them', de: 'Ignorieren' },
          goodPct: 100,
          goodTxt: { 
            en: `Budget cut (-${formatMoney(budgetPenalty)})`, 
            de: `Budgetkürzung (-${formatMoney(budgetPenalty)})` 
          },
        },
        cost: prCost,
        extraData: {
          opt1Cost: prCost,
          opt1Good: {},
          opt2Cost: 0,
          opt2Good: { budget: -budgetPenalty }
        },
        isForced: true
      };
    }
  }


  const r = Math.random();
  if (r < 0.25) {
    const surgeryCost = getLeagueScaledVal(tier, 2500, clubCountry);
    return {
      id: 'event_' + Date.now(),
      type: 'midseason_injury',
      title: { en: 'Winter Camp Injury', de: 'Trainingslager-Verletzung' },
      desc: { 
        en: 'A key starting player suffered a severe ligament injury during the winter training camp!', 
        de: 'Ein Leistungsträger hat sich im Winter-Trainingslager eine schwere Bänderverletzung zugezogen!' 
      },
      opt1: {
        title: { en: 'Fund Specialist Surgery', de: 'Spezialisten-OP finanzieren' },
        goodPct: 100,
        goodTxt: { 
          en: `Player Saved · 0 OVR Loss (-${formatMoney(surgeryCost)})`, 
          de: `Spieler gerettet · Kein GES-Verlust (-${formatMoney(surgeryCost)})` 
        },
      },
      opt2: {
        title: { en: 'Trust Squad Backups', de: 'Auf interne Ersatzspieler setzen' },
        goodPct: 100,
        goodTxt: { 
          en: 'Save Budget (€0) · Squad OVR -1', 
          de: 'Budget geschont (€0) · Kader GES -1' 
        },
      },
      cost: surgeryCost,
      extraData: {
        opt1Cost: surgeryCost,
        opt1Good: {},
        opt2Cost: 0,
        opt2Good: { ovr: -1 }
      },
      isForced: true
    };
  } else if (r < 0.5) {
    return {
      id: 'event_' + Date.now(),
      type: 'midseason_tactical_breakthrough',
      title: { en: 'Tactical Innovation', de: 'Taktik-Innovation' },
      desc: { 
        en: 'The winter break allowed your coaching staff to drill an advanced tactical system.', 
        de: 'Die Winterpause gab dem Trainerstab Zeit, ein anspruchsvolles taktisches System einzustudieren.' 
      },
      opt1: {
        title: { en: 'Deploy New System (Calculated Risk)', de: 'Neues System umsetzen (Risiko)' },
        goodPct: 50,
        goodTxt: { en: 'Tactical Breakthrough (+2 OVR)', de: 'Taktischer Durchbruch (+2 GES)' },
        badPct: 50,
        badTxt: { en: 'Tactical Confusion (-1 OVR)', de: 'Verwirrung im Team (-1 GES)' }
      },
      opt2: {
        title: { en: 'Maintain Current Tactics (Zero Risk)', de: 'Beim Bewährten bleiben (Sicher)' },
        goodPct: 100,
        goodTxt: { en: 'Stability preserved (0 OVR)', de: 'Stabilität bewahrt (0 GES)' },
      },
      extraData: {
        opt1Good: { ovr: 2 },
        opt1Bad: { ovr: -1 },
        opt2Good: {}
      },
      isForced: true
    };
  } else if (r < 0.8) {
    const tourPrize = getLeagueScaledVal(tier, 5000, clubCountry);
    return {
      id: 'event_' + Date.now(),
      type: 'midseason_sponsor_bonus',
      title: { en: 'Exhibition Tour Invitation', de: 'Einladung zum Winter-Turnier' },
      desc: { 
        en: 'An exotic sponsor invited you to a high-paying mid-season exhibition tournament in Dubai.', 
        de: 'Ein wohlhabender Sponsor lädt zu einem lukrativen Testspiel-Turnier nach Dubai ein.' 
      },
      opt1: {
        title: { en: 'Accept Tour (Cash vs Fatigue)', de: 'Einladung annehmen (Geld vs Ermüdung)' },
        goodPct: 100,
        goodTxt: { 
          en: `Earn Revenue (+${formatMoney(tourPrize)}) · Travel Fatigue (-1 OVR)`, 
          de: `Einnahmen (+${formatMoney(tourPrize)}) · Reisestress (-1 GES)` 
        },
      },
      opt2: {
        title: { en: 'Focus on Rest & Fitness', de: 'Fokus auf Erholung & Frische' },
        goodPct: 100,
        goodTxt: { 
          en: 'Preserve Full Fitness (0 OVR, +5 Morale)', 
          de: 'Volle Fitness erhalten (0 GES, +5 Moral)' 
        },
      },
      extraData: {
        opt1Good: { budget: tourPrize, ovr: -1 },
        opt2Good: { morale: 5 }
      },
      isForced: true
    };
  } else {
    return {
      id: 'event_' + Date.now(),
      type: 'midseason_calm',
      title: { en: 'WINTER BREAK', de: 'WINTERPAUSE' },
      desc: { 
        en: 'The first half of the season is over. The transfer window is open for crucial mid-season adjustments.', 
        de: 'Die Hinrunde ist beendet. Das Transferfenster ist für wichtige Anpassungen zur Saisonmitte geöffnet.' 
      },
      opt1: {
        title: { en: 'Continue', de: 'Weiter' },
        goodPct: 100,
        goodTxt: { en: 'Prepare for Second Half', de: 'Auf Second Half vorbereiten' },
      },
      isForced: true
    };
  }
};
