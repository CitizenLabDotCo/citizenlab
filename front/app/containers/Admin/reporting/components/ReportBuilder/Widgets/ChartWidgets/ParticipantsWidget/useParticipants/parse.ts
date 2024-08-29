import { ParticipantsResponse } from 'api/graph_data_units/responseTypes/ParticipantsWidget';

import { calculateConversionRate } from 'components/admin/GraphCards/_utils/parse';

export const parseStats = (
  data: ParticipantsResponse['data']['attributes']
) => {
  return {
    participants: calculateParticipantsStats(data),
    participationRate: calculateParticipationStats(data),
  };
};

const calculateParticipantsStats = (
  data: ParticipantsResponse['data']['attributes']
) => {
  const participantsWholePeriod = data[1][0];
  const participantsPreviousPeriod = data[4]?.[0];

  const participantsWholePeriodValue =
    participantsWholePeriod?.count_participant_id ?? 0;
  const participantsPreviousPeriodValue =
    participantsPreviousPeriod?.count_participant_id;

  const participantsDelta =
    participantsPreviousPeriodValue !== undefined
      ? participantsWholePeriodValue - participantsPreviousPeriodValue
      : undefined;

  return {
    value: participantsWholePeriodValue,
    delta: participantsDelta,
  };
};

const calculateParticipationStats = (
  data: ParticipantsResponse['data']['attributes']
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
