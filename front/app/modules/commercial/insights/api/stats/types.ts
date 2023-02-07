import statsKeys from './keys';

export type QueryParameters = {
  categories?: string[];
  keywords?: string[];
  search?: string;
  processed?: boolean;
};

export type StatsKeys = ReturnType<typeof statsKeys[keyof typeof statsKeys]>;

export type IInsightsStats = {
  data: {
    count: number;
    type: 'inputs_stat';
  };
};
