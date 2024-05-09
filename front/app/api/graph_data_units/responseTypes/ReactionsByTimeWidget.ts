interface ReactionsCountRow {
  sum_reactions_count: number;
}

export interface TimeSeriesResponseRow {
  first_dimension_date_created_date: string;
  sum_dislikes_count: number;
  sum_likes_count: number;
}

export type ReactionsByTimeResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: [TimeSeriesResponseRow[] | [], [ReactionsCountRow] | []];
  };
};
