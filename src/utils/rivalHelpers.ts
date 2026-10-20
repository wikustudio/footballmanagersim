import { Club } from '../types';
import { isCanadianMLSClub, CANADIAN_MLS_CLUB_IDS } from '../data/gameConstants';

export const assignRival = (currentClub: Club, allClubs: Club[]) => {
    const isCurrentCanadianMLS = (currentClub.country === 'USA' || !currentClub.country) && 
        (CANADIAN_MLS_CLUB_IDS.includes(currentClub.id) || 
         CANADIAN_MLS_CLUB_IDS.includes(Number(currentClub.id)) ||
         (currentClub.name && (
             currentClub.name.toLowerCase().includes('toronto') ||
             currentClub.name.toLowerCase().includes('montreal') ||
             currentClub.name.toLowerCase().includes('montréal') ||
             currentClub.name.toLowerCase().includes('vancouver')
         )));
    
    // For Canadian MLS clubs (Toronto, Montreal, Vancouver) in MLS, prioritize fellow Canadian MLS clubs
    let candidates: Club[] = [];
    if (isCurrentCanadianMLS) {
        const canMlsCandidates = allClubs.filter(c => 
            c.id !== currentClub.id && 
            c.country === 'USA' &&
            (CANADIAN_MLS_CLUB_IDS.includes(c.id) || 
             CANADIAN_MLS_CLUB_IDS.includes(Number(c.id)) ||
             (c.name && (
                 c.name.toLowerCase().includes('toronto') ||
                 c.name.toLowerCase().includes('montreal') ||
                 c.name.toLowerCase().includes('montréal') ||
                 c.name.toLowerCase().includes('vancouver')
             )))
        );
        if (canMlsCandidates.length > 0) {
            candidates = canMlsCandidates;
        }
    }

    if (candidates.length === 0) {
        // Candidates in same country and NOT the same club
        candidates = allClubs.filter(c => c.country === currentClub.country && c.id !== currentClub.id);
        
        // Try to find same tier
        const tierCandidates = candidates.filter(c => c.tier === currentClub.tier);
        if (tierCandidates.length > 0) candidates = tierCandidates;

        // Fallback if no clubs in same country (unlikely but possible)
        if (candidates.length === 0) {
            candidates = allClubs.filter(c => c.id !== currentClub.id);
        }
    }

    const rival = candidates[Math.floor(Math.random() * candidates.length)];
    const isCanadianDerby = (isCurrentCanadianMLS && rival && (
        CANADIAN_MLS_CLUB_IDS.includes(rival.id) || 
        CANADIAN_MLS_CLUB_IDS.includes(Number(rival.id)) ||
        (rival.name && (
            rival.name.toLowerCase().includes('toronto') ||
            rival.name.toLowerCase().includes('montreal') ||
            rival.name.toLowerCase().includes('montréal') ||
            rival.name.toLowerCase().includes('vancouver')
        ))
    )) || (currentClub.country === 'CAN' && rival?.country === 'CAN');

    const descriptionsEn = isCanadianDerby ? [
        `The Canadian Classique (401 Derby) — a fierce national rivalry where pride and supremacy in Canadian soccer are on the line.`,
        `The Voyageurs Rivalry — an electric clash between two Canadian powerhouses competing for domestic bragging rights.`
    ] : [
        `A historic local derby that divides the region. Fans demand nothing less than absolute dominance over them.`,
        `A bitter tactical rivalry that started decades ago. Matches against them are always bloodbaths.`,
        `The 'El Clásico' of your level. Every encounter is fiercely contested on and off the pitch.`
    ];
    const descriptionsDe = isCanadianDerby ? [
        `Das 'Canadian Classique' (401-Derby) — ein erbittertes Nationalduell um die Vorherrschaft im kanadischen Fußball.`,
        `Die Voyageurs-Rivalität — ein hoch emotionales Duell zweier kanadischer Schwergewichte um nationale Vorherrschaft.`
    ] : [
        `Ein historisches Derby, das die Region spaltet. Die Fans fordern absolute Dominanz.`,
        `Eine erbitterte taktische Rivalität, die vor Jahrzehnten begann. Spiele gegen sie sind immer ein Blutbad.`,
        `Das 'El Clásico' eurer Liga. Jedes Aufeinandertreffen ist auf und neben dem Platz hart umkämpft.`
    ];
    const randIdx = Math.floor(Math.random() * descriptionsEn.length);

    return {
        id: rival.id,
        name: rival.name,
        wins: 0,
        draws: 0,
        losses: 0,
        descEn: descriptionsEn[randIdx],
        descDe: descriptionsDe[randIdx]
    };
};
