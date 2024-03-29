import { Keys } from 'utils/cl-react-query/types';

import rScoreKeys from './keys';

export type RScoreKeys = Keys<typeof rScoreKeys>;

export interface IRScore {
  data: RScoreData;
}

export interface RScoreData {
  id: string;
  type: 'rscore';
  attributes: {
    score: number;
    counts: {
      [key: string]: number;
      _blank: number;
    };
  };
  relationships: {
    reference_distribution: {
      data: {
        id: string;
        type: 'reference_distribution';
      };
    };
  };
}
