export interface TimeSeriesResponseRow {
  date_group: string;
  participants: number;
}

export interface ParticipantsResponse {
  data: {
    type: 'report_builder_data_units';
    attributes: {
      participants_timeseries: TimeSeriesResponseRow[];
      participants_whole_period: number;
      participation_rate_whole_period: number;
      participants_compared_period?: number;
      participation_rate_compared_period?: number;
    };
  };
}
