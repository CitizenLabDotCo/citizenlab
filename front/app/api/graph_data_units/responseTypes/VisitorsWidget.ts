interface BaseRow {
  count: number;
  count_visitor_id: number;
}

interface TotalsRow extends BaseRow {
  avg_duration: string | null;
  avg_pages_visited: string | null;
}

export interface TimeSeriesResponseRow extends BaseRow {
  first_dimension_date_first_action_date: string;
}

export type VisitorsResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: [TimeSeriesResponseRow[] | [], [TotalsRow] | []];
  };
};
