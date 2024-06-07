export type BaseRow = {
  count: number;
};

export type TimeSeriesResponseRow = BaseRow & {
  first_dimension_date_created_date: string;
};

export type ParticipationResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: [
      TimeSeriesResponseRow[] | [], // posts
      TimeSeriesResponseRow[] | [], // comments
      TimeSeriesResponseRow[] | [], // votes
      [BaseRow] | [] | undefined, // posts
      [BaseRow] | [] | undefined, // comments
      [BaseRow] | [] | undefined // votes
    ];
  };
};
