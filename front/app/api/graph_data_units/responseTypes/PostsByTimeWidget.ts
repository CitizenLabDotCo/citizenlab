interface InputsCountRow {
  count: number;
}

export interface TimeSeriesResponseRow extends InputsCountRow {
  first_dimension_date_created_date: string;
}

export type PostsByTimeResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: [TimeSeriesResponseRow[] | [], [InputsCountRow] | []];
  };
};
