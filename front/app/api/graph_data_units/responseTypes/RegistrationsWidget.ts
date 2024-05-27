interface RegistrationsCountRow {
  count: number;
}

export interface TimeSeriesResponseRow extends RegistrationsCountRow {
  first_dimension_date_registration_date: string;
}

interface VisitorsCountRow {
  count_visitor_id: number;
}

export type RegistrationsResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: [
      TimeSeriesResponseRow[] | [], // time series
      [RegistrationsCountRow] | [], // registrations whole period
      [VisitorsCountRow] | [], // visitors whole period
      [RegistrationsCountRow] | [], // registrations who accepted cookies whole period
      [RegistrationsCountRow] | [] | undefined, // registrations previous period
      [VisitorsCountRow] | [] | undefined, // visitors previous period
      [RegistrationsCountRow] | [] | undefined // registrations who accepted cookies previous period
    ];
  };
};
