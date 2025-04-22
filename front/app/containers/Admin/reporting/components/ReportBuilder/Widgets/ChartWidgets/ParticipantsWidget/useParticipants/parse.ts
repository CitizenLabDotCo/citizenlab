import { ParticipantsResponse } from 'api/graph_data_units/responseTypes/ParticipantsWidget';

import { toPercentage } from '../../utils';

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
  const { participants_whole_period, participants_compared_period } = data;

  const participantsDelta =
    participants_compared_period !== undefined
      ? participants_whole_period - participants_compared_period
      : undefined;

  return {
    value: participants_whole_period,
    delta: participantsDelta,
  };
};

const calculateParticipationStats = (
  data: ParticipantsResponse['data']['attributes']
) => {
  const {
    participation_rate_whole_period,
    participation_rate_compared_period,
  } = data;

  return {
    value: toPercentage(participation_rate_whole_period),
    delta:
      participation_rate_compared_period !== undefined
        ? toPercentage(participation_rate_whole_period) -
          toPercentage(participation_rate_compared_period)
        : undefined,
  };
};
