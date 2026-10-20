import { Club, TransferSaga, TransferSagaOption } from '../types';
import { getLeagueScaledVal } from '../data/gameConstants';

const FIRST_NAMES = ['Mateo', 'Lucas', 'Julian', 'Marco', 'Stefan', 'Victor', 'Leo', 'Gabriel', 'Alexander', 'Kylian', 'Enzo', 'Florian'];
const LAST_NAMES = ['Silva', 'Moreno', 'Mendoza', 'Kovacic', 'Vargas', 'Santos', 'Bauer', 'Novak', 'Alvarez', 'Diallo', 'Gomez', 'Richter'];
const POSITIONS: ('GK' | 'DEF' | 'MID' | 'FWD')[] = ['FWD', 'MID', 'DEF', 'GK'];

export const generateTransferSaga = (
  club: Club,
  rivalName?: string
): TransferSaga => {
  const fName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const playerName = `${fName} ${lName}`;
  const pos = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
  const playerOvr = Math.min(96, club.baseOvr + Math.floor(Math.random() * 5) + 2);

  const types: TransferSaga['type'][] = ['release_clause', 'rival_bidding_war', 'star_ultimatum'];
  const sagaType = types[Math.floor(Math.random() * types.length)];

  const rival = rivalName || 'Arch-Rivals';

  if (sagaType === 'release_clause') {
    const windfallK = getLeagueScaledVal(club.tier, 38000, club.country || 'GER');
    const retainCostK = Math.round(windfallK * 0.35);

    const options: TransferSagaOption[] = [
      {
        title: 'Accept the Release Clause Windfall',
        desc: `Cash in on the release fee. Massive budget boost, but squad loses ${pos} talisman (-2 OVR).`,
        icon: 'fa-money-bill-wave',
        budgetChange: windfallK,
        ovrChange: -2,
        moraleChange: -5,
        reputationChange: 0
      },
      {
        title: 'Offer Lucrative Loyalty Extension',
        desc: `Counter with a bumper new contract and signing bonus to convince ${playerName} to stay.`,
        icon: 'fa-signature',
        budgetChange: -retainCostK,
        ovrChange: 0,
        moraleChange: 15,
        reputationChange: 10
      },
      {
        title: 'Play Hardball & Stall in the Media',
        desc: 'Take a stand against foreign raids. Player stays for another season, but locker room tension simmers.',
        icon: 'fa-shield-halved',
        budgetChange: 0,
        ovrChange: 0,
        moraleChange: -15,
        reputationChange: 5
      }
    ];

    return {
      id: `saga_${Date.now()}`,
      title: '🚨 Continental Release Clause Triggered',
      type: 'release_clause',
      playerName,
      playerPos: pos,
      playerOvr,
      suitorClub: 'Continental Powerhouse',
      narrative: `A European giant has submitted a formal notice to trigger the release clause for your star ${pos}, ${playerName} (${playerOvr} OVR). The board is leaving the final decision in your hands.`,
      options
    };
  } else if (sagaType === 'rival_bidding_war') {
    const feeK = getLeagueScaledVal(club.tier, 22000, club.country || 'GER');

    const options: TransferSagaOption[] = [
      {
        title: `Smash Club Record to Hijack Wonderkid`,
        desc: `Pay the premium fee to bring ${playerName} to your club (+3 OVR, fans ecstatic, rival humiliated).`,
        icon: 'fa-bolt',
        budgetChange: -feeK,
        ovrChange: 3,
        moraleChange: 20,
        reputationChange: 15
      },
      {
        title: `Drive Up Price & Walk Away`,
        desc: `Engage in a bidding war to force ${rival} into an unsustainable financial package, then pull out.`,
        icon: 'fa-chess-knight',
        budgetChange: 0,
        ovrChange: 0,
        moraleChange: 10,
        reputationChange: 5
      },
      {
        title: `Pitch Sporting Project & Modest Fee`,
        desc: `Offer guaranteed first-team minutes and a reasonable offer. (60% chance wonderkid chooses your philosophy).`,
        icon: 'fa-handshake',
        budgetChange: -Math.round(feeK * 0.5),
        ovrChange: 2,
        moraleChange: 10,
        reputationChange: 10,
        successRate: 0.60
      }
    ];

    return {
      id: `saga_${Date.now()}`,
      title: `⚔️ Wonderkid Derby Bidding War vs ${rival}`,
      type: 'rival_bidding_war',
      playerName,
      playerPos: pos,
      playerOvr,
      suitorClub: rival,
      narrative: `The hottest young ${pos} prospect in the country, ${playerName} (${playerOvr} OVR), is on the market. Your bitter rival ${rival} is aggressively making bids to secure his signature.`,
      options
    };
  } else {
    // Star Contract Holdout
    const raiseCostK = getLeagueScaledVal(club.tier, 9000, club.country || 'GER');
    const saleIncomeK = getLeagueScaledVal(club.tier, 24000, club.country || 'GER');

    const options: TransferSagaOption[] = [
      {
        title: 'Grant Contract Demands',
        desc: `Authorize a wage increase to restore squad harmony and keep your key leader focused.`,
        icon: 'fa-check-circle',
        budgetChange: -raiseCostK,
        ovrChange: 1,
        moraleChange: 10,
        reputationChange: 0
      },
      {
        title: 'Sell Immediately to the Highest Bidder',
        desc: `Refuse to be held hostage. Cash in immediately and use the funds for infrastructure.`,
        icon: 'fa-arrow-right-from-bracket',
        budgetChange: saleIncomeK,
        ovrChange: -1,
        moraleChange: -10,
        reputationChange: -5
      },
      {
        title: 'Enforce Strict Discipline & Reserve Ban',
        desc: `Send a clear message to agents that player power will not dictate terms at this club.`,
        icon: 'fa-gavel',
        budgetChange: 0,
        ovrChange: -1,
        moraleChange: -5,
        reputationChange: 15
      }
    ];

    return {
      id: `saga_${Date.now()}`,
      title: '⚠️ Contract Holdout & Agent Pressure',
      type: 'star_ultimatum',
      playerName,
      playerPos: pos,
      playerOvr,
      suitorClub: 'Foreign Suitors',
      narrative: `Your vice-captain ${playerName} (${playerOvr} OVR) and his high-profile agent have stalled contract negotiations, demanding an immediate wage hike or a transfer away before opening day.`,
      options
    };
  }
};
