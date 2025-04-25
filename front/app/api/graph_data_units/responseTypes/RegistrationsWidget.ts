export interface TimeSeriesResponseRow {
  date_group: string;
  registrations: number;
}

export type RegistrationsResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: {
      registrations_timeseries: TimeSeriesResponseRow[];
      registrations_whole_period: number;
      registration_rate_whole_period: number;
      registrations_compared_period?: number;
      registration_rate_compared_period?: number;
    };
  };
};
