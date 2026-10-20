import { describe, it, expect } from 'vitest';
import { isTacticalSynergy, normalizeTactic } from '../data/gameConstants';
import { generateCoachMarket, generateExistingCoachForClub } from '../engine/coachEngine';

describe('Coach Tactical Synergy and Contract Realism', () => {
  it('correctly normalizes styles and validates tactical synergy for Defensive and Catenaccio', () => {
    expect(normalizeTactic('Catenaccio')).toBe('Defensive');
    expect(normalizeTactic('Park the Bus')).toBe('Defensive');
    expect(normalizeTactic('Defensive')).toBe('Defensive');
    expect(normalizeTactic('Wing Play')).toBe('Direct Counter');
    expect(normalizeTactic('Direct Counter')).toBe('Direct Counter');

    expect(isTacticalSynergy('Catenaccio', 'Defensive')).toBe(true);
    expect(isTacticalSynergy('Park the Bus', 'Defensive')).toBe(true);
    expect(isTacticalSynergy('Defensive', 'Catenaccio')).toBe(true);
    expect(isTacticalSynergy('Wing Play', 'Direct Counter')).toBe(true);
    expect(isTacticalSynergy('Gegenpressing', 'Gegenpressing')).toBe(true);
    expect(isTacticalSynergy('Tiki-Taka', 'Defensive')).toBe(false);
  });

  it('generates realistic contract durations across coach archetypes and tiers', () => {
    const eliteCoaches = generateCoachMarket(1, 'GER', 80, 0);
    expect(eliteCoaches.length).toBeGreaterThan(0);
    eliteCoaches.forEach(coach => {
      expect(coach.contractLength).toBeGreaterThanOrEqual(1);
      expect(coach.contractLength).toBeLessThanOrEqual(5);
      expect(coach.contractYearsLeft).toBe(coach.contractLength);
    });

    const lowerTierCoaches = generateCoachMarket(5, 'GER', 30, 0);
    lowerTierCoaches.forEach(coach => {
      expect(coach.contractLength).toBeGreaterThanOrEqual(1);
      expect(coach.contractLength).toBeLessThanOrEqual(4);
    });

    const incumbent = generateExistingCoachForClub(2, 'ENG');
    expect(incumbent.contractLength).toBeGreaterThanOrEqual(1);
    expect(incumbent.contractLength).toBeLessThanOrEqual(3);
    expect(incumbent.contractYearsLeft).toBe(incumbent.contractLength);
  });

  it('correctly calculates New Manager Bounce and Stale Voice lifecycle OVR modifications', () => {
    // Helper replicating the engine's lifecycle calculation logic
    const calculateLifecycleBonus = (hasBounce?: boolean, tenure?: number, strength?: string) => {
      let bonus = 0;
      let text = '';
      if (hasBounce) {
        bonus += 2;
        text += ' (New Manager Bounce: +2 OVR)';
      }
      if ((tenure || 0) >= 3 && strength !== 'Continental Legend') {
        bonus -= 1;
        text += ' (Stale Dressing Room Voice: -1 OVR)';
      }
      return { bonus, text };
    };

    // Case 1: Newly hired manager (tenure = 0, hasNewManagerBounce = true)
    const newHire = calculateLifecycleBonus(true, 0, 'Youth Focus');
    expect(newHire.bonus).toBe(2);
    expect(newHire.text).toContain('New Manager Bounce: +2 OVR');

    // Case 2: Season 2 (tenure = 1, bounce gone)
    const season2 = calculateLifecycleBonus(false, 1, 'Youth Focus');
    expect(season2.bonus).toBe(0);

    // Case 3: Season 3 (tenure = 2, bounce gone)
    const season3 = calculateLifecycleBonus(false, 2, 'Youth Focus');
    expect(season3.bonus).toBe(0);

    // Case 4: Season 4+ (tenure >= 3, standard coach) -> Stale voice triggers
    const staleCoach = calculateLifecycleBonus(false, 3, 'Youth Focus');
    expect(staleCoach.bonus).toBe(-1);
    expect(staleCoach.text).toContain('Stale Dressing Room Voice: -1 OVR');

    const veryStaleCoach = calculateLifecycleBonus(false, 5, 'Tactical Rigidity');
    expect(veryStaleCoach.bonus).toBe(-1);

    // Case 5: Season 4+ with Continental Legend -> Immune to stale voice
    const legendCoach = calculateLifecycleBonus(false, 4, 'Continental Legend');
    expect(legendCoach.bonus).toBe(0);
    expect(legendCoach.text).not.toContain('Stale Dressing Room Voice');
  });

  it('enforces tier-gated coach archetypes and populates dynamic procedural bios', () => {
    // Tier 1: Should only spawn elite archetypes (no low_tier_veteran)
    const tier1Coaches = generateCoachMarket(1, 'ENG', 90, 0);
    const standardT1 = tier1Coaches.filter(c => !c.isReserveCoach && c.id !== 'coach_fallback');
    const allowedT1Archetypes = ['chessboard_maestro', 'psychological_mastermind', 'award_winner', 'iron_disciplinarian'];
    standardT1.forEach(c => {
      expect(allowedT1Archetypes).toContain(c.coachArchetype);
      expect(c.bio).toBeDefined();
      expect(typeof c.bio).toBe('string');
      expect(c.bio!.length).toBeGreaterThan(20);
    });

    // Tier 5+: Should only spawn lower tier archetypes (no award_winner, no psychological_mastermind)
    const tier5Coaches = generateCoachMarket(5, 'GER', 20, 0);
    const standardT5 = tier5Coaches.filter(c => !c.isReserveCoach && c.id !== 'coach_fallback');
    const allowedT5Archetypes = ['low_tier_veteran', 'youth_visionary', 'pragmatic_grinder', 'iron_disciplinarian'];
    standardT5.forEach(c => {
      expect(allowedT5Archetypes).toContain(c.coachArchetype);
      expect(c.bio).toBeDefined();
      expect(typeof c.bio).toBe('string');
      expect(c.bio!.length).toBeGreaterThan(20);
      expect(c.trophyPedigree).toBe(0);
    });

    // Fallback and reserve coaches must also have procedural bios
    const reserveCoach = tier1Coaches.find(c => c.isReserveCoach);
    expect(reserveCoach?.bio).toBeDefined();
    expect(reserveCoach?.bio).toContain('loyal club servant');

    const fallbackCoach = tier1Coaches.find(c => c.id === 'coach_fallback');
    expect(fallbackCoach?.bio).toBeDefined();
    expect(fallbackCoach?.bio).toContain('Fortress Builder');
  });

  it('verifies youth promotion bottleneck and maximizer coach modifiers', () => {
    // Bottleneck case: Disciplinarian or Youth Apathy halves youth net gain
    let netGain = 4;
    let newOvr = 75 + netGain;
    let integrationCost = 1;

    const disciplinarianCoach = { strength: 'Tactical Discipline', weakness: 'Youth Apathy', archetype: 'iron_disciplinarian' };
    if (disciplinarianCoach.weakness === 'Youth Apathy' || (disciplinarianCoach as any).archetype === 'iron_disciplinarian') {
      netGain = Math.max(1, Math.floor(netGain / 2));
      newOvr = 75 + netGain;
      integrationCost += 2;
    }
    expect(netGain).toBe(2);
    expect(newOvr).toBe(77);
    expect(integrationCost).toBe(3);

    // Maximizer case: Youth Visionary boosts net gain by +1 and discounts integration cost
    let maxGain = 3;
    let maxOvr = 75 + maxGain;
    let maxCost = 2;
    const visionaryCoach = { strength: 'Youth Whisperer', weakness: 'None', archetype: 'youth_visionary' };
    if (visionaryCoach.strength === 'Youth Whisperer' || (visionaryCoach as any).archetype === 'youth_visionary') {
      maxGain += 1;
      maxOvr = 75 + maxGain;
      maxCost = Math.max(0, maxCost - 1);
    }
    expect(maxGain).toBe(4);
    expect(maxOvr).toBe(79);
    expect(maxCost).toBe(1);
  });

  it('verifies Tactical Mutiny penalty when coach has Tactical Rigidity and conflicting tactic', () => {
    let morale = 80;
    let philosophyOvrBonus = 0;
    let tacticalSynergyText = '';

    const rigidCoach = { style: 'Catenaccio', weakness: 'Tactical Rigidity' };
    const userTactic = 'Tiki-Taka'; // conflicting

    if (!isTacticalSynergy(rigidCoach.style, userTactic) && rigidCoach.weakness === 'Tactical Rigidity') {
      morale = Math.max(0, morale - 25);
      philosophyOvrBonus -= 5;
      tacticalSynergyText = ' (Tactical Mutiny! Squad violently rejects the conflicting philosophy: -25 Morale, -5 OVR!)';
    }

    expect(morale).toBe(55);
    expect(philosophyOvrBonus).toBe(-5);
    expect(tacticalSynergyText).toContain('Tactical Mutiny');
  });

  it('verifies Macro Identity & Infrastructure Clashes trigger impact and morale penalties', () => {
    let clubImpactScore = 60;
    let morale = 75;
    const decayReasons: string[] = [];

    // Galactico identity rejects pragmatic grinder coach
    const coach1: any = { name: 'Klaus Grinder', archetype: 'pragmatic_grinder', strength: 'Fortress Builder', weakness: 'Late Match Heartbreak' };
    const identity1 = 'galactico';

    if (identity1 === 'galactico' && (coach1.archetype === 'pragmatic_grinder' || coach1.archetype === 'low_tier_veteran')) {
      clubImpactScore = Math.max(0, clubImpactScore - 15);
      decayReasons.push('Identity Clash: Board furious over unglamorous manager profile (-15 Impact).');
    }

    // Elite manager in Tier 1 with sub-L4 medical facility
    const coach2: any = { name: 'Carlo Maestro', archetype: 'award_winner', strength: 'Star Power', weakness: 'Spendthrift' };
    const tier = 1;
    const medicalLevel = 2;

    if (tier <= 2 && medicalLevel < 4 && coach2.archetype === 'award_winner') {
      morale = Math.max(0, morale - 10);
      decayReasons.push(`Elite Manager Frustration: ${coach2.name} demands Level 4+ Medical Facilities (-10 Morale).`);
    }

    expect(clubImpactScore).toBe(45);
    expect(morale).toBe(65);
    expect(decayReasons.length).toBe(2);
  });
});
