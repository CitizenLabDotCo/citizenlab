import { ActiveUsersResponse } from 'api/graph_data_units/responseTypes/ActiveUsersWidget';

import { calculateConversionRate } from 'components/admin/GraphCards/_utils/parse';

export const parseStats = (data: ActiveUsersResponse['data']['attributes']) => {
  return {
    activeUsers: calculateActiveUsersStats(data),
    participationRate: calculateParticipationStats(data),
  };
};

const calculateActiveUsersStats = (
  data: ActiveUsersResponse['data']['attributes']
) => {
  const activeUsersWholePeriod = data[1][0];
  const activeUsersPreviousPeriod = data[4]?.[0];

  const activeUsersWholePeriodValue =
    activeUsersWholePeriod?.count_participant_id ?? 0;
  const activeUsersPreviousPeriodValue =
    activeUsersPreviousPeriod?.count_participant_id;

  const activeUsersDelta =
    activeUsersPreviousPeriodValue !== undefined
      ? activeUsersWholePeriodValue - activeUsersPreviousPeriodValue
      : undefined;

  return {
    value: activeUsersWholePeriodValue,
    delta: activeUsersDelta,
  };
};

const calculateParticipationStats = (
  data: ActiveUsersResponse['data']['attributes']
) => {
  const visitorsWholePeriod = data[2][0];
  const visitorsPreviousPeriod = data[5]?.[0];

  const activeVisitorUsersWholePeriod = data[3][0];
  const activeVisitorUsersLastPeriod = data[6]?.[0];

  const participationRateWholePeriod = calculateConversionRate(
    activeVisitorUsersWholePeriod?.count_participant_id ?? 0,
    visitorsWholePeriod?.count_visitor_id ?? 0
  );

  const aactiveVisitorUsersLastPeriodValue =
    activeVisitorUsersLastPeriod?.count_participant_id;

  const visitorsPreviousPeriodValue = visitorsPreviousPeriod?.count_visitor_id;

  const participationRateRateLastPeriod =
    aactiveVisitorUsersLastPeriodValue !== undefined
      ? calculateConversionRate(
          aactiveVisitorUsersLastPeriodValue,
          visitorsPreviousPeriodValue ?? 0
        )
      : undefined;

  const participationRateDelta =
    participationRateRateLastPeriod !== undefined
      ? participationRateWholePeriod - participationRateRateLastPeriod
      : undefined;

  return {
    value: participationRateWholePeriod,
    delta: participationRateDelta,
  };
};
