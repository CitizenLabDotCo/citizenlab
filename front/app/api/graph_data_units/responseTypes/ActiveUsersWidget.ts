interface ActiveUsersRow {
  count_participant_id: number;
}

interface VisitorsRow {
  count_visitor_id: number;
}

export interface TimeSeriesResponseRow extends ActiveUsersRow {
  first_dimension_date_created_date: string;
}

export interface ActiveUsersResponse {
  data: {
    type: 'report_builder_data_units';
    attributes: [
      TimeSeriesResponseRow[] | [], // time series
      [ActiveUsersRow] | [], // active users whole period
      [VisitorsRow] | [], // visitors whole period
      [ActiveUsersRow] | [], // active users who accepted cookies whole period
      [ActiveUsersRow] | [] | undefined, // active users previous period
      [VisitorsRow] | [] | undefined, // visitors previous period
      [ActiveUsersRow] | [] | undefined // active users who accepted cookies previous period
    ];
  };
}
