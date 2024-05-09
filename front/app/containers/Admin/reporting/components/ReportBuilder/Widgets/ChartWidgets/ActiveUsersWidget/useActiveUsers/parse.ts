import { ActiveUsersResponse } from 'api/graph_data_units/responseTypes/ActiveUsersWidget';

export const parseStats = (data: ActiveUsersResponse['data']['attributes']) => {
  const activeUsersWholePeriod = data[1][0];
  const activeUsersPreviousPeriod = data[3]?.[0];

  const wholePeriodValue = activeUsersWholePeriod?.count_participant_id ?? 0;
  const previousPeriodValue = activeUsersPreviousPeriod?.count_participant_id;

  const previousPeriodDelta = previousPeriodValue
    ? wholePeriodValue - previousPeriodValue
    : undefined;

  return {
    activeUsers: {
      value: wholePeriodValue.toString(),
      previousPeriodDelta,
    },
  };
};
