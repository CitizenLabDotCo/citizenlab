import statsKeys from './keys';
import { Keys } from 'utils/cl-react-query/types';

export type QueryParameters = {
  categories?: string[];
  keywords?: string[];
  search?: string;
  processed?: boolean;
};

export type StatsKeys = Keys<typeof statsKeys>;

export type IInsightsStats = {
  data: {
    count: number;
    type: 'inputs_stat';
  };
};
