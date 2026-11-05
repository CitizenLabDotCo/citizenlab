import { Keys } from 'utils/cl-react-query/types';

import userParticipationStatsKeys from './keys';

export type UserParticipationStatsKeys = Keys<
  typeof userParticipationStatsKeys
>;

export type IParameters = {
  id: string;
};

export interface IParticipationStatsAttributes {
  ideas_count: number;
  proposals_count: number;
  survey_responses_count: number;
  comments_count: number;
  reactions_count: number;
  baskets_count: number;
  poll_responses_count: number;
  volunteers_count: number;
  event_attendances_count: number;
}

export interface IParticipationStats {
  data: {
    type: 'participation_stats';
    attributes: IParticipationStatsAttributes;
  };
}
