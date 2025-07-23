import { Keys } from 'utils/cl-react-query/types';

import participantCountKeys from './keys';

export type ParticipantCountsHash = Record<string, number>;

export type ParticipantCounts = {
  data: {
    type: 'participant_counts';
    attributes: {
      participant_counts: ParticipantCountsHash;
    };
  };
};

export type ParticipantCountsKeys = Keys<typeof participantCountKeys>;
