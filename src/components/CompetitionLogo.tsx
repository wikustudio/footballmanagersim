import React, { useEffect, useMemo, useState } from 'react';
import {
  CompetitionKind,
  getCompetitionLogoSourcePair,
} from '../utils/competitionLogos';

interface CompetitionLogoProps {
  kind: CompetitionKind;
  competitionId?: string;
  country?: string;
  tier?: number;
  isModActive?: boolean;
  alt?: string;
  className?: string;
  'data-testid'?: string;
}

export const CompetitionLogo: React.FC<CompetitionLogoProps> = ({
  kind,
  competitionId,
  country = 'GER',
  tier = 1,
  isModActive = false,
  alt = 'Competition emblem',
  className = 'w-6 h-6 object-contain shrink-0',
  'data-testid': testId,
}) => {
  const { primary, fallback } = useMemo(
    () =>
      getCompetitionLogoSourcePair({
        kind,
        competitionId,
        country,
        tier,
        isModActive,
      }),
    [kind, competitionId, country, tier, isModActive]
  );

  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    setUseFallback(false);
  }, [primary, fallback]);

  const activeSrc = useFallback ? fallback : primary;
  if (!activeSrc) return null;

  return (
    <img
      src={activeSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      decoding="async"
      loading="eager"
      className={className}
      data-testid={testId}
      onError={() => {
        if (!useFallback && fallback && fallback !== primary) {
          setUseFallback(true);
        }
      }}
    />
  );
};
