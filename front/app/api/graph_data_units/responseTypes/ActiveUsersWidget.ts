export interface TimeSeriesResponseRow extends ActiveUsersRow {
  first_dimension_date_created_date: string;
}

export interface ActiveUsersRow {
  count_participant_id: number;
}

export interface ActiveUsersResponse {
  data: {
    type: 'report_builder_data_units';
    attributes: [TimeSeriesResponseRow[] | [], [ActiveUsersRow] | []];
  };
}
