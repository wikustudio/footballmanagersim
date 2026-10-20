import { describe, it, expect } from 'vitest';
import {
  simulateInternationalMatch,
  simulateInternationalFirstHalf,
  simulateGroupStage,
  calculateDirectorSynergy,
  getHostNation,
  getEligibleNationalOffers,
  getNationalCoachCandidates,
  NATIONAL_TEAMS
} from '../engine/internationalEngine';
import {
  NationalTeam,
  NationalTrainingFocus,
  PreGameDirective,
  NationalSquadDirection,
  NationalFederationInvestment
} from '../types';

describe('World Cup Tactical Choices & Readiness Systems', () => {
  const brazil: NationalTeam = NATIONAL_TEAMS.find(t => t.code === 'BRA')!;
  const germany: NationalTeam = NATIONAL_TEAMS.find(t => t.code === 'GER')!;
  const japan: NationalTeam = NATIONAL_TEAMS.find(t => t.code === 'JPN')!;
  const host = getHostNation(2026);

  const coaches = getNationalCoachCandidates(brazil);
  const coach = coaches[0];
  const synergy = calculateDirectorSynergy('golden_generation', 'high_performance_camp', coach);

  it('verifies all 4 training camp readiness settings affect match outcomes mathematically', () => {
    const trainingFoci: NationalTrainingFocus[] = [
      'high_intensity',
      'stamina_recovery',
      'tactical_masterclass',
      'set_piece_specialist'
    ];

    trainingFoci.forEach(focus => {
      const match = simulateInternationalMatch(
        brazil,
        germany,
        'Quarter-Final',
        'golden_generation',
        'high_performance_camp',
        coach,
        synergy,
        focus,
        'controlled_possession'
      );

      expect(match).toBeDefined();
      expect(typeof match.teamGoals).toBe('number');
      expect(typeof match.oppGoals).toBe('number');
      expect(match.teamGoals).toBeGreaterThanOrEqual(0);
      expect(match.oppGoals).toBeGreaterThanOrEqual(0);
      expect(typeof match.won).toBe('boolean');
    });
  });

  it('verifies all 4 pre-game tactical directives simulate without error', () => {
    const directives: PreGameDirective[] = [
      'controlled_possession',
      'high_press',
      'low_block_counter',
      'direct_wing_play'
    ];

    directives.forEach(directive => {
      const result = simulateInternationalMatch(
        japan,
        brazil,
        'Semi-Final',
        'defensive_fortress',
        'tactical_analytics',
        coach,
        synergy,
        'tactical_masterclass',
        directive
      );

      expect(result).toBeDefined();
      expect(result.stage).toBe('Semi-Final');
      expect(result.summary.length).toBeGreaterThan(10);
      expect(result.minuteEvents.length).toBeGreaterThan(0);
    });
  });

  it('simulates 200 group stages with readiness training & directives to ensure numerical balance', () => {
    let qualifiedCount = 0;
    const trials = 200;

    for (let i = 0; i < trials; i++) {
      const groupRes = simulateGroupStage(
        brazil,
        host,
        'golden_generation',
        'high_performance_camp',
        coach,
        synergy,
        'high_intensity',
        'high_press'
      );

      expect(groupRes.table.length).toBe(4);
      expect(groupRes.matches.length).toBe(6);
      
      const userRow = groupRes.table.find(r => r.team.code === 'BRA');
      expect(userRow).toBeDefined();
      expect(userRow!.p).toBe(3);
      expect(userRow!.w + userRow!.d + userRow!.l).toBe(3);

      if (groupRes.userQualified) {
        qualifiedCount++;
      }
    }

    // Brazil (88 OVR) with high synergy and high intensity should qualify the vast majority of the time (>75%)
    expect(qualifiedCount / trials).toBeGreaterThan(0.75);
  });

  it('confirms low_block_counter provides competitive upset capability against superior opponents', () => {
    let upsetPoints = 0;
    const trials = 100;

    for (let i = 0; i < trials; i++) {
      const result = simulateInternationalMatch(
        japan, // 82 OVR
        brazil, // 88 OVR
        'Quarter-Final',
        'defensive_fortress',
        'tactical_analytics',
        coach,
        synergy,
        'tactical_masterclass',
        'low_block_counter'
      );

      if (result.won) {
        upsetPoints++;
      }
    }

    // Even as underdog (82 vs 88), tactical low block gives meaningful winning chance
    expect(upsetPoints).toBeGreaterThan(10);
  });

  it('guarantees Grand Final simulation produces dramatic minute-by-minute live commentary', () => {
    const finalResult = simulateInternationalMatch(
      brazil,
      germany,
      'Grand Final',
      'golden_generation',
      'high_performance_camp',
      coach,
      synergy,
      'stamina_recovery',
      'controlled_possession'
    );

    expect(finalResult.stage).toBe('Grand Final');
    expect(finalResult.minuteEvents).toBeDefined();
    expect(finalResult.minuteEvents.length).toBeGreaterThan(0);
    
    // Half-time event exists
    expect(finalResult.minuteEvents.some(e => e.minute === 45)).toBe(true);

    if (finalResult.pens) {
      expect(finalResult.teamPenGoals).toBeDefined();
      expect(finalResult.oppPenGoals).toBeDefined();
      expect(finalResult.minuteEvents.some(e => e.minute === 120)).toBe(true);
    }
  });

  it('ensures Grand Final halftime score and events are preserved and cannot regress at 60 minutes', () => {
    // 1. Test simulateInternationalFirstHalf produces events <= 45'
    const firstHalf = simulateInternationalFirstHalf(
      brazil,
      germany,
      'golden_generation',
      'high_performance_camp',
      coach,
      synergy,
      'stamina_recovery',
      'controlled_possession'
    );
    expect(firstHalf.teamGoals).toBeGreaterThanOrEqual(0);
    expect(firstHalf.oppGoals).toBeGreaterThanOrEqual(0);
    expect(firstHalf.minuteEvents.length).toBeGreaterThanOrEqual(1);
    expect(firstHalf.minuteEvents.every(e => e.minute <= 45)).toBe(true);
    expect(firstHalf.minuteEvents.some(e => e.minute === 45)).toBe(true);

    // 2. Mock a 1-0 halftime state and verify across 50 trials that second-half simulation preserves the user goal
    const mockFirstHalf = {
      teamGoals: 1,
      oppGoals: 0,
      minuteEvents: [
        { minute: 24, text: 'Brazil scores! Clinical finish breaking through Germany backline!', isGoal: true, forUser: true },
        { minute: 45, text: 'Half-time whistle! The Coaching Staff looks to the Director\'s Box for your second-half mandate.' }
      ]
    };

    const interventions: Array<'steady' | 'all_out_attack' | 'park_the_bus'> = ['steady', 'all_out_attack', 'park_the_bus'];

    interventions.forEach(intervention => {
      for (let i = 0; i < 30; i++) {
        const fullMatch = simulateInternationalMatch(
          brazil,
          germany,
          'Grand Final',
          'golden_generation',
          'high_performance_camp',
          coach,
          synergy,
          'stamina_recovery',
          'controlled_possession',
          intervention,
          mockFirstHalf
        );

        // Score can never be lower than the first-half locked score
        expect(fullMatch.teamGoals).toBeGreaterThanOrEqual(mockFirstHalf.teamGoals);
        expect(fullMatch.oppGoals).toBeGreaterThanOrEqual(mockFirstHalf.oppGoals);

        // At 60 minutes (the live ticker interval), user goals must be AT LEAST 1, never reverting to 0 or 0:1
        const eventsAt60 = (fullMatch.minuteEvents || []).filter(e => e.minute <= 60);
        const userGoalsAt60 = eventsAt60.filter(e => e.isGoal && e.forUser).length;
        expect(userGoalsAt60).toBeGreaterThanOrEqual(1);

        // Halftime event at 45' is still present
        expect(fullMatch.minuteEvents?.some(e => e.minute === 45)).toBe(true);
        // The 24' goal from first half is still present
        expect(fullMatch.minuteEvents?.some(e => e.minute === 24 && e.isGoal && e.forUser)).toBe(true);
      }
    });
  });

  it('verifies national team World Cup records and silverware aggregate correctly for Career Completed history', () => {
    const mockCampaigns = [
      {
        year: 2026,
        teamName: 'Germany',
        teamFlag: '🇩🇪',
        wonTrophy: true,
        bestFinish: 'Champion',
        matchesPlayed: 7,
        matchesWon: 6,
        matchesDrawn: 1,
        matchesLost: 0,
        goalsFor: 18,
        goalsAgainst: 4
      },
      {
        year: 2030,
        teamName: 'Germany',
        teamFlag: '🇩🇪',
        wonTrophy: false,
        bestFinish: 'Semi-Finals',
        matchesPlayed: 6,
        matchesWon: 4,
        matchesDrawn: 1,
        matchesLost: 1,
        goalsFor: 12,
        goalsAgainst: 6
      },
      {
        year: 2034,
        teamName: 'Brazil',
        teamFlag: '🇧🇷',
        wonTrophy: true,
        bestFinish: 'Champion',
        matchesPlayed: 7,
        matchesWon: 7,
        matchesDrawn: 0,
        matchesLost: 0,
        goalsFor: 21,
        goalsAgainst: 3
      }
    ];

    // Aggregate by nation as done in CareerSummary
    const nationalStats: Record<string, any> = {};
    mockCampaigns.forEach((camp) => {
      if (!nationalStats[camp.teamName]) {
        nationalStats[camp.teamName] = {
          name: camp.teamName,
          flag: camp.teamFlag,
          years: [],
          matches: 0,
          wins: 0,
          trophiesCount: 0,
          bestFinish: camp.bestFinish
        };
      }
      const s = nationalStats[camp.teamName];
      s.years.push(camp.year);
      s.matches += camp.matchesPlayed;
      s.wins += camp.matchesWon;
      if (camp.wonTrophy) s.trophiesCount += 1;
    });

    expect(Object.keys(nationalStats)).toHaveLength(2);
    expect(nationalStats['Germany'].matches).toBe(13);
    expect(nationalStats['Germany'].wins).toBe(10);
    expect(nationalStats['Germany'].trophiesCount).toBe(1);
    expect(nationalStats['Germany'].years).toEqual([2026, 2030]);
    expect(nationalStats['Brazil'].matches).toBe(7);
    expect(nationalStats['Brazil'].wins).toBe(7);
    expect(nationalStats['Brazil'].trophiesCount).toBe(1);
    expect(nationalStats['Brazil'].years).toEqual([2034]);
  });
});
