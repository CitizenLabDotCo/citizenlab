interface ParticipantsRow {
  count_participant_id: number;
}

interface VisitorsRow {
  count_visitor_id: number;
}

export interface TimeSeriesResponseRow extends ParticipantsRow {
  first_dimension_date_created_date: string;
}

export interface ParticipantsResponse {
  data: {
    type: 'report_builder_data_units';
    attributes: [
      TimeSeriesResponseRow[] | [], // time series
      [ParticipantsRow] | [], // participants whole period
      [VisitorsRow] | [], // visitors whole period
      [ParticipantsRow] | [], // participants who accepted cookies whole period
      [ParticipantsRow] | [] | undefined, // participants previous period
      [VisitorsRow] | [] | undefined, // visitors previous period
      [ParticipantsRow] | [] | undefined // participants who accepted cookies previous period
    ];
  };
}
