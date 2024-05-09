export interface TimeSeriesResponseRow extends InputsCountRow {
  first_dimension_date_created_date: string;
}

export interface InputsCountRow {
  count: number;
}

export type PostsByTimeResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: [TimeSeriesResponseRow[] | [], [InputsCountRow] | []];
  };
};
