export interface TimeSeriesResponseRow {
  date_group: string;
  count: number;
}

export interface InternalAdoptionResponse {
  data: {
    type: 'report_builder_data_units';
    attributes: {
      // Current period counts
      active_admins_count: number;
      active_moderators_count: number;
      total_registered_count: number;

      // Timeseries data for the graph
      active_admins_timeseries: TimeSeriesResponseRow[];
      active_moderators_timeseries: TimeSeriesResponseRow[];

      // Comparison period counts (optional)
      active_admins_compared?: number;
      active_moderators_compared?: number;
      total_registered_compared?: number;
    };
  };
}
