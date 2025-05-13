export interface TimeSeriesResponseRow {
  visits: number;
  visitors: number;
  date_group: string;
}

export type VisitorsResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: {
      visitors_timeseries: TimeSeriesResponseRow[];
      visits_whole_period: number;
      visitors_whole_period: number;
      avg_seconds_per_session_whole_period: number;
      avg_pages_visited_whole_period: number;

      visits_compared_period?: number;
      visitors_compared_period?: number;
      avg_seconds_per_session_compared_period?: number;
      avg_pages_visited_compared_period?: number;
    };
  };
};
