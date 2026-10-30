import { GameState, GameEvent } from '../types';
import { formatMoney, getLeagueScaledFans, getLeagueScaledVal, getDomesticCupInfo, isCanadianMLSClub, calculateClubFinancials, getLeagueInfo, isReserveClub } from './gameConstants';
import { getContinentalCupNames } from '../utils/regionHelpers';



export const getCupName = (cupId: string, clubCountry: string, tier: number, clubName?: string, clubId?: number): string => {
    if (cupId === 'cl') return getContinentalCupNames(clubCountry).cl;
    if (cupId === 'el') return getContinentalCupNames(clubCountry).el;
    if (cupId === 'ecl') return getContinentalCupNames(clubCountry).ecl;
    if (cupId === 'dfb') {
        const isCanadian = clubCountry === 'CAN' || isCanadianMLSClub(clubName, clubId, clubCountry);
        return getDomesticCupInfo(isCanadian ? 'CAN' : clubCountry, tier, clubName, clubId).name;
    }
    if (cupId === 'efl') return 'League Cup';
    if (cupId === 'reg') {
        if (clubCountry === 'TUR') return 'TFF 2. Lig Trophy';
        return 'Regional Cup';
    }
    return 'Regional Cup';
};

export const generateQuarterfinalEvent = (cupId: string, state: GameState): GameEvent => {
    const cupName = getCupName(cupId, state.club.country || 'GER', state.club.tier, state.club.name, state.club.id);
    return {
        id: 'qf_' + cupId + '_' + Date.now(),
        type: 'cup_quarterfinal',
        title: { en: `${cupName.toUpperCase()} QUARTERFINAL`, de: `${cupName.toUpperCase()}-VIERTELFINALE` },
        desc: {
          en: `You have drawn a significantly lower OVR team in the ${cupName} Quarterfinal. A great chance to rotate the squad or push for the Semi-Finals!`,
          de: `Dein Team wurde im ${cupName}-Viertelfinale gegen einen nominell schwächeren Gegner gelost. Eine tolle Chance, zu rotieren oder den Halbfinal-Einzug zu sichern!`,
        },
        opt1: {
          title: { en: 'Play the Reserves', de: 'Ersatzspieler einsetzen' },
          goodPct: 60,
          goodTxt: { en: 'Reserves got the win! (+10 Morale)', de: 'B-Elf gewinnt! (+10 Moral)' },
          badPct: 40,
          badTxt: { en: 'Embarrassing Upset! (-1 OVR, -10 Morale)', de: 'Blamables Aus! (-1 GES, -10 Moral)' },
        },
        opt2: {
          title: { en: 'Play Full Strength', de: 'Stammelf spielen lassen' },
          goodPct: 95,
          goodTxt: { en: 'Comfortable Win, but squad fatigued (-1 OVR)', de: 'Souveräner Sieg, aber Kader ermüdet (-1 GES)' },
          badPct: 5,
          badTxt: { en: 'Unbelievable choke (-2 OVR)', de: 'Unfassbare Blamage (-2 GES)' },
        },
        extraData: {
          opt1Good: { morale: 10, cupProgress: { id: cupId, status: 'SF' } },
          opt1Bad: { ovr: -1, morale: -10 },
          opt2Good: { ovr: -1, cupProgress: { id: cupId, status: 'SF' } },
          opt2Bad: { ovr: -2 },
        },
    };
};

export const generateSemifinalEvent = (cupId: string, state: GameState): GameEvent => {
    const cupName = getCupName(cupId, state.club.country || 'GER', state.club.tier, state.club.name, state.club.id);
    return {
      id: 'sf_' + cupId + '_' + Date.now(),
      type: 'cup_semifinal',
      title: { en: `${cupName.toUpperCase()} SEMI-FINAL`, de: `${cupName.toUpperCase()}-HALBFINALE` },
      desc: { 
         en: `Your team is on a magical run in the ${cupName} and reached the Semi-Final! Do you go all out for the final?`, 
         de: `Dein Team feiert eine magische Reise im ${cupName} und steht im Halbfinale! Riskierst du alles für den Einzug ins Finale?` 
       },
      opt1: {
        title: { en: 'Prioritize Cup', de: 'Pokal priorisieren' },
        goodPct: 60,
        goodTxt: { en: 'Reached Cup Final! (League OVR -1)', de: 'Pokalfinale erreicht! (Liga GES -1)' },
        badPct: 40,
        badTxt: { en: 'Knocked out & Form suffers (-2 OVR)', de: 'Ausgeschieden & Form leidet (-2 GES)' }
      },
      opt2: {
        title: { en: 'Focus on League', de: 'Fokus auf Liga' },
        goodPct: 100,
        goodTxt: { en: 'Cup exit, but League Form safe', de: 'Pokal-Aus, aber Liga-Form sicher' },
      },
      extraData: {
        opt1Good: { ovr: -1, cupProgress: { id: cupId, status: 'FINAL' } },
        opt1Bad: { ovr: -2 },
        opt2Good: {}
      },
      isForced: true
    };
};

export const generateRandomEvent = (currentState: GameState): GameEvent | null => {
    
    const tier = currentState.club.tier;
    const clubCountry = currentState.club.country || 'GER';
    const isEcuador = clubCountry === 'ECU';
    const isUsa = clubCountry === 'USA';

    // Dynamically scale event costs and rewards based on club tier
    const transferSale = getLeagueScaledVal(tier, 25000, clubCountry);
    const facilityCost = getLeagueScaledVal(tier, 5000, clubCountry);
    const starUnhappyCost = getLeagueScaledVal(tier, 3000, clubCountry);
    const sponsorSale = getLeagueScaledVal(tier, 12000, clubCountry);
    const pyroCost = getLeagueScaledVal(tier, 2000, clubCountry);
    const wonderkidCost = getLeagueScaledVal(tier, 4000, clubCountry);
    const namingSale = getLeagueScaledVal(tier, 18000, clubCountry);
    const ticketCost = getLeagueScaledVal(tier, 1500, clubCountry);
    const boardGrantVal = getLeagueScaledVal(tier, 8000, clubCountry);
    const seatsCost = getLeagueScaledVal(tier, 1500, clubCountry);
    const mascotVal = getLeagueScaledVal(tier, 3000, clubCountry);
    const cryptoProfit = getLeagueScaledVal(tier, 10000, clubCountry);
    const cryptoLoss = getLeagueScaledVal(tier, 4000, clubCountry);
    const moleCost = getLeagueScaledVal(tier, 2000, clubCountry);
    const molePostponedCost = getLeagueScaledVal(tier, 1000, clubCountry);
    const dramaVal = getLeagueScaledVal(tier, 2000, clubCountry);
    const sausageCost = getLeagueScaledVal(tier, 1000, clubCountry);
    const benefactorVal = getLeagueScaledVal(tier, 8000, clubCountry);
    const benefactorPitchCost = getLeagueScaledVal(tier, 2000, clubCountry);
    const varTeenCost = getLeagueScaledVal(tier, 500, clubCountry);
    const varSponsorVal = getLeagueScaledVal(tier, 2000, clubCountry);
    const taxAuditPay = getLeagueScaledVal(tier, 4000, clubCountry);
    const taxAuditCourtLoss = getLeagueScaledVal(tier, 8000, clubCountry);
    const taxAuditCourtWinFee = getLeagueScaledVal(tier, 1000, clubCountry);
    const injuryClinicCost = getLeagueScaledVal(tier, 3000, clubCountry);
    const ffpFineCost = getLeagueScaledVal(tier, 5000, clubCountry);
    const ffpSellVal = getLeagueScaledVal(tier, 4000, clubCountry);
    const safetyCost = getLeagueScaledVal(tier, 3500, clubCountry);
    const agentHoldoutCost = getLeagueScaledVal(tier, 3500, clubCountry);
    const agentHoldoutSale = getLeagueScaledVal(tier, 7500, clubCountry);
    const dopingLegalCost = getLeagueScaledVal(tier, 3000, clubCountry);
    const bettingFineCost = getLeagueScaledVal(tier, 5000, clubCountry);
    const bettingCourtLoss = getLeagueScaledVal(tier, 9000, clubCountry);
    const energySolarCost = getLeagueScaledVal(tier, 4000, clubCountry);
    const energySolarIncome = getLeagueScaledVal(tier, 1500, clubCountry);
    const staffMatchCost = getLeagueScaledVal(tier, 2500, clubCountry);
    const staffPoachComp = getLeagueScaledVal(tier, 4500, clubCountry);
    const youthFifaWin = getLeagueScaledVal(tier, 8000, clubCountry);
    const youthFifaFee = getLeagueScaledVal(tier, 1500, clubCountry);
    const youthPromoteCost = getLeagueScaledVal(tier, 2000, clubCountry);
    const youthFeeComp = getLeagueScaledVal(tier, 3500, clubCountry);
    const transferEmbargoPay = getLeagueScaledVal(tier, 4000, clubCountry);
    const squadRetreatCost = getLeagueScaledVal(tier, 2500, clubCountry);
    const sponsorBankruptSale = getLeagueScaledVal(tier, 5000, clubCountry);
    const sponsorCryptoCash = getLeagueScaledVal(tier, 7000, clubCountry);
    const scoutCost = getLeagueScaledVal(tier, 500, clubCountry);
    const rivalLiqCost = getLeagueScaledVal(tier, 1500, clubCountry);
    const sponsorScandalGain = getLeagueScaledVal(tier, 2500, clubCountry);
    const intlCallupCost = getLeagueScaledVal(tier, 800, clubCountry);
    const injuryWaveCost = getLeagueScaledVal(tier, 1200, clubCountry);
    const burnoutCost = getLeagueScaledVal(tier, 1000, clubCountry);
    const jerseyLeakGain = getLeagueScaledVal(tier, 3000, clubCountry);
    const transferLeakCost = getLeagueScaledVal(tier, 2000, clubCountry);
    const legendAmbassadorCost = getLeagueScaledVal(tier, 1500, clubCountry);


    let activeCupName = getDomesticCupInfo(clubCountry, tier).name;
    if (tier === 1 && currentState.euroStatus) {
       const contCups = getContinentalCupNames(clubCountry);
       if (currentState.euroStatus === 'CL') activeCupName = contCups.cl;
       else if (currentState.euroStatus === 'EL') activeCupName = contCups.el;
       else if (currentState.euroStatus === 'ECL') activeCupName = contCups.ecl;
    }

    const events: GameEvent[] = [
    // --- 100 NEW FUNNY EVENTS ---

    {
      type: 'funny_esports_injury_0',
      title: { en: 'GAMING INJURY', de: 'GAMING VERLETZUNG' },
      desc: { en: "Your star midfielder injured his thumb playing FC 26 all night.", de: "Dein Star-Mittelfeldspieler hat sich beim FC 26 spielen den Daumen verletzt." },
      opt1: { 
        title: { en: 'Send to Rehab', de: 'In die Reha' }, 
        goodPct: 70, 
        goodTxt: { en: `Fully recovered! (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +5 Morale)`, de: `Wieder fit! (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +5 Moral)` },
        badPct: 30,
        badTxt: { en: `Surgery needed! (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -1 OVR)`, de: `OP nötig! (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -1 GES)` }
      },
      opt2: { 
        title: { en: 'Ignore', de: 'Ignorieren' }, 
        goodPct: 100, 
        goodTxt: { en: 'He plays through pain (-1 OVR, -5 Morale)', de: 'Er spielt mit Schmerzen (-1 GES, -5 Moral)' } 
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt1Good: { morale: 5 },
        opt1Bad: { ovr: -1 },
        opt2Good: { ovr: -1, morale: -5 }
      }
    },
    {
      type: 'funny_crypto_scam_1',
      title: { en: 'CRYPTO RUGPULL', de: 'KRYPTO BETRUG' },
      desc: { en: "Your sleeve sponsor launched a shitcoin and vanished. Fans are furious.", de: "Dein Ärmelsponsor hat einen Shitcoin gestartet und ist verschwunden. Fans sind wütend." },
      opt1: { 
        title: { en: 'Sue them', de: 'Verklagen' }, 
        goodPct: 50, 
        goodTxt: { en: `Won the lawsuit! (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +2 Rep)`, de: `Prozess gewonnen! (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +2 Rep)` },
        badPct: 50,
        badTxt: { en: `Lawyers drained funds (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -2 Rep)`, de: `Anwälte waren teuer (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -2 Rep)` }
      },
      opt2: { 
        title: { en: 'Refund fans', de: 'Fans entschädigen' }, 
        goodPct: 100, 
        goodTxt: { en: `Fans appreciate it (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +5 Rep, +1000 Fans)`, de: `Fans sind dankbar (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +5 Rep, +1000 Fans)` } 
      },
      extraData: {
        opt1Good: { budget: getLeagueScaledVal(tier, 500, clubCountry), rep: 2 },
        opt1Bad: { rep: -2, budget: -getLeagueScaledVal(tier, 500, clubCountry) },
        opt2Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt2Good: { rep: 5, fans: getLeagueScaledFans(tier, 1000, clubCountry, tier) }
      }
    },
    {
      type: 'funny_tiktok_cancel_2',
      title: { en: 'TIKTOK CANCELLATION', de: 'TIKTOK SKANDAL' },
      desc: { en: "A player is cancelled for ranking pineapple pizza as S-Tier on TikTok.", de: "Ein Spieler wird gecancelt, weil er Pizza Hawaii auf TikTok lobt." },
      opt1: { 
        title: { en: 'Fine him', de: 'Geldstrafe' }, 
        goodPct: 100, 
        goodTxt: { en: `Statement made (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -10 Morale)`, de: `Zeichen gesetzt (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -10 Moral)` } 
      },
      opt2: { 
        title: { en: 'Support him', de: 'Unterstützen' }, 
        goodPct: 40, 
        goodTxt: { en: 'Pizza lovers unite! (+10 Morale, +500 Fans)', de: 'Pizza-Liebhaber vereint! (+500 Fans, +10 Moral)' },
        badPct: 60,
        badTxt: { en: 'Internet hates you (-500 Fans, -2 Rep)', de: 'Das Internet hasst dich (-500 Fans, -2 Rep)' }
      },
      extraData: {
        opt1Good: { budget: getLeagueScaledVal(tier, 500, clubCountry), morale: -10 },
        opt2Good: { fans: getLeagueScaledFans(tier, 500, clubCountry, tier), morale: 10 },
        opt2Bad: { rep: -2, fans: -getLeagueScaledFans(tier, 500, clubCountry, tier) }
      }
    },
    {
      type: 'funny_bus_lost_3',
      title: { en: 'BUS DRIVER LOST', de: 'BUSFAHRER VERIRRT' },
      desc: { en: "The team bus driver relied on Apple Maps and drove to the wrong stadium.", de: "Der Busfahrer hat sich auf Apple Maps verlassen und fuhr zum falschen Stadion." },
      opt1: { 
        title: { en: 'Hire Helicopter', de: 'Heli mieten' }, 
        goodPct: 80, 
        goodTxt: { en: `Arrived just in time (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +5 Morale)`, de: `Pünktlich angekommen (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +5 Moral)` },
        badPct: 20,
        badTxt: { en: `Heli delayed! Team is exhausted (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -1 OVR)`, de: `Heli verspätet! Team ist erschöpft (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -1 GES)` }
      },
      opt2: { 
        title: { en: 'Forfeit Match', de: 'Spiel aufgeben' }, 
        goodPct: 100, 
        goodTxt: { en: 'Embarrassing forfeit (-500 Fans, -3 Rep)', de: 'Peinliche Aufgabe (-500 Fans, -3 Rep)' } 
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt1Good: { morale: 5 },
        opt1Bad: { ovr: -1 },
        opt2Good: { rep: -3, fans: -getLeagueScaledFans(tier, 500, clubCountry, tier) }
      }
    },
    {
      type: 'funny_mascot_fight_4',
      title: { en: 'MASCOT BRAWL', de: 'MASKOTTCHEN SCHLÄGEREI' },
      desc: { en: "Your mascot dropkicked the away team mascot. Video went viral.", de: "Dein Maskottchen hat das gegnerische Maskottchen verprügelt. Video geht viral." },
      opt1: { 
        title: { en: 'Capitalize on merch', de: 'Merch verkaufen' }, 
        goodPct: 60, 
        goodTxt: { en: `Viral hit! (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +500 Fans)`, de: `Viraler Hit! (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +500 Fans)` },
        badPct: 40,
        badTxt: { en: 'Backlash! (-10 Morale, -2 Rep)', de: 'Shitstorm! (-2 Rep, -10 Moral)' }
      },
      opt2: { 
        title: { en: 'Fire mascot', de: 'Feuern' }, 
        goodPct: 100, 
        goodTxt: { en: 'Order restored (-5 Morale, +2 Rep)', de: 'Ordnung wiederhergestellt (+2 Rep, -5 Moral)' } 
      },
      extraData: {
        opt1Good: { budget: getLeagueScaledVal(tier, 500, clubCountry), fans: getLeagueScaledFans(tier, 500, clubCountry, tier) },
        opt1Bad: { rep: -2, morale: -10 },
        opt2Good: { rep: 2, morale: -5 }
      }
    },
    {
      type: 'funny_pitch_dog_5',
      title: { en: 'PITCH INVASION (DOG)', de: 'PLATZSTURM (HUND)' },
      desc: { en: "A local stray dog invaded the pitch and outdribbled your captain.", de: "Ein Straßenhund hat das Spielfeld gestürmt und deinen Kapitän ausgedribbelt." },
      opt1: { 
        title: { en: 'Adopt dog', de: 'Hund adoptieren' }, 
        goodPct: 80, 
        goodTxt: { en: 'Fans love the new mascot! (+10 Morale, +1000 Fans)', de: 'Fans lieben das neue Maskottchen! (+1000 Fans, +10 Moral)' },
        badPct: 20,
        badTxt: { en: 'Dog bit the manager (-5 Morale, -1 Rep)', de: 'Hund hat den Trainer gebissen (-1 Rep, -5 Moral)' }
      },
      opt2: { 
        title: { en: 'Fine security', de: 'Security bestrafen' }, 
        goodPct: 100, 
        goodTxt: { en: `Strict but fair (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -5 Morale)`, de: `Streng aber fair (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -5 Moral)` } 
      },
      extraData: {
        opt1Good: { fans: getLeagueScaledFans(tier, 1000, clubCountry, tier), morale: 10 },
        opt1Bad: { rep: -1, morale: -5 },
        opt2Good: { budget: getLeagueScaledVal(tier, 500, clubCountry), morale: -5 }
      }
    },
    {
      type: 'funny_sponsor_neon_6',
      title: { en: 'NEON KITS', de: 'NEON TRIKOTS' },
      desc: { en: "Sponsor demands the team wears blinding neon pink kits.", de: "Sponsor verlangt, dass das Team leuchtend pinke Trikots trägt." },
      opt1: { 
        title: { en: 'Accept', de: 'Annehmen' }, 
        goodPct: 50, 
        goodTxt: { en: `It became a cult classic! (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +500 Fans)`, de: `Ein Kult-Klassiker! (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +500 Fans)` },
        badPct: 50,
        badTxt: { en: 'Players hate it (-1 OVR, -2 Rep)', de: 'Spieler hassen es (-1 GES, -2 Rep)' }
      },
      opt2: { 
        title: { en: 'Refuse', de: 'Ablehnen' }, 
        goodPct: 100, 
        goodTxt: { en: `Integrity maintained (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +2 Rep)`, de: `Integrität gewahrt (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +2 Rep)` } 
      },
      extraData: {
        opt1Good: { budget: getLeagueScaledVal(tier, 500, clubCountry), fans: getLeagueScaledFans(tier, 500, clubCountry, tier) },
        opt1Bad: { budget: getLeagueScaledVal(tier, 500, clubCountry), ovr: -1, rep: -2 },
        opt2Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt2Good: { rep: 2 }
      }
    },
    {
      type: 'funny_diet_pasta_7',
      title: { en: 'PASTA BAN', de: 'NUDEL VERBOT' },
      desc: { en: "The new dietician banned pasta. The Italian players are threatening a strike.", de: "Der Ernährungsberater verbietet Nudeln. Die italienischen Spieler streiken." },
      opt1: { 
        title: { en: 'Fire dietician', de: 'Feuern' }, 
        goodPct: 100, 
        goodTxt: { en: `Happy Italians! (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +10 Morale)`, de: `Glückliche Italiener! (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +10 Moral)` } 
      },
      opt2: { 
        title: { en: 'Force diet', de: 'Durchsetzen' }, 
        goodPct: 60, 
        goodTxt: { en: 'Fitness improved! (+1 OVR, -5 Morale)', de: 'Fitness verbessert! (+1 GES, -5 Moral)' },
        badPct: 40,
        badTxt: { en: 'Mutiny! (-1 OVR, -15 Morale)', de: 'Meuterei! (-1 GES, -15 Moral)' }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt1Good: { morale: 10 },
        opt2Good: { ovr: 1, morale: -5 },
        opt2Bad: { ovr: -1, morale: -15 }
      }
    },
    {
      type: 'funny_trophy_drop_8',
      title: { en: 'TROPHY DROPPED', de: 'POKAL FALLENGELASSEN' },
      desc: { en: "The captain dropped a trophy from the open-top bus. It's crushed.", de: "Der Kapitän hat einen Pokal vom Bus fallen gelassen. Er ist zerstört." },
      opt1: { 
        title: { en: 'Pay repairs', de: 'Reparatur zahlen' }, 
        goodPct: 100, 
        goodTxt: { en: `Good as new (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})`, de: `Wie neu (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})` } 
      },
      opt2: { 
        title: { en: 'Blame driver', de: 'Fahrer beschuldigen' }, 
        goodPct: 40, 
        goodTxt: { en: 'Media bought it (-1 Rep)', de: 'Die Medien glauben es (-1 Rep)' },
        badPct: 60,
        badTxt: { en: 'Caught lying! (-10 Morale, -3 Rep)', de: 'Beim Lügen erwischt! (-3 Rep, -10 Moral)' }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt1Good: {},
        opt2Good: { rep: -1 },
        opt2Bad: { rep: -3, morale: -10 }
      }
    },
    {
      type: 'funny_horoscope_9',
      title: { en: 'MERCURY RETROGRADE', de: 'MERKUR RÜCKLÄUFIG' },
      desc: { en: "Star striker refuses to play because his horoscope says it's a bad day.", de: "Star-Stürmer weigert sich zu spielen, weil sein Horoskop schlecht ist." },
      opt1: { 
        title: { en: 'Fine him', de: 'Geldstrafe' }, 
        goodPct: 100, 
        goodTxt: { en: `Discipline enforced (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -10 Morale)`, de: `Disziplin durchgesetzt (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -10 Moral)` } 
      },
      opt2: { 
        title: { en: 'Bench him', de: 'Auf die Bank' }, 
        goodPct: 50, 
        goodTxt: { en: 'Backup scores a hattrick! (+1 OVR, +5 Morale)', de: 'Ersatz macht Hattrick! (+1 GES, +5 Moral)' },
        badPct: 50,
        badTxt: { en: 'Attack is toothless (-1 OVR, -1 Rep)', de: 'Angriff ist zahnlos (-1 GES, -1 Rep)' }
      },
      extraData: {
        opt1Good: { budget: getLeagueScaledVal(tier, 500, clubCountry), morale: -10 },
        opt2Good: { ovr: 1, morale: 5 },
        opt2Bad: { ovr: -1, rep: -1 }
      }
    },
    {
      type: 'funny_var_ipad_10',
      title: { en: 'VAR BROKEN', de: 'VAR KAPUTT' },
      desc: { en: "The VAR monitor broke. The ref is using a fan's iPad to check a penalty.", de: "VAR-Monitor kaputt. Der Schiri nutzt das iPad eines Fans." },
      opt1: { 
        title: { en: 'Bribe fan', de: 'Fan bestechen' }, 
        goodPct: 60, 
        goodTxt: { en: `Favorable angle found! (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +1 OVR)`, de: `Guter Winkel gefunden! (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +1 GES)` },
        badPct: 40,
        badTxt: { en: `Caught cheating! (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -3 Rep)`, de: `Beim Betrug erwischt! (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -3 Rep)` }
      },
      opt2: { 
        title: { en: 'Complain', de: 'Beschweren' }, 
        goodPct: 100, 
        goodTxt: { en: 'Fined for dissent (-5 Morale, -1 Rep)', de: 'Strafe wegen Meckerns (-1 Rep, -5 Moral)' } 
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt1Good: { ovr: 1 },
        opt1Bad: { rep: -3 },
        opt2Good: { rep: -1, morale: -5 }
      }
    },
    {
      type: 'funny_manager_sleep_11',
      title: { en: 'SLEEPING MANAGER', de: 'SCHLAFENDER TRAINER' },
      desc: { en: "You were caught taking a quick nap in the dugout during a boring 0-0.", de: "Du wurdest beim Schlafen auf der Bank erwischt (beim 0:0)." },
      opt1: { 
        title: { en: 'Say you were meditating', de: 'Ausrede: Meditation' }, 
        goodPct: 40, 
        goodTxt: { en: 'Tactical genius! (+2 Rep)', de: 'Taktisches Genie! (+2 Rep)' },
        badPct: 60,
        badTxt: { en: 'Meme of the week (-5 Morale, -2 Rep)', de: 'Meme der Woche (-5 Moral, -2 Rep)' }
      },
      opt2: { 
        title: { en: 'Apologize', de: 'Entschuldigen' }, 
        goodPct: 100, 
        goodTxt: { en: 'Honesty respected (-1 Rep)', de: 'Ehrlichkeit respektiert (-1 Rep)' } 
      },
      extraData: {
        opt1Good: { rep: 2 },
        opt1Bad: { rep: -2, morale: -5 },
        opt2Good: { rep: -1 }
      }
    },
    {
      type: 'funny_accidental_like_12',
      title: { en: 'ACCIDENTAL LIKE', de: 'VERSEHENTLICHER LIKE' },
      desc: { en: "Your winger accidentally liked a rival team's 'Welcome' post.", de: "Dein Flügelspieler hat versehentlich einen Post des Rivalen geliked." },
      opt1: { 
        title: { en: 'Fine him', de: 'Geldstrafe' }, 
        goodPct: 100, 
        goodTxt: { en: `Message sent (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -5 Morale)`, de: `Zeichen gesetzt (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -5 Moral)` } 
      },
      opt2: { 
        title: { en: 'Ignore', de: 'Ignorieren' }, 
        goodPct: 50, 
        goodTxt: { en: 'Drama fades away (No effect)', de: 'Drama verblasst (Kein Effekt)' },
        badPct: 50,
        badTxt: { en: 'Fans turn on him (-1 OVR, -500 Fans)', de: 'Fans wenden sich gegen ihn (-1 GES, -500 Fans)' }
      },
      extraData: {
        opt1Good: { budget: getLeagueScaledVal(tier, 500, clubCountry), morale: -5 },
        opt2Good: {},
        opt2Bad: { ovr: -1, fans: -getLeagueScaledFans(tier, 500, clubCountry, tier) }
      }
    },
    {
      type: 'funny_sprinklers_13',
      title: { en: 'SPRINKLER ATTACK', de: 'SPRINKLER ANGRIFF' },
      desc: { en: "The sprinklers went off during a counter-attack, ruining a 1v1.", de: "Sprinkler gingen beim Konter an und ruinierten ein 1-gegen-1." },
      opt1: { 
        title: { en: 'Sue groundsman', de: 'Platzwart verklagen' }, 
        goodPct: 70, 
        goodTxt: { en: `Settlement reached (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -1 Rep)`, de: `Vergleich erzielt (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -1 Rep)` },
        badPct: 30,
        badTxt: { en: `Lost case! Legal fees hurt (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -2 Rep)`, de: `Verloren! Anwaltskosten tun weh (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -2 Rep)` }
      },
      opt2: { 
        title: { en: 'Laugh it off', de: 'Darüber lachen' }, 
        goodPct: 100, 
        goodTxt: { en: 'Good vibes (+5 Morale, +1 Rep)', de: 'Gute Stimmung (+5 Moral, +1 Rep)' } 
      },
      extraData: {
        opt1Good: { budget: getLeagueScaledVal(tier, 500, clubCountry), rep: -1 },
        opt1Bad: { budget: -getLeagueScaledVal(tier, 500, clubCountry), rep: -2 },
        opt2Good: { morale: 5, rep: 1 }
      }
    },
    {
      type: 'funny_drone_14',
      title: { en: 'DRONE DELAY', de: 'DROHNEN UNTERBRECHUNG' },
      desc: { en: "A drone carrying a banner insulting the referee delayed the match.", de: "Eine Drohne mit Schiri-Beleidigung unterbrach das Spiel." },
      opt1: { 
        title: { en: 'Pay fine', de: 'Strafe zahlen' }, 
        goodPct: 100, 
        goodTxt: { en: `Issue resolved (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})`, de: `Problem gelöst (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})` } 
      },
      opt2: { 
        title: { en: "Claim it's art", de: 'Als Kunst deklarieren' }, 
        goodPct: 30, 
        goodTxt: { en: 'Hipsters love it! (+1000 Fans, +1 Rep)', de: 'Hipster lieben es! (+1000 Fans, +1 Rep)' },
        badPct: 70,
        badTxt: { en: 'FA is not amused (-10 Morale, -3 Rep)', de: 'Verband ist nicht amüsiert (-3 Rep, -10 Moral)' }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt1Good: {},
        opt2Good: { fans: getLeagueScaledFans(tier, 1000, clubCountry, tier), rep: 1 },
        opt2Bad: { rep: -3, morale: -10 }
      }
    },
    {
      type: 'funny_nepotism_15',
      title: { en: 'OWNER\'S SON', de: 'SOHN DES BESITZERS' },
      desc: { en: "The owner demands his 40-year-old son plays 10 minutes next match.", de: "Der Besitzer verlangt, dass sein 40-jähriger Sohn 10 Min. spielt." },
      opt1: { 
        title: { en: 'Play him', de: 'Spielen lassen' }, 
        goodPct: 50, 
        goodTxt: { en: `He actually scored! (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +5 Morale)`, de: `Er hat sogar getroffen! (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +5 Moral)` },
        badPct: 50,
        badTxt: { en: 'Total disaster (-1 OVR, -2 Rep)', de: 'Totales Desaster (-1 GES, -2 Rep)' }
      },
      opt2: { 
        title: { en: 'Refuse', de: 'Ablehnen' }, 
        goodPct: 100, 
        goodTxt: { en: `Integrity kept (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +1 OVR)`, de: `Integrität gewahrt (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +1 GES)` } 
      },
      extraData: {
        opt1Good: { budget: getLeagueScaledVal(tier, 500, clubCountry), morale: 5 },
        opt1Bad: { ovr: -1, rep: -2 },
        opt2Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt2Good: { ovr: 1 }
      }
    },
    {
      type: 'funny_crooked_lines_16',
      title: { en: 'CROOKED PITCH', de: 'SCHIEFE LINIEN' },
      desc: { en: "The groundskeeper painted the penalty box as an oval.", de: "Platzwart hat den Strafraum als Oval gemalt." },
      opt1: { 
        title: { en: 'Redo it', de: 'Neu machen' }, 
        goodPct: 100, 
        goodTxt: { en: `Pristine pitch again (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})`, de: `Wieder einwandfrei (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})` } 
      },
      opt2: { 
        title: { en: 'Play anyway', de: 'Trotzdem spielen' }, 
        goodPct: 40, 
        goodTxt: { en: 'Home advantage! Opponent confused (+1 OVR)', de: 'Heimvorteil! Gegner verwirrt (+1 GES)' },
        badPct: 60,
        badTxt: { en: 'Your strikers missed sitters (-1 OVR, -5 Morale)', de: 'Deine Stürmer verfehlen leere Tore (-1 GES, -5 Moral)' }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt1Good: {},
        opt2Good: { ovr: 1 },
        opt2Bad: { ovr: -1, morale: -5 }
      }
    },
    {
      type: 'funny_elevator_17',
      title: { en: 'ELEVATOR TRAP', de: 'AUFZUG FALLE' },
      desc: { en: "Three key players are trapped in the hotel elevator an hour before kickoff.", de: "3 Stammspieler stecken vor dem Spiel im Hotelaufzug fest." },
      opt1: { 
        title: { en: 'Call fire dept', de: 'Feuerwehr rufen' }, 
        goodPct: 80, 
        goodTxt: { en: `Rescued in time! (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +5 Morale)`, de: `Rechtzeitig gerettet! (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +5 Moral)` },
        badPct: 20,
        badTxt: { en: `Too late. They miss the game (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -1 OVR)`, de: `Zu spät. Sie verpassen das Spiel (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -1 GES)` }
      },
      opt2: { 
        title: { en: 'Play reserves', de: 'Reservisten spielen' }, 
        goodPct: 40, 
        goodTxt: { en: 'Youth steps up! (+1 OVR)', de: 'Jugend liefert ab! (+1 GES)' },
        badPct: 60,
        badTxt: { en: 'Crushing defeat (-1 OVR, -10 Morale)', de: 'Vernichtende Niederlage (-1 GES, -10 Moral)' }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt1Good: { morale: 5 },
        opt1Bad: { ovr: -1 },
        opt2Good: { ovr: 1 },
        opt2Bad: { ovr: -1, morale: -10 }
      }
    },
    {
      type: 'funny_rap_career_18',
      title: { en: 'RAP CAREER', de: 'RAP KARRIERE' },
      desc: { en: "Your winger released a terrible rap track and skipped training.", de: "Dein Spieler hat einen miesen Rap-Song released und Training geschwänzt." },
      opt1: { 
        title: { en: 'Fine him', de: 'Geldstrafe' }, 
        goodPct: 100, 
        goodTxt: { en: `Strict discipline (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -5 Morale)`, de: `Strenge Disziplin (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -5 Moral)` } 
      },
      opt2: { 
        title: { en: 'Promote song', de: 'Song promoten' }, 
        goodPct: 50, 
        goodTxt: { en: `It topped the charts! (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +500 Fans)`, de: `Platz 1 der Charts! (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +500 Fans)` },
        badPct: 50,
        badTxt: { en: 'Cringefest (-10 Morale, -2 Rep)', de: 'Cringe pur (-2 Rep, -10 Moral)' }
      },
      extraData: {
        opt1Good: { budget: getLeagueScaledVal(tier, 500, clubCountry), morale: -5 },
        opt2Good: { budget: getLeagueScaledVal(tier, 500, clubCountry), fans: getLeagueScaledFans(tier, 500, clubCountry, tier) },
        opt2Bad: { rep: -2, morale: -10 }
      }
    },
    {
      type: 'funny_goalpost_19',
      title: { en: 'SHORT GOALPOST', de: 'ZUKURZE PFOSTEN' },
      desc: { en: "The opposition complains your goalposts are 2 inches too short.", de: "Der Gegner beschwert sich, dass eure Tore 5cm zu klein sind." },
      opt1: { 
        title: { en: 'Fix it', de: 'Reparieren' }, 
        goodPct: 100, 
        goodTxt: { en: `Compliant (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})`, de: `Regelkonform (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})` } 
      },
      opt2: { 
        title: { en: 'Deny it', de: 'Leugnen' }, 
        goodPct: 30, 
        goodTxt: { en: 'FA drops the case (+1 Rep)', de: 'Verband lässt Klage fallen (+1 Rep)' },
        badPct: 70,
        badTxt: { en: 'Caught red-handed! Point deduction looming (-3 Rep)', de: 'Erwischt! Punktabzug droht (-3 Rep)' }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt1Good: {},
        opt2Good: { rep: 1 },
        opt2Bad: { rep: -3 }
      }
    },
    {
      type: 'funny_fire_alarm_20',
      title: { en: '3 AM FIRE ALARM', de: 'FEUERALARM 3 UHR' },
      desc: { en: "Rival fans pulled the fire alarm at the team hotel at 3 AM.", de: "Rivalisierende Fans haben nachts den Feueralarm im Hotel gezogen." },
      opt1: { 
        title: { en: 'Pay for extra sleep', de: 'Schlaf nachholen' }, 
        goodPct: 100, 
        goodTxt: { en: `Well rested (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +5 Morale)`, de: `Gut erholt (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +5 Moral)` } 
      },
      opt2: { 
        title: { en: 'Play tired', de: 'Müde spielen' }, 
        goodPct: 20, 
        goodTxt: { en: 'Angry adrenaline! (+1 OVR)', de: 'Wütendes Adrenalin! (+1 GES)' },
        badPct: 80,
        badTxt: { en: 'Sluggish performance (-1 OVR, -10 Morale)', de: 'Träge Leistung (-1 GES, -10 Moral)' }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt1Good: { morale: 5 },
        opt2Good: { ovr: 1 },
        opt2Bad: { ovr: -1, morale: -10 }
      }
    },
    {
      type: 'funny_bathwater_21',
      title: { en: 'BATHWATER SALES', de: 'BADEWASSER VERKAUF' },
      desc: { en: "Your star striker started selling his used bathwater to fans.", de: "Dein Star-Stürmer verkauft sein benutztes Badewasser an Fans." },
      opt1: { 
        title: { en: 'Take a cut', de: 'Anteil fordern' }, 
        goodPct: 50, 
        goodTxt: { en: `Lucrative side hustle (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -1 Rep)`, de: `Lukratives Geschäft (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -1 Rep)` },
        badPct: 50,
        badTxt: { en: `Health inspector fined you (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -3 Rep)`, de: `Gesundheitsamt schlägt zu (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -3 Rep)` }
      },
      opt2: { 
        title: { en: 'Ban it', de: 'Verbieten' }, 
        goodPct: 100, 
        goodTxt: { en: 'Sanity restored (-5 Morale)', de: 'Verstand wiederhergestellt (-5 Moral)' } 
      },
      extraData: {
        opt1Good: { budget: getLeagueScaledVal(tier, 500, clubCountry), rep: -1 },
        opt1Bad: { budget: -getLeagueScaledVal(tier, 500, clubCountry), rep: -3 },
        opt2Good: { morale: -5 }
      }
    },
    {
      type: 'funny_sponsor_bankrupt_22',
      title: { en: 'SPONSOR BANKRUPT', de: 'SPONSOR PLEITE' },
      desc: { en: "Your main sponsor's CEO fled to a non-extradition country.", de: "Der CEO eures Hauptsponsors ist ins Ausland geflohen." },
      opt1: { 
        title: { en: 'Cover losses', de: 'Verluste decken' }, 
        goodPct: 100, 
        goodTxt: { en: `Stable finances (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +2 Rep)`, de: `Stabile Finanzen (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +2 Rep)` } 
      },
      opt2: { 
        title: { en: 'Sell naming rights', de: 'Namen verkaufen' }, 
        goodPct: 40, 
        goodTxt: { en: `Mega deal signed! (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -1 Rep)`, de: `Mega-Deal! (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -1 Rep)` },
        badPct: 60,
        badTxt: { en: `Stadium is now "Toilet Bowl" (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -5 Rep)`, de: `Stadion heißt nun "Kloschüssel" (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -5 Rep)` }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt1Good: { rep: 2 },
        opt2Good: { budget: getLeagueScaledVal(tier, 500, clubCountry), rep: -1 },
        opt2Bad: { budget: -getLeagueScaledVal(tier, 500, clubCountry), rep: -5 }
      }
    },
    {
      type: 'funny_tennis_balls_23',
      title: { en: 'TENNIS BALLS', de: 'TENNISBÄLLE' },
      desc: { en: "Fans protested ticket prices by throwing 5,000 tennis balls on pitch.", de: "Fans warfen aus Protest gegen Ticketpreise 5.000 Tennisbälle aufs Feld." },
      opt1: { 
        title: { en: 'Lower prices', de: 'Preise senken' }, 
        goodPct: 100, 
        goodTxt: { en: `Fans are happy (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +1000 Fans)`, de: `Fans sind glücklich (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +1000 Fans)` } 
      },
      opt2: { 
        title: { en: 'Keep prices', de: 'Preise behalten' }, 
        goodPct: 30, 
        goodTxt: { en: 'Protests fade (-100 Fans)', de: 'Proteste verblassen (-100 Fans)' },
        badPct: 70,
        badTxt: { en: 'Empty stadium! (-10 Morale, -1000 Fans)', de: 'Leeres Stadion! (-1000 Fans, -10 Moral)' }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt1Good: { fans: getLeagueScaledFans(tier, 1000, clubCountry, tier) },
        opt2Good: { fans: -getLeagueScaledFans(tier, 100, clubCountry, tier) },
        opt2Bad: { fans: -getLeagueScaledFans(tier, 1000, clubCountry, tier), morale: -10 }
      }
    },
    {
      type: 'funny_choco_coins_24',
      title: { en: 'CHOCOLATE COINS', de: 'SCHOKOMÜNZEN' },
      desc: { en: "Fans threw chocolate coins to protest the billionaire owner.", de: "Fans warfen Schokomünzen, um gegen den Besitzer zu protestieren." },
      opt1: { 
        title: { en: 'Eat them', de: 'Essen' }, 
        goodPct: 60, 
        goodTxt: { en: 'Players got a sugar rush! (+1 OVR, -1 Rep)', de: 'Zuckerschock! (+1 GES, -1 Rep)' },
        badPct: 40,
        badTxt: { en: 'Food poisoning (-1 OVR, -10 Morale)', de: 'Lebensmittelvergiftung (-1 GES, -10 Moral)' }
      },
      opt2: { 
        title: { en: 'Ignore', de: 'Ignorieren' }, 
        goodPct: 100, 
        goodTxt: { en: 'Cleaned up quickly (-500 Fans)', de: 'Schnell aufgeräumt (-500 Fans)' } 
      },
      extraData: {
        opt1Good: { ovr: 1, rep: -1 },
        opt1Bad: { ovr: -1, morale: -10 },
        opt2Good: { fans: -getLeagueScaledFans(tier, 500, clubCountry, tier) }
      }
    },

    {
      type: 'funny_fake_news_25',
      title: { en: 'FAKE NEWS', de: 'FAKE NEWS' },
      desc: { en: "A rumor spread that your stadium is built on an ancient burial ground.", de: "Ein Gerücht besagt, euer Stadion sei auf einem alten Friedhof gebaut." },
      opt1: { 
        title: { en: 'Hire PR firm', de: 'PR Firma anheuern' }, 
        goodPct: 80, 
        goodTxt: { en: `Rumor debunked! (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +5 Morale)`, de: `Gerücht widerlegt! (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +5 Moral)` },
        badPct: 20,
        badTxt: { en: `PR made it worse (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -2 Rep)`, de: `PR machte alles schlimmer (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -2 Rep)` }
      },
      opt2: { 
        title: { en: 'Embrace the ghosts', de: 'Geister nutzen' }, 
        goodPct: 50, 
        goodTxt: { en: `Ghost tours sold out! (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +1000 Fans)`, de: `Geister-Touren ausverkauft! (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +1000 Fans)` },
        badPct: 50,
        badTxt: { en: 'Players are terrified (-1 OVR, -15 Morale)', de: 'Spieler sind verängstigt (-1 GES, -15 Moral)' }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt1Good: { morale: 5 },
        opt1Bad: { rep: -2 },
        opt2Good: { budget: getLeagueScaledVal(tier, 500, clubCountry), fans: getLeagueScaledFans(tier, 1000, clubCountry, tier) },
        opt2Bad: { ovr: -1, morale: -15 }
      }
    },
    {
      type: 'funny_panenka_26',
      title: { en: 'FAILED PANENKA', de: 'PANENKA FAIL' },
      desc: { en: "Your striker attempted a Panenka in the 90th min and the GK caught it standing.", de: "Panenka-Elfmeter in der 90. Minute. Torwart hielt ihn im Stehen." },
      opt1: { 
        title: { en: 'Publicly defend him', de: 'Öffentlich verteidigen' }, 
        goodPct: 40, 
        goodTxt: { en: 'Confidence boosted! (+1 OVR, +10 Morale)', de: 'Selbstvertrauen gestärkt! (+1 GES, +10 Moral)' },
        badPct: 60,
        badTxt: { en: 'Fans turn on you both (-500 Fans, -2 Rep)', de: 'Fans wenden sich gegen euch (-500 Fans, -2 Rep)' }
      },
      opt2: { 
        title: { en: 'Fine him', de: 'Geldstrafe' }, 
        goodPct: 100, 
        goodTxt: { en: `Message sent (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -10 Morale)`, de: `Zeichen gesetzt (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -10 Moral)` } 
      },
      extraData: {
        opt1Good: { ovr: 1, morale: 10 },
        opt1Bad: { fans: -getLeagueScaledFans(tier, 500, clubCountry, tier), rep: -2 },
        opt2Good: { budget: getLeagueScaledVal(tier, 500, clubCountry), morale: -10 }
      }
    },
    {
      type: 'funny_red_card_27',
      title: { en: 'RECORD RED CARD', de: 'REKORD ROT' },
      desc: { en: "Player got a straight red card 4 seconds after being subbed on.", de: "Spieler bekommt 4 Sekunden nach Einwechslung direkt Rot." },
      opt1: { 
        title: { en: 'Appeal the red', de: 'Einspruch einlegen' }, 
        goodPct: 20, 
        goodTxt: { en: `Miracle! Card rescinded (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +5 Morale)`, de: `Wunder! Karte annulliert (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +5 Moral)` },
        badPct: 80,
        badTxt: { en: `Appeal rejected. Wasted money (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -1 Rep)`, de: `Einspruch abgelehnt. Geldverschwendung (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -1 Rep)` }
      },
      opt2: { 
        title: { en: 'Sell him immediately', de: 'Sofort verkaufen' }, 
        goodPct: 100, 
        goodTxt: { en: `Toxic player removed (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -1 OVR)`, de: `Toxischer Spieler weg (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -1 GES)` } 
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt1Good: { morale: 5 },
        opt1Bad: { rep: -1 },
        opt2Good: { budget: getLeagueScaledVal(tier, 500, clubCountry), ovr: -1 }
      }
    },
    {
      type: 'funny_private_jet_28',
      title: { en: 'PRIVATE JET', de: 'PRIVATJET' },
      desc: { en: "Your stars took a private jet to Ibiza on a rest day and missed the flight back.", de: "Stars flogen am freien Tag nach Ibiza und verpassten den Rückflug." },
      opt1: { 
        title: { en: 'Charter a heli', de: 'Heli chartern' }, 
        goodPct: 100, 
        goodTxt: { en: `They made it (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})`, de: `Sie haben es geschafft (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})` } 
      },
      opt2: { 
        title: { en: 'Play without them', de: 'Ohne sie spielen' }, 
        goodPct: 30, 
        goodTxt: { en: 'Underdogs won! (+1 OVR, +2 Rep)', de: 'Underdogs gewinnen! (+1 GES, +2 Rep)' },
        badPct: 70,
        badTxt: { en: 'Heavy defeat (-1 OVR, -10 Morale)', de: 'Schwere Niederlage (-1 GES, -10 Moral)' }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt1Good: {},
        opt2Good: { ovr: 1, rep: 2 },
        opt2Bad: { ovr: -1, morale: -10 }
      }
    },
    {
      type: 'funny_kit_clash_29',
      title: { en: 'KIT CLASH', de: 'TRIKOT VERWECHSLUNG' },
      desc: { en: "Kitman forgot the away kits. You have to wear the opponent's training bibs.", de: "Zeugwart vergaß Auswärtstrikots. Ihr müsst Leibchen des Gegners tragen." },
      opt1: { 
        title: { en: 'Buy local kits', de: 'Lokale Trikots kaufen' }, 
        goodPct: 100, 
        goodTxt: { en: `Problem solved (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})`, de: `Problem gelöst (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})` } 
      },
      opt2: { 
        title: { en: 'Wear the bibs', de: 'Leibchen tragen' }, 
        goodPct: 50, 
        goodTxt: { en: 'Fans found it hilarious (+500 Fans)', de: 'Fans fanden es lustig (+500 Fans)' },
        badPct: 50,
        badTxt: { en: 'Humiliating look (-5 Morale, -2 Rep)', de: 'Demütigender Look (-5 Moral, -2 Rep)' }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt1Good: {},
        opt2Good: { fans: getLeagueScaledFans(tier, 500, clubCountry, tier) },
        opt2Bad: { rep: -2, morale: -5 }
      }
    },
    {
      type: 'funny_spider_30',
      title: { en: 'SPIDER IN BOOT', de: 'SPINNE IM SCHUH' },
      desc: { en: "Your winger found a huge spider in his boot and refuses to play.", de: "Flügelspieler fand riesige Spinne im Schuh und will nicht spielen." },
      opt1: { 
        title: { en: 'Buy new boots', de: 'Neue Schuhe kaufen' }, 
        goodPct: 100, 
        goodTxt: { en: `Crisis averted (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})`, de: `Krise abgewendet (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})` } 
      },
      opt2: { 
        title: { en: 'Force him', de: 'Zwingen' }, 
        goodPct: 20, 
        goodTxt: { en: 'He got over it (+5 Morale)', de: 'Er hat es überwunden (+5 Moral)' },
        badPct: 80,
        badTxt: { en: 'He fainted in the tunnel (-1 OVR)', de: 'Er ist im Tunnel in Ohnmacht gefallen (-1 GES)' }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt1Good: {},
        opt2Good: { morale: 5 },
        opt2Bad: { ovr: -1 }
      }
    },
    {
      type: 'funny_wag_drama_31',
      title: { en: 'WAG DRAMA', de: 'SPIELERFRAUEN DRAMA' },
      desc: { en: "Two players' wives are fighting on Twitter. The dressing room is divided.", de: "Spielerfrauen streiten auf Twitter. Die Kabine ist gespalten." },
      opt1: { 
        title: { en: 'Hire mediator', de: 'Mediator anheuern' }, 
        goodPct: 80, 
        goodTxt: { en: `Peace restored (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +5 Morale)`, de: `Frieden wiederhergestellt (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +5 Moral)` },
        badPct: 20,
        badTxt: { en: `Mediator made it worse (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -15 Morale)`, de: `Mediator machte es schlimmer (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -15 Moral)` }
      },
      opt2: { 
        title: { en: 'Ignore it', de: 'Ignorieren' }, 
        goodPct: 10, 
        goodTxt: { en: 'They sorted it out (No effect)', de: 'Haben sich vertragen (Kein Effekt)' },
        badPct: 90,
        badTxt: { en: 'Chemistry destroyed (-1 OVR, -20 Morale)', de: 'Chemie zerstört (-1 GES, -20 Moral)' }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt1Good: { morale: 5 },
        opt1Bad: { morale: -15 },
        opt2Good: {},
        opt2Bad: { ovr: -1, morale: -20 }
      }
    },
    {
      type: 'funny_frozen_pitch_32',
      title: { en: 'FROZEN PITCH', de: 'GEFRORENER PLATZ' },
      desc: { en: "Undersoil heating broke. The pitch is an ice rink.", de: "Rasenheizung kaputt. Der Platz ist eine Eisbahn." },
      opt1: { 
        title: { en: 'Emergency repair', de: 'Notfall-Reparatur' }, 
        goodPct: 100, 
        goodTxt: { en: `Fixed just in time (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})`, de: `Gerade noch repariert (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})` } 
      },
      opt2: { 
        title: { en: 'Play on ice', de: 'Auf Eis spielen' }, 
        goodPct: 40, 
        goodTxt: { en: 'Hilarious sliding goals! (+1000 Fans)', de: 'Lustige Rutsch-Tore! (+1000 Fans)' },
        badPct: 60,
        badTxt: { en: '3 players injured (-1 OVR, -2 Rep)', de: '3 Verletzte (-1 GES, -2 Rep)' }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt1Good: {},
        opt2Good: { fans: getLeagueScaledFans(tier, 1000, clubCountry, tier) },
        opt2Bad: { ovr: -1, rep: -2 }
      }
    },
    {
      type: 'funny_allergy_33',
      title: { en: 'GRASS ALLERGY', de: 'RASEN ALLERGIE' },
      desc: { en: "Your new £50m signing just discovered he's highly allergic to grass.", de: "Euer 50 Mio. Neuzugang ist extrem allergisch gegen Rasen." },
      opt1: { 
        title: { en: 'Buy allergy meds', de: 'Medikamente kaufen' }, 
        goodPct: 100, 
        goodTxt: { en: `He sneezes but plays (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})`, de: `Er niest, aber spielt (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})` } 
      },
      opt2: { 
        title: { en: 'Sell him back', de: 'Zurückverkaufen' }, 
        goodPct: 100, 
        goodTxt: { en: `Got half the money back (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -1 OVR)`, de: `Hälfte des Geldes zurück (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -1 GES)` } 
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt1Good: {},
        opt2Good: { budget: getLeagueScaledVal(tier, 500, clubCountry), ovr: -1 }
      }
    },
    {
      type: 'funny_nightclub_34',
      title: { en: 'NIGHTCLUB', de: 'NACHTCLUB' },
      desc: { en: "Whole squad caught leaving a nightclub at 5 AM on a matchday.", de: "Ganze Mannschaft morgens um 5 im Club erwischt (Spieltag)." },
      opt1: { 
        title: { en: 'Fine them all', de: 'Alle bestrafen' }, 
        goodPct: 100, 
        goodTxt: { en: `Bank balance looks great (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -15 Morale)`, de: `Kasse klingelt (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -15 Moral)` } 
      },
      opt2: { 
        title: { en: 'Join them', de: 'Mitfeiern' }, 
        goodPct: 30, 
        goodTxt: { en: 'Team bonding peak! (+10 Morale, -1 Rep)', de: 'Teambuilding! (+10 Moral, -1 Rep)' },
        badPct: 70,
        badTxt: { en: 'Lost 5-0 hungover (-2 OVR, -3 Rep)', de: 'Verkatert 0:5 verloren (-2 GES, -3 Rep)' }
      },
      extraData: {
        opt1Good: { budget: getLeagueScaledVal(tier, 500, clubCountry), morale: -15 },
        opt2Good: { morale: 10, rep: -1 },
        opt2Bad: { ovr: -2, rep: -3 }
      }
    },
    {
      type: 'funny_anthem_35',
      title: { en: 'WRONG ANTHEM', de: 'FALSCHE HYMNE' },
      desc: { en: "Stadium DJ played the Imperial March instead of the Champions League anthem.", de: "Stadion DJ spielte den Imperial March statt CL-Hymne." },
      opt1: { 
        title: { en: 'Fire DJ', de: 'DJ feuern' }, 
        goodPct: 100, 
        goodTxt: { en: `Professionalism restored (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})`, de: `Professionalität wiederhergestellt (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})` } 
      },
      opt2: { 
        title: { en: 'Embrace the dark side', de: 'Dunkle Seite nutzen' }, 
        goodPct: 80, 
        goodTxt: { en: 'Intimidated the opponent! (+1 OVR, +1000 Fans)', de: 'Gegner eingeschüchtert! (+1 GES, +1000 Fans)' },
        badPct: 20,
        badTxt: { en: `UEFA fined you (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -1 Rep)`, de: `UEFA Strafe (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -1 Rep)` }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt1Good: {},
        opt2Good: { ovr: 1, fans: getLeagueScaledFans(tier, 1000, clubCountry, tier) },
        opt2Bad: { budget: -getLeagueScaledVal(tier, 500, clubCountry), rep: -1 }
      }
    },
    {
      type: 'funny_passport_36',
      title: { en: 'FORGOT PASSPORT', de: 'PASS VERGESSEN' },
      desc: { en: "Your best player forgot his passport for the crucial away tie.", de: "Dein bester Spieler hat seinen Pass fürs Auswärtsspiel vergessen." },
      opt1: { 
        title: { en: 'Hire private courier', de: 'Kurier mieten' }, 
        goodPct: 90, 
        goodTxt: { en: `Passport arrived (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})`, de: `Pass ist da (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})` },
        badPct: 10,
        badTxt: { en: `Courier got stuck in traffic (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -1 OVR)`, de: `Kurier im Stau (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -1 GES)` }
      },
      opt2: { 
        title: { en: 'Play without him', de: 'Ohne ihn spielen' }, 
        goodPct: 20, 
        goodTxt: { en: 'Tactical masterclass! (+2 Rep)', de: 'Taktische Meisterleistung! (+2 Rep)' },
        badPct: 80,
        badTxt: { en: 'Missing key player hurt (-1 OVR, -5 Morale)', de: 'Fehlen des Spielers tat weh (-1 GES, -5 Moral)' }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt1Good: {},
        opt1Bad: { ovr: -1 },
        opt2Good: { rep: 2 },
        opt2Bad: { ovr: -1, morale: -5 }
      }
    },
    {
      type: 'funny_gloves_37',
      title: { en: 'LUCKY GLOVES', de: 'GLÜCKSHANDSCHUHE' },
      desc: { en: "Goalkeeper refuses to play without his lucky unwashed gloves from 2012.", de: "Torwart spielt nur mit seinen ungewaschenen Glückshandschuhen von 2012." },
      opt1: { 
        title: { en: 'Buy replicas', de: 'Replika kaufen' },
        goodPct: 60, 
        goodTxt: { en: `He didn't notice! (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +5 Morale)`, de: `Hat er nicht gemerkt! (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +5 Moral)` },
        badPct: 40,
        badTxt: { en: `He noticed and walked out (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -1 OVR)`, de: `Bemerkt und abgehauen (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -1 GES)` }
      },
      opt2: { 
        title: { en: 'Force him', de: 'Zwingen' }, 
        goodPct: 100, 
        goodTxt: { en: 'Authority established (-10 Morale)', de: 'Autorität bewiesen (-10 Moral)' } 
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt1Good: { morale: 5 },
        opt1Bad: { ovr: -1 },
        opt2Good: { morale: -10 }
      }
    },
    {
      type: 'funny_voice_38',
      title: { en: 'LOST VOICE', de: 'STIMME WEG' },
      desc: { en: "You lost your voice yelling. You must do the team talk in charades.", de: "Du hast deine Stimme verloren. Team-Ansprache per Scharade." },
      opt1: { 
        title: { en: 'Hire translator', de: 'Übersetzer mieten' }, 
        goodPct: 100, 
        goodTxt: { en: `Message delivered (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})`, de: `Nachricht übermittelt (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})` } 
      },
      opt2: { 
        title: { en: 'Mime wildly', de: 'Wild gestikulieren' }, 
        goodPct: 50, 
        goodTxt: { en: 'They somehow understood! (+1 OVR, +5 Morale)', de: 'Sie haben es kapiert! (+1 GES, +5 Moral)' },
        badPct: 50,
        badTxt: { en: 'Total confusion (-1 OVR)', de: 'Totales Chaos (-1 GES)' }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt1Good: {},
        opt2Good: { ovr: 1, morale: 5 },
        opt2Bad: { ovr: -1 }
      }
    },
    {
      type: 'funny_tiger_39',
      title: { en: 'PET TIGER', de: 'HAUSTIER TIGER' },
      desc: { en: "A player bought a tiger and it escaped near the training ground.", de: "Spieler hat einen Tiger gekauft, der am Trainingsgelände entlaufen ist." },
      opt1: { 
        title: { en: 'Hire hunters', de: 'Jäger anheuern' }, 
        goodPct: 100, 
        goodTxt: { en: `Tiger secured safely (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})`, de: `Tiger sicher eingefangen (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})` } 
      },
      opt2: { 
        title: { en: 'Cancel training', de: 'Training absagen' }, 
        goodPct: 100, 
        goodTxt: { en: 'Safety first (-1 OVR, -2 Rep)', de: 'Sicherheit zuerst (-1 GES, -2 Rep)' } 
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt1Good: {},
        opt2Good: { ovr: -1, rep: -2 }
      }
    },
    {
      type: 'funny_dog_tactics_40',
      title: { en: 'DOG ATE TACTICS', de: 'HUND FRISST TAKTIK' },
      desc: { en: "The club dog ate your tactical masterplan for the cup final.", de: "Der Vereinshund hat die Taktik fürs Finale gefressen." },
      opt1: { 
        title: { en: 'Improvise', de: 'Improvisieren' }, 
        goodPct: 30, 
        goodTxt: { en: 'Accidental genius! (+2 OVR, +2 Rep)', de: 'Zufälliges Genie! (+2 GES, +2 Rep)' },
        badPct: 70,
        badTxt: { en: 'Tactical disaster (-1 OVR, -10 Morale)', de: 'Taktisches Desaster (-1 GES, -10 Moral)' }
      },
      opt2: { 
        title: { en: 'Play basic 4-4-2', de: 'Klassisches 4-4-2' }, 
        goodPct: 100, 
        goodTxt: { en: 'Boring but safe (-500 Fans)', de: 'Langweilig aber sicher (-500 Fans)' } 
      },
      extraData: {
        opt1Good: { ovr: 2, rep: 2 },
        opt1Bad: { ovr: -1, morale: -10 },
        opt2Good: { fans: -getLeagueScaledFans(tier, 500, clubCountry, tier) }
      }
    },
    {
      type: 'funny_own_goal_41',
      title: { en: '40 YARD OWN GOAL', de: 'EIGENTOR 40M' },
      desc: { en: "Your CB scored a 40-yard volley... into his own net.", de: "Dein Innenverteidiger hat ein 40m-Traumtor gemacht... ins eigene Netz." },
      opt1: { 
        title: { en: 'Fine him', de: 'Geldstrafe' }, 
        goodPct: 100, 
        goodTxt: { en: `Harsh but fair (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -10 Morale)`, de: `Hart aber fair (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -10 Moral)` } 
      },
      opt2: { 
        title: { en: 'Protect him', de: 'Schützen' }, 
        goodPct: 70, 
        goodTxt: { en: 'Squad unity grows (+10 Morale, -1 Rep)', de: 'Teamgeist wächst (+10 Moral, -1 Rep)' },
        badPct: 30,
        badTxt: { en: 'Media calls you soft (-2 Rep)', de: 'Medien nennen dich weich (-2 Rep)' }
      },
      extraData: {
        opt1Good: { budget: getLeagueScaledVal(tier, 500, clubCountry), morale: -10 },
        opt2Good: { morale: 10, rep: -1 },
        opt2Bad: { rep: -2 }
      }
    },
    {
      type: 'funny_bitcoin_42',
      title: { en: 'BITCOIN CONTRACT', de: 'BITCOIN VERTRAG' },
      desc: { en: "A player wants his contract paid entirely in Dogecoin.", de: "Ein Spieler will sein Gehalt komplett in Dogecoin." },
      opt1: { 
        title: { en: 'Pay lawyers to fix', de: 'Anwälte bezahlen' }, 
        goodPct: 100, 
        goodTxt: { en: `Normal contract signed (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})`, de: `Normaler Vertrag (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})` } 
      },
      opt2: { 
        title: { en: 'Pay him in crypto', de: 'In Krypto zahlen' }, 
        goodPct: 50, 
        goodTxt: { en: `Coin crashed, saved money! (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -5 Morale)`, de: `Coin crasht, Geld gespart! (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -5 Moral)` },
        badPct: 50,
        badTxt: { en: `Coin mooned, club is broke! (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -2 Rep)`, de: `Coin pumpt, Club ist pleite! (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -2 Rep)` }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt1Good: {},
        opt2Good: { budget: getLeagueScaledVal(tier, 500, clubCountry), morale: -5 },
        opt2Bad: { budget: -getLeagueScaledVal(tier, 500, clubCountry), rep: -2 }
      }
    },
    {
      type: 'funny_protestors_43',
      title: { en: 'CLIMATE PROTEST', de: 'KLIMA PROTEST' },
      desc: { en: "Climate protestors glued themselves to the goalposts.", de: "Klima-Aktivisten haben sich an die Pfosten geklebt." },
      opt1: { 
        title: { en: 'Pay to dissolve glue', de: 'Lösungsmittel kaufen' }, 
        goodPct: 100, 
        goodTxt: { en: `Game resumes (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})`, de: `Spiel geht weiter (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})` } 
      },
      opt2: { 
        title: { en: 'Play around them', de: 'Drum herum spielen' }, 
        goodPct: 30, 
        goodTxt: { en: 'They acted as extra defenders! (+1 OVR)', de: 'Waren wie extra Verteidiger! (+1 GES)' },
        badPct: 70,
        badTxt: { en: 'Match abandoned (-1000 Fans, -3 Rep)', de: 'Spiel abgebrochen (-1000 Fans, -3 Rep)' }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt1Good: {},
        opt2Good: { ovr: 1 },
        opt2Bad: { rep: -3, fans: -getLeagueScaledFans(tier, 1000, clubCountry, tier) }
      }
    },
    {
      type: 'funny_rival_alarm_44',
      title: { en: 'RIVAL PRANK', de: 'RIVALEN STREICH' },
      desc: { en: "Rival fans locked your dressing room from the outside.", de: "Gegnerische Fans haben eure Kabine von außen abgeschlossen." },
      opt1: { 
        title: { en: 'Call locksmith', de: 'Schlüsseldienst' }, 
        goodPct: 80, 
        goodTxt: { en: `Out just in time (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})`, de: `Gerade rechtzeitig (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})` },
        badPct: 20,
        badTxt: { en: `Too late, forfeited match (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -2 Rep)`, de: `Zu spät, Spiel verloren (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -2 Rep)` }
      },
      opt2: { 
        title: { en: 'Break door', de: 'Tür eintreten' }, 
        goodPct: 100, 
        goodTxt: { en: 'Aggressive but effective (+5 Morale, -2 Rep)', de: 'Aggressiv aber effektiv (-2 Rep, +5 Moral)' } 
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt1Good: {},
        opt1Bad: { rep: -2 },
        opt2Good: { rep: -2, morale: 5 }
      }
    },
    {
      type: 'funny_celebration_tear_45',
      title: { en: 'CELEBRATION INJURY', de: 'JUBEL VERLETZUNG' },
      desc: { en: "GK saved a penalty but tore his hamstring doing a backflip.", de: "Torwart hielt Elfer, riss sich aber beim Salto-Jubel den Muskel." },
      opt1: { 
        title: { en: 'Surgery', de: 'OP zahlen' }, 
        goodPct: 100, 
        goodTxt: { en: `He will recover (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})`, de: `Er wird wieder fit (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})` } 
      },
      opt2: { 
        title: { en: 'Rest him', de: 'Pausieren' }, 
        goodPct: 40, 
        goodTxt: { en: 'Natural healing worked (+10 Morale)', de: 'Natürliche Heilung klappt (+10 Moral)' },
        badPct: 60,
        badTxt: { en: 'Out for the season (-1 OVR, -10 Morale)', de: 'Saisonaus (-1 GES, -10 Moral)' }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt1Good: {},
        opt2Good: { morale: 10 },
        opt2Bad: { ovr: -1, morale: -10 }
      }
    },
    {
      type: 'funny_nft_46',
      title: { en: 'NFT CRASH', de: 'NFT CRASH' },
      desc: { en: "Players invested in NFTs and lost everything. Morale is zero.", de: "Spieler haben in NFTs investiert und alles verloren. Moral ist im Keller." },
      opt1: { 
        title: { en: 'Bail them out', de: 'Freikaufen' }, 
        goodPct: 100, 
        goodTxt: { en: `Expensive lesson learned (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +15 Morale)`, de: `Teure Lektion gelernt (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +15 Moral)` } 
      },
      opt2: { 
        title: { en: 'Laugh at them', de: 'Auslachen' }, 
        goodPct: 10, 
        goodTxt: { en: 'Tough love worked (+1 OVR)', de: 'Harte Liebe wirkt (+1 GES)' },
        badPct: 90,
        badTxt: { en: 'Squad mutiny! (-2 OVR, -20 Morale)', de: 'Meuterei! (-2 GES, -20 Moral)' }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt1Good: { morale: 15 },
        opt2Good: { ovr: 1 },
        opt2Bad: { ovr: -2, morale: -20 }
      }
    },
    {
      type: 'funny_mcdonalds_47',
      title: { en: 'FAST FOOD', de: 'FAST FOOD' },
      desc: { en: "Star spotted eating 4 Big Macs 2 hours before kickoff.", de: "Star wurde 2 Stunden vorm Spiel mit 4 Burgern gesehen." },
      opt1: { 
        title: { en: 'Fine him', de: 'Geldstrafe' }, 
        goodPct: 100, 
        goodTxt: { en: `Discipline enforced (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -5 Morale)`, de: `Disziplin durchgesetzt (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -5 Moral)` } 
      },
      opt2: { 
        title: { en: 'Hope he plays well', de: 'Hoffen, dass er gut spielt' }, 
        goodPct: 50, 
        goodTxt: { en: 'McHattrick! (+1 OVR, +2 Rep)', de: 'McHattrick! (+1 GES, +2 Rep)' },
        badPct: 50,
        badTxt: { en: 'Threw up on pitch (-1 OVR, -3 Rep)', de: 'Auf Spielfeld gespuckt (-1 GES, -3 Rep)' }
      },
      extraData: {
        opt1Good: { budget: getLeagueScaledVal(tier, 500, clubCountry), morale: -5 },
        opt2Good: { ovr: 1, rep: 2 },
        opt2Bad: { ovr: -1, rep: -3 }
      }
    },
    {
      type: 'funny_toilet_phone_48',
      title: { en: 'PHONE IN TOILET', de: 'HANDY IM KLO' },
      desc: { en: "Winger dropped phone in toilet, missed the tactical meeting.", de: "Flügelspieler verpasste Taktik-Meeting wegen Handy im Klo." },
      opt1: { 
        title: { en: 'Fine him', de: 'Geldstrafe' }, 
        goodPct: 100, 
        goodTxt: { en: `No excuses (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -5 Morale)`, de: `Keine Ausreden (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -5 Moral)` } 
      },
      opt2: { 
        title: { en: 'Bench him', de: 'Auf die Bank' }, 
        goodPct: 50, 
        goodTxt: { en: 'Youth player shined! (+1 OVR)', de: 'Jugendspieler glänzt! (+1 GES)' },
        badPct: 50,
        badTxt: { en: 'Lost without him (-1 OVR, -1 Rep)', de: 'Verloren ohne ihn (-1 GES, -1 Rep)' }
      },
      extraData: {
        opt1Good: { budget: getLeagueScaledVal(tier, 500, clubCountry), morale: -5 },
        opt2Good: { ovr: 1 },
        opt2Bad: { ovr: -1, rep: -1 }
      }
    },
    {
      type: 'funny_flat_earth_49',
      title: { en: 'FLAT EARTH', de: 'FLACHERDE' },
      desc: { en: "Striker revealed he is a flat-earther on a huge podcast.", de: "Stürmer outete sich im Podcast als Flacherdler." },
      opt1: { 
        title: { en: 'Hire PR team', de: 'PR Team anheuern' }, 
        goodPct: 100, 
        goodTxt: { en: `Damage controlled (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})`, de: `Schaden begrenzt (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})` } 
      },
      opt2: { 
        title: { en: 'Sell flat-earth merch', de: 'Flacherd-Merch verkaufen' }, 
        goodPct: 40, 
        goodTxt: { en: `Huge sales! (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +1000 Fans)`, de: `Riesige Verkäufe! (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +1000 Fans)` },
        badPct: 60,
        badTxt: { en: `Sponsors pulled out (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -3 Rep)`, de: `Sponsoren steigen aus (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -3 Rep)` }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt1Good: {},
        opt2Good: { budget: getLeagueScaledVal(tier, 500, clubCountry), fans: getLeagueScaledFans(tier, 1000, clubCountry, tier) },
        opt2Bad: { budget: -getLeagueScaledVal(tier, 500, clubCountry), rep: -3 }
      }
    },
        {
      type: 'funny_vr_headsets_50',
      title: { en: 'VR PREMATCH', de: 'VR AUFWÄRMEN' },
      desc: { en: "Sponsor demands players wear VR headsets during the warmup.", de: "Sponsor verlangt VR-Brillen beim Aufwärmen." },
      opt1: { 
        title: { en: 'Accept', de: 'Annehmen' }, 
        goodPct: 30, 
        goodTxt: { en: `Futuristic viral hit! (+${formatMoney(getLeagueScaledVal(tier, 5000, clubCountry))}, +50 Fans, +2 Rep)`, de: `Futuristischer Hit! (+${formatMoney(getLeagueScaledVal(tier, 5000, clubCountry))}, +50 Fans, +2 Rep)` },
        badPct: 70,
        badTxt: { en: 'Two players got motion sickness (-1 OVR, -10 Morale)', de: 'Zwei Spieler haben Motion Sickness (-1 GES, -10 Moral)' }
      },
      opt2: { 
        title: { en: 'Refuse', de: 'Ablehnen' }, 
        goodPct: 100, 
        goodTxt: { en: `Lost sponsor money (-${formatMoney(getLeagueScaledVal(tier, 2000, clubCountry))}, +5 Morale, +1 Rep)`, de: `Sponsorengeld verloren (-${formatMoney(getLeagueScaledVal(tier, 2000, clubCountry))}, +5 Moral, +1 Rep)` } 
      },
      extraData: {
        opt1Good: { budget: getLeagueScaledVal(tier, 5000, clubCountry), fans: getLeagueScaledFans(tier, 50, clubCountry, tier), rep: 2 },
        opt1Bad: { ovr: -1, morale: -10 },
        opt2Cost: getLeagueScaledVal(tier, 2000, clubCountry),
        opt2Good: { morale: 5, rep: 1 }
      }
    },
    {
      type: 'funny_traffic_51',
      title: { en: 'STUCK IN TRAFFIC', de: 'IM STAU' },
      desc: { en: "Half the team got stuck behind a tractor on the way to the game.", de: "Halbes Team steckte hinter einem Traktor im Stau." },
      opt1: { 
        title: { en: 'Hire Heli', de: 'Heli mieten' }, 
        goodPct: 60, 
        goodTxt: { en: `Arrived in style! (-${formatMoney(getLeagueScaledVal(tier, 5000, clubCountry))}, +10 Morale, +1 Rep)`, de: `Stilvoll gelandet! (-${formatMoney(getLeagueScaledVal(tier, 5000, clubCountry))}, +10 Moral, +1 Rep)` },
        badPct: 40,
        badTxt: { en: `Pilot got lost (-${formatMoney(getLeagueScaledVal(tier, 5000, clubCountry))}, -2 OVR, -15 Morale)`, de: `Pilot hat sich verirrt (-${formatMoney(getLeagueScaledVal(tier, 5000, clubCountry))}, -2 GES, -15 Moral)` }
      },
      opt2: { 
        title: { en: 'Walk it', de: 'Laufen' }, 
        goodPct: 30, 
        goodTxt: { en: `Great warm-up! (+5 Morale, +50 Fans)`, de: `Tolles Aufwärmen! (+5 Moral, +50 Fans)` },
        badPct: 70,
        badTxt: { en: 'Exhausted before kickoff (-2 OVR, -5 Morale)', de: 'Erschöpft vorm Anpfiff (-2 GES, -5 Moral)' }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 5000, clubCountry),
        opt1Good: { morale: 10, rep: 1 },
        opt1Bad: { ovr: -2, morale: -15 },
        opt2Good: { morale: 5, fans: getLeagueScaledFans(tier, 50, clubCountry, tier) },
        opt2Bad: { ovr: -2, morale: -5 }
      }
    },
    {
      type: 'funny_bad_haircut_52',
      title: { en: 'BAD HAIRCUT', de: 'SCHLECHTER HAARSCHNITT' },
      desc: { en: "Midfielder cut his own hair. It's so bad teammates can't stop laughing.", de: "Mittelfeldspieler schnitt sich selbst die Haare. Team lacht sich kaputt." },
      opt1: { 
        title: { en: 'Shave it off', de: 'Glatze rasieren' }, 
        goodPct: 50, 
        goodTxt: { en: 'Looks intimidating now! (+1 OVR, +5 Morale)', de: 'Sieht jetzt furchteinflößend aus! (+1 GES, +5 Moral)' },
        badPct: 50,
        badTxt: { en: 'He misses his curls (-1 OVR, -10 Morale)', de: 'Er vermisst seine Locken (-1 GES, -10 Moral)' }
      },
      opt2: { 
        title: { en: 'Make it a trend', de: 'Zum Trend machen' }, 
        goodPct: 40, 
        goodTxt: { en: `Fans love it! (+${formatMoney(getLeagueScaledVal(tier, 2000, clubCountry))}, +100 Fans)`, de: `Fans lieben es! (+${formatMoney(getLeagueScaledVal(tier, 2000, clubCountry))}, +100 Fans)` },
        badPct: 60,
        badTxt: { en: 'He gets mocked online (-15 Morale, -1 Rep)', de: 'Wird im Netz verspottet (-15 Moral, -1 Rep)' }
      },
      extraData: {
        opt1Good: { ovr: 1, morale: 5 },
        opt1Bad: { ovr: -1, morale: -10 },
        opt2Good: { budget: getLeagueScaledVal(tier, 2000, clubCountry), fans: getLeagueScaledFans(tier, 100, clubCountry, tier) },
        opt2Bad: { morale: -15, rep: -1 }
      }
    },
    {
      type: 'funny_bicycle_kick_53',
      title: { en: 'BICYCLE KICK KO', de: 'FALLRÜCKZIEHER KO' },
      desc: { en: "Defender tried a bicycle kick and knocked out the referee.", de: "Verteidiger versuchte Fallrückzieher und knockte Schiri aus." },
      opt1: { 
        title: { en: 'Apologize profusely', de: 'Ausführlich entschuldigen' }, 
        goodPct: 70, 
        goodTxt: { en: `Fine paid, ref forgives (-${formatMoney(getLeagueScaledVal(tier, 3000, clubCountry))}, +1 Rep)`, de: `Strafe gezahlt, Schiri verzeiht (-${formatMoney(getLeagueScaledVal(tier, 3000, clubCountry))}, +1 Rep)` },
        badPct: 30,
        badTxt: { en: `Ref holds a grudge (-${formatMoney(getLeagueScaledVal(tier, 3000, clubCountry))}, -1 OVR, -10 Morale)`, de: `Schiri ist nachtragend (-${formatMoney(getLeagueScaledVal(tier, 3000, clubCountry))}, -1 GES, -10 Moral)` }
      },
      opt2: { 
        title: { en: 'Claim he dived', de: 'Schwalbe reklamieren' }, 
        goodPct: 20, 
        goodTxt: { en: 'Pundits agree, it was soft! (+50 Fans, +1 Rep)', de: 'Experten stimmen zu, war harmlos! (+50 Fans, +1 Rep)' },
        badPct: 80,
        badTxt: { en: `Massive FA fine (-${formatMoney(getLeagueScaledVal(tier, 8000, clubCountry))}, -2 Rep)`, de: `Riesige Verbandsstrafe (-${formatMoney(getLeagueScaledVal(tier, 8000, clubCountry))}, -2 Rep)` }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 3000, clubCountry),
        opt1Good: { rep: 1 },
        opt1Bad: { ovr: -1, morale: -10 },
        opt2Good: { fans: getLeagueScaledFans(tier, 50, clubCountry, tier), rep: 1 },
        opt2Bad: { budget: -getLeagueScaledVal(tier, 8000, clubCountry), rep: -2 }
      }
    },
    {
      type: 'funny_water_bottle_54',
      title: { en: 'ESPRESSO BOTTLE', de: 'ESPRESSO FLASCHE' },
      desc: { en: "GK drank from opponents bottle. It was pure espresso. He's hyper.", de: "Keeper trank aus Gegnerflasche. Purer Espresso. Er ist hyperaktiv." },
      opt1: { 
        title: { en: 'Let him play', de: 'Spielen lassen' }, 
        goodPct: 40, 
        goodTxt: { en: 'Insane reflexes! (+2 OVR, +10 Morale)', de: 'Irre Reflexe! (+2 GES, +10 Moral)' },
        badPct: 60,
        badTxt: { en: 'He chased a butterfly out of the box (-2 OVR, -15 Morale)', de: 'Jagt Schmetterling aus dem Strafraum (-2 GES, -15 Moral)' }
      },
      opt2: { 
        title: { en: 'Bench him', de: 'Auf die Bank' }, 
        goodPct: 100, 
        goodTxt: { en: 'Safe but boring (-1 OVR, -5 Morale)', de: 'Sicher aber langweilig (-1 GES, -5 Moral)' } 
      },
      extraData: {
        opt1Good: { ovr: 2, morale: 10 },
        opt1Bad: { ovr: -2, morale: -15 },
        opt2Good: { ovr: -1, morale: -5 }
      }
    },
    {
      type: 'funny_corner_flag_55',
      title: { en: 'FLAG FIGHT', de: 'ECKFÄHNCHEN KAMPF' },
      desc: { en: "Captain got into a shouting match with a corner flag after tripping.", de: "Kapitän schrie eine Eckfahne an, nachdem er stolperte." },
      opt1: { 
        title: { en: 'Sell merch of it', de: 'Merch verkaufen' }, 
        goodPct: 60, 
        goodTxt: { en: `Viral hit! (+${formatMoney(getLeagueScaledVal(tier, 4000, clubCountry))}, +100 Fans)`, de: `Viraler Hit! (+${formatMoney(getLeagueScaledVal(tier, 4000, clubCountry))}, +100 Fans)` },
        badPct: 40,
        badTxt: { en: `It backfired horribly (-${formatMoney(getLeagueScaledVal(tier, 2000, clubCountry))}, -15 Morale)`, de: `Ging nach hinten los (-${formatMoney(getLeagueScaledVal(tier, 2000, clubCountry))}, -15 Moral)` }
      },
      opt2: { 
        title: { en: 'Send to therapist', de: 'Zum Therapeuten' }, 
        goodPct: 100, 
        goodTxt: { en: `He made peace with the flag (-${formatMoney(getLeagueScaledVal(tier, 1500, clubCountry))}, +10 Morale)`, de: `Hat Frieden mit der Fahne geschlossen (-${formatMoney(getLeagueScaledVal(tier, 1500, clubCountry))}, +10 Moral)` } 
      },
      extraData: {
        opt1Good: { budget: getLeagueScaledVal(tier, 4000, clubCountry), fans: getLeagueScaledFans(tier, 100, clubCountry, tier) },
        opt1Bad: { budget: -getLeagueScaledVal(tier, 2000, clubCountry), morale: -15 },
        opt2Cost: getLeagueScaledVal(tier, 1500, clubCountry),
        opt2Good: { morale: 10 }
      }
    },
    {
      type: 'funny_gps_bra_56',
      title: { en: 'NO GPS BRA', de: 'KEIN GPS BH' },
      desc: { en: "Striker refuses to wear the GPS tracker 'bra' because it ruins his vibe.", de: "Stürmer weigert sich den GPS-Tracker-BH zu tragen. Zerstört seinen Vibe." },
      opt1: { 
        title: { en: 'Force him', de: 'Zwingen' }, 
        goodPct: 50, 
        goodTxt: { en: 'He scored and flexed it (+1 OVR, +50 Fans)', de: 'Traf und zeigte ihn stolz (+1 GES, +50 Fans)' },
        badPct: 50,
        badTxt: { en: 'He threw a tantrum (-1 OVR, -15 Morale)', de: 'Er bekam einen Wutanfall (-1 GES, -15 Moral)' }
      },
      opt2: { 
        title: { en: 'Let it slide', de: 'Durchgehen lassen' }, 
        goodPct: 100, 
        goodTxt: { en: 'No data, but hes happy (-1 OVR, +10 Morale)', de: 'Keine Daten, aber glücklich (-1 GES, +10 Moral)' } 
      },
      extraData: {
        opt1Good: { ovr: 1, fans: getLeagueScaledFans(tier, 50, clubCountry, tier) },
        opt1Bad: { ovr: -1, morale: -15 },
        opt2Good: { ovr: -1, morale: 10 }
      }
    },
    {
      type: 'funny_fm_teamtalk_57',
      title: { en: 'FM DISTRACTION', de: 'FM ABLENKUNG' },
      desc: { en: "Caught a player playing Football Manager during your team talk.", de: "Spieler beim Football Manager spielen während deiner Ansprache erwischt." },
      opt1: { 
        title: { en: 'Take his advice', de: 'Seinen Rat annehmen' }, 
        goodPct: 40, 
        goodTxt: { en: 'Tactical genius! (+2 OVR, +10 Morale)', de: 'Taktisches Genie! (+2 GES, +10 Moral)' },
        badPct: 60,
        badTxt: { en: 'Lost the locker room (-2 OVR, -20 Morale)', de: 'Kabine verloren (-2 GES, -20 Moral)' }
      },
      opt2: { 
        title: { en: 'Confiscate laptop', de: 'Laptop einkassieren' }, 
        goodPct: 100, 
        goodTxt: { en: 'Authority maintained (+5 Morale, +1 Rep)', de: 'Autorität bewahrt (+5 Moral, +1 Rep)' } 
      },
      extraData: {
        opt1Good: { ovr: 2, morale: 10 },
        opt1Bad: { ovr: -2, morale: -20 },
        opt2Good: { morale: 5, rep: 1 }
      }
    },
    {
      type: 'funny_pants_split_58',
      title: { en: 'SPLIT PANTS', de: 'GERISSENE HOSE' },
      desc: { en: "Your pants split open while celebrating a goal on the touchline.", de: "Deine Hose riss beim Torjubel an der Seitenlinie auf." },
      opt1: { 
        title: { en: 'Own it', de: 'Dazu stehen' }, 
        goodPct: 60, 
        goodTxt: { en: `Underwear brand sponsored you! (+${formatMoney(getLeagueScaledVal(tier, 6000, clubCountry))}, +100 Fans)`, de: `Unterwäsche-Sponsor zahlt! (+${formatMoney(getLeagueScaledVal(tier, 6000, clubCountry))}, +100 Fans)` },
        badPct: 40,
        badTxt: { en: 'Embarrassing memes (-15 Morale, -2 Rep)', de: 'Peinliche Memes (-15 Moral, -2 Rep)' }
      },
      opt2: { 
        title: { en: 'Hide in dugout', de: 'Verstecken' }, 
        goodPct: 100, 
        goodTxt: { en: 'Team laughed it off (+10 Morale)', de: 'Team nahm es mit Humor (+10 Moral)' } 
      },
      extraData: {
        opt1Good: { budget: getLeagueScaledVal(tier, 6000, clubCountry), fans: getLeagueScaledFans(tier, 100, clubCountry, tier) },
        opt1Bad: { morale: -15, rep: -2 },
        opt2Good: { morale: 10 }
      }
    },
    {
      type: 'funny_bus_clamped_59',
      title: { en: 'BUS CLAMPED', de: 'BUS GEKRALLT' },
      desc: { en: "Team bus got clamped by an overly aggressive traffic warden.", de: "Teambus wurde von einem aggressiven Polizisten mit Parkkralle versehen." },
      opt1: { 
        title: { en: 'Pay the fine', de: 'Strafe zahlen' }, 
        goodPct: 100, 
        goodTxt: { en: `On our way (-${formatMoney(getLeagueScaledVal(tier, 2000, clubCountry))}, +5 Morale)`, de: `Auf gehts (-${formatMoney(getLeagueScaledVal(tier, 2000, clubCountry))}, +5 Moral)` }
      },
      opt2: { 
        title: { en: 'Bribe him with merch', de: 'Mit Merch bestechen' }, 
        goodPct: 40, 
        goodTxt: { en: 'He let us go! (+10 Morale)', de: 'Er ließ uns fahren! (+10 Moral)' },
        badPct: 60,
        badTxt: { en: `Arrested! Massive legal fees (-${formatMoney(getLeagueScaledVal(tier, 8000, clubCountry))}, -15 Morale, -2 Rep)`, de: `Verhaftet! Hohe Anwaltskosten (-${formatMoney(getLeagueScaledVal(tier, 8000, clubCountry))}, -15 Moral, -2 Rep)` }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 2000, clubCountry),
        opt1Good: { morale: 5 },
        opt2Good: { morale: 10 },
        opt2Bad: { budget: -getLeagueScaledVal(tier, 8000, clubCountry), morale: -15, rep: -2 }
      }
    },
    {
      type: 'funny_mascot_tackle_60',
      title: { en: 'MASCOT TACKLE', de: 'MASKOTTCHEN GRÄTSCHE' },
      desc: { en: "Your mascot accidentally two-footed your best player during warmup.", de: "Dein Maskottchen hat deinen Star beim Aufwärmen umgegrätscht." },
      opt1: { 
        title: { en: 'Fire Mascot', de: 'Feuern' }, 
        goodPct: 50, 
        goodTxt: { en: 'Player is satisfied (+1 OVR, +5 Morale)', de: 'Spieler ist zufrieden (+1 GES, +5 Moral)' },
        badPct: 50,
        badTxt: { en: 'Fans loved the mascot (-100 Fans, -1 Rep)', de: 'Fans liebten das Maskottchen (-100 Fans, -1 Rep)' }
      },
      opt2: { 
        title: { en: 'Make a Joke', de: 'Als Witz verkaufen' }, 
        goodPct: 40, 
        goodTxt: { en: `Went viral! (+${formatMoney(getLeagueScaledVal(tier, 3000, clubCountry))}, +50 Fans)`, de: `Ging viral! (+${formatMoney(getLeagueScaledVal(tier, 3000, clubCountry))}, +50 Fans)` },
        badPct: 60,
        badTxt: { en: `Medical bills (-${formatMoney(getLeagueScaledVal(tier, 4000, clubCountry))}, -2 OVR, -15 Morale)`, de: `Arztkosten (-${formatMoney(getLeagueScaledVal(tier, 4000, clubCountry))}, -2 GES, -15 Moral)` }
      },
      extraData: {
        opt1Good: { ovr: 1, morale: 5 },
        opt1Bad: { fans: -getLeagueScaledFans(tier, 100, clubCountry, tier), rep: -1 },
        opt2Good: { budget: getLeagueScaledVal(tier, 3000, clubCountry), fans: getLeagueScaledFans(tier, 50, clubCountry, tier) },
        opt2Bad: { budget: -getLeagueScaledVal(tier, 4000, clubCountry), ovr: -2, morale: -15 }
      }
    },
    {
      type: 'funny_fifa_dispute_61',
      title: { en: 'FUT DISPUTE', de: 'FUT STREIT' },
      desc: { en: "Two players refuse to pass to each other over a FIFA 26 Ultimate Team dispute.", de: "Zwei Spieler passen sich nicht mehr den Ball (FIFA 26 Streit)." },
      opt1: { 
        title: { en: 'Buy them packs', de: 'Packs kaufen' }, 
        goodPct: 60, 
        goodTxt: { en: `They packed an Icon! (-${formatMoney(getLeagueScaledVal(tier, 1000, clubCountry))}, +15 Morale)`, de: `Icon gezogen! (-${formatMoney(getLeagueScaledVal(tier, 1000, clubCountry))}, +15 Moral)` },
        badPct: 40,
        badTxt: { en: `Terrible pack luck (-${formatMoney(getLeagueScaledVal(tier, 1000, clubCountry))}, -15 Morale)`, de: `Mieses Pack-Luck (-${formatMoney(getLeagueScaledVal(tier, 1000, clubCountry))}, -15 Moral)` }
      },
      opt2: { 
        title: { en: 'Fine them', de: 'Bestrafen' }, 
        goodPct: 100, 
        goodTxt: { en: `Discipline restored (+${formatMoney(getLeagueScaledVal(tier, 2000, clubCountry))}, -1 OVR, -10 Morale)`, de: `Disziplin wiederhergestellt (+${formatMoney(getLeagueScaledVal(tier, 2000, clubCountry))}, -1 GES, -10 Moral)` } 
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 1000, clubCountry),
        opt1Good: { morale: 15 },
        opt1Bad: { morale: -15 },
        opt2Good: { budget: getLeagueScaledVal(tier, 2000, clubCountry), ovr: -1, morale: -10 }
      }
    },
    {
      type: 'funny_mowing_62',
      title: { en: 'RUDE PITCH', de: 'UNVERSCHÄMTER RASEN' },
      desc: { en: "Groundskeeper mowed a giant middle finger into the pitch.", de: "Platzwart hat einen riesigen Mittelfinger in den Rasen gemäht." },
      opt1: { 
        title: { en: 'Repaint pitch', de: 'Übermalen' }, 
        goodPct: 100, 
        goodTxt: { en: `Disaster averted (-${formatMoney(getLeagueScaledVal(tier, 3000, clubCountry))}, +5 Morale)`, de: `Katastrophe abgewendet (-${formatMoney(getLeagueScaledVal(tier, 3000, clubCountry))}, +5 Moral)` }
      },
      opt2: { 
        title: { en: 'Leave it', de: 'Lassen' }, 
        goodPct: 30, 
        goodTxt: { en: 'Intimidated the opponents! (+1 OVR, +50 Fans)', de: 'Gegner eingeschüchtert! (+1 GES, +50 Fans)' },
        badPct: 70,
        badTxt: { en: `FA deduction (-${formatMoney(getLeagueScaledVal(tier, 6000, clubCountry))}, -2 Rep)`, de: `Verbandsstrafe (-${formatMoney(getLeagueScaledVal(tier, 6000, clubCountry))}, -2 Rep)` }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 3000, clubCountry),
        opt1Good: { morale: 5 },
        opt2Good: { ovr: 1, fans: getLeagueScaledFans(tier, 50, clubCountry, tier) },
        opt2Bad: { budget: -getLeagueScaledVal(tier, 6000, clubCountry), rep: -2 }
      }
    },
    {
      type: 'funny_bees_63',
      title: { en: 'BEE SWARM', de: 'BIENENSCHWARM' },
      desc: { en: "A swarm of bees settled on the crossbar, delaying the match.", de: "Ein Bienenschwarm saß auf der Latte, Spiel verzögert." },
      opt1: { 
        title: { en: 'Hire Beekeeper', de: 'Imker holen' }, 
        goodPct: 100, 
        goodTxt: { en: `Safely removed (-${formatMoney(getLeagueScaledVal(tier, 1000, clubCountry))}, +5 Morale)`, de: `Sicher entfernt (-${formatMoney(getLeagueScaledVal(tier, 1000, clubCountry))}, +5 Moral)` }
      },
      opt2: { 
        title: { en: 'GK clears them', de: 'Keeper klärt das' }, 
        goodPct: 20, 
        goodTxt: { en: 'Absolute madman! (+1 OVR, +100 Fans)', de: 'Absoluter Verrückter! (+1 GES, +100 Fans)' },
        badPct: 80,
        badTxt: { en: `Hospitalized (-${formatMoney(getLeagueScaledVal(tier, 3000, clubCountry))}, -2 OVR, -20 Morale)`, de: `Im Krankenhaus (-${formatMoney(getLeagueScaledVal(tier, 3000, clubCountry))}, -2 GES, -20 Moral)` }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 1000, clubCountry),
        opt1Good: { morale: 5 },
        opt2Good: { ovr: 1, fans: getLeagueScaledFans(tier, 100, clubCountry, tier) },
        opt2Bad: { budget: -getLeagueScaledVal(tier, 3000, clubCountry), ovr: -2, morale: -20 }
      }
    },
    {
      type: 'funny_bathroom_lock_64',
      title: { en: 'LOCKED IN', de: 'EINGESPERRT' },
      desc: { en: "Striker got locked in a stadium cubicle and missed the first half.", de: "Stürmer im Klo eingesperrt, verpasste 1. Halbzeit." },
      opt1: { 
        title: { en: 'Kick door down', de: 'Tür eintreten' }, 
        goodPct: 50, 
        goodTxt: { en: `Adrenaline rush! (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +2 OVR, +10 Morale)`, de: `Adrenalinkick! (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +2 GES, +10 Moral)` },
        badPct: 50,
        badTxt: { en: `Injured foot (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -2 OVR, -10 Morale)`, de: `Fuß verletzt (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -2 GES, -10 Moral)` }
      },
      opt2: { 
        title: { en: 'Wait for keys', de: 'Auf Schlüssel warten' }, 
        goodPct: 100, 
        goodTxt: { en: 'Subbed on late (-1 OVR, -5 Morale)', de: 'Spät eingewechselt (-1 GES, -5 Moral)' } 
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt1Good: { ovr: 2, morale: 10 },
        opt1Bad: { ovr: -2, morale: -10 },
        opt2Good: { ovr: -1, morale: -5 }
      }
    },
    {
      type: 'funny_aliens_65',
      title: { en: 'ALIEN ABDUCTION', de: 'ALIEN ENTFÜHRUNG' },
      desc: { en: "Player claims he missed training because he was abducted by aliens.", de: "Spieler fehlt beim Training: 'Wurde von Aliens entführt.'" },
      opt1: { 
        title: { en: 'Fine him', de: 'Bestrafen' }, 
        goodPct: 100, 
        goodTxt: { en: `No excuses! (+${formatMoney(getLeagueScaledVal(tier, 3000, clubCountry))}, -1 OVR, -15 Morale)`, de: `Keine Ausreden! (+${formatMoney(getLeagueScaledVal(tier, 3000, clubCountry))}, -1 GES, -15 Moral)` }
      },
      opt2: { 
        title: { en: 'Believe him', de: 'Ihm glauben' }, 
        goodPct: 30, 
        goodTxt: { en: 'He gained telepathy? (+3 OVR, +15 Morale)', de: 'Hat jetzt Telepathie? (+3 GES, +15 Moral)' },
        badPct: 70,
        badTxt: { en: 'Media laughs at you (-15 Morale, -2 Rep)', de: 'Medien lachen dich aus (-15 Moral, -2 Rep)' }
      },
      extraData: {
        opt1Good: { budget: getLeagueScaledVal(tier, 3000, clubCountry), ovr: -1, morale: -15 },
        opt2Good: { ovr: 3, morale: 15 },
        opt2Bad: { morale: -15, rep: -2 }
      }
    },
    {
      type: 'funny_3am_friendly_66',
      title: { en: '3 AM FRIENDLY', de: '3 UHR TESTSPIEL' },
      desc: { en: "Sponsor demands a 3 AM friendly to appeal to the Asian market.", de: "Sponsor fordert 3-Uhr-Testspiel für den asiatischen Markt." },
      opt1: { 
        title: { en: 'Play it', de: 'Spielen' }, 
        goodPct: 40, 
        goodTxt: { en: `Huge overseas fanbase! (+${formatMoney(getLeagueScaledVal(tier, 8000, clubCountry))}, +150 Fans, +1 Rep)`, de: `Riesige Fanbase! (+${formatMoney(getLeagueScaledVal(tier, 8000, clubCountry))}, +150 Fans, +1 Rep)` },
        badPct: 60,
        badTxt: { en: `Everyone fell asleep (+${formatMoney(getLeagueScaledVal(tier, 4000, clubCountry))}, -2 OVR, -20 Morale)`, de: `Alle eingeschlafen (+${formatMoney(getLeagueScaledVal(tier, 4000, clubCountry))}, -2 GES, -20 Moral)` }
      },
      opt2: { 
        title: { en: 'Refuse', de: 'Ablehnen' }, 
        goodPct: 100, 
        goodTxt: { en: `Sponsor furious (-${formatMoney(getLeagueScaledVal(tier, 5000, clubCountry))}, +10 Morale)`, de: `Sponsor wütend (-${formatMoney(getLeagueScaledVal(tier, 5000, clubCountry))}, +10 Moral)` } 
      },
      extraData: {
        opt1Good: { budget: getLeagueScaledVal(tier, 8000, clubCountry), fans: getLeagueScaledFans(tier, 150, clubCountry, tier), rep: 1 },
        opt1Bad: { budget: getLeagueScaledVal(tier, 4000, clubCountry), ovr: -2, morale: -20 },
        opt2Cost: getLeagueScaledVal(tier, 5000, clubCountry),
        opt2Good: { morale: 10 }
      }
    },
    {
      type: 'funny_standy_mcstandface_67',
      title: { en: 'ONLINE POLL', de: 'ONLINE UMFRAGE' },
      desc: { en: "Fans hijacked a poll to name the new stand 'Standy McStandface'.", de: "Fans wollen neue Tribüne 'Tribüni McTribünengesicht' nennen." },
      opt1: { 
        title: { en: 'Honor the vote', de: 'Ergebnis akzeptieren' }, 
        goodPct: 60, 
        goodTxt: { en: 'Meme magic! (+100 Fans, +1 Rep)', de: 'Meme-Magie! (+100 Fans, +1 Rep)' },
        badPct: 40,
        badTxt: { en: 'Sponsors pulled out (-15 Morale, -2 Rep)', de: 'Sponsoren sprangen ab (-15 Moral, -2 Rep)' }
      },
      opt2: { 
        title: { en: 'Rig it', de: 'Manipulieren' }, 
        goodPct: 100, 
        goodTxt: { en: 'Called it "Legends Stand" (-50 Fans, +1 Rep)', de: 'Heißt nun "Legenden" (-50 Fans, +1 Rep)' } 
      },
      extraData: {
        opt1Good: { fans: getLeagueScaledFans(tier, 100, clubCountry, tier), rep: 1 },
        opt1Bad: { morale: -15, rep: -2 },
        opt2Good: { fans: -getLeagueScaledFans(tier, 50, clubCountry, tier), rep: 1 }
      }
    },
    {
      type: 'funny_sun_glare_68',
      title: { en: 'BLINDING SUN', de: 'BLENDENDE SONNE' },
      desc: { en: "GK blinded by sun, concedes from 50 yards. Wants custom sunglasses.", de: "Keeper von Sonne geblendet, kassiert 50m-Tor. Will Sonnenbrille." },
      opt1: { 
        title: { en: 'Buy Oakley specs', de: 'Spezialbrille kaufen' }, 
        goodPct: 60, 
        goodTxt: { en: `New style icon! (-${formatMoney(getLeagueScaledVal(tier, 2000, clubCountry))}, +1 OVR, +15 Morale)`, de: `Neue Style-Ikone! (-${formatMoney(getLeagueScaledVal(tier, 2000, clubCountry))}, +1 GES, +15 Moral)` },
        badPct: 40,
        badTxt: { en: `They fell off (-${formatMoney(getLeagueScaledVal(tier, 2000, clubCountry))}, -1 OVR, -10 Morale)`, de: `Ist ihm runtergefallen (-${formatMoney(getLeagueScaledVal(tier, 2000, clubCountry))}, -1 GES, -10 Moral)` }
      },
      opt2: { 
        title: { en: 'Tell him to squint', de: 'Soll blinzeln' }, 
        goodPct: 100, 
        goodTxt: { en: 'He is furious (-1 OVR, -15 Morale)', de: 'Er tobt (-1 GES, -15 Moral)' } 
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 2000, clubCountry),
        opt1Good: { ovr: 1, morale: 15 },
        opt1Bad: { ovr: -1, morale: -10 },
        opt2Good: { ovr: -1, morale: -15 }
      }
    },
    {
      type: 'funny_podcast_leak_69',
      title: { en: 'PODCAST LEAK', de: 'PODCAST LEAK' },
      desc: { en: "Defenders new podcast accidentally leaked your tactical weaknesses.", de: "Neuer Podcast des Verteidigers hat taktische Schwächen geleakt." },
      opt1: { 
        title: { en: 'Ban Podcasts', de: 'Podcasts verbieten' }, 
        goodPct: 100, 
        goodTxt: { en: 'Focus returned (-1 OVR, -10 Morale)', de: 'Fokus zurück (-1 GES, -10 Moral)' }
      },
      opt2: { 
        title: { en: 'Use as misdirection', de: 'Als Täuschung nutzen' }, 
        goodPct: 40, 
        goodTxt: { en: 'Outsmarted everyone! (+2 OVR, +10 Morale, +2 Rep)', de: 'Alle überlistet! (+2 GES, +10 Moral, +2 Rep)' },
        badPct: 60,
        badTxt: { en: 'We got destroyed (-3 OVR, -20 Morale, -2 Rep)', de: 'Wurden zerstört (-3 GES, -20 Moral, -2 Rep)' }
      },
      extraData: {
        opt1Good: { ovr: -1, morale: -10 },
        opt2Good: { ovr: 2, morale: 10, rep: 2 },
        opt2Bad: { ovr: -3, morale: -20, rep: -2 }
      }
    },
    {
      type: 'funny_bedsheets_70',
      title: { en: 'BEDSHEET ESCAPE', de: 'BETTUCH FLUCHT' },
      desc: { en: "Player caught sneaking out of hotel using tied-up bedsheets.", de: "Spieler beim Rausklettern aus Hotel via Bettlaken erwischt." },
      opt1: { 
        title: { en: 'Fine him heavily', de: 'Hart bestrafen' }, 
        goodPct: 70, 
        goodTxt: { en: `Discipline set (+${formatMoney(getLeagueScaledVal(tier, 5000, clubCountry))}, -10 Morale)`, de: `Disziplin steht (+${formatMoney(getLeagueScaledVal(tier, 5000, clubCountry))}, -10 Moral)` },
        badPct: 30,
        badTxt: { en: `Squad revolts (+${formatMoney(getLeagueScaledVal(tier, 5000, clubCountry))}, -2 OVR, -25 Morale)`, de: `Kader rebelliert (+${formatMoney(getLeagueScaledVal(tier, 5000, clubCountry))}, -2 GES, -25 Moral)` }
      },
      opt2: { 
        title: { en: 'Praise his knot skills', de: 'Knoten loben' }, 
        goodPct: 30, 
        goodTxt: { en: 'Team bonding increased! (+1 OVR, +15 Morale)', de: 'Teambuilding! (+1 GES, +15 Moral)' },
        badPct: 70,
        badTxt: { en: 'Media calls you soft (-15 Morale, -2 Rep)', de: 'Medien nennen dich weich (-15 Moral, -2 Rep)' }
      },
      extraData: {
        opt1Good: { budget: getLeagueScaledVal(tier, 5000, clubCountry), morale: -10 },
        opt1Bad: { budget: getLeagueScaledVal(tier, 5000, clubCountry), ovr: -2, morale: -25 },
        opt2Good: { ovr: 1, morale: 15 },
        opt2Bad: { morale: -15, rep: -2 }
      }
    },
    {
      type: 'funny_perfume_71',
      title: { en: 'PERFUME INJURY', de: 'PARFÜM VERLETZUNG' },
      desc: { en: "Striker broke his toe dropping a heavy cologne bottle on it.", de: "Stürmer brach sich Zeh durch runtergefallene Parfümflasche." },
      opt1: { 
        title: { en: 'Magic Sponge', de: 'Wunderschwamm' }, 
        goodPct: 20, 
        goodTxt: { en: 'It actually worked! (+1 OVR, +5 Morale)', de: 'Es hat funktioniert! (+1 GES, +5 Moral)' },
        badPct: 80,
        badTxt: { en: 'He can barely walk (-2 OVR, -15 Morale)', de: 'Kann kaum laufen (-2 GES, -15 Moral)' }
      },
      opt2: { 
        title: { en: 'Send to specialist', de: 'Zum Spezialisten' }, 
        goodPct: 100, 
        goodTxt: { en: `He recovered (-${formatMoney(getLeagueScaledVal(tier, 4000, clubCountry))}, -1 OVR, +5 Morale)`, de: `Er hat sich erholt (-${formatMoney(getLeagueScaledVal(tier, 4000, clubCountry))}, -1 GES, +5 Moral)` } 
      },
      extraData: {
        opt1Good: { ovr: 1, morale: 5 },
        opt1Bad: { ovr: -2, morale: -15 },
        opt2Cost: getLeagueScaledVal(tier, 4000, clubCountry),
        opt2Good: { ovr: -1, morale: 5 }
      }
    },
    {
      type: 'funny_laxatives_72',
      title: { en: 'CHEF SABOTAGE', de: 'KOCH SABOTAGE' },
      desc: { en: "Chef accidentally used laxatives instead of salt for pre-match pasta.", de: "Koch hat Abführmittel statt Salz für Nudeln benutzt." },
      opt1: { 
        title: { en: 'Cancel Match', de: 'Spiel absagen' }, 
        goodPct: 100, 
        goodTxt: { en: `Massive fines, but survived (-${formatMoney(getLeagueScaledVal(tier, 15000, clubCountry))}, -2 Rep)`, de: `Hohe Strafe, aber überlebt (-${formatMoney(getLeagueScaledVal(tier, 15000, clubCountry))}, -2 Rep)` }
      },
      opt2: { 
        title: { en: 'Play through it', de: 'Durchziehen' }, 
        goodPct: 10, 
        goodTxt: { en: 'They ran very fast! (+3 OVR, +50 Fans)', de: 'Sie liefen extrem schnell! (+3 GES, +50 Fans)' },
        badPct: 90,
        badTxt: { en: 'An absolute disaster... (-3 OVR, -30 Morale, -3 Rep)', de: 'Eine absolute Katastrophe... (-3 GES, -30 Moral, -3 Rep)' }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 15000, clubCountry),
        opt1Good: { rep: -2 },
        opt2Good: { ovr: 3, fans: getLeagueScaledFans(tier, 50, clubCountry, tier) },
        opt2Bad: { ovr: -3, morale: -30, rep: -3 }
      }
    },
    {
      type: 'funny_kiss_dog_73',
      title: { en: 'KISS THE DOG', de: 'HUND GEKÜSST' },
      desc: { en: "Midfielder celebrated by kissing a fan's dog. Now he has a rash.", de: "Spieler küsste Fan-Hund beim Jubel. Hat jetzt Ausschlag." },
      opt1: { 
        title: { en: 'Steroid cream', de: 'Steroidcreme' }, 
        goodPct: 50, 
        goodTxt: { en: 'Cleared right up! (+1 OVR, +10 Morale)', de: 'Alles weg! (+1 GES, +10 Moral)' },
        badPct: 50,
        badTxt: { en: 'Allergic reaction! (-2 OVR, -15 Morale)', de: 'Allergische Reaktion! (-2 GES, -15 Moral)' }
      },
      opt2: { 
        title: { en: 'Adopt the dog', de: 'Hund adoptieren' }, 
        goodPct: 80, 
        goodTxt: { en: `New team mascot! (-${formatMoney(getLeagueScaledVal(tier, 1000, clubCountry))}, +20 Morale, +100 Fans)`, de: `Neues Maskottchen! (-${formatMoney(getLeagueScaledVal(tier, 1000, clubCountry))}, +20 Moral, +100 Fans)` },
        badPct: 20,
        badTxt: { en: `Dog bit the captain (-${formatMoney(getLeagueScaledVal(tier, 1000, clubCountry))}, -1 OVR, -20 Morale)`, de: `Hund biss Kapitän (-${formatMoney(getLeagueScaledVal(tier, 1000, clubCountry))}, -1 GES, -20 Moral)` }
      },
      extraData: {
        opt1Good: { ovr: 1, morale: 10 },
        opt1Bad: { ovr: -2, morale: -15 },
        opt2Cost: getLeagueScaledVal(tier, 1000, clubCountry),
        opt2Good: { morale: 20, fans: getLeagueScaledFans(tier, 100, clubCountry, tier) },
        opt2Bad: { ovr: -1, morale: -20 }
      }
    },
    {
      type: 'funny_vr_stuck_74',
      title: { en: 'VR TRAUMA', de: 'VR TRAUMA' },
      desc: { en: "Player got stuck in a VR horror game and is too traumatized to play.", de: "Spieler steckte in VR-Horrorspiel fest, ist traumatisiert." },
      opt1: { 
        title: { en: 'Therapy Session', de: 'Therapie' }, 
        goodPct: 70, 
        goodTxt: { en: `He overcame his fears (-${formatMoney(getLeagueScaledVal(tier, 3000, clubCountry))}, +1 OVR, +15 Morale)`, de: `Ängste überwunden (-${formatMoney(getLeagueScaledVal(tier, 3000, clubCountry))}, +1 GES, +15 Moral)` },
        badPct: 30,
        badTxt: { en: `Therapist quit (-${formatMoney(getLeagueScaledVal(tier, 3000, clubCountry))}, -2 OVR, -15 Morale)`, de: `Therapeut hat gekündigt (-${formatMoney(getLeagueScaledVal(tier, 3000, clubCountry))}, -2 GES, -15 Moral)` }
      },
      opt2: { 
        title: { en: 'Tell him to grow up', de: 'Er soll erwachsen werden' }, 
        goodPct: 20, 
        goodTxt: { en: 'Tough love worked! (+2 OVR, +5 Morale)', de: 'Harte Liebe wirkt! (+2 GES, +5 Moral)' },
        badPct: 80,
        badTxt: { en: 'He refused to leave bed (-2 OVR, -25 Morale)', de: 'Bleibt im Bett (-2 GES, -25 Moral)' }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 3000, clubCountry),
        opt1Good: { ovr: 1, morale: 15 },
        opt1Bad: { ovr: -2, morale: -15 },
        opt2Good: { ovr: 2, morale: 5 },
        opt2Bad: { ovr: -2, morale: -25 }
      }
    },
        {
      type: 'funny_vaping_mascot_75',
      title: { en: 'VAPING MASCOT', de: 'DAMPFENDES MASKOTTCHEN' },
      desc: { en: "Mascot caught vaping heavily inside the costume on live TV.", de: "Maskottchen beim Vapen im Kostüm im Live-TV erwischt." },
      opt1: { 
        title: { en: 'Fire Mascot', de: 'Feuern' }, 
        goodPct: 100, 
        goodTxt: { en: `New mascot hired (-${formatMoney(getLeagueScaledVal(tier, 2000, clubCountry))}, +5 Morale)`, de: `Neues Maskottchen (-${formatMoney(getLeagueScaledVal(tier, 2000, clubCountry))}, +5 Moral)` }
      },
      opt2: { 
        title: { en: 'Vape sponsor', de: 'Vape Sponsor' }, 
        goodPct: 30, 
        goodTxt: { en: `Lucrative deal! (+${formatMoney(getLeagueScaledVal(tier, 6000, clubCountry))}, -1 Rep)`, de: `Lukrativer Deal! (+${formatMoney(getLeagueScaledVal(tier, 6000, clubCountry))}, -1 Rep)` },
        badPct: 70,
        badTxt: { en: 'Parents complained! (-10 Morale, -100 Fans, -3 Rep)', de: 'Eltern beschweren sich! (-10 Moral, -100 Fans, -3 Rep)' }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 2000, clubCountry),
        opt1Good: { morale: 5 },
        opt2Good: { budget: getLeagueScaledVal(tier, 6000, clubCountry), rep: -1 },
        opt2Bad: { morale: -10, fans: -getLeagueScaledFans(tier, 100, clubCountry, tier), rep: -3 }
      }
    },
    {
      type: 'funny_space_clause_76',
      title: { en: 'SPACE CLAUSE', de: 'WELTRAUM KLAUSEL' },
      desc: { en: "Star player demands a clause letting him travel to space.", de: "Starspieler fordert Klausel für Weltraumreisen." },
      opt1: { 
        title: { en: 'Deny it', de: 'Ablehnen' }, 
        goodPct: 50, 
        goodTxt: { en: 'He accepted reality (-1 OVR, +5 Morale)', de: 'Er hat es akzeptiert (-1 GES, +5 Moral)' },
        badPct: 50,
        badTxt: { en: 'He is depressed (-2 OVR, -15 Morale)', de: 'Er ist deprimiert (-2 GES, -15 Moral)' }
      },
      opt2: { 
        title: { en: 'Sign it', de: 'Unterschreiben' }, 
        goodPct: 20, 
        goodTxt: { en: 'Elon Musk became a fan! (+500 Fans, +1 Rep)', de: 'Elon Musk ist jetzt Fan! (+500 Fans, +1 Rep)' },
        badPct: 80,
        badTxt: { en: `Legal fees (-${formatMoney(getLeagueScaledVal(tier, 5000, clubCountry))}, -2 Rep)`, de: `Anwaltskosten (-${formatMoney(getLeagueScaledVal(tier, 5000, clubCountry))}, -2 Rep)` }
      },
      extraData: {
        opt1Good: { ovr: -1, morale: 5 },
        opt1Bad: { ovr: -2, morale: -15 },
        opt2Good: { fans: getLeagueScaledFans(tier, 500, clubCountry, tier), rep: 1 },
        opt2Bad: { budget: -getLeagueScaledVal(tier, 5000, clubCountry), rep: -2 }
      }
    },
    {
      type: 'funny_singing_77',
      title: { en: 'BAD SINGING', de: 'SCHLECHTER GESANG' },
      desc: { en: "Initiation singing was so bad it broke a window.", de: "Einstandslied war so schlecht, dass ein Fenster zu Bruch ging." },
      opt1: { 
        title: { en: 'Pay for window', de: 'Fenster zahlen' }, 
        goodPct: 100, 
        goodTxt: { en: `Paid the glazier (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +5 Morale)`, de: `Glaser bezahlt (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +5 Moral)` }
      },
      opt2: { 
        title: { en: 'Post video', de: 'Video posten' }, 
        goodPct: 40, 
        goodTxt: { en: `Went viral! (+${formatMoney(getLeagueScaledVal(tier, 2000, clubCountry))}, +50 Fans)`, de: `Ging viral! (+${formatMoney(getLeagueScaledVal(tier, 2000, clubCountry))}, +50 Fans)` },
        badPct: 60,
        badTxt: { en: 'Player is furious (-1 OVR, -15 Morale)', de: 'Spieler ist wütend (-1 GES, -15 Moral)' }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt1Good: { morale: 5 },
        opt2Good: { budget: getLeagueScaledVal(tier, 2000, clubCountry), fans: getLeagueScaledFans(tier, 50, clubCountry, tier) },
        opt2Bad: { ovr: -1, morale: -15 }
      }
    },
    {
      type: 'funny_wrong_city_78',
      title: { en: 'WRONG CITY', de: 'FALSCHE STADT' },
      desc: { en: "New signing flew to the wrong city with the same name.", de: "Neuzugang flog in eine gleichnamige, falsche Stadt." },
      opt1: { 
        title: { en: 'Private jet', de: 'Privatjet' }, 
        goodPct: 100, 
        goodTxt: { en: `Rescued him (-${formatMoney(getLeagueScaledVal(tier, 8000, clubCountry))}, +5 Morale)`, de: `Ihn gerettet (-${formatMoney(getLeagueScaledVal(tier, 8000, clubCountry))}, +5 Moral)` }
      },
      opt2: { 
        title: { en: 'Let him drive', de: 'Ihn fahren lassen' }, 
        goodPct: 20, 
        goodTxt: { en: 'Bonded with fans on the way! (+10 Morale, +50 Fans)', de: 'Hat Fans auf dem Weg getroffen! (+10 Moral, +50 Fans)' },
        badPct: 80,
        badTxt: { en: 'Missed the match (-1 OVR, -20 Morale)', de: 'Verpasste das Spiel (-1 GES, -20 Moral)' }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 8000, clubCountry),
        opt1Good: { morale: 5 },
        opt2Good: { morale: 10, fans: getLeagueScaledFans(tier, 50, clubCountry, tier) },
        opt2Bad: { ovr: -1, morale: -20 }
      }
    },
    {
      type: 'funny_rollercoaster_79',
      title: { en: 'STUCK UPSIDE DOWN', de: 'KOPFÜBER FESTGESTECKT' },
      desc: { en: "Team got stuck upside down on a rollercoaster for 3 hours.", de: "Team steckte 3 Stunden kopfüber in Achterbahn fest." },
      opt1: { 
        title: { en: 'Sue theme park', de: 'Freizeitpark verklagen' }, 
        goodPct: 60, 
        goodTxt: { en: `Won the lawsuit! (+${formatMoney(getLeagueScaledVal(tier, 5000, clubCountry))}, +10 Morale)`, de: `Klage gewonnen! (+${formatMoney(getLeagueScaledVal(tier, 5000, clubCountry))}, +10 Moral)` },
        badPct: 40,
        badTxt: { en: `Lost lawsuit (-${formatMoney(getLeagueScaledVal(tier, 5000, clubCountry))}, -15 Morale)`, de: `Klage verloren (-${formatMoney(getLeagueScaledVal(tier, 5000, clubCountry))}, -15 Moral)` }
      },
      opt2: { 
        title: { en: 'Team bonding', de: 'Teambuilding' }, 
        goodPct: 30, 
        goodTxt: { en: 'They loved the thrill! (+20 Morale)', de: 'Sie liebten den Nervenkitzel! (+20 Moral)' },
        badPct: 70,
        badTxt: { en: 'Everyone threw up (-2 OVR, -25 Morale)', de: 'Alle haben sich übergeben (-2 GES, -25 Moral)' }
      },
      extraData: {
        opt1Good: { budget: getLeagueScaledVal(tier, 5000, clubCountry), morale: 10 },
        opt1Bad: { budget: -getLeagueScaledVal(tier, 5000, clubCountry), morale: -15 },
        opt2Good: { morale: 20 },
        opt2Bad: { ovr: -2, morale: -25 }
      }
    },
    {
      type: 'funny_horse_80',
      title: { en: 'STRAY HORSE', de: 'VERIRRTES PFERD' },
      desc: { en: "A stray horse ran onto the training pitch.", de: "Ein verirrtes Pferd rannte auf den Trainingsplatz." },
      opt1: { 
        title: { en: 'Adopt it', de: 'Adoptieren' }, 
        goodPct: 40, 
        goodTxt: { en: `New mascot! (-${formatMoney(getLeagueScaledVal(tier, 2000, clubCountry))}, +15 Morale, +50 Fans)`, de: `Neues Maskottchen! (-${formatMoney(getLeagueScaledVal(tier, 2000, clubCountry))}, +15 Moral, +50 Fans)` },
        badPct: 60,
        badTxt: { en: `Ruined the pitch (-${formatMoney(getLeagueScaledVal(tier, 5000, clubCountry))}, -10 Morale)`, de: `Rasen zerstört (-${formatMoney(getLeagueScaledVal(tier, 5000, clubCountry))}, -10 Moral)` }
      },
      opt2: { 
        title: { en: 'Chase it away', de: 'Verjagen' }, 
        goodPct: 100, 
        goodTxt: { en: 'Boring but safe (+5 Morale)', de: 'Langweilig, aber sicher (+5 Moral)' } 
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 2000, clubCountry),
        opt1Good: { morale: 15, fans: getLeagueScaledFans(tier, 50, clubCountry, tier) },
        opt1Bad: { budget: -getLeagueScaledVal(tier, 5000, clubCountry), morale: -10 },
        opt2Good: { morale: 5 }
      }
    },
    {
      type: 'funny_wrong_boots_81',
      title: { en: 'TWO LEFT BOOTS', de: 'ZWEI LINKE SCHUHE' },
      desc: { en: "Striker wore two left boots by accident and scored a worldie.", de: "Stürmer trug zwei linke Schuhe und traf traumhaft." },
      opt1: { 
        title: { en: 'Tell press it was tactical', de: 'Presse anlügen' }, 
        goodPct: 50, 
        goodTxt: { en: 'Tactical genius! (+100 Fans, +1 Rep)', de: 'Taktisches Genie! (+100 Fans, +1 Rep)' },
        badPct: 50,
        badTxt: { en: 'Media mocked you (-15 Morale, -2 Rep)', de: 'Medien verspotten dich (-15 Moral, -2 Rep)' }
      },
      opt2: { 
        title: { en: 'Launch boot brand', de: 'Schuhmarke gründen' }, 
        goodPct: 30, 
        goodTxt: { en: `Sold out! (+${formatMoney(getLeagueScaledVal(tier, 8000, clubCountry))}, +50 Fans)`, de: `Ausverkauft! (+${formatMoney(getLeagueScaledVal(tier, 8000, clubCountry))}, +50 Fans)` },
        badPct: 70,
        badTxt: { en: `Terrible investment (-${formatMoney(getLeagueScaledVal(tier, 5000, clubCountry))}, -10 Morale)`, de: `Mieses Investment (-${formatMoney(getLeagueScaledVal(tier, 5000, clubCountry))}, -10 Moral)` }
      },
      extraData: {
        opt1Good: { fans: getLeagueScaledFans(tier, 100, clubCountry, tier), rep: 1 },
        opt1Bad: { morale: -15, rep: -2 },
        opt2Good: { budget: getLeagueScaledVal(tier, 8000, clubCountry), fans: getLeagueScaledFans(tier, 50, clubCountry, tier) },
        opt2Bad: { budget: -getLeagueScaledVal(tier, 5000, clubCountry), morale: -10 }
      }
    },
    {
      type: 'funny_gk_dribble_82',
      title: { en: 'GK DRIBBLE', de: 'KEEPER DRIBBLING' },
      desc: { en: "GK tried to dribble the entire opposition team and failed.", de: "Keeper wollte gegnerisches Team ausdribbeln. Gescheitert." },
      opt1: { 
        title: { en: 'Fine him', de: 'Bestrafen' }, 
        goodPct: 100, 
        goodTxt: { en: `Discipline applied (+${formatMoney(getLeagueScaledVal(tier, 2000, clubCountry))}, -1 OVR, -10 Morale)`, de: `Disziplin angewendet (+${formatMoney(getLeagueScaledVal(tier, 2000, clubCountry))}, -1 GES, -10 Moral)` }
      },
      opt2: { 
        title: { en: 'Encourage him', de: 'Ermutigen' }, 
        goodPct: 10, 
        goodTxt: { en: 'Next time he scores! (+2 OVR, +20 Morale, +100 Fans)', de: 'Nächstes Mal trifft er! (+2 GES, +20 Moral, +100 Fans)' },
        badPct: 90,
        badTxt: { en: 'Conceded another goal (-2 OVR, -20 Morale, -2 Rep)', de: 'Noch ein Gegentor kassiert (-2 GES, -20 Moral, -2 Rep)' }
      },
      extraData: {
        opt1Good: { budget: getLeagueScaledVal(tier, 2000, clubCountry), ovr: -1, morale: -10 },
        opt2Good: { ovr: 2, morale: 20, fans: getLeagueScaledFans(tier, 100, clubCountry, tier) },
        opt2Bad: { ovr: -2, morale: -20, rep: -2 }
      }
    },
    {
      type: 'funny_face_tattoo_83',
      title: { en: 'FACE TATTOO', de: 'GESICHTS TATTOO' },
      desc: { en: "Winger got a massive face tattoo of his own face.", de: "Flügelspieler ließ sich sein eigenes Gesicht tätowieren." },
      opt1: { 
        title: { en: 'Suspend him', de: 'Suspendieren' }, 
        goodPct: 100, 
        goodTxt: { en: 'Squad focused (-1 OVR, -15 Morale)', de: 'Kader fokussiert (-1 GES, -15 Moral)' }
      },
      opt2: { 
        title: { en: 'Merch opportunity', de: 'Merch Chance' }, 
        goodPct: 40, 
        goodTxt: { en: `Sold fake tattoos! (+${formatMoney(getLeagueScaledVal(tier, 5000, clubCountry))}, +50 Fans)`, de: `Fake-Tattoos verkauft! (+${formatMoney(getLeagueScaledVal(tier, 5000, clubCountry))}, +50 Fans)` },
        badPct: 60,
        badTxt: { en: 'Sponsors hate it (-15 Morale, -2 Rep)', de: 'Sponsoren hassen es (-15 Moral, -2 Rep)' }
      },
      extraData: {
        opt1Good: { ovr: -1, morale: -15 },
        opt2Good: { budget: getLeagueScaledVal(tier, 5000, clubCountry), fans: getLeagueScaledFans(tier, 50, clubCountry, tier) },
        opt2Bad: { morale: -15, rep: -2 }
      }
    },
    {
      type: 'funny_lost_mansion_84',
      title: { en: 'LOST IN MANSION', de: 'IN VILLA VERLOREN' },
      desc: { en: "Manager got lost in his own new 30-room mansion.", de: "Manager hat sich in eigener 30-Zimmer-Villa verirrt." },
      opt1: { 
        title: { en: 'Call rescue team', de: 'Rettungsdienst rufen' }, 
        goodPct: 50, 
        goodTxt: { en: `Safe but embarrassed (-${formatMoney(getLeagueScaledVal(tier, 1000, clubCountry))}, -5 Morale)`, de: `Sicher aber peinlich (-${formatMoney(getLeagueScaledVal(tier, 1000, clubCountry))}, -5 Moral)` },
        badPct: 50,
        badTxt: { en: `News leaked it (-${formatMoney(getLeagueScaledVal(tier, 1000, clubCountry))}, -15 Morale, -2 Rep)`, de: `Presse hat's geleakt (-${formatMoney(getLeagueScaledVal(tier, 1000, clubCountry))}, -15 Moral, -2 Rep)` }
      },
      opt2: { 
        title: { en: 'Survive on snacks', de: 'Von Snacks ernähren' }, 
        goodPct: 30, 
        goodTxt: { en: 'Found the exit! (+10 Morale)', de: 'Ausgang gefunden! (+10 Moral)' },
        badPct: 70,
        badTxt: { en: 'Missed training (-2 OVR, -20 Morale)', de: 'Training verpasst (-2 GES, -20 Moral)' }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 1000, clubCountry),
        opt1Good: { morale: -5 },
        opt1Bad: { morale: -15, rep: -2 },
        opt2Good: { morale: 10 },
        opt2Bad: { ovr: -2, morale: -20 }
      }
    },
    {
      type: 'funny_crypto_pay_85',
      title: { en: 'DOGECOIN SALARY', de: 'DOGECOIN GEHALT' },
      desc: { en: "Player wants his salary paid entirely in Dogecoin.", de: "Spieler will sein Gehalt komplett in Dogecoin." },
      opt1: { 
        title: { en: 'Deny request', de: 'Ablehnen' }, 
        goodPct: 100, 
        goodTxt: { en: 'He grumbled but accepted (-1 OVR, -5 Morale)', de: 'Murrte, akzeptierte aber (-1 GES, -5 Moral)' }
      },
      opt2: { 
        title: { en: 'Pay in crypto', de: 'In Krypto zahlen' }, 
        goodPct: 40, 
        goodTxt: { en: `Coin crashed, saved money! (+${formatMoney(getLeagueScaledVal(tier, 8000, clubCountry))}, -15 Morale)`, de: `Coin abgestürzt, Geld gespart! (+${formatMoney(getLeagueScaledVal(tier, 8000, clubCountry))}, -15 Moral)` },
        badPct: 60,
        badTxt: { en: `Coin mooned, broke us (-${formatMoney(getLeagueScaledVal(tier, 12000, clubCountry))}, +10 Morale)`, de: `Coin explodiert, wir sind pleite (-${formatMoney(getLeagueScaledVal(tier, 12000, clubCountry))}, +10 Moral)` }
      },
      extraData: {
        opt1Good: { ovr: -1, morale: -5 },
        opt2Good: { budget: getLeagueScaledVal(tier, 8000, clubCountry), morale: -15 },
        opt2Bad: { budget: -getLeagueScaledVal(tier, 12000, clubCountry), morale: 10 }
      }
    },
    {
      type: 'funny_pig_86',
      title: { en: 'FLYING PIG HEAD', de: 'FLIEGENDER SCHWEINEKOPF' },
      desc: { en: "Fans threw a pig's head on the pitch.", de: "Fans warfen Schweinekopf aufs Spielfeld." },
      opt1: { 
        title: { en: 'Condemn fans', de: 'Fans verurteilen' }, 
        goodPct: 70, 
        goodTxt: { en: 'Media praises you (+10 Morale, +2 Rep)', de: 'Presse lobt dich (+10 Moral, +2 Rep)' },
        badPct: 30,
        badTxt: { en: 'Ultras are angry (-100 Fans, -15 Morale)', de: 'Ultras sind wütend (-100 Fans, -15 Moral)' }
      },
      opt2: { 
        title: { en: 'BBQ time', de: 'Grillparty' }, 
        goodPct: 20, 
        goodTxt: { en: 'Legendary response! (+100 Fans, +1 Rep)', de: 'Legendäre Reaktion! (+100 Fans, +1 Rep)' },
        badPct: 80,
        badTxt: { en: `Massive fine (-${formatMoney(getLeagueScaledVal(tier, 8000, clubCountry))}, -3 Rep)`, de: `Riesige Strafe (-${formatMoney(getLeagueScaledVal(tier, 8000, clubCountry))}, -3 Rep)` }
      },
      extraData: {
        opt1Good: { morale: 10, rep: 2 },
        opt1Bad: { fans: -getLeagueScaledFans(tier, 100, clubCountry, tier), morale: -15 },
        opt2Good: { fans: getLeagueScaledFans(tier, 100, clubCountry, tier), rep: 1 },
        opt2Bad: { budget: -getLeagueScaledVal(tier, 8000, clubCountry), rep: -3 }
      }
    },
    {
      type: 'funny_pickles_87',
      title: { en: 'NO PICKLES', de: 'KEINE GURKEN' },
      desc: { en: "Club nutritionist banned pickles. Players are striking.", de: "Ernährungsberater hat Essiggurken verboten. Spieler streiken." },
      opt1: { 
        title: { en: 'Fire nutritionist', de: 'Berater feuern' }, 
        goodPct: 100, 
        goodTxt: { en: `Pickles return! (-${formatMoney(getLeagueScaledVal(tier, 2000, clubCountry))}, +15 Morale)`, de: `Gurken sind zurück! (-${formatMoney(getLeagueScaledVal(tier, 2000, clubCountry))}, +15 Moral)` }
      },
      opt2: { 
        title: { en: 'Enforce ban', de: 'Verbot durchsetzen' }, 
        goodPct: 40, 
        goodTxt: { en: 'Players got fitter! (+2 OVR, -10 Morale)', de: 'Spieler sind fitter! (+2 GES, -10 Moral)' },
        badPct: 60,
        badTxt: { en: 'Mutiny! (-2 OVR, -25 Morale)', de: 'Meuterei! (-2 GES, -25 Moral)' }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 2000, clubCountry),
        opt1Good: { morale: 15 },
        opt2Good: { ovr: 2, morale: -10 },
        opt2Bad: { ovr: -2, morale: -25 }
      }
    },
    {
      type: 'funny_twitter_beef_88',
      title: { en: 'WENDYS BEEF', de: 'TWITTER STREIT' },
      desc: { en: "Captain got into a Twitter beef with a fast-food chain.", de: "Kapitän startete Twitter-Streit mit Fast-Food-Kette." },
      opt1: { 
        title: { en: 'Join the beef', de: 'Mitstreiten' }, 
        goodPct: 40, 
        goodTxt: { en: 'Viral marketing! (+100 Fans, +1 Rep)', de: 'Virales Marketing! (+100 Fans, +1 Rep)' },
        badPct: 60,
        badTxt: { en: 'Chain roasted you (-15 Morale, -2 Rep)', de: 'Kette hat dich zerstört (-15 Moral, -2 Rep)' }
      },
      opt2: { 
        title: { en: 'Delete his app', de: 'App löschen' }, 
        goodPct: 100, 
        goodTxt: { en: 'Crisis averted (+5 Morale)', de: 'Krise abgewendet (+5 Moral)' } 
      },
      extraData: {
        opt1Good: { fans: getLeagueScaledFans(tier, 100, clubCountry, tier), rep: 1 },
        opt1Bad: { morale: -15, rep: -2 },
        opt2Good: { morale: 5 }
      }
    },
    {
      type: 'funny_streaker_89',
      title: { en: 'FAST STREAKER', de: 'SCHNELLER FLITZER' },
      desc: { en: "A streaker outran our fastest defender.", de: "Ein Flitzer war schneller als unser schnellster Verteidiger." },
      opt1: { 
        title: { en: 'Sign the streaker', de: 'Flitzer verpflichten' }, 
        goodPct: 20, 
        goodTxt: { en: `New pace merchant! (-${formatMoney(getLeagueScaledVal(tier, 4000, clubCountry))}, +1 OVR, +50 Fans)`, de: `Neuer Tempodribbler! (-${formatMoney(getLeagueScaledVal(tier, 4000, clubCountry))}, +1 GES, +50 Fans)` },
        badPct: 80,
        badTxt: { en: 'He ran away again (-15 Morale, -2 Rep)', de: 'Ist wieder weggerannt (-15 Moral, -2 Rep)' }
      },
      opt2: { 
        title: { en: 'Extra sprint drills', de: 'Sprinttraining' }, 
        goodPct: 100, 
        goodTxt: { en: 'Defenders got faster (+1 OVR, -5 Morale)', de: 'Abwehr wurde schneller (+1 GES, -5 Moral)' } 
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 4000, clubCountry),
        opt1Good: { ovr: 1, fans: getLeagueScaledFans(tier, 50, clubCountry, tier) },
        opt1Bad: { morale: -15, rep: -2 },
        opt2Good: { ovr: 1, morale: -5 }
      }
    },
    {
      type: 'funny_smuggle_cat_90',
      title: { en: 'HOTEL CAT', de: 'HOTEL KATZE' },
      desc: { en: "Player tried to smuggle his cat into the team hotel.", de: "Spieler wollte Katze ins Mannschaftshotel schmuggeln." },
      opt1: { 
        title: { en: 'Allow it', de: 'Erlauben' }, 
        goodPct: 60, 
        goodTxt: { en: 'Cat is lucky! (+2 OVR, +15 Morale)', de: 'Katze bringt Glück! (+2 GES, +15 Moral)' },
        badPct: 40,
        badTxt: { en: `Cat ruined curtains (-${formatMoney(getLeagueScaledVal(tier, 3000, clubCountry))}, -10 Morale)`, de: `Vorhänge ruiniert (-${formatMoney(getLeagueScaledVal(tier, 3000, clubCountry))}, -10 Moral)` }
      },
      opt2: { 
        title: { en: 'Send cat home', de: 'Nach Hause schicken' }, 
        goodPct: 100, 
        goodTxt: { en: 'Player is sad (-1 OVR, -15 Morale)', de: 'Spieler ist traurig (-1 GES, -15 Moral)' } 
      },
      extraData: {
        opt1Good: { ovr: 2, morale: 15 },
        opt1Bad: { budget: -getLeagueScaledVal(tier, 3000, clubCountry), morale: -10 },
        opt2Good: { ovr: -1, morale: -15 }
      }
    },
    {
      type: 'funny_skill_move_91',
      title: { en: 'FAILED RAINBOW FLICK', de: 'RAINBOW FLICK FAIL' },
      desc: { en: "Tried a fancy rainbow flick, tripped, and broke his nose.", de: "Wollte Rainbow Flick machen, stolperte, Nase gebrochen." },
      opt1: { 
        title: { en: 'Buy mask', de: 'Maske kaufen' }, 
        goodPct: 100, 
        goodTxt: { en: `Batman vibes! (-${formatMoney(getLeagueScaledVal(tier, 1000, clubCountry))}, +1 OVR, +5 Morale)`, de: `Batman Vibes! (-${formatMoney(getLeagueScaledVal(tier, 1000, clubCountry))}, +1 GES, +5 Moral)` }
      },
      opt2: { 
        title: { en: 'Ban skill moves', de: 'Tricks verbieten' }, 
        goodPct: 30, 
        goodTxt: { en: 'Solid basics (+1 OVR, +5 Morale)', de: 'Solide Basics (+1 GES, +5 Moral)' },
        badPct: 70,
        badTxt: { en: 'Fans are bored (-50 Fans, -10 Morale)', de: 'Fans sind gelangweilt (-50 Fans, -10 Moral)' }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 1000, clubCountry),
        opt1Good: { ovr: 1, morale: 5 },
        opt2Good: { ovr: 1, morale: 5 },
        opt2Bad: { fans: -getLeagueScaledFans(tier, 50, clubCountry, tier), morale: -10 }
      }
    },
    {
      type: 'funny_dance_collide_92',
      title: { en: 'TIKTOK CRASH', de: 'TIKTOK CRASH' },
      desc: { en: "Two players collided while attempting a TikTok dance.", de: "Zwei Spieler stießen bei einem TikTok-Tanz zusammen." },
      opt1: { 
        title: { en: 'Post the fail', de: 'Fail posten' }, 
        goodPct: 70, 
        goodTxt: { en: `Viral money! (+${formatMoney(getLeagueScaledVal(tier, 5000, clubCountry))}, +100 Fans)`, de: `Virales Geld! (+${formatMoney(getLeagueScaledVal(tier, 5000, clubCountry))}, +100 Fans)` },
        badPct: 30,
        badTxt: { en: 'Players humiliated (-1 OVR, -20 Morale)', de: 'Spieler gedemütigt (-1 GES, -20 Moral)' }
      },
      opt2: { 
        title: { en: 'Ban phones', de: 'Handys verbieten' }, 
        goodPct: 100, 
        goodTxt: { en: 'Focused but angry (-1 OVR, -15 Morale)', de: 'Fokussiert, aber sauer (-1 GES, -15 Moral)' } 
      },
      extraData: {
        opt1Good: { budget: getLeagueScaledVal(tier, 5000, clubCountry), fans: getLeagueScaledFans(tier, 100, clubCountry, tier) },
        opt1Bad: { ovr: -1, morale: -20 },
        opt2Good: { ovr: -1, morale: -15 }
      }
    },
    {
      type: 'funny_net_tight_93',
      title: { en: 'TIGHT NETS', de: 'STRAFFE NETZE' },
      desc: { en: "GK complained the goal net is 'too tight'.", de: "Keeper beschwert sich, Tornetz sei 'zu straff'." },
      opt1: { 
        title: { en: 'Loosen them', de: 'Lockern' }, 
        goodPct: 100, 
        goodTxt: { en: `GK feels comfortable (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +10 Morale)`, de: `Keeper ist zufrieden (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, +10 Moral)` }
      },
      opt2: { 
        title: { en: 'Ignore him', de: 'Ignorieren' }, 
        goodPct: 40, 
        goodTxt: { en: 'He got over it (+5 Morale)', de: 'Hat sich beruhigt (+5 Moral)' },
        badPct: 60,
        badTxt: { en: 'He missed a save protesting (-1 OVR, -15 Morale)', de: 'Gegentor wegen Protest (-1 GES, -15 Moral)' }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt1Good: { morale: 10 },
        opt2Good: { morale: 5 },
        opt2Bad: { ovr: -1, morale: -15 }
      }
    },
    {
      type: 'funny_tree_drone_94',
      title: { en: 'TREE DRONE', de: 'BAUM DROHNE' },
      desc: { en: "Player got stuck in a tree trying to rescue his drone.", de: "Spieler steckte im Baum fest, als er Drohne retten wollte." },
      opt1: { 
        title: { en: 'Call fire dept', de: 'Feuerwehr rufen' }, 
        goodPct: 70, 
        goodTxt: { en: `Rescued safely (-${formatMoney(getLeagueScaledVal(tier, 1000, clubCountry))}, +5 Morale)`, de: `Sicher gerettet (-${formatMoney(getLeagueScaledVal(tier, 1000, clubCountry))}, +5 Moral)` },
        badPct: 30,
        badTxt: { en: `Media got photos (-${formatMoney(getLeagueScaledVal(tier, 1000, clubCountry))}, -15 Morale, -1 Rep)`, de: `Presse hat Fotos (-${formatMoney(getLeagueScaledVal(tier, 1000, clubCountry))}, -15 Moral, -1 Rep)` }
      },
      opt2: { 
        title: { en: 'Leave him', de: 'Hängen lassen' }, 
        goodPct: 10, 
        goodTxt: { en: 'He became Tarzan! (+2 OVR, +15 Morale)', de: 'Er wurde zu Tarzan! (+2 GES, +15 Moral)' },
        badPct: 90,
        badTxt: { en: 'Missed the match (-2 OVR, -25 Morale)', de: 'Spiel verpasst (-2 GES, -25 Moral)' }
      },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 1000, clubCountry),
        opt1Good: { morale: 5 },
        opt1Bad: { morale: -15, rep: -1 },
        opt2Good: { ovr: 2, morale: 15 },
        opt2Bad: { ovr: -2, morale: -25 }
      }
    },
    {
      type: 'funny_logo_replace_95',
      title: { en: 'LOGO REPLACE', de: 'LOGO TAUSCH' },
      desc: { en: "Sponsor demands their logo replaces the club crest for one match.", de: "Sponsor will Vereinswappen für ein Spiel ersetzen." },
      opt1: { 
        title: { en: 'Accept', de: 'Akzeptieren' }, 
        goodPct: 20, 
        goodTxt: { en: `Huge payout! (+${formatMoney(getLeagueScaledVal(tier, 10000, clubCountry))}, -1 Rep)`, de: `Riesige Auszahlung! (+${formatMoney(getLeagueScaledVal(tier, 10000, clubCountry))}, -1 Rep)` },
        badPct: 80,
        badTxt: { en: `Fans rioted (+${formatMoney(getLeagueScaledVal(tier, 10000, clubCountry))}, -150 Fans, -25 Morale, -3 Rep)`, de: `Fans rebellieren (+${formatMoney(getLeagueScaledVal(tier, 10000, clubCountry))}, -150 Fans, -25 Moral, -3 Rep)` }
      },
      opt2: { 
        title: { en: 'Refuse', de: 'Ablehnen' }, 
        goodPct: 100, 
        goodTxt: { en: `Tradition kept (-${formatMoney(getLeagueScaledVal(tier, 4000, clubCountry))}, +50 Fans, +1 Rep)`, de: `Tradition bewahrt (-${formatMoney(getLeagueScaledVal(tier, 4000, clubCountry))}, +50 Fans, +1 Rep)` } 
      },
      extraData: {
        opt1Good: { budget: getLeagueScaledVal(tier, 10000, clubCountry), rep: -1 },
        opt1Bad: { budget: getLeagueScaledVal(tier, 10000, clubCountry), fans: -getLeagueScaledFans(tier, 150, clubCountry, tier), morale: -25, rep: -3 },
        opt2Cost: getLeagueScaledVal(tier, 4000, clubCountry),
        opt2Good: { fans: getLeagueScaledFans(tier, 50, clubCountry, tier), rep: 1 }
      }
    },
    {
      type: 'funny_round_ball_96',
      title: { en: 'ROUND BALL', de: 'RUNDER BALL' },
      desc: { en: "Midfielder complained to the press that 'the ball is too round'.", de: "Spieler beschwerte sich, der Ball sei 'zu rund'." },
      opt1: { 
        title: { en: 'Agree with him', de: 'Ihm zustimmen' }, 
        goodPct: 40, 
        goodTxt: { en: 'Started a debate! (+50 Fans, +1 Rep)', de: 'Debatte gestartet! (+50 Fans, +1 Rep)' },
        badPct: 60,
        badTxt: { en: 'Everyone thinks you are insane (-15 Morale, -2 Rep)', de: 'Alle halten euch für verrückt (-15 Moral, -2 Rep)' }
      },
      opt2: { 
        title: { en: 'Fine him', de: 'Bestrafen' }, 
        goodPct: 100, 
        goodTxt: { en: `Silence enforced (+${formatMoney(getLeagueScaledVal(tier, 2000, clubCountry))}, -1 OVR, -10 Morale)`, de: `Ruhe erzwungen (+${formatMoney(getLeagueScaledVal(tier, 2000, clubCountry))}, -1 GES, -10 Moral)` } 
      },
      extraData: {
        opt1Good: { fans: getLeagueScaledFans(tier, 50, clubCountry, tier), rep: 1 },
        opt1Bad: { morale: -15, rep: -2 },
        opt2Good: { budget: getLeagueScaledVal(tier, 2000, clubCountry), ovr: -1, morale: -10 }
      }
    },
    {
      type: 'funny_sunglasses_97',
      title: { en: 'SUNGLASSES', de: 'SONNENBRILLE' },
      desc: { en: "Player insists on wearing designer sunglasses during night matches.", de: "Spieler will bei Flutlichtspielen Designer-Brille tragen." },
      opt1: { 
        title: { en: 'Let him', de: 'Zulassen' }, 
        goodPct: 30, 
        goodTxt: { en: 'Style icon! (+1 OVR, +50 Fans)', de: 'Style-Ikone! (+1 GES, +50 Fans)' },
        badPct: 70,
        badTxt: { en: 'Could not see the ball (-2 OVR, -15 Morale)', de: 'Hat den Ball nicht gesehen (-2 GES, -15 Moral)' }
      },
      opt2: { 
        title: { en: 'Confiscate them', de: 'Konfiszieren' }, 
        goodPct: 100, 
        goodTxt: { en: 'He sulked all match (-1 OVR, -10 Morale)', de: 'Schmollte das ganze Spiel (-1 GES, -10 Moral)' } 
      },
      extraData: {
        opt1Good: { ovr: 1, fans: getLeagueScaledFans(tier, 50, clubCountry, tier) },
        opt1Bad: { ovr: -2, morale: -15 },
        opt2Good: { ovr: -1, morale: -10 }
      }
    },
    {
      type: 'funny_mascot_manager_98',
      title: { en: 'MASCOT VS MANAGER', de: 'MASKOTTCHEN VS TRAINER' },
      desc: { en: "Your mascot was fired for fighting the opposition manager.", de: "Maskottchen gefeuert wg. Schlägerei mit gegnerischem Trainer." },
      opt1: { 
        title: { en: 'Rehire mascot', de: 'Wieder einstellen' }, 
        goodPct: 50, 
        goodTxt: { en: 'Fans rejoiced! (+100 Fans, +15 Morale)', de: 'Fans jubeln! (+100 Fans, +15 Moral)' },
        badPct: 50,
        badTxt: { en: `FA fine (-${formatMoney(getLeagueScaledVal(tier, 8000, clubCountry))}, -2 Rep)`, de: `Verbandsstrafe (-${formatMoney(getLeagueScaledVal(tier, 8000, clubCountry))}, -2 Rep)` }
      },
      opt2: { 
        title: { en: 'Let him go', de: 'Gefeuert lassen' }, 
        goodPct: 100, 
        goodTxt: { en: 'Professional but sad (-10 Morale, +1 Rep)', de: 'Professionell aber traurig (-10 Moral, +1 Rep)' } 
      },
      extraData: {
        opt1Good: { fans: getLeagueScaledFans(tier, 100, clubCountry, tier), morale: 15 },
        opt1Bad: { budget: -getLeagueScaledVal(tier, 8000, clubCountry), rep: -2 },
        opt2Good: { morale: -10, rep: 1 }
      }
    },
    {
      type: 'funny_monk_99',
      title: { en: 'MONK RETIREMENT', de: 'MÖNCH RÜCKTRITT' },
      desc: { en: "Striker scored a hat-trick, then instantly retired to become a monk.", de: "Stürmer machte Hattrick und trat zurück, um Mönch zu werden." },
      opt1: { 
        title: { en: 'Beg him to stay', de: 'Anflehen' }, 
        goodPct: 20, 
        goodTxt: { en: 'He stayed! Nirvana! (+3 OVR, +20 Morale)', de: 'Er bleibt! Nirvana! (+3 GES, +20 Moral)' },
        badPct: 80,
        badTxt: { en: 'He left anyway (-3 OVR, -20 Morale)', de: 'Er ging trotzdem (-3 GES, -20 Moral)' }
      },
      opt2: { 
        title: { en: 'Wish him well', de: 'Viel Glück wünschen' }, 
        goodPct: 100, 
        goodTxt: { en: 'Inner peace (-2 OVR, +10 Morale, +1 Rep)', de: 'Innerer Frieden (-2 GES, +10 Moral, +1 Rep)' } 
      },
      extraData: {
        opt1Good: { ovr: 3, morale: 20 },
        opt1Bad: { ovr: -3, morale: -20 },
        opt2Good: { ovr: -2, morale: 10, rep: 1 }
      }
    },
    {
      type: 'magdeburg_away_invasion',
      title: { en: 'THE BLUE-WHITE INVASION', de: 'DIE BLAU-WEISSE INVASION' },
      desc: {
        en: '10,000 Magdeburg fans have traveled to a meaningless away game, drinking the host town completely dry!',
        de: '10.000 Magdeburger sind zum Auswärtsspiel gereist und haben die Kleinstadt komplett leergetrunken!'
      },
      opt1: { title: { en: 'Subsidize the Beer', de: 'Freibier spendieren' }, goodPct: 100, goodTxt: { en: '+Fans, -Budget', de: '+Fans, -Budget' } },
      opt2: { title: { en: 'Demand Pitch Focus', de: 'Fokus aufs Spiel' }, goodPct: 100, goodTxt: { en: '+1 OVR', de: '+1 GES' } },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 8000, clubCountry),
        opt1Good: { fans: getLeagueScaledFans(tier, 2000, clubCountry, tier) },
        opt2Good: { ovr: 1 }
      }
    },
    {
      type: 'spurs_bottle_curse',
      title: { en: 'THE BOTTLING CURSE', de: 'DER "SPURSY" FLUCH' },
      desc: {
        en: 'The media claims your team has a fragile mentality and is destined to bottle the title race.',
        de: 'Die Medien behaupten, dein Team habe eine schwache Mentalität und werde am Ende eh wieder einbrechen.'
      },
      opt1: { title: { en: 'Hire Elite Psychologists', de: 'Top-Psychologen anheuern' }, goodPct: 100, goodTxt: { en: 'Mentality Monsters (+2 OVR)', de: 'Mentalitätsmonster (+2 GES)' } },
      opt2: { title: { en: 'It is the history of the club', de: 'Es ist die Geschichte des Clubs' }, goodPct: 100, goodTxt: { en: 'Sad Acceptance (-1 OVR)', de: 'Traurige Akzeptanz (-1 GES)' } },
      extraData: {
        opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
        opt1Good: { ovr: 2 },
        opt2Good: { ovr: -1 }
      }
    },
      {
        type: 'viral_tiktok_fan',
        title: { en: 'VIRAL FAN ANTHEM', de: 'VIRALE FAN-HYMNE' },
        desc: {
          en: 'A young fan went viral on social media singing the club anthem passionately! Millions are watching.',
          de: 'Ein junger Fan ist auf Social Media viral gegangen, weil er eure Hymne singt! Millionen schauen zu.'
        },
        opt1: {
          title: { en: `Invite as VIP (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})`, de: `Als VIP einladen (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: `Massive Hype (+${getLeagueScaledFans(tier, 3000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Riesen-Hype (+${getLeagueScaledFans(tier, 3000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` }
        },
        opt2: {
          title: { en: 'Just Retweet (Free)', de: 'Nur Retweeten (Kostenlos)' },
          goodPct: 100,
          goodTxt: { en: `Small Boost (+${getLeagueScaledFans(tier, 500, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Kleiner Push (+${getLeagueScaledFans(tier, 500, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` }
        }
      },
      {
        type: 'factory_ticket_giveaway',
        title: { en: 'CORPORATE TICKET BUYOUT', de: 'FIRMENSESPONSERTE TICKETS' },
        desc: {
          en: 'A large local factory wants to buy thousands of tickets to give away to their workers for the next match!',
          de: 'Eine grosse lokale Fabrik moechte tausende Tickets kaufen, um sie an ihre Arbeiter zu verschenken!'
        },
        opt1: {
          title: { en: `Accept Deal (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))} & Fans)`, de: `Deal annehmen (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))} & Fans)` },
          goodPct: 100,
          goodTxt: { en: `+${formatMoney(getLeagueScaledVal(tier, 5000, clubCountry))} & Fans`, de: `+${formatMoney(getLeagueScaledVal(tier, 5000, clubCountry))} & Fans` }
        },
        opt2: {
          title: { en: 'Reserve for Ultras', de: 'Fr Ultras reservieren' },
          goodPct: 100,
          goodTxt: { en: 'Morale Boost (+1 OVR)', de: 'Stimmung steigt (+1 GES)' }
        }
      },
      {
        type: 'ticket_boycott_crisis',
        title: { 
          en: (() => {
            if (['ENG', 'SCO', 'WAL', 'AUS', 'CAN'].includes(clubCountry)) return 'DIE-HARD FANS BOYCOTT';
            if (['ARG', 'COL', 'ECU', 'MEX'].includes(clubCountry)) return 'BARRAS BRAVAS BOYCOTT';
            if (clubCountry === 'BRA') return 'TORCIDA ORGANIZADA BOYCOTT';
            if (clubCountry === 'POR') return 'CLAQUES BOYCOTT';
            return 'ULTRAS BOYCOTT';
          })(),
          de: (() => {
            if (['ENG', 'SCO', 'WAL', 'AUS', 'CAN'].includes(clubCountry)) return 'FAN-BOYKOTT';
            if (['ARG', 'COL', 'ECU', 'MEX'].includes(clubCountry)) return 'BARRAS BRAVAS-BOYKOTT';
            if (clubCountry === 'BRA') return 'TORCIDA ORGANIZADA-BOYKOTT';
            if (clubCountry === 'POR') return 'CLAQUES-BOYKOTT';
            return 'ULTRAS-BOYKOTT';
          })()
        },
        desc: {
          en: (() => {
            if (['ENG', 'SCO', 'WAL', 'AUS', 'CAN'].includes(clubCountry)) return 'Passionate supporters are protesting recent club performances and threaten to leave the stadium empty!';
            if (['ARG', 'COL', 'ECU', 'MEX'].includes(clubCountry)) return 'The Barras Bravas are furious with recent performances and threaten to completely abandon the terraces!';
            if (clubCountry === 'BRA') return 'The Torcida Organizada is furious with recent performances and threatens to completely abandon the terraces!';
            if (clubCountry === 'POR') return 'The Claques are protesting recent club performances and threaten to leave the stadium empty!';
            return 'Hardcore Ultras are protesting recent club performances and threaten to boycott the match!';
          })(),
          de: (() => {
            if (['ENG', 'SCO', 'WAL', 'AUS', 'CAN'].includes(clubCountry)) return 'Die treuesten Anhnger protestieren gegen die sportliche Talfahrt und drohen mit einem leeren Stadion!';
            if (['ARG', 'COL', 'ECU', 'MEX'].includes(clubCountry)) return 'Die Barras Bravas sind wtend ber die Talfahrt und drohen mit einem totalen Stadion-Boykott!';
            if (clubCountry === 'BRA') return 'Die Torcida Organizada ist wtend ber die Talfahrt und droht mit einem totalen Stadion-Boykott!';
            if (clubCountry === 'POR') return 'Die Claques protestieren gegen die Talfahrt und drohen mit einem leeren Stadion!';
            return 'Die Ultras protestieren gegen die Talfahrt und drohen mit einem Stadion-Boykott!';
          })()
        },
        opt1: {
          title: { en: `Subsidize Tickets (-${formatMoney(getLeagueScaledVal(tier, 2500, clubCountry))})`, de: `Tickets bezuschussen (-${formatMoney(getLeagueScaledVal(tier, 2500, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: 'Fans Pacified (+2 Rep)', de: 'Fans besnftigt (+2 Rep)' }
        },
        opt2: {
          title: { en: 'Stand Firm (Refuse)', de: 'Hart bleiben (Ablehnen)' },
          goodPct: 100,
          goodTxt: { en: `Ghost Match (-${getLeagueScaledFans(tier, 4000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Geisterspiel (-${getLeagueScaledFans(tier, 4000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` }
        }
      },
      {
        type: 'transport_strike_matchday',
        title: { en: 'TRANSPORT STRIKE', de: 'BAHNSTREIK AM SPIELTAG' },
        desc: {
          en: 'A massive national transport strike means thousands of fans cannot reach the stadium today.',
          de: 'Ein massiver bundesweiter Bahnstreik bedeutet, dass tausende Fans heute nicht ins Stadion kommen knnen.'
        },
        opt1: {
          title: { en: `Hire Shuttles (-${formatMoney(getLeagueScaledVal(tier, 150, clubCountry))})`, de: `Shuttles mieten (-${formatMoney(getLeagueScaledVal(tier, 150, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: `Hero Status (+${getLeagueScaledFans(tier, 1500, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Heldenstatus (+${getLeagueScaledFans(tier, 1500, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` }
        },
        opt2: {
          title: { en: 'Do Nothing', de: 'Nichts tun' },
          goodPct: 100,
          goodTxt: { en: `Attendance Drops (-${getLeagueScaledFans(tier, 1500, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Zuschauerschwund (-${getLeagueScaledFans(tier, 1500, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` }
        }
      },

      {
        type: 'red_bull_collapse',
        title: { en: 'RED BULL FINANCIAL COLLAPSE', de: 'RED BULL FINANZKOLLAPS' },
        desc: {
          en: 'Your main sponsor Energy Drink has massive financial difficulties and needs to offload its clubs. RB Leipzig was sold, leaving a massive -500M gap that needs fixing!',
          de: 'Hauptsponsor Energy Drink hat massive finanzielle Probleme und stt seine Vereine ab. RB Leipzig wurde verkauft und hinterlsst ein -500M Loch!'
        },
        opt1: {
          title: { en: 'Accept the Debt', de: 'Schulden akzeptieren' },
          goodPct: 100,
          goodTxt: { en: `-${formatMoney(getLeagueScaledVal(tier, 500000, clubCountry))} Budget`, de: `-${formatMoney(getLeagueScaledVal(tier, 500000, clubCountry))} Budget` }
        },
        opt2: {
          title: { en: 'Fire Sale', de: 'Notverkauf' },
          goodPct: 100,
          goodTxt: { en: `-${formatMoney(getLeagueScaledVal(tier, 300000, clubCountry))}, OVR -5`, de: `-${formatMoney(getLeagueScaledVal(tier, 300000, clubCountry))}, GES -5` }
        },
        cost: getLeagueScaledVal(tier, 500000, clubCountry),
      },
      {
        type: 'negative_doping_scandal',
        title: { en: 'DOPING ALLEGATIONS', de: 'DOPING-VERDACHT' },
        desc: {
          en: 'A star player is accused of using banned substances! The press is swarming.',
          de: 'Ein Star-Spieler steht unter Dopingverdacht! Die Presse belagert das Gelnde.'
        },
        opt1: {
          title: { en: 'Suspend & Investigate (-3 OVR)', de: 'Suspendieren (-3 GES)' },
          goodPct: 100,
          goodTxt: { en: 'Protect Rep (+2 Rep)', de: 'Image geschtzt (+2 Rep)' },
        },
        opt2: {
          title: { en: 'Defend Him Publicly', de: 'ffentlich verteidigen' },
          goodPct: 10,
          goodTxt: { en: 'Cleared! (No penalty)', de: 'Freigesprochen!' },
          badPct: 90,
          badTxt: { en: 'Guilty! (-2 OVR, -5 Rep)', de: 'Schuldig! (-5 Rep, -2 GES)' },
        },
      },
      {
        type: 'negative_acl_injury',
        title: { en: 'ACL INJURY CRISIS', de: 'KREUZBANDRISS-SCHOCK' },
        desc: {
          en: 'Your most important playmaker has torn his ACL in training!',
          de: 'Dein wichtigster Spielmacher hat sich im Training das Kreuzband gerissen!'
        },
        opt1: {
          title: { en: `Expensive Specialist (-${formatMoney(getLeagueScaledVal(tier, 20000, clubCountry))})`, de: `Spezialist zahlen (-${formatMoney(getLeagueScaledVal(tier, 20000, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: 'Minor drop (-1 OVR)', de: 'Leichter Verlust (-1 GES)' },
        },
        opt2: {
          title: { en: 'Club Doctor (Free)', de: 'Vereinsarzt (Kostenlos)' },
          goodPct: 100,
          goodTxt: { en: 'Major drop (-3 OVR)', de: 'Schwerer Verlust (-3 GES)' },
        },
      },
      {
        type: 'negative_leaked_party',
        title: { en: 'NIGHTCLUB SCANDAL', de: 'NACHTCLUB-SKANDAL' },
        desc: {
          en: 'Videos leak of players partying until 5 AM before a crucial match.',
          de: 'Ein Video taucht auf: Die halbe Mannschaft feiert bis 5 Uhr morgens vor dem Derby!'
        },
        opt1: {
          title: { en: `Massive Fines (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})`, de: `Geldstrafen verhngen (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: 'Morale ruined (-2 OVR)', de: 'Klima ruiniert (-2 GES)' },
        },
        opt2: {
          title: { en: `Bribe Media (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})`, de: `Presse bestechen (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: 'Covered up (-1 Rep)', de: 'Vertuscht (-1 Rep)' },
        },
      },
      {
        type: 'negative_board_interference',
        title: { en: 'BOARD INTERFERENCE', de: 'VORSTANDS-EINMISCHUNG' },
        desc: {
          en: 'The owner demands you start his completely untalented nephew in the next matches.',
          de: 'Der Praesident fordert, dass sein vllig untalentierter Neffe in der Startelf steht.'
        },
        opt1: {
          title: { en: 'Refuse & Bench Him', de: 'Weigern & auf die Bank setzen' },
          goodPct: 100,
          goodTxt: { en: 'Job Security Risk (-5 Rep)', de: 'Job in Gefahr (-5 Rep)' },
        },
        opt2: {
          title: { en: 'Comply and Play Him', de: 'Nachgeben & spielen lassen' },
          goodPct: 100,
          goodTxt: { en: 'Tactical Disaster (-2 OVR)', de: 'Taktisches Desaster (-2 GES)' },
        },
      },

      {
        type: 'fankultur_torgranate',
        title: { en: 'GROUNDHOPPING VISIT', de: 'GROUNDHOPPING BESUCH' },
        desc: {
          en: 'YouTuber "Fankultur by Torgranate" wants to organize a groundhopping trip to your stadium!',
          de: 'Der YouTuber "Fankultur by Torgranate" moechte einen Groundhopping-Trip in euer Stadion organisieren!',
        },
        opt1: {
          title: { en: 'Welcome them', de: 'Herzlich willkommen heien' },
          goodPct: 100,
          goodTxt: { en: '+250 Matchday Fans', de: '+250 Fans' },
        },
        opt2: {
          title: { en: 'Decline visit', de: 'Besuch ablehnen' },
          goodPct: 100,
          goodTxt: { en: '-1 Rep', de: '-1 Ansehen' },
        },
      },
      {
        type: 'fan_social_media_viral',
        title: { en: 'VIRAL SOCIAL MEDIA', de: 'VIRALER SOCIAL-MEDIA-HIT' },
        desc: {
          en: 'A fan-made tactical montage of your team went viral! The younger generation is paying attention.',
          de: 'Ein Fan-Video deiner Taktik ist viral gegangen! Die jngere Generation wird aufmerksam.',
        },
        opt1: {
          title: { en: 'Embrace it organically', de: 'Organisch wachsen lassen' },
          goodPct: 100,
          goodTxt: { en: 'More Matchday Fans', de: 'Mehr Zuschauer' },
        },
        opt2: {
          title: { en: `Boost with Ads (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})`, de: `Mit Werbung pushen (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: 'Massive Fan Boost', de: 'Massiver Fan-Boost' },
        },
      },
      {
        type: 'fan_community_outreach',
        title: { en: 'COMMUNITY OUTREACH', de: 'REGIONALE VERWURZELUNG' },
        desc: {
          en: 'The board suggests spending a day at local schools and hospitals to connect with the community.',
          de: 'Der Vorstand schlgt vor, einen Tag in Schulen und Krankenhusern zu verbringen, um die Region zu binden.',
        },
        opt1: {
          title: { en: `Fund Charity Event (-${formatMoney(getLeagueScaledVal(tier, 800, clubCountry))})`, de: `Charity-Event finanzieren (-${formatMoney(getLeagueScaledVal(tier, 800, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: 'More Matchday Fans & Rep', de: 'Mehr Fans & Ansehen' },
        },
        opt2: {
          title: { en: 'Focus on Training', de: 'Fokus aufs Training' },
          goodPct: 100,
          goodTxt: { en: '+1 OVR', de: '+1 GES' },
        },
      },
      {
        type: 'fan_ticket_protest',
        title: { en: 'TICKET PRICE PROTEST', de: 'TICKET-PROTEST' },
        desc: {
          en: 'Die-hard supporter groups are protesting recent concession price hikes and threatening to boycott home games.',
          de: 'Die Ultras protestieren gegen hohe Catering-Preise und drohen mit einem Heimspiel-Boykott.',
        },
        opt1: {
          title: { en: `Subsidize Catering (-${formatMoney(getLeagueScaledVal(tier, 1000, clubCountry))})`, de: `Catering subventionieren (-${formatMoney(getLeagueScaledVal(tier, 1000, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: 'Appease Fans & +2 Rep', de: 'Fans beruhigt & +2 Ansehen' },
        },
        opt2: {
          title: { en: 'Ignore Them', de: 'Ignorieren' },
          goodPct: 100,
          goodTxt: { en: 'Lose Matchday Fans & Rep', de: 'Zuschauerschwund & Reputationsverlust' },
        },
      },
      {
        type: 'transfer_bid',
        title: { en: 'MEGA TRANSFER OFFER', de: 'MEGA TRANSFER-ANGEBOT' },
        desc: {
          en: `A rival club is offering ${formatMoney(transferSale)} for your key star player!`,
          de: `Ein Konkurrent bietet ${formatMoney(transferSale)} fr deinen Leistungstrger!`,
        },
        opt1: {
          title: { en: `Accept Offer (+${formatMoney(transferSale)})`, de: `Angebot annehmen (+${formatMoney(transferSale)})` },
          goodPct: 100,
          goodTxt: { en: `+${formatMoney(transferSale)} Budget, OVR -2`, de: `+${formatMoney(transferSale)} Budget, GES -2` },
        },
        opt2: {
          title: { en: 'Reject Offer', de: 'Angebot ablehnen' },
          goodPct: 100,
          goodTxt: { en: 'Keep Star Player', de: 'Spieler behalten' },
        },
        saleVal: transferSale,
        ovrLoss: 2,
      },
      {
        type: 'facility',
        title: { en: 'YOUTH ACADEMY UPGRADE', de: 'JUGENDZENTRUM MODERNISIERUNG' },
        desc: {
          en: 'Your head scout proposes building new high-tech training pitches.',
          de: 'Dein Chefscout schlgt vor, neue High-Tech Trainingspltze zu bauen.',
        },
        opt1: {
          title: { en: `Invest (-${formatMoney(facilityCost)})`, de: `Investieren (-${formatMoney(facilityCost)})` },
          goodPct: 100,
          goodTxt: { en: '+2 Squad OVR', de: '+2 Team-GES' },
        },
        opt2: {
          title: { en: 'Decline Upgrade', de: 'Ablehnen' },
          goodPct: 100,
          goodTxt: { en: 'No Cost', de: 'Keine Kosten' },
        },
        cost: facilityCost,
      },
      {
        type: 'star_unhappy',
        title: { en: 'STAR PLAYER DISCONTENT', de: 'STARSPIELER UNZUFRIEDEN' },
        desc: {
          en: 'Your top striker is demanding a salary raise or threatens to leave on free transfer.',
          de: 'Dein Topstrmer fordert eine Gehaltserhhung oder droht ablsefrei zu gehen.',
        },
        opt1: {
          title: { en: `Give Pay Raise (-${formatMoney(starUnhappyCost)})`, de: `Gehalt erhhen (-${formatMoney(starUnhappyCost)})` },
          goodPct: 100,
          goodTxt: { en: 'Morale Restored', de: 'Klima gerettet' },
        },
        opt2: {
          title: { en: 'Refuse Raise', de: 'Ablehnen' },
          goodPct: 50,
          goodTxt: { en: 'Player stays', de: 'Bleibt trotzdem' },
          badPct: 50,
          badTxt: { en: 'OVR -3 Loss', de: 'GES -3 Verlust' },
        },
        cost: starUnhappyCost,
      },
      {
        type: 'sponsor_deal',
        title: { en: 'MAJOR SPONSORSHIP OFFER', de: 'SPONSOREN-DEAL IN AUSSICHT' },
        desc: {
          en: 'A prominent enterprise wants to become your primary jersey sponsor!',
          de: 'Ein bekannter Sponsor moechte als Hauptpartner auf die Trikots!',
        },
        opt1: {
          title: { en: `Sign Contract (+${formatMoney(sponsorSale)})`, de: `Deal unterschreiben (+${formatMoney(sponsorSale)})` },
          goodPct: 100,
          goodTxt: { en: `+${formatMoney(sponsorSale)} Budget, +Fanbase`, de: `+${formatMoney(sponsorSale)} Budget, +Fans` },
        },
        opt2: {
          title: { en: 'Decline Deal', de: 'Deal ablehnen' },
          goodPct: 100,
          goodTxt: { en: 'Keep Local Identity', de: 'Tradition wahren' },
        },
        saleVal: sponsorSale,
      },
      {
        type: 'fan_pyro',
        title: { en: 'ULTRAS PYRO SANCTION', de: 'STRAFE WEGEN PYRO' },
        desc: {
          en: 'Supporters lit flares during the derby. League authorities threaten a partial stadium ban.',
          de: 'Fans haben im Derby Pyrotechnik gezndet. Der Verband droht mit Teilausschluss!',
        },
        opt1: {
          title: { en: `Pay Fine (-${formatMoney(pyroCost)})`, de: `Strafe zahlen (-${formatMoney(pyroCost)})` },
          goodPct: 100,
          goodTxt: { en: 'Avoid Stadium Ban', de: 'Sperre abgewendet' },
        },
        opt2: {
          title: { en: 'Refuse Payment', de: 'Zahlung verweigern' },
          goodPct: 100,
          goodTxt: { en: 'Ghost Games (OVR -2)', de: 'Geisterspiele (GES -2)' },
        },
        cost: pyroCost,
      },
      {
        type: 'wonderkid',
        title: { en: 'WONDERKID DISCOVERED', de: 'SUPERTALENT ENTDECKT' },
        desc: {
          en: 'Scouts found a 17-year-old phenom in a regional academy.',
          de: 'Scouts haben ein 17-jhriges Ausnahmetalent entdeckt.',
        },
        opt1: {
          title: { en: `Sign Wonderkid (-${formatMoney(wonderkidCost)})`, de: `Talent verpflichten (-${formatMoney(wonderkidCost)})` },
          goodPct: 100,
          goodTxt: { en: 'Immediate OVR +3', de: 'Sofort GES +3' },
        },
        opt2: {
          title: { en: 'Pass on Scouting', de: 'Passen' },
          goodPct: 100,
          goodTxt: { en: 'Save Budget', de: 'Budget sparen' },
        },
        cost: wonderkidCost,
      },
      {
        type: 'naming_rights',
        title: { en: 'STADIUM NAMING RIGHTS', de: 'STADION-NAMENSRECHTE' },
        desc: {
          en: 'A commercial bank offers cash for stadium naming rights.',
          de: 'Eine Grossbank bietet viel Geld fuer die Naming Rights des Stadions.',
        },
        opt1: {
          title: { en: `Sell Rights (+${formatMoney(namingSale)})`, de: `Rechte verkaufen (+${formatMoney(namingSale)})` },
          goodPct: 100,
          goodTxt: { en: `+${formatMoney(namingSale)}, Rep -5`, de: `+${formatMoney(namingSale)}, Ansehen -5` },
        },
        opt2: {
          title: { en: 'Keep Historic Name', de: 'Traditionsname behalten' },
          goodPct: 100,
          goodTxt: { en: '+3 Reputation', de: '+3 Ansehen' },
        },
        saleVal: namingSale,
      },
      {
        type: 'ticket_protest',
        title: { en: 'FAN TICKET PRICE PROTEST', de: 'FAN-PROTEST GEGEN PREISE' },
        desc: {
          en: 'Supporters threaten a boycott over rising ticket prices.',
          de: 'Fans drohen mit Boykott wegen steigender Ticketpreise.',
        },
        opt1: {
          title: { en: `Reduce Prices (-${formatMoney(ticketCost)})`, de: `Preise senken (-${formatMoney(ticketCost)})` },
          goodPct: 100,
          goodTxt: { en: `+${getLeagueScaledFans(tier, 5000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fanbase`, de: `+${getLeagueScaledFans(tier, 5000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans` },
        },
        opt2: {
          title: { en: 'Maintain Prices', de: 'Preise beibehalten' },
          goodPct: 100,
          goodTxt: { en: 'No Budget Change', de: 'Kein Budgetverlust' },
        },
        cost: ticketCost,
      },
      {
        type: 'board_grant',
        title: { en: 'BOARD PERFORMANCE GRANT', de: 'VORSTANDS-PRMIE' },
        desc: {
          en: 'The board is thrilled with club governance and offers a cash injection.',
          de: 'Der Vorstand ist begeistert vom Kurs des Klubs und gewhrt eine Prmie!',
        },
        opt1: {
          title: { en: `Accept Grant (+${formatMoney(boardGrantVal)})`, de: `Prmie annehmen (+${formatMoney(boardGrantVal)})` },
          goodPct: 100,
          goodTxt: { en: `+${formatMoney(boardGrantVal)} Budget, +Reputation`, de: `+${formatMoney(boardGrantVal)} Budget, +Ansehen` },
        },
        opt2: {
          title: { en: 'Reinvest in Community', de: 'Fr Fans stiften' },
          goodPct: 100,
          goodTxt: { en: 'Reputation Boost', de: 'Ansehen Boost' },
        },
        saleVal: boardGrantVal,
      },
      {
        type: 'press_controversy',
        title: { en: 'TACTICAL MEDIA INTERVIEW', de: 'PRESSE-INTERVIEW' },
        desc: {
          en: 'A prominent football magazine asks you to evaluate team morale.',
          de: 'Ein bekanntes Fussball-Magazin befragt dich zur Moral im Team.',
        },
        opt1: {
          title: { en: 'Praise Squad Passion', de: 'Mannschaft loben' },
          goodPct: 100,
          goodTxt: { en: '+1 Squad OVR', de: '+1 Team-GES' },
        },
        opt2: {
          title: { en: 'Demand More Focus', de: 'Mehr Fokus fordern' },
          goodPct: 100,
          goodTxt: { en: 'Media Respect (+3 Rep)', de: 'Medien-Respekt (+3 Ansehen)' },
        },
      },
      {
        type: 'ultras_seat_destruction',
        title: { en: 'ULTRAS DESTROY SEATS', de: 'ULTRAS ZERSTREN SITZPLTZE' },
        desc: {
          en: 'After a heated derby defeat, angry ultras ripped out and smashed seats in the South Stand!',
          de: 'Nach der Derby-Niederlage haben wtende Fans Sitzpltze auf der Sdtribne herausgerissen!',
        },
        opt1: {
          title: { en: `Replace Seats (-${formatMoney(seatsCost)})`, de: `Plaetze ersetzen (-${formatMoney(seatsCost)})` },
          goodPct: 100,
          goodTxt: { en: 'Stadium Fully Operational', de: 'Stadion voll nutzbar' },
        },
        opt2: {
          title: { en: 'Close Stand for Season', de: 'Tribne vorbergehend sperren' },
          goodPct: 100,
          goodTxt: { en: `Save Cash, Fanbase -${getLeagueScaledFans(tier, 2000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')}`, de: `Geld sparen, Fans -${getLeagueScaledFans(tier, 2000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')}` },
        },
        cost: seatsCost,
      },
      {
        type: 'mascot_brawl',
        title: { en: 'MASCOT BRAWL SCANDAL', de: 'MASKOTTCHEN-PRGELEI' },
        desc: {
          en: 'Your official team mascot tackled the rival club mascot into the pitch moat on live television!',
          de: 'Dein Vereinsmaskottchen hat das gegnerische Maskottchen vor laufenden Kameras in den Graben getackelt!',
        },
        opt1: {
          title: { en: `Sell Viral Merch (+${formatMoney(mascotVal)})`, de: `Viral-Merch verkaufen (+${formatMoney(mascotVal)})` },
          goodPct: 100,
          goodTxt: { en: `+${formatMoney(mascotVal)} Revenue, +${getLeagueScaledFans(tier, 1500, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans`, de: `+${formatMoney(mascotVal)} Einnahmen, +${getLeagueScaledFans(tier, 1500, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans` },
        },
        opt2: {
          title: { en: 'Fire Mascot & Apologize', de: 'Maskottchen feuern & entschuldigen' },
          goodPct: 100,
          goodTxt: { en: 'Corporate Image Preserved', de: 'Image gewahrt' },
        },
        saleVal: mascotVal,
      },
      {
        type: 'crypto_scam',
        title: { en: 'CRYPTO MEMECOIN SPONSORSHIP', de: 'CRYPTO-INFLUENCER DEAL' },
        desc: {
          en: 'A Web3 crypto startup offers a sponsorship paid in volatile "$FOOTY" memecoins!',
          de: 'Ein Web3-Startup bietet ein risikoreiches Sponsoring in volatilem "$FOOTY" Memecoin an!',
        },
        opt1: {
          title: { en: `Accept Crypto Deal (+${formatMoney(cryptoProfit)} or RUGPULL)`, de: `Crypto-Deal eingehen (+${formatMoney(cryptoProfit)} oder RUGPULL)` },
          goodPct: 35,
          goodTxt: { en: `+${formatMoney(cryptoProfit)} Profit`, de: `+${formatMoney(cryptoProfit)} Profit` },
          badPct: 65,
          badTxt: { en: `Rugpulled! Lost ${formatMoney(cryptoLoss)} & Rep`, de: `Rugpull! -${formatMoney(cryptoLoss)} & Ansehen weg` },
        },
        opt2: {
          title: { en: 'Reject Crypto Nonsense', de: 'Crypto-Deal ablehnen' },
          goodPct: 100,
          goodTxt: { en: 'Financial Stability Kept', de: 'Solide Finanzen' },
        },
        saleVal: cryptoProfit,
        cost: cryptoLoss,
      },
      {
        type: 'sponsor_pullout',
        title: { en: 'SPONSOR PULLOUT THREAT', de: 'SPONSOR DROHT MIT AUSSTIEG' },
        desc: {
          en: 'Your primary jersey sponsor threatens to pull out due to recent form and public controversy!',
          de: 'Dein Hauptsponsor droht wegen jngster Formschwche und PR-Trouble mit sofortigem Kndigen!',
        },
        opt1: {
          title: { en: `Renegotiate Terms (-${formatMoney(getLeagueScaledVal(tier, 2500, clubCountry))}/yr)`, de: `Nachverhandeln (-${formatMoney(getLeagueScaledVal(tier, 2500, clubCountry))}/Jahr)` },
          goodPct: 100,
          goodTxt: { en: 'Sponsor Preserved', de: 'Sponsor bleibt an Bord' },
        },
        opt2: {
          title: { en: 'Refuse Concessions & Risk Walkout', de: 'Hart bleiben & Risiko eingehen' },
          goodPct: 40,
          goodTxt: { en: 'Sponsor Relents (0 Loss)', de: 'Sponsor gibt nach (Kein Verlust)' },
          badPct: 60,
          badTxt: { en: `Sponsor Pulls Out! (-${formatMoney(getLeagueScaledVal(tier, 5000, clubCountry))}/yr)`, de: `Sponsor steigt aus! (-${formatMoney(getLeagueScaledVal(tier, 5000, clubCountry))}/Jahr)` },
        },
        cost: getLeagueScaledVal(tier, 2500, clubCountry),
      },
      {
        type: 'mole_infestation',
        title: { en: 'PITCH MOLE INFESTATION', de: 'MAULWURF-PLAGE AUF DEM RASEN' },
        desc: {
          en: 'A colony of giant moles turned the home pitch into a muddy minefield overnight!',
          de: 'Eine Maulwurf-Plage hat den Heimrasen ber Nacht in einen Acker verwandelt!',
        },
        opt1: {
          title: { en: `Install Heated Turf (-${formatMoney(moleCost)})`, de: `Rasenheizung installieren (-${formatMoney(moleCost)})` },
          goodPct: 100,
          goodTxt: { en: 'Pristine Pitch (+1 OVR)', de: 'Top Rasen (+1 GES)' },
        },
        opt2: {
          title: { en: 'Set Local Traps', de: 'Musefallen aufstellen' },
          goodPct: 50,
          goodTxt: { en: 'Moles Left', de: 'Maulwrfe weg' },
          badPct: 50,
          badTxt: { en: `Match Postponed (-${formatMoney(molePostponedCost)})`, de: `Spiel abgesagt (-${formatMoney(molePostponedCost)})` },
        },
        cost: moleCost,
        saleVal: molePostponedCost,
      },
      {
        type: 'influencer_drama',
        title: { en: 'LOCKER ROOM TIKTOKER DRAMA', de: 'KABINEN-TIKTOKER SKANDAL' },
        desc: {
          en: 'A viral TikTok influencer snuck into the locker room and live-streamed tactical board secrets!',
          de: 'Ein bekannter TikToker hat sich in die Kabine geschlichen und die Taktiktafel geleakt!' },
        opt1: {
          title: { en: `Monetize Drama (+${formatMoney(dramaVal)})`, de: `Drama monetarisieren (+${formatMoney(dramaVal)})` },
          goodPct: 100,
          goodTxt: { en: `+${formatMoney(dramaVal)} Revenue, Squad OVR -1`, de: `+${formatMoney(dramaVal)} Einnahmen, GES -1` },
        },
        opt2: {
          title: { en: 'Ban Influencers & Fine', de: 'Hausverbot & Geldstrafe' },
          goodPct: 100,
          goodTxt: { en: 'Team Focus Retained', de: 'Fokus behalten' },
        },
        saleVal: dramaVal,
      },
      {
        type: 'sausage_scandal',
        title: { en: 'STADIUM SAUSAGE SCANDAL', de: 'BRATWURST-SKANDAL' },
        desc: {
          en: 'Food inspectors discovered cold, rubbery sausages served at stadium kiosks!',
          de: 'Lebensmittelpruefer haben kalte, zaehe Wuerstchen in den Stadionkiosken bemaengelt!',
        },
        opt1: {
          title: { en: `Upgrade Kiosks & Free Beer (-${formatMoney(sausageCost)})`, de: `Kioske aufruesten & Freibier (-${formatMoney(sausageCost)})` },
          goodPct: 100,
          goodTxt: { en: `+${getLeagueScaledFans(tier, 3000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fanbase Loyalty`, de: `+${getLeagueScaledFans(tier, 3000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Treue Fans` },
        },
        opt2: {
          title: { en: 'Blame Catering Contractor', de: 'Catering-Firma beschuldigen' },
          goodPct: 50,
          goodTxt: { en: 'Case Closed', de: 'Erledigt' },
          badPct: 50,
          badTxt: { en: `Fan Boycott (-${getLeagueScaledFans(tier, 1000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Fan-Boykott (-${getLeagueScaledFans(tier, 1000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
        },
        cost: sausageCost,
      },
      {
        type: 'eccentric_benefactor',
        title: { en: 'ECCENTRIC BENEFACTOR WILL', de: 'DUBIOSER ERBLASSER' },
        desc: {
          en: 'A wealthy eccentric supporter willed a gold-plated mascot statue and cash to the club!',
          de: 'Ein verquerer Millionr vererbt dem Verein eine vergoldete Maskottchen-Statue und Bargeld!',
        },
        opt1: {
          title: { en: `Accept Inheritance (+${formatMoney(benefactorVal)})`, de: `Erbe annehmen (+${formatMoney(benefactorVal)})` },
          goodPct: 100,
          goodTxt: { en: `+${formatMoney(benefactorVal)} Cash`, de: `+${formatMoney(benefactorVal)} Bargeld` },
        },
        opt2: {
          title: { en: `Melt Statue for Youth Pitch (-${formatMoney(benefactorPitchCost)})`, de: 'Statue fr Jugendplatz einschmelzen' },
          goodPct: 100,
          goodTxt: { en: '+2 Squad OVR Boost', de: '+2 Team-GES Boost' },
        },
        saleVal: benefactorVal,
        cost: benefactorPitchCost,
      },
      {
        type: 'var_hacked',
        title: { en: 'VAR SYSTEM HACKED BY TEEN', de: 'VAR-SYSTEM GEHACKT' },
        desc: {
          en: 'A 14-year-old fan hacked the stadium VAR monitors and played video games at half-time!',
          de: 'Ein 14-jhriger Hacker hat die VAR-Monitore gekapert und in der Pause Mario Kart gespielt!',
        },
        opt1: {
          title: { en: `Hire Teenager as IT Lead (-${formatMoney(varTeenCost)})`, de: `Teenie als IT-Chef anstellen (-${formatMoney(varTeenCost)})` },
          goodPct: 100,
          goodTxt: { en: `Tech Upgrade (+${formatMoney(varSponsorVal)} Sponsors)`, de: `Tech-Upgrade (+${formatMoney(varSponsorVal)} Sponsoren)` },
        },
        opt2: {
          title: { en: 'Report to Police & Sue', de: 'Anzeige & Klage' },
          goodPct: 100,
          goodTxt: { en: 'Image Boost (+5 Reputation)', de: 'Image-Gewinn (+5 Reputation)' },
        },
        cost: varTeenCost,
        saleVal: varSponsorVal,
      },
      {
        type: 'tax_audit',
        title: { en: 'FINANCIAL TAX AUDIT', de: 'STEUERFAHNDUNG & PRFUNG' },
        desc: {
          en: 'Tax authorities demand back-payments for historical transfer deals and agent commissions!',
          de: 'Das Finanzamt fordert Steuernachzahlungen fr alte Spielertransfers und Beraterhonorare!',
        },
        opt1: {
          title: { en: `Pay Settlement (-${formatMoney(taxAuditPay)})`, de: `Vergleich zahlen (-${formatMoney(taxAuditPay)})` },
          goodPct: 100,
          goodTxt: { en: `-${formatMoney(taxAuditPay)} Budget, Clean Rep`, de: `-${formatMoney(taxAuditPay)} Budget, Reines Ansehen` },
        },
        opt2: {
          title: { en: 'Appeal in Tax Court', de: 'Einspruch einlegen' },
          goodPct: 40,
          goodTxt: { en: `Won! Only ${formatMoney(taxAuditCourtWinFee)} Fees`, de: `Gewonnen! Nur ${formatMoney(taxAuditCourtWinFee)} Anwalt` },
          badPct: 60,
          badTxt: { en: `Lost! -${formatMoney(taxAuditCourtLoss)} & Rep -6`, de: `Verloren! -${formatMoney(taxAuditCourtLoss)} & Ansehen -6` },
        },
        cost: taxAuditPay,
        saleVal: taxAuditCourtLoss,
      },
      {
        type: 'injury_crisis',
        title: { en: 'STAR PLAYMAKER KNEE INJURY', de: 'KREUZBANDRISS BEIM STAR' },
        desc: {
          en: 'Your primary playmaker tore knee ligaments during training right before big matches!',
          de: 'Dein wichtigster Spielmacher hat sich vor den entscheidenden Spielen das Kreuzband gerissen!',
        },
        opt1: {
          title: { en: `Send to Swiss Specialist (-${formatMoney(injuryClinicCost)})`, de: `Schweizer Spezialklinik (-${formatMoney(injuryClinicCost)})` },
          goodPct: 100,
          goodTxt: { en: 'Fast Recovery', de: 'Schnelle Genesung' },
        },
        opt2: {
          title: { en: 'Standard In-House Rehab', de: 'Interne Reha' },
          goodPct: 100,
          goodTxt: { en: 'Squad OVR -2, Rep -2', de: 'Team-GES -2, Ansehen -2' },
        },
        cost: injuryClinicCost,
      },
      {
        type: 'ffp_warning',
        title: { en: 'FINANCIAL FAIR PLAY AUDIT', de: 'FFP-PREISPRUEFUNG' },
        desc: {
          en: 'Auditors flag your squad salary to turnover ratio exceeding guidelines!',
          de: 'Die Pruefer bemaengeln die Gehaltsquote im Verhaeltnis zum Vereinsumsatz!',
        },
        opt1: {
          title: { en: `Pay Compliance Fine (-${formatMoney(ffpFineCost)})`, de: `Strafe begleichen (-${formatMoney(ffpFineCost)})` },
          goodPct: 100,
          goodTxt: { en: 'License Approved', de: 'Lizenz erteilt' },
        },
        opt2: {
          title: { en: `Sell Fringe Player (+${formatMoney(ffpSellVal)})`, de: `Ergaenzungsspieler verkaufen (+${formatMoney(ffpSellVal)})` },
          goodPct: 100,
          goodTxt: { en: `+${formatMoney(ffpSellVal)} Budget, OVR -2`, de: `+${formatMoney(ffpSellVal)} Budget, GES -2` },
        },
        cost: ffpFineCost,
        saleVal: ffpSellVal,
      },
     {
        type: 'stadium_safety_mandate',
        title: { en: 'STADIUM STRUCTURAL SAFETY INSPECTION', de: 'STADION-SICHERHEITS-PRUEFUNG' },
        desc: {
          en: 'Safety inspectors discovered concrete cracks in the main stand and pitch drainage issues!',
          de: 'Baustatiker haben Risse in der Haupttribuene und Maengel am Rasen-Drainagesystem bemaengelt!',
        },
        opt1: {
          title: { en: `Fund Emergency Repairs (-${formatMoney(safetyCost)})`, de: `Eil-Sanierung zahlen (-${formatMoney(safetyCost)})` },
          goodPct: 100,
          goodTxt: { en: 'Full Capacity Preserved', de: 'Volle Kapazitaet gewahrt' },
        },
        opt2: {
          title: { en: 'Close Stand Section', de: 'Tribuene voruebergehend sperren' },
          goodPct: 100,
          goodTxt: { en: `Fanbase -${getLeagueScaledFans(tier, 2000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Loyalty`, de: `Fanbasis -${getLeagueScaledFans(tier, 2000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')}` },
        },
        cost: safetyCost,
      },
      {
        type: 'philosophy_demand_attack',
        title: { en: 'BOARD DEMAND: ATTRACTIVE FOOTBALL', de: 'VORSTANDS-FORDERUNG: OFFENSIV-FUSSBALL' },
        desc: {
          en: `The Board and supporters are weary of defensive zero-zero draws. The Directors demand an exciting, attacking philosophy (Total Football or Gegenpressing) to fill stadium seats!`,
          de: `Der Vorstand und die Fans haben genug von mauern und Nullnummern. Die Fuehrung fordert eine attraktive Offensiv-Philosophie (Total Football oder Gegenpressing)!`,
        },
        opt1: {
          title: { en: 'Adopt Total Football (+Sponsor Bonus)', de: 'Total Football bernehmen (+Sponsor-Bonus)' },
          goodPct: 100,
          goodTxt: { en: 'Switch to Total Football, +Sponsor Cash', de: 'Total Football aktiv, +Sponsor-Bonus' },
        },
        opt2: {
          title: { en: `Adopt Gegenpressing (+${getLeagueScaledFans(tier, 1000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fanbase Surge)`, de: `Gegenpressing bernehmen (+${getLeagueScaledFans(tier, 1000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
          goodPct: 100,
          goodTxt: { en: `Switch to Gegenpressing, +${getLeagueScaledFans(tier, 1000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans`, de: `Gegenpressing aktiv, +${getLeagueScaledFans(tier, 1000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans` },
        },
        opt3: {
          title: { en: 'Refuse ("Defensive Mastermind")', de: 'Ablehnen ("Defensiv-Taktiker")' },
          goodPct: 100,
          goodTxt: { en: 'Keep Style, -3 Reputation', de: 'Stil behalten, -3 Ansehen' },
        },
      },
      {
        type: 'philosophy_demand_defense',
        title: { en: 'BOARD PANIC: RELEGATION FORTRESS', de: 'VORSTANDS-PANIK: SCHUTZBOLLWERK' },
        desc: {
          en: `Panicked by high goal leakage, the Board fears a relegation disaster! They demand a shift to a defensive fortress (Catenaccio) or Direct Counter to secure points!`,
          de: `Angesichts vieler Gegentore hat der Vorstand Panik vor dem Abstieg! Er fordert die sofortige Umstellung auf ein Bollwerk (Defensiv) oder Vertikal-Konter!`,
        },
        opt1: {
          title: { en: 'Adopt Catenaccio Defensive (+Emergency Grant)', de: 'Defensiv-Bollwerk bernehmen (+Notfall-Spritze)' },
          goodPct: 100,
          goodTxt: { en: 'Switch to Defensive, +Emergency Cash', de: 'Defensiv aktiv, +Notfall-Spritze' },
        },
        opt2: {
          title: { en: 'Adopt Direct Counter (+1 OVR Discipline)', de: 'Direct Counter bernehmen (+1 Team-GES)' },
          goodPct: 100,
          goodTxt: { en: 'Switch to Direct Counter, +1 OVR', de: 'Direct Counter aktiv, +1 Team-GES' },
        },
        opt3: {
          title: { en: 'Refuse ("Trust the Process")', de: 'Ablehnen ("Vertraut meinem Weg")' },
          goodPct: 100,
          goodTxt: { en: 'Keep Style, -3 Reputation', de: 'Stil behalten, -3 Ansehen' },
        },
      },
      {
        type: 'philosophy_demand_tikitaka',
        title: { en: 'MAJOR SPONSOR MANDATE: TIKI-TAKA POSSESSION', de: 'SPONSOREN-MANDAT: TIKI-TAKA BALLBESITZ' },
        desc: {
          en: `A prestige corporate sponsor offers a multi-million brand partnership if your squad commits to a dominant Tiki-Taka possession control philosophy!`,
          de: `Ein Edel-Sponsor bietet einen lukrativen Millionen-Deal, wenn das Team die elegante Tiki-Taka Ballbesitz-Philosophie verinnerlicht!`,
        },
        opt1: {
          title: { en: 'Adopt Tiki-Taka (+Major Sponsor Payout)', de: 'Tiki-Taka bernehmen (+Grosser Sponsordeal)' },
          goodPct: 100,
          goodTxt: { en: 'Switch to Tiki-Taka, +Sponsor Income', de: 'Tiki-Taka aktiv, +Sponsorenbonus' },
        },
        opt2: {
          title: { en: 'Reject Corporate Pressure', de: 'Kommerziellen Druck ablehnen' },
          goodPct: 100,
          goodTxt: { en: 'Keep Style, +1,500 Ultra Loyalty Fans', de: 'Stil behalten, +1.500 Ultra-Treue' },
        },
      },
      {
        type: 'agent_holdout',
        title: { en: 'STAR AGENT REBELLION & HOLD-OUT', de: 'AGENTEN-REBELLION & STREIK' },
        desc: {
          en: `Your star playmaker's greedy agent threatens a pre-season training boycott unless a double-salary bonus or buyout clause is granted!`,
          de: `Der Berater deines Star-Spielers droht mit einem Streik im Trainingslager, falls kein dicker Gehaltsbonus gezahlt wird!`,
        },
        opt1: {
          title: { en: `Pay Agent Bonus (-${formatMoney(agentHoldoutCost)})`, de: `Berater-Bonus zahlen (-${formatMoney(agentHoldoutCost)})` },
          goodPct: 100,
          goodTxt: { en: 'Player Satisfied, OVR Intact', de: 'Spieler bleibt fokussiert' },
        },
        opt2: {
          title: { en: 'Banish Player to Reserves', de: 'In die 2. Mannschaft verbannen' },
          goodPct: 100,
          goodTxt: { en: 'Saves Cash, Squad OVR -3', de: 'Geld gespart, Team-GES -3' },
        },
        opt3: {
          title: { en: 'Public Press Scolding', de: 'ffentliche Medien-Kritik' },
          goodPct: 50,
          goodTxt: { en: 'Agent Backs Down (0 Cost)', de: 'Berater lenkt ein (0)' },
          badPct: 50,
          badTxt: { en: `Forced Sale (+${formatMoney(agentHoldoutSale)}, OVR -4, Rep -5)`, de: `Eil-Verkauf (+${formatMoney(agentHoldoutSale)}, GES -4, Ansehen -5)` },
        },
        cost: agentHoldoutCost,
        saleVal: agentHoldoutSale,
      },
      {
        type: 'doping_scandal',
        title: { en: 'CONTAMINATED SUPPLEMENT SCANDAL', de: 'DOPING-VERDACHT DURCH SHAKES' },
        desc: {
          en: `An anti-doping agency detected prohibited stimulants in your starter's sample, traced to cheap nutrition shakes bought by staff!`,
          de: 'Die NADA bemngelt eine Dopingprobe deines Stammspielers, verursacht durch verunreinigte Eiweishakes aus dem Medical-Depot!',
        },
        opt1: {
          title: { en: `Hire PR & Legal Defense (-${formatMoney(dopingLegalCost)})`, de: `Top-Anwlte engagieren (-${formatMoney(dopingLegalCost)})` },
          goodPct: 100,
          goodTxt: { en: 'Ban Lifted, Reputation Intact', de: 'Sperre aufgehoben, Ansehen gewahrt' },
        },
        opt2: {
          title: { en: 'Accept Season Suspension', de: 'Sperre akzeptieren' },
          goodPct: 100,
          goodTxt: { en: 'Saves Legal Costs, Squad OVR -3', de: 'Anwalt gespart, Team-GES -3' },
        },
        cost: dopingLegalCost,
      },
      {
        type: 'betting_scandal',
        title: { en: 'MATCH-FIXING & BETTING INVESTIGATION', de: 'WETTSKANDAL-ERMITTLUNG' },
        desc: {
          en: `League authorities investigate allegations that two squad players intentionally manipulated yellow cards in last season's derby!`,
          de: 'Der Verband ermittelt gegen zwei Spieler wegen mutmalicher Gelb-Karten-Wettmanipulationen im letzten Derby!',
        },
        opt1: {
          title: { en: `Pay Compliance Settlement (-${formatMoney(bettingFineCost)})`, de: `Verbands-Vergleich zahlen (-${formatMoney(bettingFineCost)})` },
          goodPct: 100,
          goodTxt: { en: 'Case Closed, Clean Rep', de: 'Akte geschlossen' },
        },
        opt2: {
          title: { en: 'Contest in Sports Court', de: 'Vor Sportgericht anfechten' },
          goodPct: 40,
          goodTxt: { en: 'Exonerated Completely (0 Cost)', de: 'Vollstndig freigesprochen' },
          badPct: 60,
          badTxt: { en: `Busted! Fine -${formatMoney(bettingCourtLoss)} & Rep -8`, de: `Verurteilt! Strafe -${formatMoney(bettingCourtLoss)} & Ansehen -8` },
        },
        cost: bettingFineCost,
        saleVal: bettingCourtLoss,
      },
      {
        type: 'energy_crisis',
        title: { en: 'STADIUM ENERGY HIKE & LIGHTS', de: 'ENERGIEKRISE IM STADION' },
        desc: {
          en: `Utility suppliers tripled stadium electricity rates! Night matches will cause major financial strain unless green upgrades are made.`,
          de: 'Der Stromversorger hat die Stadion-Tarife verdreifacht! Flutlichtspiele drohen die Vereinskasse stark zu belasten.',
        },
        opt1: {
          title: { en: `Install Solar & LED System (-${formatMoney(energySolarCost)})`, de: `Solar & LED-System bauen (-${formatMoney(energySolarCost)})` },
          goodPct: 100,
          goodTxt: { en: `Solar Powered (+${formatMoney(energySolarIncome)}/yr Savings)`, de: `Solar-Anlage (+${formatMoney(energySolarIncome)}/Jahr Ersparnis)` },
        },
        opt2: {
          title: { en: 'Hike Matchday Ticket Prices', de: 'Ticketpreise erhhen' },
          goodPct: 100,
          goodTxt: { en: `Saves Cash, Fanbase -${getLeagueScaledFans(tier, 2500, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Discontent`, de: `Finanzen gerettet, Fans -${getLeagueScaledFans(tier, 2500, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')}` },
        },
        cost: energySolarCost,
        saleVal: energySolarIncome,
      },
      {
        type: 'staff_poaching',
        title: { en: 'TACTICAL COACHING STAFF POACHED', de: 'TRAINERSTAB-ABWERBUNG' },
        desc: {
          en: `A wealthy rival offers lucrative contracts to your key tactical analysts and assistant managers!`,
          de: 'Ein finanzstarker Konkurrent kdert deinen Co-Trainer und Chef-Analysten mit Traumgehltern!',
        },
        opt1: {
          title: { en: `Match Salary Package (-${formatMoney(staffMatchCost)})`, de: `Gehalt anpassen (-${formatMoney(staffMatchCost)})` },
          goodPct: 100,
          goodTxt: { en: 'Staff Retained, Squad OVR Intact', de: 'Trainerteam bleibt, GES gewahrt' },
        },
        opt2: {
          title: { en: `Let Staff Leave (+${formatMoney(staffPoachComp)})`, de: `Gehen lassen (+${formatMoney(staffPoachComp)})` },
          goodPct: 100,
          goodTxt: { en: `+${formatMoney(staffPoachComp)} Cash, Tactical Loss (OVR -2)`, de: `+${formatMoney(staffPoachComp)} Ablse, Taktikverlust (GES -2)` },
        },
        cost: staffMatchCost,
        saleVal: staffPoachComp,
      },
      {
        type: 'youth_poached',
        title: { en: 'YOUTH PRODIGY TAPPED UP', de: 'JUGENDTALENT ABGEWORBEN' },
        desc: {
          en: (isEcuador || isUsa)
            ? 'A rich foreign giant is illegally contacting your top academy wonderkid behind your back!'
            : 'A Premier League giant is illegally contacting your top academy wonderkid behind your back!',
          de: (isEcuador || isUsa)
            ? 'Ein reicher Auslandsklub kontaktiert dein grtes Akademie-Talent heimlich hinter deinem Rcken!'
            : 'Ein englischer Topklub kontaktiert dein grtes Akademie-Talent heimlich hinter deinem Rcken!',
        },
        opt1: {
          title: { en: 'File FIFA Lawsuit Tribunal', de: 'FIFA-Klage einreichen' },
          goodPct: 50,
          goodTxt: { en: `Won Case! +${formatMoney(youthFifaWin)} FIFA Damages`, de: `Klage gewonnen! +${formatMoney(youthFifaWin)} Entschdigung` },
          badPct: 50,
          badTxt: { en: `Lost Tribunal (-${formatMoney(youthFifaFee)} Legal Fees)`, de: `Verloren (-${formatMoney(youthFifaFee)} Anwaltskosten)` },
        },
        opt2: {
          title: { en: `Offer Senior Contract (-${formatMoney(youthPromoteCost)})`, de: `Profi-Vertrag geben (-${formatMoney(youthPromoteCost)})` },
          goodPct: 100,
          goodTxt: { en: 'Promoted to Senior Squad (+1 OVR)', de: 'Ins Profiteam befrdert (+1 GES)' },
        },
        opt3: {
          title: { en: `Accept Development Fee (+${formatMoney(youthFeeComp)})`, de: `Ausbildungsentschdigung (+${formatMoney(youthFeeComp)})` },
          goodPct: 100,
          goodTxt: { en: `+${formatMoney(youthFeeComp)} Cash Injection`, de: `+${formatMoney(youthFeeComp)} Ablse` },
        },
        cost: youthFifaFee,
        saleVal: youthFifaWin,
        invAmt: youthPromoteCost,
        offerVal: youthFeeComp,
      },
      {
        type: 'transfer_embargo',
        title: { en: 'FA TRANSFER EMBARGO THREAT', de: 'TRANSFER-SPERRE DROHT' },
        desc: {
          en: `The Football Licensing Board threatens a 1-year transfer embargo over overdue agent installment fees!`,
          de: 'Der Verband droht mit einer 1-jhrigen Transfer-Sperre wegen ausstehender Ratenzahlung fr alte Beraterhonorare!',
        },
        opt1: {
          title: { en: `Settle Overdue Payments (-${formatMoney(transferEmbargoPay)})`, de: `Raten begleichen (-${formatMoney(transferEmbargoPay)})` },
          goodPct: 100,
          goodTxt: { en: 'Embargo Lifted, Clean Record', de: 'Sperre abgewendet' },
        },
        opt2: {
          title: { en: 'Accept Transfer Restrictions', de: 'Sperre akzeptieren' },
          goodPct: 100,
          goodTxt: { en: 'Saves Cash, Key Transfers Restricted', de: 'Geld gespart, Key-Transfers blockiert' },
        },
        cost: transferEmbargoPay,
      },
      {
        type: 'squad_faction_war',
        title: { en: 'LOCKER ROOM SQUAD DIVISION', de: 'KABINEN-SPALTUNG' },
        desc: {
          en: `Toxic drama erupted between veterans and new arrivals after the long-serving captain was benched!`,
          de: 'Zwischen Routiniers und Neuzugngen ist ein Streit entbrannt, nachdem der Kapitn auf die Bank gesetzt wurde!',
        },
        opt1: {
          title: { en: `Host Alps Team Retreat (-${formatMoney(squadRetreatCost)})`, de: `Alpen-Teambuilding (-${formatMoney(squadRetreatCost)})` },
          goodPct: 100,
          goodTxt: { en: 'Harmony Restored, Squad OVR +1', de: 'Klima gerettet, Team-GES +1' },
        },
        opt2: {
          title: { en: 'Strip Captaincy & Enforce Discipline', de: 'Kapitnsbinde entziehen & durchgreifen' },
          goodPct: 100,
          goodTxt: { en: 'Squad Distracted (OVR -2), Board Rep +3', de: 'Unruhe (GES -2), Ansehen +3' },
        },
        cost: squadRetreatCost,
      },
      {
        type: 'sponsor_bankruptcy',
        title: { en: 'MAIN SPONSOR BANKRUPTCY', de: 'HAUPTSPONSOR-INSOLVENZ' },
        desc: {
          en: `Your primary jersey sponsor declared insolvency mid-season, leaving unpaid sponsorship invoices!`,
          de: 'Dein Hauptsponsor hat Insolvenz angemeldet! Mehrere Sponsorenraten bleiben unbezahlt.',
        },
        opt1: {
          title: { en: `Launch Emergency Retro Jersey (+${formatMoney(sponsorBankruptSale)})`, de: `Notfall-Sonder-Trikot (+${formatMoney(sponsorBankruptSale)})` },
          goodPct: 100,
          goodTxt: { en: `+${formatMoney(sponsorBankruptSale)} Merch Cash, +${getLeagueScaledFans(tier, 2000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans`, de: `+${formatMoney(sponsorBankruptSale)} Merch, +${getLeagueScaledFans(tier, 2000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans` },
        },
        opt2: {
          title: { en: `Sign Bargain Crypto Sponsor (+${formatMoney(sponsorCryptoCash)})`, de: `Crypto-Partner eilig unterschreiben (+${formatMoney(sponsorCryptoCash)})` },
          goodPct: 100,
          goodTxt: { en: `+${formatMoney(sponsorCryptoCash)} Cash, Reputation -5`, de: `+${formatMoney(sponsorCryptoCash)} Cash, Ansehen -5` },
        },
        opt3: {
          title: { en: 'Play Season with Clean Shirt', de: 'Saison mit blankem Trikot spielen' },
          goodPct: 100,
          goodTxt: { en: `Fan Respect Boost (+${getLeagueScaledFans(tier, 3000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Loyalty Fans)`, de: `Fan-Respekt (+${getLeagueScaledFans(tier, 3000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Treue Fans)` },
        },
        saleVal: sponsorBankruptSale,
        cost: sponsorCryptoCash,
      },
      {
        type: 'afc_richmond_believe',
        title: { en: 'TED LASSO: BELIEVE SIGN', de: 'TED LASSO: BELIEVE-SCHILD' },
        desc: {
          en: 'Ted Lasso hangs the iconic yellow BELIEVE sign above the locker room door before a crucial match!',
          de: 'Ted Lasso hngt das kultige gelbe BELIEVE-Schild ber die Kabinentr vor einem wichtigen Spiel!',
        },
        opt1: {
          title: { en: 'Touch the Believe Sign', de: 'Schild berhren' },
          goodPct: 100,
          goodTxt: { en: 'Team Morale Surge (+2 OVR)', de: 'Team-Moral Schub (+2 GES)' },
        },
        opt2: {
          title: { en: 'Focus on Routine', de: 'Routine wahren' },
          goodPct: 100,
          goodTxt: { en: 'Standard Preparation', de: 'Standard-Vorbereitung' },
        },
      },
      {
        type: 'afc_richmond_roy_kent',
        title: { en: 'ROY KENT LOCKER ROOM SPEECH', de: 'ROY KENT KABINENANSPRACHE' },
        desc: {
          en: 'Roy Kent delivers an explosive, passion-filled speech in the dressing room to fire up the team!',
          de: 'Roy Kent hlt eine mitreiende Ansprache in der Kabine, um das Team einzuschwren!',
        },
        opt1: {
          title: { en: "Unleash Roy's Fury", de: 'Roys Leidenschaft entfesseln' },
          goodPct: 100,
          goodTxt: { en: `Fighting Spirit Surge (+2 OVR, +${getLeagueScaledFans(tier, 2000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Kampfgeist (+2 GES, +${getLeagueScaledFans(tier, 2000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
        },
        opt2: {
          title: { en: 'Maintain Tactical Focus', de: 'Taktische Disziplin wahren' },
          goodPct: 100,
          goodTxt: { en: 'Controlled Tactics', de: 'Kontrolliertes Spiel' },
        },
      },
      {
        type: 'afc_richmond_dani_rojas',
        title: { en: 'DANI ROJAS: FOOTBALL IS LIFE!', de: 'DANI ROJAS: FOOTBALL IS LIFE!' },
        desc: {
          en: "Dani Rojas brings infectious joy to training, chanting 'Football is Life!' with boundless enthusiasm.",
          de: "Dani Rojas bringt pure Lebensfreude ins Training und ruft 'Football is Life!'",
        },
        opt1: {
          title: { en: 'Embrace the Joy', de: 'Freude teilen' },
          goodPct: 100,
          goodTxt: { en: `Team Energy Surge (+1 OVR, +${getLeagueScaledFans(tier, 3000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Team-Energie (+1 GES, +${getLeagueScaledFans(tier, 3000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
        },
        opt2: {
          title: { en: 'Enforce Strict Fitness Drills', de: 'Fitness-Drills verordnen' },
          goodPct: 100,
          goodTxt: { en: 'Stamina Focus', de: 'Ausdauer gefrdert' },
        },
      },
      {
        type: 'afc_richmond_biscuits',
        title: { en: 'TED LASSO: BISCUITS WITH THE BOSS', de: 'TED LASSO: KEKSE MIT DER CHEFIN' },
        desc: {
          en: "Ted Lasso brings freshly baked shortbread biscuits in a pink box to Rebecca's office for morning check-in!",
          de: "Ted Lasso bringt frisch gebackene Shortbread-Kekse in einer rosa Schachtel zu Rebecca ins Bro!",
        },
        opt1: {
          title: { en: 'Share Biscuits & Chat', de: 'Kekse teilen & plaudern' },
          goodPct: 100,
          goodTxt: { en: 'Culture Boost (+1 OVR, +2 Rep)', de: 'Kultur-Boost (+1 GES, +2 Ansehen)' },
        },
        opt2: {
          title: { en: 'Focus Purely on Tactical Dossier', de: 'Rein taktisches Dossier' },
          goodPct: 100,
          goodTxt: { en: 'Tactical Focus (+1 Rep)', de: 'Taktischer Fokus (+1 Ansehen)' },
        },
      },
      {
        type: 'afc_richmond_jamie_tartt',
        title: { en: 'JAMIE TARTT: FREE-KICK EGO', de: 'JAMIE TARTT: FREISTOSS-EGO' },
        desc: {
          en: "Jamie Tartt demands taking every free kick and penalty himself, shouting 'Me, me, me!' in the tunnel.",
          de: "Jamie Tartt fordert, jeden Freisto und Elfmeter selbst zu schieen, und ruft 'Ich, ich, ich!' im Spielertunnel.",
        },
        opt1: {
          title: { en: 'Give Jamie Free Rein', de: 'Jamie freie Hand lassen' },
          goodPct: 100,
          goodTxt: { en: 'Star Power Unleashed (+2 OVR, Rep -1)', de: 'Star-Power entfesselt (+2 GES, -1 Ansehen)' },
        },
        opt2: {
          title: { en: 'Mandate Teamwork & Extra Passes', de: 'Teamwork & Psse verordnen' },
          goodPct: 100,
          goodTxt: { en: `Team Spirit (+1 OVR, +${getLeagueScaledFans(tier, 2000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Teamgeist (+1 GES, +${getLeagueScaledFans(tier, 2000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
        },
      },
      {
        type: 'afc_richmond_trent_crimm',
        title: { en: 'TRENT CRIMM: ALL-ACCESS BOOK', de: 'TRENT CRIMM: BUCH-REPORTAGE' },
        desc: {
          en: 'Journalist Trent Crimm (The Independent) requests embedded locker room access to write an in-depth book.',
          de: 'Journalist Trent Crimm moechte vollen Zugang zur Kabine fr ein Buch ber Nelson Road.',
        },
        opt1: {
          title: { en: 'Grant Unfiltered Access', de: 'Vollen Zugang gewhren' },
          goodPct: 100,
          goodTxt: { en: `Global Publicity (+${getLeagueScaledFans(tier, 3000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans, +3 Rep)`, de: `Welthype (+${getLeagueScaledFans(tier, 3000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans, +3 Ansehen)` },
        },
        opt2: {
          title: { en: 'Keep Locker Room Private', de: 'Kabinengeheimnis wahren' },
          goodPct: 100,
          goodTxt: { en: 'Internal Focus (+1 OVR)', de: 'Interner Fokus (+1 GES)' },
        },
      },
      {
        type: 'afc_richmond_sam_obisanya',
        title: { en: 'SAM OBISANYA: SPONSOR PROTEST', de: 'SAM OBISANYA: SPONSOREN-PROTEST' },
        desc: {
          en: 'Sam Obisanya tapes over the jersey sponsor logo in protest against environmental damage in his home country.',
          de: 'Sam Obisanya berklebt das Sponsoren-Logo aus Protest gegen Umweltverschmutzung in seiner Heimat.',
        },
        opt1: {
          title: { en: "Stand Proudly with Sam's Protest", de: 'Hinter Sam stellen' },
          goodPct: 100,
          goodTxt: { en: `Moral Leadership (+${getLeagueScaledFans(tier, 5000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans, +4 Rep)`, de: `Moralische Strke (+${getLeagueScaledFans(tier, 5000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans, +4 Ansehen)` },
        },
        opt2: {
          title: { en: 'Enforce Corporate Sponsor Contract', de: 'Sponsorenvertrag durchsetzen' },
          goodPct: 100,
          goodTxt: { en: 'Corporate Stability', de: 'Sponsoren-Stabilitt' },
        },
      },
      {
        type: 'afc_richmond_higgins',
        title: { en: "HIGGINS' WANDERING DESK", de: "HIGGINS' ROAMING BRO" },
        desc: {
          en: 'Leslie Higgins is roaming Nelson Road corridors with his laptop because his office was converted to storage.',
          de: 'Leslie Higgins wandert mit seinem Laptop durch die Flure, weil sein Bro besetzt ist.',
        },
        opt1: {
          title: { en: 'Assign Leslie a Deluxe Office', de: 'Eigenes Chefbro einrichten' },
          goodPct: 100,
          goodTxt: { en: 'Operations Smooth (+1 OVR, +2 Rep)', de: 'Ablufe perfekt (+2 Ansehen, +1 GES)' },
        },
        opt2: {
          title: { en: 'Let Leslie Roam (Jazz Morale Boost)', de: 'Leslie wandern lassen' },
          goodPct: 100,
          goodTxt: { en: 'Jazz Morale Boost (+1 OVR)', de: 'Jazz-Moral Schub (+1 GES)' },
        },
      },
      {
        type: 'afc_richmond_diamond_dogs',
        title: { en: 'DIAMOND DOGS EMERGENCY MEETING', de: 'DIAMOND DOGS NOTFALL-TREFFEN' },
        desc: {
          en: 'Ted, Beard, Nate, and Higgins call an emergency Diamond Dogs meeting to solve dressing room morale! AWOOOOO!',
          de: 'Ted, Beard, Nate und Higgins rufen ein Diamond Dogs Treffen aus, um die Kabine zu vereinen! AWOOOOO!',
        },
        opt1: {
          title: { en: 'Bark with the Dogs! AWOOOO!', de: 'Mit den Hunden bellen! AWOOOO!' },
          goodPct: 100,
          goodTxt: { en: 'Unstoppable Team Spirit (+2 OVR)', de: 'Unstoppbarer Teamgeist (+2 GES)' },
        },
        opt2: {
          title: { en: 'Offer Tactical Advice', de: 'Taktischen Rat geben' },
          goodPct: 100,
          goodTxt: { en: 'Tactical Council (+1 OVR, +2 Rep)', de: 'Taktischer Rat (+1 GES, +2 Ansehen)' },
        },
      },
      {
        type: 'afc_richmond_zava',
        title: { en: 'SUPERSTAR ZAVA ARRIVAL', de: 'SUPERSTAR ZAVA ANKUNFT' },
        desc: {
          en: 'Eccentric world-class striker Zava arrives at Nelson Road demanding avocado toast and total artistic freedom!',
          de: 'Der exzentrische Weltklasse-Stuermer Zava trifft ein und fordert Avocado-Toast & volle knstlerische Freiheit!',
        },
        opt1: {
          title: { en: 'Grant Zava Total Freedom', de: 'Zava Narrenfreiheit gewhren' },
          goodPct: 100,
          goodTxt: { en: `Spectacular Goals (+3 OVR, +${getLeagueScaledFans(tier, 5000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Spektakulre Tore (+3 GES, +${getLeagueScaledFans(tier, 5000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
        },
        opt2: {
          title: { en: 'Insist on Team Discipline', de: 'Auf Team-Taktik bestehen' },
          goodPct: 100,
          goodTxt: { en: 'Squad Order Preserved (+1 OVR)', de: 'Kaderdisziplin gewahrt (+1 GES)' },
        },
      },
      {
        type: 'top_club_real_madrid_galactico',
        title: { en: 'REAL MADRID: GALCTICO MANDATE', de: 'REAL MADRID: GALCTICO-MANDAT' },
        desc: {
          en: 'President Florentino Perez demands signing a world-famous Galctico superstar to shine at Santiago Bernabu!',
          de: 'Praesident Florentino Perez fordert die Verpflichtung eines weltberhmten Galctico-Superstars!',
        },
        opt1: {
          title: { en: 'Sign Galctico Superstar', de: 'Galctico verpflichten' },
          goodPct: 50,
          badPct: 50,
          badTxt: { en: 'Backfires spectacularly! (-2 OVR, -2000 Fans)', de: 'Spektakulr gescheitert! (-2 GES, -2000 Fans)' },
          goodTxt: { en: `Galctico Magic (+3 OVR, +${getLeagueScaledFans(tier, 10000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Galctico-Magie (+3 GES, +${getLeagueScaledFans(tier, 10000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
        },
        opt2: {
          title: { en: 'Focus on Collective System', de: 'Fokus auf Kollektiv' },
          goodPct: 100,
          goodTxt: { en: 'System Harmony (+1 OVR)', de: 'System-Harmonie (+1 GES)' },
        },
      },
      {
        type: 'top_club_real_madrid_remontada',
        title: { en: 'REAL MADRID: BERNABU REMONTADA DNA', de: 'REAL MADRID: BERNABU REMONTADA DNA' },
        desc: {
          en: 'Before a crucial Elite Cup night, Madridismo unleashes 90 minutes of Bernabu comeback magic!',
          de: 'Vor der Elite Cup Nacht beschwrt das Madridismo die Magie der Bernabu-Remontada!',
        },
        opt1: {
          title: { en: 'Unleash Bernabu Remontada Spirit', de: 'Bernabu-Remontada entfesseln' },
          goodPct: 50,
          badPct: 50,
          badTxt: { en: 'Backfires spectacularly! (-2 OVR, -2000 Fans)', de: 'Spektakulr gescheitert! (-2 GES, -2000 Fans)' },
          goodTxt: { en: `CL Comeback Aura (+2 OVR, +${getLeagueScaledFans(tier, 5000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `CL-Remontada Aura (+2 GES, +${getLeagueScaledFans(tier, 5000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
        },
        opt2: {
          title: { en: 'Play Controlled Possession', de: 'Kontrollierten Ballbesitz spielen' },
          goodPct: 100,
          goodTxt: { en: 'Controlled Game (+3 OVR)', de: 'Spielkontrolle (+3 GES)' },
        },
      },
      {
        type: 'top_club_barca_la_masia',
        title: { en: 'FC BARCELONA: LA MASIA WONDERKID', de: 'FC BARCELONA: LA MASIA JUWEL' },
        desc: {
          en: 'A 16-year-old winger from La Masia with Cruyffian vision is ready to stun Camp Nou!',
          de: 'Ein 16-jhriges Flgel-Juwel aus La Masia mit Cruyff-Geniestreich ist bereit frs Camp Nou!',
        },
        opt1: {
          title: { en: 'Promote Wonderkid to Starting XI', de: 'Juwel in Startelf berufen' },
          goodPct: 50,
          badPct: 50,
          badTxt: { en: 'Backfires spectacularly! (-2 OVR, -2000 Fans)', de: 'Spektakulr gescheitert! (-2 GES, -2000 Fans)' },
          goodTxt: { en: `La Masia Magic (+2 OVR, +${getLeagueScaledFans(tier, 4000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `La Masia Magie (+2 GES, +${getLeagueScaledFans(tier, 4000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
        },
        opt2: {
          title: { en: 'Protect Youth Development', de: 'Talent behutsam aufbauen' },
          goodPct: 100,
          goodTxt: { en: 'Steady Growth (+3 OVR)', de: 'Solides Wachstum (+3 GES)' },
        },
      },
      {
        type: 'top_club_barca_palanca',
        title: { en: 'FC BARCELONA: ECONOMIC PALANCA LEVER', de: 'FC BARCELONA: FINANZIELLE PALANCA' },
        desc: {
          en: 'The board proposes pulling an economic lever (Palanca) selling 15% TV rights to instantly boost squad capital!',
          de: 'Der Vorstand schlgt vor, eine finanzielle Palanca zu aktivieren und 15% der TV-Rechte zu verkaufen!',
        },
        opt1: {
          title: { en: 'Activate Financial Palanca', de: 'Palanca aktivieren' },
          goodPct: 50,
          badPct: 50,
          badTxt: { en: 'Backfires spectacularly! (-2 OVR, -2000 Fans)', de: 'Spektakulr gescheitert! (-2 GES, -2000 Fans)' },
          goodTxt: { en: `Liquidity Boost (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, Rep -2)`, de: `Liquiditts-Schub (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))}, -2 Ansehen)` },
        },
        opt2: {
          title: { en: 'Enforce Salary Discipline', de: 'Gehaltsdisziplin wahren' },
          goodPct: 100,
          goodTxt: { en: 'Reputation Restored (+2 Rep)', de: 'Ansehen gestrkt (+2 Ansehen)' },
        },
      },
      {
        type: 'top_club_bayern_mia_san_mia',
        title: { en: 'BAYERN MNCHEN: MIA SAN MIA PRESSURE', de: 'BAYERN MNCHEN: MIA SAN MIA DRUCK' },
        desc: {
          en: 'Following a draw, Uli Hoene and the advisory board demand a dominant response in FC Hollywood media!',
          de: 'Nach einem Unentschieden fordert der Aufsichtsrat eine Ansage der Mia-San-Mia-Mentalitt!',
        },
        opt1: {
          title: { en: 'Proclaim Mia San Mia Dominance', de: 'Mia San Mia Ansage machen' },
          goodPct: 50,
          badPct: 50,
          badTxt: { en: 'Backfires spectacularly! (-2 OVR, -2000 Fans)', de: 'Spektakulr gescheitert! (-2 GES, -2000 Fans)' },
          goodTxt: { en: 'Dominance Restored (+2 OVR, +3 Rep)', de: 'Dominanz demonstriert (+2 GES, +3 Ansehen)' },
        },
        opt2: {
          title: { en: 'Conduct Quiet Internal Analysis', de: 'Interne Analyse' },
          goodPct: 100,
          goodTxt: { en: 'Tactical Focus (+1 OVR)', de: 'Taktischer Fokus (+1 GES)' },
        },
      },
      {
        type: 'top_club_bayern_oktoberfest',
        title: { en: 'BAYERN MNCHEN: OKTOBERFEST VISIT', de: 'BAYERN MNCHEN: OKTOBERFEST-BESUCH' },
        desc: {
          en: 'The entire squad visits Oktoberfest in traditional Lederhosen. Media cameras follow every table!',
          de: 'Die gesamte Mannschaft besucht das Oktoberfest in Lederhosen!',
        },
        opt1: {
          title: { en: 'Embrace Oktoberfest Teambuilding', de: 'Oktoberfest als Teambuilding' },
          goodPct: 50,
          badPct: 50,
          badTxt: { en: 'Backfires spectacularly! (-2 OVR, -2000 Fans)', de: 'Spektakulr gescheitert! (-2 GES, -2000 Fans)' },
          goodTxt: { en: `Bavarian Unity (+1 OVR, +${getLeagueScaledFans(tier, 3000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Team-Gefhl (+1 GES, +${getLeagueScaledFans(tier, 3000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
        },
        opt2: {
          title: { en: 'Enforce Strict Alcohol Curfew', de: 'Alkoholverbot & Zapfenstreich' },
          goodPct: 100,
          goodTxt: { en: 'Fitness Kept (+3 OVR)', de: 'Fitness gewahrt (+3 GES)' },
        },
      },
      {
        type: 'top_club_manutd_roy_keane',
        title: { en: 'MAN UNITED: ROY KEANE TV RANT', de: 'MAN UNITED: ROY KEANE TV-RANT' },
        desc: {
          en: "Former captain Roy Keane slams the squad on National TV: 'Doing their jobs? That is what they get paid for!'",
          de: "Legende Roy Keane wtet im TV: 'Ihren Job machen? Dafr werden sie bezahlt! Das war zu soft!'",
        },
        opt1: {
          title: { en: "Rally Squad with Keane's Fire", de: 'Team mit Keanes Wut anstacheln' },
          goodPct: 50,
          badPct: 50,
          badTxt: { en: 'Backfires spectacularly! (-2 OVR, -2000 Fans)', de: 'Spektakulr gescheitert! (-2 GES, -2000 Fans)' },
          goodTxt: { en: 'Fighting Spirit (+2 OVR)', de: 'Kampfgeist (+2 GES)' },
        },
        opt2: {
          title: { en: 'Defend Squad Professionally', de: 'Mannschaft schtzen' },
          goodPct: 100,
          goodTxt: { en: 'Leadership Praise (+2 Rep)', de: 'Fuehrungslob (+2 Ansehen)' },
        },
      },
      {
        type: 'top_club_manutd_fergie_time',
        title: { en: 'MAN UNITED: FERGIE TIME TRADITION', de: 'MAN UNITED: FERGIE TIME TRADITION' },
        desc: {
          en: 'At Old Trafford, the Theatre of Dreams demands relentless injury-time winning mentality!',
          de: 'Im Theatre of Dreams fordert die Stretford End Tribne die legendre Fergie-Time-Mentalitt!',
        },
        opt1: {
          title: { en: 'Unleash All-Out Attack!', de: 'Bedingungsose Attacke!' },
          goodPct: 50,
          badPct: 50,
          badTxt: { en: 'Backfires spectacularly! (-2 OVR, -2000 Fans)', de: 'Spektakulr gescheitert! (-2 GES, -2000 Fans)' },
          goodTxt: { en: `Fergie Time Winner (+2 OVR, +${getLeagueScaledFans(tier, 4000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Fergie Time Sieg (+2 GES, +${getLeagueScaledFans(tier, 4000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
        },
        opt2: {
          title: { en: 'Protect Lead with Controlled Passing', de: 'Vorsprung kontrollieren' },
          goodPct: 100,
          goodTxt: { en: 'Controlled Game (+3 OVR)', de: 'Spielkontrolle (+3 GES)' },
        },
      },
      {
        type: 'top_club_mancity_inverted',
        title: { en: 'MAN CITY: INVERTED FULLBACK SYSTEM', de: 'MAN CITY: INVERTIERTE AUSSENVERTEIDIGER' },
        desc: {
          en: 'Your tactics lab introduces pushing fullbacks into central midfield to overload possession in 3-2-4-1!',
          de: 'Dein Taktiklabor schlgt vor, die Auenverteidiger ins Mittelfeld zu schieben fr 70%+ Ballbesitz!',
        },
        opt1: {
          title: { en: 'Deploy Inverted System', de: 'Invertiertes System umsetzen' },
          goodPct: 50,
          badPct: 50,
          badTxt: { en: 'Backfires spectacularly! (-2 OVR, -2000 Fans)', de: 'Spektakulr gescheitert! (-2 GES, -2000 Fans)' },
          goodTxt: { en: 'Tactical Masterclass (+2 OVR, +3 Rep)', de: 'Taktik-Meisterklasse (+2 GES, +3 Ansehen)' },
        },
        opt2: {
          title: { en: 'Stick to Standard Formation', de: 'Standard-Formation behalten' },
          goodPct: 100,
          goodTxt: { en: 'Stability (+3 OVR)', de: 'Stabilitt (+3 GES)' },
        },
      },
      {
        type: 'top_club_liverpool_kop',
        title: { en: 'LIVERPOOL: ANFIELD KOP EUROPEAN NIGHT', de: 'LIVERPOOL: ANFIELD KOP EUROPA-NACHT' },
        desc: {
          en: "Spine-tingling 'You'll Never Walk Alone' fills Anfield ahead of a European showdown!",
          de: "Gnsehaut-Atmosphaere mit 'You'll Never Walk Alone' erschttert Anfield vor der Pokalnacht!",
        },
        opt1: {
          title: { en: 'Unleash Heavy-Metal Gegenpress', de: 'Gegenpressing entfesseln' },
          goodPct: 50,
          badPct: 50,
          badTxt: { en: 'Backfires spectacularly! (-2 OVR, -2000 Fans)', de: 'Spektakulr gescheitert! (-2 GES, -2000 Fans)' },
          goodTxt: { en: `Anfield Roar (+2 OVR, +${getLeagueScaledFans(tier, 5000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Anfield-Feuer (+2 GES, +${getLeagueScaledFans(tier, 5000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
        },
        opt2: {
          title: { en: 'Pace Squad Energy', de: 'Krfte dosieren' },
          goodPct: 100,
          goodTxt: { en: 'Controlled Energy (+3 OVR)', de: 'Energie kontolliert (+3 GES)' },
        },
      },
      {
        type: 'top_club_arsenal_arteta_passion',
        title: { en: 'ARSENAL: EMOTIONAL DERBY SPEECH', de: 'ARSENAL: EMOTIONALE KABINEN-MOTIVATION' },
        desc: {
          en: 'Bring intense emotional energy, lightbulbs, and dog Win to training before North London Derby!',
          de: 'Bringe emotionale Leidenschaft & Hund Win ins Training vor dem North London Derby!',
        },
        opt1: {
          title: { en: 'Fire Up Squad with Passion', de: 'Team heimachen' },
          goodPct: 50,
          badPct: 50,
          badTxt: { en: 'Backfires spectacularly! (-2 OVR, -2000 Fans)', de: 'Spektakulr gescheitert! (-2 GES, -2000 Fans)' },
          goodTxt: { en: `Derby Fire (+2 OVR, +${getLeagueScaledFans(tier, 3000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Derby-Feuer (+2 GES, +${getLeagueScaledFans(tier, 3000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
        },
        opt2: {
          title: { en: 'Focus on Set Piece Routines', de: 'Fokus auf Standards' },
          goodPct: 100,
          goodTxt: { en: 'Set Piece Precision (+3 OVR)', de: 'Standard-Przision (+3 GES)' },
        },
      },
      {
        type: 'top_club_chelsea_boehly_contract',
        title: { en: 'CHELSEA: 8-YEAR CONTRACT MEGA-DEAL', de: 'CHELSEA: 8-JAHRES-MEGA-VERTRAG' },
        desc: {
          en: 'Ownership wants to secure an elite young winger on an unprecedented 8-year contract to amortize fees!',
          de: 'Die Eigentmer wollen ein Toptalent mit einem 8-Jahres-Vertrag binden!',
        },
        opt1: {
          title: { en: 'Sign 8-Year Contract', de: '8-Jahres-Vertrag zeichnen' },
          goodPct: 50,
          badPct: 50,
          badTxt: { en: 'Backfires spectacularly! (-2 OVR, -2000 Fans)', de: 'Spektakulr gescheitert! (-2 GES, -2000 Fans)' },
          goodTxt: { en: 'Long-Term Asset (+2 OVR)', de: 'Langzeit-Talent (+2 GES)' },
        },
        opt2: {
          title: { en: 'Standard 4-Year Deal', de: 'Klassischer 4-Jahres-Vertrag' },
          goodPct: 100,
          goodTxt: { en: 'Flexibility Preserved (+3 OVR)', de: 'Flexibilitt gewahrt (+3 GES)' },
        },
      },
      {
        type: 'top_club_psg_parc_galacticos',
        title: { en: 'PSG: PARC DES PRINCES CL OBSESSION', de: 'PSG: PARC DES PRINCES CL-OBSESSION' },
        desc: {
          en: 'Ultras in Virage Auteuil demand hard team effort over individual megastar egos!',
          de: 'Ultras in der Virage Auteuil fordern bedingungslosen Teamgeist statt Star-Allren!',
        },
        opt1: {
          title: { en: 'Enforce Team-First Culture', de: 'Teamgeist durchsetzen' },
          goodPct: 50,
          badPct: 50,
          badTxt: { en: 'Backfires spectacularly! (-2 OVR, -2000 Fans)', de: 'Spektakulr gescheitert! (-2 GES, -2000 Fans)' },
          goodTxt: { en: `Paris Unity (+2 OVR, +${getLeagueScaledFans(tier, 4000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Pariser Einheit (+2 GES, +${getLeagueScaledFans(tier, 4000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
        },
        opt2: {
          title: { en: 'Cater to Star Megastars', de: 'Star-Spieler bevorzugen' },
          goodPct: 100,
          goodTxt: { en: 'Star Quality (+3 OVR)', de: 'Individualklasse (+3 GES)' },
        },
      },
      {
        type: 'top_club_juventus_fino_alla_fine',
        title: { en: 'JUVENTUS: FINO ALLA FINE SPIRIT', de: 'JUVENTUS: FINO ALLA FINE MENTALITT' },
        desc: {
          en: "The Bianconeri rally behind the 'Fino Alla Fine' slogan to grind out a gritty 1-0 victory in Turin!",
          de: "Die Bianconeri beschwren 'Fino Alla Fine', um in Turin ein eisernes 1:0 zu erzwingen!",
        },
        opt1: {
          title: { en: 'Embrace Gritty Defense', de: 'Eiserne Defensiv-Mentalitt' },
          goodPct: 50,
          badPct: 50,
          badTxt: { en: 'Backfires spectacularly! (-2 OVR, -2000 Fans)', de: 'Spektakulr gescheitert! (-2 GES, -2000 Fans)' },
          goodTxt: { en: 'Juve Wall (+2 OVR, +2 Rep)', de: 'Turiner Mauer (+2 GES, +2 Ansehen)' },
        },
        opt2: {
          title: { en: 'Play Offensive Football', de: 'Offensivfuball wagen' },
          goodPct: 100,
          goodTxt: { en: 'Attacking Spark (+3 OVR)', de: 'Offensiv-Schub (+3 GES)' },
        },
      },
      {
        type: 'top_club_bvb_yellow_wall',
        title: { en: 'DORTMUND: YELLOW WALL ROAR', de: 'DORTMUND: GELBE WAND EUPHORIE' },
        desc: {
          en: '25,000 supporters on the Gelbe Wand in Signal Iduna Park roar for fast, aggressive youth football!',
          de: '25.000 Stehpltze auf der Gelben Wand fordern rasanten Tempofuball im Signal Iduna Park!',
        },
        opt1: {
          title: { en: 'Unleash Full Youth Attack', de: 'Vollgas-Jugendoffensive' },
          goodPct: 50,
          goodTxt: { en: `Gelbe Wand Euphoria (+2 OVR, +${getLeagueScaledFans(tier, 5000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Gelbe Wand Euphorie (+2 GES, +${getLeagueScaledFans(tier, 5000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
          badPct: 50,
          badTxt: { en: `Overwhelmed Youth (-1 OVR, -${getLeagueScaledFans(tier, 2000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Unter Druck zerbrochen (-1 GES, -${getLeagueScaledFans(tier, 2000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
        },
        opt2: {
          title: { en: 'Controlled Tactical Balance', de: 'Taktische Balance wahren' },
          goodPct: 100,
          goodTxt: { en: 'Tactical Balance (+1 OVR)', de: 'Taktische Balance (+1 GES)' },
        },
      },
      {
        type: 'event_var_controversy',
        title: { en: 'VAR PENALTY CONTROVERSY', de: 'STREITUMSTRITTENER VAR-ELFMETER' },
        desc: {
          en: 'A controversial 94th-minute VAR handball decision costs a key point! Reporters surround you in tunnel.',
          de: 'Ein strittiger VAR-Handelfmeter in der 94. Minute kostet wertvolle Punkte! Mikrofone drngen sich im Tunnel.',
        },
        opt1: {
          title: { en: 'Blast Referee in Press Conference', de: 'Schiedsrichter im TV scharf kritisieren' },
          goodPct: 100,
          goodTxt: { en: `Fan Backing (+${getLeagueScaledFans(tier, 2000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans, Rep -2)`, de: `Fan-Rueckhalt (+${getLeagueScaledFans(tier, 2000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans, -2 Ansehen)` },
        },
        opt2: {
          title: { en: 'Accept Decision Professionally', de: 'Entscheidung professionell hinnehmen' },
          goodPct: 100,
          goodTxt: { en: 'Classy Conduct (+2 Rep)', de: 'Souvernes Auftreten (+2 Ansehen)' },
        },
      },
      {
        type: 'event_tactical_leak_tiktok',
        title: { en: 'TACTICAL SHEET LEAK ON TIKTOK', de: 'LEAK DES TAKTIKBOGENS AUF TIKTOK' },
        desc: {
          en: 'A youth reserve leaked your starting lineup and set-piece playbook on social media before matchday!',
          de: 'Ein Ergnzungsspieler hat deine Startelf & Freistovarianten vor dem Spiel auf TikTok gepostet!',
        },
        opt1: {
          title: { en: 'Fine Player & Adapt Tactics', de: 'Geldstrafe & Taktik anpassen' },
          goodPct: 100,
          goodTxt: { en: 'Surprise Variation (+1 OVR)', de: 'berraschungseffekt (+1 GES)' },
        },
        opt2: {
          title: { en: 'Capitalize on Viral Merchandise', de: 'Hype fr Merch nutzen' },
          goodPct: 100,
          goodTxt: { en: `Viral Cash (+${getLeagueScaledFans(tier, 3000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Viraler Hype (+${getLeagueScaledFans(tier, 3000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
        },
      },
      {
        type: 'event_legend_farewell_match',
        title: { en: 'CLUB LEGEND FAREWELL TESTIMONIAL', de: 'ABSCHIEDSSPIEL FR VEREINSLEGENDE' },
        desc: {
          en: 'Your 35-year-old club legend is retiring. Supporters demand a starting spot in the upcoming match!',
          de: 'Eine 35-jhrige Vereinslegende beendet die Karriere. Die Fans fordern einen Startelf-Einsatz!',
        },
        opt1: {
          title: { en: 'Start Club Legend', de: 'Legende in Startelf stellen' },
          goodPct: 100,
          goodTxt: { en: `Emotional Tribute (+${getLeagueScaledFans(tier, 5000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans, +3 Rep)`, de: `Emotionale Hommage (+${getLeagueScaledFans(tier, 5000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans, +3 Ansehen)` },
        },
        opt2: {
          title: { en: 'Prioritize Squad Performance', de: 'Leistungskriterium durchsetzen' },
          goodPct: 100,
          goodTxt: { en: 'Performance Priority (+1 OVR)', de: 'Leistungskriterium (+1 GES)' },
        },
      },
      {
        type: 'event_moneyball_scout',
        title: { en: 'MONEYBALL DATA ANALYTICS GEM', de: 'MONEYBALL DATA-ANALYSE JUWEL' },
        desc: {
          en: 'Data analysts highlight an unheralded 21-year-old midfielder with top-percentile progressive passing stats!',
          de: 'Deine Datenanalysten haben ein unentdecktes 21-jhriges Pass-Genie in der 3. Liga identifiziert!',
        },
        opt1: {
          title: { en: 'Sign Analytics Gem (20% Risk)', de: 'Data-Schnppchen verpflichten (20% Risiko)' },
          goodPct: 80,
          goodTxt: { en: 'Data Wonderkid (+2 OVR)', de: 'Data-Wunderkind (+2 GES)' },
          badTxt: { en: 'Data Flop (-1 OVR)', de: 'Data-Flop (-1 GES)' }
        },
        opt2: {
          title: { en: 'Trust Traditional Scout Intuition (0% Risk)', de: 'Traditionellem Scouting vertrauen (0% Risiko)' },
          goodPct: 100,
          goodTxt: { en: 'Safe Standard Scout Focus (+1 OVR)', de: 'Sicheres Standard-Scouting (+1 GES)' },
        },
      },
      {
        type: 'event_pitch_waterlogged',
        title: { en: 'PITCH WATERLOGGED EMERGENCY', de: 'UNWETTER & SCHLAMMSCHLACHT' },
        desc: {
          en: 'Torrential rain ruined the stadium pitch ahead of matchday. Heavy mud threatens tactical passing!',
          de: 'Sintflutartiger Regen hat den Stadionrasen vernichtet. Tiefschlamm bedroht das Passspiel!',
        },
        opt1: {
          title: { en: 'Install Emergency Pitch Drainage', de: 'Notfall-Drainage installieren' },
          goodPct: 100,
          goodTxt: { en: 'Pitch Restored (+1 OVR)', de: 'Rasen bespielbar (+1 GES)' },
        },
        opt2: {
          title: { en: 'Switch to Direct Long-Ball Tactics', de: 'Auf Kick-and-Rush umstellen' },
          goodPct: 100,
          goodTxt: { en: 'Mud Strategy (+1 OVR)', de: 'Schlamm-Taktik (+1 GES)' },
        },
      },
      {
        type: 'event_dressing_room_dj',
        title: { en: 'DRESSING ROOM DJ DISPUTE', de: 'KABINEN-MUSIK STREIT' },
        desc: {
          en: 'Veterans and young players are arguing over the pre-match music playlist in the locker room!',
          de: 'Fuehrungsspieler und Nachwuchstalente streiten um die Musik-Playlist in der Kabine!',
        },
        opt1: {
          title: { en: 'Appoint Team Captain as DJ', de: 'Kapitn bestimmt Playlist' },
          goodPct: 100,
          goodTxt: { en: 'Harmonious Locker Room (+1 OVR)', de: 'Harmonie in Kabine (+1 GES)' },
        },
        opt2: {
          title: { en: 'Enforce Focused Silence', de: 'Konzentrierte Ruhe verordnen' },
          goodPct: 100,
          goodTxt: { en: 'Strict Focus (+1 Rep)', de: 'Disziplin (+1 Ansehen)' },
        },
      },
      {
        type: 'event_fan_banner_protest',
        title: { en: 'ULTRAS BANNER: ATTACKING FOOTBALL', de: 'ULTRAS-TRANSPARENT: OFFENSIVFUSSBALL' },
        desc: {
          en: "Fans unfold a giant banner in South Stand: 'WE WANT ATTACKING FOOTBALL & PASSION!'",
          de: "Fans enthllen ein riesiges Transparent: 'WIR WOLLEN OFFENSIVFUSSBALL UND LEIDENSCHAFT!'",
        },
        opt1: {
          title: { en: 'Unleash High-Press Attacking System', de: 'Offensivfeuerwerk znden' },
          goodPct: 100,
          goodTxt: { en: `Attacking Passion (+2 OVR, +${getLeagueScaledFans(tier, 3000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Offensivfeuer (+2 GES, +${getLeagueScaledFans(tier, 3000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
        },
        opt2: {
          title: { en: 'Defend Tactical Balance', de: 'Taktische Disziplin verteidigen' },
          goodPct: 100,
          goodTxt: { en: 'Disciplined Game (+1 OVR)', de: 'Diszipliniertes Spiel (+1 GES)' },
        },
      },
      {
        type: 'scout_visit',
        title: { en: 'WONDERKID TALENT SCOUT REPORT', de: 'SCOUTING-TALENTENTDECKUNG' },
        desc: {
          en: 'A senior scout spotted an incredible raw wonderkid at a local youth tournament and offers priority signing rights!',
          de: 'Ein gestandener Scout hat bei einem Jugendturnier ein Riesentalent entdeckt und bietet dir das vorrangige Unterschriftsrecht an!',
        },
        opt1: {
          title: { en: `Sign Wonderkid to Academy (-${formatMoney(scoutCost)})`, de: `Talent verpflichten (-${formatMoney(scoutCost)})` },
          goodPct: 100,
          goodTxt: { en: 'Wonderkid Signed (+1 OVR)', de: 'Riesentalent im Kader (+1 GES)' },
        },
        opt2: {
          title: { en: 'Pass on Scout Proposal', de: 'Angebot ablehnen' },
          goodPct: 100,
          goodTxt: { en: 'No Effect', de: 'Keine Auswirkung' },
        },
        cost: scoutCost,
      },
      {
        type: 'rival_bankruptcy',
        title: { en: 'REGIONAL RIVAL INSOLVENCY', de: 'RIVALEN-INSOLVENZ' },
        desc: {
          en: 'A regional rival club has filed for bankruptcy. Their top stars are available at liquidation rates and fans seek a new home!',
          de: 'Ein regionaler Rivalenklub hat Insolvenz angemeldet! Leistungstrger stehen zum Schnppchenpreis bereit und Fans suchen einen neuen Verein.',
        },
        opt1: {
          title: { en: `Buy Liquidation Contracts (-${formatMoney(rivalLiqCost)})`, de: `Kaderverstrkung abwerben (-${formatMoney(rivalLiqCost)})` },
          goodPct: 100,
          goodTxt: { en: `+1 OVR, +${getLeagueScaledFans(tier, 2500, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans`, de: `+1 GES, +${getLeagueScaledFans(tier, 2500, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans` },
        },
        opt2: {
          title: { en: `Organize Charity Match (-${formatMoney(scoutCost)})`, de: `Benefizspiel ausrichten (-${formatMoney(scoutCost)})` },
          goodPct: 100,
          goodTxt: { en: `+4 Reputation, +${getLeagueScaledFans(tier, 4000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans`, de: `+4 Ansehen, +${getLeagueScaledFans(tier, 4000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans` },
        },
        cost: rivalLiqCost,
      },
      {
        type: 'sponsor_scandal',
        title: { en: 'MAIN SPONSOR PR SCANDAL', de: 'SPONSOREN-SKANDAL' },
        desc: {
          en: 'Your primary sponsor is involved in a severe public relations scandal! Media and fan groups demand immediate contract termination.',
          de: 'Dein Hauptsponsor steckt in einem schweren PR-Skandal! Medien und Fanverbnde fordern die sofortige Vertragsauflsung.',
        },
        opt1: {
          title: { en: `Terminate Contract Immediately (-${formatMoney(scoutCost)})`, de: `Vertrag fristlos kndigen (-${formatMoney(scoutCost)})` },
          goodPct: 100,
          goodTxt: { en: `+5 Reputation, +${getLeagueScaledFans(tier, 3000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans`, de: `+5 Ansehen, +${getLeagueScaledFans(tier, 3000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans` },
        },
        opt2: {
          title: { en: `Defend Sponsor & Collect Bonus (+${formatMoney(sponsorScandalGain)})`, de: `Sponsor verteidigen & Prmie kassieren (+${formatMoney(sponsorScandalGain)})` },
          goodPct: 100,
          goodTxt: { en: `+${formatMoney(sponsorScandalGain)} Cash, -5 Rep, -${getLeagueScaledFans(tier, 2000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans`, de: `+${formatMoney(sponsorScandalGain)} Cash, -5 Ansehen, -${getLeagueScaledFans(tier, 2000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans` },
        },
        cost: scoutCost,
        saleVal: sponsorScandalGain,
      },
      {
        type: 'international_callup',
        title: { en: 'NATIONAL TEAM CALL-UP CRISIS', de: 'NATIONALSPIELER-ABBERUFUNG' },
        desc: {
          en: 'Key starters have been called up for international fixtures during a crucial stretch of league matches!',
          de: 'Mehrere Leistungstrger wurden mitten in der entscheidenden Phase fr Lnderspiele abberufen!',
        },
        opt1: {
          title: { en: 'Support National Duty', de: 'Abstellung untersttzen' },
          goodPct: 100,
          goodTxt: { en: '+3 Reputation, Temporary -1 OVR', de: '+3 Ansehen, vorbergehend -1 GES' },
        },
        opt2: {
          title: { en: `Book High-Performance Recovery (-${formatMoney(intlCallupCost)})`, de: `Spezial-Regeneration buchen (-${formatMoney(intlCallupCost)})` },
          goodPct: 100,
          goodTxt: { en: 'Squad OVR Maintained', de: 'Kader-Fitness gewahrt' },
        },
        cost: intlCallupCost,
      },
      {
        type: 'squad_injury_wave',
        title: { en: 'CRITICAL INJURY WAVE', de: 'VERLETZUNGSSERIE' },
        desc: {
          en: 'A sudden wave of hamstring injuries struck key starters during intense training drills!',
          de: 'Eine Verletzungswelle mit mehreren Muskelbndelrissen trifft dein Team im wichtigsten Monat!',
        },
        opt1: {
          title: { en: `Hire Swiss Sports Clinic (-${formatMoney(injuryWaveCost)})`, de: `Schweizer Spezialklinik engagieren (-${formatMoney(injuryWaveCost)})` },
          goodPct: 100,
          goodTxt: { en: 'Starters Treated, OVR Maintained', de: 'Spezialklinik heilt Kader, GES gehalten' },
        },
        opt2: {
          title: { en: 'Rely on Internal Academy Reserves', de: 'Eigenen Nachwuchs hochziehen' },
          goodPct: 100,
          goodTxt: { en: 'Temporary -1 OVR', de: 'Vorbergehend -1 GES' },
        },
        cost: injuryWaveCost,
      },
      {
        type: 'player_burnout',
        title: { en: 'SQUAD BURNOUT & OVERLOAD', de: 'TEAM-BERLASTUNG' },
        desc: {
          en: 'Sports science analytics reveal extreme physical burnout and mental fatigue across the squad!',
          de: 'Die Sportwissenschaft warnt vor akuter berlastung und drohendem Leistungsabfall der Mannschaft!',
        },
        opt1: {
          title: { en: `Mandatory Wellness & Spa Retreat (-${formatMoney(burnoutCost)})`, de: `Wellness-Camp buchen (-${formatMoney(burnoutCost)})` },
          goodPct: 100,
          goodTxt: { en: 'Energy Restored (+1 OVR)', de: 'Kader regeneriert (+1 GES)' },
        },
        opt2: {
          title: { en: 'Enforce Double Hard-Work Drills', de: 'Hrtetraining anordnen' },
          goodPct: 100,
          goodTxt: { en: 'Squad Exhausted (-1 OVR)', de: 'Team berspult (-1 GES)' },
        },
        cost: burnoutCost,
      },
      {
        type: 'jersey_leak',
        title: { en: 'NEXT SEASON JERSEY LEAK', de: 'TRIKOT-LEAK' },
        desc: {
          en: "Unreleased designs for next season's kit leaked on social media and sparked viral fan excitement!",
          de: 'Der unverffentlichte Trikot-Entwurf der nchsten Saison ist ins Netz gelangt und lst Riesen-Hype aus!',
        },
        opt1: {
          title: { en: `Launch Pre-Orders Immediately (+${formatMoney(jerseyLeakGain)})`, de: `Vorbestellungen sofort starten (+${formatMoney(jerseyLeakGain)})` },
          goodPct: 100,
          goodTxt: { en: `+${formatMoney(jerseyLeakGain)} Merch Cash, +${getLeagueScaledFans(tier, 3000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans`, de: `+${formatMoney(jerseyLeakGain)} Merch, +${getLeagueScaledFans(tier, 3000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans` },
        },
        opt2: {
          title: { en: 'Restrict Leaks & Preserve Exclusivity', de: 'Exklusivitt wahren' },
          goodPct: 100,
          goodTxt: { en: `+${getLeagueScaledFans(tier, 1000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans, +2 Reputation`, de: `+${getLeagueScaledFans(tier, 1000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans, +2 Ansehen` },
        },
        saleVal: jerseyLeakGain,
      },
      {
        type: 'transfer_rumor_leak',
        title: { en: 'TRANSFER NEGOTIATION LEAK', de: 'TRANSFER-LEAK' },
        desc: {
          en: 'Secret negotiations for a top transfer target leaked to sports tabloids, driving up player demands!',
          de: 'Geheime Verhandlungen mit einem Wunschspieler wurden an die Presse geleakt! Konkurrenten bieten mit.',
        },
        opt1: {
          title: { en: `Hijack Deal with High Signing Bonus (-${formatMoney(transferLeakCost)})`, de: `Deal mit Handgeld erzwingen (-${formatMoney(transferLeakCost)})` },
          goodPct: 100,
          goodTxt: { en: 'Target Secured (+1 OVR)', de: 'Wunschspieler verpflichtet (+1 GES)' },
        },
        opt2: {
          title: { en: 'Abort Negotiations & Publicly Deny', de: 'Verhandlungen abbrechen & dementieren' },
          goodPct: 100,
          goodTxt: { en: '+2 Reputation', de: '+2 Ansehen' },
        },
        cost: transferLeakCost,
      },
      {
        type: 'rival_manager_trash_talk',
        title: { en: 'RIVAL MANAGER PRESS TRASH-TALK', de: 'TRAINER-LSTERATTAKKE' },
        desc: {
          en: 'A rival manager insulted your tactical style in the press, claiming your squad is overrated and lucky!',
          de: 'Der gegnerische Trainer verspottet deine Taktik auf der Pressekonferenz und nennt dein Team berschtzt!',
        },
        opt1: {
          title: { en: 'Fire Up Squad in Locker Room', de: 'Kabinenansprache nutzen & Team anfeuern' },
          goodPct: 100,
          goodTxt: { en: 'Locker Room Fired Up (+1 OVR)', de: 'Wut entfacht (+1 GES)' },
        },
        opt2: {
          title: { en: 'Maintain Class & Ignore Provocation', de: 'Souvern bleiben & antworten' },
          goodPct: 100,
          goodTxt: { en: '+2 Reputation', de: '+2 Ansehen' },
        },
      },
      {
        type: 'player_viral_star',
        title: { en: 'PLAYER VIRAL SOCIAL MEDIA STAR', de: 'SOCIAL MEDIA VIRAL-STAR' },
        desc: {
          en: 'Your young winger went viral on TikTok & Instagram with a skill challenge, bringing massive global publicity!',
          de: 'Dein Flgelstrmer wird mit einem Skill-Video zum weltweiten TikTok-Trending-Topic!',
        },
        opt1: {
          title: { en: `Capitalize on Viral Merchandise (+${formatMoney(jerseyLeakGain)})`, de: `Social-Media-Shop ausbauen (+${formatMoney(jerseyLeakGain)})` },
          goodPct: 100,
          goodTxt: { en: `+${formatMoney(jerseyLeakGain)} Merch Cash, +${getLeagueScaledFans(tier, 5000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans`, de: `+${formatMoney(jerseyLeakGain)} Merch, +${getLeagueScaledFans(tier, 5000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans` },
        },
        opt2: {
          title: { en: 'Focus Player on Football Discipline', de: 'Fokus rein auf Fussball lenken' },
          goodPct: 100,
          goodTxt: { en: 'Player Grounded & Focused (+1 OVR)', de: 'Spieler fokussiert (+1 GES)' },
        },
        saleVal: jerseyLeakGain,
      },
      {
        type: 'football_legend_praise',
        title: { en: 'FOOTBALL LEGEND PRAISE', de: 'FUSSBALLLEGENDE-LOB' },
        desc: {
          en: 'A legendary World Cup icon praised your tactical vision on national TV, calling you a managerial genius!',
          de: 'Eine absolute Weltfuballer-Legende schwrmt im Fernsehen in hchsten Tnen von deiner Taktik!',
        },
        opt1: {
          title: { en: `Invite Legend as Special Ambassador (-${formatMoney(legendAmbassadorCost)})`, de: `Legende als Botschafter binden (-${formatMoney(legendAmbassadorCost)})` },
          goodPct: 100,
          goodTxt: { en: `+5 Reputation, +${getLeagueScaledFans(tier, 4000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans`, de: `+5 Ansehen, +${getLeagueScaledFans(tier, 4000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans` },
        },
        opt2: {
          title: { en: 'Humbly Thank Legend in Interview', de: 'Demtig im Interview bedanken' },
          goodPct: 100,
          goodTxt: { en: '+3 Reputation', de: '+3 Ansehen' },
        },
        cost: legendAmbassadorCost,
      },
      // Italian Ultras Events (only active in Italy)
      {
        type: 'ita_ultras_curva_choreography',
        title: { en: 'CURVA TIFO CHOREOGRAPHY FUNDING', de: 'CURVA TIFO-CHOREO UNTERSTTZUNG' },
        desc: {
          en: 'Ultras capos request 50,000 to construct a massive stadium-wide choreography banner and smoke display for the upcoming derby!',
          de: 'Der Capo der Curva fordert 50.000  fr eine gigantische Tifo-Choreographie mit Riesenbanner und Rauch vor dem Derby!',
        },
        opt1: {
          title: { en: `Fund Curva Choreo (-${formatMoney(getLeagueScaledVal(tier, 50000, clubCountry))})`, de: `Choreo finanzieren (-${formatMoney(getLeagueScaledVal(tier, 50000, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: `Electric Atmosphere (+1 OVR, +${getLeagueScaledFans(tier, 2500, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Tifo-Spektakel (+1 GES, +${getLeagueScaledFans(tier, 2500, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
        },
        opt2: {
          title: { en: 'Decline Choreo Funding', de: 'Finanzierung ablehnen' },
          goodPct: 100,
          goodTxt: { en: `Ultras Silent Protest (-1 OVR, -${getLeagueScaledFans(tier, 1000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Stiller Protest der Curva (-1 GES, -${getLeagueScaledFans(tier, 1000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
        },
        cost: getLeagueScaledVal(tier, 50000, clubCountry),
      },
      {
        type: 'ita_ultras_jersey_surrender',
        title: { en: 'ULTRAS DEMAND SHIRT SURRENDER', de: 'ULTRAS FORDERN TRIKOT-ABGABE' },
        desc: {
          en: 'Furious Ultras call the team to the Curva perimeter fence after a derby loss, demanding players surrender their jerseys ("Dateci le maglie!")!',
          de: 'Wtende Ultras zitieren das Team nach der Niederlage an den Zaun und fordern lautstark die Trikot-Abgabe ("Dateci le maglie!")!',
        },
        opt1: {
          title: { en: 'Surrender Jerseys & Apologize', de: 'Trikots abgeben & demtig entschuldigen' },
          goodPct: 100,
          goodTxt: { en: 'Public Humiliation (-3 Reputation)', de: 'PR-Demtigung (-3 Ansehen)' },
        },
        opt2: {
          title: { en: 'Refuse & Stand Up to Ultras', de: 'Trikots behalten & Kontra geben' },
          goodPct: 100,
          goodTxt: { en: `Squad Unity Surge (+2 OVR, -${getLeagueScaledFans(tier, 2000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Kader rckt zusammen (+2 GES, -${getLeagueScaledFans(tier, 2000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans Boykott)` },
        },
      },
      {
        type: 'ita_ultras_training_blockade',
        title: { en: 'TRAINING GROUND ULTRAS SIEGE', de: 'ULTRAS-BLOCKADE AM TRAININGSGELNDE' },
        desc: {
          en: '500 Ultras block the training ground gates with smoke bombs, demanding a face-to-face confrontation with squad leaders!',
          de: '500 Ultras blockieren mit Rauchbomben die Zufahrt zum Trainingsgelnde und verlangen ein Gesprch mit dem Trainer!' },
        opt1: {
          title: { en: 'Confront Capo Ultra Directly', de: 'Dem Capo Ultra direkt entgegentreten' },
          goodPct: 100,
          goodTxt: { en: `Earn Curva Respect (+1 OVR, +${getLeagueScaledFans(tier, 3000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Respekt der Curva (+1 GES, +${getLeagueScaledFans(tier, 3000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
        },
        opt2: {
          title: { en: `Call Police Escort (-${formatMoney(getLeagueScaledVal(tier, 30000, clubCountry))})`, de: `Polizeischutz anfordern (-${formatMoney(getLeagueScaledVal(tier, 30000, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: 'Training Held, Ultras Hostile (-3 Rep)', de: 'Training stattgefunden, Ultras feindselig (-3 Ansehen)' },
        },
        cost: getLeagueScaledVal(tier, 30000, clubCountry),
      },
      {
        type: 'ita_ultras_vespa_escort',
        title: { en: 'ULTRAS VESPA MOTORCADE ESCORT', de: 'VESPA-KORSO ZUM STADION' },
        desc: {
          en: 'Over 1,000 Ultras on Vespas with red flares surround and escort the team bus through city streets to the stadium!',
          de: 'ber 1.000 Ultras auf Vespas begleiten den Mannschaftsbus mit roten Fackeln durch die Stadt zum Stadion!',
        },
        opt1: {
          title: { en: 'Celebrate on Bus Roof', de: 'Auf dem Dach mitfeiern' },
          goodPct: 100,
          goodTxt: { en: `Adrenaline Surge (+2 OVR, +${getLeagueScaledFans(tier, 3000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Gnsehaut-Schub (+2 GES, +${getLeagueScaledFans(tier, 3000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
        },
        opt2: {
          title: { en: 'Maintain Calm Isolation', de: 'Fokus behalten' },
          goodPct: 100,
          goodTxt: { en: 'Standard Match Prep', de: 'Normale Spielvorbereitung' },
        },
      },
      {
        type: 'ita_ultras_daspo_sanction',
        title: { en: 'FIGC CURVA CLOSURE THREAT', de: 'FIGC SPERRE DER CURVA DROHT' },
        desc: {
          en: 'The FIGC disciplinary panel threatens a 2-match Curva closure after Ultras lit flares and displayed banned banners.',
          de: 'Der Disziplinarrat der FIGC droht wegen Pyrotechnik und verbotenen Bannern mit einer zweimonatigen Schliessung der Curva!' },
        opt1: {
          title: { en: `Pay Fine & Appeal (-${formatMoney(getLeagueScaledVal(tier, 80000, clubCountry))})`, de: `Strafe zahlen & Einspruch (-${formatMoney(getLeagueScaledVal(tier, 80000, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: `Curva Remains Open (+${getLeagueScaledFans(tier, 1500, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Curva bleibt offen (+${getLeagueScaledFans(tier, 1500, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
        },
        opt2: {
          title: { en: 'Accept Curva Closure', de: 'Sperre akzeptieren' },
          goodPct: 100,
          goodTxt: { en: `Ghostly Stadium (-2 OVR, -${getLeagueScaledFans(tier, 2000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Geisterstimmung im Stadion (-2 GES, -${getLeagueScaledFans(tier, 2000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
        },
        cost: getLeagueScaledVal(tier, 80000, clubCountry),
      },
      {
        type: 'fra_event_dncg_audit',
        title: { en: 'DNCG FINANCIAL AUDIT MANDATE', de: 'DNCG-FINANZPRFUNG DCISION' },
        desc: {
          en: 'The DNCG financial watchdog audits your wage-to-turnover ratio. They demand an immediate liquidity guarantee to avoid a transfer embargo!',
          de: 'Die DNCG (Finanzaufsicht) prft deine Gehaltsstruktur. Sie fordert eine sofortige Liquidittsgarantie zur Vermeidung einer Transfersperre!',
        },
        opt1: {
          title: { en: `Deposit Capital Guarantee (-${formatMoney(getLeagueScaledVal(tier, 120000, clubCountry))})`, de: `Eigenkapital einbringen (-${formatMoney(getLeagueScaledVal(tier, 120000, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: 'DNCG Audit Passed Cleanly (+3 Reputation)', de: 'DNCG-Prfung bestanden (+3 Ansehen)' },
        },
        opt2: {
          title: { en: 'Accept Wage Restraint & Transfer Sanction', de: 'Gehaltsstopp & Transfersperre akzeptieren' },
          goodPct: 100,
          goodTxt: { en: 'Avoid Cash Outlay, Squad Morale Drops (-1 OVR)', de: 'Kein Geld ntig, Kader-GES -1' },
        },
        cost: getLeagueScaledVal(tier, 120000, clubCountry),
      },
      {
        type: 'fra_event_ultras_pyro_show',
        title: { en: 'VIRAGE NORD PYROTECHNIC SHOW', de: 'PYRO-SHOW DER VIRAGE NORD' },
        desc: {
          en: 'The Virage Nord Ultras unleashed a breathtaking flare smoke show, but the LFP issued a heavy fine and partial stand closure threat!',
          de: 'Die Ultras der Virage Nord haben beim Derbysieg eine gigantische Pyro-Show gezndet! Die Liga LFP droht mit Geldstrafe und Teilsperrung der Tribne.',
        },
        opt1: {
          title: { en: `Pay LFP Fine & Defend Ultras (-${formatMoney(getLeagueScaledVal(tier, 60000, clubCountry))})`, de: `LFP-Strafe zahlen & Ultras sttzen (-${formatMoney(getLeagueScaledVal(tier, 60000, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: `Home Fortress Atmosphere (+1 OVR, +${getLeagueScaledFans(tier, 2500, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Kessel-Stimmung (+1 GES, +${getLeagueScaledFans(tier, 2500, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
        },
        opt2: {
          title: { en: 'Enforce Stand Closure & Condemn Pyro', de: 'Tribuenensperre durchsetzen & Pyro verurteilen' },
          goodPct: 100,
          goodTxt: { en: `Stand Closed (-10% Capacity, -${getLeagueScaledFans(tier, 1500, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Tribne gesperrt (-10% Kapazitt, -${getLeagueScaledFans(tier, 1500, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
        },
        cost: getLeagueScaledVal(tier, 60000, clubCountry),
      },
      {
        type: 'fra_event_cannes_glamour_gala',
        title: { en: 'FRENCH RIVIERA CELEBRITY RED CARPET', de: 'RIVIERA GLAMOUR & SPONSOREN-GALA' },
        desc: {
          en: 'A high-profile luxury fashion house invites your squad to a star-studded gala on the Croisette, proposing a lucrative endorsement deal!',
          de: 'Ein franzsisches Luxus-Label ldt dein Team zu einer VIP-Gala an der Cte dAzur ein und bietet einen lukrativen Sponsorendeal!',
        },
        opt1: {
          title: { en: 'Attend Gala & Sign Luxury Partnership', de: 'Gala besuchen & Modedeal unterzeichnen' },
          goodPct: 100,
          goodTxt: { en: `Fashion Endorsement (+${formatMoney(getLeagueScaledVal(tier, 25000, clubCountry))}/yr, +2 Rep)`, de: `Modedeal (+${formatMoney(getLeagueScaledVal(tier, 25000, clubCountry))}/Jahr, +2 Ansehen)` },
        },
        opt2: {
          title: { en: 'Decline Event (Focus on Tactical Drills)', de: 'Absagen & Taktiktraining fokussieren' },
          goodPct: 100,
          goodTxt: { en: 'Tactical Focus Surge (+1 OVR)', de: 'Fokus auf dem Platz (+1 GES)' },
        },
      },
      {
        type: 'fra_event_coupe_de_france_giant_killing',
        title: { en: 'COUPE DE FRANCE MAGIC & MUDDY PITCH', de: 'COUPE DE FRANCE POKAL-MAGIE' },
        desc: {
          en: 'A legendary Coupe de France tie pairs your club against an unyielding regional amateur side playing on a rain-soaked, muddy pitch!',
          de: 'Im Coupe de France wartet ein leidenschaftlicher Amateurverein auf tiefem Rasen vor kochenden Fans!',
        },
        opt1: {
          title: { en: `Deploy Professional Mud Gear & First Team (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})`, de: `Profi-Equipment & Bestbesetzung (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: `Clean Cup Progress (+${getLeagueScaledFans(tier, 1500, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Souverner Pokalsieg (+${getLeagueScaledFans(tier, 1500, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
        },
        opt2: {
          title: { en: 'Rest Key Stars & Rotate Lineup', de: 'Schlsselspieler schonen' },
          goodPct: 100,
          goodTxt: { en: 'Squad Rested, Minor Bruising (-1 OVR Fatigue)', de: 'Kader geschont (-1 GES Mdigkeit)' },
        },
        cost: getLeagueScaledVal(tier, 500, clubCountry),
      },
      {
        type: 'fra_event_academy_centre_de_formation',
        title: { en: 'CENTRE DE FORMATION WONDERKID GEM', de: 'CENTRE DE FORMATION TOPTALENT' },
        desc: {
          en: 'Your world-famous French Centre de Formation has produced a 16-year-old phenom winger scouted across Europe!',
          de: 'Dein Centre de Formation hat ein 16-jhriges Flgel-Phnomen hervorgebracht!',
        },
        opt1: {
          title: { en: `Promote Wonderkid to First Team (-${formatMoney(getLeagueScaledVal(tier, 20000, clubCountry))})`, de: `Toptalent in die Profi-Elf befrdern (-${formatMoney(getLeagueScaledVal(tier, 20000, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: `Wonderkid Breakthrough (+2 OVR, +${getLeagueScaledFans(tier, 2000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Juwel im Kader (+2 GES, +${getLeagueScaledFans(tier, 2000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
        },
        opt2: {
          title: { en: 'Sell Priority Youth Rights to Foreign Giant', de: 'Vorkaufsrecht an Grossklub verkaufen' },
          goodPct: 100,
          goodTxt: { en: `Youth Sale (+${formatMoney(getLeagueScaledVal(tier, 60000, clubCountry))})`, de: `Jugend-Ablse (+${formatMoney(getLeagueScaledVal(tier, 60000, clubCountry))})` },
        },
        cost: getLeagueScaledVal(tier, 20000, clubCountry),
        saleVal: getLeagueScaledVal(tier, 60000, clubCountry),
      },
      // German Specific Events
      {
        type: 'ger_event_50_plus_1_investor',
        title: { en: '50+1 RULE INVESTOR DEBATE', de: '50+1-REGEL INVESTOREN-DEBATTE' },
        desc: {
          en: `An international private equity firm offers a ${formatMoney(getLeagueScaledVal(tier, 50000, clubCountry))} capital injection in exchange for board influence, triggering intense fan protests!`,
          de: `Eine internationale Investmentgruppe bietet ${formatMoney(getLeagueScaledVal(tier, 50000, clubCountry))} Eigenkapital gegen Mitspracherecht, woraufhin die Fankurve auf die Barrikaden geht!`,
        },
        opt1: {
          title: { en: `Accept Capital Injection (+${formatMoney(getLeagueScaledVal(tier, 50000, clubCountry))})`, de: `Kapital annehmen (+${formatMoney(getLeagueScaledVal(tier, 50000, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: `+${formatMoney(getLeagueScaledVal(tier, 50000, clubCountry))} Cash, -${getLeagueScaledFans(tier, 2000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans`, de: `+${formatMoney(getLeagueScaledVal(tier, 50000, clubCountry))} Budget, -${getLeagueScaledFans(tier, 2000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans` },
        },
        opt2: {
          title: { en: 'Protect 50+1 & Decline Investor', de: '50+1 schtzen & Investor ablehnen' },
          goodPct: 100,
          goodTxt: { en: `Fan Unity (+${getLeagueScaledFans(tier, 1500, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans, +2 Rep)`, de: `Fan-Zusammenhalt (+${getLeagueScaledFans(tier, 1500, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans, +2 Ansehen)` },
        },
        saleVal: getLeagueScaledVal(tier, 50000, clubCountry),
      },
      {
        type: 'ger_event_oktoberfest_bierzelt',
        title: { en: 'OKTOBERFEST TEAM NIGHT OUT', de: 'OKTOBERFEST TEAMABEND' },
        desc: {
          en: 'Key players were spotted in traditional Lederhosen celebrating late in a VIP beer tent right before a big fixture.',
          de: 'Mehrere Leistungstrger wurden vor dem Spitzenspiel in Lederhosen beim Feiern im Bierzelt gesichtet. Die Presse fordert Konsequenzen.',
        },
        opt1: {
          title: { en: `Issue Disciplinary Fines (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})`, de: `Geldstrafen verhngen (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: `+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))} Fine, Squad Unrest (-1 OVR)`, de: `+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))} Strafe, Unruhe (-1 GES)` },
        },
        opt2: {
          title: { en: 'Join Team Building Celebration', de: 'Als Teambuilding abfeiern' },
          goodPct: 100,
          goodTxt: { en: `Team Spirit Boost (+1 OVR, +${getLeagueScaledFans(tier, 1000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Teamgeist gestrkt (+1 GES, +${getLeagueScaledFans(tier, 1000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
        },
        saleVal: getLeagueScaledVal(tier, 500, clubCountry),
      },
      {
        type: 'ger_event_tennisball_protest',
        title: { en: 'TENNIS BALL PITCH PROTEST', de: 'TENNISBALL-PROTEST DER ULTRAS' },
        desc: {
          en: 'Supporters threw thousands of tennis balls onto the pitch in protest against commercial kickoff times, delaying the match.',
          de: 'Die Ultras protestierten mit tausenden Tennisbllen auf dem Rasen gegen Anstozeiten, wodurch das Spiel fast abgebrochen wurde.',
        },
        opt1: {
          title: { en: `Pay FA Fine & Open Fan Dialogue (-${formatMoney(getLeagueScaledVal(tier, 20000, clubCountry))})`, de: `Verbands-Strafe zahlen & Fan-Dialog (-${formatMoney(getLeagueScaledVal(tier, 20000, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: `Ultras Backing (+${getLeagueScaledFans(tier, 2000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Rueckhalt der Kurve (+${getLeagueScaledFans(tier, 2000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
        },
        opt2: {
          title: { en: 'Publicly Condemn Protestors', de: 'Protest ffentlich verurteilen' },
          goodPct: 100,
          goodTxt: { en: `Fan Tension (-${getLeagueScaledFans(tier, 1500, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans, -1 Rep)`, de: `Verstimmung in der Kurve (-${getLeagueScaledFans(tier, 1500, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans, -1 Ansehen)` },
        },
        cost: getLeagueScaledVal(tier, 20000, clubCountry),
      },
      {
        type: 'ger_event_autobahn_bus_breakdown',
        title: { en: 'AUTOBAHN BUS BREAKDOWN', de: 'AUTOBAHN FANBUS-PANNE' },
        desc: {
          en: 'The main supporter bus broke down on the A9 Autobahn on the way to a crucial away match.',
          de: 'Der Haupt-Fanbus erlitt auf der A9 eine schwere Panne auf dem Weg zum entscheidenden Auswrtsspiel.',
        },
        opt1: {
          title: { en: `Dispatch Emergency Replacement Charter (-${formatMoney(getLeagueScaledVal(tier, 25, clubCountry))})`, de: `Ersatz-Shuttle organisieren (-${formatMoney(getLeagueScaledVal(tier, 25, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: `Away Atmosphere Boost (+1 OVR, +${getLeagueScaledFans(tier, 1000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Auswrts-Hexenkessel (+1 GES, +${getLeagueScaledFans(tier, 1000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
        },
        opt2: {
          title: { en: 'Leave Fans to Travel Independently', de: 'Fans individuell anreisen lassen' },
          goodPct: 100,
          goodTxt: { en: 'Subdued Away End (-500 Fans)', de: 'Geschwchter Auswrtsblock (-500 Fans)' },
        },
        cost: getLeagueScaledVal(tier, 25, clubCountry),
      },
      // Spanish Specific Events
      {
        type: 'esp_event_la_liga_fair_play',
        title: { en: 'LA LIGA SALARY CAP AUDIT', de: 'LA LIGA LMITE SALARIAL AUDIT' },
        desc: {
          en: 'La Liga financial controls require balancing wage bills before player registration closes.',
          de: 'Die strengen Gehaltsobergrenzen der La Liga fordern eine sofortige Bilanzanpassung vor dem Registrierungsfenster.',
        },
        opt1: {
          title: { en: `Activate Financial "Palanca" (+${formatMoney(getLeagueScaledVal(tier, 40000, clubCountry))})`, de: `Finanzielle "Palanca" aktivieren (+${formatMoney(getLeagueScaledVal(tier, 40000, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: `+${formatMoney(getLeagueScaledVal(tier, 40000, clubCountry))} Cash, -5% Sponsor Growth`, de: `+${formatMoney(getLeagueScaledVal(tier, 40000, clubCountry))} Budget, -5% Sponsoren-Wachstum` },
        },
        opt2: {
          title: { en: 'Enforce Wage Cap Discipline', de: 'Gehaltsdisziplin durchsetzen' },
          goodPct: 100,
          goodTxt: { en: 'Financial Stability (-1 OVR, +2 Rep)', de: 'Finanzdisziplin (+2 Ansehen, -1 GES)' },
        },
        saleVal: getLeagueScaledVal(tier, 40000, clubCountry),
      },
      {
        type: 'esp_event_el_clasico_media_circus',
        title: { en: 'DERBY MEDIA WAR', de: 'DERBY MEDIEN-SCHLACHT' },
        desc: {
          en: 'Provocative comments from a rival manager in MARCA and AS have ignited an intense media circus before the derby!',
          de: 'Provokante Aussagen des Gegners in MARCA und AS haben die Stimmung vor dem Derby auf den Siedepunkt gebracht!',
        },
        opt1: {
          title: { en: 'Launch Fierce Counter-Attack in Press', de: 'Scharf im Replik-Interview antworten' },
          goodPct: 100,
          goodTxt: { en: `Fan Hype (+${getLeagueScaledFans(tier, 2500, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans, +2 Rep)`, de: `Derby-Fieber (+${getLeagueScaledFans(tier, 2500, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans, +2 Ansehen)` },
        },
        opt2: {
          title: { en: 'Maintain Tactical Calm & Ignore Mindgames', de: 'Souvern schweigen & fokussieren' },
          goodPct: 100,
          goodTxt: { en: 'Tactical Focus (+1 Squad OVR)', de: 'Taktische Ruhe (+1 GES)' },
        },
      },
      {
        type: 'esp_event_torneo_verano_trophy',
        title: { en: 'SUMMER TROPHY INVITATION', de: 'SOMMER-POKAL EINLADUNG' },
        desc: {
          en: 'Your club received an invitation to a prestigious Spanish summer trophy match with lucrative global TV revenue.',
          de: 'Dein Klub erhlt eine Einladung zu einem traditionsreichen spanischen Sommer-Pokal mit hohen TV-Einnahmen.',
        },
        opt1: {
          title: { en: `Participate in Gala Match (+${formatMoney(getLeagueScaledVal(tier, 25000, clubCountry))})`, de: `Am Gala-Spiel teilnehmen (+${formatMoney(getLeagueScaledVal(tier, 25000, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: `+${formatMoney(getLeagueScaledVal(tier, 25000, clubCountry))} Cash, +${getLeagueScaledFans(tier, 1500, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans`, de: `+${formatMoney(getLeagueScaledVal(tier, 25000, clubCountry))} Einnahmen, +${getLeagueScaledFans(tier, 1500, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans` },
        },
        opt2: {
          title: { en: 'Focus Exclusively on Pre-season Training', de: 'Fokus rein auf Saisonvorbereitung' },
          goodPct: 100,
          goodTxt: { en: 'Squad Fitness (+1 Squad OVR)', de: 'Optimale Fitness (+1 GES)' },
        },
        saleVal: getLeagueScaledVal(tier, 25000, clubCountry),
      },
      {
        type: 'esp_event_cantera_gem',
        title: { en: 'LA CANTERA GEM BREAKTHROUGH', de: 'CANTERA-JUWEL DURCHBRUCH' },
        desc: {
          en: 'A 16-year-old talent from your youth academy (*La Cantera*) is making headlines with phenomenal technique.',
          de: 'Ein 16-jhriges Ausnahmetalent aus deiner Akademie (*La Cantera*) sorgt mit spektakulrer Technik fr Schlagzeilen.',
        },
        opt1: {
          title: { en: `Promote to First Team (-${formatMoney(getLeagueScaledVal(tier, 18000, clubCountry))})`, de: `In die Profi-Elf befrdern (-${formatMoney(getLeagueScaledVal(tier, 18000, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: `Academy Wonderkid (+2 OVR, +${getLeagueScaledFans(tier, 3000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Akademie-Star (+2 GES, +${getLeagueScaledFans(tier, 3000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
        },
        opt2: {
          title: { en: 'Sell Priority Rights to Premier League Giant', de: 'Vorkaufsrecht nach England verkaufen' },
          goodPct: 100,
          goodTxt: { en: `Transfer Payout (+${formatMoney(getLeagueScaledVal(tier, 55000, clubCountry))})`, de: `Ablse-Einnahme (+${formatMoney(getLeagueScaledVal(tier, 55000, clubCountry))})` },
        },
        cost: getLeagueScaledVal(tier, 18000, clubCountry),
        saleVal: getLeagueScaledVal(tier, 55000, clubCountry),
      },
      // Ecuador Specific Events
      {
        type: 'ecu_event_quito_altitude',
        title: { en: 'QUITO ALTITUDE MASTERY', de: 'ALTITUDE VORTEIL IN QUITO' },
        desc: {
          en: 'Visiting lowland rivals are struggling to breathe in thin mountain air at 2,850m altitude in Quito! Your staff suggests double intensity high-altitude pressing.',
          de: 'Gegner aus dem Tiefland ringen in den Anden auf 2.850m Hhe um Sauerstoff! Das Trainerteam schlgt extremes Hhenpressing vor.',
        },
        opt1: {
          title: { en: 'High-Altitude Pressing Blitz', de: 'Extremes Hhenpressing' },
          goodPct: 100,
          goodTxt: { en: `Altitude Shock (+1 OVR, +${getLeagueScaledFans(tier, 1500, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Hhenschock (+1 GES, +${getLeagueScaledFans(tier, 1500, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
        },
        opt2: {
          title: { en: 'Controlled Tactical Counter', de: 'Kontrolliertes Konterspiel' },
          goodPct: 100,
          goodTxt: { en: 'Tactical Discipline (+2 Rep)', de: 'Taktische Disziplin (+2 Ansehen)' },
        },
        extraData: {
          opt1Good: { ovr: 1, fans: getLeagueScaledFans(tier, 1500, clubCountry, tier) },
          opt2Good: { rep: 2 }
        }
      },
      {
        type: 'ecu_event_noche_blanca_yellow',
        title: { en: 'NOCHE BLANCA / AMARILLA FIESTA', de: 'NOCHE BLANCA PRSENTATION' },
        desc: {
          en: 'Your club is hosting the traditional season launch gala presentation with pyro shows, international guest stars, and packed stands!',
          de: 'Dein Klub veranstaltet die traditionsreiche Saison-Erffnungsshow mit Pyro, internationalen Gaststars und ausverkauftem Rngen!',
        },
        opt1: {
          title: { en: `Host Grand Presentation Gala (+${formatMoney(getLeagueScaledVal(tier, 25000, clubCountry))})`, de: `Gala-Prsentation veranstalten (+${formatMoney(getLeagueScaledVal(tier, 25000, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: `+${formatMoney(getLeagueScaledVal(tier, 25000, clubCountry))} Cash, +${getLeagueScaledFans(tier, 3000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans`, de: `+${formatMoney(getLeagueScaledVal(tier, 25000, clubCountry))} Einnahmen, +${getLeagueScaledFans(tier, 3000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans` },
        },
        opt2: {
          title: { en: 'Keep Focus on Closed Training Drills', de: 'Fokus rein auf geschlossenes Training' },
          goodPct: 100,
          goodTxt: { en: 'Squad Sharpness (+1 Squad OVR)', de: 'Optimale Form (+1 GES)' },
        },
        extraData: {
          opt1Good: { budget: getLeagueScaledVal(tier, 25000, clubCountry), fans: getLeagueScaledFans(tier, 3000, clubCountry, tier) },
          opt2Good: { ovr: 1 }
        }
      },
      {
        type: 'ecu_event_valle_chota_talent',
        title: { en: 'VALLE DEL CHOTA YOUTH DISCOVERY', de: 'VALLE DEL CHOTA TALENT-JUWEL' },
        desc: {
          en: 'Your scouts discover a gifted 17-year-old winger with explosive pace in the renowned Valle del Chota talent pipeline.',
          de: 'Deine Scouts entdecken einen 17-jhrigen Auenstrmer mit extremem Antritt in der Talentschmiede Valle del Chota.',
        },
        opt1: {
          title: { en: `Sign Prodigy to First Team (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})`, de: `Juwel verpflichten (-${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: `Explosive Prospect (+2 OVR, +${getLeagueScaledFans(tier, 2000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Rohdiamant (+2 GES, +${getLeagueScaledFans(tier, 2000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
        },
        opt2: {
          title: { en: 'Sell First-Refusal Rights to Brazilian Heavyweight', de: 'Vorkaufsrecht nach Brasilien verkaufen' },
          goodPct: 100,
          goodTxt: { en: `Transfer Proceeds (+${formatMoney(getLeagueScaledVal(tier, 45000, clubCountry))})`, de: `Ablse-Gewinn (+${formatMoney(getLeagueScaledVal(tier, 45000, clubCountry))})` },
        },
        extraData: {
          opt1Cost: getLeagueScaledVal(tier, 500, clubCountry),
          opt1Good: { ovr: 2, fans: getLeagueScaledFans(tier, 2000, clubCountry, tier) },
          opt2Good: { budget: getLeagueScaledVal(tier, 45000, clubCountry) }
        }
      },
      {
        type: 'club_magdeburg_block_u',
        title: { en: 'BLOCK U CHOREO', de: 'BLOCK U CHOREOGRAFIE' },
        desc: {
          en: 'The legendary Block U is planning a massive, stadium-wide choreography for the upcoming derby!',
          de: 'Der legendre Block U plant eine gigantische, stadionweite Choreografie fr das anstehende Derby!'
        },
        opt1: {
          title: { en: 'Financially Support the Choreo', de: 'Choreografie finanziell untersttzen' },
          goodPct: 100,
          goodTxt: { en: 'Blue-White Inferno! (Huge Boost)', de: 'Blau-weisses Inferno! (Riesiger Boost)' }
        },
        opt2: {
          title: { en: 'Let the Ultras organize independently', de: 'Ultras komplett eigenstndig organisieren lassen' },
          goodPct: 100,
          goodTxt: { en: 'Moderate Boost', de: 'Guter Boost' }
        },
        extraData: {
          opt1Cost: getLeagueScaledVal(tier, 5000, clubCountry),
          opt1Good: { ovr: 2, fans: getLeagueScaledFans(tier, 4000, clubCountry, tier) },
          opt2Good: { ovr: 1, fans: getLeagueScaledFans(tier, 1500, clubCountry, tier) }
        }
      },
      {
        type: 'club_magdeburg_europapokal',
        title: { en: '1974 LEGENDS GALA', de: '1974 LEGENDEN-GALA' },
        desc: {
          en: 'The club is hosting a gala to celebrate the 1974 European Cup Winners\' Cup victory. It requires significant funding to host the legends.',
          de: 'Der Club plant eine grosse Gala zu Ehren der Europapokalsieger von 1974. Die Organisation und Einladung der Legenden ist jedoch kostspielig.'
        },
        opt1: {
          title: { en: 'Host the Gala Extravaganza', de: 'Gala-Abend gross aufziehen' },
          goodPct: 100,
          goodTxt: { en: 'Gala Success (Huge Boost)', de: 'Gala-Erfolg (Riesiger Boost)' }
        },
        opt2: {
          title: { en: 'Focus funds on the current squad', de: 'Geld lieber in den aktuellen Kader stecken' },
          goodPct: 100,
          goodTxt: { en: 'Full focus on present (+1 OVR)', de: 'Fokus auf die Gegenwart (+1 GES)' }
        }
      },
      {
        type: 'ecu_event_copa_ecuador_fever',
        title: { en: 'COPA ECUADOR UNDERDOG DRAMA', de: 'COPA ECUADOR POKAL-SENSATION' },
        desc: {
          en: 'A lower-tier provincial club from Segunda Categora is challenging your team in Copa Ecuador on a bumpy grass field.',
          de: 'Ein motivierter Unterklassler aus der Segunda Categora fordert dein Team in der Copa Ecuador auf tiefem Rasen heraus.',
        },
        opt1: {
          title: { en: 'Field Strongest Starting XI', de: 'Strkste Elf auflaufen lassen' },
          goodPct: 100,
          goodTxt: { en: `Dominant Victory (+${getLeagueScaledFans(tier, 1000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans, +2 Rep)`, de: `Souverner Sieg (+2 Ansehen, +${getLeagueScaledFans(tier, 1000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
        },
        opt2: {
          title: { en: 'Rotate Squad & Give Academy Prospects Minutes', de: 'Kader rotieren & Jugend einsetzen' },
          goodPct: 100,
          goodTxt: { en: 'Academy Experience (+1 Youth OVR)', de: 'Jugend-Entwicklung (+1 GES Talent)' },
        },
        extraData: {
          opt1Good: { rep: 2, fans: getLeagueScaledFans(tier, 1000, clubCountry, tier) },
          opt2Good: { /* custom logic for youth OVR */ }
        }
      },
      // USA Specific Events
      {
        type: 'usa_event_dp_marquee_signing',
        title: { en: 'DESIGNATED PLAYER VETERAN OFFER', de: 'DESIGNATED PLAYER VETERANEN-TRANSFER' },
        desc: {
          en: 'A 34-year-old European World Cup veteran wants to join your MLS squad on a Designated Player (DP) contract! The signing would trigger massive shirt sales and global media buzz.',
          de: 'Ein 34-jhriger europischer Weltstar will als Designated Player (DP) in deinen Kader wechseln! Der Deal verspricht enorme Trikot-Verkufe und globale Medienaufmerksamkeit.',
        },
        opt1: {
          title: { en: `Sign DP Marquee Veteran (-${formatMoney(getLeagueScaledVal(tier, 35000, clubCountry))})`, de: `DP-Weltstar verpflichten (-${formatMoney(getLeagueScaledVal(tier, 35000, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: `Global Spotlight (+2 OVR, +${getLeagueScaledFans(tier, 8000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans, +2 Rep)`, de: `Weltweiter Fokus (+2 GES, +${getLeagueScaledFans(tier, 8000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans, +2 Ansehen)` },
        },
        opt2: {
          title: { en: 'Decline & Focus on Homegrown Academy Superstars', de: 'Ablehnen & auf eigene Eigengewchse setzen' },
          goodPct: 100,
          goodTxt: { en: 'Financial Stability (+1 Rep)', de: 'Finanzielle Disziplin (+1 Ansehen)' },
        },
        cost: getLeagueScaledVal(tier, 35000, clubCountry),
      },
      {
        type: 'usa_event_leagues_cup_fever',
        title: { en: 'NORTH AMERICAN CHALLENGE CUP SUMMER TAILGATE', de: 'NORTH AMERICAN CHALLENGE CUP FAN-TAILGATE' },
        desc: {
          en: 'Your stadium is hosting a high-profile North American Challenge Cup matchday with thousands of traveling supporters, live music, and pre-game tailgating celebrations!',
          de: 'Dein Stadion richtet einen hochkartigen Nordamerikanischen-Cup-Spieltag mit Live-Musik, Tausenden Gstefans und riesigem Tailgate-Fest aus!',
        },
        opt1: {
          title: { en: `Host Ultimate Fan Zone & Tailgate (-${formatMoney(getLeagueScaledVal(tier, 8000, clubCountry))})`, de: `Fan-Zone & Tailgate veranstalten (-${formatMoney(getLeagueScaledVal(tier, 8000, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: `Gate Revenues (+${formatMoney(getLeagueScaledVal(tier, 28000, clubCountry))}, +${getLeagueScaledFans(tier, 3000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Stadion-Einnahmen (+${formatMoney(getLeagueScaledVal(tier, 28000, clubCountry))}, +${getLeagueScaledFans(tier, 3000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
        },
        opt2: {
          title: { en: 'Focus Strictly on Tactical Preparation', de: 'Fokus rein auf die taktische Match-Vorbereitung' },
          goodPct: 100,
          goodTxt: { en: 'Tactical Focus (+1 OVR)', de: 'Taktischer Fokus (+1 GES)' },
        },
        cost: getLeagueScaledVal(tier, 8000, clubCountry),
        saleVal: getLeagueScaledVal(tier, 28000, clubCountry),
      },
      {
        type: 'usa_event_college_draft_pick',
        title: { en: 'SUPERDRAFT TOP ALL-AMERICAN PICK', de: 'SUPERDRAFT TOP ALL-AMERICAN TALENT' },
        desc: {
          en: 'Your scouts highlight a standout NCAA All-American forward with phenomenal physical metrics available in the draft window.',
          de: 'Deine Scouts empfehlen einen berragenden NCAA All-American Stuermer mit phnomenalen Physis-Werten im Draft-Fenster.',
        },
        opt1: {
          title: { en: `Trade Allocation Money for #1 Draft Pick (-${formatMoney(getLeagueScaledVal(tier, 12000, clubCountry))})`, de: `Allocation Money fr #1 Draft Pick tauschen (-${formatMoney(getLeagueScaledVal(tier, 12000, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: `Draft Wonderkid (+1 OVR, +${getLeagueScaledFans(tier, 1500, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Draft-Juwel (+1 GES, +${getLeagueScaledFans(tier, 1500, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` },
        },
        opt2: {
          title: { en: 'Pass on Draft Slot', de: 'Draft-Pick verfallen lassen' },
          goodPct: 100,
          goodTxt: { en: 'Budget Preserved', de: 'Budget geschont' },
        },
        cost: getLeagueScaledVal(tier, 12000, clubCountry),
      },
      {
        type: 'usa_event_artificial_turf_complaint',
        title: { en: 'ARTIFICIAL TURF SURFACE PREP', de: 'KUNSTRASEN ANPASSUNG' },
        desc: {
          en: 'Ahead of an away trip to a synthetic turf stadium, key players express concerns over joint fatigue and bounce physics.',
          de: 'Vor einer Auswrtsfahrt auf synthetischen Kunstrasen uern Schlsselspieler Bedenken wegen hoher Gelenkbelastung.',
        },
        opt1: {
          title: { en: `Equip Specialized Turf Footwear & Recovery (-${formatMoney(getLeagueScaledVal(tier, 6000, clubCountry))})`, de: `Spezialschuhe & Regeneration bereitstellen (-${formatMoney(getLeagueScaledVal(tier, 6000, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: 'Optimal Recovery (+1 Rep)', de: 'Optimale Vorbereitung (+1 Ansehen)' },
        },
        opt2: {
          title: { en: 'Standard Cleats & Routine Training', de: 'Normale Stollen & Standard-Training' },
          goodPct: 100,
          goodTxt: { en: 'Standard Match Prep', de: 'Standard Vorbereitung' },
        },
        cost: getLeagueScaledVal(tier, 6000, clubCountry),
      },
      {
        type: 'ecuador_altitude_mastery',
        title: { en: 'QUITO ALTITUDE MASTERY', de: 'QUITO-HHENMEISTERSCHAFT' },
        desc: {
          en: 'Your lowland rivals are struggling to breathe in the thin mountain air at 2,850m altitude in Quito. You have to decide tactically...',
          de: 'Ihre Rivalen aus dem Flachland haben Probleme, in der dnnen Bergluft auf 2.850m Hhe in Quito zu atmen. Sie mssen sich taktisch entscheiden...'
        },
        opt1: {
          title: { en: 'High-Altitude Pressing', de: 'Hochgeschwindigkeits-Pressing' },
          goodPct: 100,
          goodTxt: { en: 'Tactical Shock! (OVR Boost, MP Penalty)', de: 'Taktischer Schock! (GES Boost, MP Strafe)' },
          mpCost: 100
        },
        opt2: {
          title: { en: 'Controlled Counter', de: 'Kontrollierter Konter' },
          goodPct: 100,
          goodTxt: { en: 'Disciplined Game (+1 OVR, +3 Rep)', de: 'Diszipliniertes Spiel (+1 GES, +3 Rep)' }
        }
      },
      {
        type: 'ecuador_valle_chota_youth',
        title: { en: 'VALLE DEL CHOTA YOUTH', de: 'VALLE DEL CHOTA JUGENDTALENT' },
        desc: {
          en: 'Your scouts unearth a gifted 17-year-old winger with explosive pace from the famous Valle del Chota talent pipeline.',
          de: 'Ihre Scouts entdecken einen begabten 17-jhrigen Flgelspieler mit explosiver Geschwindigkeit aus dem berhmten Valle del Chota.'
        },
        opt1: {
          title: { en: `Sign to First Team (-${formatMoney(getLeagueScaledVal(tier, 5000, clubCountry))})`, de: `Ins erste Team holen (-${formatMoney(getLeagueScaledVal(tier, 5000, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: 'Wonderkid Arrives! (+2 OVR)', de: 'Wunderkind kommt! (+2 GES)' }
        },
        opt2: {
          title: { en: `Sell Rights to Brazil (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})`, de: `Rechte nach Brasilien verkaufen (+${formatMoney(getLeagueScaledVal(tier, 500, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: 'Massive Cash Injection', de: 'Massive Finanzspritze' }
        }
      },
      {
        type: 'ecuador_noche_fiesta',
        title: { en: 'NOCHE BLANCA / AMARILLA', de: 'NOCHE BLANCA / AMARILLA' },
        desc: {
          en: 'Your club is hosting the traditional South American season launch gala presentation. Blow budget on pyro, or focus on training?',
          de: 'Ihr Verein veranstaltet die traditionelle sdamerikanische Saisonauftakt-Gala. Budget fr Pyro verpulvern oder auf Training konzentrieren?'
        },
        opt1: {
          title: { en: `Huge Pyro Show (-${formatMoney(getLeagueScaledVal(tier, 8000, clubCountry))})`, de: `Riesige Pyro-Show (-${formatMoney(getLeagueScaledVal(tier, 8000, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: `Massive Hype (+${getLeagueScaledFans(tier, 6000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Riesen-Hype (+${getLeagueScaledFans(tier, 6000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` }
        },
        opt2: {
          title: { en: 'Closed Training', de: 'Geschlossenes Training' },
          goodPct: 100,
          goodTxt: { en: 'Laser Focus (+1 OVR, +2 Rep)', de: 'Laser-Fokus (+1 GES, +2 Rep)' }
        }
      },
      {
        type: 'ecuador_copa_underdog',
        title: { en: 'COPA ECUADOR DRAMA', de: 'COPA ECUADOR DRAMA' },
        desc: {
          en: 'You draw a lower-tier provincial club from the Segunda Categora on a notoriously bumpy, deep grass field.',
          de: 'Sie ziehen einen drittklassigen Provinzverein auf einem berchtigt holprigen, tiefen Rasenplatz.'
        },
        opt1: {
          title: { en: 'Risk Strongest XI', de: 'Strkste XI riskieren' },
          goodPct: 100,
          goodTxt: { en: 'Tough Win (+1 OVR, +2 Rep)', de: 'Harter Sieg (+2 Rep, +1 GES)' }
        },
        opt2: {
          title: { en: 'Rotate Squad (Safer)', de: 'Kader rotieren (Sicherer)' },
          goodPct: 100,
          goodTxt: { en: `Youth Gains Experience (+1 OVR, -${getLeagueScaledFans(tier, 1000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Jugend sammelt Erfahrung (+1 GES, -${getLeagueScaledFans(tier, 1000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` }
        }
      },
      {
        type: 'usa_college_superdraft',
        title: { en: 'COLLEGE SUPERDRAFT', de: 'COLLEGE SUPERDRAFT' },
        desc: {
          en: 'You hold the #1 pick in the College Draft. Will you select a raw athletic freak, or trade the pick for Allocation Money?',
          de: 'Sie haben den ersten Pick im College-Draft. Waehlen Sie ein athletisches Naturtalent oder tausen Sie den Pick gegen Budget?'
        },
        opt1: {
          title: { en: `Draft the Athlete (-${formatMoney(getLeagueScaledVal(tier, 2000, clubCountry))})`, de: `Talent draften (-${formatMoney(getLeagueScaledVal(tier, 2000, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: 'Generational Athlete (+2 OVR)', de: 'Ausnahmetalent (+2 GES)' }
        },
        opt2: {
          title: { en: `Trade Pick (+${formatMoney(getLeagueScaledVal(tier, 7000, clubCountry))})`, de: `Pick traden (+${formatMoney(getLeagueScaledVal(tier, 7000, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: 'General Allocation Money', de: 'Zustzliches Budget' }
        }
      },
      {
        type: 'usa_celebrity_investor',
        title: { en: 'HOLLYWOOD INVESTOR', de: 'HOLLYWOOD-INVESTOR' },
        desc: {
          en: 'A famous actor wants to buy a minority stake and bring reality TV cameras into the dressing room.',
          de: 'Ein berhmter Schauspieler moechte Anteile kaufen und Reality-TV-Kameras in die Kabine bringen.'
        },
        opt1: {
          title: { en: 'Embrace the Circus', de: 'Den Zirkus mitmachen' },
          goodPct: 100,
          goodTxt: { en: `Massive Exposure (+${formatMoney(getLeagueScaledVal(tier, 10000, clubCountry))}, +3 Rep, -100 MP)`, de: `Massive Prsenz (+${formatMoney(getLeagueScaledVal(tier, 10000, clubCountry))}, +3 Rep, -100 MP)` },
          mpCost: 100
        },
        opt2: {
          title: { en: 'Reject & Focus', de: 'Ablehnen & Fokussieren' },
          goodPct: 100,
          goodTxt: { en: 'No Distractions (+1 OVR)', de: 'Keine Ablenkungen (+1 GES)' }
        }
      },
      {
        type: 'usa_dp_opportunity',
        title: { en: 'DESIGNATED PLAYER', de: 'DESIGNATED PLAYER' },
        desc: {
          en: 'An aging European legend wants to join as a Designated Player. High wages, but huge commercial upside.',
          de: 'Eine alternde europische Legende will als Designated Player kommen. Hohes Gehalt, aber riesiges Potenzial.'
        },
        opt1: {
          title: { en: `Sign the Legend (-${formatMoney(getLeagueScaledVal(tier, 12000, clubCountry))})`, de: `Legende holen (-${formatMoney(getLeagueScaledVal(tier, 12000, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: `Star Power (+1 OVR, +${getLeagueScaledFans(tier, 5000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('en-US')} Fans)`, de: `Star-Power (+1 GES, +${getLeagueScaledFans(tier, 5000, currentState.club.country || 'GER', currentState.club.originalStartLeague || tier).toLocaleString('de-DE')} Fans)` }
        },
        opt2: {
          title: { en: 'Trust Local Talent', de: 'Auf lokale Talente vertrauen' },
          goodPct: 100,
          goodTxt: { en: 'Team Chemistry (+2 OVR)', de: 'Team-Chemie (+2 GES)' }
        }
      },
      {
        type: 'generic_saudi_takeover',
        title: { en: 'SOVEREIGN WEALTH FUND TAKEOVER', de: 'STAATSFONDS-UEBERNAHME' },
        desc: {
          en: 'A Middle Eastern sovereign wealth fund offers to buy your club and wipe out all existing debt with a massive capital injection!',
          de: 'Ein Staatsfonds bietet an, deinen Verein zu kaufen, alle Schulden zu tilgen und gigantisches Kapital einzuschießen!'
        },
        opt1: {
          title: { en: 'Accept Takeover', de: 'Annehmen' },
          goodPct: 100,
          goodTxt: { en: `+${formatMoney(getLeagueScaledVal(tier, 250000, clubCountry))} Windfall`, de: `+${formatMoney(getLeagueScaledVal(tier, 250000, clubCountry))} Kapital` }
        },
        opt2: {
          title: { en: 'Decline & Protect Tradition', de: 'Ablehnen' },
          goodPct: 100,
          goodTxt: { en: 'Fans Happy (+5 Rep)', de: 'Fans glücklich (+5 Ansehen)' }
        },
        offerVal: getLeagueScaledVal(tier, 250000, clubCountry),
        cost: getLeagueScaledFans(tier, 10000, clubCountry, currentState.club.originalStartLeague || tier)
      },
      (() => {
        const league = getLeagueInfo(tier, clubCountry);
        const tvRev = league.tvPrize || 5000;
        const isTakeoverSuccess = Math.random() > 0.35;
        const windfallVal = Math.max(
          getLeagueScaledVal(tier, 120000, clubCountry),
          Math.round(tvRev * 0.8),
          (league.wages || 2000) * 3
        );
        const rawLboDebt = Math.round(tvRev * 0.4);
        const cappedLboHit = -Math.min(Math.max(0, currentState.budget || 0), rawLboDebt);
        if (!isTakeoverSuccess) {
          return {
            type: 'dyn_takeover',
            title: {
              en: '⚠️ Hostile Leveraged Buyout Threat',
              de: '⚠️ Feindliche Leveraged-Buyout-Drohung'
            },
            desc: {
              en: 'Warning: Due diligence reveals the approaching consortium intends a debt-financed Leveraged Buyout (LBO) that would Saddle the treasury with acquisition fees instead of fresh equity!',
              de: 'Warnung: Die Prüfung zeigt, dass das Konsortium einen fremdfinanzierten Leveraged Buyout (LBO) plant, der die Vereinskasse belastet statt frisches Kapital zu bringen!'
            },
            opt1: {
              title: { en: 'Accept Restructuring Terms', de: 'Restrukturierung akzeptieren' },
              goodPct: 100,
              goodTxt: {
                en: cappedLboHit < 0 ? `LBO fees absorbed without debt (${formatMoney(cappedLboHit)})` : 'Treasury protected at €0 (+1 Rep)',
                de: cappedLboHit < 0 ? `LBO-Gebühren ohne Verschuldung gedeckt (${formatMoney(cappedLboHit)})` : 'Kasse bei 0 € geschützt (+1 Rep)'
              }
            },
            opt2: {
              title: { en: 'Publicly Back Current Board / Fan Trust Block', de: 'Vorstand & Fan-Trust öffentlich stützen (LBO blockieren)' },
              goodPct: 100,
              goodTxt: {
                en: 'Hostile LBO blocked! Zero budget impact (+2 Rep, +10 Morale)',
                de: 'Feindlicher LBO blockiert! Keine Kosten (+2 Ansehen, +10 Moral)'
              }
            },
            extraData: {
              opt1Good: { budget: cappedLboHit, rep: 1 },
              opt2Good: { budget: 0, rep: 2, morale: 10 }
            }
          } as GameEvent;
        }
        return {
          type: 'dyn_takeover',
          title: {
            en: 'CONSORTIUM TAKEOVER RUMORS',
            de: 'KONSORTIUM-ÜBERNAHMEGERÜCHTE'
          },
          desc: {
            en: `A wealthy international consortium has passed financial fit-and-proper vetting and tables a debt-free takeover injecting ${formatMoney(windfallVal)} into the club treasury!`,
            de: `Ein finanzstarkes Konsortium hat die Lizenzprüfung bestanden und bietet eine schuldenfreie Übernahme mit ${formatMoney(windfallVal)} frischem Kapital an!`
          },
          opt1: {
            title: { en: `Welcome Consortium Takeover (+${formatMoney(windfallVal)})`, de: `Übernahme begrüßen (+${formatMoney(windfallVal)})` },
            goodPct: 100,
            goodTxt: {
              en: `Debt wiped & war chest funded (+${formatMoney(windfallVal)}, +2 Rep)`,
              de: `Schulden getilgt & Transferkasse gefüllt (+${formatMoney(windfallVal)}, +2 Ansehen)`
            }
          },
          opt2: {
            title: { en: 'Publicly Back Current Board / Fan Trust', de: 'Aktuellen Vorstand & Tradition stützen' },
            goodPct: 100,
            goodTxt: {
              en: 'Supporter trust strengthened (+3 Rep, +10 Morale)',
              de: 'Fan-Vertrauen gestärkt (+3 Ansehen, +10 Moral)'
            }
          },
          extraData: {
            opt1Good: { budget: windfallVal, rep: 2 },
            opt2Good: { budget: 0, rep: 3, morale: 10 }
          }
        } as GameEvent;
      })()
    ];


    // Calculate if they have unprotected youth
    const unprotectedYouth = (currentState.youthPipeline || []).find(y => !y.isProtected && y.boost >= 3);
    const poachingCost = getLeagueScaledVal(tier, 25000, clubCountry);

    const extraEvents: GameEvent[] = [];
    if (unprotectedYouth) {
      extraEvents.push({
        type: 'youth_poaching_attempt',
        title: { en: 'YOUTH POACHING ATTEMPT!', de: 'ABWERBUNGSVERSUCH!' },
        desc: {
          en: `A massive rival club has illegally approached your unprotected top prospect, ${unprotectedYouth.name}. Pay an emergency loyalty bonus to keep him, or let him go!`,
          de: `Ein riesiger Rivale hat dein ungeschtztes Top-Talent, ${unprotectedYouth.name}, illegal kontaktiert. Zahle einen Notfall-Loyalittsbonus oder verliere ihn!`
        },
        opt1: {
          title: { en: `Pay Bonus (-${formatMoney(poachingCost)})`, de: `Bonus zahlen (-${formatMoney(poachingCost)})` },
          goodPct: 100,
          goodTxt: { en: `Keep ${unprotectedYouth.name} & Shield him`, de: `${unprotectedYouth.name} behalten & Schtzen` }
        },
        opt2: {
          title: { en: 'Let Him Walk', de: 'Gehen lassen' },
          goodPct: 100,
          goodTxt: { en: 'Lose Prospect (-OVR Potential)', de: 'Talent verlieren (-GES Potenzial)' }
        },
        cost: poachingCost
      });
    }

    if ((currentState.club.morale ?? 100) < 50) {
      extraEvents.push({
        type: 'toxic_dressing_room',
        title: { en: 'TOXIC DRESSING ROOM', de: 'TOXISCHE KABINE' },
        desc: {
          en: `The squad morale is collapsing. Star players are leaking internal fights to the press. Deal with it now!`,
          de: `Die Kadermoral kollabiert. Stars leaken interne Streits an die Presse. Du musst handeln!`
        },
        opt1: {
          title: { en: `Host Peace Talks (-${formatMoney(getLeagueScaledVal(tier, 5000, clubCountry))})`, de: `Friedensgesprche (-${formatMoney(getLeagueScaledVal(tier, 5000, clubCountry))})` },
          goodPct: 100,
          goodTxt: { en: 'Restore Morale (+15%)', de: 'Moral Retten (+15%)' }
        },
        opt2: {
          title: { en: 'Fine the Instigators', de: 'Rdelsfhrer bestrafen' },
          goodPct: 100,
          goodTxt: { en: 'Gain Cash, Squad Resents You (-OVR)', de: 'Geld gewinnen, Kader hasst dich (-GES)' }
        },
        cost: getLeagueScaledVal(tier, 5000, clubCountry)
      });
    }

    // Policy-driven dedicated events:
    if (currentState.stadiumPolicy === 'commercial') {
      const executiveUltrasBannerCost = getLeagueScaledVal(tier, 2500, clubCountry);
      const executiveUltrasTennisCost = getLeagueScaledVal(tier, 3000, clubCountry);
      const executiveUltrasBoycottCost = getLeagueScaledVal(tier, 2000, clubCountry);
      const executiveUltrasPyroCost = getLeagueScaledVal(tier, 3500, clubCountry);
      const executiveCorporateGain = getLeagueScaledVal(tier, 6000, clubCountry);

      extraEvents.push({
        type: 'commercial_ultras_banner_protest',
        title: { en: 'ULTRAS PROTEST EXECUTIVE SUITES', de: 'ULTRAS-PROTEST GEGEN LOGEN' },
        desc: {
          en: 'The Curva Ultras unveiled massive hostile banners protesting the expansion of luxury executive suites: "FOOTBALL IS FOR US, NOT CORPORATE BOXES!" They demand a cap on VIP hospitality expansions.',
          de: 'Die Ultras protestieren mit Riesenbannern gegen den Ausbau der VIP-Logen: "FUSSBALL GEHOERT UNS, NICHT DEN BUSINESS-LOGEN!" Sie fordern einen Stopp des Logenausbaus.'
        },
        opt1: {
          title: { en: `Cap VIP Growth & Subsidize Terraces (-${formatMoney(executiveUltrasBannerCost)})`, de: `Logen deckeln & Stehplätze bezuschussen (-${formatMoney(executiveUltrasBannerCost)})` },
          goodPct: 100,
          goodTxt: { en: `Curva reconciled! (+15 Morale, +${getLeagueScaledFans(tier, 150, clubCountry, tier)} Fans)`, de: `Kurve versöhnt! (+15 Moral, +${getLeagueScaledFans(tier, 150, clubCountry, tier)} Fans)` },
          icon: 'fa-shield-halved'
        },
        opt2: {
          title: { en: 'Protect Corporate Suite Revenue', de: 'VIP-Umsatz verteidigen' },
          goodPct: 50,
          goodTxt: { en: `Corporate clients applaud (+${formatMoney(executiveCorporateGain)}, -10 Morale)`, de: `Sponsoren zufrieden (+${formatMoney(executiveCorporateGain)}, -10 Moral)` },
          badPct: 50,
          badTxt: { en: 'Curva Walkout! Toxic atmosphere (-1 OVR, -20 Morale, -2 Rep)', de: 'Stimmungsboykott! (-1 GES, -20 Moral, -2 Rep)' },
          icon: 'fa-champagne-glasses'
        },
        extraData: {
          opt1Cost: executiveUltrasBannerCost,
          opt1Good: { morale: 15, fans: getLeagueScaledFans(tier, 150, clubCountry, tier) },
          opt2Good: { budget: executiveCorporateGain, morale: -10 },
          opt2Bad: { ovr: -1, morale: -20, rep: -2 }
        }
      });

      extraEvents.push({
        type: 'commercial_ultras_tennisball_protest',
        title: { en: 'TENNIS BALL CURVA PROTEST', de: 'TENNISBALL-PROTEST DER KURVE' },
        desc: {
          en: 'To protest modern corporate football and premium executive hospitality packages, ultras rained hundreds of tennis balls and fake cash onto the pitch, delaying kickoff by 15 minutes.',
          de: 'Aus Protest gegen Kommerzialisierung und VIP-Pakete warfen Ultras hunderte Tennisbälle und Falschgeld auf den Rasen. Das Spiel war 15 Minuten unterbrochen.'
        },
        opt1: {
          title: { en: `Pay FA Disciplinary Fine (-${formatMoney(executiveUltrasTennisCost)})`, de: `Verbandsstrafe zahlen (-${formatMoney(executiveUltrasTennisCost)})` },
          goodPct: 100,
          goodTxt: { en: 'Sanctions avoided & open fan forum (+5 Morale, +1 Rep)', de: 'Sperren abgewendet & Fandialog (+5 Moral, +1 Rep)' },
          icon: 'fa-file-invoice-dollar'
        },
        opt2: {
          title: { en: 'Crack Down on Ultras Leaders', de: 'Gegen Ultras-Anführer vorgehen' },
          goodPct: 35,
          goodTxt: { en: `Security praised by sponsors (+${formatMoney(getLeagueScaledVal(tier, 1500, clubCountry))}, +1 Rep)`, de: `Sicherheit gelobt (+${formatMoney(getLeagueScaledVal(tier, 1500, clubCountry))}, +1 Rep)` },
          badPct: 65,
          badTxt: { en: 'All Stands Boycott! Cauldron silenced (-1 OVR, -15 Morale)', de: 'Totalboykott! Keine Stimmung (-1 GES, -15 Moral)' },
          icon: 'fa-gavel'
        },
        extraData: {
          opt1Cost: executiveUltrasTennisCost,
          opt1Good: { morale: 5, rep: 1 },
          opt2Good: { budget: getLeagueScaledVal(tier, 1500, clubCountry), rep: 1 },
          opt2Bad: { ovr: -1, morale: -15 }
        }
      });

      extraEvents.push({
        type: 'commercial_ultras_silent_boycott',
        title: { en: 'CURVA SILENT BOYCOTT', de: 'SCHWEIGESTREIK DER FANKURVE' },
        desc: {
          en: 'Angry about corporate hospitality catering and rising general ticket prices, the ultras stage a 20-minute silent protest. The stadium feels like a corporate boardroom.',
          de: 'Wegen teurer VIP-Caterings und steigender Eintrittspreise streikt die Fankurve 20 Minuten lang stumm. Die Atmosphäre gleicht einem Sitzungszimmer.'
        },
        opt1: {
          title: { en: `Subsidize Terrace Matchday Tickets (-${formatMoney(executiveUltrasBoycottCost)})`, de: `Stehplätze bezuschussen (-${formatMoney(executiveUltrasBoycottCost)})` },
          goodPct: 100,
          goodTxt: { en: `Terrace roars back to life! (+20 Morale, +${getLeagueScaledFans(tier, 100, clubCountry, tier)} Fans)`, de: `Kurve explodiert vor Stimmung! (+20 Moral, +${getLeagueScaledFans(tier, 100, clubCountry, tier)} Fans)` },
          icon: 'fa-ticket'
        },
        opt2: {
          title: { en: 'Play Music Over Stadium PA', de: 'Musik aus Lautsprechern abspielen' },
          goodPct: 30,
          goodTxt: { en: 'Party atmosphere preserved (+5 Morale)', de: 'Party-Stimmung gerettet (+5 Moral)' },
          badPct: 70,
          badTxt: { en: 'Mocked nationwide for plastic atmosphere (-15 Morale, -2 Rep)', de: 'Bundesweiter Spott über Plastik-Atmosphäre (-15 Moral, -2 Rep)' },
          icon: 'fa-volume-high'
        },
        extraData: {
          opt1Cost: executiveUltrasBoycottCost,
          opt1Good: { morale: 20, fans: getLeagueScaledFans(tier, 100, clubCountry, tier) },
          opt2Good: { morale: 5 },
          opt2Bad: { morale: -15, rep: -2 }
        }
      });

      extraEvents.push({
        type: 'commercial_ultras_pyro_show',
        title: { en: 'DEFIANT ANTI-COMMERCIAL PYRO SHOW', de: 'ANTI-KOMMERZ PYRO-SHOW' },
        desc: {
          en: 'In open rebellion against the club executive hospitality rebranding, the active supporters ignited 50 red flares and launched fireworks behind the goal.',
          de: 'Gegen die neue VIP-Markenidentität zünden die Ultras 50 rote Bengalos und schießen Feuerwerk hinter dem Tor ab.'
        },
        opt1: {
          title: { en: `Pay Association Fine (-${formatMoney(executiveUltrasPyroCost)})`, de: `Verbandsstrafe begleichen (-${formatMoney(executiveUltrasPyroCost)})` },
          goodPct: 100,
          goodTxt: { en: 'Fine settled, ground sanctions averted (-Cost, +5 Morale)', de: 'Strafe bezahlt, Sperre abgewendet (-Kosten, +5 Moral)' },
          icon: 'fa-fire'
        },
        opt2: {
          title: { en: 'Threaten Terrace Closures', de: 'Mit Blocksperre drohen' },
          goodPct: 35,
          goodTxt: { en: 'Pyro halted, board relieved (+1 Rep)', de: 'Pyro gestoppt (+1 Rep)' },
          badPct: 65,
          badTxt: { en: 'Clashes outside VIP reception! (-1 OVR, -25 Morale, -2 Rep)', de: 'Ausschreitungen vor den VIP-Logen! (-1 GES, -25 Moral, -2 Rep)' },
          icon: 'fa-ban'
        },
        extraData: {
          opt1Cost: executiveUltrasPyroCost,
          opt1Good: { morale: 5 },
          opt2Good: { rep: 1 },
          opt2Bad: { ovr: -1, morale: -25, rep: -2 }
        }
      });
    }

    if (currentState.stadiumPolicy === 'ultras') {
      const curvaCrowdfundGain = getLeagueScaledVal(tier, 4000, clubCountry);
      const curvaPyroFineCost = getLeagueScaledVal(tier, 3500, clubCountry);
      const curvaTerraceSafetyCost = getLeagueScaledVal(tier, 3000, clubCountry);
      const curvaLocalBreweryGain = getLeagueScaledVal(tier, 4500, clubCountry);

      extraEvents.push({
        type: 'curva_commercial_deficit',
        title: { en: 'CURVA BUDGET SHORTFALL', de: 'FEHLENDE VIP-EINNAHMEN' },
        desc: {
          en: 'Because our Fortress Curva strategy prioritizes low-cost terrace tickets over lucrative executive suites, the treasury lacks corporate hospitality cash flow ahead of the fiscal audit.',
          de: 'Weil unsere Fankurven-Strategie auf günstige Stehplätze statt lukrative VIP-Logen setzt, fehlen dem Verein wichtige Hospitality-Einnahmen vor der Lizenzprüfung.'
        },
        opt1: {
          title: { en: `Emergency Supporter Crowdfund (+${formatMoney(curvaCrowdfundGain)})`, de: `Fan-Soli-Aktion starten (+${formatMoney(curvaCrowdfundGain)})` },
          goodPct: 100,
          goodTxt: { en: `Supporters rally! Soli shirts cover the deficit (+${formatMoney(curvaCrowdfundGain)}, +10 Morale)`, de: `Fans halten zusammen! Soli-Aktion bringt Cash (+${formatMoney(curvaCrowdfundGain)}, +10 Moral)` },
          icon: 'fa-hand-holding-dollar'
        },
        opt2: {
          title: { en: 'Enact Austerity Budget Cuts', de: 'Sparmaßnahmen einleiten' },
          goodPct: 100,
          goodTxt: { en: 'Travel and analytics budget trimmed (-1 OVR, -5 Morale)', de: 'Reisekosten und Datenanalyse gekürzt (-1 GES, -5 Moral)' },
          icon: 'fa-scissors'
        },
        extraData: {
          opt1Good: { budget: curvaCrowdfundGain, morale: 10 },
          opt2Good: { ovr: -1, morale: -5 }
        }
      });

      extraEvents.push({
        type: 'curva_pyro_fine_crunch',
        title: { en: 'FORTRESS CURVA PYRO FINE', de: 'HOHE PYRO-VERBANDSSTRAFE' },
        desc: {
          en: 'The passionate curva celebrated the derby with an enormous pyrotechnic spectacle. The FA issued a severe fine. Without corporate executive revenue reserves, this fine pinches our budget hard.',
          de: 'Die Fankurve feierte mit einer gigantischen Pyro-Show. Der Verband verhängt eine drastische Geldstrafe. Ohne VIP-Logen-Einnahmen reißt die Strafe ein tiefes Loch in die Kasse.'
        },
        opt1: {
          title: { en: `Pay Disciplinary Fine (-${formatMoney(curvaPyroFineCost)})`, de: `Strafe begleichen (-${formatMoney(curvaPyroFineCost)})` },
          goodPct: 100,
          goodTxt: { en: 'Disciplinary case closed (-Cost, +5 Morale)', de: 'Verfahren eingestellt (-Kosten, +5 Moral)' },
          icon: 'fa-receipt'
        },
        opt2: {
          title: { en: 'Appeal Fine to the Tribunal', de: 'Vor dem Sportgericht anfechten' },
          goodPct: 40,
          goodTxt: { en: `Fine halved on appeal! (-${formatMoney(Math.round(curvaPyroFineCost * 0.5))}, +1 Rep)`, de: `Strafe halbiert! (-${formatMoney(Math.round(curvaPyroFineCost * 0.5))}, +1 Rep)` },
          badPct: 60,
          badTxt: { en: `Appeal dismissed with legal fees! (-${formatMoney(Math.round(curvaPyroFineCost * 1.5))}, -10 Morale)`, de: `Einspruch abgewiesen mit Mahngebühr! (-${formatMoney(Math.round(curvaPyroFineCost * 1.5))}, -10 Moral)` },
          icon: 'fa-scale-unbalanced'
        },
        extraData: {
          opt1Cost: curvaPyroFineCost,
          opt1Good: { morale: 5 },
          opt2Good: { budget: -Math.round(curvaPyroFineCost * 0.5), rep: 1 },
          opt2Bad: { budget: -Math.round(curvaPyroFineCost * 1.5), morale: -10 }
        }
      });

      extraEvents.push({
        type: 'curva_terrace_safety_debt',
        title: { en: 'CURVA TERRACE RECERTIFICATION', de: 'TRIBÜNEN-SICHERHEITSNACHWEIS' },
        desc: {
          en: 'City safety inspectors demand immediate upgrades to the packed standing terrace crush barriers. With no corporate hospitality sponsors to foot the bill, the club must find money quickly.',
          de: 'Die Bauaufsicht verlangt neue Wellenbrecher für die überfüllte Stehplatz-Tribüne. Ohne Großsponsoren aus den VIP-Logen muss der Verein die Kosten selbst stemmen.'
        },
        opt1: {
          title: { en: `Fund Barrier Upgrades (-${formatMoney(curvaTerraceSafetyCost)})`, de: `Wellenbrecher erneuern (-${formatMoney(curvaTerraceSafetyCost)})` },
          goodPct: 100,
          goodTxt: { en: 'Terrace certified & full standing capacity maintained (-Cost, +5 Rep)', de: 'Lizenz gesichert & volle Stehplatz-Kapazität (-Kosten, +5 Rep)' },
          icon: 'fa-wrench'
        },
        opt2: {
          title: { en: 'Delay Work & Reduce Capacity', de: 'Sanierung verschieben & Kapazität kürzen' },
          goodPct: 100,
          goodTxt: { en: `Terrace capacity capped by 2,000 seats (-1 OVR, -${getLeagueScaledFans(tier, 100, clubCountry, tier)} Fans)`, de: `Kapazität um 2.000 gesperrt (-1 GES, -${getLeagueScaledFans(tier, 100, clubCountry, tier)} Fans)` },
          icon: 'fa-triangle-exclamation'
        },
        extraData: {
          opt1Cost: curvaTerraceSafetyCost,
          opt1Good: { rep: 5 },
          opt2Good: { ovr: -1, fans: -getLeagueScaledFans(tier, 100, clubCountry, tier) }
        }
      });

      extraEvents.push({
        type: 'curva_sponsor_corporate_refusal',
        title: { en: 'CORPORATE SPONSORS SHUN CURVA', de: 'SPONSOREN SCHRECKEN VOR DER KURVE ZURÜCK' },
        desc: {
          en: 'A wealthy multinational sponsor backed out of negotiations, calling the stadium environment "too raw and volatile" and citing the lack of executive networking suites. We face an unexpected revenue void.',
          de: 'Ein Großkonzern bricht Verhandlungen ab: Das Stadion sei "zu rau und extrem" und biete keine VIP-Netzwerk-Möglichkeiten. Dem Verein entgeht ein wichtiger Deal.'
        },
        opt1: {
          title: { en: `Sign Local Cult Brewery Deal (+${formatMoney(curvaLocalBreweryGain)})`, de: `Lokale Kultbrauerei als Partner (+${formatMoney(curvaLocalBreweryGain)})` },
          goodPct: 100,
          goodTxt: { en: `Authentic cult partnership! Fans celebrate (+${formatMoney(curvaLocalBreweryGain)}, +15 Morale, +${getLeagueScaledFans(tier, 150, clubCountry, tier)} Fans)`, de: `Echter Kult-Partner! Fans feiern den Deal (+${formatMoney(curvaLocalBreweryGain)}, +15 Moral, +${getLeagueScaledFans(tier, 150, clubCountry, tier)} Fans)` },
          icon: 'fa-beer-mug-empty'
        },
        opt2: {
          title: { en: 'Play Without Main Sponsor', de: 'Ohne Sponsor auf der Brust auflaufen' },
          goodPct: 100,
          goodTxt: { en: 'Iconic retro jersey aesthetic (+2 Rep, but zero sponsor cash)', de: 'Kultiges Retro-Trikot (+2 Ansehen, aber null Einnahmen)' },
          icon: 'fa-shirt'
        },
        extraData: {
          opt1Good: { budget: curvaLocalBreweryGain, morale: 15, fans: getLeagueScaledFans(tier, 150, clubCountry, tier) },
          opt2Good: { rep: 2 }
        }
      });
    }

    const cName = currentState.club.name.toLowerCase().trim();
    const isReserve = isReserveClub(currentState.club.name);
    const isRichmond = cName.includes('richmond');

    const isMagdeburg = !isReserve && (cName.includes('magdeburg') || /^1\.\s*fc\s*magdeburg$/i.test(cName));
    const isMadrid = !isReserve && (cName.includes('madrid fc') || cName.includes('madrid blancos') || cName.includes('real madrid'));
    const isRealMadrid = isMadrid;
    const isBarca = !isReserve && (cName.includes('catalonia fc') || cName.includes('catalunya') || cName.includes('fc barcelona') || cName === 'barcelona');
    const isBayern = !isReserve && (cName.includes('fc bavaria') || cName.includes('munich red') || cName.includes('bayern münchen') || cName.includes('bayern munchen'));
    const isBVB = !isReserve && (cName.includes('borussia west') || cName.includes('westphalia yellow') || cName.includes('borussia dortmund') || cName === 'dortmund');
    const isLeverkusen = !isReserve && (cName.includes('bayer leverkusen') || cName.includes('bayer 04 leverkusen') || cName.includes('rhine red-black') || cName.includes('leverkusen'));
    const isArsenal = !isReserve && (cName.includes('north london red') || cName === 'arsenal' || cName === 'arsenal fc');
    const isChelsea = !isReserve && (cName.includes('london blue') || cName.includes('west london') || cName === 'chelsea' || cName === 'chelsea fc');
    const isSpurs = !isReserve && (cName.includes('north east london') || cName.includes('tottenham'));
    const isManCity = !isReserve && (cName.includes('manchester blue') || cName.includes('manchester city') || cName === 'man city');
    const isLiverpool = !isReserve && (cName.includes('merseyside red') || cName === 'liverpool' || cName === 'liverpool fc');
    const isJuve = !isReserve && (cName.includes('piemonte calcio') || cName.includes('juventus') || cName.includes('turin black-white'));
    const isJuventus = isJuve;
    const isNapoli = !isReserve && (cName.includes('campania blue') || cName.includes('naples blue') || cName.includes('napoli'));
    const isPSG = !isReserve && (cName.includes('paris fc') || cName.includes('paris blue') || cName.includes('paris saint-germain') || cName === 'psg');
    const isMiami = !isReserve && (cName.includes('florida pink') || cName.includes('inter miami') || cName === 'miami fc');
    const isBoca = !isReserve && (cName.includes('buenos aires blue-gold') || cName.includes('boca juniors'));
    const isRiver = !isReserve && (cName.includes('buenos aires red-white') || cName.includes('river plate'));
    const isManUtd = !isReserve && (cName.includes('manchester red') || cName.includes('manchester united') || cName === 'man utd');

    const isTopClub = isRealMadrid || isBarca || isBayern || isManUtd || isManCity || isLiverpool || isArsenal || isChelsea || isPSG || isJuventus || isBVB;

    const isItaly = (currentState.club.country || 'GER') === 'ITA';
    const isFrance = (currentState.club.country || 'GER') === 'FRA';
    const isGermany = (currentState.club.country || 'GER') === 'GER';
    const isSpain = (currentState.club.country || 'GER') === 'ESP';

    
    const isLeipzig = !isReserve && (cName.includes('leipzig rasen') || cName.includes('leipzig red') || cName.includes('rb leipzig') || cName.includes('rasenballsport leipzig'));
    if (isLeipzig && Math.random() < 0.10) {
      const rbEvent = events.find((e) => e.type === 'red_bull_collapse');
      if (rbEvent) {
        return rbEvent;
      }
    }

    const allEvents = [...events, ...extraEvents];
    const filteredEvents = allEvents.filter((ev) => {
      if (ev.type === 'red_bull_collapse') return false;
      // Squad size check: transfer_bid only triggers if squadSize > 18
      if (ev.type === 'transfer_bid' && (currentState.club.squadSize || 24) <= 18) return false;
      // Ecuador specific filtering
      if (ev.type.startsWith('ecuador_') && !isEcuador) return false;

      // 0. Torgranate only in Germany tiers 4 and 5
      if (ev.type === 'fankultur_torgranate' && (!isGermany || tier < 4)) return false;

      // 1. Prevent "adopt tiki-taka" if tiki-taka is already active
      if (ev.type === 'philosophy_demand_tikitaka' && currentState.tactic === 'Tiki-Taka') return false;
      if (ev.type === 'philosophy_demand_attack' && currentState.tactic === 'Total Football') return false;
      if (ev.type === 'philosophy_demand_defense' && (currentState.tactic === 'Defensive' || currentState.tactic === 'Catenaccio')) return false;

      // 2. Only include Richmond events for AFC Richmond
      if (ev.type.startsWith('afc_richmond_') && !isRichmond) return false;

      // 3. Top Club specific filtering
      if (ev.type.startsWith('top_club_real_madrid_') && !isRealMadrid) return false;
      if (ev.type.startsWith('top_club_barca_') && !isBarca) return false;
      if (ev.type.startsWith('top_club_bayern_') && !isBayern) return false;
      if (ev.type.startsWith('top_club_manutd_') && !isManUtd) return false;
      if (ev.type.startsWith('top_club_mancity_') && !isManCity) return false;
      if (ev.type.startsWith('top_club_liverpool_') && !isLiverpool) return false;
      if (ev.type.startsWith('top_club_arsenal_') && !isArsenal) return false;
      if (ev.type.startsWith('top_club_chelsea_') && !isChelsea) return false;
      if (ev.type.startsWith('top_club_psg_') && !isPSG) return false;
      if (ev.type.startsWith('top_club_juventus_') && !isJuventus) return false;
      if (ev.type.startsWith('top_club_bvb_') && !isBVB) return false;

            // 3. Prevent Boycott if team is performing well or if in USA (USA fans don't boycott)
      if (ev.type === 'ticket_boycott_crisis') {
        if (isUsa) return false;
        // Check if last season pos was top half
        const lastPos = currentState.history && currentState.history.length > 0 
          ? currentState.history[currentState.history.length - 1].pos 
          : 10;
        if (lastPos <= 10) return false; // Only boycott if team is in the bottom half (pos > 10)
      }
      // Exclude European Ultras / Hooliganism events for Ecuador and USA
      if ((isEcuador || isUsa) && (ev.type === 'ultras_seat_destruction' || ev.type === 'fan_pyro' || ev.type === 'tennis_ball_protest' || ev.type.startsWith('ita_ultras_'))) return false;

      // 4. Country specific events
      
      if (ev.type.startsWith('ita_ultras_') && !isItaly) return false;
      if (ev.type.startsWith('fra_event_') && !isFrance) return false;
      if (ev.type.startsWith('ger_event_') && !isGermany) return false;
      if (ev.type.startsWith('esp_event_') && !isSpain) return false;
      if (ev.type.startsWith('ecu_event_') && !isEcuador) return false;
      if (ev.type.startsWith('usa_event_') && !isUsa) return false;
      if (ev.type.startsWith('usa_') && !isUsa) return false;
      
      if (ev.type.startsWith('club_magdeburg_') && !isMagdeburg) return false;
      
      if (ev.type === 'ger_event_fankultur_torgranate' && (tier < 4 || !isGermany)) return false;

      // Add the new Club-specific filters:
      if (ev.type.startsWith('magdeburg_') && !isMagdeburg) return false;
      if (ev.type.startsWith('madrid_') && !isMadrid) return false;
      if (ev.type.startsWith('atletico_') && !(cName.includes('madrid rojiblanco') || cName.includes('atlético') || cName.includes('atletico madrid'))) return false;
      if (ev.type.startsWith('barca_') && !isBarca) return false;
      if (ev.type.startsWith('bayern_') && !isBayern) return false;
      if (ev.type.startsWith('bvb_') && !isBVB) return false;
      if (ev.type.startsWith('leverkusen_') && !isLeverkusen) return false;
      if (ev.type.startsWith('arsenal_') && !isArsenal) return false;
      if (ev.type.startsWith('chelsea_') && !isChelsea) return false;
      if (ev.type.startsWith('spurs_') && !isSpurs) return false;
      if (ev.type.startsWith('mancity_') && !isManCity) return false;
      if (ev.type.startsWith('juve_') && !isJuve) return false;
      if (ev.type.startsWith('napoli_') && !isNapoli) return false;
      if (ev.type.startsWith('psg_') && !isPSG) return false;
      if (ev.type.startsWith('usa_miami_') && !isMiami) return false;
      if (ev.type.startsWith('arg_boca_') && !isBoca) return false;
      if (ev.type.startsWith('arg_river_') && !isRiver) return false;

      // Saudi takeover is handled manually with a 0.01% chance
      if (ev.type === 'generic_saudi_takeover') return false; 


      return true;
    });

    
    let chosen: GameEvent | null = null;
    
    // 1% chance for Saudi Takeover (Only for League 1 or 2 clubs)
    if (Math.random() < 0.01 && currentState.club.tier <= 2) {
      const saudiEvent = events.find(e => e.type === 'generic_saudi_takeover');
      if (saudiEvent) {
        return saudiEvent;
      }
    }

    const isCommercialPolicy = currentState.stadiumPolicy === 'commercial';
    const isUltrasPolicy = currentState.stadiumPolicy === 'ultras';

    // Ultras event classifier: includes dedicated commercial-vs-ultras protests, pyro, terrace boycotts, seat damage, ticket protests
    const isUltrasEvent = (ev: GameEvent): boolean => {
      const t = ev.type.toLowerCase();
      return (
        t.startsWith('commercial_ultras_') ||
        t.startsWith('ita_ultras_') ||
        t === 'fan_pyro' ||
        t === 'ultras_seat_destruction' ||
        t === 'fan_ticket_protest' ||
        t === 'ticket_protest' ||
        t === 'ticket_boycott_crisis' ||
        t === 'event_fan_banner_protest' ||
        t === 'ger_event_tennisball_protest' ||
        t === 'fra_event_ultras_pyro_show' ||
        t.includes('ultras') ||
        t.includes('curva') ||
        t.includes('pyro') ||
        t.includes('boycott')
      );
    };

    // Money issue event classifier: includes curva commercial deficits, pyro fines, terrace debts, tax audits, FFP, bankruptcies, sponsor pullouts
    const isMoneyIssueEvent = (ev: GameEvent): boolean => {
      const t = ev.type.toLowerCase();
      return (
        t.startsWith('curva_') ||
        t === 'tax_audit' ||
        t === 'ffp_warning' ||
        t === 'sponsor_bankruptcy' ||
        t === 'sponsor_pullout' ||
        t === 'energy_crisis' ||
        t === 'rival_bankruptcy' ||
        t === 'fra_event_dncg_audit' ||
        t === 'esp_event_la_liga_fair_play' ||
        t === 'funny_sponsor_bankrupt_22' ||
        t.includes('audit') ||
        t.includes('bankrupt') ||
        t.includes('deficit') ||
        t.includes('shortfall') ||
        t.includes('liquidity')
      );
    };

    // Stadium Policy Event Balancing:
    // 1. Executive Hospitality ('commercial'): deals with much more ultras events (60% weight towards ultras protests/boycotts).
    // 2. Fortress Curva ('ultras'): lacks corporate hospitality cash, so it deals with much more money issue events (60% weight towards financial shortfalls/fines).
    // 3. Balanced Tradition & Grassroots/Family: normal event distribution, same as family (unweighted standard pool).
    if (isCommercialPolicy && Math.random() < 0.60) {
      const ultrasPool = filteredEvents.filter(isUltrasEvent);
      if (ultrasPool.length > 0) {
        return ultrasPool[Math.floor(Math.random() * ultrasPool.length)];
      }
    } else if (isUltrasPolicy && Math.random() < 0.60) {
      const moneyPool = filteredEvents.filter(isMoneyIssueEvent);
      if (moneyPool.length > 0) {
        return moneyPool[Math.floor(Math.random() * moneyPool.length)];
      }
    }

    if (isRichmond && Math.random() < 0.55) {
      const richmondEvents = filteredEvents.filter((e) => e.type.startsWith('afc_richmond_'));
      if (richmondEvents.length > 0) {
        chosen = richmondEvents[Math.floor(Math.random() * richmondEvents.length)];
      } else {
        chosen = filteredEvents[Math.floor(Math.random() * filteredEvents.length)] || events[0];
      }
    } else if (isTopClub && Math.random() < 0.15) {
      const topClubEvents = filteredEvents.filter((e) => e.type.startsWith('top_club_'));
      if (topClubEvents.length > 0) {
        chosen = topClubEvents[Math.floor(Math.random() * topClubEvents.length)];
      } else {
        chosen = filteredEvents[Math.floor(Math.random() * filteredEvents.length)] || events[0];
      }
    } else {
      chosen = filteredEvents[Math.floor(Math.random() * filteredEvents.length)] || events[0];
    }

    return chosen;
};
export const resolveDynamicEvent = (
  state: GameState,
  event: GameEvent,
  choiceIndex: number,
  tier: number
): { updated: GameState; toastMsg: string; toastType: 'success' | 'error' | 'warning' | 'info'; costAttempt: number } | null => {

  const updated = { ...state, club: { ...state.club } };
  
  const opt = choiceIndex === 0 ? event.opt1 : event.opt2;
  if (!opt) return null;

  const extraData = (event as any).extraData || {};
  const costAttempt = choiceIndex === 0 ? (extraData.opt1Cost || 0) : (extraData.opt2Cost || 0);

  // ALWAYS deduct the attempt cost upfront!
  if (costAttempt > 0) {
    updated.budget -= costAttempt;
  }

  // Determine success/failure based on badPct (if badPct exists, roll 1-100)
  const isSuccess = !opt.badPct || (Math.random() * 100 > opt.badPct);
  
  const effects = choiceIndex === 0
    ? (isSuccess ? extraData.opt1Good : extraData.opt1Bad)
    : (isSuccess ? extraData.opt2Good : extraData.opt2Bad);

  const evType = (event.type || '').toLowerCase();
  const isTakeoverEvent =
    evType === 'dyn_takeover' ||
    evType === 'end_sovereign_wealth' ||
    evType === 'generic_saudi_takeover' ||
    evType === 'ger_event_50_plus_1_investor' ||
    evType === 'usa_celebrity_investor' ||
    evType.includes('takeover') ||
    evType.includes('sovereign') ||
    evType.includes('consortium') ||
    evType.includes('billionaire');

  if (effects) {
    if (effects.ovr) {
      updated.club.baseOvr = Math.max(10, Math.min(100, updated.club.baseOvr + effects.ovr));
      // PATCH: Ensure the manager's cap expands to accommodate the new OVR
      updated.maxOvrCap = Math.max(updated.maxOvrCap || 0, updated.club.baseOvr);
    }
    if (effects.rep) updated.reputation = Math.max(1, Math.min(100, updated.reputation + effects.rep));
    if (effects.fans) updated.club.fanBase = Math.max(100, (updated.club.fanBase || 1000) + effects.fans);
    if (effects.morale) updated.club.morale = Math.max(0, Math.min(100, (updated.club.morale || 100) + effects.morale));
    if (effects.budget !== undefined) {
      if (isTakeoverEvent && effects.budget > 0) {
        // 1. Wipe existing negative debt first before adding the takeover windfall
        const baseTreasury = Math.max(0, updated.budget || 0);
        updated.seasonsInDebt = 0;
        updated.bankLoan = undefined;
        updated.ownership = 'billionaire';
        // 2. Guard against OVR-induced wage explosion (at least 3x new annual wage bill)
        const newAnnualWages = calculateClubFinancials({ ...updated, budget: baseTreasury, isManaged: true }).wages;
        const effectiveWindfall = Math.max(effects.budget, newAnnualWages * 3);
        updated.budget = baseTreasury + effectiveWindfall;
        updated.club.currentBudget = Math.max(0, updated.club.currentBudget ?? 0) + effectiveWindfall;
      } else if (isTakeoverEvent && effects.budget < 0) {
        // Never allow a hostile LBO / failed takeover rumor to drop budget below 0; option 2 (backing board) costs 0
        if (choiceIndex === 1) {
          // Backing current board / Fan Trust block costs 0
        } else {
          updated.budget = Math.max(0, (updated.budget || 0) + effects.budget);
          if (updated.club.currentBudget !== undefined) {
            updated.club.currentBudget = Math.max(0, updated.club.currentBudget + effects.budget);
          }
        }
      } else {
        updated.budget += effects.budget;
        if (updated.club.currentBudget !== undefined) {
          updated.club.currentBudget = updated.budget;
        }
      }
    }


    if (effects.newClub && typeof effects.newClub === 'object') {
      const nc = effects.newClub;
      const liveTier = (state.livingTiers && ((nc.id != null ? state.livingTiers[nc.id] : undefined) ?? (nc.name ? state.livingTiers[nc.name.toLowerCase().trim()] : undefined)));
      const savedFac = state.managedClubFacilities?.[String(nc.id || nc.name)];
      const resolvedTier = (typeof liveTier === 'number' && liveTier >= 1) ? liveTier : (nc.tier || updated.club.tier);
      if (!updated.livingTiers) updated.livingTiers = {};
      if (state.club) {
        if (state.club.id != null) updated.livingTiers[state.club.id] = state.club.tier;
        if (state.club.name) updated.livingTiers[state.club.name.toLowerCase().trim()] = state.club.tier;
      }
      if (nc.id != null) updated.livingTiers[nc.id] = resolvedTier;
      if (nc.name) updated.livingTiers[nc.name.toLowerCase().trim()] = resolvedTier;
      updated.club = {
        ...updated.club,
        ...nc,
        tier: resolvedTier,
        baseOvr: nc.baseOvr || updated.club.baseOvr,
        stadium: Math.max(nc.stadium || 0, savedFac?.stadium || 0),
        academyLevel: Math.max(nc.academyLevel || 1, savedFac?.academyLevel || 1),
        medicalLevel: Math.max(nc.medicalLevel || 1, savedFac?.medicalLevel || 1),
      };
      updated.yearsAtCurrentClub = 0;
      updated.boardGracePeriod = 1;
      if (resolvedTier > 1) {
        updated.euroStatus = null;
      }
    }

    if (effects.cupProgress) {
      if (!updated.cupProgress) updated.cupProgress = {};
      updated.cupProgress[effects.cupProgress.id] = effects.cupProgress.status;
    }




    if (effects.domTrophies || effects.intTrophies) {
      if (!updated.totals) updated.totals = { matches: 0, wins: 0, att: 0, trophies: 0, domTrophies: 0, intTrophies: 0 };
      if (!updated.trophies) updated.trophies = [];
      if (!updated.trophyHistory) updated.trophyHistory = [];
      
      let cupName = getDomesticCupInfo(updated.club.country || 'GER', updated.club.tier).name;
      
      if (effects.intTrophies) {
        updated.totals.intTrophies = (updated.totals.intTrophies || 0) + effects.intTrophies;
        updated.totals.trophies = (updated.totals.trophies || 0) + effects.intTrophies;
        if (updated.euroStatus === 'CL') cupName = getContinentalCupNames(updated.club.country || 'GER').cl;
        else if (updated.euroStatus === 'EL') cupName = getContinentalCupNames(updated.club.country || 'GER').el;
        else if (updated.euroStatus === 'ECL') cupName = getContinentalCupNames(updated.club.country || 'GER').ecl;
      } else if (effects.domTrophies) {
        updated.totals.domTrophies = (updated.totals.domTrophies || 0) + effects.domTrophies;
        updated.totals.trophies = (updated.totals.trophies || 0) + effects.domTrophies;
      }
      
      if (!updated.trophies.includes(cupName)) {
        updated.trophies.push(cupName);
      }
      updated.trophyHistory.unshift({
        year: updated.year,
        clubName: updated.club.name,
        name: cupName,
        logo: updated.club.logo,
        color: updated.club.color,
      });
    }

  }

  const isDe = typeof window !== 'undefined' && window.location.hostname.includes('.de');
  
  const getLocalizedText = (txt: any) => {
    if (!txt) return '';
    if (typeof txt === 'string') return txt;
    return isDe ? txt.de : txt.en;
  };

  updated.pendingForcedEvent = undefined;

  const toastMsg = isSuccess ? getLocalizedText(opt.goodTxt) : getLocalizedText(opt.badTxt);
  const toastType = isSuccess ? 'success' : 'error';

  return { updated, toastMsg: toastMsg || 'Event resolved', toastType, costAttempt };
};