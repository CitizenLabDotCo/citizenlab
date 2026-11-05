import { InternalAdoptionResponse } from 'api/graph_data_units/responseTypes/InternalAdoptionWidget';

import { Stat, Stats } from '../typings';

export const parseStats = (
  attributes: InternalAdoptionResponse['data']['attributes']
): Stats => {
  const {
    admin_counts,
    moderator_counts,
    admin_counts_compared,
    moderator_counts_compared,
  } = attributes;

  const hasComparison = !!admin_counts_compared && !!moderator_counts_compared;

  const totalCounts = {
    active: admin_counts.active + moderator_counts.active,
    registered: admin_counts.registered + moderator_counts.registered,
  };

  const totalCountsCompared = hasComparison
    ? {
        active: admin_counts_compared.active + moderator_counts_compared.active,
        registered:
          admin_counts_compared.registered +
          moderator_counts_compared.registered,
      }
    : undefined;

  return {
    admins: buildStat(admin_counts, admin_counts_compared),
    moderators: buildStat(moderator_counts, moderator_counts_compared),
    total: buildStat(totalCounts, totalCountsCompared),
  };
};

type Counts = { registered: number; active: number };

const buildStat = (counts: Counts, compared?: Counts): Stat => ({
  registered: counts.registered,
  active: counts.active,
  activeDelta: compared ? counts.active - compared.active : undefined,
  registeredDelta: compared
    ? counts.registered - compared.registered
    : undefined,
});
