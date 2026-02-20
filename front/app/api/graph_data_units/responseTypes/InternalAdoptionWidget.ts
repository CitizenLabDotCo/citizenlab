export interface TimeSeriesResponseRow {
  date_group: string;
  active_admins: number;
  active_moderators: number;
}

export interface RoleCounts {
  registered: number;
  active: number;
}

export interface InternalAdoptionResponse {
  data: {
    type: 'report_builder_data_units';
    attributes: {
      admin_counts: RoleCounts;
      moderator_counts: RoleCounts;

      // Timeseries data for the graph
      timeseries: TimeSeriesResponseRow[];

      // Comparison period counts (optional)
      admin_counts_compared?: RoleCounts;
      moderator_counts_compared?: RoleCounts;
    };
  };
}
