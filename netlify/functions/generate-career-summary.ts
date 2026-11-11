export const handler = async (event: any) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const {
      managerName,
      directorName,
      clubName = 'the club',
      managedClubs = [],
      seasons = 1,
      matches = 38,
      wins = 19,
      winPct = 50,
      trophies = 0,
      clTrophies = 0,
      managerRep = 50,
      morale = 75
    } = JSON.parse(event.body || '{}');

    const resolvedManager =
      (typeof managerName === 'string' && managerName.trim()) ||
      (typeof directorName === 'string' && directorName.trim()) ||
      'The Manager';
    const safeClub = (typeof clubName === 'string' && clubName.trim()) || 'the club';
    const validClubs = Array.isArray(managedClubs) ? managedClubs.filter(Boolean) : [];
    const clubsList = validClubs.length > 0 ? validClubs.slice(0, 3).join(', ') : safeClub;

    let summary = '';
    if (seasons < 5) {
      summary = `After a mere ${seasons} seasons across clubs like ${clubsList}, ${resolvedManager} packed their bags. A short-lived managerial stint that left fans scratching their heads. Their final days at ${safeClub} were marred by a dressing room morale of ${morale}/100, proving they couldn't handle the heat of top-flight football.\n\nWhether they pursue a career in television punditry or simply fade into obscurity, the streets won't remember this ${winPct}% win rate legacy.`;
    } else if (clTrophies >= 3 && winPct > 60) {
      summary = `${resolvedManager} retires as an undisputed legend of the game. Delivering ${trophies} total trophies—including an incredible ${clTrophies} Champions League titles—they built an absolute dynasty. Finishing at ${safeClub} with a ${winPct}% win rate and a peak manager reputation of ${managerRep}/100, their name will be sung in the terraces for decades.\n\nLeaving behind a pristine dressing room atmosphere (Morale: ${morale}/100), the tactical genius steps away at the absolute pinnacle of world football. Pundits and fans alike agree: we may never see a maestro like ${resolvedManager} again.`;
    } else if (trophies >= 10) {
      summary = `A glittering, silverware-laden career comes to an end! ${resolvedManager} steps down after ${seasons} grueling seasons, having collected an impressive ${trophies} pieces of silverware. They depart ${safeClub} leaving behind a rock-solid legacy and a dressing room morale of ${morale}/100.\n\nWhile they had their critics over the years, a ${winPct}% career win rate speaks for itself. ${resolvedManager} leaves the dugout with their head held high and a well-deserved reputation of ${managerRep}/100.`;
    } else if (winPct >= 50) {
      summary = `A highly respectable managerial run concludes. Over ${seasons} seasons and ${matches} matches, ${resolvedManager} secured ${wins} victories (${winPct}% win rate). While they may not have shattered every historical record, their steady hand at ${safeClub} leaves the club in a respectable position.\n\nThey walk away with ${trophies} trophies in the cabinet and a dressing room morale sitting at ${morale}/100. ${resolvedManager} will be remembered as a pragmatic, dependable manager who always put the club first.`;
    } else {
      summary = `It was a bumpy, turbulent ride. ${resolvedManager} closes out a ${seasons}-season career with a somewhat challenging ${winPct}% win rate. Despite the struggles and only ${trophies} trophies to show for it, the rollercoaster journey across clubs like ${clubsList} won't be easily forgotten.\n\nWalking out of the ${safeClub} facilities for the final time, the dressing room morale lingers at ${morale}/100. It wasn't always pretty, but ${resolvedManager} undeniably brought drama to the touchline.`;
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ text: summary })
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message || 'Failed to generate summary' })
    };
  }
};
