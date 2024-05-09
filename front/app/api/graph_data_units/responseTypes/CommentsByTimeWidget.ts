export interface TimeSeriesResponseRow extends CommentsCountRow {
  first_dimension_date_created_date: string;
}

export interface CommentsCountRow {
  count: number;
}

export type CommentsByTimeResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: [TimeSeriesResponseRow[] | [], [CommentsCountRow] | []];
  };
};
