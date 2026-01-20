export interface TimeSeriesResponseRow {
  date_group: string;
  active_admins: number;
  active_moderators: number;
}

export interface InternalAdoptionResponse {
  data: {
    type: 'report_builder_data_units';
    attributes: {
      // Current period counts
      active_admins_count: number;
      active_moderators_count: number;
      total_admin_pm_count: number;

      // Timeseries data for the graph
      timeseries: TimeSeriesResponseRow[];

      // Comparison period counts (optional)
      active_admins_compared?: number;
      active_moderators_compared?: number;
      total_admin_pm_compared?: number;
    };
  };
}
