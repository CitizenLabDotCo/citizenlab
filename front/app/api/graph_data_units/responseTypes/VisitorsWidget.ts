interface BaseSessionRow {
  count: number;
  count_monthly_user_hash: number;
}

export interface TimeSeriesResponseRow extends BaseSessionRow {
  first_dimension_date_created_date: string;
}

interface MatomoVisitsRow {
  avg_duration: string | null;
  avg_pages_visited: string | null;
}

export type VisitorsResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: [
      TimeSeriesResponseRow[] | [],
      [BaseSessionRow] | [],
      [MatomoVisitsRow] | [],
      [BaseSessionRow] | [] | undefined,
      [MatomoVisitsRow] | [] | undefined
    ];
  };
};
